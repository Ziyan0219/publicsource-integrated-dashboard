#!/usr/bin/env python3
"""
archive_classifier_final.py – Enhanced geographic classification with context validation
===============================================================================
• Accepts CSV or Excel (`.csv`, `.xls`, `.xlsx`) for `--stories` (Story URLs).
• Crawls and caches article text; saves 1KB previews for debugging.
• Enhanced geographic classification with Allegheny County coverage and context validation.
• PRESERVES existing social media teasers - NO new OpenAI generation.
• Improved accuracy with confidence scoring and ambiguous place disambiguation.
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
import json
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

import pandas as pd
import requests
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

# -------------- Enhanced Geographic Database --------------

class EnhancedGeographicDatabase:
    def __init__(self, data_file: str = "enhanced_geographic_data.json"):
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
        except FileNotFoundError:
            print(f"Warning: {data_file} not found, falling back to basic neighborhood data")
            self.data = {'pittsburgh_neighborhoods': {}, 'allegheny_county_municipalities': {}, 'context_validation': {'positive_keywords': [], 'negative_keywords': [], 'ambiguous_places': {}}}

        self.pittsburgh_neighborhoods = self.data.get('pittsburgh_neighborhoods', {})
        self.allegheny_municipalities = self.data.get('allegheny_county_municipalities', {})
        self.context_validation = self.data.get('context_validation', {'positive_keywords': [], 'negative_keywords': [], 'ambiguous_places': {}})

        # Build unified alias mapping
        self.alias_to_official = {}
        self.official_to_region = {}

        # Add Pittsburgh neighborhoods
        for neighborhood, info in self.pittsburgh_neighborhoods.items():
            official = info['official_name']
            region = info['region']

            # Add multiple alias variations
            self.alias_to_official[neighborhood.lower()] = official
            self.alias_to_official[official.lower()] = official

            # Add common variations
            if ' ' in official:
                # Handle multi-word names
                parts = official.split()
                for part in parts:
                    if len(part) > 3:  # Avoid short words like "the", "of"
                        self.alias_to_official[part.lower()] = official

            self.official_to_region[official] = region

        # Add Allegheny County municipalities
        for municipality, info in self.allegheny_municipalities.items():
            official = info['official_name']
            sub_region = info['sub_region']
            for alias in info.get('aliases', [municipality]):
                self.alias_to_official[alias.lower()] = official
            self.official_to_region[official] = sub_region

        # Build sorted alias list for scanning
        self.alias_list = sorted(((a, o) for a, o in self.alias_to_official.items()),
                                key=lambda x: -len(x[0]))

    def validate_geographic_context(self, text: str, found_places: List[str]) -> Dict[str, float]:
        """Validate geographic context and return confidence scores"""
        text_lower = text.lower()
        scores = {}

        for place in found_places:
            score = 0.6  # Start with moderate confidence

            # Check for positive geographic context
            positive_keywords = ['pennsylvania', 'pa', 'pittsburgh', 'allegheny county',
                               'near pittsburgh', 'pittsburgh area', 'western pennsylvania',
                               'southwestern pa', 'greater pittsburgh', 'neighborhood',
                               'community', 'local', 'area residents']

            positive_found = any(keyword in text_lower for keyword in positive_keywords)

            # Check for negative geographic context
            negative_keywords = ['tennessee', 'tn', 'university of tennessee', 'knoxville tn',
                               'texas', 'tx', 'california', 'ca', 'new york', 'ny',
                               'florida', 'fl', 'ohio', 'oh', 'university of']

            negative_found = any(keyword in text_lower for keyword in negative_keywords)

            # Handle ambiguous places (like Knoxville)
            if place.lower() == 'knoxville':
                if 'tennessee' in text_lower or 'tn' in text_lower or 'university of' in text_lower:
                    score = 0.0  # Definitely not Pennsylvania location
                elif positive_found or 'pittsburgh' in text_lower:
                    score = 0.9  # Definitely Pennsylvania location
                else:
                    score = 0.5  # Moderate confidence for Pittsburgh Knoxville
            else:
                # Adjust score based on context
                if positive_found:
                    score = min(1.0, score + 0.3)
                if negative_found:
                    score = max(0.0, score - 0.7)

            scores[place] = score

        return scores

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

def extract_article_metadata(url: str, cache_dir: Path) -> tuple[Optional[str], Optional[str], Optional[str]]:
    """Extract article title, author, and publication date from webpage"""
    cache_dir.mkdir(parents=True, exist_ok=True)
    key = hashlib.md5(url.encode()).hexdigest()
    metadata_fp = cache_dir / f"{key}_metadata.txt"
    
    # Check cache first
    if metadata_fp.exists():
        try:
            lines = metadata_fp.read_text("utf-8", "ignore").strip().split('\n')
            if len(lines) >= 3:
                return lines[0] or None, lines[1] or None, lines[2] or None
        except:
            pass
    
    title, author, date = None, None, None
    
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        
        # Extract title with comprehensive selector strategy
        title_selectors = [
            # PublicSource and news site specific selectors
            'h1.entry-title', 'h1.post-title', 'h1.article-title', 'h1.story-title',
            '.entry-header h1', '.article-header h1', '.post-header h1', '.story-header h1',
            '.post-content h1', '.article-content h1', '.story-content h1',
            
            # WordPress and CMS patterns
            'h1[class*="title"]', 'h1[id*="title"]', 'h1[class*="headline"]',
            '.wp-block-post-title', '.entry-title', '.post-title', '.page-title',
            '.article-title', '.story-title', '.news-title', '.headline',
            '.post-headline', '.article-headline', '.story-headline',
            
            # News site specific patterns
            '.headline h1', '.title h1', '.article-head h1', '.story-head h1',
            '[class*="headline"] h1', '[class*="heading"] h1',
            '.news-article h1', '.article-wrapper h1', '.content-wrapper h1',
            '.single-post h1', '.single-article h1',
            
            # Generic semantic and accessibility selectors
            'article h1', 'main h1', '[role="main"] h1', '[role="article"] h1',
            'header h1', '.content h1', '.main-content h1', '.primary-content h1',
            '.site-content h1', '.page-content h1',
            
            # Schema.org and structured data
            '[itemprop="headline"]', '[itemprop="name"]', '[property="headline"]',
            
            # Meta tag fallbacks with priority order
            'meta[property="og:title"]', 'meta[name="twitter:title"]',
            'meta[property="article:title"]', 'meta[name="title"]',
            'meta[property="DC.title"]', 'meta[name="DC.Title"]',
            
            # Last resort - any h1 or title tag
            'h1', 'title'
        ]
        
        for selector in title_selectors:
            try:
                if selector.startswith('meta'):
                    # Handle meta tags
                    title_elem = soup.select_one(selector)
                    if title_elem:
                        title = title_elem.get('content', '').strip()
                        if _is_valid_title(title):
                            break
                else:
                    # Handle regular elements
                    title_elem = soup.select_one(selector)
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        # Clean up common title prefixes/suffixes
                        title = _clean_title(title)
                        if _is_valid_title(title):
                            break
            except Exception as e:
                continue
        
        # Extract author with comprehensive strategy
        author_selectors = [
            # Semantic and structured data
            '[rel="author"]', '[property="author"]', '[itemprop="author"]',
            'meta[name="author"]', 'meta[property="article:author"]',
            
            # Common class patterns
            '.author', '.byline', '.by-author', '.post-author', 
            '.entry-author', '.article-author', '.writer', '.journalist',
            '[class*="author"]', '[class*="byline"]', '[class*="writer"]',
            
            # PublicSource and news site specific
            '.entry-meta .author', '.post-meta .author', '.article-meta .author',
            '.author-name', '.author-link', '.by-line',
            
            # Generic patterns
            '.meta .author', '.info .author', '.details .author'
        ]
        
        for selector in author_selectors:
            try:
                if selector.startswith('meta'):
                    author_elem = soup.select_one(selector)
                    if author_elem:
                        author = author_elem.get('content', '').strip()
                        if author and len(author) > 2 and len(author) < 100:
                            # Clean up common prefixes
                            author = re.sub(r'^(by\s*|author:\s*)', '', author, flags=re.IGNORECASE).strip()
                            if author:
                                break
                else:
                    author_elem = soup.select_one(selector)
                    if author_elem:
                        author = author_elem.get_text(strip=True)
                        if author and len(author) > 2 and len(author) < 100:
                            # Clean up common prefixes and validate
                            author = re.sub(r'^(by\s*|author:\s*)', '', author, flags=re.IGNORECASE).strip()
                            if author and not author.lower() in ['admin', 'administrator', 'staff', 'editor']:
                                break
            except Exception as e:
                continue
        
        # Extract publication date with comprehensive strategy
        date_selectors = [
            # Semantic HTML5 and structured data
            'time[datetime]', 'time[pubdate]', '[datetime]',
            'meta[property="article:published_time"]', 'meta[property="article:modified_time"]',
            'meta[name="publication_date"]', 'meta[name="DC.date"]',
            '[itemprop="datePublished"]', '[itemprop="dateCreated"]',
            
            # Common class patterns
            '.date', '.published', '.publish-date', '.post-date', '.entry-date', 
            '.publication-date', '.article-date', '.story-date', '.news-date',
            '[class*="date"]', '[class*="publish"]', '[class*="time"]',
            
            # PublicSource and WordPress specific  
            '.entry-meta .date', '.post-meta .date', '.article-meta .date',
            '.wp-block-post-date', '.entry-date', '.post-published',
            
            # Generic patterns
            '.meta .date', '.info .date', '.details .date', '.timestamp'
        ]
        
        for selector in date_selectors:
            try:
                date_elem = soup.select_one(selector)
                if date_elem:
                    # Try multiple attributes and text content
                    date = (date_elem.get('datetime') or 
                           date_elem.get('content') or 
                           date_elem.get('title') or 
                           date_elem.get_text(strip=True))
                    
                    if date and len(date) > 4 and len(date) < 50:  # Reasonable date string
                        # Basic date format validation
                        import re
                        if re.search(r'\d{4}|\d{1,2}[\/\-]\d{1,2}|\w{3,9}\s+\d{1,2}', date):
                            break
            except Exception as e:
                continue
        
        # Cache the results
        cache_content = f"{title or ''}\n{author or ''}\n{date or ''}"
        metadata_fp.write_text(cache_content, "utf-8")
        
        return title, author, date
        
    except Exception as e:
        print(f"[WARN] extract metadata {url}: {e}")
        # Cache empty results to avoid repeated failures
        metadata_fp.write_text("\n\n", "utf-8")
        return None, None, None

# -------------- title extraction helpers --------------

def _clean_title(title: str) -> str:
    """Clean up common title prefixes and suffixes"""
    if not title:
        return title
        
    # Remove common prefixes
    title = re.sub(r'^(Breaking:\s*|BREAKING:\s*|News:\s*|Update:\s*)', '', title, flags=re.IGNORECASE).strip()
    
    # Remove common suffixes (site names, separators)
    title = re.sub(r'\s*[-|–]\s*.+$', '', title).strip()
    title = re.sub(r'\s*\|\s*.+$', '', title).strip()
    
    # Remove extra whitespace
    title = re.sub(r'\s+', ' ', title).strip()
    
    return title

def _is_valid_title(title: str) -> bool:
    """Validate if extracted text is a reasonable article title"""
    if not title or not isinstance(title, str):
        return False
        
    # Length checks
    if len(title) < 10 or len(title) > 300:
        return False
    
    # Generic/invalid terms
    invalid_titles = {
        'home', 'news', 'article', 'post', 'page', 'blog', 'index',
        'loading', 'error', '404', 'not found', 'untitled', 'default',
        'welcome', 'main', 'content', 'title', 'headline', 'story'
    }
    
    if title.lower().strip() in invalid_titles:
        return False
    
    # Should contain some actual words (not just punctuation/numbers)
    word_count = len(re.findall(r'[A-Za-z]{3,}', title))
    if word_count < 2:
        return False
    
    # Avoid titles that are mostly non-alphabetic
    alpha_ratio = len(re.findall(r'[A-Za-z]', title)) / len(title)
    if alpha_ratio < 0.3:
        return False
    
    return True

# -------------- Enhanced Matching Algorithm --------------

def enhanced_geographic_scan(text: str, geo_db: EnhancedGeographicDatabase) -> Tuple[List[str], Dict[str, float]]:
    """Enhanced geographic scanning with advanced NLP analysis"""
    # Import and use the advanced classifier
    try:
        from advanced_geographic_classifier import AdvancedGeographicClassifier
        classifier = AdvancedGeographicClassifier()
        return classifier.classify_text(text, min_confidence=0.4)
    except ImportError:
        # Fallback to the old method if advanced classifier not available
        text_lower = text.lower()
        found_places = set()

        # First pass: exact matches
        for alias, official in geo_db.alias_list:
            if alias in text_lower:
                found_places.add(official)

        # Second pass: fuzzy matching for missed places
        if not found_places:
            words = set(re.findall(r"[a-z']{4,}", text_lower))
            for alias, official in geo_db.alias_list:
                if any(fuzz_ratio(word, alias) >= 90 for word in words):
                    found_places.add(official)
                    break  # Only take the first high-confidence fuzzy match

        found_places_list = list(found_places)

        # Validate geographic context
        context_scores = geo_db.validate_geographic_context(text, found_places_list)

        # Filter by minimum confidence threshold
        MIN_CONFIDENCE = 0.4
        high_confidence_places = [place for place, score in context_scores.items()
                                 if score >= MIN_CONFIDENCE]

        return high_confidence_places, context_scores

# -------------- Teaser Generation (DISABLED) --------------
# Teaser generation disabled per user request to preserve existing data and save API usage

# -------------- pipeline --------------

def pipeline(stories:Path, neigh:Path, muni:Path, out:Path, api_key:str=None):
    # OpenAI API key no longer required since teaser generation is disabled
    out.mkdir(parents=True, exist_ok=True)
    cache=out/"articles_cache"; dbg=out/"debug_texts"; dbg.mkdir(exist_ok=True)

    df = read_stories(stories)
    df.drop_duplicates("Story", inplace=True, ignore_index=True)

    # Use enhanced geographic database
    geo_db = EnhancedGeographicDatabase()

    texts=[]
    titles=[]
    authors=[]
    dates=[]
    
    for idx,url in enumerate(df["Story"]):
        print(f"operating on {idx+1} story: {url}")
        txt = fetch_text(url, cache)
        title, author, date = extract_article_metadata(url, cache)
        
        texts.append(txt)
        titles.append(title)
        authors.append(author)
        dates.append(date)
        
        if txt: (dbg/f"{idx}.txt").write_text(txt[:1000],"utf-8")
    
    df["_txt"] = texts
    df["Title"] = titles
    df["Author"] = authors
    df["Date"] = dates

    confidence_scores = []

    for idx,row in df.iterrows():
        txt=row["_txt"]
        if not txt:
            print(f"Skipping story {idx+1} (no content)")
            confidence_scores.append({})
            continue

        # Use enhanced geographic scanning
        found_places, place_confidence = enhanced_geographic_scan(txt, geo_db)
        confidence_scores.append(place_confidence)

        # Update geographic classifications only if empty or low confidence existing data
        if is_empty(row["Neighborhoods"]) and found_places:
            # Filter neighborhoods vs municipalities
            neighborhoods = [p for p in found_places if p in geo_db.pittsburgh_neighborhoods]
            municipalities = [p for p in found_places if p in geo_db.allegheny_municipalities]

            # Put both neighborhoods AND municipalities in the Neighborhoods field
            # Prioritize Pittsburgh neighborhoods, but include municipalities if no neighborhoods found
            if neighborhoods:
                df.at[idx, "Neighborhoods"] = ", ".join(neighborhoods)
            elif municipalities:
                # If no Pittsburgh neighborhoods found, use municipalities as neighborhoods
                df.at[idx, "Neighborhoods"] = ", ".join(municipalities)

            # Set geographic areas based on found places
            regions = []
            for place in found_places:
                if place in geo_db.official_to_region:
                    regions.append(geo_db.official_to_region[place])

            if regions and is_empty(row["GeographicArea"]):
                df.at[idx, "GeographicArea"] = ", ".join(list(dict.fromkeys(regions)))

            # Set umbrella region
            if is_empty(row["Umbrella"]):
                # If we have municipalities but NO neighborhoods, municipality went to Neighborhoods field
                # so Umbrella should be Allegheny County
                if municipalities and not neighborhoods:
                    df.at[idx, "Umbrella"] = "Allegheny County"
                # If we have both or only neighborhoods, look for county in regions
                elif any("county" in r.lower() for r in regions):
                    df.at[idx, "Umbrella"] = next(r for r in regions if "county" in r.lower())
                else:
                    df.at[idx, "Umbrella"] = "Pittsburgh, Allegheny County"

        # PRESERVE existing teaser data - NO new generation
        print(f"Preserving existing teaser for story {idx+1}")

    for col in ["Umbrella","GeographicArea","Neighborhoods"]:
        df[col]=df[col].apply(norm_text)
    df.drop(columns=["_txt"], inplace=True)

    out_csv=out/"stories_classified_filled.csv"
    df.to_csv(out_csv,index=False)

    # Save confidence analysis
    confidence_analysis = out / "confidence_analysis.json"
    with open(confidence_analysis, 'w', encoding='utf-8') as f:
        json.dump({
            'story_confidence_scores': confidence_scores,
            'summary': {
                'total_stories': len(df),
                'stories_with_places': len([s for s in confidence_scores if s]),
                'avg_confidence': sum(sum(scores.values()) for scores in confidence_scores) /
                                max(1, sum(len(scores) for scores in confidence_scores))
            }
        }, f, indent=2)

    print("Missing counts:", df[["Umbrella","GeographicArea","Neighborhoods","SocialAbstract"]].isna().sum().to_dict())
    print(f"Saved to {out_csv}")
    print(f"Confidence analysis saved to {confidence_analysis}")

# -------------- CLI --------------

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--stories", required=True, type=Path)
    p.add_argument("--neigh", required=True, type=Path)
    p.add_argument("--muni", required=True, type=Path)
    p.add_argument("--openai_key", default=os.environ.get("OPENAI_API_KEY"), help="OpenAI API key (not required, teaser generation disabled)")
    p.add_argument("--out_dir", required=True, type=Path)
    args=p.parse_args()

    # OpenAI API key no longer required since teaser generation is disabled
    pipeline(args.stories,args.neigh,args.muni,args.out_dir,args.openai_key)
if __name__=="__main__":
    main()
