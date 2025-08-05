import React from 'react';
import { MapPin, Building, Home, TreePine, Waves, Mountain, Users } from 'lucide-react';

const PittsburghMap = () => {
  // 更新为7个地理区域
  const geographicAreas = [
    { name: "Central Pittsburgh", x: 48, y: 58, type: "business", color: "bg-blue-600" },
    { name: "North Side", x: 45, y: 45, type: "sports", color: "bg-yellow-500" },
    { name: "South Pittsburgh", x: 50, y: 75, type: "entertainment", color: "bg-red-500" },
    { name: "Hill District", x: 60, y: 58, type: "residential", color: "bg-purple-500" },
    { name: "Lower East End", x: 65, y: 42, type: "arts", color: "bg-orange-500" },
    { name: "Upper East End", x: 78, y: 50, type: "education", color: "bg-green-500" },
    { name: "West End", x: 30, y: 65, type: "residential", color: "bg-purple-500" },
  ];

  // 在河流数据中直接使用颜色值
  const rivers = [
    { path: "M20,45 Q35,40 50,45 Q65,50 85,35", color: "#60a5fa" }, // Allegheny
    { path: "M20,70 Q35,65 50,70 Q65,75 85,65", color: "#60a5fa" }, // Monongahela
    { path: "M15,55 Q25,50 35,55 Q45,60 50,55", color: "#3b82f6" }, // Ohio
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'business': return <Building className="h-4 w-4 text-white" />;
      case 'education': return <Home className="h-4 w-4 text-white" />;
      case 'residential': return <Users className="h-4 w-4 text-white" />;
      case 'arts': return <TreePine className="h-4 w-4 text-white" />;
      case 'entertainment': return <Waves className="h-4 w-4 text-white" />;
      case 'sports': return <Mountain className="h-4 w-4 text-white" />;
      default: return <MapPin className="h-4 w-4 text-white" />;
    }
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
        {/* Rivers - 使用内联样式确保显示 */}
        <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          {rivers.map((river, index) => (
            <path
              key={index}
              d={river.path}
              style={{
                fill: 'transparent',
                stroke: river.color,
                strokeWidth: 20,
                opacity: 0.7
              }}
            />
          ))}
        </svg>

        {/* Geographic Areas - 修复z-index和样式问题 */}
        {geographicAreas.map((area, index) => (
          <div
            key={index}
            className="absolute z-10 group cursor-pointer animate-scale-in"
            style={{ 
              left: `${area.x}%`, 
              top: `${area.y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${index * 100}ms`
            }}
          >
            <div 
              className={`${area.color} rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 hover-lift`}
            >
              {getIcon(area.type)}
            </div>
            
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
              <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {area.name}
              </div>
            </div>
          </div>
        ))}

        {/* 图例 (Key Areas / Legend) */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg z-10 animate-slide-in-bottom">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">Key Areas</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Business</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Education</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Residential</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Arts & Culture</span>
            </div>
          </div>
        </div>

        {/* 罗盘 (Compass) */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-2 shadow-lg z-10 animate-slide-in-top">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-400 rounded-full relative">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-red-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">N</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg hover-lift">
          <div className="text-lg font-bold text-gray-900">{geographicAreas.length}</div>
          <div className="text-xs text-gray-600">Geographic Areas</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg hover-lift">
          <div className="text-lg font-bold text-gray-900">3</div>
          <div className="text-xs text-gray-600">Rivers</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg hover-lift">
          <div className="text-lg font-bold text-gray-900">302k</div>
          <div className="text-xs text-gray-600">Population</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg hover-lift">
          <div className="text-lg font-bold text-gray-900">58.3</div>
          <div className="text-xs text-gray-600">sq mi</div>
        </div>
      </div>
    </div>
  );
};

export default PittsburghMap;
