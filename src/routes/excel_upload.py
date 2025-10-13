import os
import json
import pandas as pd
import hashlib
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import sys
import shutil
from pathlib import Path

# Add the news-region-classification directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'news-region-classification'))

# Import the classification algorithm
from archive_classifier_final import pipeline, read_stories, read_neighborhoods, read_municipalities

excel_bp = Blueprint('excel', __name__)

UPLOAD_FOLDER = '/tmp/uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_hash(filepath):
    """Generate MD5 hash of file content for duplicate detection"""
    hash_md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def load_existing_stories():
    """Load existing stories from the frontend data file"""
    stories_path = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'data', 'stories.json')
    
    try:
        if os.path.exists(stories_path):
            with open(stories_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('stories', [])
        else:
            return []
    except Exception as e:
        current_app.logger.error(f"Error loading existing stories: {str(e)}")
        return []

def save_stories(stories, filters):
    """Save updated stories and filters to the frontend data file"""
    stories_path = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'data', 'stories.json')
    data = {
        'stories': stories,
        'filters': filters
    }
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(stories_path), exist_ok=True)
    
    with open(stories_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_filters(stories):
    """Generate updated filter options from stories"""
    umbrellas = set()
    geographic_areas = set()
    neighborhoods = set()
    
    for story in stories:
        # Handle umbrella/category - split by comma and common separators
        if story.get('umbrella') and story['umbrella'].strip():
            umbrella_text = story['umbrella'].strip()
            # Split by comma and other common separators
            for separator in [',', ';', '/', '|']:
                if separator in umbrella_text:
                    for item in umbrella_text.split(separator):
                        item = item.strip()
                        if item and item != '':
                            umbrellas.add(item)
                    break
            else:
                # No separator found, add as single item
                umbrellas.add(umbrella_text)
        
        # Handle geographic area - split by comma and common separators
        if story.get('geographic_area') and story['geographic_area'].strip():
            geo_text = story['geographic_area'].strip()
            # Split by comma and other common separators
            for separator in [',', ';', '/', '|']:
                if separator in geo_text:
                    for item in geo_text.split(separator):
                        item = item.strip()
                        if item and item != '':
                            geographic_areas.add(item)
                    break
            else:
                # No separator found, add as single item
                geographic_areas.add(geo_text)
        
        # Handle neighborhoods - improved logic to handle various formats and split multi-value entries
        if story.get('neighborhoods'):
            neighborhoods_data = story['neighborhoods']
            
            # Handle string format (comma-separated)
            if isinstance(neighborhoods_data, str):
                neighborhoods_text = neighborhoods_data.strip()
                # Split by comma and other common separators
                for separator in [',', ';', '/', '|']:
                    if separator in neighborhoods_text:
                        for neigh in neighborhoods_text.split(separator):
                            neigh = neigh.strip()
                            if neigh and neigh != '':  # Skip empty strings
                                neighborhoods.add(neigh)
                        break
                else:
                    # No separator found, add as single item if not empty
                    if neighborhoods_text and neighborhoods_text != '':
                        neighborhoods.add(neighborhoods_text)
            
            # Handle list format
            elif isinstance(neighborhoods_data, list):
                for neigh_item in neighborhoods_data:
                    if isinstance(neigh_item, str):
                        neigh_text = neigh_item.strip()
                        # Check if this list item contains multiple neighborhoods
                        for separator in [',', ';', '/', '|']:
                            if separator in neigh_text:
                                for neigh in neigh_text.split(separator):
                                    neigh = neigh.strip()
                                    if neigh and neigh != '':
                                        neighborhoods.add(neigh)
                                break
                        else:
                            # No separator found, add as single item if not empty
                            if neigh_text and neigh_text != '':
                                neighborhoods.add(neigh_text)
    
    return {
        'umbrellas': sorted(list(umbrellas)),
        'geographic_areas': sorted(list(geographic_areas)),
        'neighborhoods': sorted(list(neighborhoods))
    }

@excel_bp.route('/upload-excel', methods=['POST'])
def upload_excel():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Unsupported file format, please upload Excel or CSV files'}), 400
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Process the file using the classification algorithm
        try:
            # Set up paths for the algorithm
            neigh_path = Path(os.path.join(os.path.dirname(__file__), '..', '..', 'Pittsburgh neighborhoods.xlsx'))
            muni_path = Path(os.path.join(os.path.dirname(__file__), '..', '..', 'Allegheny County Municipalities.xlsx'))
            output_dir = Path('/tmp/classification_output')
            
            # Get OpenAI API key from environment (optional now, teaser generation disabled)
            api_key = os.environ.get('OPENAI_API_KEY')

            # Run the enhanced classification pipeline
            pipeline(Path(filepath), neigh_path, muni_path, output_dir, api_key)
            
            # Read the processed results
            result_file = output_dir / 'stories_classified_filled.csv'
            if not result_file.exists():
                return jsonify({'error': 'Processing failed, no result file generated'}), 500
            
            # Load processed data
            df = pd.read_csv(result_file)
            
            # Load existing stories for duplicate checking
            existing_stories = load_existing_stories()
            existing_urls = {story.get('url', '') for story in existing_stories}
            
            # Convert processed data to frontend format
            new_stories = []
            duplicate_count = 0
            
            for _, row in df.iterrows():
                story_url = str(row.get('Story', ''))
                
                # Check for duplicates
                if story_url in existing_urls:
                    duplicate_count += 1
                    continue
                
                # Convert to frontend format
                story = {
                    'id': len(existing_stories) + len(new_stories) + 1,
                    'url': story_url,
                    'social_abstract': str(row.get('SocialAbstract', '')),
                    'umbrella': str(row.get('Umbrella', '')),
                    'geographic_area': str(row.get('GeographicArea', '')),
                    'neighborhoods': str(row.get('Neighborhoods', '')).split(', ') if row.get('Neighborhoods') else []
                }
                
                new_stories.append(story)
                existing_urls.add(story_url)
            
            # Combine existing and new stories
            all_stories = existing_stories + new_stories
            
            # Update filters
            filters = update_filters(all_stories)
            
            # Save updated data
            save_stories(all_stories, filters)
            
            # Clean up temporary files
            try:
                os.remove(filepath)
                shutil.rmtree(output_dir, ignore_errors=True)
            except:
                pass
            
            return jsonify({
                'success': True,
                'processed_count': len(df),
                'new_count': len(new_stories),
                'duplicate_count': duplicate_count,
                'total_stories': len(all_stories)
            })
            
        except Exception as e:
            current_app.logger.error(f"Classification pipeline error: {str(e)}")
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
        
    except Exception as e:
        current_app.logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@excel_bp.route('/refresh-data', methods=['GET'])
def refresh_data():
    """Endpoint to get the latest stories data"""
    try:
        stories = load_existing_stories()
        filters = update_filters(stories)

        return jsonify({
            'stories': stories,
            'filters': filters
        })
    except Exception as e:
        current_app.logger.error(f"Refresh data error: {str(e)}")
        return jsonify({'error': f'Failed to get data: {str(e)}'}), 500

@excel_bp.route('/import-sitemap', methods=['POST'])
def import_sitemap():
    """Import articles from PublicSource sitemaps"""
    try:
        import subprocess
        import threading

        # Get parameters from request
        data = request.get_json() or {}
        test_mode = data.get('test_mode', False)
        batch_size = data.get('batch_size', 50)
        max_articles = data.get('max_articles', None)

        # Build command
        cmd = ['python', 'sitemap_importer.py', '--batch_size', str(batch_size)]

        if test_mode:
            cmd.append('--test_mode')

        if max_articles:
            cmd.extend(['--max_articles', str(max_articles)])

        # Run in background thread
        def run_import():
            try:
                result = subprocess.run(
                    cmd,
                    cwd=os.path.join(os.path.dirname(__file__), '..', '..'),
                    capture_output=True,
                    text=True,
                    timeout=3600  # 1 hour timeout
                )
                current_app.logger.info(f"Sitemap import output: {result.stdout}")
                if result.stderr:
                    current_app.logger.error(f"Sitemap import errors: {result.stderr}")
            except Exception as e:
                current_app.logger.error(f"Sitemap import error: {str(e)}")

        # Start background thread
        thread = threading.Thread(target=run_import)
        thread.daemon = True
        thread.start()

        return jsonify({
            'success': True,
            'message': 'Sitemap import started in background',
            'test_mode': test_mode,
            'batch_size': batch_size
        })

    except Exception as e:
        current_app.logger.error(f"Sitemap import error: {str(e)}")
        return jsonify({'error': f'Failed to start sitemap import: {str(e)}'}), 500

@excel_bp.route('/import-sitemap-sync', methods=['POST'])
def import_sitemap_sync():
    """Import articles from PublicSource sitemaps (synchronous version)"""
    try:
        import requests
        import xml.etree.ElementTree as ET

        # Get parameters
        data = request.get_json() or {}
        test_mode = data.get('test_mode', False)
        max_articles = data.get('max_articles', 10 if test_mode else None)

        # Sitemap URLs
        sitemap_urls = [
            "https://www.publicsource.org/sitemap-1.xml",
            "https://www.publicsource.org/sitemap-2.xml",
            "https://www.publicsource.org/sitemap-3.xml",
            "https://www.publicsource.org/sitemap-4.xml",
            "https://www.publicsource.org/sitemap-5.xml",
        ]

        # Fetch URLs from sitemaps
        all_urls = []
        for sitemap_url in sitemap_urls:
            try:
                response = requests.get(sitemap_url, timeout=30)
                response.raise_for_status()

                root = ET.fromstring(response.content)
                namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

                for url_elem in root.findall('.//ns:url', namespace):
                    loc_elem = url_elem.find('ns:loc', namespace)
                    if loc_elem is not None and loc_elem.text:
                        all_urls.append(loc_elem.text)

            except Exception as e:
                current_app.logger.error(f"Error fetching sitemap {sitemap_url}: {str(e)}")

        # Remove duplicates
        all_urls = list(dict.fromkeys(all_urls))

        # Load existing stories
        existing_stories = load_existing_stories()
        existing_urls = {story.get('url', '') for story in existing_stories}

        # Filter new URLs
        new_urls = [url for url in all_urls if url not in existing_urls]

        # Limit if requested
        if max_articles:
            new_urls = new_urls[:max_articles]

        if not new_urls:
            return jsonify({
                'success': True,
                'message': 'No new articles to import',
                'total_urls': len(all_urls),
                'existing_urls': len(existing_urls),
                'new_urls': 0
            })

        # Create temporary CSV
        temp_dir = Path('/tmp/sitemap_import')
        temp_dir.mkdir(parents=True, exist_ok=True)

        temp_csv = temp_dir / 'urls.csv'
        df = pd.DataFrame({
            'Story': new_urls,
            'Umbrella': '',
            'GeographicArea': '',
            'Neighborhoods': '',
            'SocialAbstract': ''
        })
        df.to_csv(temp_csv, index=False)

        # Process through pipeline
        neigh_path = Path(os.path.join(os.path.dirname(__file__), '..', '..', 'Pittsburgh neighborhoods.xlsx'))
        muni_path = Path(os.path.join(os.path.dirname(__file__), '..', '..', 'Allegheny County Municipalities.xlsx'))
        output_dir = temp_dir / 'output'
        api_key = os.environ.get('OPENAI_API_KEY')

        pipeline(temp_csv, neigh_path, muni_path, output_dir, api_key)

        # Read results
        result_file = output_dir / 'stories_classified_filled.csv'
        if not result_file.exists():
            return jsonify({'error': 'Processing failed, no result file generated'}), 500

        df_results = pd.read_csv(result_file)

        # Convert to frontend format and merge
        new_stories = []
        for _, row in df_results.iterrows():
            # Helper function to clean nan values
            def clean_value(val):
                if pd.isna(val) or str(val).lower() == 'nan':
                    return ''
                return str(val)

            # Get neighborhoods and clean
            neighborhoods_str = clean_value(row.get('Neighborhoods', ''))
            neighborhoods = [n.strip() for n in neighborhoods_str.split(', ') if n.strip() and n.strip().lower() != 'nan'] if neighborhoods_str else []

            story = {
                'id': len(existing_stories) + len(new_stories) + 1,
                'url': clean_value(row.get('Story', '')),
                'social_abstract': clean_value(row.get('SocialAbstract', '')),
                'umbrella': clean_value(row.get('Umbrella', '')),
                'geographic_area': clean_value(row.get('GeographicArea', '')),
                'neighborhoods': neighborhoods,
                'title': clean_value(row.get('Title', '')),
                'author': clean_value(row.get('Author', '')),
                'date': clean_value(row.get('Date', ''))
            }
            new_stories.append(story)

        # Save
        all_stories = existing_stories + new_stories
        filters = update_filters(all_stories)
        save_stories(all_stories, filters)

        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)

        return jsonify({
            'success': True,
            'total_urls': len(all_urls),
            'existing_urls': len(existing_urls),
            'new_urls': len(new_urls),
            'processed': len(new_stories),
            'total_stories': len(all_stories)
        })

    except Exception as e:
        current_app.logger.error(f"Sitemap import sync error: {str(e)}")
        return jsonify({'error': f'Import failed: {str(e)}'}), 500

