import React, { useState, useEffect, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Award, Tag, FileText, Save } from 'lucide-react';
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
  Cell
} from 'recharts';
import { Account, CustomerBrandChange } from '../types';

interface AccountDetailModalProps {
  account: Account;
  brandComparison?: CustomerBrandChange[];
  onClose: () => void;
}

const AccountDetailModal: React.FC<AccountDetailModalProps> = ({ account, brandComparison, onClose }) => {
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showCurrentYear, setShowCurrentYear] = useState(true); // Toggle between CY and PY

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`account-notes-${account['Acct #']}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [account]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.abs(value));
  };

  const pctChange = account['PY Total'] !== 0
    ? ((account.Difference / account['PY Total']) * 100)
    : 0;

  const isGrowing = account.Difference > 0;
  const isNew = account['PY Total'] === 0;

  // Color Group Breakdown (from brand comparison data)
  const colorGroupData = useMemo(() => {
    if (!brandComparison || brandComparison.length === 0) {
      return { cy: [], py: [] };
    }

    // Filter to this account
    const accountBrands = brandComparison.filter(
      b => b.account_number === account['Acct #']
    );

    if (accountBrands.length === 0) {
      return { cy: [], py: [] };
    }

    // Aggregate by color group
    const colorTotalsCY: { [key: string]: number } = {};
    const colorTotalsPY: { [key: string]: number } = {};

    accountBrands.forEach(brand => {
      const color = brand.color_group;
      colorTotalsCY[color] = (colorTotalsCY[color] || 0) + brand.current_year_units;
      colorTotalsPY[color] = (colorTotalsPY[color] || 0) + brand.previous_year_units;
    });

    // Calculate totals
    const totalCY = Object.values(colorTotalsCY).reduce((sum, val) => sum + val, 0);
    const totalPY = Object.values(colorTotalsPY).reduce((sum, val) => sum + val, 0);

    // Convert to arrays with percentages
    const colorsCY = Object.entries(colorTotalsCY)
      .filter(([_, units]) => units > 0)
      .map(([color, units]) => ({
        color_group: color,
        units,
        percentage: totalCY > 0 ? (units / totalCY * 100) : 0
      }))
      .sort((a, b) => b.units - a.units);

    const colorsPY = Object.entries(colorTotalsPY)
      .filter(([_, units]) => units > 0)
      .map(([color, units]) => ({
        color_group: color,
        units,
        percentage: totalPY > 0 ? (units / totalPY * 100) : 0
      }))
      .sort((a, b) => b.units - a.units);

    return { cy: colorsCY, py: colorsPY };
  }, [brandComparison, account]);

  // Define colors for pie/bar charts (matching frame categories)
  const COLOR_MAP: { [key: string]: string } = {
    'BLACK DIAMOND': '#1a1a1a',
    'YELLOW': '#eab308',
    'RED': '#ef4444',
    'BLUE': '#3b82f6',
    'GREEN': '#22c55e',
    'LIME': '#84cc16'
  };

  // Current color group data to display based on toggle
  const activeColorData = showCurrentYear ? colorGroupData.cy : colorGroupData.py;

  // YOY Comparison Bar Chart Data
  const barChartData = [
    {
      period: 'Previous Year',
      sales: account['PY Total'],
      fill: '#94a3b8'
    },
    {
      period: 'Current Year',
      sales: account['CY Total'],
      fill: isGrowing ? '#22c55e' : '#ef4444'
    }
  ];

  // Sales Distribution Pie Chart Data (showing PY vs CY split)
  const pieChartData = [
    {
      name: 'Previous Year',
      value: account['PY Total'],
      color: '#94a3b8'
    },
    {
      name: 'Current Year',
      value: account['CY Total'],
      color: isGrowing ? '#22c55e' : '#ef4444'
    }
  ].filter(item => item.value > 0); // Only show non-zero values

  const saveNotes = () => {
    setIsSavingNotes(true);
    localStorage.setItem(`account-notes-${account['Acct #']}`, notes);
    setTimeout(() => {
      setIsSavingNotes(false);
    }, 500);
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{payload[0].payload.period}</p>
          <p className="text-sm text-gray-700">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / (account['PY Total'] + account['CY Total'])) * 100).toFixed(1);
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-700">{formatCurrency(data.value)}</p>
          <p className="text-sm text-blue-600">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-5 border-b border-gray-200 ${
            isGrowing ? 'bg-green-50' : isNew ? 'bg-blue-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {isGrowing ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{account.Name}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {account.City} • Account #{account['Acct #']}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Previous Year Sales</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(account['PY Total'])}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Current Year Sales</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(account['CY Total'])}
                </div>
              </div>
              <div className={`rounded-lg p-4 ${
                isGrowing ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="text-sm text-gray-600 mb-1">Change</div>
                <div className={`text-2xl font-bold ${
                  isGrowing ? 'text-green-600' : 'text-red-600'
                }`}>
                  {account.Difference > 0 ? '+' : ''}{formatCurrency(account.Difference)}
                </div>
              </div>
              <div className={`rounded-lg p-4 ${
                isGrowing ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="text-sm text-gray-600 mb-1">% Change</div>
                <div className={`text-2xl font-bold ${
                  isGrowing ? 'text-green-600' : 'text-red-600'
                }`}>
                  {pctChange > 0 ? '+' : ''}{pctChange.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setShowCurrentYear(false)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  !showCurrentYear
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous Year
              </button>
              <button
                onClick={() => setShowCurrentYear(true)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  showCurrentYear
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Current Year
              </button>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Color Group Pie Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Frame Color Distribution ({showCurrentYear ? 'CY' : 'PY'})
                </h3>
                {activeColorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={activeColorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ color_group, percentage }) => `${color_group} ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="units"
                      >
                        {activeColorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.color_group] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-gray-900 mb-1">{data.color_group}</p>
                                <p className="text-sm text-gray-700">{data.units} units</p>
                                <p className="text-sm text-blue-600">{data.percentage.toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    No frame data available
                  </div>
                )}
              </div>

              {/* Color Group Bar Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Frame Units by Color ({showCurrentYear ? 'CY' : 'PY'})
                </h3>
                {activeColorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={activeColorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="color_group"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-gray-900 mb-1">{data.color_group}</p>
                                <p className="text-sm text-gray-700">{data.units} units</p>
                                <p className="text-sm text-blue-600">{data.percentage.toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                        {activeColorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.color_group] || '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    No frame data available
                  </div>
                )}
              </div>
            </div>

            {/* Additional Insights Section */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Top Selling Frame - Coming Soon */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Top Selling Frame</h3>
                </div>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-500 text-sm">Coming Soon</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Frame-level data will be available in a future update
                  </p>
                </div>
              </div>

              {/* Promos Used - Coming Soon */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Promos Used</h3>
                </div>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-500 text-sm">Coming Soon</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Promotional data will be available in a future update
                  </p>
                </div>
              </div>
            </div>

            {/* Account Notes */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Account Notes</h3>
                </div>
                <button
                  onClick={saveNotes}
                  disabled={isSavingNotes}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    isSavingNotes
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isSavingNotes ? 'Saved!' : 'Save Notes'}
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this customer... (e.g., preferences, follow-up actions, contact history)"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Notes are saved locally in your browser
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountDetailModal;
