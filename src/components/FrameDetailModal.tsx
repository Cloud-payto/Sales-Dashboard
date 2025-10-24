import React from 'react';
import { X, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { Account } from '../types';

interface FrameDetailModalProps {
  frameName: string;
  frameData: {
    name: string;
    change: number;
    pct_change: number;
    current_year: number;
    previous_year: number;
    type: 'growth' | 'decline';
  };
  decliningAccounts: Account[];
  onClose: () => void;
}

const FrameDetailModal: React.FC<FrameDetailModalProps> = ({
  frameName,
  frameData,
  decliningAccounts,
  onClose
}) => {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.abs(value));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const topDeclining = decliningAccounts.slice(0, 10);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-5 border-b border-gray-200 ${
            frameData.type === 'decline' ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {frameData.type === 'decline' ? (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{frameName}</h2>
                  <p className={`text-sm font-medium ${
                    frameData.type === 'decline' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {frameData.change > 0 ? '+' : ''}{formatNumber(frameData.change)} units
                    ({frameData.pct_change > 0 ? '+' : ''}{frameData.pct_change.toFixed(1)}%) YOY
                  </p>
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
            {/* Frame Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Previous Year</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(frameData.previous_year)}
                </div>
                <div className="text-xs text-gray-500">units</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Current Year</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(frameData.current_year)}
                </div>
                <div className="text-xs text-gray-500">units</div>
              </div>
              <div className={`rounded-lg p-4 ${
                frameData.type === 'decline' ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <div className="text-sm text-gray-600 mb-1">Change</div>
                <div className={`text-2xl font-bold ${
                  frameData.type === 'decline' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {frameData.change > 0 ? '+' : ''}{formatNumber(frameData.change)}
                </div>
                <div className="text-xs text-gray-500">units</div>
              </div>
            </div>

            {/* Info Message */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Understanding Frame Category Changes</p>
                <p>
                  Frame color categories are tracked at the territory level.
                  {frameData.type === 'decline' ? (
                    <> Below are your declining customers who may be contributing to this decrease.
                    Focus on re-engaging these accounts with {frameName.toLowerCase()} products.</>
                  ) : (
                    <> This growth is driven by increased orders across your territory.
                    Continue promoting {frameName.toLowerCase()} to maintain momentum.</>
                  )}
                </p>
              </div>
            </div>

            {/* Declining Customers Table */}
            {frameData.type === 'decline' && decliningAccounts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Declining Customers to Target
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          City
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          Current Year
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          Previous Year
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          Decline
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topDeclining.map((account, index) => (
                        <tr
                          key={account['Acct #']}
                          className={`border-t border-gray-100 ${
                            index === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {account.Name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {account.City}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900">
                            {formatCurrency(account['CY Total'])}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {formatCurrency(account['PY Total'])}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-red-600">
                            {formatCurrency(account.Difference)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Showing top {topDeclining.length} of {decliningAccounts.length} declining customers.
                  These accounts represent your missed potential for {frameName.toLowerCase()} sales.
                </p>
              </div>
            )}

            {/* For growing frames */}
            {frameData.type === 'growth' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Great Performance!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your {frameName.toLowerCase()} category is up {formatNumber(frameData.change)} units.
                  Keep up the momentum by continuing to promote these products across your territory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FrameDetailModal;
