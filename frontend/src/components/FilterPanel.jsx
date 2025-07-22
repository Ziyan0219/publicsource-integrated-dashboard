import React from 'react';
import { X, Building, MapPin, Home } from 'lucide-react';

const FilterPanel = ({ filters, selectedFilters, onFilterChange, onClearFilters }) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors duration-200"
        >
          <X className="h-4 w-4" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Umbrella Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Building className="h-4 w-4 text-blue-600" />
            Category
          </label>
          <select
            value={selectedFilters.umbrella}
            onChange={(e) => onFilterChange('umbrella', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Categories</option>
            {filters.umbrellas?.map(umbrella => (
              <option key={umbrella} value={umbrella}>
                {umbrella}
              </option>
            ))}
          </select>
        </div>

        {/* Geographic Area Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 text-green-600" />
            Geographic Area
          </label>
          <select
            value={selectedFilters.geographic_area}
            onChange={(e) => onFilterChange('geographic_area', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">All Areas</option>
            {filters.geographic_areas?.map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Neighborhood Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Home className="h-4 w-4 text-orange-600" />
            Neighborhood
          </label>
          <select
            value={selectedFilters.neighborhood}
            onChange={(e) => onFilterChange('neighborhood', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          >
            <option value="">All Neighborhoods</option>
            {filters.neighborhoods?.map(neighborhood => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Filter Status */}
      <div className="mt-4 flex flex-wrap gap-2">
        {selectedFilters.umbrella && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Building className="h-3 w-3" />
            {selectedFilters.umbrella}
            <button
              onClick={() => onFilterChange('umbrella', '')}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        {selectedFilters.geographic_area && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <MapPin className="h-3 w-3" />
            {selectedFilters.geographic_area}
            <button
              onClick={() => onFilterChange('geographic_area', '')}
              className="ml-1 hover:bg-green-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        {selectedFilters.neighborhood && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
            <Home className="h-3 w-3" />
            {selectedFilters.neighborhood}
            <button
              onClick={() => onFilterChange('neighborhood', '')}
              className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;

