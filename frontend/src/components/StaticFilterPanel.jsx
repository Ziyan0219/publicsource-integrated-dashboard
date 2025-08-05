import React from 'react';
import { X, Building, MapPin, Home, ChevronDown, ChevronUp } from 'lucide-react';

const StaticFilterPanel = ({ filters, selectedFilters, onFilterChange, onClearFilters }) => {
  const [expandedSections, setExpandedSections] = React.useState({
    umbrella: true,
    geographic_area: true,
    neighborhood: true
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
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    onFilterChange(filterType, newValues);
  };

  const renderFilterSection = (title, icon, filterType, options, colorScheme) => {
    const selectedValues = selectedFilters[filterType] || [];
    const isExpanded = expandedSections[filterType];
    
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className={`${colorScheme.headerBg} p-4 border-b-2 border-gray-200`}>
          <button
            onClick={() => toggleSection(filterType)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${colorScheme.iconBg} rounded-xl flex items-center justify-center border-2 ${colorScheme.iconBorder}`}>
                {React.cloneElement(icon, { className: `h-5 w-5 ${colorScheme.iconColor}` })}
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">{title}</span>
                {selectedValues.length > 0 && (
                  <div className={`mt-1 inline-block px-3 py-1 text-xs rounded-full font-bold ${colorScheme.badgeBg} ${colorScheme.badgeText} border ${colorScheme.badgeBorder}`}>
                    {selectedValues.length} selected
                  </div>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${colorScheme.chevronBg}`}>
              <ChevronDown className={`h-5 w-5 ${colorScheme.chevronColor} transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>
        
        {/* Content */}
        {isExpanded && (
          <div className="p-4 bg-gray-50 max-h-64 overflow-y-auto">
            {options && options.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {options.map(option => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={() => handleCheckboxChange(filterType, option)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedValues.includes(option) 
                          ? `${colorScheme.checkboxBg} ${colorScheme.checkboxBorder}` 
                          : 'bg-white border-gray-300'
                      }`}>
                        {selectedValues.includes(option) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-700 font-medium flex-1">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  {React.cloneElement(icon, { className: "h-8 w-8 text-gray-400" })}
                </div>
                <p className="text-gray-500 font-medium">No options available</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const colorSchemes = {
    umbrella: {
      headerBg: 'bg-blue-50',
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      iconBorder: 'border-blue-700',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white',
      badgeBorder: 'border-blue-700',
      chevronBg: 'bg-blue-100',
      chevronColor: 'text-blue-600',
      checkboxBg: 'bg-blue-600',
      checkboxBorder: 'border-blue-700'
    },
    geographic_area: {
      headerBg: 'bg-green-50',
      iconBg: 'bg-green-600',
      iconColor: 'text-white',
      iconBorder: 'border-green-700',
      badgeBg: 'bg-green-600',
      badgeText: 'text-white',
      badgeBorder: 'border-green-700',
      chevronBg: 'bg-green-100',
      chevronColor: 'text-green-600',
      checkboxBg: 'bg-green-600',
      checkboxBorder: 'border-green-700'
    },
    neighborhood: {
      headerBg: 'bg-orange-50',
      iconBg: 'bg-orange-600',
      iconColor: 'text-white',
      iconBorder: 'border-orange-700',
      badgeBg: 'bg-orange-600',
      badgeText: 'text-white',
      badgeBorder: 'border-orange-700',
      chevronBg: 'bg-orange-100',
      chevronColor: 'text-orange-600',
      checkboxBg: 'bg-orange-600',
      checkboxBorder: 'border-orange-700'
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Filter Options</h3>
            <p className="text-gray-600">Refine your story search</p>
          </div>
        </div>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg border-2 border-red-200 font-semibold hover:bg-red-200"
        >
          <X className="h-4 w-4" />
          Clear All
        </button>
      </div>

      {/* Filter Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderFilterSection(
          'Category',
          <Building />,
          'umbrella',
          filters.umbrellas,
          colorSchemes.umbrella
        )}

        {renderFilterSection(
          'Geographic Area',
          <MapPin />,
          'geographic_area',
          filters.geographic_areas,
          colorSchemes.geographic_area
        )}

        {renderFilterSection(
          'Neighborhood',
          <Home />,
          'neighborhood',
          filters.neighborhoods,
          colorSchemes.neighborhood
        )}
      </div>

      {/* Active Filters Summary */}
      {((selectedFilters.umbrella || []).length > 0 || 
        (selectedFilters.geographic_area || []).length > 0 || 
        (selectedFilters.neighborhood || []).length > 0) && (
        <div className="mt-6 bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-800">Active Filters</h4>
          </div>
          
          <div className="space-y-3">
            {(selectedFilters.umbrella || []).length > 0 && (
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-2">Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedFilters.umbrella || []).map(value => (
                    <span key={`umbrella-${value}`} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium border-2 border-blue-200">
                      <Building className="h-3 w-3" />
                      {value}
                      <button
                        onClick={() => handleCheckboxChange('umbrella', value)}
                        className="ml-1 w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center hover:bg-blue-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(selectedFilters.geographic_area || []).length > 0 && (
              <div>
                <p className="text-sm font-semibold text-green-700 mb-2">Geographic Areas:</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedFilters.geographic_area || []).map(value => (
                    <span key={`geo-${value}`} className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium border-2 border-green-200">
                      <MapPin className="h-3 w-3" />
                      {value}
                      <button
                        onClick={() => handleCheckboxChange('geographic_area', value)}
                        className="ml-1 w-4 h-4 bg-green-200 rounded-full flex items-center justify-center hover:bg-green-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(selectedFilters.neighborhood || []).length > 0 && (
              <div>
                <p className="text-sm font-semibold text-orange-700 mb-2">Neighborhoods:</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedFilters.neighborhood || []).map(value => (
                    <span key={`neigh-${value}`} className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium border-2 border-orange-200">
                      <Home className="h-3 w-3" />
                      {value}
                      <button
                        onClick={() => handleCheckboxChange('neighborhood', value)}
                        className="ml-1 w-4 h-4 bg-orange-200 rounded-full flex items-center justify-center hover:bg-orange-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticFilterPanel;

