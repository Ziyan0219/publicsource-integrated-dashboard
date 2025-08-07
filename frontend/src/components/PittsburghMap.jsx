import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PittsburghMap = ({ highlightedAreas = [] }) => {
  const [hoveredArea, setHoveredArea] = useState(null);
  
  // Enhanced area matching based on geographic areas
  const isAreaHighlighted = (areaName) => {
    if (!highlightedAreas || highlightedAreas.length === 0) return false;
    
    return highlightedAreas.some(highlighted => {
      const highlightedLower = highlighted.toLowerCase().trim();
      const areaNameLower = areaName.toLowerCase().trim();
      
      // Direct matching for geographic areas
      if (highlightedLower === areaNameLower) return true;
      
      // Enhanced mapping for Pittsburgh geographic areas
      const areaMapping = {
        'central pittsburgh': ['downtown', 'central business district', 'cbd', 'golden triangle'],
        'north side': ['northside', 'north shore', 'allegheny'],
        'south pittsburgh': ['south side', 'southside'],
        'upper east end': ['oakland', 'shadyside', 'squirrel hill'],
        'lower east end': ['lawrenceville', 'strip district', 'polish hill'],
        'hill district': ['hill', 'the hill'],
        'west end': ['west pittsburgh', 'western neighborhoods']
      };
      
      const mappedAreas = areaMapping[areaNameLower] || [];
      if (mappedAreas.includes(highlightedLower)) return true;
      
      const highlightedMapped = areaMapping[highlightedLower] || [];
      if (highlightedMapped.includes(areaNameLower)) return true;
      
      return false;
    });
  };

  // Pittsburgh geographic areas with clean definitions
  const geographicAreas = [
    {
      id: 'central-pittsburgh',
      name: 'Central Pittsburgh',
      path: 'M45,45 L55,45 L57,55 L52,60 L47,60 L42,55 Z',
      color: '#F59E0B',
      hoverColor: '#D97706'
    },
    {
      id: 'north-side',
      name: 'North Side',
      path: 'M25,15 L60,15 L65,35 L55,40 L40,38 L25,30 Z',
      color: '#3B82F6',
      hoverColor: '#2563EB'
    },
    {
      id: 'south-pittsburgh',
      name: 'South Pittsburgh',
      path: 'M30,65 L65,65 L68,85 L50,90 L32,88 L25,75 Z',
      color: '#8B5CF6',
      hoverColor: '#7C3AED'
    },
    {
      id: 'upper-east-end',
      name: 'Upper East End',
      path: 'M60,40 L85,38 L88,65 L80,75 L65,78 L58,60 Z',
      color: '#10B981',
      hoverColor: '#059669'
    },
    {
      id: 'lower-east-end',
      name: 'Lower East End',
      path: 'M60,20 L85,18 L90,35 L85,42 L65,45 L58,30 Z',
      color: '#EC4899',
      hoverColor: '#DB2777'
    },
    {
      id: 'hill-district',
      name: 'Hill District',
      path: 'M55,35 L75,32 L78,45 L75,58 L60,62 L50,50 Z',
      color: '#A855F7',
      hoverColor: '#9333EA'
    },
    {
      id: 'west-end',
      name: 'West End',
      path: 'M12,40 L40,38 L45,58 L40,75 L20,78 L10,60 Z',
      color: '#6366F1',
      hoverColor: '#4F46E5'
    }
  ];

  // Simplified rivers for Pittsburgh's three rivers
  const rivers = [
    {
      name: 'Allegheny River',
      path: 'M15,25 Q35,30 50,45',
      color: '#2563EB'
    },
    {
      name: 'Monongahela River',
      path: 'M20,80 Q40,70 50,45',
      color: '#1D4ED8'
    },
    {
      name: 'Ohio River',
      path: 'M50,45 Q65,48 85,50',
      color: '#1E40AF'
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Pittsburgh Map
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 h-96">
          {/* SVG Map */}
          <svg 
            className="w-full h-full" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Geographic Areas */}
            {geographicAreas.map((area) => {
              const isHovered = hoveredArea?.id === area.id;
              const isHighlighted = isAreaHighlighted(area.name);
              
              return (
                <path
                  key={area.id}
                  d={area.path}
                  fill={isHighlighted || isHovered ? area.hoverColor : area.color}
                  fillOpacity={isHighlighted ? "0.8" : "0.6"}
                  stroke={isHighlighted || isHovered ? area.hoverColor : area.color}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    transform: isHighlighted || isHovered ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                    filter: isHighlighted ? 'url(#glow)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredArea(area)}
                  onMouseLeave={() => setHoveredArea(null)}
                />
              );
            })}

            {/* Rivers */}
            {rivers.map((river, index) => (
              <path
                key={index}
                d={river.path}
                fill="none"
                stroke={river.color}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.7"
              />
            ))}

            {/* Three Rivers Point */}
            <circle
              cx="50"
              cy="45"
              r="2"
              fill="#1E40AF"
              stroke="white"
              strokeWidth="1"
            />
          </svg>

          {/* Floating Legend */}
          <div 
            className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10 transition-all duration-200 hover:scale-105"
            style={{
              animation: hoveredArea ? 'bounce 0.6s ease-in-out' : 'none'
            }}
          >
            <h4 className="text-sm font-semibold mb-2 text-gray-800">Geographic Areas</h4>
            <div className="space-y-1">
              {geographicAreas.map((area) => {
                const isAreaActive = isAreaHighlighted(area.name) || hoveredArea?.id === area.id;
                return (
                  <div 
                    key={area.id} 
                    className={`flex items-center gap-2 text-xs transition-all duration-200 ${
                      isAreaActive ? 'font-semibold text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: isAreaActive ? area.hoverColor : area.color }}
                    />
                    <span>{area.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Highlighted Areas Indicator */}
          {highlightedAreas.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse">
              <div className="text-sm font-medium">
                {highlightedAreas.length} area{highlightedAreas.length > 1 ? 's' : ''} highlighted
              </div>
            </div>
          )}

          {/* Area Info Tooltip */}
          {hoveredArea && (
            <div 
              className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl z-20 pointer-events-none"
              style={{
                left: '50%',
                bottom: '20px',
                transform: 'translateX(-50%)'
              }}
            >
              <div className="text-sm font-semibold">{hoveredArea.name}</div>
              <div className="text-xs opacity-75">Click to filter stories</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PittsburghMap;