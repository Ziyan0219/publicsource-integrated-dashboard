import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';

/**
 * Allegheny County Map Component
 * Displays an interactive map of Allegheny County's 8 official sub-regions
 * with overlay polygons for precise highlighting
 */
const AlleghenyCountyMap = ({ highlightedAreas = [], stories = [], isAnalyticsMode = false, onRegionClick }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Official 8 Allegheny County Sub-Regions with approximate polygon coordinates
  // Based on the PNG map dimensions and municipality locations
  const countyRegions = [
    {
      id: 'north-hills',
      name: 'North Hills',
      // North Hills: McCandless, Ross, Shaler, Hampton, Pine, Richland, etc.
      path: 'M 200,80 L 350,40 L 480,60 L 520,120 L 480,180 L 400,200 L 320,190 L 240,160 L 200,120 Z',
      labelX: 360,
      labelY: 120,
      municipalities: ['ASPINWALL', 'BLAWNOX', 'BRADFORD WOODS', 'ETNA', 'FOX CHAPEL', 'FRANKLIN PARK',
                       'HAMPTON', 'INDIANA', 'MARSHALL', 'MCCANDLESS', 'MILLVALE', 'O\'HARA', 'PINE',
                       'RESERVE', 'RICHLAND', 'ROSS', 'SHALER', 'SHARPSBURG', 'WEST DEER', 'WEST VIEW']
    },
    {
      id: 'northwest-suburbs',
      name: 'Northwest suburbs',
      // Northwest suburbs: Sewickley, Ohio Township, Quaker Valley area
      path: 'M 40,100 L 150,60 L 200,80 L 200,120 L 180,180 L 140,220 L 80,200 L 40,160 Z',
      labelX: 120,
      labelY: 140,
      municipalities: ['ALEPPO', 'AVALON', 'BELL ACRES', 'BELLEVUE', 'BEN AVON', 'BEN AVON HEIGHTS',
                       'EDGEWORTH', 'EMSWORTH', 'GLENFIELD', 'GLEN OSBORNE', 'HAYSVILLE', 'KILBUCK',
                       'LEET', 'LEETSDALE', 'OHIO', 'SEWICKLEY', 'SEWICKLEY HEIGHTS', 'SEWICKLEY HILLS']
    },
    {
      id: 'ohio-river-valley',
      name: 'Ohio River Valley',
      // Ohio River Valley: Coraopolis, McKees Rocks, Stowe, Neville
      path: 'M 80,200 L 140,220 L 180,280 L 160,340 L 100,360 L 60,320 L 40,260 Z',
      labelX: 110,
      labelY: 280,
      municipalities: ['CORAOPOLIS', 'MCKEES ROCKS', 'NEVILLE', 'STOWE']
    },
    {
      id: 'west-suburbs',
      name: 'West suburbs',
      // West suburbs: Moon, Robinson, North Fayette, South Fayette, etc.
      path: 'M 40,340 L 100,360 L 160,340 L 200,380 L 200,480 L 140,520 L 60,500 L 20,420 Z',
      labelX: 110,
      labelY: 420,
      municipalities: ['BRIDGEVILLE', 'CARNEGIE', 'COLLIER', 'CRAFTON', 'CRESCENT', 'FINDLAY',
                       'GREEN TREE', 'HEIDELBERG', 'INGRAM', 'KENNEDY', 'MCDONALD', 'MOON',
                       'NORTH FAYETTE', 'OAKDALE', 'PENNSBURY VILLAGE', 'ROBINSON', 'ROSSLYN FARMS',
                       'SCOTT', 'SOUTH FAYETTE', 'THORNBURG']
    },
    {
      id: 'south-hills',
      name: 'South Hills',
      // South Hills: Mount Lebanon, Bethel Park, Upper St. Clair, etc.
      path: 'M 200,380 L 280,360 L 340,400 L 360,480 L 320,540 L 240,560 L 180,520 L 200,480 Z',
      labelX: 270,
      labelY: 460,
      municipalities: ['BALDWIN', 'BETHEL PARK', 'BRENTWOOD', 'CASTLE SHANNON', 'DORMONT',
                       'JEFFERSON HILLS', 'MOUNT LEBANON', 'MOUNT OLIVER', 'PLEASANT HILLS',
                       'SOUTH PARK', 'UPPER ST. CLAIR', 'WHITEHALL']
    },
    {
      id: 'mon-valley',
      name: 'Mon Valley',
      // Mon Valley: McKeesport, Homestead, Braddock, Clairton, etc.
      path: 'M 340,300 L 440,280 L 520,320 L 560,400 L 540,480 L 480,540 L 400,560 L 340,520 L 340,400 Z',
      labelX: 440,
      labelY: 420,
      municipalities: ['BRADDOCK', 'BRADDOCK HILLS', 'CHALFANT', 'CHURCHILL', 'CLAIRTON', 'DRAVOSBURG',
                       'DUQUESNE', 'EAST MCKEESPORT', 'EAST PITTSBURGH', 'ELIZABETH', 'FOREST HILLS',
                       'FORWARD', 'GLASSPORT', 'HOMESTEAD', 'LIBERTY', 'LINCOLN', 'MCKEESPORT',
                       'MUNHALL', 'NORTH BRADDOCK', 'NORTH VERSAILLES', 'PITCAIRN', 'PORT VUE',
                       'RANKIN', 'SOUTH VERSAILLES', 'SWISSVALE', 'TURTLE CREEK', 'VERSAILLES',
                       'WALL', 'WEST ELIZABETH', 'WEST HOMESTEAD', 'WEST MIFFLIN', 'WHITAKER',
                       'WHITE OAK', 'WILKINS', 'WILMERDING']
    },
    {
      id: 'east-suburbs',
      name: 'East suburbs',
      // East suburbs: Monroeville, Penn Hills, Plum, Wilkinsburg, etc.
      path: 'M 440,180 L 560,160 L 620,200 L 640,280 L 600,340 L 520,320 L 440,280 L 420,220 Z',
      labelX: 530,
      labelY: 250,
      municipalities: ['EDGEWOOD', 'MONROEVILLE', 'OAKMONT', 'PENN HILLS', 'PLUM', 'TRAFFORD',
                       'VERONA', 'WILKINSBURG']
    },
    {
      id: 'alle-kiski-valley',
      name: 'Alle-Kiski Valley',
      // Alle-Kiski Valley: Tarentum, Brackenridge, Harrison, Springdale, etc.
      path: 'M 520,40 L 640,20 L 700,80 L 700,160 L 660,200 L 600,180 L 540,120 Z',
      labelX: 620,
      labelY: 100,
      municipalities: ['BRACKENRIDGE', 'CHESWICK', 'EAST DEER', 'FAWN', 'FRAZER', 'HARMAR',
                       'HARRISON', 'SPRINGDALE', 'SPRINGDALE TOWNSHIP', 'TARENTUM']
    }
  ];

  // Calculate story counts by region
  const regionStoryCounts = useMemo(() => {
    if (!stories || stories.length === 0) return {};

    const counts = {};
    countyRegions.forEach(region => {
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

      countyRegions.forEach(region => {
        // Check if story's geographic_area matches this region
        if (areas.includes(region.name.toLowerCase())) {
          counts[region.name]++;
          return;
        }

        // Check if any of the story's neighborhoods/municipalities belong to this region
        const regionMunicipalities = region.municipalities.map(m => m.toLowerCase());
        if (neighborhoods.some(n => regionMunicipalities.includes(n))) {
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
      return isHighlighted ? 'rgba(34, 197, 94, 0.5)' : 'rgba(156, 163, 175, 0.15)';
    }

    if (storyCount === 0) return 'rgba(156, 163, 175, 0.1)';

    const intensity = storyCount / maxCount;
    return `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`;
  };

  // Check if region should be highlighted
  const isRegionHighlighted = (region) => {
    if (!highlightedAreas || highlightedAreas.length === 0) return false;

    const normalizedHighlights = highlightedAreas.map(a => a.toLowerCase());

    // Check region name
    if (normalizedHighlights.includes(region.name.toLowerCase())) return true;

    // Check municipalities
    return region.municipalities.some(m => normalizedHighlights.includes(m.toLowerCase()));
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-green-600" />
          <span>Allegheny County Regions</span>
        </h3>
        <div className="text-sm text-gray-500">
          {isAnalyticsMode
            ? `${Object.values(regionStoryCounts).filter(c => c > 0).length} regions with stories`
            : (highlightedAreas.length > 0 ? `Highlighting: ${highlightedAreas.slice(0, 2).join(', ')}${highlightedAreas.length > 2 ? '...' : ''}` : '8 County Regions')
          }
        </div>
      </div>

      <div className="relative w-full">
        {/* Background map image */}
        <img
          src="/allegheny-county-map.png"
          alt="Allegheny County Map"
          className="w-full h-auto rounded-xl opacity-40"
          style={{ maxHeight: '500px', objectFit: 'contain' }}
        />

        {/* SVG Overlay for interactive regions */}
        <svg
          viewBox="0 0 700 600"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Region polygons */}
          {countyRegions.map((region) => {
            const isHighlighted = isRegionHighlighted(region);
            const isHovered = hoveredRegion === region.id;
            const storyCount = regionStoryCounts[region.name] || 0;

            return (
              <g key={region.id}>
                <path
                  d={region.path}
                  fill={getRegionColor(region, isHighlighted || isHovered, storyCount)}
                  stroke={isHighlighted || isHovered ? '#16a34a' : '#94a3b8'}
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
                    fontSize: '11px',
                    fontWeight: isHighlighted || isHovered ? '700' : '500',
                    fill: isHighlighted || isHovered ? '#15803d' : '#374151',
                  }}
                >
                  {region.name}
                </text>

                {/* Story count badge in analytics mode */}
                {isAnalyticsMode && storyCount > 0 && (
                  <g>
                    <circle
                      cx={region.labelX}
                      cy={region.labelY + 16}
                      r="12"
                      fill="#16a34a"
                    />
                    <text
                      x={region.labelX}
                      y={region.labelY + 20}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {storyCount}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Pittsburgh city marker */}
          <g>
            <circle cx="320" cy="300" r="25" fill="rgba(59, 130, 246, 0.3)" stroke="#2563eb" strokeWidth="2" />
            <text x="320" y="305" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">
              Pittsburgh
            </text>
          </g>
        </svg>

        {/* Hover tooltip */}
        {hoveredRegion && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 border border-gray-200">
            <div className="font-semibold text-gray-900">
              {countyRegions.find(r => r.id === hoveredRegion)?.name}
            </div>
            <div className="text-sm text-gray-600">
              {countyRegions.find(r => r.id === hoveredRegion)?.municipalities.length} municipalities
            </div>
            {isAnalyticsMode && (
              <div className="text-sm text-green-600 font-medium">
                {regionStoryCounts[countyRegions.find(r => r.id === hoveredRegion)?.name] || 0} stories
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
                    style={{ backgroundColor: `rgba(34, 197, 94, ${0.2 + intensity * 0.6})` }}
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

export default AlleghenyCountyMap;
