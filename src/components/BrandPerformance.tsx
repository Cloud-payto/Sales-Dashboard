import React, { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { Brand } from '../types';

interface BrandPerformanceProps {
  brands: Brand[];
  showTop?: number;
  totalAccounts?: number;
}

const BrandPerformance: React.FC<BrandPerformanceProps> = ({ brands, showTop = 10, totalAccounts = 0 }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'frames'>('all');

  // Filter brands based on selected mode
  const filteredBrands = useMemo(() => {
    if (filterMode === 'frames') {
      // Exclude cases, cleaning cloths, and nose pads
      return brands.filter(brand =>
        !brand.brand.toLowerCase().includes('case') &&
        !brand.brand.toLowerCase().includes('cleaning') &&
        !brand.brand.toLowerCase().includes('nose pad')
      );
    }
    return brands;
  }, [brands, filterMode]);

  const topBrands = filteredBrands.slice(0, showTop);
  const maxUnits = Math.max(...topBrands.map(b => b.total_units));

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Brand Performance</h3>
            <p className="text-sm text-gray-600">
              {filterMode === 'all' ? 'All products' : 'Frame brands only'}
            </p>
          </div>
        </div>

        {/* Toggle buttons */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilterMode('frames')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filterMode === 'frames'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Frames Only
          </button>
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
                  <span className="text-gray-600 text-right">
                    {brand.account_count} customers
                    {totalAccounts > 0 && (
                      <span className="text-gray-500 ml-1">
                        ({((brand.account_count / totalAccounts) * 100).toFixed(1)}%)
                      </span>
                    )}
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

              {/* Average per customer */}
              <div className="mt-1 ml-9">
                <span className="text-xs text-gray-500">
                  Avg: {brand.avg_units_per_account.toFixed(1)} units/customer
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBrands.length > showTop && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            +{filteredBrands.length - showTop} more brands
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandPerformance;
