import React, { useState, useMemo } from 'react';
import { Map, ToggleLeft, ToggleRight } from 'lucide-react';
import PittsburghRegionMap from './PittsburghRegionMap';
import AlleghenyCountyMap from './AlleghenyCountyMap';

// Pittsburgh City Region names
const PITTSBURGH_REGIONS = [
  'Central Pittsburgh', 'Hill District', 'Lower East End', 'North Side',
  'South Pittsburgh', 'Southeast Pittsburgh', 'Upper East End', 'West End'
];

// Allegheny County Sub-Region names
const COUNTY_REGIONS = [
  'Alle-Kiski Valley', 'East suburbs', 'Mon Valley', 'North Hills',
  'Northwest suburbs', 'Ohio River Valley', 'South Hills', 'West suburbs'
];

// Pittsburgh neighborhoods (for detection)
const PITTSBURGH_NEIGHBORHOODS = [
  'Allegheny Center', 'Allegheny West', 'Allentown', 'Arlington', 'Arlington Heights',
  'Banksville', 'Bedford Dwellings', 'Beechview', 'Beltzhoover', 'Bloomfield', 'Bluff',
  'Bon Air', 'Brighton Heights', 'Brookline', 'California-Kirkbride', 'Carrick',
  'Central Business District', 'Central Lawrenceville', 'Central Northside', 'Central Oakland',
  'Chartiers City', 'Chateau', 'Crafton Heights', 'Crawford-Roberts', 'Duquesne Heights',
  'East Allegheny', 'East Carnegie', 'East Hills', 'East Liberty', 'Elliott', 'Esplen',
  'Fairywood', 'Fineview', 'Friendship', 'Garfield', 'Glen Hazel', 'Greenfield', 'Hays',
  'Hazelwood', 'Highland Park', 'Homewood North', 'Homewood South', 'Homewood West',
  'Knoxville', 'Larimer', 'Lincoln Place', 'Lincoln-Lemington-Belmar', 'Lower Lawrenceville',
  'Manchester', 'Marshall-Shadeland', 'Middle Hill', 'Morningside', 'Mount Washington',
  'Mt. Oliver', 'New Homestead', 'North Oakland', 'North Shore', 'Northview Heights',
  'Oakwood', 'Overbrook', 'Perry North', 'Perry South', 'Point Breeze', 'Point Breeze North',
  'Polish Hill', 'Regent Square', 'Ridgemont', 'Shadyside', 'Sheraden', 'South Oakland',
  'South Shore', 'South Side Flats', 'South Side Slopes', 'Spring Garden', 'Spring Hill-City View',
  'Squirrel Hill North', 'Squirrel Hill South', 'St. Clair', 'Stanton Heights', 'Strip District',
  'Summer Hill', 'Swisshelm Park', 'Terrace Village', 'Troy Hill', 'Upper Hill',
  'Upper Lawrenceville', 'West End', 'West Oakland', 'Westwood', 'Windgap'
];

/**
 * MapContainer Component
 * Provides smart switching between Pittsburgh City map and Allegheny County map
 * based on the content being displayed
 */
const MapContainer = ({
  highlightedAreas = [],
  stories = [],
  isAnalyticsMode = false,
  onRegionClick,
  forceMapType = null // 'pittsburgh' | 'county' | null (auto)
}) => {
  const [manualMapType, setManualMapType] = useState(null);

  // Detect which map type is most appropriate based on highlighted areas
  const detectedMapType = useMemo(() => {
    if (!highlightedAreas || highlightedAreas.length === 0) {
      // Default to Pittsburgh when nothing is highlighted
      return 'pittsburgh';
    }

    const normalizedAreas = highlightedAreas.map(a => a.toLowerCase());

    let pittsburghScore = 0;
    let countyScore = 0;

    normalizedAreas.forEach(area => {
      // Check Pittsburgh regions
      if (PITTSBURGH_REGIONS.some(r => r.toLowerCase() === area)) {
        pittsburghScore += 2;
      }
      // Check Pittsburgh neighborhoods
      if (PITTSBURGH_NEIGHBORHOODS.some(n => n.toLowerCase() === area)) {
        pittsburghScore += 1;
      }
      // Check County regions
      if (COUNTY_REGIONS.some(r => r.toLowerCase() === area)) {
        countyScore += 2;
      }
    });

    // If clear winner, return it
    if (pittsburghScore > countyScore) return 'pittsburgh';
    if (countyScore > pittsburghScore) return 'county';

    // Default to Pittsburgh if tied or no matches
    return 'pittsburgh';
  }, [highlightedAreas]);

  // Determine which map to show
  const activeMapType = forceMapType || manualMapType || detectedMapType;

  // Check if we should show the toggle (when there's mixed content)
  const showToggle = useMemo(() => {
    if (!highlightedAreas || highlightedAreas.length === 0) return true; // Always show in default state

    const normalizedAreas = highlightedAreas.map(a => a.toLowerCase());

    const hasPittsburgh = normalizedAreas.some(area =>
      PITTSBURGH_REGIONS.some(r => r.toLowerCase() === area) ||
      PITTSBURGH_NEIGHBORHOODS.some(n => n.toLowerCase() === area)
    );

    const hasCounty = normalizedAreas.some(area =>
      COUNTY_REGIONS.some(r => r.toLowerCase() === area)
    );

    return hasPittsburgh || hasCounty || (!hasPittsburgh && !hasCounty);
  }, [highlightedAreas]);

  const handleToggle = () => {
    setManualMapType(activeMapType === 'pittsburgh' ? 'county' : 'pittsburgh');
  };

  return (
    <div className="relative">
      {/* Map Toggle Button */}
      {showToggle && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleToggle}
            className="flex items-center space-x-2 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Map className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {activeMapType === 'pittsburgh' ? 'City' : 'County'}
            </span>
            {activeMapType === 'pittsburgh' ? (
              <ToggleLeft className="h-5 w-5 text-blue-600" />
            ) : (
              <ToggleRight className="h-5 w-5 text-green-600" />
            )}
          </button>
        </div>
      )}

      {/* Map Content */}
      {activeMapType === 'pittsburgh' ? (
        <PittsburghRegionMap
          highlightedAreas={highlightedAreas}
          stories={stories}
          isAnalyticsMode={isAnalyticsMode}
          onRegionClick={onRegionClick}
        />
      ) : (
        <AlleghenyCountyMap
          highlightedAreas={highlightedAreas}
          stories={stories}
          isAnalyticsMode={isAnalyticsMode}
          onRegionClick={onRegionClick}
        />
      )}

      {/* Auto-detection indicator */}
      {!manualMapType && !forceMapType && highlightedAreas.length > 0 && (
        <div className="absolute bottom-2 left-2 z-10">
          <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
            Auto-detected: {activeMapType === 'pittsburgh' ? 'Pittsburgh City' : 'Allegheny County'}
          </span>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
