import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  BarChart3,
  Activity,
  MapPin,
  Calendar,
  TrendingUp,
  Filter,
  Clock,
  Target,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import NavigationHeader from './NavigationHeader';
import PittsburghMap from './PittsburghMap';
import { TimeSeriesChart, BarChart, PieChart } from './ChartWidgets';
import pittsburghNeighborhoods from '../data/pittsburgh_neighborhoods.json';

// Enhanced geographic data loading
let enhancedGeographicData = null;
try {
  enhancedGeographicData = require('../../../enhanced_geographic_data.json');
} catch (error) {
  console.log('Enhanced geographic data not found, using Pittsburgh neighborhoods only');
}
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

const AnalyticsDashboard = ({ stories = [], filters = {}, onLogout, onDataRefresh }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [geographicFilter, setGeographicFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      if (onDataRefresh) {
        await onDataRefresh();
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000); // Minimum refresh animation duration
    }
  }, [isRefreshing, onDataRefresh]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing && onDataRefresh) {
        handleRefresh();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [handleRefresh, isRefreshing, onDataRefresh]);

  // Process stories with date parsing
  const processedStories = useMemo(() => {
    return stories.map(story => {
      let parsedDate = null;
      try {
        parsedDate = new Date(story.date);
        if (isNaN(parsedDate.getTime())) {
          parsedDate = null;
        }
      } catch (e) {
        parsedDate = null;
      }

      return {
        ...story,
        parsedDate: parsedDate
      };
    }).filter(story => story.parsedDate !== null)
      .sort((a, b) => a.parsedDate - b.parsedDate);
  }, [stories]);

  // Time range filtering
  const filteredStories = useMemo(() => {
    let filtered = processedStories;

    // Custom date range filtering (takes priority over preset ranges)
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate + 'T23:59:59') : null; // Include full end date

      filtered = filtered.filter(story => {
        const storyDate = story.parsedDate;
        if (start && storyDate < start) return false;
        if (end && storyDate > end) return false;
        return true;
      });
    } else if (timeRange !== 'all') {
      // Preset time range filtering
      const now = new Date();
      const cutoffDate = new Date();

      switch (timeRange) {
        case 'last_30_days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case 'last_90_days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case 'last_6_months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'this_year':
          cutoffDate.setFullYear(now.getFullYear(), 0, 1);
          break;
        default:
          break;
      }

      if (timeRange !== 'all') {
        filtered = filtered.filter(story => story.parsedDate >= cutoffDate);
      }
    }

    // Apply additional filters
    if (geographicFilter !== 'all') {
      filtered = filtered.filter(story => {
        if (!story.neighborhoods && !story.geographic_area) return false;

        // Check if story neighborhoods match the selected region
        if (story.neighborhoods) {
          // Handle both string and array formats
          let storyNeighborhoods = [];
          if (Array.isArray(story.neighborhoods)) {
            storyNeighborhoods = story.neighborhoods.flatMap(n =>
              typeof n === 'string' ? n.split(/[,;/|]/).map(v => v.trim()).filter(v => v) : []
            );
          } else if (typeof story.neighborhoods === 'string') {
            storyNeighborhoods = story.neighborhoods.split(/[,;/|]/).map(n => n.trim());
          }

          return storyNeighborhoods.some(neighborhood => {
            const officialNeighborhood = Object.keys(pittsburghNeighborhoods.neighborhoods)
              .find(official => official.toLowerCase() === neighborhood.toLowerCase());
            if (officialNeighborhood) {
              return pittsburghNeighborhoods.neighborhoods[officialNeighborhood]?.region === geographicFilter;
            }
            return false;
          });
        }

        // Fallback to geographic_area if neighborhoods not available
        if (story.geographic_area) {
          const areas = story.geographic_area.split(',').map(a => a.trim());
          return areas.includes(geographicFilter);
        }

        return false;
      });
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(story => {
        if (!story.umbrella) return false;
        const categories = story.umbrella.split(',').map(c => c.trim());
        return categories.includes(categoryFilter);
      });
    }

    return filtered;
  }, [processedStories, timeRange, geographicFilter, categoryFilter, startDate, endDate]);

  // Time series data for stories over time
  const timeSeriesData = useMemo(() => {
    const grouped = {};

    filteredStories.forEach(story => {
      const date = story.parsedDate.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, value: count, stories: count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredStories]);

  // Category distribution data
  const categoryData = useMemo(() => {
    const counts = {};

    filteredStories.forEach(story => {
      if (story.umbrella) {
        // Split by comma and trim whitespace (matching the JSON structure)
        const categories = story.umbrella.split(',').map(c => c.trim());
        categories.forEach(category => {
          if (category) {
            counts[category] = (counts[category] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, count: value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredStories]);

  // Geographic distribution data - aggregate by official regions
  const geographicData = useMemo(() => {
    // Initialize all regions with count 0
    const regionCounts = {};
    Object.keys(pittsburghNeighborhoods.regions).forEach(region => {
      regionCounts[region] = 0;
    });

    filteredStories.forEach(story => {
      if (story.neighborhoods) {
        // Handle both string and array formats
        let storyNeighborhoods = [];
        if (Array.isArray(story.neighborhoods)) {
          storyNeighborhoods = story.neighborhoods.flatMap(n =>
            typeof n === 'string' ? n.split(/[,;/|]/).map(v => v.trim()).filter(v => v) : []
          );
        } else if (typeof story.neighborhoods === 'string') {
          storyNeighborhoods = story.neighborhoods.split(/[,;/|]/).map(n => n.trim());
        }

        const processedStoryRegions = new Set(); // Avoid double counting for stories spanning multiple neighborhoods in same region

        storyNeighborhoods.forEach(neighborhood => {
          // Find official neighborhood and its region
          const officialNeighborhood = Object.keys(pittsburghNeighborhoods.neighborhoods)
            .find(official => official.toLowerCase() === neighborhood.toLowerCase());

          if (officialNeighborhood) {
            const region = pittsburghNeighborhoods.neighborhoods[officialNeighborhood]?.region;
            if (region && !processedStoryRegions.has(region)) {
              regionCounts[region] += 1;
              processedStoryRegions.add(region);
            }
          }
        });
      }
    });

    return Object.entries(regionCounts)
      .map(([name, value]) => ({ name, value, count: value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredStories]);

  // Neighborhood data - use complete neighborhood list from Excel data
  const neighborhoodData = useMemo(() => {
    // Initialize all neighborhoods from Excel with count 0
    const counts = {};
    Object.keys(pittsburghNeighborhoods.neighborhoods).forEach(neighborhood => {
      counts[neighborhood] = 0;
    });

    // Count stories for each neighborhood
    filteredStories.forEach(story => {
      if (story.neighborhoods) {
        // Handle both string and array formats
        let neighborhoods = [];
        if (Array.isArray(story.neighborhoods)) {
          neighborhoods = story.neighborhoods.flatMap(n =>
            typeof n === 'string' ? n.split(/[,;/|]/).map(v => v.trim()).filter(v => v) : []
          );
        } else if (typeof story.neighborhoods === 'string') {
          neighborhoods = story.neighborhoods.split(/[,;/|]/).map(n => n.trim());
        }

        neighborhoods.forEach(neighborhood => {
          // Only count if it's in our official neighborhood list
          if (counts.hasOwnProperty(neighborhood)) {
            counts[neighborhood] += 1;
          } else {
            // Try to find a match (case insensitive or similar)
            const matchedNeighborhood = Object.keys(pittsburghNeighborhoods.neighborhoods)
              .find(official => official.toLowerCase() === neighborhood.toLowerCase());
            if (matchedNeighborhood) {
              counts[matchedNeighborhood] += 1;
            }
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        count: value,
        region: pittsburghNeighborhoods.neighborhoods[name]?.region || 'Unknown'
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredStories]);

  // Get available filter options - use official regions from Excel
  const geographicOptions = useMemo(() => {
    const officialRegions = Object.keys(pittsburghNeighborhoods.regions);
    return ['all', ...officialRegions.sort()];
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = new Set();
    stories.forEach(story => {
      if (story.umbrella) {
        story.umbrella.split(',').forEach(category => {
          const trimmed = category.trim();
          if (trimmed) categories.add(trimmed);
        });
      }
    });
    return ['all', ...Array.from(categories).sort()];
  }, [stories]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    // Calculate comprehensive geographic coverage
    let totalOfficialNeighborhoods = Object.keys(pittsburghNeighborhoods.neighborhoods).length;
    let totalOfficialRegions = Object.keys(pittsburghNeighborhoods.regions).length;
    let totalMunicipalities = 0;

    // Include enhanced geographic data if available
    if (enhancedGeographicData) {
      totalMunicipalities = Object.keys(enhancedGeographicData.allegheny_county_municipalities || {}).length;
      console.log('ENHANCED ANALYTICS - Total municipalities:', totalMunicipalities);
    }

    console.log('ENHANCED ANALYTICS - Total Pittsburgh neighborhoods:', totalOfficialNeighborhoods);
    console.log('ENHANCED ANALYTICS - Total Pittsburgh regions:', totalOfficialRegions);
    console.log('ENHANCED ANALYTICS - Neighborhoods with stories:', neighborhoodData.filter(n => n.value > 0).length);
    console.log('ENHANCED ANALYTICS - Geographic coverage:', {
      neighborhoods: totalOfficialNeighborhoods,
      municipalities: totalMunicipalities,
      total_places: totalOfficialNeighborhoods + totalMunicipalities
    });

    const totalStories = filteredStories.length;
    const totalCategories = categoryData.length;
    const totalAreas = geographicData.length;
    // Show combined coverage: Pittsburgh neighborhoods + Allegheny County municipalities
    const totalNeighborhoods = totalOfficialNeighborhoods + totalMunicipalities;

    // Calculate average stories per day
    const dateRange = timeSeriesData.length > 0 ?
      (new Date(timeSeriesData[timeSeriesData.length - 1].date) - new Date(timeSeriesData[0].date)) / (1000 * 60 * 60 * 24) : 1;
    const avgPerDay = totalStories / (dateRange || 1);

    return {
      totalStories,
      totalCategories,
      totalAreas,
      totalNeighborhoods,
      avgPerDay: avgPerDay.toFixed(1)
    };
  }, [filteredStories, categoryData, geographicData, neighborhoodData, timeSeriesData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      <NavigationHeader onLogout={onLogout} />

      <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-full mx-auto py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Advanced insights and data visualization</p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refresh every 5 minutes
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4 mb-6">
            {/* First row - Time Range and Geographic/Category filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={timeRange} onValueChange={(value) => {
                setTimeRange(value);
                // Clear custom dates when using preset ranges
                if (value !== 'custom') {
                  setStartDate('');
                  setEndDate('');
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>

              <Select value={geographicFilter} onValueChange={setGeographicFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by area" />
                </SelectTrigger>
                <SelectContent>
                  {geographicOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option === 'all' ? 'All Areas' : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option === 'all' ? 'All Categories' : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Second row - Custom Date Range (only show when custom is selected or dates are set) */}
            {(timeRange === 'custom' || startDate || endDate) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value || endDate) {
                        setTimeRange('custom');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (e.target.value || startDate) {
                        setTimeRange('custom');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Actions</label>
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setTimeRange('all');
                    }}
                    className="w-full px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Dates
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stories</p>
                    <p className="text-xl font-bold">{summaryStats.totalStories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-xl font-bold">{summaryStats.totalCategories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Regions</p>
                    <p className="text-xl font-bold">{summaryStats.totalAreas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Places</p>
                    <p className="text-xl font-bold">{summaryStats.totalNeighborhoods}</p>
                    <p className="text-xs text-gray-400">Neighborhoods + Municipalities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg/Day</p>
                    <p className="text-xl font-bold">{summaryStats.avgPerDay}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {enhancedGeographicData && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-indigo-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                      <p className="text-xl font-bold">Enhanced</p>
                      <p className="text-xs text-gray-400">Pittsburgh + County</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeSeriesChart
                data={timeSeriesData}
                title="Stories Over Time"
                dataKey="value"
                xAxisKey="date"
                color="#8884d8"
              />

              <PieChart
                data={categoryData.slice(0, 8)}
                title="Category Distribution"
                dataKey="value"
                nameKey="name"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Geographic Distribution Chart - Custom Implementation */}
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <CardTitle className="text-base font-semibold">Geographic Distribution</CardTitle>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: {geographicData.reduce((sum, item) => sum + item.value, 0)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {geographicData
                      .filter(item => item.value > 0)
                      .slice(0, 8)
                      .map((region, index) => {
                        const maxValue = Math.max(...geographicData.filter(item => item.value > 0).map(item => item.value));
                        const percentage = maxValue > 0 ? (region.value / maxValue) * 100 : 0;
                        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];

                        return (
                          <div key={region.name} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-900">
                                {region.name.length > 15 ? `${region.name.substring(0, 15)}...` : region.name}
                              </span>
                              <span className="font-bold text-gray-900">{region.value}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${Math.max(percentage, 2)}%`,
                                  backgroundColor: colors[index % colors.length]
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}

                    {geographicData.filter(item => item.value > 0).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No geographic data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <BarChart
                data={neighborhoodData.filter(n => n.value > 0).slice(0, 10)}
                title="Top Neighborhoods (with stories)"
                dataKey="value"
                nameKey="name"
                color="#ffc658"
              />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <TimeSeriesChart
                data={timeSeriesData}
                title="Publication Trends"
                dataKey="value"
                xAxisKey="date"
                color="#8884d8"
                height={400}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Peak Day</span>
                      <span className="font-medium">
                        {timeSeriesData.length > 0
                          ? timeSeriesData.reduce((max, item) => item.value > max.value ? item : max, timeSeriesData[0]).date
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Stories/Day</span>
                      <span className="font-medium">{summaryStats.avgPerDay}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Days Covered</span>
                      <span className="font-medium">{timeSeriesData.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <BarChart
                data={categoryData.slice(0, 8)}
                title="Category Trends"
                dataKey="value"
                nameKey="name"
                color="#ff7300"
                horizontal={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PittsburghMap
                  stories={filteredStories}
                  isAnalyticsMode={true}
                  highlightedAreas={geographicFilter !== 'all' ? [geographicFilter] : []}
                />
              </div>

              <div className="space-y-6">
                {/* Geographic Distribution Chart - Custom Implementation */}
                <Card className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">Geographic Distribution</CardTitle>
                        <p className="text-sm text-gray-500">Stories by Pittsburgh Region</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{geographicData.reduce((sum, item) => sum + item.value, 0)}</div>
                      <div className="text-sm text-gray-500">Total Stories</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {geographicData
                      .filter(item => item.value > 0)
                      .map((region, index) => {
                        const percentage = ((region.value / geographicData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
                        const colors = [
                          '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
                          '#ef4444', '#06b6d4', '#84cc16', '#ec4899'
                        ];
                        const maxValue = Math.max(...geographicData.filter(item => item.value > 0).map(item => item.value));
                        const barWidth = (region.value / maxValue) * 100;

                        return (
                          <div key={region.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full shadow-sm"
                                  style={{ backgroundColor: colors[index % colors.length] }}
                                ></div>
                                <span className="font-medium text-gray-900 text-sm">{region.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{percentage}%</span>
                                <span className="font-bold text-gray-900 min-w-[2rem] text-right">{region.value}</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                                style={{
                                  width: `${Math.max(barWidth, 2)}%`,
                                  backgroundColor: colors[index % colors.length]
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}

                    {geographicData.filter(item => item.value > 0).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No geographic data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <BarChart
                  data={neighborhoodData.slice(0, 8)}
                  title="Neighborhood Coverage"
                  dataKey="value"
                  nameKey="name"
                  color="#ffc658"
                  horizontal={true}
                  height={200}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChart
                data={categoryData}
                title="Content Categories"
                dataKey="value"
                nameKey="name"
              />

              <Card>
                <CardHeader>
                  <CardTitle>Content Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Top Categories</h4>
                      <div className="space-y-2">
                        {categoryData.slice(0, 5).map((category, index) => (
                          <div key={category.name} className="flex justify-between items-center">
                            <span className="text-sm">{index + 1}. {category.name}</span>
                            <span className="font-medium">{category.value} stories</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;