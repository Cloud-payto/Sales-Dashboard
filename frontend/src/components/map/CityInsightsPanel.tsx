import React, { useState } from 'react';
import { CityData } from '../../types';
import { X, TrendingUp, TrendingDown, Users, Building2, ChevronDown, ChevronUp } from 'lucide-react';

interface CityInsightsPanelProps {
  city: CityData;
  onClose: () => void;
}

const CityInsightsPanel: React.FC<CityInsightsPanelProps> = ({ city, onClose }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeBg = (change: number) => {
    if (change > 0) return 'bg-green-50';
    if (change < 0) return 'bg-red-50';
    return 'bg-gray-50';
  };

  // Sort accounts by change magnitude
  const sortedGrowing = [...city.growing_accounts].sort((a, b) => b.change - a.change);
  const sortedDeclining = [...city.declining_accounts].sort((a, b) => a.change - b.change);
  const sortedNew = [...city.new_accounts].sort((a, b) => b.current_year_units - a.current_year_units);
  const sortedLost = [...city.lost_accounts].sort((a, b) => b.previous_year_units - a.previous_year_units);

  // Get top color groups
  const topColorGroups = [...city.color_groups_cy]
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  return (
    <div className="absolute right-4 top-4 bottom-4 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-30 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{city.city}</h2>
            <p className="text-blue-100 text-sm mt-1">City Performance Insights</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Overview Stats */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Building2 className="w-3 h-3" />
                Total Accounts
              </div>
              <div className="text-2xl font-bold text-gray-900">{city.total_accounts}</div>
            </div>
            <div className={`rounded-lg p-3 ${getChangeBg(city.units_change)}`}>
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                {city.units_change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                YOY Change
              </div>
              <div className={`text-2xl font-bold ${getChangeColor(city.units_change)}`}>
                {city.units_change >= 0 ? '+' : ''}{city.units_change.toLocaleString()}
              </div>
              <div className={`text-xs ${getChangeColor(city.units_change)}`}>
                {city.units_change_pct >= 0 ? '+' : ''}{city.units_change_pct.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-600 mb-1">Units CY</div>
              <div className="text-lg font-semibold text-blue-900">{city.total_units_cy.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Units PY</div>
              <div className="text-lg font-semibold text-gray-700">{city.total_units_py.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Account Status Summary */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-green-50 rounded-lg p-2">
              <div className="text-lg font-bold text-green-700">{city.growing_count}</div>
              <div className="text-[10px] text-green-600">Growing</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <div className="text-lg font-bold text-red-700">{city.declining_count}</div>
              <div className="text-[10px] text-red-600">Declining</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <div className="text-lg font-bold text-amber-700">{city.lost_count}</div>
              <div className="text-[10px] text-amber-600">Lost</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-lg font-bold text-blue-700">{city.new_count}</div>
              <div className="text-[10px] text-blue-600">New</div>
            </div>
          </div>
        </div>

        {/* Top Color Groups */}
        {topColorGroups.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Color Groups</h3>
            <div className="space-y-2">
              {topColorGroups.map((cg, idx) => (
                <div key={cg.color_group} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{cg.color_group}</div>
                    <div className="text-xs text-gray-500">{cg.units.toLocaleString()} units</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {((cg.units / city.total_units_cy) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Sections */}
        {/* Growing Accounts */}
        {sortedGrowing.length > 0 && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('growing')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Growing Accounts</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {sortedGrowing.length}
                </span>
              </div>
              {expandedSection === 'growing' ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSection === 'growing' && (
              <div className="px-4 pb-3 max-h-60 overflow-y-auto">
                {sortedGrowing.slice(0, 10).map((account, idx) => (
                  <div
                    key={`growing-${account.account_number}-${idx}`}
                    className="py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate pr-2">
                          {account.account_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.current_year_units.toLocaleString()} units
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        +{account.change.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Declining Accounts */}
        {sortedDeclining.length > 0 && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('declining')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-900">Declining Accounts</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {sortedDeclining.length}
                </span>
              </div>
              {expandedSection === 'declining' ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSection === 'declining' && (
              <div className="px-4 pb-3 max-h-60 overflow-y-auto">
                {sortedDeclining.slice(0, 10).map((account, idx) => (
                  <div
                    key={`declining-${account.account_number}-${idx}`}
                    className="py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate pr-2">
                          {account.account_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.current_year_units.toLocaleString()} units
                        </div>
                      </div>
                      <div className="text-sm font-medium text-red-600">
                        {account.change.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Accounts */}
        {sortedNew.length > 0 && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('new')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">New Accounts</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {sortedNew.length}
                </span>
              </div>
              {expandedSection === 'new' ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSection === 'new' && (
              <div className="px-4 pb-3 max-h-60 overflow-y-auto">
                {sortedNew.slice(0, 10).map((account, idx) => (
                  <div
                    key={`new-${account.account_number}-${idx}`}
                    className="py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate pr-2">
                          {account.account_name}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        +{account.current_year_units.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lost Accounts */}
        {sortedLost.length > 0 && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('lost')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-900">Lost Accounts</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {sortedLost.length}
                </span>
              </div>
              {expandedSection === 'lost' ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSection === 'lost' && (
              <div className="px-4 pb-3 max-h-60 overflow-y-auto">
                {sortedLost.slice(0, 10).map((account, idx) => (
                  <div
                    key={`lost-${account.account_number}-${idx}`}
                    className="py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate pr-2">
                          {account.account_name}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-amber-600">
                        -{account.previous_year_units.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Data from Year-over-Year Analysis
        </div>
      </div>
    </div>
  );
};

export default CityInsightsPanel;
