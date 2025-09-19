import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, Calendar } from 'lucide-react';

const TimeSeriesChart = ({
  data = [],
  title = "Time Series Analysis",
  dataKey = "value",
  xAxisKey = "date",
  color = "#8884d8",
  height = 300,
  showTrend = true,
  className = ""
}) => {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  };

  const formatXAxisTick = (tickItem) => {
    if (!tickItem) return '';
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTooltipLabel = (label) => {
    if (!label) return '';
    const date = new Date(label);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTrend = () => {
    if (data.length < 2) return null;
    const firstValue = data[0][dataKey];
    const lastValue = data[data.length - 1][dataKey];
    const change = ((lastValue - firstValue) / firstValue) * 100;
    return {
      direction: change >= 0 ? 'up' : 'down',
      percentage: Math.abs(change).toFixed(1)
    };
  };

  const trend = getTrend();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        {showTrend && trend && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className={`h-4 w-4 ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`} />
            <span className={`font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.percentage}%
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={xAxisKey}
                tickFormatter={formatXAxisTick}
                className="text-xs"
              />
              <YAxis
                className="text-xs"
                domain={[0, 6]}
                tickCount={7}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={formatTooltipLabel}
                    className="bg-background border border-border shadow-lg"
                  />
                }
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChart;