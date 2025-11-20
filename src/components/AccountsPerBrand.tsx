import React, { useState } from 'react';
import { Users, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { AccountsPerBrand as AccountsPerBrandType } from '../types';

interface AccountsPerBrandProps {
  data: AccountsPerBrandType;
}

const COLOR_GROUP_COLORS: { [key: string]: string } = {
  'BLACK DIAMOND': 'bg-gray-800 text-white',
  'YELLOW': 'bg-yellow-500 text-gray-900',
  'RED': 'bg-red-600 text-white',
  'BLUE': 'bg-blue-600 text-white',
  'GREEN': 'bg-green-600 text-white',
  'LIME': 'bg-lime-500 text-gray-900',
  'OTHER': 'bg-gray-400 text-gray-900',
};

export default function AccountsPerBrand({ data }: AccountsPerBrandProps) {
  const [showYear, setShowYear] = useState<'current' | 'previous'>('current');
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  if (!data) return null;

  const displayData = showYear === 'current' ? data.current_year : data.previous_year;
  const { summary } = data;

  const calculateChange = (cyValue: number, pyValue: number) => {
    const change = cyValue - pyValue;
    const pctChange = pyValue > 0 ? ((change / pyValue) * 100).toFixed(1) : 0;
    return { change, pctChange };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" />
            Accounts per Brand ({data.threshold}+ Units)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Accounts purchasing {data.threshold} or more units from each brand
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowYear('current')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showYear === 'current'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Current Year
          </button>
          <button
            onClick={() => setShowYear('previous')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showYear === 'previous'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous Year
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">
                {showYear === 'current' ? 'Current Year' : 'Previous Year'}
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {showYear === 'current'
                  ? summary.cy_total_qualifying_accounts
                  : summary.py_total_qualifying_accounts}
              </p>
              <p className="text-xs text-blue-600 mt-1">Total Qualifying Accounts</p>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Average per Brand</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {(showYear === 'current'
                  ? summary.cy_avg_accounts_per_brand
                  : summary.py_avg_accounts_per_brand
                ).toFixed(1)}
              </p>
              <p className="text-xs text-purple-600 mt-1">Accounts per Brand</p>
            </div>
            <Package className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Brand List */}
      <div className="space-y-3">
        {displayData.map((brandMetric, index) => {
          const cyBrand = data.current_year.find((b) => b.brand === brandMetric.brand);
          const pyBrand = data.previous_year.find((b) => b.brand === brandMetric.brand);

          const cyAccounts = cyBrand?.accounts_buying_12_plus || 0;
          const pyAccounts = pyBrand?.accounts_buying_12_plus || 0;
          const { change, pctChange } = calculateChange(cyAccounts, pyAccounts);

          const isExpanded = expandedBrand === brandMetric.brand;

          return (
            <div
              key={brandMetric.brand}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() =>
                  setExpandedBrand(isExpanded ? null : brandMetric.brand)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-gray-500 font-medium text-sm w-8">
                      #{index + 1}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        COLOR_GROUP_COLORS[brandMetric.color_group] ||
                        COLOR_GROUP_COLORS.OTHER
                      }`}
                    >
                      {brandMetric.color_group}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {brandMetric.brand}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">
                        {brandMetric.accounts_buying_12_plus}
                      </p>
                      <p className="text-xs text-gray-600">
                        of {brandMetric.total_accounts_buying} total
                      </p>
                    </div>

                    {change !== 0 && (
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                          change > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {change > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-semibold">
                          {change > 0 ? '+' : ''}
                          {change} ({pctChange}%)
                        </span>
                      </div>
                    )}

                    <span className="text-gray-400 text-xl">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex gap-4 text-sm text-gray-600">
                  <span>Total Units: {brandMetric.total_units.toLocaleString()}</span>
                  <span>
                    Avg Units/Account:{' '}
                    {brandMetric.total_accounts_buying > 0
                      ? (
                          brandMetric.total_units / brandMetric.total_accounts_buying
                        ).toFixed(1)
                      : 0}
                  </span>
                </div>
              </div>

              {/* Expanded Qualifying Accounts */}
              {isExpanded && brandMetric.qualifying_accounts.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Qualifying Accounts ({brandMetric.qualifying_accounts.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {brandMetric.qualifying_accounts.map((account) => (
                      <div
                        key={account.account_number}
                        className="bg-white rounded border border-gray-200 p-2"
                      >
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {account.account_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Acct #{account.account_number}
                        </p>
                        <p className="text-sm font-semibold text-blue-600 mt-1">
                          {account.units} units
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {displayData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No brand data available for the selected year</p>
        </div>
      )}
    </div>
  );
}
