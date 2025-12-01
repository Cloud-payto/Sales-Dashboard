import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { FrameCategory, ColorGroupDrillDown } from '../types';
import FrameDetailModal from './FrameDetailModal';

interface FramePerformanceChartProps {
  topGrowth: FrameCategory[];
  topDecline: FrameCategory[];
  colorGroupDrillDowns?: { [colorGroup: string]: ColorGroupDrillDown };
}

const FramePerformanceChart: React.FC<FramePerformanceChartProps> = ({
  topGrowth,
  topDecline,
  colorGroupDrillDowns
}) => {
  const [selectedFrame, setSelectedFrame] = useState<{
    name: string;
    data: any;
    drillDown: ColorGroupDrillDown | null;
  } | null>(null);
  // Filter out non-frame items (cases, nose pads, parts, tools, cleaning cloths)
  const filterFramesOnly = (categories: FrameCategory[]) => {
    return categories.filter(frame => {
      const name = frame.name.toLowerCase();
      return !name.includes('case') &&
             !name.includes('nose pad') &&
             !name.includes('cleaning') &&
             !name.includes('parts') &&
             !name.includes('tools') &&
             !name.includes('summit optical');
    });
  };

  const filteredGrowth = filterFramesOnly(topGrowth);
  const filteredDecline = filterFramesOnly(topDecline);

  // Combine all frame categories and prepare data for chart
  const allFrames = [...filteredGrowth, ...filteredDecline];

  // Remove duplicates by name (keep the one with data)
  const uniqueFrames = allFrames.reduce((acc, frame) => {
    if (!acc.find(f => f.name === frame.name)) {
      acc.push(frame);
    }
    return acc;
  }, [] as FrameCategory[]);

  // Define the desired order for frame categories
  const frameOrder = [
    'BLACK DIAMOND',
    'YELLOW',
    'RED',
    'BLUE',
    'GREEN',
    'LIME'
  ];

  const chartData = uniqueFrames.map(frame => ({
    name: frame.name,
    change: frame.change,
    pct_change: frame.pct_change,
    current_year: frame.current_year,
    previous_year: frame.previous_year,
    type: frame.change >= 0 ? 'growth' : 'decline'
  })).sort((a, b) => {
    // Sort by the defined order
    const indexA = frameOrder.indexOf(a.name.toUpperCase());
    const indexB = frameOrder.indexOf(b.name.toUpperCase());

    // If both are in the order list, sort by that order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one is in the order list, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // Otherwise, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  const handleBarClick = (data: any) => {
    // Get drill-down data for this color group if available
    const drillDown = colorGroupDrillDowns?.[data.name.toUpperCase()] || null;

    setSelectedFrame({
      name: data.name,
      data: data,
      drillDown: drillDown
    });
  };

  // Calculate market share data for pie chart
  const totalUnits = chartData.reduce((sum, frame) => sum + frame.current_year, 0);
  const pieData = chartData.map(frame => ({
    name: frame.name,
    value: frame.current_year,
    percentage: ((frame.current_year / totalUnits) * 100).toFixed(1)
  }));

  // Define colors for pie chart (matching the frame categories)
  const COLORS: { [key: string]: string } = {
    'BLACK DIAMOND': '#1a1a1a',
    'YELLOW': '#eab308',
    'RED': '#ef4444',
    'BLUE': '#3b82f6',
    'GREEN': '#22c55e',
    'LIME': '#84cc16'
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.abs(value));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.name}</p>
          <p className={`text-sm ${data.type === 'growth' ? 'text-green-600' : 'text-red-600'}`}>
            {data.change > 0 ? '+' : ''}{formatNumber(data.change)} units
          </p>
          <p className={`text-sm ${data.type === 'growth' ? 'text-green-600' : 'text-red-600'}`}>
            {data.pct_change > 0 ? '+' : ''}{data.pct_change.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-700">
            {formatNumber(data.value)} units
          </p>
          <p className="text-sm font-semibold text-blue-600">
            {data.payload.percentage}% market share
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Frame Category Performance</h3>
      <p className="text-sm text-gray-600 mb-6">All frame color categories (units YOY)</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4b5563', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Bar
            dataKey="change"
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.type === 'growth' ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Hint for users */}
      <p className="text-xs text-gray-500 text-center mt-3">
        Click on any bar to see customer drill-down
      </p>

      {/* Market Share Pie Chart */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Share by Color Group</h3>
        <p className="text-sm text-gray-600 mb-6">Current year distribution (%)</p>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toUpperCase()] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Frame Detail Modal */}
      {selectedFrame && selectedFrame.drillDown && (
        <FrameDetailModal
          frameName={selectedFrame.name}
          frameData={{
            name: selectedFrame.data.name,
            change: selectedFrame.data.change,
            pct_change: selectedFrame.data.pct_change,
            current_year: selectedFrame.data.current_year,
            previous_year: selectedFrame.data.previous_year,
            type: selectedFrame.data.type
          }}
          drillDownData={selectedFrame.drillDown}
          onClose={() => setSelectedFrame(null)}
        />
      )}
    </div>
  );
};

export default FramePerformanceChart;
