import React from 'react';
import { X, Building, MapPin, Home, ChevronDown, ChevronUp } from 'lucide-react';

const FilterPanel = ({ filters, selectedFilters, onFilterChange, onClearFilters }) => {
  const [expandedSections, setExpandedSections] = React.useState({
    umbrella: false,
    geographic_area: false,
    neighborhood: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCheckboxChange = (filterType, value) => {
    const currentValues = selectedFilters[filterType] || [];
    let newValues;
    
    if (currentValues.includes(value)) {
      // Remove value if already selected
      newValues = currentValues.filter(v => v !== value);
    } else {
      // Add value if not selected
      newValues = [...currentValues, value];
    }
    
    onFilterChange(filterType, newValues);
  };

  const renderFilterSection = (title, icon, filterType, options, colorScheme) => {
    const selectedValues = selectedFilters[filterType] || [];
    const isExpanded = expandedSections[filterType];
    
    return (
      <div className="border-2 border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <button
          onClick={() => toggleSection(filterType)}
          className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200 ${
            isExpanded ? 'bg-gray-50 border-b-2 border-gray-100' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorScheme.iconBg}`}>
              {React.cloneElement(icon, { className: `h-5 w-5 ${colorScheme.iconColor}` })}
            </div>
            <span className="font-semibold text-gray-800 text-lg">{title}</span>
            {selectedValues.length > 0 && (
              <span className={`px-3 py-1 text-sm rounded-full font-bold ${colorScheme.badgeBg} ${colorScheme.badgeText}`}>
                {selectedValues.length}
              </span>
            )}
          </div>
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 max-h-64 overflow-y-auto bg-gray-50">
            {options && options.length > 0 ? (
              <div className="space-y-3">
                {options.map(option => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-3 rounded-lg transition-colors duration-200 group">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => handleCheckboxChange(filterType, option)}
                      className={`rounded-md border-2 border-gray-300 ${colorScheme.checkboxColor} focus:ring-2 focus:ring-offset-2 ${colorScheme.checkboxFocus} w-5 h-5`}
                    />
                    <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4">No options available</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const colorSchemes = {
    umbrella: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      checkboxColor: 'text-blue-600',
      checkboxFocus: 'focus:ring-blue-500'
    },
    geographic_area: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-800',
      checkboxColor: 'text-green-600',
      checkboxFocus: 'focus:ring-green-500'
    },
    neighborhood: {
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
      checkboxColor: 'text-orange-600',
      checkboxFocus: 'focus:ring-orange-500'
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          Filter Options
        </h3>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium border-2 border-transparent hover:border-red-200"
        >
          <X className="h-4 w-4" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Filter */}
        {renderFilterSection(
          'Category',
          <Building />,
          'umbrella',
          filters.umbrellas,
          colorSchemes.umbrella
        )}

        {/* Geographic Area Filter */}
        {renderFilterSection(
          'Geographic Area',
          <MapPin />,
          'geographic_area',
          filters.geographic_areas,
          colorSchemes.geographic_area
        )}

        {/* Neighborhood Filter */}
        {renderFilterSection(
          'Neighborhood',
          <Home />,
          'neighborhood',
          filters.neighborhoods,
          colorSchemes.neighborhood
        )}
      </div>

      {/* Current Filter Status */}
      {((selectedFilters.umbrella || []).length > 0 || 
        (selectedFilters.geographic_area || []).length > 0 || 
        (selectedFilters.neighborhood || []).length > 0) && (
        <div className="mt-6 p-4 bg-white rounded-xl border-2 border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Active Filters</h4>
          <div className="flex flex-wrap gap-3">
            {(selectedFilters.umbrella || []).map(value => (
              <span key={`umbrella-${value}`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                <Building className="h-4 w-4" />
                {value}
                <button
                  onClick={() => handleCheckboxChange('umbrella', value)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-1 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {(selectedFilters.geographic_area || []).map(value => (
              <span key={`geo-${value}`} className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                <MapPin className="h-4 w-4" />
                {value}
                <button
                  onClick={() => handleCheckboxChange('geographic_area', value)}
                  className="ml-1 hover:bg-green-200 rounded-full p-1 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {(selectedFilters.neighborhood || []).map(value => (
              <span key={`neigh-${value}`} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200">
                <Home className="h-4 w-4" />
                {value}
                <button
                  onClick={() => handleCheckboxChange('neighborhood', value)}
                  className="ml-1 hover:bg-orange-200 rounded-full p-1 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

