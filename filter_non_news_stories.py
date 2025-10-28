#!/usr/bin/env python3
"""
Filter out non-news content from stories.json
Removes meta pages, error pages, failed scrapes, and other non-article content
"""
import json
import re
from pathlib import Path
from datetime import datetime

def should_filter_story(story):
    """
    Determine if a story should be filtered out
    Returns: (should_filter: bool, reasons: list)
    """
    reasons = []
    url = story.get('url', '')
    title = story.get('title', '')

    # Define non-news URL patterns
    non_news_patterns = [
        # Site infrastructure
        (r'/about', 'About page'),
        (r'/our-editorial', 'Editorial policy page'),
        (r'/jobs', 'Jobs page'),
        (r'/corrections', 'Corrections page'),
        (r'/commenting-guidelines', 'Guidelines page'),
        (r'/funders', 'Funders page'),
        (r'/volunteer', 'Volunteer page'),
        (r'/staff', 'Staff page'),
        (r'/contact', 'Contact page'),
        (r'/advertise', 'Advertising page'),

        # Conversion pages
        (r'/donate', 'Donation page'),
        (r'/newsletter', 'Newsletter page'),
        (r'/cart', 'Cart page'),
        (r'/thanks', 'Thank you page'),
        (r'/thank-you', 'Thank you page'),
        (r'/youre-all-set', 'Confirmation page'),
        (r'/stay-connected', 'Subscription page'),
        (r'/almost-finished', 'Subscription page'),
        (r'/so-sorry-to-see-you-go', 'Unsubscribe page'),
        (r'/air-sensor-form', 'Form page'),

        # Error pages
        (r'/404', '404 error page'),
        (r'/403', '403 error page'),
        (r'/page-not-found', '404 error page'),
        (r'/restricted', '403 restricted page'),

        # Meta/utility pages
        (r'/explore-more', 'Navigation page'),
        (r'/was-it-something-we-said', 'Error page'),
    ]

    # Check URL patterns
    for pattern, description in non_news_patterns:
        if re.search(pattern, url, re.IGNORECASE):
            reasons.append(f'Non-news URL: {description}')
            break

    # Check for empty/invalid titles
    if not title or title in ['', '...', 'N/A']:
        reasons.append('Empty or invalid title (scraping failure)')

    # Require at least one strong reason to filter
    # (avoid filtering stories that just happen to lack social_abstract)
    return len(reasons) > 0, reasons

