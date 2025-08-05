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
    if (!category) return 'bg-gray-100 text-gray-800';
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const neighborhoods = story.neighborhoods ? story.neighborhoods.split(',').map(n => n.trim()) : [];
  const visibleNeighborhoods = showAllNeighborhoods ? neighborhoods : neighborhoods.slice(0, 2);
  const hasMoreNeighborhoods = neighborhoods.length > 2;

  return (
    <div 
      className={`group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 ease-out transform ${
        isHovered ? 'shadow-xl -translate-y-2 border-blue-300' : 'shadow-md hover:shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="p-6 h-full flex flex-col">
        {/* Article Title */}
        {story.title && (
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors duration-200">
              {story.title}
            </h3>
            
            {/* Author and Date */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {formatAuthor(story.author) && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">
                    {formatAuthor(story.author)}
                  </span>
                </div>
              )}
              {formatDate(story.date) && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {formatDate(story.date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media Abstract */}
        <div className="mb-6 flex-1">
          <p className="text-gray-700 text-base leading-relaxed">
            {story.social_abstract.replace(/^"|"$/g, '')}
          </p>
        </div>

        {/* Classification Info */}
        <div className="space-y-3 mb-6">
          {/* Category */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600 font-medium text-sm">Category</span>
            </div>
            <span className={`px-3 py-1.5 rounded-full font-medium text-sm border ${getCategoryColor(story.umbrella)}`}>
              {story.umbrella}
            </span>
          </div>

          {/* Geographic Area */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-gray-600 font-medium text-sm">Area</span>
            </div>
            <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium text-sm border border-green-200">
              {story.geographic_area}
            </span>
          </div>

          {/* Neighborhoods */}
          {neighborhoods.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 mt-1">
                <Home className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600 font-medium text-sm">Neighborhoods</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  {visibleNeighborhoods.map((neighborhood, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full font-medium text-sm border border-orange-200"
                    >
                      {neighborhood}
                    </span>
                  ))}
                  {hasMoreNeighborhoods && (
                    <button
                      onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-full text-sm transition-all duration-200"
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
            </div>
          )}
        </div>

        {/* Read Full Story Button */}
        <div className="mt-auto">
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <span>Read Full Story</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;

