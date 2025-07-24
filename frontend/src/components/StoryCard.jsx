import React, { useState } from 'react';
import { ExternalLink, MapPin, Building, Home, ChevronDown, ChevronUp } from 'lucide-react';

const StoryCard = ({ story }) => {
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);

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

  const neighborhoods = story.neighborhoods ? story.neighborhoods.split(',').map(n => n.trim()) : [];
  const visibleNeighborhoods = showAllNeighborhoods ? neighborhoods : neighborhoods.slice(0, 2);
  const hasMoreNeighborhoods = neighborhoods.length > 2;

  return (
    <div className="news-card p-6 h-full flex flex-col">
      {/* Article Title, Author, and Date */}
      <div className="mb-4">
        {story.title && (
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {story.title}
          </h3>
        )}
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
          {formatAuthor(story.author) && (
            <span className="font-medium">
              {formatAuthor(story.author)}
            </span>
          )}
          {formatDate(story.date) && (
            <span className="text-gray-500">
              {formatDate(story.date)}
            </span>
          )}
        </div>
      </div>

      {/* Social Media Abstract */}
      <div className="mb-4 flex-1">
        <p className="text-gray-700 text-sm leading-relaxed">
          {story.social_abstract.replace(/^"|"$/g, '')}
        </p>
      </div>

      {/* Classification Info - Reduced size by 20% */}
      <div className="space-y-1.5 text-xs">
        {/* Umbrella */}
        <div className="flex items-center gap-2">
          <Building className="h-2.5 w-2.5 text-blue-600 flex-shrink-0" />
          <span className="text-gray-600 font-medium text-xs">Category:</span>
          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium text-xs">
            {story.umbrella}
          </span>
        </div>

        {/* Geographic Area */}
        <div className="flex items-center gap-2">
          <MapPin className="h-2.5 w-2.5 text-green-600 flex-shrink-0" />
          <span className="text-gray-600 font-medium text-xs">Area:</span>
          <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium text-xs">
            {story.geographic_area}
          </span>
        </div>

        {/* Neighborhoods */}
        {neighborhoods.length > 0 && (
          <div className="flex items-start gap-2">
            <Home className="h-2.5 w-2.5 text-orange-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600 font-medium text-xs">Neighborhoods:</span>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1 items-center">
                {visibleNeighborhoods.map((neighborhood, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full font-medium text-xs"
                  >
                    {neighborhood}
                  </span>
                ))}
                {hasMoreNeighborhoods && (
                  <button
                    onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded text-xs transition-colors duration-200"
                  >
                    {showAllNeighborhoods ? (
                      <>
                        <span>Less</span>
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

      {/* Read Full Story Button */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          <span>Read Full Story</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default StoryCard;

