import React from 'react';
import { Package } from 'lucide-react';
import { Brand } from '../types';

interface BrandPerformanceProps {
  brands: Brand[];
  showTop?: number;
}

const BrandPerformance: React.FC<BrandPerformanceProps> = ({ brands, showTop = 10 }) => {
  const topBrands = brands.slice(0, showTop);
  const maxUnits = Math.max(...topBrands.map(b => b.total_units));

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top Brand Performance</h3>
          <p className="text-sm text-gray-600">Units sold across all accounts</p>
        </div>
      </div>

      <div className="space-y-4">
        {topBrands.map((brand, index) => {
          const percentage = (brand.total_units / maxUnits) * 100;

          return (
            <div key={brand.brand} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {brand.brand}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-gray-900">
                    {formatNumber(brand.total_units)} units
                  </span>
                  <span className="text-gray-600 w-20 text-right">
                    {brand.account_count} accounts
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Average per account */}
              <div className="mt-1 ml-9">
                <span className="text-xs text-gray-500">
                  Avg: {brand.avg_units_per_account.toFixed(1)} units/account
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {brands.length > showTop && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            +{brands.length - showTop} more brands
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandPerformance;
