import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp, UserPlus, UserCheck } from 'lucide-react';
import { Account } from '../types';

interface AccountsTableProps {
  accounts: Account[];
  title: string;
  type: 'declining' | 'growing' | 'new' | 'reactivated';
}

const AccountsTable: React.FC<AccountsTableProps> = ({ accounts, title, type }) => {
  const [sortField, setSortField] = useState<keyof Account>('Difference');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Account) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(type === 'declining' ? 'asc' : 'desc');
    }
  };

  const sortedAccounts = [...accounts].sort((a, b) => {
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
        <span className="ml-auto text-sm text-gray-500">{accounts.length} accounts</span>
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
                  Account #
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
              <th
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('City')}
              >
                <div className="flex items-center gap-1">
                  City
                  <SortIcon field="City" />
                </div>
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
            {sortedAccounts.map((account, index) => (
              <tr
                key={account['Acct #']}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
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
    </div>
  );
};

export default AccountsTable;
