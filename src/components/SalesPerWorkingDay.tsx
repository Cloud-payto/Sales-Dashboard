import React from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { SalesPerWorkingDay as SalesPerWorkingDayType } from '../types';

interface SalesPerWorkingDayProps {
  data: SalesPerWorkingDayType;
}

export default function SalesPerWorkingDay({ data }: SalesPerWorkingDayProps) {
  if (!data || data.error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-800">Sales per Working Day</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>{data?.error || 'Working day data not available'}</p>
          <p className="text-sm mt-2">
            Date range must be in filename format: "MM-DD-YY to MM-DD-YY"
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const changeIsPositive = data.change_per_day > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Sales per Working Day
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(data.date_range.start_date)} -{' '}
            {formatDate(data.date_range.end_date)}
          </p>
        </div>
      </div>

      {/* Date Range Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Days</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {data.date_range.total_days}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Working Days</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {data.working_days}
          </p>
          <p className="text-xs text-green-600 mt-1">Mon-Fri, excl. holidays</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-700 font-medium">Weekend Days</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {data.weekend_days}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Bank Holidays</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {data.bank_holidays}
          </p>
        </div>
      </div>

      {/* Sales per Working Day Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Year */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Current Year</h3>
            <DollarSign className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-blue-700 font-medium">
                Sales per Working Day
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {formatCurrency(data.sales_per_working_day_cy)}
              </p>
            </div>
            <div className="pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-700">Total Sales</p>
              <p className="text-lg font-semibold text-blue-900">
                {formatCurrency(data.total_sales_cy)}
              </p>
            </div>
          </div>
        </div>

        {/* Previous Year */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Previous Year</h3>
            <DollarSign className="w-8 h-8 text-gray-600 opacity-50" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-700 font-medium">
                Sales per Working Day
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(data.sales_per_working_day_py)}
              </p>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-700">Total Sales</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(data.total_sales_py)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Analysis */}
      <div
        className={`rounded-lg p-6 border-2 ${
          changeIsPositive
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`text-lg font-semibold ${
                changeIsPositive ? 'text-green-900' : 'text-red-900'
              }`}
            >
              Change per Working Day
            </h3>
            <p
              className={`text-sm ${
                changeIsPositive ? 'text-green-700' : 'text-red-700'
              }`}
            >
              Year-over-Year comparison
            </p>
          </div>
          {changeIsPositive ? (
            <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
          ) : (
            <TrendingDown className="w-12 h-12 text-red-600 opacity-50" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <p
              className={`text-sm font-medium ${
                changeIsPositive ? 'text-green-700' : 'text-red-700'
              }`}
            >
              Dollar Change
            </p>
            <p
              className={`text-3xl font-bold mt-1 ${
                changeIsPositive ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {changeIsPositive ? '+' : ''}
              {formatCurrency(data.change_per_day)}
            </p>
          </div>

          <div>
            <p
              className={`text-sm font-medium ${
                changeIsPositive ? 'text-green-700' : 'text-red-700'
              }`}
            >
              Percentage Change
            </p>
            <p
              className={`text-3xl font-bold mt-1 ${
                changeIsPositive ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {changeIsPositive ? '+' : ''}
              {data.pct_change_per_day}%
            </p>
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Insight:</span> Based on{' '}
          {data.working_days} working days, the average daily sales{' '}
          {changeIsPositive ? 'increased' : 'decreased'} by{' '}
          {formatCurrency(Math.abs(data.change_per_day))} (
          {Math.abs(data.pct_change_per_day)}%) compared to the previous year.
        </p>
      </div>
    </div>
  );
}
