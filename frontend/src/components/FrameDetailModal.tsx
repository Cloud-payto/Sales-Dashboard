import React, { useState, useMemo } from 'react';
import { X, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { ColorGroupDrillDown, CustomerBrandChange } from '../types';

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

type FilterType = 'all' | 'lost' | 'declining' | 'growing' | 'new';

const FrameDetailModal: React.FC<FrameDetailModalProps> = ({
  frameName,
  frameData,
  drillDownData,
  onClose
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.abs(value));
  };

  // Filter and sort customers based on active filter
  const displayedCustomers = useMemo(() => {
    let customers: CustomerBrandChange[] = [];

    switch (activeFilter) {
      case 'lost':
        customers = [...drillDownData.lost_customers];
        break;
      case 'declining':
        customers = [...drillDownData.declining_customers];
        break;
      case 'growing':
        customers = [...drillDownData.growing_customers];
        break;
      case 'new':
        customers = [...drillDownData.new_customers];
        break;
      case 'all':
      default:
        if (frameData.type === 'decline') {
          customers = [
            ...drillDownData.lost_customers,
            ...drillDownData.declining_customers
          ];
        } else {
          customers = [
            ...drillDownData.growing_customers,
            ...drillDownData.new_customers
          ];
        }
        break;
    }

    // Sort by change (worst first for decline, best first for growth)
    if (frameData.type === 'decline') {
      return customers.sort((a, b) => a.change - b.change).slice(0, 15);
    } else {
      return customers.sort((a, b) => b.change - a.change).slice(0, 15);
    }
  }, [activeFilter, drillDownData, frameData.type]);

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

            {/* Customer Segment Cards - Clickable Filters */}
            {frameData.type === 'decline' && (
              <div className="mb-6 grid grid-cols-4 gap-3 text-sm">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`p-3 rounded-lg transition-all ${
                    activeFilter === 'all'
                      ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className={`font-semibold ${activeFilter === 'all' ? 'text-blue-900' : 'text-gray-900'}`}>
                    All Declining
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {drillDownData.lost_count + drillDownData.declining_count} customers
                  </div>
                </button>
                <button
                  onClick={() => setActiveFilter('lost')}
                  className={`p-3 rounded-lg transition-all ${
                    activeFilter === 'lost'
                      ? 'bg-red-100 border-2 border-red-500 shadow-md'
                      : 'bg-red-50 border-2 border-transparent hover:border-red-300'
                  }`}
                >
                  <div className={`font-semibold ${activeFilter === 'lost' ? 'text-red-900' : 'text-red-800'}`}>
                    {drillDownData.lost_count} Lost
                  </div>
                  <div className="text-xs text-red-700">Bought PY, not buying CY</div>
                </button>
                <button
                  onClick={() => setActiveFilter('declining')}
                  className={`p-3 rounded-lg transition-all ${
                    activeFilter === 'declining'
                      ? 'bg-orange-100 border-2 border-orange-500 shadow-md'
                      : 'bg-orange-50 border-2 border-transparent hover:border-orange-300'
                  }`}
                >
                  <div className={`font-semibold ${activeFilter === 'declining' ? 'text-orange-900' : 'text-orange-800'}`}>
                    {drillDownData.declining_count} Declining
                  </div>
                  <div className="text-xs text-orange-700">Reduced purchases</div>
                </button>
                <button
                  onClick={() => setActiveFilter('growing')}
                  className={`p-3 rounded-lg transition-all ${
                    activeFilter === 'growing'
                      ? 'bg-green-100 border-2 border-green-500 shadow-md'
                      : 'bg-green-50 border-2 border-transparent hover:border-green-300'
                  }`}
                >
                  <div className={`font-semibold ${activeFilter === 'growing' ? 'text-green-900' : 'text-green-800'}`}>
                    {drillDownData.growing_count} Growing
                  </div>
                  <div className="text-xs text-green-700">Increased purchases</div>
                </button>
              </div>
            )}

            {frameData.type === 'growth' && (
              <div className="mb-6 grid grid-cols-4 gap-3 text-sm">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`p-3 rounded-lg transition-all ${
                    activeFilter === 'all'
                      ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className={`font-semibold ${activeFilter === 'all' ? 'text-blue-900' : 'text-gray-900'}`}>
                    All Growing
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {drillDownData.growing_count + drillDownData.new_count} customers
                  </div>
                </button>
                <button
                  onClick={() => setActiveFilter('growing')}
                  className={`p-3 rounded-lg transition-all ${
                    activeFilter === 'growing'
                      ? 'bg-green-100 border-2 border-green-500 shadow-md'
                      : 'bg-green-50 border-2 border-transparent hover:border-green-300'
                  }`}
                >
                  <div className={`font-semibold ${activeFilter === 'growing' ? 'text-green-900' : 'text-green-800'}`}>
                    {drillDownData.growing_count} Growing
                  </div>
                  <div className="text-xs text-green-700">Increased purchases</div>
                </button>
                <button
                  onClick={() => setActiveFilter('new')}
                  className={`p-3 rounded-lg transition-all ${
                    activeFilter === 'new'
                      ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                      : 'bg-blue-50 border-2 border-transparent hover:border-blue-300'
                  }`}
                >
                  <div className={`font-semibold ${activeFilter === 'new' ? 'text-blue-900' : 'text-blue-800'}`}>
                    {drillDownData.new_count} New
                  </div>
                  <div className="text-xs text-blue-700">Started buying this year</div>
                </button>
                <button
                  onClick={() => setActiveFilter('declining')}
                  className={`p-3 rounded-lg transition-all ${
                    activeFilter === 'declining'
                      ? 'bg-orange-100 border-2 border-orange-500 shadow-md'
                      : 'bg-orange-50 border-2 border-transparent hover:border-orange-300'
                  }`}
                >
                  <div className={`font-semibold ${activeFilter === 'declining' ? 'text-orange-900' : 'text-orange-800'}`}>
                    {drillDownData.declining_count} Declining
                  </div>
                  <div className="text-xs text-orange-700">Reduced purchases</div>
                </button>
              </div>
            )}

            {/* Info Message */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Click a category above to filter customers</p>
                <p>
                  {activeFilter === 'all'
                    ? `Showing all ${frameData.type === 'decline' ? 'declining' : 'growing'} customers.`
                    : activeFilter === 'lost'
                    ? 'Customers who bought this color last year but are not buying it this year.'
                    : activeFilter === 'declining'
                    ? 'Customers who reduced their purchases in this color category.'
                    : activeFilter === 'growing'
                    ? 'Customers who increased their purchases in this color category.'
                    : 'Customers who started buying this color this year.'}
                </p>
              </div>
            </div>

            {/* Customer Table */}
            {displayedCustomers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {activeFilter === 'all'
                    ? `${frameData.type === 'decline' ? 'Declining' : 'Growing'} Customers`
                    : activeFilter === 'lost'
                    ? 'Lost Customers'
                    : activeFilter === 'declining'
                    ? 'Declining Customers'
                    : activeFilter === 'growing'
                    ? 'Growing Customers'
                    : 'New Customers'}
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
                          {frameData.type === 'decline' ? 'Loss' : 'Growth'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedCustomers.map((customer, index) => (
                        <tr
                          key={customer.account_number}
                          className={`border-t border-gray-100 ${
                            index === 0
                              ? (frameData.type === 'decline' ? 'bg-yellow-50' : 'bg-green-50')
                              : 'hover:bg-gray-50'
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
                          <td className="py-3 px-4 text-sm text-right text-gray-900">
                            {customer.current_year_units}
                          </td>
                          <td className={`py-3 px-4 text-sm text-right font-semibold ${
                            customer.change < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {customer.change > 0 ? '+' : ''}{customer.change}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Showing top {displayedCustomers.length} customers.
                  {frameData.type === 'decline'
                    ? ' These are your priority re-engagement targets.'
                    : ' These accounts show strong demand - consider upselling or expanding their product mix.'}
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
