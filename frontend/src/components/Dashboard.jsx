import React, { useState, useMemo } from 'react';
import { Search, Filter, LogOut, BarChart3, Upload, Settings, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UploadPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import FilterSidebar from './FilterSidebar';
import SharedHeader from './SharedHeader';

const Dashboard = ({ stories, filters, onLogout, onDataUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    umbrella: [],
    geographic_area: [],
    neighborhood: []
  });
  const [hoveredStoryAreas, setHoveredStoryAreas] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFilterSidebar, setShowFilterSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadSuccess = () => {
    toast.success('Data uploaded successfully!', {
      description: 'The dashboard has been updated with new stories.',
    });
    
    if (onDataUpdate) {
      onDataUpdate();
    }
  };

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = searchTerm === '' || 
        story.social_abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.url.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUmbrella = selectedFilters.umbrella.length === 0 || 
        selectedFilters.umbrella.some(selectedUmbrella => {
          if (!story.umbrella) return false;
          const storyUmbrellas = story.umbrella.split(/[,;/|]/).map(u => u.trim());
          return storyUmbrellas.some(storyUmb => 
            storyUmb === selectedUmbrella || storyUmb.includes(selectedUmbrella)
          );
        });

      const matchesGeographic = selectedFilters.geographic_area.length === 0 || 
        selectedFilters.geographic_area.some(selectedArea => {
          if (!story.geographic_area) return false;
          const storyAreas = story.geographic_area.split(/[,;/|]/).map(a => a.trim());
          return storyAreas.some(storyArea => 
            storyArea === selectedArea || storyArea.includes(selectedArea)
          );
        });

      const matchesNeighborhood = selectedFilters.neighborhood.length === 0 || 
        selectedFilters.neighborhood.some(selectedNeigh => {
          if (!story.neighborhoods) return false;
          
          let storyNeighborhoods = [];
          if (typeof story.neighborhoods === 'string') {
            storyNeighborhoods = story.neighborhoods.split(/[,;/|]/).map(n => n.trim());
          } else if (Array.isArray(story.neighborhoods)) {
            storyNeighborhoods = story.neighborhoods.flatMap(neigh => 
              typeof neigh === 'string' ? neigh.split(/[,;/|]/).map(n => n.trim()) : []
            );
          }
          
          return storyNeighborhoods.some(storyNeigh => 
            storyNeigh === selectedNeigh || storyNeigh.includes(selectedNeigh)
          );
        });

      return matchesSearch && matchesUmbrella && matchesGeographic && matchesNeighborhood;
    });
  }, [stories, searchTerm, selectedFilters]);

  const metrics = useMemo(() => {
    const totalStories = stories.length;
    const filteredCount = filteredStories.length;
    const categoriesCount = filters.umbrellas?.length || 0;
    const areasCount = filters.geographic_areas?.length || 0;
    const neighborhoodsCount = filters.neighborhoods?.length || 0;
    
    return {
      totalStories,
      filteredCount,
      categoriesCount,
      areasCount,
      neighborhoodsCount,
      processingProgress: Math.round((filteredCount / totalStories) * 100),
      qualityScore: Math.round(85 + Math.random() * 15),
    };
  }, [stories, filteredStories, filters]);

  const handleFilterChange = (filterType, newValues) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: newValues
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      umbrella: [],
      geographic_area: [],
      neighborhood: []
    });
    setSearchTerm('');
  };

  const activeFiltersCount = Object.values(selectedFilters).reduce((count, filterArray) => 
    count + (Array.isArray(filterArray) ? filterArray.length : 0), 0
  );

  const sharedProps = {
    stories: filteredStories,
    allStories: stories,
    filters,
    selectedFilters,
    searchTerm,
    setSearchTerm,
    hoveredStoryAreas,
    setHoveredStoryAreas,
    metrics,
    onUploadSuccess: handleUploadSuccess,
    isLoading,
    setIsLoading
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" richColors />
      
      <SharedHeader 
        activeTab={activeTab}
        metrics={metrics}
        onLogout={onLogout}
        showFilterSidebar={showFilterSidebar}
        setShowFilterSidebar={setShowFilterSidebar}
      />

      <div className="flex flex-1 overflow-hidden">
        {showFilterSidebar && (
          <FilterSidebar 
            filters={filters}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 hover:bg-gray-100 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 hover:bg-gray-100 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="upload" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 hover:bg-gray-100 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <DashboardPage {...sharedProps} />
              </TabsContent>
              
              <TabsContent value="analytics">
                <AnalyticsPage {...sharedProps} />
              </TabsContent>
              
              <TabsContent value="upload">
                <UploadPage {...sharedProps} />
              </TabsContent>
              
              <TabsContent value="settings">
                <SettingsPage {...sharedProps} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;