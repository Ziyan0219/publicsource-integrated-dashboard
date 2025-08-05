import React, { useState } from 'react';
import { MapPin, Building, Home, GraduationCap, Palette, Users, Briefcase } from 'lucide-react';

const PittsburghMap = () => {
  const [hoveredArea, setHoveredArea] = useState(null);

  // 精确对应Pittsburgh实际地理位置的区域
  const geographicAreas = [
    { name: "Downtown", x: 47, y: 50, type: "business", color: "amber", description: "Golden Triangle - Business District" },
    { name: "North Side", x: 40, y: 25, type: "sports", color: "blue", description: "Heinz Field & PNC Park" },
    { name: "South Side", x: 48, y: 78, type: "entertainment", color: "purple", description: "Carson Street Nightlife" },
    { name: "Oakland", x: 68, y: 68, type: "education", color: "green", description: "Pitt & CMU Campus" },
    { name: "Lawrenceville", x: 65, y: 35, type: "arts", color: "orange", description: "Trendy Arts District" },
    { name: "Shadyside", x: 75, y: 55, type: "residential", color: "pink", description: "Upscale Shopping" },
    { name: "West End", x: 25, y: 65, type: "residential", color: "indigo", description: "Historic Neighborhoods" },
  ];

  // Pittsburgh三河汇合的真实地形
  const rivers = [
    { 
      name: "Allegheny River",
      path: "M10,15 Q20,20 30,25 Q40,30 45,35 Q48,40 50,45", 
      color: "#3b82f6",
      width: "3"
    },
    { 
      name: "Monongahela River",
      path: "M15,85 Q25,80 35,75 Q42,70 48,65 Q49,55 50,45", 
      color: "#1d4ed8",
      width: "3"
    },
    { 
      name: "Ohio River",
      path: "M50,45 Q60,48 70,50 Q80,52 90,55", 
      color: "#1e40af",
      width: "4"
    },
  ];

  // Pittsburgh各区域的实际轮廓
  const neighborhoods = [
    {
      name: "Golden Triangle",
      path: "M50,45 L45,35 Q42,40 40,50 Q42,60 48,65 Z",
      color: "rgba(251, 191, 36, 0.2)",
      stroke: "#f59e0b"
    },
    {
      name: "North Side",
      path: "M30,15 L50,15 L50,35 Q40,30 30,25 Z",
      color: "rgba(59, 130, 246, 0.15)",
      stroke: "#3b82f6"
    },
    {
      name: "South Side",
      path: "M35,65 L50,75 L60,85 L40,90 L25,85 Q30,75 35,65 Z",
      color: "rgba(147, 51, 234, 0.15)",
      stroke: "#9333ea"
    },
    {
      name: "Oakland",
      path: "M55,55 L70,50 L80,65 L70,80 L55,75 Q50,65 55,55 Z",
      color: "rgba(16, 185, 129, 0.15)",
      stroke: "#10b981"
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'business': return <Briefcase className="h-3 w-3 text-white" />;
      case 'education': return <GraduationCap className="h-3 w-3 text-white" />;
      case 'residential': return <Home className="h-3 w-3 text-white" />;
      case 'arts': return <Palette className="h-3 w-3 text-white" />;
      case 'entertainment': return <Users className="h-3 w-3 text-white" />;
      case 'sports': return <Building className="h-3 w-3 text-white" />;
      default: return <MapPin className="h-3 w-3 text-white" />;
    }
  };

  const getColorClasses = (color, isHovered = false) => {
    const colors = {
      amber: isHovered ? 'bg-amber-600 border-amber-400' : 'bg-amber-500 border-amber-300',
      blue: isHovered ? 'bg-blue-600 border-blue-400' : 'bg-blue-500 border-blue-300',
      purple: isHovered ? 'bg-purple-600 border-purple-400' : 'bg-purple-500 border-purple-300',
      green: isHovered ? 'bg-emerald-600 border-emerald-400' : 'bg-emerald-500 border-emerald-300',
      orange: isHovered ? 'bg-orange-600 border-orange-400' : 'bg-orange-500 border-orange-300',
      pink: isHovered ? 'bg-pink-600 border-pink-400' : 'bg-pink-500 border-pink-300',
      indigo: isHovered ? 'bg-indigo-600 border-indigo-400' : 'bg-indigo-500 border-indigo-300',
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          <span>Pittsburgh, PA Overview</span>
        </h3>
        <div className="text-sm text-gray-500">
          Interactive Geographic Area Map
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        {/* Pittsburgh Real Geography */}
        <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Neighborhood Areas */}
          {neighborhoods.map((area, index) => (
            <path
              key={`area-${index}`}
              d={area.path}
              fill={area.color}
              stroke={area.stroke}
              strokeWidth="0.5"
              opacity="0.7"
              className="transition-opacity duration-300 hover:opacity-90"
            />
          ))}
          
          {/* Rivers - Pittsburgh's defining feature */}
          {rivers.map((river, index) => (
            <g key={`river-${index}`}>
              {/* River shadow */}
              <path
                d={river.path}
                fill="none"
                stroke="rgba(0, 0, 0, 0.1)"
                strokeWidth={`${parseFloat(river.width) + 1}`}
                strokeLinecap="round"
                transform="translate(0.5, 0.5)"
              />
              {/* Main river */}
              <path
                d={river.path}
                fill="none"
                stroke={river.color}
                strokeWidth={river.width}
                strokeLinecap="round"
                opacity="0.9"
                className="drop-shadow-sm"
              />
              {/* River highlight */}
              <path
                d={river.path}
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          ))}
          
          {/* Point of Rivers Convergence */}
          <circle
            cx="50"
            cy="45"
            r="1.5"
            fill="#1e40af"
            opacity="0.8"
            className="animate-pulse"
          />
          <circle
            cx="50"
            cy="45"
            r="0.8"
            fill="white"
            opacity="0.9"
          />
        </svg>

        {/* Geographic Areas */}
        {geographicAreas.map((area, index) => (
          <div
            key={index}
            className="absolute z-20 cursor-pointer animate-scale-in"
            style={{ 
              left: `${area.x}%`, 
              top: `${area.y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${index * 80}ms`
            }}
            onMouseEnter={() => setHoveredArea(area)}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <div 
              className={`${
                getColorClasses(area.color, hoveredArea?.name === area.name)
              } rounded-xl p-2 border-2 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110`}
            >
              {getIcon(area.type)}
            </div>
            
            {/* Tooltip */}
            {hoveredArea?.name === area.name && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                  <div className="font-semibold">{area.name}</div>
                  <div className="text-slate-300 text-xs">{area.description}</div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-gray-200/60 z-15 animate-slide-in-bottom">
          <h4 className="font-medium text-slate-700 mb-2 text-xs">Districts</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
              <span className="text-slate-600">Downtown</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div>
              <span className="text-slate-600">Education</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
              <span className="text-slate-600">Arts</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-purple-500 rounded-sm"></div>
              <span className="text-slate-600">Entertainment</span>
            </div>
          </div>
        </div>

        {/* Compass */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-gray-200/60 z-15 animate-slide-in-top">
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border border-slate-300 rounded-full relative bg-white">
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l border-r border-b-2 border-transparent border-b-red-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">N</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-slate-50/60 rounded-xl border border-gray-200/40 hover:bg-slate-50 transition-colors duration-200">
          <div className="text-base font-semibold text-slate-900">{geographicAreas.length}</div>
          <div className="text-xs text-slate-500">Districts</div>
        </div>
        <div className="text-center p-3 bg-slate-50/60 rounded-xl border border-gray-200/40 hover:bg-slate-50 transition-colors duration-200">
          <div className="text-base font-semibold text-slate-900">3</div>
          <div className="text-xs text-slate-500">Rivers</div>
        </div>
        <div className="text-center p-3 bg-slate-50/60 rounded-xl border border-gray-200/40 hover:bg-slate-50 transition-colors duration-200">
          <div className="text-base font-semibold text-slate-900">302k</div>
          <div className="text-xs text-slate-500">Population</div>
        </div>
        <div className="text-center p-3 bg-slate-50/60 rounded-xl border border-gray-200/40 hover:bg-slate-50 transition-colors duration-200">
          <div className="text-base font-semibold text-slate-900">58.3</div>
          <div className="text-xs text-slate-500">sq mi</div>
        </div>
      </div>
    </div>
  );
};

export default PittsburghMap;
