import React, { useState, useEffect } from 'react';
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
import { Account } from '../types';

interface AccountDetailModalProps {
  account: Account;
  onClose: () => void;
}

const AccountDetailModal: React.FC<AccountDetailModalProps> = ({ account, onClose }) => {
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

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

            {/* Charts Section */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* YOY Bar Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-Over-Year Comparison</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="period"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sales Distribution Pie Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
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
