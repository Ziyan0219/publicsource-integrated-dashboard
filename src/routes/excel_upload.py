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
sys.path.append('/home/ubuntu/news-region-classification')

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
    stories_path = '/home/ubuntu/open-news-classification-/src/data/stories.json'
    try:
        with open(stories_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('stories', [])
    except FileNotFoundError:
        return []

def save_stories(stories, filters):
    """Save updated stories and filters to the frontend data file"""
    stories_path = '/home/ubuntu/open-news-classification-/src/data/stories.json'
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
        if story.get('umbrella'):
            umbrellas.add(story['umbrella'])
        if story.get('geographic_area'):
            geographic_areas.add(story['geographic_area'])
        if story.get('neighborhoods'):
            # Handle both string and list formats
            if isinstance(story['neighborhoods'], str):
                for neigh in story['neighborhoods'].split(', '):
                    if neigh.strip():
                        neighborhoods.add(neigh.strip())
            elif isinstance(story['neighborhoods'], list):
                for neigh in story['neighborhoods']:
                    if neigh.strip():
                        neighborhoods.add(neigh.strip())
    
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
            neigh_path = Path('/home/ubuntu/news-region-classification/Pittsburgh neighborhoods.xlsx')
            muni_path = Path('/home/ubuntu/news-region-classification/Allegheny County Municipalities.xlsx')
            output_dir = Path('/tmp/classification_output')
            
            # Get OpenAI API key from environment
            api_key = os.environ.get('OPENAI_API_KEY')
            if not api_key:
                return jsonify({'error': 'OpenAI API key not configured'}), 500
            
            # Run the classification pipeline
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

