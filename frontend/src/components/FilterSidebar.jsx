import React from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Checkbox } from './ui/checkbox';

const FilterSidebar = ({ 
  filters, 
  selectedFilters, 
  onFilterChange, 
  onClearFilters, 
  activeFiltersCount,
  searchTerm,
  setSearchTerm
}) => {
  const handleFilterToggle = (filterType, value) => {
    const currentValues = selectedFilters[filterType];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(filterType, newValues);
  };

  const removeFilter = (filterType, value) => {
    const newValues = selectedFilters[filterType].filter(v => v !== value);
    onFilterChange(filterType, newValues);
  };

  const filterSections = [
    { 
      key: 'umbrella', 
      title: 'Categories', 
      data: filters.umbrellas || [], 
      selected: selectedFilters.umbrella 
    },
    { 
      key: 'geographic_area', 
      title: 'Geographic Areas', 
      data: filters.geographic_areas || [], 
      selected: selectedFilters.geographic_area 
    },
    { 
      key: 'neighborhood', 
      title: 'Neighborhoods', 
      data: filters.neighborhoods || [], 
      selected: selectedFilters.neighborhood 
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear All
            </Button>
          </div>
          <div className="space-y-2">
            {filterSections.map(section => 
              section.selected.map(value => (
                <Badge key={`${section.key}-${value}`} variant="secondary" className="mr-2 mb-1">
                  {value}
                  <button 
                    onClick={() => removeFilter(section.key, value)}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {filterSections.map(section => (
            <Collapsible key={section.key} defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-900 hover:text-gray-700">
                <span>{section.title}</span>
                <Badge variant="outline">{section.data.length}</Badge>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                <div className="max-h-48 overflow-y-auto">
                  {section.data.map(value => (
                    <div key={value} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`${section.key}-${value}`}
                        checked={section.selected.includes(value)}
                        onCheckedChange={() => handleFilterToggle(section.key, value)}
                      />
                      <label 
                        htmlFor={`${section.key}-${value}`}
                        className="text-sm text-gray-700 cursor-pointer flex-1 truncate"
                        title={value}
                      >
                        {value}
                      </label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;