import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import {
  Brain,
  TrendingUp,
  MapPin,
  Users,
  AlertTriangle,
  Target,
  Lightbulb,
  BarChart3,
  Clock,
  Zap,
  Eye,
  RefreshCw,
  ChevronRight,
  Star,
  TrendingDown,
  Calendar,
  Activity
} from 'lucide-react';
import NavigationHeader from './NavigationHeader';

const AIStrategicDashboard = ({ onLogout }) => {
  const [insights, setInsights] = useState({
    coverage_gaps: [],
    emerging_trends: [],
    story_opportunities: [],
    performance_predictions: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadStrategicInsights();
  }, []);

  const loadStrategicInsights = async () => {
    setLoading(true);
    try {
      // Enhanced mock data with better structure for visualization
      const mockInsights = {
        coverage_gaps: [
          {
            type: 'gap',
            priority: 'high',
            title: 'Underserved Communities',
            description: 'Several neighborhoods lack adequate coverage',
            affected_areas: ['Hill District', 'Homewood', 'Larimer', 'East Liberty', 'Garfield'],
            severity_score: 85,
            impact_level: 'High',
            metrics: {
              total_underserved: 5,
              avg_coverage: 2.3,
              coverage_gap_percentage: 65,
              affected_population: 15000
            },
            recommendation: 'Assign dedicated reporter to Hill District/Homewood beat',
            confidence: 0.9
          },
          {
            type: 'trend',
            priority: 'medium',
            title: 'Weekend Coverage Gap',
            description: 'Significant drop in weekend story publication',
            affected_areas: [],
            severity_score: 60,
            impact_level: 'Medium',
            metrics: {
              weekend_stories: 15,
              weekday_avg: 25,
              gap_percentage: 40,
              missed_opportunities: 8
            },
            recommendation: 'Implement weekend rotation schedule',
            confidence: 0.8
          }
        ],
        emerging_trends: [
          {
            type: 'trend',
            priority: 'high',
            title: 'Housing & Development Crisis',
            description: 'Accelerating gentrification concerns across east neighborhoods',
            affected_areas: ['Lawrenceville', 'Strip District', 'East Liberty', 'Garfield'],
            trend_strength: 87,
            velocity: 'Accelerating',
            metrics: {
              story_count: 12,
              growth_rate: 45,
              community_impact: 'High',
              policy_relevance: 95
            },
            recommendation: 'Launch investigative series on affordable housing',
            confidence: 0.85
          },
          {
            type: 'trend',
            priority: 'medium',
            title: 'Transportation Infrastructure',
            description: 'Growing focus on public transit and bike infrastructure',
            affected_areas: ['Oakland', 'Squirrel Hill', 'Shadyside'],
            trend_strength: 68,
            velocity: 'Steady',
            metrics: {
              story_count: 8,
              growth_rate: 25,
              community_impact: 'Medium',
              policy_relevance: 75
            },
            recommendation: 'Coordinate with transportation beat reporter',
            confidence: 0.78
          }
        ],
        recommendations: [
          {
            type: 'immediate_action',
            priority: 'high',
            title: 'Address Coverage Equity Gap',
            description: 'Immediate action needed for underserved neighborhoods',
            impact_score: 92,
            effort_level: 'Medium',
            timeline: '2-4 weeks',
            actions: [
              'Assign dedicated reporter to Hill District/Homewood beat',
              'Establish community partnerships in underserved areas',
              'Create mobile reporting schedule for weekend coverage'
            ],
            expected_impact: 'Improved community engagement and coverage equity',
            metrics: {
              stories_increase: 40,
              community_reach: 15000,
              engagement_boost: 35
            }
          },
          {
            type: 'resource_allocation',
            priority: 'medium',
            title: 'Strategic Beat Restructuring',
            description: 'Optimize reporter assignments based on emerging trends',
            impact_score: 78,
            effort_level: 'High',
            timeline: '4-8 weeks',
            actions: [
              'Cross-train housing policy reporter for multi-neighborhood coverage',
              'Create transportation beat covering eastern neighborhoods',
              'Develop community liaison program'
            ],
            expected_impact: 'Better coverage efficiency and community relevance',
            metrics: {
              efficiency_gain: 25,
              source_network: 50,
              story_quality: 20
            }
          }
        ]
      };

      setInsights(mockInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load strategic insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority, element = 'bg') => {
    const colors = {
      high: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        accent: 'bg-red-500'
      },
      medium: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        accent: 'bg-amber-500'
      },
      low: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        accent: 'bg-blue-500'
      }
    };
    return colors[priority]?.[element] || colors.medium[element];
  };

  const getSeverityColor = (score) => {
    if (score >= 80) return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
    if (score >= 60) return { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' };
    return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <div className="relative">
            <Brain className="h-16 w-16 mx-auto text-purple-600 mb-4" />
            <div className="absolute -top-1 -right-1">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis in Progress</h3>
          <p className="text-gray-600 mb-4">Analyzing coverage patterns and generating strategic insights...</p>
          <div className="w-64 mx-auto">
            <Progress value={75} className="h-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader onLogout={onLogout} />

      {/* Main Content */}
      <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-full mx-auto py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Strategic Analytics</h1>
              <p className="text-gray-600">Powered by advanced ML - Last updated: {lastUpdated?.toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-green-600 flex items-center bg-green-50 px-3 py-1.5 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              All systems operational
            </div>
            <button
              onClick={loadStrategicInsights}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm rounded-lg border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Eye className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="coverage" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Coverage Gaps
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Emerging Trends
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Lightbulb className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-red-500 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Coverage Gaps</p>
                      <p className="text-3xl font-bold text-red-600">{insights.coverage_gaps.length}</p>
                      <p className="text-xs text-red-500 mt-1">Needs attention</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Trending Topics</p>
                      <p className="text-3xl font-bold text-blue-600">{insights.emerging_trends.length}</p>
                      <p className="text-xs text-blue-500 mt-1">Active monitoring</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-amber-500 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Recommendations</p>
                      <p className="text-3xl font-bold text-amber-600">{insights.recommendations.length}</p>
                      <p className="text-xs text-amber-500 mt-1">Ready to implement</p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Lightbulb className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">AI Confidence</p>
                      <p className="text-3xl font-bold text-purple-600">87%</p>
                      <p className="text-xs text-purple-500 mt-1">High accuracy</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Brain className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Priority Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader className="bg-red-50 border-b">
                  <CardTitle className="flex items-center text-red-800">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    High-Priority Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {insights.coverage_gaps.filter(gap => gap.priority === 'high').map((gap, index) => (
                      <div key={index} className="bg-white border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{gap.title}</h4>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                            {gap.impact_level}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{gap.description}</p>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Severity Score</span>
                            <span>{gap.severity_score}%</span>
                          </div>
                          <Progress value={gap.severity_score} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Affects {gap.affected_areas.length} areas
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-amber-50 border-b">
                  <CardTitle className="flex items-center text-amber-800">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Top Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {insights.recommendations.map((rec, index) => (
                      <div key={index} className="bg-white border border-amber-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="text-xs text-amber-600 font-medium">{rec.impact_score}%</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
                          <div>
                            <span className="block font-medium">Effort Level</span>
                            <span>{rec.effort_level}</span>
                          </div>
                          <div>
                            <span className="block font-medium">Timeline</span>
                            <span>{rec.timeline}</span>
                          </div>
                        </div>
                        <button className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm py-2 rounded-lg transition-colors flex items-center justify-center">
                          View Action Plan
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Coverage Gaps Tab */}
          <TabsContent value="coverage" className="space-y-6">
            {insights.coverage_gaps.map((gap, index) => (
              <Card key={index} className={`shadow-lg border-l-4 ${getPriorityColor(gap.priority, 'border')}`}>
                <CardHeader className={`${getPriorityColor(gap.priority, 'bg')} border-b`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`flex items-center ${getPriorityColor(gap.priority, 'text')}`}>
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      {gap.title}
                    </CardTitle>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(gap.priority, 'bg')} ${getPriorityColor(gap.priority, 'text')}`}>
                        {gap.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Confidence: {(gap.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 text-lg">{gap.description}</p>

                  {/* Key Metrics Visual */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{gap.metrics?.coverage_gap_percentage || 0}%</div>
                      <div className="text-xs text-gray-500">Coverage Gap</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{gap.metrics?.affected_population || 0}</div>
                      <div className="text-xs text-gray-500">People Affected</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{gap.metrics?.total_underserved || 0}</div>
                      <div className="text-xs text-gray-500">Areas</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{gap.severity_score}%</div>
                      <div className="text-xs text-gray-500">Severity</div>
                    </div>
                  </div>

                  {gap.affected_areas.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Affected Areas
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {gap.affected_areas.map((area, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Recommended Action
                    </h4>
                    <p className="text-blue-800">{gap.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Enhanced Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {insights.emerging_trends.map((trend, index) => (
              <Card key={index} className="shadow-lg border-l-4 border-blue-500">
                <CardHeader className="bg-blue-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-blue-800">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      {trend.title}
                    </CardTitle>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {trend.velocity}
                      </span>
                      <span className="text-xs text-gray-500">
                        Strength: {trend.trend_strength}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 text-lg">{trend.description}</p>

                  {/* Trend Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-900">{trend.metrics.story_count}</div>
                      <div className="text-xs text-blue-600">Related Stories</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-900">+{trend.metrics.growth_rate}%</div>
                      <div className="text-xs text-green-600">Growth Rate</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-900">{trend.metrics.policy_relevance}%</div>
                      <div className="text-xs text-purple-600">Policy Relevance</div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-amber-900">{trend.metrics.community_impact}</div>
                      <div className="text-xs text-amber-600">Impact Level</div>
                    </div>
                  </div>

                  {trend.affected_areas.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Geographic Spread
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {trend.affected_areas.map((area, i) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Strategic Opportunity
                    </h4>
                    <p className="text-green-800">{trend.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Story Performance Prediction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                    <Brain className="h-16 w-16 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Story Performance Predictor</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Enter story concepts to get AI-powered predictions for engagement, reach, and optimal timing.
                  </p>
                  <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Launch Story Predictor
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {insights.recommendations.map((rec, index) => (
              <Card key={index} className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-amber-800">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      {rec.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                        {rec.effort_level} Effort
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        {rec.impact_score}% Impact
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 text-lg">{rec.description}</p>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-900">+{rec.metrics?.stories_increase || 0}%</div>
                      <div className="text-xs text-blue-600">Stories Increase</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-900">{rec.metrics?.community_reach || 0}</div>
                      <div className="text-xs text-green-600">Community Reach</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-900">+{rec.metrics?.engagement_boost || 0}%</div>
                      <div className="text-xs text-purple-600">Engagement Boost</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Action Plan ({rec.timeline})
                    </h4>
                    <div className="space-y-3">
                      {rec.actions.map((action, i) => (
                        <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-gray-700 flex-1">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Expected Impact
                    </h4>
                    <p className="text-green-800">{rec.expected_impact}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIStrategicDashboard;
