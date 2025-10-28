#!/usr/bin/env python3
"""
sitemap_importer.py - Bulk import articles from PublicSource sitemaps
=====================================================================
Fetches all article URLs from PublicSource XML sitemaps and processes them
through the existing classification pipeline.

Usage:
    python sitemap_importer.py --batch_size 50 --test_mode
"""

import argparse
import requests
import xml.etree.ElementTree as ET
from pathlib import Path
import pandas as pd
import time
import json
from typing import List, Set
import sys
import os

# Import the classification pipeline
from archive_classifier_final import pipeline

# Sitemap URLs
SITEMAP_INDEX = "https://www.publicsource.org/sitemap-index-1.xml"
SITEMAP_URLS = [
    "https://www.publicsource.org/sitemap-1.xml",
    "https://www.publicsource.org/sitemap-2.xml",
    "https://www.publicsource.org/sitemap-3.xml",
    "https://www.publicsource.org/sitemap-4.xml",
    "https://www.publicsource.org/sitemap-5.xml",
]

def fetch_sitemap_urls(sitemap_url: str) -> List[str]:
    """Fetch all article URLs from a sitemap XML"""
    print(f"Fetching sitemap: {sitemap_url}")

    try:
        response = requests.get(sitemap_url, timeout=30)
        response.raise_for_status()

        # Parse XML
        root = ET.fromstring(response.content)

        # Extract URLs (handle XML namespace)
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = []

        for url_elem in root.findall('.//ns:url', namespace):
            loc_elem = url_elem.find('ns:loc', namespace)
            if loc_elem is not None and loc_elem.text:
                urls.append(loc_elem.text)

        print(f"  Found {len(urls)} URLs")
        return urls

    except Exception as e:
        print(f"  Error fetching sitemap: {e}")
        return []

def load_existing_urls() -> Set[str]:
    """Load URLs of existing stories from the database"""
    stories_path = Path(__file__).parent / "frontend" / "src" / "data" / "stories.json"

    try:
        if stories_path.exists():
            with open(stories_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                stories = data.get('stories', [])
                return {story.get('url', '') for story in stories}
        return set()
    except Exception as e:
        print(f"Error loading existing stories: {e}")
        return set()

def fetch_all_sitemap_urls() -> List[str]:
    """Fetch all article URLs from all sitemaps"""
    all_urls = []

    for sitemap_url in SITEMAP_URLS:
        urls = fetch_sitemap_urls(sitemap_url)
        all_urls.extend(urls)
        time.sleep(1)  # Be polite to the server

    # Remove duplicates while preserving order
    seen = set()
    unique_urls = []
    for url in all_urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)

    return unique_urls

def filter_new_urls(all_urls: List[str], existing_urls: Set[str]) -> List[str]:
    """Filter out URLs that already exist in the database"""
    new_urls = [url for url in all_urls if url not in existing_urls]
    print(f"\nTotal URLs from sitemaps: {len(all_urls)}")
    print(f"Existing URLs in database: {len(existing_urls)}")
    print(f"New URLs to process: {len(new_urls)}")
    return new_urls

def process_batch(urls: List[str], batch_num: int, total_batches: int,
                  neigh_path: Path, muni_path: Path, output_dir: Path, api_key: str = None):
    """Process a batch of URLs through the classification pipeline"""

    print(f"\n{'='*60}")
    print(f"Processing Batch {batch_num}/{total_batches}")
    print(f"URLs in this batch: {len(urls)}")
    print(f"{'='*60}\n")

    # Create temporary CSV for this batch
    temp_csv = output_dir / f"batch_{batch_num}_urls.csv"
    df = pd.DataFrame({'Story': urls})
    df['Umbrella'] = ''
    df['GeographicArea'] = ''
    df['Neighborhoods'] = ''
    df['SocialAbstract'] = ''
    df.to_csv(temp_csv, index=False)

    try:
        # Run the pipeline
        pipeline(temp_csv, neigh_path, muni_path, output_dir, api_key)

        # Clean up temp file
        if temp_csv.exists():
            temp_csv.unlink()

        print(f"[OK] Batch {batch_num} completed successfully")
        return True

    except Exception as e:
        print(f"[ERROR] Error processing batch {batch_num}: {e}")
        return False

