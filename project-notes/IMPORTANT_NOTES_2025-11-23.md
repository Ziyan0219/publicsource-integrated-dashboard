# Project Notes - November 23, 2025

## Major Updates

### 1. Dual Map System Implementation

Implemented a switchable dual map system based on PublicSource's official 16 geographic regions:

**Pittsburgh City Regions (8):**
- North Side
- Central Pittsburgh
- Hill District
- Upper East End
- Lower East End
- South Pittsburgh
- Southeast Pittsburgh
- West End

**Allegheny County Sub-Regions (8):**
- North Hills
- Northwest suburbs
- Ohio River Valley
- West suburbs
- South Hills
- Mon Valley
- East suburbs
- Alle-Kiski Valley

**New Components:**
- `PittsburghRegionMap.jsx` - Interactive Pittsburgh city map with SVG overlay on official neighborhood map
- `AlleghenyCountyMap.jsx` - Interactive Allegheny County map with SVG overlay on official municipal map
- `MapContainer.jsx` - Smart switching container that auto-detects which map to show based on story content

**Features:**
- Automatic map switching based on geographic data in stories
- Manual toggle button for user control
- Consistent styling between both maps (same size, opacity, interaction patterns)
- Region highlighting on hover
- Story count badges in analytics mode
- Color-coded regions (Blue for Pittsburgh, Green for County)

### 2. Data Cleanup

Cleaned `stories.json` to remove non-article data:

**Before:** 1,620 records
**After:** 1,438 records
**Removed:** 182 records

**Removal Criteria:**
- Records with no geographic data (empty `geographic_area` AND empty `neighborhoods`)
- Records with invalid/unparseable dates (date field contained descriptions instead of ISO 8601 timestamps)

**Types of Removed Content:**
- Interactive tools ("311 bar chart", "How fast were potholes in your area filled?")
- Maps and resources ("Dunkard Creek Map")
- Gallery entries ("Blue Line: Sarah", "Red Line" series)
- Meta pages ("Republishing guidelines", "Stay connected", "About Pittsburgh's Public Source")
- Legacy content with corrupted date fields

### 3. Bug Fixes

**Fixed neighborhoods array/string handling:**
- `story.neighborhoods` field can be either a string or an array in the data
- Added type checking before calling `.split()` in all affected components:
  - `PittsburghRegionMap.jsx`
  - `AlleghenyCountyMap.jsx`
  - `PittsburghMap.jsx`
  - Already fixed in: `AnalyticsDashboard.jsx`, `Dashboard.jsx`, `StaticStoryCard.jsx`

**Fixed "Southeast Pittsburgh" trailing space:**
- Removed trailing spaces from 3 entries in `pittsburgh_neighborhoods.json`
- Ensures consistent string matching with `enhanced_geographic_data.json`

### 4. Files Modified

**New Files:**
- `frontend/src/components/PittsburghRegionMap.jsx`
- `frontend/src/components/AlleghenyCountyMap.jsx`
- `frontend/src/components/MapContainer.jsx`
- `frontend/public/allegheny-county-map.png` (copied from resources)
- `frontend/public/pittsburgh-neighborhoods.svg` (copied from resources)

**Modified Files:**
- `frontend/src/data/stories.json` - Cleaned data (1438 stories)
- `frontend/src/data/pittsburgh_neighborhoods.json` - Fixed trailing spaces
- `frontend/src/components/Dashboard.jsx` - Updated to use MapContainer
- `frontend/src/components/AnalyticsDashboard.jsx` - Updated to use MapContainer
- `frontend/src/components/StatsPage.jsx` - Updated to use MapContainer
- `frontend/src/components/PittsburghMap.jsx` - Fixed array handling bug
- `enhanced_geographic_data.json` - Normalized region names

**Utility Scripts:**
- `cleanup_stories.py` - Python script for data cleaning (can be deleted after use)

## Technical Notes

### Map SVG Coordinates

**Pittsburgh Map:**
- ViewBox: `0 0 729 586` (matches `pittsburgh-neighborhoods.svg`)
- Background image with 40% opacity
- SVG overlay with interactive polygon regions

**Allegheny County Map:**
- ViewBox: `0 0 700 600` (approximates `allegheny-county-map.png`)
- Background image with 40% opacity
- SVG overlay with interactive polygon regions

### Data Flow

1. `App.jsx` loads `stories.json` (fallback) or fetches from backend
2. Stories are passed to all dashboard components via props
3. Map components calculate region-based story counts using `useMemo`
4. Analytics dashboard displays geographic distribution using the official 16 regions

## Next Steps / Considerations

- [ ] Refine SVG polygon coordinates for more accurate region boundaries
- [ ] Consider removing unused `PittsburghMap.jsx` (replaced by new components)
- [ ] Add LLM-powered features for story analysis
- [ ] Implement more sophisticated geographic matching algorithms
