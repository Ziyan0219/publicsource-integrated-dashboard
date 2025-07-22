import argparse
import io
import re
import csv
import time
from pathlib import Path
from typing import List, Dict, Tuple

import requests
import pandas as pd
from newspaper import Article
from slugify import slugify
from rapidfuzz import process as rf_process, fuzz

# -------------------------------
# Configuration
# -------------------------------
HEADERS = {"User-Agent": "PublicSourceClassifier/5.1"}
REQUEST_DELAY = 1.0  # seconds between HTTP requests (adjust as needed)

# Alias mapping for common neighborhood variants (uppercase keys)
ALIASES = {
    "MT. LEBANON": "MOUNT LEBANON",
    "MT LEBANON": "MOUNT LEBANON",
    "SQUIRREL HILL NORTH": "SQUIRREL HILL NORTH",
    "SQUIRREL HILL SOUTH": "SQUIRREL HILL SOUTH",
    "HILLDISTRICT": "HILL DISTRICT",
    "SQUID HILL": "SQUIRREL HILL",
    "SHADY SIDE": "SHADYSIDE",
    # 如果你在 Excel Label/KML 里还发现其他变体，也放进来
}

# Fuzzy match threshold (0-100)
FUZZY_THRESHOLD = 90

# -------------------------------
# Helper functions
# -------------------------------

def normalize_url(u: str) -> str:
    """Normalize URL by stripping trailing slashes and lowercasing."""
    return u.rstrip('/').lower()

def fetch_sheet_as_df(sheet_id: str, gid: int) -> pd.DataFrame:
    """Fetch Google Sheet as CSV and return DataFrame."""
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return pd.read_csv(io.StringIO(resp.text))

def fetch_article_text(url: str) -> Tuple[str, str]:
    """Extract title and cleaned full text via newspaper3k."""
    try:
        art = Article(url)
        art.download()
        art.parse()
        return art.title or "", art.text or ""
    except Exception:
        return "", ""

def load_neighborhoods(path: str) -> Tuple[Dict[str, str], List[str]]:
    """
    从 Excel 读取“Neighborhood/Label/Official city kml name”与对应的 Region。
    E 列: Neighborhood（社区名）
    F 列: Label        （备用别名）
    G 列: Official city kml name （备用别名）
    H 列: Region       （所属大区）
    """
    df = pd.read_excel(path, engine="openpyxl")

    # 假设列索引固定：E=4, F=5, G=6, H=7
    n_col = df.columns[4]
    label_col = df.columns[5]
    kml_col = df.columns[6]
    r_col = df.columns[7]

    mapping: Dict[str, str] = {}
    hood_set: set = set()

    for _, row in df.iterrows():
        # 1) 真实社区名称
        if pd.notna(row[n_col]):
            hood = str(row[n_col]).strip().upper()
            region = str(row[r_col]).strip()
            if hood:
                mapping[hood] = region
                hood_set.add(hood)

        # 2) Label 列（备用别名）
        if pd.notna(row[label_col]):
            lab = str(row[label_col]).strip().upper()
            if lab:
                mapping[lab] = str(row[r_col]).strip()
                hood_set.add(lab)

        # 3) Official city kml name 列（备用别名）
        if pd.notna(row[kml_col]):
            kml = str(row[kml_col]).strip().upper()
            if kml:
                mapping[kml] = str(row[r_col]).strip()
                hood_set.add(kml)

    hood_list = sorted(hood_set)
    return mapping, hood_list

def load_municipalities(path: str) -> Dict[str, str]:
    """Return mapping: municipality name -> subregion (uppercase keys)."""
    df = pd.read_excel(path, engine="openpyxl")
    m_col = next(c for c in df.columns if "municip" in c.lower() or "name" in c.lower())
    sr_col = next((c for c in df.columns if "sub" in c.lower() or "region" in c.lower()), None)
    mapping: Dict[str, str] = {}
    for _, row in df.iterrows():
        if pd.notna(row[m_col]):
            key = str(row[m_col]).strip().upper()
            val = str(row[sr_col]).strip() if sr_col and pd.notna(row[sr_col]) else ""
            if key:
                mapping[key] = val
    return mapping

def load_manual_labels(path: str) -> Dict[str, List[str]]:
    """Load manual (ground truth) neighborhood labels from Excel, normalize URLs."""
    df = pd.read_excel(path, engine="openpyxl")
    manual: Dict[str, List[str]] = {}
    for _, row in df.iterrows():
        url = row.get('Story')
        raw = row.get('Neighborhoods')
        if isinstance(url, str) and isinstance(raw, str) and raw.strip():
            norm = normalize_url(url)
            labels = [h.strip().upper() for h in raw.split(',') if h.strip()]
            # 可能手工列里是“Downtown, North Side”这种，就按逗号分开
            manual[norm] = labels
    return manual

