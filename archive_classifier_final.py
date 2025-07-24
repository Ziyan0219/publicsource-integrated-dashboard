#!/usr/bin/env python3
"""
archive_classifier_final.py – No-override classification + LLM teaser generation
===============================================================================
• Accepts CSV or Excel (`.csv`, `.xls`, `.xlsx`) for `--stories` (Story URLs).
• Crawls and caches article text; saves 1KB previews for debugging.
• Classifies stories into Neighborhoods, GeographicArea, and Umbrella via dictionary + fuzzy matching.
• Generates a 25-word social-media teaser (`SocialAbstract`) using OpenAI LLM.
• Does NOT merge manual labels—pure algorithmic predictions.
• Outputs `stories_classified_filled.csv` and prints missing-value summary.

Dependencies:
    pip install pandas openpyxl requests beautifulsoup4 rapidfuzz openai

Usage (Windows CMD):
```cmd
python archive_classifier_final.py ^
  --stories "links.xlsx" ^
  --neigh   "Pittsburgh neighborhoods.xlsx" ^
  --muni    "Allegheny County Municipalities.xlsx" ^
  --openai_key YOUR_OPENAI_API_KEY ^
  --out_dir "results_final"
```
"""
from __future__ import annotations
import argparse
import hashlib
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Set

import pandas as pd
import requests
import openai
from bs4 import BeautifulSoup
from difflib import SequenceMatcher

# optional fuzzy
try:
    from rapidfuzz import fuzz
    def fuzz_ratio(a: str, b: str) -> float:
        return fuzz.token_set_ratio(a, b)
except ImportError:
    def fuzz_ratio(a: str, b: str) -> float:
        return SequenceMatcher(None, a.lower(), b.lower()).ratio() * 100

# -------------- utilities --------------
EMPTY = {None, "", "…", "..."}

def is_empty(v) -> bool:
    return v in EMPTY or (isinstance(v, float) and pd.isna(v))

def norm_text(v: Optional[str]) -> Optional[str]:
    if is_empty(v): return None
    s = str(v).strip()
    parts = re.split(r"([\s\-/])", s)
    parts = [p.capitalize() if p.islower() else p for p in parts]
    return re.sub(r"\s*,\s*", ", ", "".join(parts))

def norm_header(c: str) -> str:
    return re.sub(r"[\s_]+", "", c.strip()).title()

# -------------- readers --------------

def read_stories(path: Path) -> pd.DataFrame:
    suf = path.suffix.lower()
    if suf in {".xls", ".xlsx"}:
        df = pd.read_excel(path, engine="openpyxl")
    elif suf == ".csv":
        df = pd.read_csv(path)
    else:
        raise ValueError("--stories must be CSV or Excel")
    df = df.rename(columns={c: norm_header(c) for c in df.columns})
    cols = ["Story","Umbrella","GeographicArea","Neighborhoods","SocialAbstract"]
    for c in cols:
        if c not in df.columns:
            df[c] = None
    return df[cols]


def read_neighborhoods(path: Path) -> tuple[Dict[str, str], Dict[str, str]]:
    raw = pd.read_excel(path, engine="openpyxl")
    e,f,g,h = raw.columns[4:8]
    df = raw[[e,f,g,h]].rename(columns={e:"Neighborhood",f:"Label",g:"Official",h:"Region"})
    alias2off: Dict[str,str] = {}
    neigh2reg: Dict[str,str] = {}
    for _, r in df.iterrows():
        off = norm_text(r["Official"] or r["Neighborhood"] )
        for col in ["Neighborhood","Label","Official"]:
            if not is_empty(r[col]): alias2off[norm_text(r[col])] = off
        neigh2reg[off] = norm_text(r["Region"])
    return alias2off, neigh2reg


def read_municipalities(path: Path) -> Set[str]:
    df = pd.read_excel(path, engine="openpyxl")
    for cand in ["Municipality","Name","Municipalities"]:
        if cand in df.columns:
            base = cand; break
    else:
        raise ValueError("municipalities sheet missing expected column")
    return {norm_text(x) for x in df[base] if not is_empty(x)}

# -------------- fetch & cache --------------

def fetch_text(url: str, cache_dir: Path) -> Optional[str]:
    cache_dir.mkdir(parents=True, exist_ok=True)
    key = hashlib.md5(url.encode()).hexdigest()
    fp = cache_dir / f"{key}.txt"
    if fp.exists(): return fp.read_text("utf-8","ignore")
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        node = soup.select_one("article, .entry-content, .c-entry-content, main") or soup
        text = node.get_text(" ", strip=True)
        fp.write_text(text, "utf-8")
        return text
    except Exception as e:
        print(f"[WARN] fetch {url}: {e}")
        return None

# -------------- matching --------------

