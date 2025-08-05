import React, { useState } from 'react';
import { ExternalLink, MapPin, Building, Home, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';

const StoryCard = ({ story }) => {
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    // Clean up author string (remove "by" prefix if present)
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
      className={`group relative bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/60 overflow-hidden transition-all duration-300 ease-out ${
        isHovered ? 'shadow-lg scale-[1.02] border-gray-300/60' : 'shadow-sm hover:shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      <div className="p-5 h-full flex flex-col">
        {/* Article Title */}
        {story.title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-slate-700 transition-colors duration-200">
              {story.title}
            </h3>
            
            {/* Author and Date */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {formatAuthor(story.author) && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-400" />
                  <span className="font-medium text-slate-600">
                    {formatAuthor(story.author)}
                  </span>
                </div>
              )}
              {formatDate(story.date) && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-500">
                    {formatDate(story.date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media Abstract */}
        <div className="mb-5 flex-1">
          <p className="text-slate-600 text-sm leading-relaxed">
            {story.social_abstract.replace(/^"|"$/g, '')}
          </p>
        </div>

        {/* Classification Info */}
        <div className="space-y-2.5 mb-5">
          {/* Category */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Building className="h-3 w-3 text-slate-400" />
              <span className="text-slate-500 font-medium text-xs">Category</span>
            </div>
            <span className={`px-2 py-1 rounded-lg font-medium text-xs border ${getCategoryColor(story.umbrella)}`}>
              {story.umbrella}
            </span>
          </div>

          {/* Geographic Area */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span className="text-slate-500 font-medium text-xs">Area</span>
            </div>
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-medium text-xs border border-slate-200">
              {story.geographic_area}
            </span>
          </div>

          {/* Neighborhoods */}
          {neighborhoods.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1.5 mt-0.5">
                <Home className="h-3 w-3 text-slate-400" />
                <span className="text-slate-500 font-medium text-xs">Areas</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {visibleNeighborhoods.map((neighborhood, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-medium text-xs border border-slate-200"
                    >
                      {neighborhood}
                    </span>
                  ))}
                  {hasMoreNeighborhoods && (
                    <button
                      onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-2 py-1 rounded-lg text-xs transition-all duration-200"
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

        {/* Read Full Story Button */}
        <div className="mt-auto">
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 text-sm font-medium"
          >
            <span>Read Story</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;