def merge_results_to_database(output_dir: Path):
    """Merge processed results into the main stories.json database"""
    from src.routes.excel_upload import load_existing_stories, save_stories, update_filters

    result_file = output_dir / 'stories_classified_filled.csv'

    if not result_file.exists():
        print("No results file found to merge")
        return

    # Load processed data
    df = pd.read_csv(result_file)

    # Load existing stories
    existing_stories = load_existing_stories()
    existing_urls = {story.get('url', '') for story in existing_stories}

    # Convert to frontend format
    new_stories = []
    duplicate_count = 0

    # Helper function to clean nan values
    def clean_value(val):
        if pd.isna(val) or str(val).lower() == 'nan':
            return ''
        return str(val)

    for _, row in df.iterrows():
        story_url = str(row.get('Story', ''))

        # Check for duplicates
        if story_url in existing_urls:
            duplicate_count += 1
            continue

        # Get neighborhoods and clean
        neighborhoods_str = clean_value(row.get('Neighborhoods', ''))
        neighborhoods = [n.strip() for n in neighborhoods_str.split(', ') if n.strip() and n.strip().lower() != 'nan'] if neighborhoods_str else []

        # Convert to frontend format
        story = {
            'id': len(existing_stories) + len(new_stories) + 1,
            'url': story_url,
            'social_abstract': clean_value(row.get('SocialAbstract', '')),
            'umbrella': clean_value(row.get('Umbrella', '')),
            'geographic_area': clean_value(row.get('GeographicArea', '')),
            'neighborhoods': neighborhoods,
            'title': clean_value(row.get('Title', '')),
            'author': clean_value(row.get('Author', '')),
            'date': clean_value(row.get('Date', ''))
        }

        new_stories.append(story)
        existing_urls.add(story_url)

    # Combine and save
    all_stories = existing_stories + new_stories
    filters = update_filters(all_stories)
    save_stories(all_stories, filters)

    print(f"\n{'='*60}")
    print(f"Import Summary:")
    print(f"  New stories added: {len(new_stories)}")
    print(f"  Duplicates skipped: {duplicate_count}")
    print(f"  Total stories in database: {len(all_stories)}")
    print(f"{'='*60}\n")

def main():
    parser = argparse.ArgumentParser(description="Import articles from PublicSource sitemaps")
    parser.add_argument("--batch_size", type=int, default=50, help="Number of URLs to process per batch")
    parser.add_argument("--test_mode", action="store_true", help="Test mode: only process first 10 URLs")
    parser.add_argument("--max_articles", type=int, default=None, help="Maximum number of articles to process")
    parser.add_argument("--neigh", type=Path, default=Path("Pittsburgh neighborhoods.xlsx"), help="Path to neighborhoods file")
    parser.add_argument("--muni", type=Path, default=Path("Allegheny County Municipalities.xlsx"), help="Path to municipalities file")
    parser.add_argument("--out_dir", type=Path, default=Path("sitemap_import_results"), help="Output directory")

    args = parser.parse_args()

    # Get OpenAI API key from environment
    api_key = os.environ.get('OPENAI_API_KEY')

    print("PublicSource Sitemap Importer")
    print("="*60)

    # Fetch all URLs from sitemaps
    print("\n1. Fetching URLs from sitemaps...")
    all_urls = fetch_all_sitemap_urls()

    # Load existing URLs
    print("\n2. Loading existing stories...")
    existing_urls = load_existing_urls()

    # Filter new URLs
    print("\n3. Filtering new URLs...")
    new_urls = filter_new_urls(all_urls, existing_urls)

    if not new_urls:
        print("\n[OK] No new articles to process. Database is up to date!")
        return

    # Apply test mode or max articles limit
    if args.test_mode:
        new_urls = new_urls[:10]
        print(f"\n[!] Test mode: Processing only first 10 URLs")
    elif args.max_articles:
        new_urls = new_urls[:args.max_articles]
        print(f"\n[!] Limited to {args.max_articles} articles")

    # Create output directory
    args.out_dir.mkdir(parents=True, exist_ok=True)

    # Process in batches
    print(f"\n4. Processing {len(new_urls)} URLs in batches of {args.batch_size}...")

    total_batches = (len(new_urls) + args.batch_size - 1) // args.batch_size

    for i in range(0, len(new_urls), args.batch_size):
        batch_urls = new_urls[i:i + args.batch_size]
        batch_num = (i // args.batch_size) + 1

        success = process_batch(
            batch_urls,
            batch_num,
            total_batches,
            args.neigh,
            args.muni,
            args.out_dir,
            api_key
        )

        if not success:
            print(f"\n[!] Batch {batch_num} failed. Continue? (y/n): ", end="")
            response = input().strip().lower()
            if response != 'y':
                print("Import cancelled.")
                return

        # Merge results after each batch
        merge_results_to_database(args.out_dir)

        # Small delay between batches
        if i + args.batch_size < len(new_urls):
            print(f"\nWaiting 5 seconds before next batch...")
            time.sleep(5)

    print("\n[OK] Import completed successfully!")
    print(f"Results saved to: {args.out_dir}")

if __name__ == "__main__":
    main()
