import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';

/**
 * Pittsburgh Region Map Component
 * Displays an interactive map of Pittsburgh's 8 official city regions
 * with accurate boundary overlays for precise highlighting
 */
const PittsburghRegionMap = ({ highlightedAreas = [], stories = [], isAnalyticsMode = false, onRegionClick }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Official 8 Pittsburgh City Regions with SVG polygon coordinates
  // Coordinates are relative to the SVG viewBox (0 0 729 586) matching the background image
  const pittsburghRegions = [
    {
      id: 'north-side',
      name: 'North Side',
      // North Side covers: Brighton Heights, Perry North/South, Manchester, Chateau, Allegheny Center, etc.
      path: 'M 195,78 L 342,59 L 410,98 L 440,176 L 410,215 L 342,234 L 274,215 L 195,176 Z',
      labelX: 303,
      labelY: 146,
      neighborhoods: ['Allegheny Center', 'Allegheny West', 'Brighton Heights', 'California-Kirkbride',
                      'Central Northside', 'Chateau', 'East Allegheny', 'Fineview', 'Manchester',
                      'Marshall-Shadeland', 'North Shore', 'Northview Heights', 'Perry North',
                      'Perry South', 'Spring Garden', 'Spring Hill-City View', 'Summer Hill', 'Troy Hill']
    },
    {
      id: 'central-pittsburgh',
      name: 'Central Pittsburgh',
      // Central Pittsburgh covers: Downtown, Strip District, Lawrenceville, Polish Hill
      path: 'M 342,234 L 410,215 L 469,234 L 488,283 L 469,332 L 410,342 L 352,312 L 332,273 Z',
      labelX: 400,
      labelY: 278,
      neighborhoods: ['Central Business District', 'Central Lawrenceville', 'Lower Lawrenceville',
                      'Polish Hill', 'Strip District', 'Upper Lawrenceville']
    },
    {
      id: 'hill-district',
      name: 'Hill District',
      // Hill District covers: Crawford-Roberts, Middle Hill, Upper Hill, Bedford Dwellings, Terrace Village, Bluff
      path: 'M 352,312 L 410,342 L 430,390 L 391,420 L 332,400 L 313,352 Z',
      labelX: 366,
      labelY: 366,
      neighborhoods: ['Bedford Dwellings', 'Bluff', 'Crawford-Roberts', 'Middle Hill', 'Terrace Village', 'Upper Hill']
    },
    {
      id: 'upper-east-end',
      name: 'Upper East End',
      // Upper East End covers: Shadyside, East Liberty, Highland Park, Bloomfield, Garfield, Homewood, etc.
      path: 'M 469,234 L 566,195 L 635,234 L 664,312 L 625,371 L 547,352 L 488,332 L 469,283 Z',
      labelX: 557,
      labelY: 283,
      neighborhoods: ['Bloomfield', 'East Hills', 'East Liberty', 'Friendship', 'Garfield', 'Highland Park',
                      'Homewood North', 'Homewood South', 'Homewood West', 'Larimer', 'Lincoln-Lemington-Belmar',
                      'Morningside', 'Stanton Heights']
    },
    {
      id: 'lower-east-end',
      name: 'Lower East End',
      // Lower East End covers: Oakland, Squirrel Hill, Greenfield, Hazelwood, Point Breeze, etc.
      path: 'M 430,390 L 488,332 L 547,352 L 586,410 L 566,469 L 488,488 L 430,459 Z',
      labelX: 498,
      labelY: 410,
      neighborhoods: ['Central Oakland', 'Glen Hazel', 'Greenfield', 'Hazelwood', 'North Oakland',
                      'Point Breeze', 'Point Breeze North', 'Regent Square', 'Shadyside', 'South Oakland',
                      'Squirrel Hill North', 'Squirrel Hill South', 'Swisshelm Park', 'West Oakland']
    },
    {
      id: 'south-pittsburgh',
      name: 'South Pittsburgh',
      // South Pittsburgh covers: South Side, Mount Washington, Carrick, Brookline, Allentown, etc.
      path: 'M 274,390 L 332,400 L 391,420 L 430,459 L 410,527 L 332,547 L 254,508 L 234,439 Z',
      labelX: 332,
      labelY: 469,
      neighborhoods: ['Allentown', 'Arlington', 'Arlington Heights', 'Banksville', 'Beechview', 'Beltzhoover',
                      'Bon Air', 'Brookline', 'Carrick', 'Duquesne Heights', 'Knoxville', 'Mount Oliver',
                      'Mount Washington', 'Overbrook', 'South Shore', 'South Side Flats', 'South Side Slopes', 'St. Clair']
    },
    {
      id: 'southeast-pittsburgh',
      name: 'Southeast Pittsburgh',
      // Southeast Pittsburgh covers: Hays, Lincoln Place, New Homestead
      path: 'M 488,488 L 566,469 L 605,508 L 586,556 L 527,566 L 488,537 Z',
      labelX: 542,
      labelY: 517,
      neighborhoods: ['Hays', 'Lincoln Place', 'New Homestead']
    },
    {
      id: 'west-end',
      name: 'West End',
      // West End covers: Sheraden, Elliott, Westwood, Esplen, Crafton Heights, etc.
      path: 'M 117,195 L 195,176 L 274,215 L 274,312 L 274,390 L 234,439 L 156,410 L 98,332 L 98,254 Z',
      labelX: 186,
      labelY: 303,
      neighborhoods: ['Chartiers City', 'Crafton Heights', 'East Carnegie', 'Elliott', 'Esplen',
                      'Fairywood', 'Oakwood', 'Ridgemont', 'Sheraden', 'West End', 'Westwood', 'Windgap']
    }
  ];

  // Calculate story counts by region
  const regionStoryCounts = useMemo(() => {
    if (!stories || stories.length === 0) return {};

    const counts = {};
    pittsburghRegions.forEach(region => {
      counts[region.name] = 0;
    });

    stories.forEach(story => {
      const areas = (story.geographic_area || '').split(/[,;/|]/).map(a => a.trim().toLowerCase());

      // Handle neighborhoods that could be array or string
      let neighborhoodList = story.neighborhoods || '';
      if (Array.isArray(neighborhoodList)) {
        neighborhoodList = neighborhoodList.join(',');
      }
      const neighborhoods = neighborhoodList.split(/[,;/|]/).map(n => n.trim().toLowerCase());

      pittsburghRegions.forEach(region => {
        // Check if story's geographic_area matches this region
        if (areas.includes(region.name.toLowerCase())) {
          counts[region.name]++;
          return;
        }

        // Check if any of the story's neighborhoods belong to this region
        const regionNeighborhoods = region.neighborhoods.map(n => n.toLowerCase());
        if (neighborhoods.some(n => regionNeighborhoods.includes(n))) {
          counts[region.name]++;
        }
      });
    });

    return counts;
  }, [stories]);

  const maxCount = useMemo(() => {
    return Math.max(...Object.values(regionStoryCounts), 1);
  }, [regionStoryCounts]);

  // Get color based on story count or highlight status
  const getRegionColor = (region, isHighlighted, storyCount) => {
    if (!isAnalyticsMode) {
      return isHighlighted ? 'rgba(59, 130, 246, 0.6)' : 'rgba(156, 163, 175, 0.15)';
    }

    if (storyCount === 0) return 'rgba(156, 163, 175, 0.1)';

    const intensity = storyCount / maxCount;
    return `rgba(59, 130, 246, ${0.2 + intensity * 0.6})`;
  };

  // Check if region should be highlighted
  const isRegionHighlighted = (region) => {
    if (!highlightedAreas || highlightedAreas.length === 0) return false;

    const normalizedHighlights = highlightedAreas.map(a => a.toLowerCase());

    // Check region name
    if (normalizedHighlights.includes(region.name.toLowerCase())) return true;

    // Check neighborhoods
    return region.neighborhoods.some(n => normalizedHighlights.includes(n.toLowerCase()));
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span>Pittsburgh City Regions</span>
        </h3>
        <div className="text-sm text-gray-500">
          {isAnalyticsMode
            ? `${Object.values(regionStoryCounts).filter(c => c > 0).length} regions with stories`
            : (highlightedAreas.length > 0 ? `Highlighting: ${highlightedAreas.slice(0, 2).join(', ')}${highlightedAreas.length > 2 ? '...' : ''}` : '8 City Regions')
          }
        </div>
      </div>

      <div className="relative w-full">
        {/* Background map image */}
        <img
          src="/pittsburgh-neighborhoods.svg"
          alt="Pittsburgh Neighborhoods Map"
          className="w-full h-auto rounded-xl opacity-40"
          style={{ maxHeight: '500px', objectFit: 'contain' }}
        />

        {/* SVG Overlay for interactive regions */}
        <svg
          viewBox="0 0 729 586"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Region polygons */}
          {pittsburghRegions.map((region) => {
            const isHighlighted = isRegionHighlighted(region);
            const isHovered = hoveredRegion === region.id;
            const storyCount = regionStoryCounts[region.name] || 0;

            return (
              <g key={region.id}>
                <path
                  d={region.path}
                  fill={getRegionColor(region, isHighlighted || isHovered, storyCount)}
                  stroke={isHighlighted || isHovered ? '#2563eb' : '#94a3b8'}
                  strokeWidth={isHighlighted || isHovered ? 3 : 1.5}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => onRegionClick && onRegionClick(region.name)}
                />

                {/* Region label */}
                <text
                  x={region.labelX}
                  y={region.labelY}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  style={{
                    fontSize: '12px',
                    fontWeight: isHighlighted || isHovered ? '700' : '500',
                    fill: isHighlighted || isHovered ? '#1e40af' : '#374151',
                  }}
                >
                  {region.name}
                </text>

                {/* Story count badge in analytics mode */}
                {isAnalyticsMode && storyCount > 0 && (
                  <g>
                    <circle
                      cx={region.labelX}
                      cy={region.labelY + 18}
                      r="14"
                      fill="#2563eb"
                    />
                    <text
                      x={region.labelX}
                      y={region.labelY + 23}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {storyCount}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredRegion && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 border border-gray-200">
            <div className="font-semibold text-gray-900">
              {pittsburghRegions.find(r => r.id === hoveredRegion)?.name}
            </div>
            <div className="text-sm text-gray-600">
              {pittsburghRegions.find(r => r.id === hoveredRegion)?.neighborhoods.length} neighborhoods
            </div>
            {isAnalyticsMode && (
              <div className="text-sm text-blue-600 font-medium">
                {regionStoryCounts[pittsburghRegions.find(r => r.id === hoveredRegion)?.name] || 0} stories
              </div>
            )}
          </div>
        )}

        {/* Legend for Analytics Mode */}
        {isAnalyticsMode && maxCount > 0 && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
            <div className="text-xs font-semibold text-gray-900 mb-2">Story Count</div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">0</span>
              <div className="flex space-x-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: `rgba(59, 130, 246, ${0.2 + intensity * 0.6})` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">{maxCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PittsburghRegionMap;