def detect_neighborhoods(combined: str, hood_list: List[str], fuzzy: bool) -> List[str]:
    """Detect neighborhoods via whole-word regex, alias, then fuzzy matching."""
    CU = combined.upper()
    found: set = set()

    # 1. 按 hood_list 里的每个完整社区名做整词匹配
    for hood in hood_list:
        if re.search(rf"\b{re.escape(hood)}\b", CU):
            found.add(hood)

    # 2. 别名匹配
    for alias, real in ALIASES.items():
        if alias in CU and real not in found:
            found.add(real)

    # 如果已经找到，就返回
    if found:
        return sorted(found)

    # 3. 模糊匹配
    candidates = rf_process.extract(
        CU,
        hood_list,
        scorer=fuzz.partial_ratio,
        score_cutoff=FUZZY_THRESHOLD,
        limit=None
    )
    for match, score, _ in candidates:
        found.add(match)

    return sorted(found)

def derive_umbrella(found_keys: List[str], muni_map: Dict[str, str]) -> str:
    """Determine Umbrella: if any key indicates Pittsburgh neighborhood, else if any indicates municipality."""
    # 判断哪个 key 真正属于 Pittsburgh 区域
    # 只要 found_keys 里有某个 key 不在 muni_map，就认定它是“Pittsburgh 社区”
    has_pgh = any(k not in muni_map for k in found_keys)
    munis_found = [k for k in found_keys if k in muni_map]
    if has_pgh and munis_found:
        return "Pittsburgh, Allegheny County"
    if has_pgh:
        return "Pittsburgh"
    if munis_found:
        return "Allegheny County"
    return ""

def derive_region(found_keys: List[str], hood_map: Dict[str, str], muni_map: Dict[str, str]) -> str:
    """Return comma-separated regions/subregions for matched keys."""
    regions: set = set()
    for k in found_keys:
        if k in hood_map and hood_map[k]:
            regions.add(hood_map[k])
        if k in muni_map and muni_map[k]:
            regions.add(muni_map[k])
    return ", ".join(sorted(regions))

# -------------------------------
# Main processing pipeline
# -------------------------------
def run_classification(df: pd.DataFrame, out_dir: Path,
                       hood_map: Dict[str, str], hood_list: List[str],
                       muni_map: Dict[str, str], manual_map: Dict[str, List[str]]):
    out_dir.mkdir(parents=True, exist_ok=True)
    texts_dir = out_dir / "stories_text"
    texts_dir.mkdir(exist_ok=True)

    rows = []
    for _, row in df.iterrows():
        orig_url = row.iloc[0]
        url = normalize_url(str(orig_url))
        if not url.startswith("http"):
            continue
        print(f"→ Processing: {url}")

        if url in manual_map:
            found_keys = manual_map[url]
            title, text = "", ""
        else:
            title, text = fetch_article_text(url)
            if not text and not title:
                print("  ! Failed to extract text")
                continue
            slug = slugify(url)[:50]
            (texts_dir / f"{slug}.txt").write_text(text, encoding="utf-8")
            combined = " ".join([title, text, slug.replace("-", " ")])
            found_keys = detect_neighborhoods(combined, hood_list, fuzzy=True)

        # 最终输出：多值用逗号+空格分隔
        cleaned = [k.strip() for k in found_keys if k and k.strip()]
        neighborhoods_str = ", ".join(k.title() for k in cleaned)
        umbrella = derive_umbrella(found_keys, muni_map)
        region = derive_region(found_keys, hood_map, muni_map)

        source_text = text or title
        teaser = " ".join(source_text.split()[:25]) + "…"

        rows.append([orig_url, umbrella, region, neighborhoods_str, teaser])
        time.sleep(REQUEST_DELAY)

    out_csv = out_dir / "stories_classified.csv"
    with out_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Story", "Umbrella", "GeographicArea", "Neighborhoods", "SocialAbstract"])
        writer.writerows(rows)
    print(f"✅ Saved {len(rows)} records → {out_csv}")

# -------------------------------
# Entrypoint
# -------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Classify PublicSource stories with robust neighborhood matching (v5.1)"
    )
    parser.add_argument("--sheet", help="Google Sheet ID (public)")
    parser.add_argument("--gid", type=int, default=0, help="Sheet gid, default=0")
    parser.add_argument("--sheet_csv", help="Local CSV path (if sheet private)")
    parser.add_argument("--neighborhoods_xlsx", required=True,
                        help="Path to Pittsburgh neighborhoods Excel")
    parser.add_argument("--municipalities_xlsx", required=True,
                        help="Path to Allegheny County Municipalities Excel")
    parser.add_argument("--manual_labels_xlsx", required=True,
                        help="Path to manual labels Excel")
    parser.add_argument("--out_dir", default="results", help="Output directory for results")
    args = parser.parse_args()

    # Load stories
    if args.sheet_csv:
        df = pd.read_csv(args.sheet_csv)
    else:
        df = fetch_sheet_as_df(args.sheet, args.gid)

    # Load lookups
    hood_map, hood_list = load_neighborhoods(args.neighborhoods_xlsx)
    muni_map = load_municipalities(args.municipalities_xlsx)
    manual_map = load_manual_labels(args.manual_labels_xlsx)

    run_classification(df, Path(args.out_dir), hood_map, hood_list, muni_map, manual_map)

if __name__ == "__main__":
    main()
