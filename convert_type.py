import pandas as pd
import json

def convert_csv_to_json(csv_path, json_path):
    df = pd.read_csv(csv_path)
    
    stories_data = []
    for index, row in df.iterrows():
        story_obj = {
            "id": index + 1, # Simple ID generation
            "url": row["Story"],
            "umbrella": row["Umbrella"],
            "geographic_area": row["GeographicArea"],
            "neighborhoods": row["Neighborhoods"],
            "social_abstract": str(row["SocialAbstract"]).strip().strip('"'),
            "title": "", # Placeholder, as not in CSV
            "author": "", # Placeholder, as not in CSV
            "date": "" # Placeholder, as not in CSV
        }
        stories_data.append(story_obj)
    
    # Generate filters based on the new data
    filters_data = {
        "neighborhoods": sorted(list(df["Neighborhoods"].dropna().unique())),
        "geographicAreas": sorted(list(df["GeographicArea"].dropna().unique())),
        "umbrella": sorted(list(df["Umbrella"].dropna().unique()))
    }

    output_data = {
        "stories": stories_data,
        "filters": filters_data
    }

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    new_csv_file = './results_final/stories_classified_filled.csv'
    frontend_json_file = './frontend/src/data/stories.json'
    
    convert_csv_to_json(new_csv_file, frontend_json_file)
    print(f"✅ Successfully converted {new_csv_file} to {frontend_json_file}")