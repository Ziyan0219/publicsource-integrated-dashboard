import React, { useState } from 'react';
import { ExternalLink, MapPin, Building, Home, ChevronDown, ChevronUp } from 'lucide-react';

const StaticStoryCard = ({ story, onHover, onLeave }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullTeaser, setShowFullTeaser] = useState(false);
  
  // 解析geographic_area字符串，分割多个区域
  const parseGeographicAreas = (areaString) => {
    if (!areaString) return [];
    return areaString.split(/[,;/|]/).map(area => area.trim()).filter(area => area);
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    const areas = parseGeographicAreas(story.geographic_area);

    // Handle neighborhoods - support both string and array formats
    let neighborhoods = [];
    if (story.neighborhoods) {
      if (Array.isArray(story.neighborhoods)) {
        neighborhoods = story.neighborhoods.flatMap(n =>
          typeof n === 'string' ? n.split(/[,;/|]/).map(v => v.trim()).filter(v => v) : []
        );
      } else if (typeof story.neighborhoods === 'string') {
        neighborhoods = story.neighborhoods.split(/[,;/|]/).map(n => n.trim()).filter(n => n);
      }
    }

    const allAreas = [...areas, ...neighborhoods];
    if (onHover && allAreas.length > 0) {
      onHover(allAreas);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onLeave) {
      onLeave();
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return 'bg-slate-50 text-slate-700 border-slate-200';
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colors = [
      'bg-blue-50 text-blue-800 border-blue-200',
      'bg-purple-50 text-purple-800 border-purple-200',
      'bg-emerald-50 text-emerald-800 border-emerald-200',
      'bg-orange-50 text-orange-800 border-orange-200',
      'bg-pink-50 text-pink-800 border-pink-200',
      'bg-indigo-50 text-indigo-800 border-indigo-200'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  // Parse neighborhoods - support both string and array formats
  const parseNeighborhoods = () => {
    if (!story.neighborhoods) return [];

    if (Array.isArray(story.neighborhoods)) {
      return story.neighborhoods.flatMap(n =>
        typeof n === 'string' ? n.split(/[,;/|]/).map(v => v.trim()).filter(v => v) : []
      );
    } else if (typeof story.neighborhoods === 'string') {
      return story.neighborhoods.split(/[,;/|]/).map(n => n.trim()).filter(n => n);
    }

    return [];
  };

  const neighborhoods = parseNeighborhoods();
  
  // Extract title from URL if empty
  const getTitle = () => {
    if (story.title && story.title.trim()) {
      return story.title;
    }
    // Extract from URL as fallback
    const urlParts = story.url.split('/');
    const slug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
    if (slug) {
      return slug.replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Untitled Story';
  };

  return (
    <div 
      className={`group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${
        isHovered ? 'scale-[1.02] shadow-xl' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-5 h-full flex flex-col">
        {/* Title - Reduced size */}
        <h3 className="text-base font-semibold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {getTitle()}
        </h3>

        {/* Collapsible Teaser */}
        {story.social_abstract && (
          <div className="mb-4">
            <p className={`text-slate-600 text-sm leading-relaxed ${showFullTeaser ? '' : 'line-clamp-2'}`}>
              {story.social_abstract.replace(/^"*|"*$/g, '')}
            </p>
            {story.social_abstract.length > 120 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullTeaser(!showFullTeaser);
                }}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-2 flex items-center gap-1 transition-colors"
              >
                {showFullTeaser ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show More
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {story.umbrella && (
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(story.umbrella)}`}>
              <Building className="w-3 h-3 inline mr-1" />
              {story.umbrella}
            </span>
          )}
          {story.geographic_area && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
              <MapPin className="w-3 h-3 inline mr-1" />
              {story.geographic_area}
            </span>
          )}
          {neighborhoods.length > 0 && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
              <Home className="w-3 h-3 inline mr-1" />
              {neighborhoods[0]}
              {neighborhoods.length > 1 && ` +${neighborhoods.length - 1}`}
            </span>
          )}
        </div>

        {/* Read Link */}
        <div className="mt-auto">
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all duration-200"
          >
            <span>Read Article</span>
            <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StaticStoryCard;