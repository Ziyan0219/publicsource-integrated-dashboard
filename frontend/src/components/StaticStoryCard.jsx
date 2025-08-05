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
    if (!category) return 'bg-slate-100 text-slate-600 border-slate-200';
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-300',
      'bg-purple-50 text-purple-700 border-purple-300',
      'bg-emerald-50 text-emerald-700 border-emerald-300',
      'bg-orange-50 text-orange-700 border-orange-300',
      'bg-pink-50 text-pink-700 border-pink-300',
      'bg-indigo-50 text-indigo-700 border-indigo-300'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const neighborhoods = story.neighborhoods ? story.neighborhoods.split(',').map(n => n.trim()) : [];
  const visibleNeighborhoods = showAllNeighborhoods ? neighborhoods : neighborhoods.slice(0, 2);
  const hasMoreNeighborhoods = neighborhoods.length > 2;

  return (
    <div 
      className={`group relative bg-white/80 backdrop-blur-2xl rounded-3xl border-2 border-white/40 overflow-hidden transition-all duration-500 ease-out shadow-xl hover:shadow-2xl ${
        isHovered ? 'scale-[1.03] border-slate-300/50 bg-white/90 shadow-2xl ring-1 ring-slate-200/30' : 'hover:scale-[1.01] hover:border-white/60'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 50%, rgba(241,245,249,0.7) 100%)',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)' 
          : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
      }}
    >
      <div className="p-6 h-full flex flex-col relative">
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-slate-50/20 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 h-full flex flex-col">

        {/* Article Title */}
        {story.title && (
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-snug group-hover:text-slate-800 transition-all duration-300 tracking-tight">
              {story.title}
            </h3>
            
            {/* Author and Date - More sophisticated styling */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {formatAuthor(story.author) && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/60 backdrop-blur-sm rounded-full border border-slate-200/40">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-700 tracking-wide">
                    {formatAuthor(story.author)}
                  </span>
                </div>
              )}
              {formatDate(story.date) && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/60 backdrop-blur-sm rounded-full border border-slate-200/40">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-medium text-slate-600 tracking-wide">
                    {formatDate(story.date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media Abstract */}
        <div className="mb-6 flex-1">
          <div className="relative">
            <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-slate-300 via-slate-200 to-transparent rounded-full opacity-30"></div>
            <p className="text-slate-700 text-sm leading-relaxed pl-4 font-medium tracking-wide">
              {story.social_abstract.replace(/^"|"$/g, '')}
            </p>
          </div>
        </div>

        {/* Classification Info - Enhanced styling */}
        <div className="space-y-3 mb-6">
          {/* Category */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[80px]">
              <div className="w-6 h-6 bg-slate-200/60 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Building className="h-3.5 w-3.5 text-slate-600" />
              </div>
              <span className="text-slate-600 font-semibold text-xs tracking-wider uppercase">Category</span>
            </div>
            <span className={`px-3 py-1.5 rounded-xl font-semibold text-xs border-2 shadow-sm ${getCategoryColor(story.umbrella)}`}>
              {story.umbrella}
            </span>
          </div>

          {/* Geographic Area */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[80px]">
              <div className="w-6 h-6 bg-slate-200/60 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-slate-600" />
              </div>
              <span className="text-slate-600 font-semibold text-xs tracking-wider uppercase">Area</span>
            </div>
            <span className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-800 px-3 py-1.5 rounded-xl font-semibold text-xs border-2 border-slate-200/60 shadow-sm">
              {story.geographic_area}
            </span>
          </div>

          {/* Neighborhoods */}
          {neighborhoods.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 min-w-[80px] mt-0.5">
                <div className="w-6 h-6 bg-slate-200/60 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Home className="h-3.5 w-3.5 text-slate-600" />
                </div>
                <span className="text-slate-600 font-semibold text-xs tracking-wider uppercase">Areas</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {visibleNeighborhoods.map((neighborhood, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 px-3 py-1.5 rounded-xl font-semibold text-xs border-2 border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {neighborhood}
                    </span>
                  ))}
                  {hasMoreNeighborhoods && (
                    <button
                      onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-medium border-2 border-dashed border-slate-300 hover:border-slate-400 transition-all duration-200 backdrop-blur-sm"
                    >
                      {showAllNeighborhoods ? (
                        <>
                          <span>Less</span>
                          <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          <span>+{neighborhoods.length - 2}</span>
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

        {/* Read Full Story Button - Premium styling */}
        <div className="mt-auto">
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-slate-700/50 hover:border-slate-600/50"
            style={{
              boxShadow: '0 10px 25px -3px rgba(15, 23, 42, 0.3), 0 4px 6px -2px rgba(15, 23, 42, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <span className="tracking-wide">Read Full Story</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        </div>
      </div>
    </div>
  );
};

export default StaticStoryCard;