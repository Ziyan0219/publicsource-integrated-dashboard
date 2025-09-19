import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, MapPin, Building } from 'lucide-react';

const BarChart = ({
  data = [],
  title = "Distribution Analysis",
  dataKey = "value",
  nameKey = "name",
  color = "#82ca9d",
  horizontal = false,
  height = 300,
  maxBars = 10,
  className = "",
  icon = null
}) => {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  };

  // If this is geographic data, let's try without chart config
  const useChartConfig = !title.includes('Geographic');

  // Sort and limit data
  const processedData = data
    .sort((a, b) => b[dataKey] - a[dataKey])
    .slice(0, maxBars);

  // Use original data without percentage conversion
  const chartData = processedData;

  // Debug logging
  if (title.includes('Geographic')) {
    console.log('BarChart DEBUG - Original data:', processedData);
    console.log('BarChart DEBUG - Converted chart data:', chartData);
  }

  const formatTooltipLabel = (label) => {
    return label || 'Unknown';
  };

  const getIcon = () => {
    if (icon) return icon;
    if (title.toLowerCase().includes('geographic') || title.toLowerCase().includes('area')) {
      return <MapPin className="h-4 w-4 text-green-600" />;
    }
    if (title.toLowerCase().includes('category') || title.toLowerCase().includes('umbrella')) {
      return <Building className="h-4 w-4 text-blue-600" />;
    }
    return <BarChart3 className="h-4 w-4 text-purple-600" />;
  };

  const totalValue = processedData.reduce((sum, item) => sum + item[dataKey], 0);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            {getIcon()}
          </div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {totalValue}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {horizontal ? (
            <RechartsBarChart
              data={chartData}
              layout="horizontal"
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                className="text-xs"
              />
              <YAxis
                type="category"
                dataKey={nameKey}
                width={80}
                className="text-xs"
                tickFormatter={(value) =>
                  value.length > 12 ? `${value.substring(0, 12)}...` : value
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={formatTooltipLabel}
                    className="bg-background border border-border shadow-lg"
                  />
                }
              />
              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </RechartsBarChart>
          ) : (
            <RechartsBarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={nameKey}
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(value) =>
                  value.length > 10 ? `${value.substring(0, 10)}...` : value
                }
              />
              <YAxis className="text-xs" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={formatTooltipLabel}
                    className="bg-background border border-border shadow-lg"
                  />
                }
              />
              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </RechartsBarChart>
          )}
        </ChartContainer>

        {/* Data Summary */}
        {processedData.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Top {Math.min(3, processedData.length)} Items:
            </div>
            <div className="grid gap-1">
              {processedData.slice(0, 3).map((item, index) => (
                <div key={item[nameKey]} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    {index + 1}. {item[nameKey]}
                  </span>
                  <span className="font-medium">
                    {item[dataKey]} ({((item[dataKey] / totalValue) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChart;