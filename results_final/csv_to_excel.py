"""
csv_to_excel.py — Convert CSV to Excel

Usage:
    python csv_to_excel.py --input stories_classified_filled.csv

This script reads a CSV file and writes it to an Excel (.xlsx) file in the same directory.
Requires: pandas, openpyxl
Install dependencies:
    pip install pandas openpyxl
"""
import argparse
from pathlib import Path
import pandas as pd


def main():
    parser = argparse.ArgumentParser(description="Convert a CSV file to Excel format.")
    parser.add_argument(
        "--input", required=True, type=Path,
        help="Path to the input CSV file"
    )
    args = parser.parse_args()

    csv_path = args.input
    if not csv_path.exists() or csv_path.suffix.lower() != ".csv":
        parser.error(f"Input must be an existing .csv file: {csv_path}")

    df = pd.read_csv(csv_path)
    excel_path = csv_path.with_suffix('.xlsx')
    df.to_excel(excel_path, index=False)

    print(f"Saved Excel file: {excel_path}")

if __name__ == "__main__":
    main()
