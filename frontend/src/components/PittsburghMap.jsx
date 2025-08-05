import React from 'react';
import { MapPin, Building, Home, TreePine, Waves, Mountain } from 'lucide-react';

const PittsburghMap = () => {
  // Pittsburgh neighborhoods and landmarks data
  const neighborhoods = [
    { name: "Downtown", x: 50, y: 60, type: "business", color: "bg-blue-500" },
    { name: "Oakland", x: 65, y: 55, type: "education", color: "bg-green-500" },
    { name: "Shadyside", x: 70, y: 45, type: "residential", color: "bg-purple-500" },
    { name: "Squirrel Hill", x: 75, y: 50, type: "residential", color: "bg-purple-500" },
    { name: "Lawrenceville", x: 60, y: 35, type: "arts", color: "bg-orange-500" },
    { name: "Strip District", x: 55, y: 45, type: "industrial", color: "bg-gray-500" },
    { name: "South Side", x: 45, y: 70, type: "entertainment", color: "bg-red-500" },
    { name: "North Shore", x: 45, y: 50, type: "sports", color: "bg-yellow-500" },
    { name: "East End", x: 80, y: 40, type: "residential", color: "bg-purple-500" },
    { name: "West End", x: 30, y: 65, type: "residential", color: "bg-purple-500" },
  ];

  const rivers = [
    // Allegheny River
    { path: "M20,45 Q35,40 50,45 Q65,50 85,35", color: "stroke-blue-400" },
    // Monongahela River  
    { path: "M20,70 Q35,65 50,70 Q65,75 85,65", color: "stroke-blue-400" },
    // Ohio River (confluence)
    { path: "M15,55 Q25,50 35,55 Q45,60 50,55", color: "stroke-blue-500" },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'business': return <Building className="h-3 w-3 text-white" />;
      case 'education': return <Home className="h-3 w-3 text-white" />;
      case 'residential': return <Home className="h-3 w-3 text-white" />;
      case 'arts': return <TreePine className="h-3 w-3 text-white" />;
      case 'industrial': return <Building className="h-3 w-3 text-white" />;
      case 'entertainment': return <MapPin className="h-3 w-3 text-white" />;
      case 'sports': return <Mountain className="h-3 w-3 text-white" />;
      default: return <MapPin className="h-3 w-3 text-white" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          <span>Pittsburgh, PA Overview</span>
        </h3>
        <div className="text-sm text-gray-500">
          Interactive Neighborhood Map
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        {/* Rivers */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {rivers.map((river, index) => (
            <path
              key={index}
              d={river.path}
              className={`${river.color} fill-none stroke-4 opacity-70`}
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* Neighborhoods */}
        {neighborhoods.map((neighborhood, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ 
              left: `${neighborhood.x}%`, 
              top: `${neighborhood.y}%` 
            }}
          >
            {/* Neighborhood marker */}
            <div className={`${neighborhood.color} rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110`}>
              {getIcon(neighborhood.type)}
            </div>
            
            {/* Neighborhood label */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {neighborhood.name}
              </div>
            </div>
          </div>
        ))}

        {/* Major landmarks */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">Key Areas</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Business District</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Education Hub</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Residential</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Arts District</span>
            </div>
          </div>
        </div>

        {/* Compass */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-2 shadow-lg">
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
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">{neighborhoods.length}</div>
          <div className="text-xs text-gray-600">Neighborhoods</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">3</div>
          <div className="text-xs text-gray-600">Rivers</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">302k</div>
          <div className="text-xs text-gray-600">Population</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">58.3</div>
          <div className="text-xs text-gray-600">sq mi</div>
        </div>
      </div>
    </div>
  );
};

export default PittsburghMap;

