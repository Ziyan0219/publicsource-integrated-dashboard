#!/usr/bin/env python3
"""
Update stories.json with extracted metadata (title, author, date)
"""
import json
import os
import hashlib
from pathlib import Path

def main():
    # Paths
    cache_dir = Path("results_updated/articles_cache")
    json_file = Path("frontend/src/data/stories.json")
    
    # Load existing stories
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    stories = data['stories']
    updated_count = 0
    
    print(f"Processing {len(stories)} stories...")
    
    for story in stories:
        url = story['url']
        
        # Generate the same cache key as the crawler
        key = hashlib.md5(url.encode()).hexdigest()
        metadata_file = cache_dir / f"{key}_metadata.txt"
        
        if metadata_file.exists():
            try:
                lines = metadata_file.read_text("utf-8", "ignore").strip().split('\n')
                if len(lines) >= 3:
                    title = lines[0].strip() if lines[0].strip() else ""
                    author = lines[1].strip() if lines[1].strip() else ""
                    date = lines[2].strip() if lines[2].strip() else ""
                    
                    # Update story if we have better data
                    updated = False
                    if title and (not story.get('title') or story['title'] == ""):
                        story['title'] = title
                        updated = True
                    
                    if author and (not story.get('author') or story['author'] == ""):
                        story['author'] = author
                        updated = True
                    
                    if date and (not story.get('date') or story['date'] == ""):
                        story['date'] = date
                        updated = True
                    
                    if updated:
                        updated_count += 1
                        print(f"Updated story {story['id']}: {title[:60]}...")
                        
            except Exception as e:
                print(f"Error processing metadata for {url}: {e}")
        else:
            print(f"No metadata found for story {story['id']}: {url}")
    
    # Save updated JSON
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Updated {updated_count} stories with metadata")
    print(f"📄 Saved to {json_file}")

if __name__ == "__main__":
    main()