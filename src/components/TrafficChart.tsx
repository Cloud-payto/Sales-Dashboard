import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { FrameCategory } from '../types';

interface FramePerformanceChartProps {
  topGrowth: FrameCategory[];
  topDecline: FrameCategory[];
}

const FramePerformanceChart: React.FC<FramePerformanceChartProps> = ({ topGrowth, topDecline }) => {
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

  // Combine and prepare data for chart
  const chartData = [
    ...filteredDecline.slice(0, 5).map(frame => ({
      name: frame.name,
      change: frame.change,
      pct_change: frame.pct_change,
      type: 'decline'
    })),
    ...filteredGrowth.slice(0, 5).map(frame => ({
      name: frame.name,
      change: frame.change,
      pct_change: frame.pct_change,
      type: 'growth'
    }))
  ].sort((a, b) => a.change - b.change);

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Frame Category Performance</h3>
      <p className="text-sm text-gray-600 mb-6">Top 5 growing and declining categories (units YOY)</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4b5563', fontSize: 12 }}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Bar dataKey="change" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.type === 'growth' ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FramePerformanceChart;
