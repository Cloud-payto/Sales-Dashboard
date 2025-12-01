import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useFilters } from '../contexts/FilterContext';
import {
  ACCOUNT_SORT_OPTIONS,
  ACCOUNT_STATUS_OPTIONS,
  BRAND_SORT_OPTIONS,
  TIME_PERIOD_OPTIONS,
  TERRITORY_ZONES,
} from '../constants/filterOptions';

const FilterPanel: React.FC = () => {
  const { filters, updateFilter, resetFilters, isFilterPanelOpen, toggleFilterPanel } = useFilters();

  const [expandedSections, setExpandedSections] = useState({
    accounts: true,
    brands: true,
    time: true,
    territory: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAccountStatusChange = (status: string) => {
    if (status === 'all') {
      updateFilter('accountStatus', ['all']);
    } else {
      const currentStatuses = filters.accountStatus.filter((s) => s !== 'all');
      if (currentStatuses.includes(status as any)) {
        const updated = currentStatuses.filter((s) => s !== status);
        updateFilter('accountStatus', updated.length > 0 ? updated : ['all']);
      } else {
        updateFilter('accountStatus', [...currentStatuses, status] as any);
      }
    }
  };

  const handleZoneChange = (zone: string) => {
    if (zone === 'all') {
      updateFilter('selectedZones', ['all']);
    } else {
      const currentZones = filters.selectedZones.filter((z) => z !== 'all');
      if (currentZones.includes(zone)) {
        const updated = currentZones.filter((z) => z !== zone);
        updateFilter('selectedZones', updated.length > 0 ? updated : ['all']);
      } else {
        updateFilter('selectedZones', [...currentZones, zone]);
      }
    }
  };

  if (!isFilterPanelOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={toggleFilterPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <p className="text-sm text-gray-500">Customize your data view</p>
          </div>
          <button
            onClick={toggleFilterPanel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Sections */}
        <div className="px-6 py-4 space-y-6">
          {/* Accounts Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('accounts')}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">Accounts</span>
              {expandedSections.accounts ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedSections.accounts && (
              <div className="p-4 space-y-4">
                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.accountSort}
                    onChange={(e) => updateFilter('accountSort', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {ACCOUNT_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status
                  </label>
                  <div className="space-y-2">
                    {ACCOUNT_STATUS_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.accountStatus.includes(option.value as any)}
                          onChange={() => handleAccountStatusChange(option.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Brands Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('brands')}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">Brands</span>
              {expandedSections.brands ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedSections.brands && (
              <div className="p-4 space-y-4">
                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.brandSort}
                    onChange={(e) => updateFilter('brandSort', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {BRAND_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Group Filter (placeholder - will be populated with actual color groups) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Groups
                  </label>
                  <p className="text-xs text-gray-500">
                    Color group filters will appear based on your data
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Time Period Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('time')}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">Time Period</span>
              {expandedSections.time ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedSections.time && (
              <div className="p-4 space-y-2">
                {TIME_PERIOD_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <input
                      type="radio"
                      name="timePeriod"
                      value={option.value}
                      checked={filters.timePeriod === option.value}
                      onChange={(e) => updateFilter('timePeriod', e.target.value as any)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Territory Zones Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('territory')}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">Territory Zones</span>
              {expandedSections.territory ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedSections.territory && (
              <div className="p-4 space-y-2">
                {TERRITORY_ZONES.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.selectedZones.includes(option.value)}
                      onChange={() => handleZoneChange(option.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm text-gray-700">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-gray-500">{option.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
