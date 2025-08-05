import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ExternalLink, FileText, MapPin, Building, Home, LogOut } from 'lucide-react';
import StaticStoryCard from './StaticStoryCard';
import StaticFilterPanel from './StaticFilterPanel';
import UploadButton from './UploadButton';
import PittsburghMap from './PittsburghMap';

const Dashboard = ({ stories, filters, onLogout, onDataUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    umbrella: [],
    geographic_area: [],
    neighborhood: []
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleUploadSuccess = (result) => {
    // Notify App component to refresh data
    if (onDataUpdate) {
      onDataUpdate();
    }
  };

  // Filter stories
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        story.social_abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.url.toLowerCase().includes(searchTerm.toLowerCase());

      // Umbrella filter - check if any selected umbrella matches any part of story umbrella
      const matchesUmbrella = selectedFilters.umbrella.length === 0 || 
        selectedFilters.umbrella.some(selectedUmbrella => {
          if (!story.umbrella) return false;
          // Split story umbrella by common separators and check for matches
          const storyUmbrellas = story.umbrella.split(/[,;\/|]/).map(u => u.trim());
          return storyUmbrellas.some(storyUmb => 
            storyUmb === selectedUmbrella || storyUmb.includes(selectedUmbrella)
          );
        });

      // Geographic Area filter - check if any selected area matches any part of story geographic area
      const matchesGeographic = selectedFilters.geographic_area.length === 0 || 
        selectedFilters.geographic_area.some(selectedArea => {
          if (!story.geographic_area) return false;
          // Split story geographic area by common separators and check for matches
          const storyAreas = story.geographic_area.split(/[,;\/|]/).map(a => a.trim());
          return storyAreas.some(storyArea => 
            storyArea === selectedArea || storyArea.includes(selectedArea)
          );
        });

      // Neighborhood filter - check if any selected neighborhood matches any part of story neighborhoods
      const matchesNeighborhood = selectedFilters.neighborhood.length === 0 || 
        selectedFilters.neighborhood.some(selectedNeigh => {
          if (!story.neighborhoods) return false;
          
          let storyNeighborhoods = [];
          
          // Handle both string and array formats for neighborhoods
          if (typeof story.neighborhoods === 'string') {
            storyNeighborhoods = story.neighborhoods.split(/[,;\/|]/).map(n => n.trim());
          } else if (Array.isArray(story.neighborhoods)) {
            // Flatten array and split each item by separators
            storyNeighborhoods = story.neighborhoods.flatMap(neigh => 
              typeof neigh === 'string' ? neigh.split(/[,;\/|]/).map(n => n.trim()) : []
            );
          }
          
          return storyNeighborhoods.some(storyNeigh => 
            storyNeigh === selectedNeigh || storyNeigh.includes(selectedNeigh)
          );
        });

      return matchesSearch && matchesUmbrella && matchesGeographic && matchesNeighborhood;
    });
  }, [stories, searchTerm, selectedFilters]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-xl border-b-4 border-gradient-to-r from-blue-500 to-purple-500 animate-slide-in-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover-lift">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 gradient-text">PublicSource Story Dashboard</h1>
                <p className="text-sm text-gray-600">Pittsburgh News Classification System</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                to="/keyword-search" 
                className="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl border-2 border-gray-200 font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 hover-lift"
              >
                <Search className="h-5 w-5" />
                <span>Keyword Search</span>
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-6 py-3 text-red-700 bg-red-50 rounded-xl border-2 border-red-200 font-semibold hover:bg-red-100 hover:border-red-300 transition-all duration-200 hover-lift"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Container - 使用flex布局确保不重叠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload Button - Fixed position */}
        <div className="animate-fade-in">
          <UploadButton onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Pittsburgh Map - 独立的容器 */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <PittsburghMap />
        </div>

        {/* Search and Filter Bar - 确保与地图有足够间距 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Box */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <input
                  type="text"
                  placeholder="Search story content or links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl bg-gray-50 font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-xl border-2 font-bold min-w-[160px] shadow-lg transition-all duration-200 hover-lift ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                showFilters || activeFiltersCount > 0 ? 'bg-white bg-opacity-20' : 'bg-gray-100'
              }`}>
                <Filter className={`h-4 w-4 ${
                  showFilters || activeFiltersCount > 0 ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 rounded-full px-3 py-1 text-sm font-bold min-w-[24px] text-center border-2 border-blue-200">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 animate-slide-in-bottom">
              <StaticFilterPanel
                filters={filters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl border-2 border-blue-700 text-white hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 font-semibold mb-2">Total Stories</p>
                <p className="text-4xl font-bold">{stories.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <FileText className="h-8 w-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl border-2 border-green-700 text-white hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 font-semibold mb-2">Categories</p>
                <p className="text-4xl font-bold">{filters.umbrellas?.length || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <Building className="h-8 w-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl border-2 border-orange-700 text-white hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 font-semibold mb-2">Geographic Areas</p>
                <p className="text-4xl font-bold">{filters.geographic_areas?.length || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <MapPin className="h-8 w-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl border-2 border-purple-700 text-white hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 font-semibold mb-2">Neighborhoods</p>
                <p className="text-4xl font-bold">{filters.neighborhoods?.length || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <Home className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <p className="text-gray-700 font-semibold text-lg">
            Showing <span className="font-bold text-blue-600 text-xl">{filteredStories.length}</span> stories
            {filteredStories.length !== stories.length && (
              <span className="text-gray-500"> of {stories.length} total</span>
            )}
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredStories.map((story, index) => (
            <div 
              key={story.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${1000 + (index * 100)}ms` }}
            >
              <StaticStoryCard story={story} />
            </div>
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl border-2 border-gray-200 animate-fade-in">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No matching stories found</h3>
            <p className="text-gray-600 mb-6 text-lg">Try adjusting your search terms or filters</p>
            <button
              onClick={clearFilters}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg border-2 border-blue-700 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover-lift"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
