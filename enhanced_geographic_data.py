#!/usr/bin/env python3
"""
Enhanced Geographic Data Processor
Converts Excel files to enhanced JSON format with comprehensive geographic coverage
"""
import pandas as pd
import json
from pathlib import Path

def process_allegheny_county_data():
    """Process Allegheny County Municipalities Excel file"""
    df = pd.read_excel('Allegheny County Municipalities.xlsx')

    municipalities = {}
    sub_regions = {}

    for _, row in df.iterrows():
        name = str(row['Name']).strip() if pd.notna(row['Name']) else ''
        sub_region = str(row['Sub_Region']).strip() if pd.notna(row['Sub_Region']) else ''
        type_label = str(row['TYPE']).strip() if pd.notna(row['TYPE']) else ''

        if name and sub_region:
            # Create full municipality name
            full_name = f"{name} {type_label}" if type_label else name

            municipalities[name] = {
                'official_name': name,
                'full_name': full_name,
                'type': type_label,
                'sub_region': sub_region,
                'aliases': [name, full_name]
            }

            # Group by sub-region
            if sub_region not in sub_regions:
                sub_regions[sub_region] = []
            sub_regions[sub_region].append(name)

    return municipalities, sub_regions

def process_neighborhood_review_data():
    """Process reviewed neighborhood data from NGO spreadsheet"""
    xl = pd.ExcelFile('Neighborhood Category Pages.xlsx')

    reviewed_data = {}
    for sheet_name in xl.sheet_names:
        if sheet_name != 'Neighborhood SEO':  # Skip SEO sheet
            df = pd.read_excel('Neighborhood Category Pages.xlsx', sheet_name=sheet_name)

            # Convert DataFrame to JSON-serializable format
            records = []
            for _, row in df.iterrows():
                record = {}
                for col in df.columns:
                    value = row[col]
                    # Handle pandas types
                    if pd.isna(value):
                        record[col] = None
                    elif hasattr(value, 'isoformat'):  # datetime
                        record[col] = value.isoformat()
                    else:
                        record[col] = str(value)
                records.append(record)

            reviewed_data[sheet_name] = {
                'sheet_data': records,
                'neighborhood_count': len(df),
                'description': f'Reviewed neighborhood data for {sheet_name} region'
            }

    return reviewed_data

def create_enhanced_geographic_database():
    """Create comprehensive geographic database"""

    # Load existing Pittsburgh neighborhoods
    with open('frontend/src/data/pittsburgh_neighborhoods.json', 'r', encoding='utf-8') as f:
        pittsburgh_data = json.load(f)

    # Process new data
    municipalities, sub_regions = process_allegheny_county_data()
    reviewed_data = process_neighborhood_review_data()

    # Create enhanced database
    enhanced_data = {
        'pittsburgh_neighborhoods': pittsburgh_data['neighborhoods'],
        'pittsburgh_regions': pittsburgh_data['regions'],
        'allegheny_county_municipalities': municipalities,
        'allegheny_county_sub_regions': sub_regions,
        'reviewed_neighborhood_data': reviewed_data,
        'geographic_hierarchy': {
            'level_1': 'Pittsburgh Neighborhoods',
            'level_2': 'Pittsburgh Regions',
            'level_3': 'Allegheny County Sub-Regions',
            'level_4': 'Allegheny County Municipalities'
        },
        'context_validation': {
            'positive_keywords': [
                'Pennsylvania', 'PA', 'Pittsburgh', 'Allegheny County',
                'near Pittsburgh', 'Pittsburgh area', 'western Pennsylvania',
                'southwestern PA', 'greater Pittsburgh'
            ],
            'negative_keywords': [
                'Tennessee', 'TN', 'University of Tennessee', 'Knoxville TN',
                'Texas', 'TX', 'California', 'CA', 'New York', 'NY',
                'Florida', 'FL', 'Ohio', 'OH'
            ],
            'ambiguous_places': {
                'Knoxville': {
                    'pennsylvania': 'Knoxville, Pittsburgh neighborhood',
                    'tennessee': 'Knoxville, Tennessee (EXCLUDE)',
                    'validation_required': True
                }
            }
        }
    }

    # Save enhanced database
    with open('enhanced_geographic_data.json', 'w', encoding='utf-8') as f:
        json.dump(enhanced_data, f, indent=2, ensure_ascii=False)

    return enhanced_data

if __name__ == "__main__":
    enhanced_data = create_enhanced_geographic_database()
    print(f"Enhanced geographic database created with {len(enhanced_data['allegheny_county_municipalities'])} municipalities")
    print(f"{len(enhanced_data['allegheny_county_sub_regions'])} sub-regions identified")
    print(f"Context validation rules added for ambiguous place names")