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

  const renderFilterSection = (title, icon, filterType, options) => {
    const selectedValues = selectedFilters[filterType] || [];
    const isExpanded = expandedSections[filterType];
    
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4">
          <button
            onClick={() => toggleSection(filterType)}
            className="w-full flex items-center justify-between text-left hover:bg-white/50 rounded-xl p-2 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                {React.cloneElement(icon, { className: 'h-4 w-4 text-slate-600' })}
              </div>
              <div>
                <span className="font-medium text-slate-900 text-sm">{title}</span>
                {selectedValues.length > 0 && (
                  <div className="mt-0.5 inline-block px-2 py-0.5 text-xs rounded-md font-medium bg-slate-900 text-white">
                    {selectedValues.length}
                  </div>
                )}
              </div>
            </div>
            <div className="p-1">
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>
        
        {/* Content */}
        {isExpanded && (
          <div className="px-4 pb-4 max-h-64 overflow-y-auto">
            {options && options.length > 0 ? (
              <div className="space-y-1">
                {options.map(option => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer hover:bg-white/60 p-2 rounded-lg transition-colors duration-200">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={() => handleCheckboxChange(filterType, option)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-200 ${
                        selectedValues.includes(option) 
                          ? 'bg-slate-900 border-slate-900' 
                          : 'bg-white border-slate-300 hover:border-slate-400'
                      }`}>
                        {selectedValues.includes(option) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-700 font-medium flex-1 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  {React.cloneElement(icon, { className: "h-6 w-6 text-slate-400" })}
                </div>
                <p className="text-slate-500 text-sm">No options available</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Simplified color scheme - now using consistent slate colors
  const colorSchemes = {
    umbrella: {},
    geographic_area: {},
    neighborhood: {}
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
            <Building className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
            <p className="text-xs text-slate-500">Refine your search</p>
          </div>
        </div>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-white/60 rounded-lg transition-colors duration-200 text-sm"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      </div>

      {/* Filter Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
        <div className="mt-5 bg-white/70 backdrop-blur-xl rounded-xl border border-gray-200/60 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
              <Building className="h-3 w-3 text-slate-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Active Filters</h4>
          </div>
          
          <div className="space-y-2">
            {(selectedFilters.umbrella || []).length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Categories:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedFilters.umbrella || []).map(value => (
                    <span key={`umbrella-${value}`} className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                      <Building className="h-2 w-2" />
                      {value}
                      <button
                        onClick={() => handleCheckboxChange('umbrella', value)}
                        className="ml-0.5 w-3 h-3 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors duration-200"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(selectedFilters.geographic_area || []).length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Areas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedFilters.geographic_area || []).map(value => (
                    <span key={`geo-${value}`} className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                      <MapPin className="h-2 w-2" />
                      {value}
                      <button
                        onClick={() => handleCheckboxChange('geographic_area', value)}
                        className="ml-0.5 w-3 h-3 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors duration-200"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(selectedFilters.neighborhood || []).length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Neighborhoods:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedFilters.neighborhood || []).map(value => (
                    <span key={`neigh-${value}`} className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                      <Home className="h-2 w-2" />
                      {value}
                      <button
                        onClick={() => handleCheckboxChange('neighborhood', value)}
                        className="ml-0.5 w-3 h-3 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors duration-200"
                      >
                        <X className="h-2 w-2" />
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