def build_alias(alias2off: Dict[str,str]) -> List[tuple[str,str]]:
    return sorted(((a.lower(),o) for a,o in alias2off.items()), key=lambda x:-len(x[0]))


def scan(text: str, alias_list: List[tuple[str,str]], muni_lc: Set[str]) -> tuple[List[str],List[str]]:
    txt = text.lower(); neigh=set(); muni=set()
    for a,off in alias_list:
        if a in txt: neigh.add(off)
    for m in muni_lc:
        if m in txt: muni.add(m)
    if not neigh:
        words = set(re.findall(r"[a-z']{4,}", txt))
        for a,off in alias_list:
            if any(fuzz_ratio(w,a)>=90 for w in words): neigh.add(off); break
    return list(neigh), list(muni)

# -------------- LLM teaser --------------

def generate_teaser(text: str) -> str:
    excerpt = text[:1300]
    prompt = f"""You are a local news social media editor following strict voice guidelines. Create a compelling teaser (under 30 words) from this story excerpt.

VOICE GUIDELINES:
- Use active voice consistently
- Lead with facts, not opinions
- Include quotes when available to show personal perspectives
- Use calls-to-action: explore, examine, investigate, discover
- Ask questions that the story can answer
- Show local community impact when relevant
- No clickbait or sensationalism
- Follow AP Style
- No oxford comma
- Be curious, tenacious, constructive, empathetic, clear, concise, certain, informative and friendly

STORY EXCERPT:
{excerpt}

Create a factual, engaging teaser under 30 words that makes readers want to explore the full story:"""
    resp = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role":"user","content":prompt}],
        max_tokens=80,
        temperature=0.6,
    )
    return resp.choices[0].message.content.strip()
# -------------- pipeline --------------

def pipeline(stories:Path, neigh:Path, muni:Path, out:Path, api_key:str):
    openai.api_key = api_key
    out.mkdir(parents=True, exist_ok=True)
    cache=out/"articles_cache"; dbg=out/"debug_texts"; dbg.mkdir(exist_ok=True)

    df = read_stories(stories)
    df.drop_duplicates("Story", inplace=True, ignore_index=True)

    alias2off, neigh2reg = read_neighborhoods(neigh)
    alias_list = build_alias(alias2off)
    muni_set = read_municipalities(muni)
    muni_lc = {m.lower() for m in muni_set}

    texts=[]
    for idx,url in enumerate(df["Story"]):
        txt = fetch_text(url, cache)
        texts.append(txt)
        if txt: (dbg/f"{idx}.txt").write_text(txt[:1000],"utf-8")
    df["_txt"] = texts

    for idx,row in df.iterrows():
        txt=row["_txt"]
        if not txt: continue
        neigh_l, muni_l = scan(txt, alias_list, muni_lc)
        if not neigh_l and not muni_l and all(not is_empty(row[c]) for c in ["Neighborhoods","GeographicArea","Umbrella"]):
            continue
        if is_empty(row["Neighborhoods"]) and neigh_l:
            df.at[idx,"Neighborhoods"]=", ".join(neigh_l)
        regions=[neigh2reg[n] for n in neigh_l if n in neigh2reg]
        regions=list(dict.fromkeys(regions))
        if is_empty(row["GeographicArea"]) and regions:
            df.at[idx,"GeographicArea"]=", ".join(regions)
        if is_empty(row["Umbrella"]):
            if any(r.lower().endswith("county") for r in regions):
                df.at[idx,"Umbrella"]=next(r for r in regions if r.lower().endswith("county"))
            elif muni_l:
                df.at[idx,"Umbrella"]=muni_l[0]
            else:
                df.at[idx,"Umbrella"]="Pittsburgh, Allegheny County"
        if is_empty(row["SocialAbstract"]):
            df.at[idx,"SocialAbstract"]=generate_teaser(txt)

    for col in ["Umbrella","GeographicArea","Neighborhoods"]:
        df[col]=df[col].apply(norm_text)
    df.drop(columns=["_txt"], inplace=True)

    out_csv=out/"stories_classified_filled.csv"
    df.to_csv(out_csv,index=False)
    print("Missing counts →", df[["Umbrella","GeographicArea","Neighborhoods","SocialAbstract"]].isna().sum().to_dict())
    print(f"✅ Saved to {out_csv}")

# -------------- CLI --------------

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--stories", required=True, type=Path)
    p.add_argument("--neigh", required=True, type=Path)
    p.add_argument("--muni", required=True, type=Path)
    p.add_argument("--openai_key", required=True)
    p.add_argument("--out_dir", required=True, type=Path)
    args=p.parse_args()
    pipeline(args.stories,args.neigh,args.muni,args.out_dir,args.openai_key)

if __name__=="__main__":
    main()
