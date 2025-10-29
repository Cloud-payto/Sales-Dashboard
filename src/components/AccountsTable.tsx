import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp, UserPlus, UserCheck, Filter, X } from 'lucide-react';
import { Account } from '../types';
import AccountDetailModal from './AccountDetailModal';

interface AccountsTableProps {
  accounts: Account[];
  title: string;
  type: 'declining' | 'growing' | 'new' | 'reactivated';
}

const AccountsTable: React.FC<AccountsTableProps> = ({ accounts, title, type }) => {
  const [sortField, setSortField] = useState<keyof Account>('Difference');
  // For declining accounts, start with 'asc' to show largest losses first (most negative)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(type === 'declining' ? 'asc' : 'desc');
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [showCityFilter, setShowCityFilter] = useState<boolean>(false);
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Get unique cities from accounts
  const uniqueCities = useMemo(() => {
    const cities = new Set(accounts.map(account => account.City).filter(Boolean));
    return Array.from(cities).sort();
  }, [accounts]);

  const handleSort = (field: keyof Account) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(type === 'declining' ? 'asc' : 'desc');
    }
  };

  const toggleCityFilter = (city: string) => {
    const newSelected = new Set(selectedCities);
    if (newSelected.has(city)) {
      newSelected.delete(city);
    } else {
      newSelected.add(city);
    }
    setSelectedCities(newSelected);
  };

  const clearCityFilter = () => {
    setSelectedCities(new Set());
  };

  // Filter accounts by selected cities
  const filteredAccounts = useMemo(() => {
    if (selectedCities.size === 0) {
      return accounts;
    }
    return accounts.filter(account => selectedCities.has(account.City));
  }, [accounts, selectedCities]);

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const getIcon = () => {
    switch (type) {
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'growing':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'new':
        return <UserPlus className="w-5 h-5 text-blue-600" />;
      case 'reactivated':
        return <UserCheck className="w-5 h-5 text-purple-600" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const SortIcon: React.FC<{ field: keyof Account }> = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4 text-gray-700" /> :
      <ChevronDown className="w-4 h-4 text-gray-700" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        {getIcon()}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {selectedCities.size > 0 && (
          <button
            onClick={clearCityFilter}
            className="ml-4 flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            <Filter className="w-3 h-3" />
            {selectedCities.size} {selectedCities.size === 1 ? 'city' : 'cities'}
            <X className="w-3 h-3 ml-1" />
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">
          {filteredAccounts.length} {filteredAccounts.length !== accounts.length && `of ${accounts.length}`} customers
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('Acct #')}
              >
                <div className="flex items-center gap-1">
                  Customer #
                  <SortIcon field="Acct #" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('Name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  <SortIcon field="Name" />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 relative">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-1 rounded"
                    onClick={() => handleSort('City')}
                  >
                    City
                    <SortIcon field="City" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCityFilter(!showCityFilter);
                    }}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                      selectedCities.size > 0 ? 'text-blue-600' : 'text-gray-400'
                    }`}
                    title="Filter by city"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                {/* City Filter Dropdown */}
                {showCityFilter && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowCityFilter(false)}
                    />
                    <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">Filter by City</span>
                          {selectedCities.size > 0 && (
                            <button
                              onClick={clearCityFilter}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-2">
                        {uniqueCities.map(city => (
                          <label
                            key={city}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCities.has(city)}
                              onChange={() => toggleCityFilter(city)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{city}</span>
                            <span className="ml-auto text-xs text-gray-500">
                              ({accounts.filter(a => a.City === city).length})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('CY Total')}
              >
                <div className="flex items-center justify-end gap-1">
                  Current Year
                  <SortIcon field="CY Total" />
                </div>
              </th>
              {type !== 'new' && (
                <th
                  className="text-right py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('PY Total')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Previous Year
                    <SortIcon field="PY Total" />
                  </div>
                </th>
              )}
              <th
                className="text-right py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('Difference')}
              >
                <div className="flex items-center justify-end gap-1">
                  {type === 'new' ? 'Sales' : 'Change'}
                  <SortIcon field="Difference" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAccounts.slice(0, displayCount).map((account, index) => (
              <tr
                key={account['Acct #']}
                onClick={() => setSelectedAccount(account)}
                className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                  index === 0 ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                  {account['Acct #']}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  {account.Name}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {account.City}
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                  {formatCurrency(account['CY Total'])}
                </td>
                {type !== 'new' && (
                  <td className="py-3 px-4 text-sm text-right text-gray-600">
                    {formatCurrency(account['PY Total'])}
                  </td>
                )}
                <td className={`py-3 px-4 text-sm text-right font-semibold ${
                  account.Difference > 0 ? 'text-green-600' :
                  account.Difference < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {account.Difference > 0 && '+'}
                  {formatCurrency(account.Difference)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More / Show Less buttons */}
      {filteredAccounts.length > 10 && (
        <div className="mt-4 flex justify-center gap-3">
          {displayCount < filteredAccounts.length && (
            <button
              onClick={() => setDisplayCount(prev => Math.min(prev + 10, filteredAccounts.length))}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            >
              Show More (+10)
            </button>
          )}
          {displayCount > 10 && (
            <button
              onClick={() => setDisplayCount(10)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              Show Less
            </button>
          )}
          <span className="px-4 py-2 text-sm text-gray-500 self-center">
            Showing {Math.min(displayCount, filteredAccounts.length)} of {filteredAccounts.length}
          </span>
        </div>
      )}

      {/* Account Detail Modal */}
      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
};

export default AccountsTable;
