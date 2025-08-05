import React, { useState } from 'react';
import { ExternalLink, MapPin, Building, Home, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';

const StaticStoryCard = ({ story, onHover, onLeave }) => {
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  
  // 解析geographic_area字符串，分割多个区域
  const parseGeographicAreas = (areaString) => {
    if (!areaString) return [];
    return areaString.split(/[,;/|]/).map(area => area.trim()).filter(area => area);
  };
  
  const handleMouseEnter = () => {
    const areas = parseGeographicAreas(story.geographic_area);
    if (onHover && areas.length > 0) {
      onHover(areas);
    }
  };
  
  const handleMouseLeave = () => {
    if (onLeave) {
      onLeave();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatAuthor = (authorString) => {
    if (!authorString) return null;
    return authorString.replace(/^by\s*/i, '').trim();
  };

  const getCategoryColor = (category) => {
    if (!category) return 'bg-slate-100 text-slate-600 border-slate-200';
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200',
      'bg-orange-50 text-orange-700 border-orange-200',
      'bg-pink-50 text-pink-700 border-pink-200',
      'bg-indigo-50 text-indigo-700 border-indigo-200'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const neighborhoods = story.neighborhoods ? story.neighborhoods.split(',').map(n => n.trim()) : [];
  const visibleNeighborhoods = showAllNeighborhoods ? neighborhoods : neighborhoods.slice(0, 2);
  const hasMoreNeighborhoods = neighborhoods.length > 2;

  return (
    <div 
      className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:scale-[1.02] group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      <div className="p-6">
        {/* Article Title and Meta */}
        {story.title && (
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-700 transition-colors duration-200">
              {story.title}
            </h3>
            
            {/* Author and Date */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              {formatAuthor(story.author) && (
                <div className="flex items-center gap-2 animate-slide-in-top">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">
                    {formatAuthor(story.author)}
                  </span>
                </div>
              )}
              {formatDate(story.date) && (
                <div className="flex items-center gap-2 animate-slide-in-top" style={{ animationDelay: '100ms' }}>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">
                    {formatDate(story.date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media Abstract */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 group-hover:bg-blue-50 group-hover:border-blue-600 transition-all duration-200">
            <p className="text-gray-700 text-base leading-relaxed font-medium">
              {story.social_abstract.replace(/^"|"$/g, '')}
            </p>
          </div>
        </div>

        {/* Classification Grid */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Category */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 transition-all duration-200 animate-slide-in-bottom">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-200">
                <Building className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-900 font-semibold">Category</span>
            </div>
            <span className={`inline-block px-4 py-2 rounded-lg font-medium text-sm border-2 transition-all duration-200 hover:scale-105 ${getCategoryColor(story.umbrella)}`}>
              {story.umbrella}
            </span>
          </div>

          {/* Geographic Area */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 group-hover:bg-green-100 group-hover:border-green-300 transition-all duration-200 animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors duration-200">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-green-900 font-semibold">Geographic Area</span>
            </div>
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium text-sm border-2 border-green-200 transition-all duration-200 hover:scale-105 hover:bg-green-200">
              {story.geographic_area}
            </span>
          </div>

          {/* Neighborhoods */}
          {neighborhoods.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 group-hover:bg-orange-100 group-hover:border-orange-300 transition-all duration-200 animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-700 transition-colors duration-200">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="text-orange-900 font-semibold">Neighborhoods</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleNeighborhoods.map((neighborhood, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-3 py-2 rounded-lg font-medium text-sm border-2 border-orange-200 transition-all duration-200 hover:scale-105 hover:bg-orange-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {neighborhood}
                  </span>
                ))}
                {hasMoreNeighborhoods && (
                  <button
                    onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)}
                    className="flex items-center gap-1 text-orange-700 bg-orange-100 border-2 border-orange-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-200 hover:border-orange-400 transition-all duration-200 hover:scale-105"
                  >
                    {showAllNeighborhoods ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>+{neighborhoods.length - 2} more</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Read Full Story Button */}
        <div className="pt-4 border-t-2 border-gray-100">
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-base shadow-lg border-2 border-blue-700 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 transform hover:scale-105 group/button"
          >
            <span>Read Full Story</span>
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover/button:bg-opacity-30 transition-all duration-200">
              <ExternalLink className="h-4 w-4" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StaticStoryCard;
