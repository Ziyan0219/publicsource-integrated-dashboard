#!/usr/bin/env python3
"""
Parse Pittsburgh neighborhoods.xlsx to understand geo-area mapping
"""
import pandas as pd
from pathlib import Path

def main():
    # Read Pittsburgh neighborhoods file
    neighborhoods_file = Path("Pittsburgh neighborhoods.xlsx")
    
    try:
        # Read all sheets first
        xl_file = pd.ExcelFile(neighborhoods_file)
        print("Available sheets:")
        for sheet in xl_file.sheet_names:
            print(f"  - {sheet}")
        
        # Read the first sheet to understand structure
        df = pd.read_excel(neighborhoods_file, sheet_name=0)
        print(f"\nFirst sheet shape: {df.shape}")
        print("\nColumns:")
        for i, col in enumerate(df.columns):
            print(f"  {i}: {col}")
        
        print("\nFirst 10 rows:")
        print(df.head(10).to_string())
        
        # Look for geographic area and neighborhood mapping
        if len(df.columns) > 4:
            print(f"\nColumns 4-7 sample (E-H):")
            cols_to_show = df.columns[4:8] if len(df.columns) >= 8 else df.columns[4:]
            print(df[cols_to_show].head(10).to_string())
        
        # Create mapping if we can identify the right columns
        if len(df.columns) >= 8:
            # Based on the archive_classifier_final.py code, columns E-H should be:
            # E: Neighborhood, F: Label, G: Official, H: Region
            e, f, g, h = df.columns[4:8]
            mapping_df = df[[e, f, g, h]].rename(columns={
                e: "Neighborhood", 
                f: "Label", 
                g: "Official", 
                h: "Region"
            })
            
            print(f"\nMapping structure (E-H columns):")
            print(f"  E ({e}): Neighborhood names")
            print(f"  F ({f}): Alternative labels")
            print(f"  G ({g}): Official names")
            print(f"  H ({h}): Geographic regions")
            
            # Create alias to official mapping
            alias_to_official = {}
            neighborhood_to_region = {}
            
            for _, row in mapping_df.iterrows():
                official = row["Official"] or row["Neighborhood"]
                if pd.notna(official):
                    official = str(official).strip()
                    region = str(row["Region"]).strip() if pd.notna(row["Region"]) else ""
                    
                    # Map all variations to official name
                    for col in ["Neighborhood", "Label", "Official"]:
                        if pd.notna(row[col]):
                            alias = str(row[col]).strip()
                            if alias:
                                alias_to_official[alias] = official
                    
                    # Map neighborhood to region
                    if region:
                        neighborhood_to_region[official] = region
            
            print(f"\nFound {len(alias_to_official)} neighborhood aliases")
            print(f"Found {len(neighborhood_to_region)} neighborhood-to-region mappings")
            
            # Show some examples
            print(f"\nFirst 10 alias mappings:")
            for i, (alias, official) in enumerate(list(alias_to_official.items())[:10]):
                region = neighborhood_to_region.get(official, "Unknown")
                print(f"  {alias} -> {official} (Region: {region})")
            
            # Show unique regions
            regions = set(neighborhood_to_region.values())
            print(f"\nUnique regions found ({len(regions)}):")
            for region in sorted(regions):
                print(f"  - {region}")
    
    except Exception as e:
        print(f"Error reading file: {e}")

if __name__ == "__main__":
    main()