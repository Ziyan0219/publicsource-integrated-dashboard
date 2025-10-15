#!/usr/bin/env python3
"""
Reprocess existing stories with enhanced geographic algorithm - OPTIMIZED VERSION
"""
import json
import os
from pathlib import Path
from archive_classifier_final import EnhancedGeographicDatabase, fetch_text, is_empty, norm_text
from advanced_geographic_classifier import AdvancedGeographicClassifier

def load_existing_stories():
    """Load existing stories from frontend data file"""
    stories_path = Path("frontend/src/data/stories.json")

    try:
        if stories_path.exists():
            with open(stories_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('stories', []), data.get('filters', {})
        else:
            return [], {}
    except Exception as e:
        print(f"Error loading existing stories: {str(e)}")
        return [], {}

def save_updated_stories(stories, filters):
    """Save updated stories and filters back to frontend data file"""
    stories_path = Path("frontend/src/data/stories.json")
    data = {
        'stories': stories,
        'filters': filters
    }

    # Ensure directory exists
    os.makedirs(stories_path.parent, exist_ok=True)

    with open(stories_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_filters_from_stories(stories):
    """Generate updated filter options from reprocessed stories"""
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
                        if item and item != '':
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
                        if item and item != '':
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
                            if neigh and neigh != '':
                                neighborhoods.add(neigh)
                        break
                else:
                    if neighborhoods_text and neighborhoods_text != '':
                        neighborhoods.add(neighborhoods_text)

            elif isinstance(neighborhoods_data, list):
                for neigh_item in neighborhoods_data:
                    if isinstance(neigh_item, str):
                        neigh_text = neigh_item.strip()
                        for separator in [',', ';', '/', '|']:
                            if separator in neigh_text:
                                for neigh in neigh_text.split(separator):
                                    neigh = neigh.strip()
                                    if neigh and neigh != '':
                                        neighborhoods.add(neigh)
                                break
                        else:
                            if neigh_text and neigh_text != '':
                                neighborhoods.add(neigh_text)

    return {
        'umbrellas': sorted(list(umbrellas)),
        'geographic_areas': sorted(list(geographic_areas)),
        'neighborhoods': sorted(list(neighborhoods))
    }

def log_message(msg, progress_file="reprocessing_progress.txt"):
    """Write message to both console and progress file"""
    print(msg)
    with open(progress_file, 'a', encoding='utf-8') as f:
        f.write(msg + '\n')

def reprocess_stories():
    """Main function to reprocess all existing stories"""
    # Clear progress file
    with open("reprocessing_progress.txt", 'w', encoding='utf-8') as f:
        f.write("=== REPROCESSING STARTED ===\n")

    log_message("Starting story reprocessing with enhanced geographic algorithm...")
    log_message("OPTIMIZED VERSION - Classifier initialized once and reused\n")

    # Load enhanced geographic database
    geo_db = EnhancedGeographicDatabase()
    log_message(f"Loaded geographic database: {len(geo_db.pittsburgh_neighborhoods)} neighborhoods, {len(geo_db.allegheny_municipalities)} municipalities")

    # CRITICAL OPTIMIZATION: Create classifier ONCE and reuse it for all stories
    log_message("Initializing advanced geographic classifier (this may take a moment)...")
    classifier = AdvancedGeographicClassifier()
    log_message("Classifier initialized successfully!\n")

    # Load existing stories
    stories, old_filters = load_existing_stories()
    log_message(f"Loaded {len(stories)} existing stories")

    if not stories:
        log_message("No stories found to reprocess")
        return

    # Set up cache directory for article fetching
    cache_dir = Path("reprocessing_cache")
    cache_dir.mkdir(exist_ok=True)

    # Reprocess each story
    updated_stories = []
    confidence_logs = []
    improvements_count = 0
    batch_size = 200
    batch_improvements = 0
    import time
    batch_start_time = time.time()

    for i, story in enumerate(stories):
        # Print individual story progress (less verbose)
        if (i + 1) % 10 == 0 or i == 0:
            log_message(f"Processing story {i+1}/{len(stories)}...")

        # Create a copy to avoid modifying original
        updated_story = story.copy()

        # Fetch article text if we have a URL
        url = story.get('url', '')
        if url:
            try:
                text = fetch_text(url, cache_dir)
                if text:
                    # Use advanced classifier directly (optimized - reuses same instance)
                    found_places, place_confidence = classifier.classify_text(text, min_confidence=0.4)
                    confidence_logs.append({
                        'story_id': story.get('id'),
                        'url': url,
                        'found_places': found_places,
                        'confidence_scores': place_confidence
                    })

                    # Store original values for comparison
                    # Handle neighborhoods that might already be a list
                    original_neighborhoods = story.get('neighborhoods', '')
                    if isinstance(original_neighborhoods, list):
                        original_neighborhoods = ', '.join(original_neighborhoods)
                    original_geographic_area = story.get('geographic_area', '')
                    original_umbrella = story.get('umbrella', '')

                    improved_something = False

                    # Update classifications with NEW logic (municipalities can be neighborhoods)
                    if found_places:
                        neighborhoods = [p for p in found_places if p in geo_db.pittsburgh_neighborhoods]
                        municipalities = [p for p in found_places if p in geo_db.allegheny_municipalities]

                        # NEW LOGIC: Use municipalities as neighborhoods when no Pittsburgh neighborhoods found
                        neighborhoods_to_use = neighborhoods if neighborhoods else municipalities

                        if neighborhoods_to_use and (is_empty(original_neighborhoods) or len(neighborhoods_to_use) > len(str(original_neighborhoods).split(','))):
                            updated_story['neighborhoods'] = ', '.join(neighborhoods_to_use)
                            if original_neighborhoods != updated_story['neighborhoods']:
                                improved_something = True

                        # Update geographic areas based on found places
                        regions = []
                        for place in found_places:
                            if place in geo_db.official_to_region:
                                regions.append(geo_db.official_to_region[place])

                        if regions and (is_empty(original_geographic_area) or len(regions) > len(str(original_geographic_area).split(','))):
                            updated_story['geographic_area'] = ', '.join(list(dict.fromkeys(regions)))
                            if original_geographic_area != updated_story['geographic_area']:
                                improved_something = True

                        # NEW LOGIC: Update umbrella - use "Allegheny County" when municipalities are neighborhoods
                        if is_empty(original_umbrella) or improved_something:
                            if municipalities and not neighborhoods:
                                # Municipalities used as neighborhoods, so umbrella is Allegheny County
                                updated_story['umbrella'] = "Allegheny County"
                            elif any("county" in r.lower() for r in regions):
                                updated_story['umbrella'] = next(r for r in regions if "county" in r.lower())
                            else:
                                updated_story['umbrella'] = "Pittsburgh, Allegheny County"

                            if original_umbrella != updated_story['umbrella']:
                                improved_something = True

                    if improved_something:
                        improvements_count += 1
                        batch_improvements += 1

            except Exception as e:
                log_message(f"  -> Error processing story {i+1}: {e}")

        # Batch progress report every 200 stories
        if (i + 1) % batch_size == 0 or (i + 1) == len(stories):
            batch_end_time = time.time()
            batch_duration = batch_end_time - batch_start_time
            stories_in_batch = min(batch_size, (i + 1) % batch_size if (i + 1) % batch_size != 0 else batch_size)
            avg_time_per_story = batch_duration / stories_in_batch if stories_in_batch > 0 else 0
            remaining_stories = len(stories) - (i + 1)
            estimated_remaining_time = remaining_stories * avg_time_per_story

            log_message("\n" + "="*70)
            log_message(f"BATCH PROGRESS REPORT - Stories {i+1-stories_in_batch+1} to {i+1}")
            log_message("="*70)
            log_message(f"Processed: {i+1}/{len(stories)} stories ({(i+1)/len(stories)*100:.1f}%)")
            log_message(f"Improved in this batch: {batch_improvements}/{stories_in_batch} stories")
            log_message(f"Total improvements so far: {improvements_count}/{i+1} ({improvements_count/(i+1)*100:.1f}%)")
            log_message(f"Batch processing time: {batch_duration:.1f}s ({avg_time_per_story:.2f}s per story)")
            log_message(f"Estimated remaining time: {estimated_remaining_time/60:.1f} minutes")
            log_message("="*70 + "\n")

            # Reset batch counters
            batch_improvements = 0
            batch_start_time = time.time()

        # Normalize text fields
        for field in ['umbrella', 'geographic_area', 'neighborhoods']:
            if field in updated_story and updated_story[field]:
                updated_story[field] = norm_text(str(updated_story[field]))

        updated_stories.append(updated_story)

    # Generate updated filters
    log_message("Generating updated filters...")
    new_filters = update_filters_from_stories(updated_stories)

    # Save updated data
    log_message("Saving updated stories and filters...")
    save_updated_stories(updated_stories, new_filters)

    # Save confidence analysis
    confidence_path = Path("reprocessing_confidence_analysis.json")
    with open(confidence_path, 'w', encoding='utf-8') as f:
        json.dump({
            'reprocessing_summary': {
                'total_stories': len(stories),
                'stories_improved': improvements_count,
                'improvement_rate': improvements_count / len(stories) if stories else 0
            },
            'new_filter_counts': {
                'umbrellas': len(new_filters['umbrellas']),
                'geographic_areas': len(new_filters['geographic_areas']),
                'neighborhoods': len(new_filters['neighborhoods'])
            },
            'story_confidence_logs': confidence_logs
        }, f, indent=2)

    # Print summary
    log_message(f"\n=== REPROCESSING COMPLETE ===")
    log_message(f"Total stories processed: {len(stories)}")
    log_message(f"Stories with improved classifications: {improvements_count}")
    log_message(f"Improvement rate: {improvements_count/len(stories)*100:.1f}%")
    log_message(f"\nUpdated filter counts:")
    log_message(f"  Umbrellas: {len(new_filters['umbrellas'])}")
    log_message(f"  Geographic Areas: {len(new_filters['geographic_areas'])}")
    log_message(f"  Neighborhoods: {len(new_filters['neighborhoods'])}")
    log_message(f"\nConfidence analysis saved to: {confidence_path}")

    # Clean up cache
    try:
        import shutil
        shutil.rmtree(cache_dir, ignore_errors=True)
    except:
        pass

if __name__ == "__main__":
    reprocess_stories()