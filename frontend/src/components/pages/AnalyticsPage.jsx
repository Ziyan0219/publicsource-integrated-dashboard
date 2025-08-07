import React, { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChartContainer } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from 'recharts';

const AnalyticsPage = ({ stories, metrics }) => {
  // Process data for charts
  const chartData = useMemo(() => {
    // Enhanced geographic distribution analysis
    const geoDistribution = {};
    const areaCombinations = {};
    let totalMentions = 0;
    let multiAreaStories = 0;
    
    stories.forEach(story => {
      if (story.geographic_area) {
        const areas = story.geographic_area.split(/[,;/|]/).map(a => a.trim()).filter(a => a);
        
        // Count multi-area stories
        if (areas.length > 1) {
          multiAreaStories++;
          
          // Track area combinations for multi-area stories
          const sortedAreas = areas.sort().join(', ');
          areaCombinations[sortedAreas] = (areaCombinations[sortedAreas] || 0) + 1;
        }
        
        areas.forEach(area => {
          geoDistribution[area] = (geoDistribution[area] || 0) + 1;
          totalMentions++;
        });
      }
    });

    const geoData = Object.entries(geoDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ 
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        value
      }));

    // Process area combinations data
    const areaCombinationsData = Object.entries(areaCombinations)
      .sort(([,a], [,b]) => b - a)
      .map(([areas, count]) => ({ areas, count }));

    // Debug logging (can be removed in production)
    console.log('Geographic Analysis:', {
      totalStories: stories.length,
      multiAreaStories,
      totalMentions,
      averageAreasPerStory: (totalMentions / stories.length).toFixed(1),
      geoDataSample: geoData.slice(0, 3),
      topCombinations: areaCombinationsData.slice(0, 3)
    });

    // Category breakdown data
    const categoryData = {};
    stories.forEach(story => {
      if (story.umbrella) {
        const categories = story.umbrella.split(/[,;/|]/).map(c => c.trim());
        categories.forEach(category => {
          categoryData[category] = (categoryData[category] || 0) + 1;
        });
      }
    });

    const categoryChartData = Object.entries(categoryData)
      .slice(0, 10)
      .map(([name, value]) => ({ name, stories: value }));

    // Temporal trend data (mock data for demonstration)
    const trendData = [
      { month: 'Jan', stories: 45 },
      { month: 'Feb', stories: 52 },
      { month: 'Mar', stories: 48 },
      { month: 'Apr', stories: 61 },
      { month: 'May', stories: 55 },
      { month: 'Jun', stories: 67 },
      { month: 'Jul', stories: 73 }
    ];

    return { 
      geoData, 
      categoryChartData, 
      trendData, 
      totalMentions, 
      multiAreaStories, 
      areaCombinations: areaCombinationsData 
    };
  }, [stories]);

  const chartConfig = {
    stories: {
      label: "Stories",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Coverage</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.totalStories}</p>
                <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Geographic Reach</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.areasCount}</p>
                <p className="text-xs text-gray-500 mt-1">Across Pittsburgh</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-3xl font-bold text-gray-900">+18%</p>
                <p className="text-xs text-gray-500 mt-1">Monthly increase</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Coverage Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Coverage</CardTitle>
            <CardDescription>Story mentions by Pittsburgh areas (stories can cover multiple areas)</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.geoData && chartData.geoData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData.geoData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                      height={60}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} stories`, 'Coverage']}
                      labelFormatter={(label) => {
                        const item = chartData.geoData.find(d => d.name === label);
                        return item?.fullName || label;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(210 100% 50%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p>No geographic data available</p>
                  <p className="text-sm mt-1">Stories: {stories.length}</p>
                </div>
              </div>
            )}
            
            {/* Coverage Statistics */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Area Mentions:</span>
                  <span className="ml-2 font-medium">{chartData.totalMentions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Multi-Area Stories:</span>
                  <span className="ml-2 font-medium">{chartData.multiAreaStories}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Coverage Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Coverage Overlap Analysis</CardTitle>
            <CardDescription>How stories are distributed across areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Coverage Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stories.length - chartData.multiAreaStories}</div>
                  <div className="text-sm text-blue-700">Single Area Stories</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {((stories.length - chartData.multiAreaStories) / stories.length * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{chartData.multiAreaStories}</div>
                  <div className="text-sm text-green-700">Multi-Area Stories</div>
                  <div className="text-xs text-green-600 mt-1">
                    {(chartData.multiAreaStories / stories.length * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Coverage Distribution */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Coverage Distribution</h4>
                <div className="space-y-2">
                  {chartData.geoData.slice(0, 6).map((area, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate" title={area.fullName}>
                        {area.name}
                      </span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(area.value / Math.max(...chartData.geoData.map(d => d.value))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{area.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="pt-4 border-t bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600">
                  <strong>Total Area Mentions:</strong> {chartData.totalMentions} 
                  <span className="ml-3">
                    <strong>Avg per Story:</strong> {(chartData.totalMentions / stories.length).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category and Trend Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Stories by content category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stories" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Most Covered Combinations */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Area Combinations</CardTitle>
            <CardDescription>Geographic area combinations that appear together</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.areaCombinations && chartData.areaCombinations.slice(0, 8).map((combo, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate" title={combo.areas}>
                      {combo.areas.length > 60 ? combo.areas.substring(0, 60) + '...' : combo.areas}
                    </div>
                    <div className="text-xs text-gray-500">
                      {combo.count === 1 ? '1 story' : `${combo.count} stories`}
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-bold text-blue-600">{combo.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temporal Trend Area Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Story Trends</CardTitle>
            <CardDescription>Monthly story publication trends</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="stories" 
                  stroke="hsl(var(--chart-1))" 
                  fill="hsl(var(--chart-1))" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Export Functionality */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Download analytics data and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center">
              <Download className="h-5 w-5 mb-2" />
              <span className="text-sm">CSV Export</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center">
              <Download className="h-5 w-5 mb-2" />
              <span className="text-sm">PDF Report</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center">
              <Download className="h-5 w-5 mb-2" />
              <span className="text-sm">Excel Data</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center">
              <Download className="h-5 w-5 mb-2" />
              <span className="text-sm">JSON Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.filteredCount}</div>
            <div className="text-sm text-gray-600">Active Stories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.categoriesCount}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.neighborhoodsCount}</div>
            <div className="text-sm text-gray-600">Neighborhoods</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.qualityScore}%</div>
            <div className="text-sm text-gray-600">Quality Score</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;