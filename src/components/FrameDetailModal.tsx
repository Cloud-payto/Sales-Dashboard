import React from 'react';
import { X, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { ColorGroupDrillDown } from '../types';

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
  drillDownData: ColorGroupDrillDown;
  onClose: () => void;
}

const FrameDetailModal: React.FC<FrameDetailModalProps> = ({
  frameName,
  frameData,
  drillDownData,
  onClose
}) => {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.abs(value));
  };

  // Combine lost and declining customers (both represent missed opportunities)
  const missedOpportunities = [
    ...drillDownData.lost_customers,
    ...drillDownData.declining_customers
  ].sort((a, b) => a.change - b.change).slice(0, 15); // Top 15 worst cases

  // Combine growing and new customers (both represent growth opportunities)
  const growthOpportunities = [
    ...drillDownData.growing_customers,
    ...drillDownData.new_customers
  ].sort((a, b) => b.change - a.change).slice(0, 15); // Top 15 best cases

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

            {/* Missed Opportunities Table */}
            {frameData.type === 'decline' && missedOpportunities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customers Who Stopped/Reduced Buying {frameName}
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Brands
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          PY Units
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          CY Units
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          Loss
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {missedOpportunities.map((customer, index) => (
                        <tr
                          key={customer.account_number}
                          className={`border-t border-gray-100 ${
                            index === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {customer.account_name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {customer.city}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            {customer.brands.map(b => b.brand).join(', ')}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900">
                            {customer.previous_year_units}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {customer.current_year_units}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-red-600">
                            {customer.change}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-red-900 font-semibold">{drillDownData.lost_count} Lost</div>
                    <div className="text-red-700 text-xs">Bought PY, not buying CY</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-orange-900 font-semibold">{drillDownData.declining_count} Declining</div>
                    <div className="text-orange-700 text-xs">Reduced purchases</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-900 font-semibold">{drillDownData.growing_count} Growing</div>
                    <div className="text-green-700 text-xs">Increased purchases</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Showing top {missedOpportunities.length} customers who stopped or reduced buying {frameName.toLowerCase()} frames.
                  These are your priority re-engagement targets.
                </p>
              </div>
            )}

            {/* Growth Opportunities Table */}
            {frameData.type === 'growth' && growthOpportunities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customers Driving Growth in {frameName}
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Brands
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          PY Units
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          CY Units
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {growthOpportunities.map((customer, index) => (
                        <tr
                          key={customer.account_number}
                          className={`border-t border-gray-100 ${
                            index === 0 ? 'bg-green-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {customer.account_name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {customer.city}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            {customer.brands.map(b => b.brand).join(', ')}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {customer.previous_year_units}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900">
                            {customer.current_year_units}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                            +{customer.change}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-900 font-semibold">{drillDownData.growing_count} Growing</div>
                    <div className="text-green-700 text-xs">Increased purchases</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-900 font-semibold">{drillDownData.new_count} New</div>
                    <div className="text-blue-700 text-xs">Started buying this year</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-orange-900 font-semibold">{drillDownData.declining_count} Declining</div>
                    <div className="text-orange-700 text-xs">Reduced purchases</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Showing top {growthOpportunities.length} customers driving growth in {frameName.toLowerCase()} frames.
                  These accounts show strong demand - consider upselling or expanding their product mix.
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
