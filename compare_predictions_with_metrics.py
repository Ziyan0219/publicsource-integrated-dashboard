#!/usr/bin/env python3
"""
compare_predictions_with_metrics.py — Compare predicted vs. manual labels and compute metrics
-------------------------------------------------------------------------------
Loads predictions and manual markings, reports mismatches, and computes
accuracy, precision, recall, and F1-score for Neighborhoods,
GeographicArea, and Umbrella (skipping blank manual entries).

Dependencies:
    pip install pandas openpyxl scikit-learn

Usage:
    python compare_predictions_with_metrics.py \
      --pred results_final/stories_classified_filled.csv \
      --manual "Marking neighborhoods by story_2025.xlsx" \
      --out comparison_results.csv
"""
import argparse
from pathlib import Path
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


def norm_header(col: str) -> str:
    return col.strip().replace(" ", "").replace("_", "").title()


def compare_and_evaluate(pred_path: Path, manual_path: Path, output_csv: Path):
    # Load predictions
    df_pred = pd.read_csv(pred_path) if pred_path.suffix.lower() == ".csv" else \
        pd.read_excel(pred_path, engine="openpyxl")
    # Load manual
    df_man = pd.read_excel(manual_path, engine="openpyxl")

    # Normalize headers
    df_pred.rename(columns={c: norm_header(c) for c in df_pred.columns}, inplace=True)
    df_man.rename(columns={c: norm_header(c) for c in df_man.columns}, inplace=True)

    # Fields to compare
    fields = ["Neighborhoods", "Geographicarea", "Umbrella"]
    for col in fields + ["Story"]:
        if col not in df_pred.columns or col not in df_man.columns:
            raise ValueError(f"Missing column {col} in one of the files.")

    # Merge on Story
    df = df_pred.merge(
        df_man[["Story"] + fields], on="Story", suffixes=("", "_Manual"), how="left"
    )

    # Track mismatches
    mismatches = []
    for _, row in df.iterrows():
        for field in fields:
            manual_val = row[f"{field}_Manual"]
            if pd.isna(manual_val) or str(manual_val).strip() == "":
                continue  # skip blank manual
            pred_val = row[field]
            if str(pred_val).strip() != str(manual_val).strip():
                mismatches.append({"Story": row["Story"],
                                   "Field": field,
                                   "Manual": manual_val,
                                   "Predicted": pred_val})
    # Save mismatches
    pd.DataFrame(mismatches).to_csv(output_csv, index=False)
    print(f"Saved {len(mismatches)} mismatches to {output_csv}.")

    # Compute and print metrics
    print("\nEvaluation Metrics:")
    for field in fields:
        subset = df.dropna(subset=[f"{field}_Manual"]).copy()
        y_true = subset[f"{field}_Manual"].astype(str)
        y_pred = subset[field].fillna("").astype(str)
        acc = accuracy_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_true, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)
        print(f"{field}: accuracy={acc:.2f}, precision={prec:.2f}, recall={rec:.2f}, f1={f1:.2f}")


def main():
    parser = argparse.ArgumentParser(description="Compare predictions and compute metrics.")
    parser.add_argument("--pred", required=True, type=Path, help="Predicted CSV/XLSX path")
    parser.add_argument("--manual", required=True, type=Path, help="Manual markings XLSX path")
    parser.add_argument("--out", required=True, type=Path, help="Output mismatches CSV")
    args = parser.parse_args()
    compare_and_evaluate(args.pred, args.manual, args.out)

if __name__ == "__main__":
    main()
