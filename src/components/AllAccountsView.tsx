import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { Account } from '../types';
import { useDashboard } from '../contexts/DashboardContext';
import AccountDetailModal from './AccountDetailModal';

interface AllAccountsViewProps {
  accounts: Account[];
}

type SortField = 'Name' | 'City' | 'CY Total' | 'PY Total' | 'Difference';
type SortDirection = 'asc' | 'desc';

const AllAccountsView: React.FC<AllAccountsViewProps> = ({ accounts }) => {
  const { dashboardData } = useDashboard();
  const [sortField, setSortField] = useState<SortField>('CY Total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = [...accounts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.City.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle string comparison for Name and City
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [accounts, searchTerm, sortField, sortDirection]);

  const SortButton: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {label}
      <ArrowUpDown
        className={`w-4 h-4 ${
          sortField === field ? 'text-blue-600' : 'text-gray-400'
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Accounts</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedAccounts.length} total accounts
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                <SortButton field="Name" label="Customer" />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                <SortButton field="City" label="City" />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                <SortButton field="PY Total" label="PY Sales" />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                <SortButton field="CY Total" label="CY Sales" />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                <SortButton field="Difference" label="Change" />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                % Change
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedAccounts.map((account, index) => {
              const pctChange = account['PY Total'] !== 0
                ? ((account.Difference / account['PY Total']) * 100)
                : 0;
              const isGrowing = account.Difference > 0;
              const isDeclining = account.Difference < 0;
              const isNew = account['PY Total'] === 0;

              return (
                <tr
                  key={account['Acct #']}
                  onClick={() => setSelectedAccount(account)}
                  className={`border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {account.Name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {account.City}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    {formatCurrency(account['PY Total'])}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(account['CY Total'])}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-semibold ${
                    isGrowing ? 'text-green-600' : isDeclining ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {account.Difference > 0 ? '+' : ''}{formatCurrency(account.Difference)}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right ${
                    isGrowing ? 'text-green-600' : isDeclining ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {pctChange > 0 ? '+' : ''}{pctChange.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isNew ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    ) : isGrowing ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Growing
                      </span>
                    ) : isDeclining ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Declining
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Stable
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedAccounts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No accounts found matching your search.</p>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        Click on any account to view detailed analytics
      </p>

      {/* Account Detail Modal */}
      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          brandComparison={dashboardData?.brand_comparison?.all_customer_brand_changes}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
};

export default AllAccountsView;
