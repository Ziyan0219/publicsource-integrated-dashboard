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

  const renderFilterSection = (title, icon, filterType, options, color) => {
    const selectedValues = selectedFilters[filterType] || [];
    const isExpanded = expandedSections[filterType];
    
    return (
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection(filterType)}
          className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-t-lg ${
            isExpanded ? 'border-b border-gray-200' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-gray-700">{title}</span>
            {selectedValues.length > 0 && (
              <span className={`px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-800`}>
                {selectedValues.length}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-3 max-h-48 overflow-y-auto">
            {options && options.length > 0 ? (
              <div className="space-y-2">
                {options.map(option => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => handleCheckboxChange(filterType, option)}
                      className={`rounded border-gray-300 text-${color}-600 focus:ring-${color}-500`}
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No options available</p>
            )}
          </div>
        )}
      </div>
    );
  };

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        {renderFilterSection(
          'Category',
          <Building className="h-4 w-4 text-blue-600" />,
          'umbrella',
          filters.umbrellas,
          'blue'
        )}

        {/* Geographic Area Filter */}
        {renderFilterSection(
          'Geographic Area',
          <MapPin className="h-4 w-4 text-green-600" />,
          'geographic_area',
          filters.geographic_areas,
          'green'
        )}

        {/* Neighborhood Filter */}
        {renderFilterSection(
          'Neighborhood',
          <Home className="h-4 w-4 text-orange-600" />,
          'neighborhood',
          filters.neighborhoods,
          'orange'
        )}
      </div>

      {/* Current Filter Status */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(selectedFilters.umbrella || []).map(value => (
          <span key={`umbrella-${value}`} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Building className="h-3 w-3" />
            {value}
            <button
              onClick={() => handleCheckboxChange('umbrella', value)}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        {(selectedFilters.geographic_area || []).map(value => (
          <span key={`geo-${value}`} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <MapPin className="h-3 w-3" />
            {value}
            <button
              onClick={() => handleCheckboxChange('geographic_area', value)}
              className="ml-1 hover:bg-green-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        {(selectedFilters.neighborhood || []).map(value => (
          <span key={`neigh-${value}`} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
            <Home className="h-3 w-3" />
            {value}
            <button
              onClick={() => handleCheckboxChange('neighborhood', value)}
              className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;

