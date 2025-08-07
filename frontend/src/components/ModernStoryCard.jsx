import React from 'react';
import { ExternalLink, MapPin, Building } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const ModernStoryCard = ({ story }) => {
  const handleOpenStory = () => {
    if (story.url) {
      window.open(story.url, '_blank');
    }
  };

  // Parse neighborhoods - handle both string and array formats
  const getNeighborhoodsArray = () => {
    if (!story.neighborhoods) return [];
    if (typeof story.neighborhoods === 'string') {
      return story.neighborhoods.split(/[,;/|]/).map(n => n.trim()).filter(n => n);
    }
    if (Array.isArray(story.neighborhoods)) {
      return story.neighborhoods.flatMap(neigh => 
        typeof neigh === 'string' ? neigh.split(/[,;/|]/).map(n => n.trim()).filter(n => n) : []
      );
    }
    return [];
  };

  const neighborhoods = getNeighborhoodsArray();

  return (
    <Card className="border border-gray-200 hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-4 space-y-4">
        {/* Primary Content Section */}
        <div className="space-y-3">
          {story.title && (
            <h3 className="font-semibold text-base text-gray-900 line-clamp-2 leading-tight">
              {story.title}
            </h3>
          )}
          
          {/* Social Abstract with Distinctive Styling */}
          {story.social_abstract && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700 italic leading-relaxed line-clamp-4">
                {story.social_abstract}
              </p>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {/* Category/Umbrella */}
          {story.umbrella && (
            <div className="flex items-center gap-2">
              <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <Badge variant="outline" className="text-xs">
                {story.umbrella}
              </Badge>
            </div>
          )}
          
          {/* Geographic Area */}
          {story.geographic_area && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <Badge variant="secondary" className="text-xs">
                {story.geographic_area}
              </Badge>
            </div>
          )}
          
          {/* Neighborhoods */}
          {neighborhoods.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Neighborhoods:</p>
              <div className="flex flex-wrap gap-1">
                {neighborhoods.slice(0, 3).map((neighborhood, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                  >
                    {neighborhood}
                  </Badge>
                ))}
                {neighborhoods.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{neighborhoods.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Action Button */}
          <div className="pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleOpenStory}
              className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="text-xs">Read Full Story</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernStoryCard;