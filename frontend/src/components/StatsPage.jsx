import React, { useState, useMemo } from 'react';
import { BarChart3, Activity, MapPin, Calendar, TrendingUp, Filter, Clock, ArrowRight, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import NavigationHeader from './NavigationHeader';
import PittsburghMap from './PittsburghMap';

const StatsPage = ({ stories = [], onLogout }) => {
  // Updated state for absolute date ranges (2022-now approach)
  const [selectedStartDate, setSelectedStartDate] = useState('2022-01-01');
  const [selectedEndDate, setSelectedEndDate] = useState('now');
  const [timeGranularity, setTimeGranularity] = useState('month');
  const [groupBy, setGroupBy] = useState('geographic_area');
  const [selectedGeographicArea, setSelectedGeographicArea] = useState('all');
  const [quickSelectPeriod, setQuickSelectPeriod] = useState('all');
  const [viewMode, setViewMode] = useState('overview'); // overview, filtered, details

  // Enhanced story processing with absolute date filtering (2022-now)
  const processedStories = useMemo(() => {
    const parsedStories = stories.map(story => {
      let parsedDate = null;
      
      try {
        // Try native Date constructor first (handles ISO format properly)
        parsedDate = new Date(story.date);
        
        // If date is invalid, try different formats
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

  // Data timeline and coverage analysis (2022-now framework)
  const dataTimeline = useMemo(() => {
    if (processedStories.length === 0) {
      return {
        actualMin: new Date('2022-01-01'),
        actualMax: new Date(),
        dataMin: new Date('2022-01-01'),
        dataMax: new Date(),
        totalYears: 3,
        hasData: false,
        yearCoverage: []
      };
    }
    
    const actualMin = processedStories[0].parsedDate;
    const actualMax = processedStories[processedStories.length - 1].parsedDate;
    const expectedMin = new Date('2022-01-01');
    const expectedMax = new Date();
    
    // Calculate year coverage for visualization
    const yearCoverage = [];
    for (let year = 2022; year <= expectedMax.getFullYear(); year++) {
      const yearStories = processedStories.filter(story => 
        story.parsedDate.getFullYear() === year
      ).length;
      yearCoverage.push({ year, count: yearStories, hasData: yearStories > 0 });
    }
    
    return {
      actualMin,
      actualMax, 
      dataMin: expectedMin,
      dataMax: expectedMax,
      totalYears: expectedMax.getFullYear() - 2022 + 1,
      hasData: true,
      yearCoverage
    };
  }, [processedStories]);

  // Absolute date filtering (2022-now)
  const filteredStories = useMemo(() => {
    if (processedStories.length === 0) return [];
    
    const startDate = selectedStartDate === '2022-01-01' ? new Date('2022-01-01') : new Date(selectedStartDate);
    const endDate = selectedEndDate === 'now' ? new Date() : new Date(selectedEndDate);
    
    return processedStories.filter(story => {
      const storyDate = story.parsedDate;
      return storyDate >= startDate && storyDate <= endDate;
    });
  }, [processedStories, selectedStartDate, selectedEndDate]);

  // Geographic areas for filtering
  const geographicAreas = useMemo(() => {
    const areas = new Set(['all']);
    filteredStories.forEach(story => {
      const field = story.geographic_area;
      if (field) {
        const values = field.split(/[,;/|]/).map(v => v.trim()).filter(v => v);
        values.forEach(value => areas.add(value));
      }
    });
    return Array.from(areas).sort();
  }, [filteredStories]);

  // Filter by geographic area
  const geoFilteredStories = useMemo(() => {
    if (selectedGeographicArea === 'all') return filteredStories;
    
    return filteredStories.filter(story => {
      const field = story.geographic_area;
      if (!field) return false;
      
      const values = field.split(/[,;/|]/).map(v => v.trim()).filter(v => v);
      return values.includes(selectedGeographicArea);
    });
  }, [filteredStories, selectedGeographicArea]);

  // Time-based geographic distribution
  const timeGeoDistribution = useMemo(() => {
    const distribution = {};
    
    geoFilteredStories.forEach(story => {
      const date = story.parsedDate;
      let timeKey;
      
      switch (timeGranularity) {
        case 'day':
          timeKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          timeKey = weekStart.toISOString().split('T')[0] + ' (Week)';
          break;
        case 'month':
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          timeKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'year':
          timeKey = date.getFullYear().toString();
          break;
        default:
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!distribution[timeKey]) {
        distribution[timeKey] = {};
      }
      
      const field = groupBy === 'geographic_area' ? story.geographic_area : story.umbrella;
      if (field) {
        const values = field.split(/[,;/|]/).map(v => v.trim()).filter(v => v);
        values.forEach(value => {
          distribution[timeKey][value] = (distribution[timeKey][value] || 0) + 1;
        });
      }
    });
    
    return distribution;
  }, [geoFilteredStories, timeGranularity, groupBy]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalStories = geoFilteredStories.length;
    const totalPeriods = Object.keys(timeGeoDistribution).length;
    
    // Most active period
    let mostActiveTime = '';
    let maxStories = 0;
    Object.entries(timeGeoDistribution).forEach(([time, locations]) => {
      const periodTotal = Object.values(locations).reduce((sum, count) => sum + count, 0);
      if (periodTotal > maxStories) {
        maxStories = periodTotal;
        mostActiveTime = time;
      }
    });
    
    // Most covered location
    const locationCounts = {};
    geoFilteredStories.forEach(story => {
      const field = groupBy === 'geographic_area' ? story.geographic_area : story.umbrella;
      if (field) {
        const values = field.split(/[,;/|]/).map(v => v.trim()).filter(v => v);
        values.forEach(value => {
          locationCounts[value] = (locationCounts[value] || 0) + 1;
        });
      }
    });
    
    const mostCoveredLocation = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalStories,
      totalPeriods,
      mostActiveTime,
      maxStories,
      mostCoveredLocation: mostCoveredLocation ? mostCoveredLocation[0] : 'N/A',
      mostCoveredCount: mostCoveredLocation ? mostCoveredLocation[1] : 0
    };
  }, [geoFilteredStories, timeGeoDistribution, groupBy]);

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader onLogout={onLogout} />
      
      <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-full mx-auto py-8">
        {/* Enhanced Page Header with Timeline Overview */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Explore story patterns across time and geography with interactive controls and comprehensive data visualization.
          </p>
          
          {/* Timeline Overview Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Data Timeline (2022 - Now)</span>
                </div>
                <div className="text-sm text-gray-500">
                  {processedStories.length} total stories
                </div>
              </div>
              
              {/* Year Coverage Visualization */}
              <div className="flex gap-1 mb-2">
                {dataTimeline.yearCoverage.map(({ year, count, hasData }) => (
                  <div key={year} className="flex-1 text-center">
                    <div 
                      className={`h-8 rounded-sm flex items-center justify-center text-xs font-medium transition-colors ${
                        hasData 
                          ? 'bg-gradient-to-t from-blue-500 to-blue-400 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300'
                      }`}
                      title={`${year}: ${count} stories`}
                    >
                      {year}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {hasData ? count : 'No data'}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Current Selection Indicator */}
              <div className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
                <span className="font-medium">Viewing:</span> {selectedStartDate} to {selectedEndDate} 
                ({filteredStories.length} stories)
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Analysis Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Grouping Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geographic_area">Geographic Area</SelectItem>
                    <SelectItem value="umbrella">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Granularity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Granularity</label>
                <Select value={timeGranularity} onValueChange={setTimeGranularity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="quarter">Quarterly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Geographic Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Filter</label>
                <Select value={selectedGeographicArea} onValueChange={setSelectedGeographicArea}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {geographicAreas.map(area => (
                      <SelectItem key={area} value={area}>
                        {area === 'all' ? 'All Areas' : area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Redesigned Absolute Time Range Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Time Period
                </label>
                <div className="space-y-3">
                  {/* Preset Time Ranges */}
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: 'all', label: '📊 All Data', start: '2022-01-01', end: 'now', description: '2022 to present' },
                      { key: 'current_year', label: '📅 This Year', start: '2025-01-01', end: 'now', description: '2025 only' },
                      { key: 'last_6m', label: '⚡ Last 6 Months', start: new Date(Date.now() - 6*30*24*60*60*1000).toISOString().split('T')[0], end: 'now', description: 'Recent activity' },
                      { key: 'custom', label: '🎯 Custom Range', start: selectedStartDate, end: selectedEndDate, description: 'Choose specific dates' }
                    ].map(({ key, label, start, end, description }) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (key !== 'custom') {
                            setSelectedStartDate(start);
                            setSelectedEndDate(end);
                          }
                          setQuickSelectPeriod(key);
                        }}
                        className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                          quickSelectPeriod === key
                            ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm text-gray-700'
                        }`}
                        disabled={processedStories.length === 0}
                      >
                        <div className="font-medium text-sm">{label}</div>
                        <div className="text-xs opacity-75 mt-1">{description}</div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Inputs (shown when custom is selected) */}
                  {quickSelectPeriod === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Start Date</label>
                        <input 
                          type="date" 
                          value={selectedStartDate}
                          onChange={(e) => setSelectedStartDate(e.target.value)}
                          min="2022-01-01"
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">End Date</label>
                        <select 
                          value={selectedEndDate}
                          onChange={(e) => setSelectedEndDate(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="now">Now</option>
                          <option value={new Date().toISOString().split('T')[0]}>Today</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Active Selection Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-blue-800">
                        📈 Selected: {selectedStartDate} → {selectedEndDate}
                      </div>
                      <div className="text-sm text-blue-600">
                        {filteredStories.length} stories
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1 flex items-center">
                      <Layers className="h-3 w-3 mr-1" />
                      This selection affects all views: Analytics, Map, and Dashboard
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Stories</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalStories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Time Periods</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalPeriods}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Most Active Period</p>
                  <p className="text-lg font-bold text-gray-900">{summaryStats.mostActiveTime || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{summaryStats.maxStories} stories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Top {groupBy === 'geographic_area' ? 'Area' : 'Category'}</p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {summaryStats.mostCoveredLocation}
                  </p>
                  <p className="text-xs text-gray-500">{summaryStats.mostCoveredCount} stories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Distribution Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Time Distribution Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Time Period</th>
                    <th className="text-left py-3 px-4 font-medium">Total Stories</th>
                    <th className="text-left py-3 px-4 font-medium">Top {groupBy === 'geographic_area' ? 'Area' : 'Category'}</th>
                    <th className="text-left py-3 px-4 font-medium">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(timeGeoDistribution)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 10)
                    .map(([time, locations]) => {
                      const total = Object.values(locations).reduce((sum, count) => sum + count, 0);
                      const topLocation = Object.entries(locations).sort(([,a], [,b]) => b - a)[0];
                      
                      return (
                        <tr key={time} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{time}</td>
                          <td className="py-3 px-4">{total}</td>
                          <td className="py-3 px-4">
                            {topLocation ? `${topLocation[0]} (${topLocation[1]})` : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1 max-w-xs">
                              {Object.entries(locations)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 3)
                                .map(([location, count], idx) => (
                                  <div
                                    key={location}
                                    className={`px-2 py-1 rounded text-xs ${
                                      idx === 0 ? 'bg-blue-100 text-blue-800' :
                                      idx === 1 ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {location}: {count}
                                  </div>
                                ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Map */}
        <PittsburghMap 
          highlightedAreas={selectedGeographicArea === 'all' ? [] : [selectedGeographicArea]} 
        />
      </div>
    </div>
  );
};

export default StatsPage;