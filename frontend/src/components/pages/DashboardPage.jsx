import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import PittsburghMap from '../PittsburghMap';
import ModernStoryCard from '../ModernStoryCard';
import { FileText } from 'lucide-react';

const DashboardPage = ({ 
  stories, 
  metrics, 
  hoveredStoryAreas, 
  setHoveredStoryAreas 
}) => {
  const [hoveredStory, setHoveredStory] = useState(null);

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stories</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalStories}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Geographic Areas</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.areasCount}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filtered Stories</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.filteredCount}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6">
        {/* Stories Grid */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Story Feed</CardTitle>
              <CardDescription>
                Showing {stories.length} stories with interactive geographic visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {stories.map((story) => (
                    <div 
                      key={story.id}
                      className={`transition-all duration-200 ${
                        hoveredStory === story.id ? 'border-l-4 border-blue-400' : ''
                      }`}
                      onMouseEnter={() => {
                        setHoveredStory(story.id);
                        const areas = story.geographic_area ? 
                          story.geographic_area.split(/[,;/|]/).map(a => a.trim()) : [];
                        setHoveredStoryAreas(areas);
                      }}
                      onMouseLeave={() => {
                        setHoveredStory(null);
                        setHoveredStoryAreas([]);
                      }}
                    >
                      <ModernStoryCard story={story} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map Sidebar */}
        <div className="w-1/3">
          <PittsburghMap highlightedAreas={hoveredStoryAreas} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;