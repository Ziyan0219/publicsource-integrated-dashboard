import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ExternalLink, FileText, MapPin, Building, Home, LogOut } from 'lucide-react';
import StoryCard from './StoryCard';
import FilterPanel from './FilterPanel';
import UploadExcel from './UploadExcel';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PublicSource Story Dashboard</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                to="/keyword-search" 
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                <Search className="h-4 w-4" />
                <span>Keyword Search</span>
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Excel Component */}
        <UploadExcel onUploadSuccess={handleUploadSuccess} />

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Box */}
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search story content or links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-xl border-2 transition-all duration-200 font-semibold min-w-[140px] ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg hover:from-blue-700 hover:to-blue-800'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-md'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 rounded-full px-2.5 py-1 text-xs font-bold min-w-[20px] text-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
              <FilterPanel
                filters={filters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Stories</p>
                <p className="text-3xl font-bold text-blue-900">{stories.length}</p>
              </div>
              <div className="bg-blue-600 rounded-full p-3">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Categories</p>
                <p className="text-3xl font-bold text-green-900">{filters.umbrellas?.length || 0}</p>
              </div>
              <div className="bg-green-600 rounded-full p-3">
                <Building className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">Geographic Areas</p>
                <p className="text-3xl font-bold text-orange-900">{filters.geographic_areas?.length || 0}</p>
              </div>
              <div className="bg-orange-600 rounded-full p-3">
                <MapPin className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Neighborhoods</p>
                <p className="text-3xl font-bold text-purple-900">{filters.neighborhoods?.length || 0}</p>
              </div>
              <div className="bg-purple-600 rounded-full p-3">
                <Home className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredStories.length}</span> stories
            {filteredStories.length !== stories.length && (
              <span> of {stories.length} total</span>
            )}
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredStories.map((story, index) => (
            <div 
              key={story.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StoryCard story={story} />
            </div>
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matching stories found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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

