import React, { useState } from 'react';
import { useRoutes } from '../../contexts/RouteContext';
import { RouteAnalytics, CityData } from '../../types';
import {
  X,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  MapPin,
  ChevronDown,
  ChevronRight,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserMinus,
} from 'lucide-react';

// Color group display colors
const COLOR_GROUP_COLORS: Record<string, string> = {
  'BLACK DIAMOND': '#1f2937',
  'YELLOW': '#eab308',
  'RED': '#ef4444',
  'BLUE': '#3b82f6',
  'GREEN': '#22c55e',
  'LIME': '#84cc16',
  'OTHER': '#9ca3af',
};

interface RouteAnalyticsPanelProps {
  onClose: () => void;
  onSelectCity?: (city: CityData) => void;
}

const RouteAnalyticsPanel: React.FC<RouteAnalyticsPanelProps> = ({ onClose, onSelectCity }) => {
  const { routes, getAllRoutesAnalytics, selectedRouteId, selectRoute } = useRoutes();
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(selectedRouteId);
  const [activeTab, setActiveTab] = useState<'overview' | 'cities' | 'colors'>('overview');

  const allAnalytics = getAllRoutesAnalytics();

  // Sort by total units CY descending
  const sortedAnalytics = [...allAnalytics].sort((a, b) => b.totalUnitsCY - a.totalUnitsCY);

  const formatNumber = (num: number) => num.toLocaleString();

  const formatPercent = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  // Calculate totals across all routes
  const totals = allAnalytics.reduce(
    (acc, r) => ({
      accounts: acc.accounts + r.totalAccounts,
      unitsCY: acc.unitsCY + r.totalUnitsCY,
      unitsPY: acc.unitsPY + r.totalUnitsPY,
      growing: acc.growing + r.growingCount,
      declining: acc.declining + r.decliningCount,
      lost: acc.lost + r.lostCount,
      new: acc.new + r.newCount,
    }),
    { accounts: 0, unitsCY: 0, unitsPY: 0, growing: 0, declining: 0, lost: 0, new: 0 }
  );

  const totalChange = totals.unitsCY - totals.unitsPY;
  const totalChangePct = totals.unitsPY > 0 ? ((totals.unitsCY / totals.unitsPY) - 1) * 100 : 0;

  const getRouteColor = (routeId: string): string => {
    return routes.find(r => r.id === routeId)?.color || '#9ca3af';
  };

  const renderRouteCard = (analytics: RouteAnalytics) => {
    const isExpanded = expandedRouteId === analytics.routeId;
    const routeColor = getRouteColor(analytics.routeId);

    return (
      <div
        key={analytics.routeId}
        className={`border rounded-lg overflow-hidden transition-all ${
          selectedRouteId === analytics.routeId
            ? 'border-blue-500 shadow-md'
            : 'border-gray-200'
        }`}
      >
        {/* Route Header */}
        <div
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setExpandedRouteId(isExpanded ? null : analytics.routeId)}
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: routeColor }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{analytics.routeName}</div>
            <div className="text-xs text-gray-500">
              {analytics.cities.length} cities · {formatNumber(analytics.totalAccounts)} accounts
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              {formatNumber(analytics.totalUnitsCY)}
            </div>
            <div
              className={`text-xs flex items-center justify-end gap-0.5 ${
                analytics.unitsChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {analytics.unitsChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {formatPercent(analytics.unitsChangePct)}
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {(['overview', 'cities', 'colors'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-3">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Users className="w-3 h-3" />
                        Total Accounts
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(analytics.totalAccounts)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <BarChart3 className="w-3 h-3" />
                        Units CY
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(analytics.totalUnitsCY)}
                      </div>
                    </div>
                  </div>

                  {/* YoY Change */}
                  <div
                    className={`rounded-lg p-3 ${
                      analytics.unitsChange >= 0 ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Year-over-Year Change</span>
                      <div
                        className={`flex items-center gap-1 font-semibold ${
                          analytics.unitsChange >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {analytics.unitsChange >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {analytics.unitsChange >= 0 ? '+' : ''}
                        {formatNumber(analytics.unitsChange)} units
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Previous year: {formatNumber(analytics.totalUnitsPY)} units
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-green-50 rounded p-2">
                      <ArrowUpRight className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-green-700">
                        {analytics.growingCount}
                      </div>
                      <div className="text-xs text-gray-500">Growing</div>
                    </div>
                    <div className="bg-red-50 rounded p-2">
                      <ArrowDownRight className="w-4 h-4 text-red-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-red-700">
                        {analytics.decliningCount}
                      </div>
                      <div className="text-xs text-gray-500">Declining</div>
                    </div>
                    <div className="bg-blue-50 rounded p-2">
                      <UserPlus className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-blue-700">
                        {analytics.newCount}
                      </div>
                      <div className="text-xs text-gray-500">New</div>
                    </div>
                    <div className="bg-amber-50 rounded p-2">
                      <UserMinus className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-amber-700">
                        {analytics.lostCount}
                      </div>
                      <div className="text-xs text-gray-500">Lost</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cities Tab */}
              {activeTab === 'cities' && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.cities.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No cities in this route
                    </p>
                  ) : (
                    analytics.cities
                      .sort((a, b) => b.total_units_cy - a.total_units_cy)
                      .map((city) => (
                        <div
                          key={city.city}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => onSelectCity?.(city)}
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {city.city}
                              </div>
                              <div className="text-xs text-gray-500">
                                {city.total_accounts} accounts
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatNumber(city.total_units_cy)}
                            </div>
                            <div
                              className={`text-xs ${
                                city.units_change >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {city.units_change >= 0 ? '+' : ''}
                              {formatNumber(city.units_change)}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.colorGroupBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No color data available
                    </p>
                  ) : (
                    analytics.colorGroupBreakdown.map((cg) => {
                      const pct =
                        analytics.totalUnitsCY > 0
                          ? (cg.units / analytics.totalUnitsCY) * 100
                          : 0;

                      return (
                        <div key={cg.color_group} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    COLOR_GROUP_COLORS[cg.color_group] || '#9ca3af',
                                }}
                              />
                              <span className="font-medium text-gray-700">
                                {cg.color_group}
                              </span>
                            </div>
                            <span className="text-gray-900">
                              {formatNumber(cg.units)} ({pct.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor:
                                  COLOR_GROUP_COLORS[cg.color_group] || '#9ca3af',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Select Route Button */}
            <div className="border-t border-gray-200 p-2 bg-gray-50">
              <button
                onClick={() =>
                  selectRoute(selectedRouteId === analytics.routeId ? null : analytics.routeId)
                }
                className={`w-full px-3 py-1.5 text-sm rounded transition-colors ${
                  selectedRouteId === analytics.routeId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {selectedRouteId === analytics.routeId
                  ? 'Route Selected on Map'
                  : 'Highlight on Map'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute top-20 left-4 w-96 max-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Route Analytics</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Summary */}
        {allAnalytics.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="text-xs font-medium text-gray-500 mb-2">
              All Routes Combined
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(totals.accounts)}
                </div>
                <div className="text-xs text-gray-500">Accounts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(totals.unitsCY)}
                </div>
                <div className="text-xs text-gray-500">Units CY</div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    totalChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatPercent(totalChangePct)}
                </div>
                <div className="text-xs text-gray-500">YoY Change</div>
              </div>
            </div>
          </div>
        )}

        {/* Routes List */}
        <div className="p-4 space-y-3">
          {sortedAnalytics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No routes with cities yet.</p>
              <p className="text-sm">Assign cities to routes to see analytics.</p>
            </div>
          ) : (
            sortedAnalytics.map(renderRouteCard)
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteAnalyticsPanel;