def filter_stories(input_file, output_file, filtered_file):
    """Filter stories and save results"""

    print("Loading stories data...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    stories = data.get('stories', [])
    original_count = len(stories)

    print(f"Original story count: {original_count}")

    # Filter stories
    kept_stories = []
    filtered_stories = []
    filter_stats = {}

    for story in stories:
        should_filter, reasons = should_filter_story(story)

        if should_filter:
            # Track reasons
            for reason in reasons:
                filter_stats[reason] = filter_stats.get(reason, 0) + 1

            # Save filtered story with reasons
            filtered_story = story.copy()
            filtered_story['filter_reasons'] = reasons
            filtered_stories.append(filtered_story)
        else:
            kept_stories.append(story)

    print(f"\nFiltering results:")
    print(f"  Stories kept: {len(kept_stories)}")
    print(f"  Stories filtered: {len(filtered_stories)}")
    print(f"  Filter rate: {len(filtered_stories)/original_count*100:.1f}%")

    print(f"\nFilter reasons breakdown:")
    for reason, count in sorted(filter_stats.items(), key=lambda x: -x[1]):
        print(f"  {reason}: {count}")

    # Regenerate filters from kept stories only
    print("\nRegenerating filters from cleaned data...")
    filters = regenerate_filters(kept_stories)

    print(f"  Umbrellas: {len(filters['umbrellas'])}")
    print(f"  Geographic Areas: {len(filters['geographic_areas'])}")
    print(f"  Neighborhoods: {len(filters['neighborhoods'])}")

    # Save cleaned data
    print(f"\nSaving cleaned data to {output_file}...")
    cleaned_data = {
        'stories': kept_stories,
        'filters': filters
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)

    # Save filtered stories
    print(f"Saving filtered stories to {filtered_file}...")
    with open(filtered_file, 'w', encoding='utf-8') as f:
        json.dump({
            'filtered_count': len(filtered_stories),
            'filter_stats': filter_stats,
            'filtered_stories': filtered_stories
        }, f, ensure_ascii=False, indent=2)

    return len(kept_stories), len(filtered_stories), filter_stats

def regenerate_filters(stories):
    """Regenerate filter options from story data"""
    umbrellas = set()
    geographic_areas = set()
    neighborhoods = set()

    for story in stories:
        # Handle umbrella/category
        if story.get('umbrella') and story['umbrella'].strip():
            umbrella_text = story['umbrella'].strip()
            for separator in [',', ';', '/', '|']:
                if separator in umbrella_text:
                    for item in umbrella_text.split(separator):
                        item = item.strip()
                        if item:
                            umbrellas.add(item)
                    break
            else:
                umbrellas.add(umbrella_text)

        # Handle geographic area
        if story.get('geographic_area') and story['geographic_area'].strip():
            geo_text = story['geographic_area'].strip()
            for separator in [',', ';', '/', '|']:
                if separator in geo_text:
                    for item in geo_text.split(separator):
                        item = item.strip()
                        if item:
                            geographic_areas.add(item)
                    break
            else:
                geographic_areas.add(geo_text)

        # Handle neighborhoods
        if story.get('neighborhoods'):
            neighborhoods_data = story['neighborhoods']

            if isinstance(neighborhoods_data, str):
                neighborhoods_text = neighborhoods_data.strip()
                for separator in [',', ';', '/', '|']:
                    if separator in neighborhoods_text:
                        for neigh in neighborhoods_text.split(separator):
                            neigh = neigh.strip()
                            if neigh:
                                neighborhoods.add(neigh)
                        break
                else:
                    if neighborhoods_text:
                        neighborhoods.add(neighborhoods_text)

            elif isinstance(neighborhoods_data, list):
                for neigh_item in neighborhoods_data:
                    if isinstance(neigh_item, str):
                        neigh_text = neigh_item.strip()
                        for separator in [',', ';', '/', '|']:
                            if separator in neigh_text:
                                for neigh in neigh_text.split(separator):
                                    neigh = neigh.strip()
                                    if neigh:
                                        neighborhoods.add(neigh)
                                break
                        else:
                            if neigh_text:
                                neighborhoods.add(neigh_text)

    return {
        'umbrellas': sorted(list(umbrellas)),
        'geographic_areas': sorted(list(geographic_areas)),
        'neighborhoods': sorted(list(neighborhoods))
    }

def generate_report(kept_count, filtered_count, filter_stats, output_file):
    """Generate a detailed cleaning report"""

    total = kept_count + filtered_count

    report = f"""
{'='*70}
DATA CLEANING REPORT
{'='*70}

Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

SUMMARY
-------
Original story count: {total}
Stories kept: {kept_count} ({kept_count/total*100:.1f}%)
Stories filtered: {filtered_count} ({filtered_count/total*100:.1f}%)

FILTER REASONS BREAKDOWN
-------------------------
"""

    for reason, count in sorted(filter_stats.items(), key=lambda x: -x[1]):
        report += f"{reason}: {count}\n"

    report += f"""
IMPACT ON DATA QUALITY
----------------------
- Removed non-news infrastructure pages (About, Jobs, etc.)
- Removed error pages (404, 403)
- Removed failed page fetches (empty titles)
- Removed conversion/utility pages (Donate, Newsletter, etc.)
- Retained all legitimate news articles with valid content

NEXT STEPS
----------
1. Review filtered_out_stories.json for any false positives
2. Use the cleaned stories.json for production
3. Regenerate Excel exports with clean data

{'='*70}
"""

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)

    print(report)

if __name__ == "__main__":
    input_file = Path("frontend/src/data/stories.json")
    output_file = Path("frontend/src/data/stories.json")  # Will overwrite
    filtered_file = Path("filtered_out_stories.json")
    report_file = Path("data_cleaning_report.txt")

    # Create backup first
    backup_file = Path(f"frontend/src/data/stories.json.before_filtering_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    print(f"Creating backup: {backup_file}")
    import shutil
    shutil.copy(input_file, backup_file)

    # Run filtering
    kept_count, filtered_count, filter_stats = filter_stories(
        input_file,
        output_file,
        filtered_file
    )

    # Generate report
    generate_report(kept_count, filtered_count, filter_stats, report_file)

    print(f"\n[SUCCESS] Data cleaning complete!")
    print(f"  Cleaned data: {output_file}")
    print(f"  Filtered stories: {filtered_file}")
    print(f"  Report: {report_file}")
    print(f"  Backup: {backup_file}")
