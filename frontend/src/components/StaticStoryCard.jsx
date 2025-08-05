import React, { useState } from 'react';
import { ExternalLink, MapPin, Building, Home, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';

const StaticStoryCard = ({ story }) => {
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
    return authorString.replace(/^by\s*/i, '').trim();
  };

  const getCategoryColor = (category) => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
      {/* Header with gradient accent */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-2"></div>
      
      <div className="p-6">
        {/* Article Title and Meta */}
        {story.title && (
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
              {story.title}
            </h3>
            
            {/* Author and Date */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              {formatAuthor(story.author) && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">
                    {formatAuthor(story.author)}
                  </span>
                </div>
              )}
              {formatDate(story.date) && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
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
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-700 text-base leading-relaxed font-medium">
              {story.social_abstract.replace(/^"|"$/g, '')}
            </p>
          </div>
        </div>

        {/* Classification Grid */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Category */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-900 font-semibold">Category</span>
            </div>
            <span className={`inline-block px-4 py-2 rounded-lg font-medium text-sm border-2 ${getCategoryColor(story.umbrella)}`}>
              {story.umbrella}
            </span>
          </div>

          {/* Geographic Area */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-green-900 font-semibold">Geographic Area</span>
            </div>
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium text-sm border-2 border-green-200">
              {story.geographic_area}
            </span>
          </div>

          {/* Neighborhoods */}
          {neighborhoods.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="text-orange-900 font-semibold">Neighborhoods</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleNeighborhoods.map((neighborhood, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-3 py-2 rounded-lg font-medium text-sm border-2 border-orange-200"
                  >
                    {neighborhood}
                  </span>
                ))}
                {hasMoreNeighborhoods && (
                  <button
                    onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)}
                    className="flex items-center gap-1 text-orange-700 bg-orange-100 border-2 border-orange-300 px-3 py-2 rounded-lg text-sm font-medium"
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
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-base shadow-lg border-2 border-blue-700"
          >
            <span>Read Full Story</span>
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <ExternalLink className="h-4 w-4" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StaticStoryCard;

