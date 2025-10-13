# Testing Guide for PublicSource Categorization Tool

## Overview
This guide will help you test the story categorization system and compare the AI-powered classifications with your manual categorization process.

## System Components

### 1. **Categorization Algorithm** (`archive_classifier_final.py`)
The main classification engine that:
- Fetches article content from URLs
- Identifies Pittsburgh neighborhoods using enhanced geographic database
- Classifies stories by geographic area (e.g., North Side, Central Pittsburgh)
- Sets umbrella categories (e.g., Pittsburgh, Allegheny County)
- Extracts metadata (title, author, date)
- **Note**: Teaser generation is currently disabled to preserve existing data

### 2. **Web Interface** (http://localhost:5173)
- **Dashboard**: View all categorized stories
- **Upload Button**: Upload Excel/CSV files with story URLs
- **Sitemap Import**: Automatically import from PublicSource sitemaps
- **Filters**: Filter by Category, Geographic Area, and Neighborhoods
- **Story Cards**: View individual story details

### 3. **Backend API** (http://localhost:5000)
- `/api/upload-excel`: Process uploaded files
- `/api/refresh-data`: Get latest stories
- `/api/import-sitemap-sync`: Import from sitemaps

## How to Test the Categorization

### Method 1: Test with Sample Stories

1. **Prepare Test File**:
   - Create an Excel or CSV file with a column named "Story"
   - Add URLs of PublicSource articles you want to test
   - Example format:
     ```
     Story
     https://www.publicsource.org/manchester-esplanade-development-pittsburgh/
     https://www.publicsource.org/sewickley-black-history-preservation-book-film/
     ```

2. **Upload and Process**:
   - Open http://localhost:5173 in your browser
   - Login with access code: `publicsource-cmu`
   - Click the "Upload Excel/CSV" button
   - Select your test file
   - Wait for processing (you'll see a success message)

3. **Review Results**:
   - The dashboard will automatically refresh
   - Find your newly added stories
   - Compare the AI categorization with your expected results:
     - **Neighborhoods**: Which specific neighborhoods were identified?
     - **Geographic Area**: North Side, Central Pittsburgh, etc.
     - **Umbrella**: Pittsburgh vs. Allegheny County

### Method 2: Use Existing Test File

We have a test file ready: `Marking neighborhoods by story_2025.xlsx`

1. **Run the test**:
   ```bash
   # Open browser to http://localhost:5173
   # Upload the file: Marking neighborhoods by story_2025.xlsx
   ```

2. **Compare results**:
   - Check each story's categorization
   - Note any discrepancies between AI classification and expected results

### Method 3: Direct Python Script Test

For detailed testing without the web interface:

```bash
python archive_classifier_final.py \
  --stories "Marking neighborhoods by story_2025.xlsx" \
  --neigh "Pittsburgh neighborhoods.xlsx" \
  --muni "Allegheny County Municipalities.xlsx" \
  --out_dir "test_results"
```

Results will be saved to:
- `test_results/stories_classified_filled.csv` - The categorized data
- `test_results/confidence_analysis.json` - Confidence scores for each classification

## What to Look For

### Good Classification Examples:
- Story mentions "Lawrenceville" → Neighborhoods: "Lawrenceville", Geographic Area: "East End"
- Story mentions "McKeesport" → Umbrella: "Allegheny County", Neighborhoods: "McKeesport"
- Story mentions "Downtown" → Neighborhoods: "Downtown", Geographic Area: "Central Pittsburgh"

### Potential Issues to Test:
1. **Ambiguous Places**:
   - "Knoxville" could be Pittsburgh neighborhood or Tennessee city
   - System should use context to disambiguate

2. **Multiple Neighborhoods**:
   - Stories covering multiple areas
   - Should list all relevant neighborhoods

3. **County vs. City Stories**:
   - Stories outside Pittsburgh proper
   - Should be classified as "Allegheny County"

4. **Generic Stories**:
   - Statewide or national stories
   - May not have specific neighborhood classification

## Comparing with Manual Categorization

### Create a Comparison Spreadsheet:

| Story URL | Your Category | Your Neighborhoods | AI Category | AI Neighborhoods | Match? | Notes |
|-----------|---------------|-------------------|-------------|------------------|--------|-------|
| URL 1     | Pittsburgh    | Lawrenceville     | Pittsburgh  | Lawrenceville    | ✓      |       |
| URL 2     | County        | McKeesport        | County      | McKeesport       | ✓      |       |

### Evaluation Criteria:
- **Accuracy**: Does the AI correctly identify the neighborhood?
- **Completeness**: Does it catch all relevant neighborhoods?
- **False Positives**: Does it incorrectly identify unrelated places?
- **Consistency**: Are similar stories categorized similarly?

## Advanced Testing

### Test Enhanced Geographic Classification:

The system uses `advanced_geographic_classifier.py` for improved accuracy:

```python
# Test individual article
python -c "
from advanced_geographic_classifier import AdvancedGeographicClassifier
classifier = AdvancedGeographicClassifier()
text = 'Your article text here...'
places, confidence = classifier.classify_text(text, min_confidence=0.4)
print(f'Found: {places}')
print(f'Confidence: {confidence}')
"
```

### Test Confidence Scores:

After processing, check `test_results/confidence_analysis.json`:
- Confidence > 0.7: High confidence classification
- Confidence 0.4-0.7: Moderate confidence
- Confidence < 0.4: Low confidence (may need manual review)

## Current System Status

✅ **Working Components**:
- Frontend dashboard at http://localhost:5173
- Backend API at http://localhost:5000
- Excel upload processing
- Geographic classification
- Neighborhood identification
- Metadata extraction (title, author, date)
- Duplicate detection
- Filter system

⚠️ **Disabled Features**:
- Teaser generation (disabled to preserve existing data and save API costs)

## Next Steps for Testing

1. **Quick Test** (5 minutes):
   - Upload 3-5 sample stories
   - Verify categories appear correctly
   - Check filters work

2. **Comprehensive Test** (30 minutes):
   - Upload the full test file
   - Review all categorizations
   - Create comparison spreadsheet
   - Note patterns in errors

3. **Refinement**:
   - Share findings
   - Adjust classification rules if needed
   - Update geographic database if missing neighborhoods

## Troubleshooting

### Issue: Stories not categorized
- Check that article URLs are from publicsource.org
- Verify articles are accessible (not behind paywall)
- Check console for error messages

### Issue: Wrong neighborhoods identified
- Review article text for geographic mentions
- Check if place names are ambiguous
- Examine confidence scores in analysis file

### Issue: Upload fails
- Check file format (must be .xlsx, .xls, or .csv)
- Verify "Story" column exists
- Check URLs are valid

## Questions to Answer During Testing

1. **What percentage of stories are correctly categorized?**
2. **Which types of stories are most difficult to categorize?**
3. **Are there neighborhoods the system consistently misses?**
4. **Do the confidence scores correlate with accuracy?**
5. **How does AI categorization compare to manual effort in terms of time and accuracy?**

## Contact & Support

If you encounter issues or have questions:
- Check the logs in the backend terminal
- Review `test_results/debug_texts/` for article text samples
- Examine confidence scores in the analysis file
