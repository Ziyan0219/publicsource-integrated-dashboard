import React, { useState } from 'react';
import { MapPin, Building, Home, GraduationCap, Palette, Users, Briefcase } from 'lucide-react';

const PittsburghMap = ({ highlightedAreas = [] }) => {
  const [hoveredArea, setHoveredArea] = useState(null);
  
  // 检查区域是否应该被高亮 - 增强匹配逻辑
  const isAreaHighlighted = (areaName) => {
    if (!highlightedAreas || highlightedAreas.length === 0) return false;
    
    console.log('Checking highlight for:', areaName, 'against:', highlightedAreas);
    
    return highlightedAreas.some(highlighted => {
      const highlightedLower = highlighted.toLowerCase().trim();
      const areaNameLower = areaName.toLowerCase().trim();
      
      // 精确匹配
      if (highlightedLower === areaNameLower) return true;
      
      // 部分匹配
      if (highlightedLower.includes(areaNameLower) || areaNameLower.includes(highlightedLower)) return true;
      
      // 特殊匹配规则
      if (highlighted === 'Central Pittsburgh' && areaName === 'Downtown') return true;
      if (highlighted === 'Upper East End' && areaName === 'Oakland') return true;
      if (highlighted === 'South Pittsburgh' && areaName === 'South Side') return true;
      
      return false;
    });
  };

  // 精确计算SVG路径的几何中心点
  const geographicAreas = [
    { name: "Central Pittsburgh", x: 44, y: 50, type: "business", color: "amber", description: "Downtown - Business District" },
    { name: "North Side", x: 40, y: 25, type: "sports", color: "blue", description: "Heinz Field & PNC Park" },
    { name: "South Pittsburgh", x: 42, y: 79, type: "entertainment", color: "purple", description: "South Side & Carson Street" },
    { name: "Upper East End", x: 66, y: 67, type: "education", color: "green", description: "Oakland - Pitt & CMU" },
    { name: "Lower East End", x: 67.5, y: 36, type: "arts", color: "pink", description: "Lawrenceville & Strip District" },
    { name: "Hill District", x: 58, y: 56.5, type: "residential", color: "violet", description: "Historic Hill District" },
    { name: "West End", x: 23, y: 63, type: "residential", color: "indigo", description: "West End Neighborhoods" },
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

  // Pittsburgh各区域的实际轮廓 - 重新调整形状更匹配图标位置
  const neighborhoods = [
    {
      name: "Central Pittsburgh",
      path: "M50,45 L42,38 Q40,42 38,50 Q40,58 46,62 L50,55 Z",
      color: "rgba(251, 191, 36, 0.2)",
      stroke: "#f59e0b"
    },
    {
      name: "North Side",
      path: "M28,15 L52,15 L52,35 Q40,30 28,25 Z",
      color: "rgba(59, 130, 246, 0.15)",
      stroke: "#3b82f6"
    },
    {
      name: "South Pittsburgh",
      path: "M32,68 L52,68 L62,85 L42,90 L22,85 Q27,76 32,68 Z",
      color: "rgba(147, 51, 234, 0.15)",
      stroke: "#9333ea"
    },
    {
      name: "Upper East End",
      path: "M55,55 L72,52 L82,68 L72,82 L55,79 Q50,67 55,55 Z",
      color: "rgba(16, 185, 129, 0.15)",
      stroke: "#10b981"
    },
    {
      name: "Lower East End",
      path: "M55,25 L75,25 L85,42 L75,47 L55,44 Q50,35 55,25 Z",
      color: "rgba(236, 72, 153, 0.15)",
      stroke: "#ec4899"
    },
    {
      name: "Hill District",
      path: "M52,48 L68,45 L68,62 L58,68 L52,62 Q48,55 52,48 Z",
      color: "rgba(168, 85, 247, 0.15)",
      stroke: "#a855f7"
    },
    {
      name: "West End",
      path: "M12,52 L32,48 L38,65 L28,78 L12,75 Q8,63 12,52 Z",
      color: "rgba(99, 102, 241, 0.15)",
      stroke: "#6366f1"
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
      pink: isHovered ? 'bg-pink-600 border-pink-400' : 'bg-pink-500 border-pink-300',
      indigo: isHovered ? 'bg-indigo-600 border-indigo-400' : 'bg-indigo-500 border-indigo-300',
      violet: isHovered ? 'bg-violet-600 border-violet-400' : 'bg-violet-500 border-violet-300',
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 animate-fade-in">
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
      <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden" style={{ height: '500px', minHeight: '450px' }}>
        {/* Pittsburgh Real Geography */}
        <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Neighborhood Areas */}
          {neighborhoods.map((area, index) => {
            const isHighlighted = isAreaHighlighted(area.name);
            return (
              <path
                key={`area-${index}`}
                d={area.path}
                fill={isHighlighted ? area.color.replace('0.15', '0.4').replace('0.2', '0.5') : area.color}
                stroke={area.stroke}
                strokeWidth={isHighlighted ? "1.5" : "0.5"}
                opacity={isHighlighted ? "1" : "0.7"}
                className={`transition-all duration-300 hover:opacity-90 ${
                  isHighlighted ? 'animate-pulse' : ''
                }`}
              />
            );
          })}
          
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
                getColorClasses(area.color, hoveredArea?.name === area.name || isAreaHighlighted(area.name))
              } rounded-xl p-2 border-2 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110 ${
                isAreaHighlighted(area.name) ? 'ring-2 ring-offset-1 ring-slate-400 animate-pulse' : ''
              }`}
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
          <div className="text-xs text-slate-500">Areas</div>
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
