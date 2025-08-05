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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      {/* Header Navigation */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 animate-slide-in-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">PublicSource</h1>
                <p className="text-xs text-slate-500">Story Dashboard</p>
              </div>
            </div>
            <nav className="flex items-center space-x-3">
              <Link 
                to="/keyword-search" 
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 font-medium hover:bg-white/80 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-white/60 rounded-xl transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Upload Button */}
        <div className="animate-fade-in">
          <UploadButton onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Pittsburgh Map */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <PittsburghMap />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200/60 rounded-xl bg-white/60 backdrop-blur-sm placeholder-slate-400 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-200/50 transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border font-medium min-w-[120px] transition-all duration-200 ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white/60 text-slate-600 border-gray-200/60 hover:bg-white/80'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-slate-900 rounded-full px-2 py-0.5 text-xs font-semibold min-w-[20px] text-center">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium mb-1 text-sm">Stories</p>
                <p className="text-2xl font-bold text-slate-900">{stories.length}</p>
              </div>
              <div className="bg-slate-100 rounded-lg p-2">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium mb-1 text-sm">Categories</p>
                <p className="text-2xl font-bold text-slate-900">{filters.umbrellas?.length || 0}</p>
              </div>
              <div className="bg-slate-100 rounded-lg p-2">
                <Building className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium mb-1 text-sm">Areas</p>
                <p className="text-2xl font-bold text-slate-900">{filters.geographic_areas?.length || 0}</p>
              </div>
              <div className="bg-slate-100 rounded-lg p-2">
                <MapPin className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium mb-1 text-sm">Neighborhoods</p>
                <p className="text-2xl font-bold text-slate-900">{filters.neighborhoods?.length || 0}</p>
              </div>
              <div className="bg-slate-100 rounded-lg p-2">
                <Home className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-gray-200/60 shadow-sm animate-fade-in" style={{ animationDelay: '800ms' }}>
          <p className="text-slate-600 font-medium text-sm">
            Showing <span className="font-semibold text-slate-900">{filteredStories.length}</span> stories
            {filteredStories.length !== stories.length && (
              <span className="text-slate-400"> of {stories.length} total</span>
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
          <div className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-sm animate-fade-in">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">No stories found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search terms or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium shadow-sm hover:bg-slate-800 transition-all duration-200"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
