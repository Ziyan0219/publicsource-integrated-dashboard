import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';

const PittsburghMap = ({ highlightedAreas = [], stories = [], isAnalyticsMode = false }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Calculate story counts by geographic area and neighborhood for analytics mode
  const regionStoryCounts = useMemo(() => {
    if (!isAnalyticsMode || !stories || stories.length === 0) {
      return {};
    }

    const counts = {};
    stories.forEach(story => {
      // Count by geographic area
      if (story.geographic_area) {
        const areas = story.geographic_area.split(/[,;/|]/).map(a => a.trim());
        areas.forEach(area => {
          if (area) {
            counts[area] = (counts[area] || 0) + 1;
          }
        });
      }

      // Count by neighborhoods
      if (story.neighborhoods) {
        const neighborhoods = story.neighborhoods.split(/[,;/|]/).map(n => n.trim());
        neighborhoods.forEach(neighborhood => {
          if (neighborhood) {
            counts[neighborhood] = (counts[neighborhood] || 0) + 1;
          }
        });
      }
    });

    return counts;
  }, [stories, isAnalyticsMode]);

  // Get max count for color scaling
  const maxCount = useMemo(() => {
    if (!isAnalyticsMode) return 0;
    return Math.max(...Object.values(regionStoryCounts), 1);
  }, [regionStoryCounts, isAnalyticsMode]);

  // Get color intensity based on story count
  const getRegionColor = (region, isHighlighted, storyCount) => {
    if (!isAnalyticsMode) {
      // Regular highlighting mode
      return isHighlighted ? 'rgba(59, 130, 246, 0.7)' : 'rgba(156, 163, 175, 0.3)';
    }

    // Analytics mode - color by story count
    if (storyCount === 0) return 'rgba(156, 163, 175, 0.2)';

    const intensity = storyCount / maxCount;
    const blue = Math.floor(59 + (196 - 59) * (1 - intensity));
    const green = Math.floor(130 + (125 - 130) * (1 - intensity));
    const red = Math.floor(246 + (9 - 246) * (1 - intensity));

    return `rgba(${red}, ${green}, ${blue}, ${0.3 + intensity * 0.7})`;
  };

  // Define Pittsburgh regions with x coordinates compressed for actual map bounds
  const pittsburghRegions = [
    {
      name: 'North Side',
      x: '42%',
      y: '25%',
      areas: ['North Side'],
      neighborhoods: ['Brighton Heights', 'Perry North', 'Perry South', 'Manchester', 'Chateau', 'Allegheny Center', 'East Allegheny', 'Central Northside', 'Troy Hill', 'Spring Garden']
    },
    {
      name: 'Central Pittsburgh',
      x: '50%',
      y: '52%',
      areas: ['Central Pittsburgh'],
      neighborhoods: ['Downtown', 'Strip District', 'Golden Triangle']
    },
    {
      name: 'Upper East End',
      x: '60%',
      y: '42%',
      areas: ['Upper East End'],
      neighborhoods: ['Shadyside', 'Squirrel Hill North', 'Squirrel Hill South', 'Oakland', 'Highland Park', 'Morningside', 'East Liberty', 'Garfield', 'Friendship', 'Bloomfield']
    },
    {
      name: 'Lower East End',
      x: '62%',
      y: '65%',
      areas: ['Lower East End'],
      neighborhoods: ['Hazelwood', 'Point Breeze', 'Point Breeze North', 'Homewood', 'East Hills', 'Larimer', 'Swissvale']
    },
    {
      name: 'South Pittsburgh',
      x: '48%',
      y: '72%',
      areas: ['South Pittsburgh'],
      neighborhoods: ['South Side', 'South Side Flats', 'South Side Slopes', 'Mount Washington', 'Carrick', 'Allentown', 'Brookline', 'Beechview', 'Dormont']
    },
    {
      name: 'Hill District',
      x: '54%',
      y: '55%',
      areas: ['Hill District'],
      neighborhoods: ['Hill District', 'Crawford-Roberts', 'Middle Hill', 'Upper Hill']
    },
    {
      name: 'West End',
      x: '38%',
      y: '52%',
      areas: ['West End'],
      neighborhoods: ['Sheraden', 'Elliott', 'Westwood', 'Esplen', 'McKees Rocks']
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span>Pittsburgh, PA {isAnalyticsMode ? 'Story Coverage' : 'Neighborhoods'}</span>
        </h3>
        <div className="text-sm text-gray-500">
          {isAnalyticsMode
            ? `${Object.keys(regionStoryCounts).length} regions with stories`
            : (highlightedAreas.length > 0 ? `Highlighting: ${highlightedAreas.join(', ')}` : 'Interactive Geographic Map')
          }
        </div>
      </div>

      <div className="relative w-full">
        {/* Base Map Image */}
        <div className="relative">
          <img
            src="/pittsburgh-neighborhoods-detailed.jpg"
            alt="Pittsburgh Neighborhoods Map"
            className="w-full h-auto rounded-xl shadow-lg border border-gray-200"
            style={{ maxHeight: '600px', objectFit: 'contain' }}
            onLoad={() => console.log('Map image loaded successfully')}
            onError={(e) => console.error('Map image failed to load:', e)}
          />
        </div>

        {/* Interactive Overlays */}
        <div className="absolute inset-0 rounded-xl">
          {pittsburghRegions.map((region) => {
            const isHighlighted = highlightedAreas.some(area => {
              // Check if any of the highlighted areas match this region's areas or neighborhoods
              const normalizedArea = area.toLowerCase();
              return region.areas.some(regionArea =>
                regionArea.toLowerCase().includes(normalizedArea) ||
                normalizedArea.includes(regionArea.toLowerCase())
              ) || region.neighborhoods.some(neighborhood =>
                neighborhood.toLowerCase().includes(normalizedArea) ||
                normalizedArea.includes(neighborhood.toLowerCase())
              );
            });

            const storyCount = isAnalyticsMode ?
              [...region.areas, ...region.neighborhoods].reduce((sum, area) => sum + (regionStoryCounts[area] || 0), 0) : 0;

            return (
              <div
                key={region.name}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                  isHighlighted || hoveredRegion === region.name ? 'scale-110 z-10' : 'z-0'
                }`}
                style={{
                  left: region.x,
                  top: region.y,
                  width: '60px',
                  height: '60px'
                }}
                onMouseEnter={() => setHoveredRegion(region.name)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {/* Region Circle */}
                <div
                  className="w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-semibold text-xs transition-all duration-300"
                  style={{
                    backgroundColor: getRegionColor(region, isHighlighted, storyCount),
                    borderColor: isHighlighted || hoveredRegion === region.name ? '#3B82F6' : '#fff'
                  }}
                >
                  {isAnalyticsMode && storyCount > 0 ? storyCount : ''}
                </div>

                {/* Region Label */}
                <div className={`absolute top-full mt-1 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
                  hoveredRegion === region.name || isHighlighted ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                    {region.name}
                    {isAnalyticsMode && storyCount > 0 && (
                      <div className="text-gray-300">{storyCount} stories</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend for Analytics Mode */}
        {isAnalyticsMode && maxCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
            <div className="text-xs font-semibold text-gray-900 mb-2">Story Count</div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">0</span>
              <div className="flex space-x-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">{maxCount}</span>
            </div>
          </div>
        )}

        {/* Highlight Indicator */}
        {!isAnalyticsMode && highlightedAreas.length > 0 && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
            {highlightedAreas.length} area{highlightedAreas.length > 1 ? 's' : ''} highlighted
          </div>
        )}
      </div>
    </div>
  );
};

export default PittsburghMap;