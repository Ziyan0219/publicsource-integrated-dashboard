import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ExternalLink, FileText, MapPin, Building, Home, LogOut } from 'lucide-react';
import StoryCard from './StoryCard';
import FilterPanel from './FilterPanel';
import UploadExcel from './UploadExcel';

const Dashboard = ({ stories, filters, onLogout, onDataUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    umbrella: '',
    geographic_area: '',
    neighborhood: ''
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

      // Umbrella filter
      const matchesUmbrella = selectedFilters.umbrella === '' || 
        story.umbrella === selectedFilters.umbrella;

      // Geographic Area filter
      const matchesGeographic = selectedFilters.geographic_area === '' || 
        story.geographic_area === selectedFilters.geographic_area;

      // Neighborhood filter
      const matchesNeighborhood = selectedFilters.neighborhood === '' || 
        (story.neighborhoods && story.neighborhoods.includes(selectedFilters.neighborhood));

      return matchesSearch && matchesUmbrella && matchesGeographic && matchesNeighborhood;
    });
  }, [stories, searchTerm, selectedFilters]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      umbrella: '',
      geographic_area: '',
      neighborhood: ''
    });
    setSearchTerm('');
  };

  const activeFiltersCount = Object.values(selectedFilters).filter(v => v !== '').length;

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
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search story content or links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg border transition-colors duration-200 ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 rounded-full px-2 py-1 text-xs font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <FilterPanel
              filters={filters}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          )}
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Stories</p>
                <p className="text-2xl font-bold text-gray-900">{stories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{filters.umbrellas?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Geographic Areas</p>
                <p className="text-2xl font-bold text-gray-900">{filters.geographic_areas?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <Home className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Neighborhoods</p>
                <p className="text-2xl font-bold text-gray-900">{filters.neighborhoods?.length || 0}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => (
            <StoryCard key={story.id} story={story} />
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

