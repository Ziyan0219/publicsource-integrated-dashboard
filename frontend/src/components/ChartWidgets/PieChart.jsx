import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart as PieChartIcon, Percent } from 'lucide-react';

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
];

const PieChart = ({
  data = [],
  title = "Composition Analysis",
  dataKey = "value",
  nameKey = "name",
  height = 300,
  showLegend = true,
  showPercentages = true,
  maxItems = 8,
  className = ""
}) => {
  // Process data and add colors
  const processedData = data
    .sort((a, b) => b[dataKey] - a[dataKey])
    .slice(0, maxItems)
    .map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    }));

  const totalValue = processedData.reduce((sum, item) => sum + item[dataKey], 0);

  const chartConfig = processedData.reduce((config, item, index) => {
    config[item[nameKey]] = {
      label: item[nameKey],
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {});

  const formatTooltipLabel = (label) => {
    return label || 'Unknown';
  };

  const CustomTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data[dataKey] / totalValue) * 100).toFixed(1);

      return (
        <div className="bg-background border border-border shadow-lg rounded-lg p-3">
          <p className="font-medium">{data[nameKey]}</p>
          <p className="text-sm text-muted-foreground">
            Count: {data[dataKey]}
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry) => {
    const percentage = ((entry[dataKey] / totalValue) * 100).toFixed(1);
    return showPercentages && percentage > 5 ? `${percentage}%` : '';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <PieChartIcon className="h-4 w-4 text-orange-600" />
          </div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Percent className="h-4 w-4" />
          <span>Total: {totalValue}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<CustomTooltipContent />} />
              {showLegend && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) =>
                    value.length > 15 ? `${value.substring(0, 15)}...` : value
                  }
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '10px'
                  }}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Detailed Breakdown */}
        <div className="mt-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Breakdown:
          </div>
          <div className="grid gap-1 max-h-32 overflow-y-auto">
            {processedData.map((item, index) => {
              const percentage = ((item[dataKey] / totalValue) * 100).toFixed(1);
              return (
                <div key={item[nameKey]} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground truncate max-w-32">
                      {item[nameKey]}
                    </span>
                  </div>
                  <span className="font-medium">
                    {item[dataKey]} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;