import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children, stories = [] }) => {
  // Global state for unified data relationships
  const [globalFilters, setGlobalFilters] = useState({
    startDate: '2022-01-01',
    endDate: 'now',
    geographicAreas: [],
    categories: [],
    neighborhoods: []
  });

  // Enhanced story processing that works across all components
  const processedStories = useMemo(() => {
    const parsedStories = stories.map(story => {
      let parsedDate = null;
      
      try {
        parsedDate = new Date(story.date);
        
        if (isNaN(parsedDate.getTime())) {
          const dateStr = story.date.toString();
          const formats = [
            /(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/, // ISO format
            /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
            /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY
            /(\w{3})\s+(\d{1,2}),?\s+(\d{4})/, // Mon DD, YYYY
          ];
          
          for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
              if (format === formats[0]) {
                parsedDate = new Date(dateStr);
              } else if (format === formats[1]) {
                parsedDate = new Date(match[1], match[2] - 1, match[3]);
              } else if (format === formats[2] || format === formats[3]) {
                parsedDate = new Date(match[3], match[1] - 1, match[2]);
              } else if (format === formats[4]) {
                const months = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,
                               'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
                parsedDate = new Date(match[3], months[match[1]], match[2]);
              }
              if (!isNaN(parsedDate.getTime())) break;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse date:', story.date);
      }
      
      return {
        ...story,
        parsedDate: parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null
      };
    }).filter(story => story.parsedDate !== null)
      .sort((a, b) => a.parsedDate - b.parsedDate);

    return parsedStories;
  }, [stories]);

  // Global data timeline (2022-now framework)
  const dataTimeline = useMemo(() => {
    if (processedStories.length === 0) {
      return {
        actualMin: new Date('2022-01-01'),
        actualMax: new Date(),
        dataMin: new Date('2022-01-01'), 
        dataMax: new Date(),
        totalYears: 4,
        hasData: false,
        yearCoverage: []
      };
    }
    
    const actualMin = processedStories[0].parsedDate;
    const actualMax = processedStories[processedStories.length - 1].parsedDate;
    const expectedMin = new Date('2022-01-01');
    const expectedMax = new Date();
    
    // Calculate comprehensive year coverage
    const yearCoverage = [];
    for (let year = 2022; year <= expectedMax.getFullYear(); year++) {
      const yearStories = processedStories.filter(story => 
        story.parsedDate.getFullYear() === year
      );
      
      // Monthly breakdown for detailed visualization
      const monthlyBreakdown = [];
      for (let month = 0; month < 12; month++) {
        const monthStories = yearStories.filter(story => 
          story.parsedDate.getMonth() === month
        );
        monthlyBreakdown.push({
          month,
          count: monthStories.length,
          stories: monthStories
        });
      }
      
      yearCoverage.push({ 
        year, 
        count: yearStories.length, 
        hasData: yearStories.length > 0,
        monthlyBreakdown,
        stories: yearStories
      });
    }
    
    return {
      actualMin,
      actualMax,
      dataMin: expectedMin,
      dataMax: expectedMax,
      totalYears: expectedMax.getFullYear() - 2022 + 1,
      hasData: true,
      yearCoverage,
      totalStories: processedStories.length
    };
  }, [processedStories]);

  // Filtered stories based on global filters
  const filteredStories = useMemo(() => {
    if (processedStories.length === 0) return [];
    
    const startDate = globalFilters.startDate === '2022-01-01' ? new Date('2022-01-01') : new Date(globalFilters.startDate);
    const endDate = globalFilters.endDate === 'now' ? new Date() : new Date(globalFilters.endDate);
    
    return processedStories.filter(story => {
      // Date filter
      const storyDate = story.parsedDate;
      if (storyDate < startDate || storyDate > endDate) return false;
      
      // Geographic filter
      if (globalFilters.geographicAreas.length > 0) {
        const storyAreas = story.geographic_area ? 
          story.geographic_area.split(/[,;/|]/).map(v => v.trim()).filter(v => v) : [];
        if (!storyAreas.some(area => globalFilters.geographicAreas.includes(area))) {
          return false;
        }
      }
      
      // Category filter  
      if (globalFilters.categories.length > 0) {
        const storyCategories = story.umbrella ?
          story.umbrella.split(/[,;/|]/).map(v => v.trim()).filter(v => v) : [];
        if (!storyCategories.some(cat => globalFilters.categories.includes(cat))) {
          return false;
        }
      }
      
      // Neighborhood filter
      if (globalFilters.neighborhoods.length > 0) {
        const storyNeighborhoods = story.neighborhoods ?
          story.neighborhoods.split(/[,;/|]/).map(v => v.trim()).filter(v => v) : [];
        if (!storyNeighborhoods.some(n => globalFilters.neighborhoods.includes(n))) {
          return false;
        }
      }
      
      return true;
    });
  }, [processedStories, globalFilters]);

  // Available filter options
  const filterOptions = useMemo(() => {
    const geographicAreas = new Set();
    const categories = new Set();
    const neighborhoods = new Set();
    
    processedStories.forEach(story => {
      // Geographic areas
      if (story.geographic_area) {
        story.geographic_area.split(/[,;/|]/).map(v => v.trim()).filter(v => v)
          .forEach(area => geographicAreas.add(area));
      }
      
      // Categories
      if (story.umbrella) {
        story.umbrella.split(/[,;/|]/).map(v => v.trim()).filter(v => v)
          .forEach(cat => categories.add(cat));
      }
      
      // Neighborhoods
      if (story.neighborhoods) {
        story.neighborhoods.split(/[,;/|]/).map(v => v.trim()).filter(v => v)
          .forEach(n => neighborhoods.add(n));
      }
    });
    
    return {
      geographicAreas: Array.from(geographicAreas).sort(),
      categories: Array.from(categories).sort(),
      neighborhoods: Array.from(neighborhoods).sort()
    };
  }, [processedStories]);

  // Update global filters
  const updateFilters = (newFilters) => {
    setGlobalFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Quick preset filters
  const applyPresetFilter = (preset) => {
    const presets = {
      'all': {
        startDate: '2022-01-01',
        endDate: 'now',
        geographicAreas: [],
        categories: [],
        neighborhoods: []
      },
      'current_year': {
        startDate: '2025-01-01',
        endDate: 'now',
        geographicAreas: [],
        categories: [],
        neighborhoods: []
      },
      'last_6m': {
        startDate: new Date(Date.now() - 6*30*24*60*60*1000).toISOString().split('T')[0],
        endDate: 'now',
        geographicAreas: [],
        categories: [],
        neighborhoods: []
      }
    };
    
    if (presets[preset]) {
      setGlobalFilters(presets[preset]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setGlobalFilters({
      startDate: '2022-01-01',
      endDate: 'now',
      geographicAreas: [],
      categories: [],
      neighborhoods: []
    });
  };

  const contextValue = {
    // Data
    processedStories,
    filteredStories,
    dataTimeline,
    
    // Filters
    globalFilters,
    filterOptions,
    updateFilters,
    applyPresetFilter,
    clearFilters,
    
    // Stats
    totalStories: processedStories.length,
    filteredCount: filteredStories.length,
    filterActive: globalFilters.geographicAreas.length > 0 || 
                  globalFilters.categories.length > 0 || 
                  globalFilters.neighborhoods.length > 0 ||
                  globalFilters.startDate !== '2022-01-01' ||
                  globalFilters.endDate !== 'now'
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;