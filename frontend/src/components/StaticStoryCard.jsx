import React, { useState } from 'react';
import { ExternalLink, MapPin, Building, Home, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';

const StaticStoryCard = ({ story, onHover, onLeave }) => {
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // 解析geographic_area字符串，分割多个区域
  const parseGeographicAreas = (areaString) => {
    if (!areaString) return [];
    return areaString.split(/[,;/|]/).map(area => area.trim()).filter(area => area);
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    const areas = parseGeographicAreas(story.geographic_area);
    console.log('Story card hover - areas:', areas, 'from:', story.geographic_area);
    if (onHover && areas.length > 0) {
      onHover(areas);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    console.log('Story card leave');
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
    if (!category) return 'bg-slate-50 text-slate-700 border-slate-200';
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colors = [
      'bg-blue-50 text-blue-800 border-blue-200 ring-blue-100',
      'bg-purple-50 text-purple-800 border-purple-200 ring-purple-100',
      'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-100',
      'bg-orange-50 text-orange-800 border-orange-200 ring-orange-100',
      'bg-pink-50 text-pink-800 border-pink-200 ring-pink-100',
      'bg-indigo-50 text-indigo-800 border-indigo-200 ring-indigo-100'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const neighborhoods = story.neighborhoods ? story.neighborhoods.split(',').map(n => n.trim()) : [];
  const visibleNeighborhoods = showAllNeighborhoods ? neighborhoods : neighborhoods.slice(0, 2);
  const hasMoreNeighborhoods = neighborhoods.length > 2;

  return (
    <div 
      className={`group relative overflow-hidden transition-all duration-300 ease-out ${
        isHovered 
          ? 'transform scale-[1.02] shadow-2xl' 
          : 'shadow-lg hover:shadow-xl hover:scale-[1.01]'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: isHovered 
          ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #fcfcfd 50%, #f9fafb 100%)',
        borderRadius: '20px',
        border: isHovered ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(148, 163, 184, 0.1)'
          : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Premium glass effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
          borderRadius: '20px'
        }}
      />
      
      <div className="relative p-7 h-full flex flex-col">
        {/* Article Title */}
        {story.title && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-tight tracking-tight group-hover:text-slate-800 transition-colors duration-200">
              {story.title}
            </h3>
            
            {/* Author and Date */}
            <div className="flex flex-wrap items-center gap-3">
              {formatAuthor(story.author) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/60 shadow-sm">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-700 text-xs tracking-wide">
                    {formatAuthor(story.author)}
                  </span>
                </div>
              )}
              {formatDate(story.date) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/60 shadow-sm">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-medium text-slate-600 text-xs tracking-wide">
                    {formatDate(story.date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media Abstract */}
        <div className="mb-6 flex-1">
          <div className="relative pl-4">
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-slate-300 to-slate-100 rounded-full" />
            <p className="text-slate-700 text-sm leading-relaxed font-medium">
              {story.social_abstract.replace(/^"|"$/g, '')}
            </p>
          </div>
        </div>

        {/* Classification Tags */}
        <div className="space-y-4 mb-6">
          {/* Category */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[90px]">
              <div className="w-7 h-7 bg-slate-100 rounded-xl flex items-center justify-center">
                <Building className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">Category</span>
            </div>
            <span className={`px-4 py-2 rounded-full font-bold text-xs border-2 shadow-sm ring-2 ring-offset-1 ${getCategoryColor(story.umbrella)}`}>
              {story.umbrella}
            </span>
          </div>

          {/* Geographic Area */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[90px]">
              <div className="w-7 h-7 bg-slate-100 rounded-xl flex items-center justify-center">
                <MapPin className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">Location</span>
            </div>
            <span className="bg-slate-50 text-slate-800 px-4 py-2 rounded-full font-bold text-xs border-2 border-slate-200 shadow-sm ring-2 ring-slate-100 ring-offset-1">
              {story.geographic_area}
            </span>
          </div>

          {/* Neighborhoods */}
          {neighborhoods.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 min-w-[90px] mt-1">
                <div className="w-7 h-7 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Home className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">Districts</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  {visibleNeighborhoods.map((neighborhood, index) => (
                    <span
                      key={index}
                      className="bg-slate-50 text-slate-700 px-3 py-2 rounded-full font-semibold text-xs border-2 border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white"
                    >
                      {neighborhood}
                    </span>
                  ))}
                  {hasMoreNeighborhoods && (
                    <button
                      onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)}
                      className="flex items-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-full text-xs font-medium border-2 border-dashed border-slate-300 hover:border-slate-400 transition-all duration-200"
                    >
                      {showAllNeighborhoods ? (
                        <>
                          <span>Show Less</span>
                          <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          <span>+{neighborhoods.length - 2} more</span>
                          <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action Button */}
        <div className="mt-auto">
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-slate-700"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
              boxShadow: '0 10px 25px -3px rgba(15, 23, 42, 0.3), 0 4px 6px -2px rgba(15, 23, 42, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <span className="tracking-wide">Read Full Article</span>
            <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StaticStoryCard;