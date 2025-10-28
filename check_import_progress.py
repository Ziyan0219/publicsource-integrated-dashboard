#!/usr/bin/env python3
"""
Simple script to check import progress
"""
import json
from pathlib import Path

def main():
    stories_path = Path(__file__).parent / "frontend" / "src" / "data" / "stories.json"

    try:
        with open(stories_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            stories = data.get('stories', [])
            filters = data.get('filters', {})

            print("="*60)
            print("IMPORT PROGRESS SUMMARY")
            print("="*60)
            print(f"Total stories in database: {len(stories)}")
            print(f"Categories (umbrellas): {len(filters.get('umbrellas', []))}")
            print(f"Geographic areas: {len(filters.get('geographic_areas', []))}")
            print(f"Neighborhoods: {len(filters.get('neighborhoods', []))}")
            print("="*60)
            print(f"\nTarget: ~4492 total articles")
            print(f"Started with: 83 articles")
            print(f"To import: ~4409 articles")
            print(f"Current: {len(stories)} articles")
            print(f"Remaining: ~{4492 - len(stories)} articles")
            print(f"Progress: {(len(stories) / 4492 * 100):.1f}%")
            print("="*60)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
