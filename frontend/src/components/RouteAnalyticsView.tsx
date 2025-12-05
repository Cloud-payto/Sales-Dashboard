import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  BarChart3,
  ChevronDown,
  ChevronRight,
  MapPin,
  Palette,
  Map,
} from 'lucide-react';
import { useRoutes } from '../contexts/RouteContext';
import { RouteAnalytics } from '../types';

const RouteAnalyticsView: React.FC = () => {
  const { routes, getAllRoutesAnalytics } = useRoutes();
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const allAnalytics = getAllRoutesAnalytics();

  // Calculate totals across all routes
  const totals = allAnalytics.reduce(
    (acc, analytics) => ({
      accounts: acc.accounts + analytics.totalAccounts,
      unitsCY: acc.unitsCY + analytics.totalUnitsCY,
      unitsPY: acc.unitsPY + analytics.totalUnitsPY,
      growing: acc.growing + analytics.growingCount,
      declining: acc.declining + analytics.decliningCount,
      lost: acc.lost + analytics.lostCount,
      new: acc.new + analytics.newCount,
    }),
    { accounts: 0, unitsCY: 0, unitsPY: 0, growing: 0, declining: 0, lost: 0, new: 0 }
  );

  const totalChange = totals.unitsCY - totals.unitsPY;
  const totalChangePct = totals.unitsPY > 0 ? ((totals.unitsCY / totals.unitsPY) - 1) * 100 : 0;

  if (routes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <GitBranch className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Routes Created</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Create routes in the Territory Map to see analytics breakdown by route.
          Routes help you organize your territory and track performance by region.
        </p>
        <Link
          to="/territory-map"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Map className="w-5 h-5" />
          Go to Territory Map
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Route Analytics</h2>
          <p className="text-gray-600 mt-1">
            Performance breakdown by route ({routes.length} routes)
          </p>
        </div>
        <Link
          to="/territory-map"
          className="inline-flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
        >
          <Map className="w-4 h-4" />
          Manage Routes
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Routes</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{routes.length}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Accounts in Routes</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totals.accounts.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Units CY</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totals.unitsCY.toLocaleString()}</div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              totalChange >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {totalChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-500">YoY Change</span>
          </div>
          <div className={`text-3xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toLocaleString()}
          </div>
          <div className={`text-sm ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalChangePct >= 0 ? '+' : ''}{totalChangePct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Route Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Route Breakdown</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {allAnalytics.map((analytics) => {
            const route = routes.find(r => r.id === analytics.routeId);
            if (!route) return null;

            const isExpanded = expandedRouteId === analytics.routeId;

            return (
              <div key={analytics.routeId}>
                {/* Route Header Row */}
                <div
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedRouteId(isExpanded ? null : analytics.routeId)}
                >
                  <div className="flex items-center gap-4">
                    {/* Route Color & Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: route.color }}
                      />
                      <span className="font-semibold text-gray-900 truncate">
                        {route.name}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {route.cities.length} cities, {route.placeIds?.length || 0} places
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-gray-500 text-xs">Accounts</div>
                        <div className="font-semibold text-gray-900">
                          {analytics.totalAccounts.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 text-xs">Units CY</div>
                        <div className="font-semibold text-gray-900">
                          {analytics.totalUnitsCY.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <div className="text-gray-500 text-xs">YoY Change</div>
                        <div className={`font-semibold flex items-center justify-center gap-1 ${
                          analytics.unitsChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {analytics.unitsChange >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {analytics.unitsChange >= 0 ? '+' : ''}
                          {analytics.unitsChange.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                      {/* Account Status Breakdown */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          Account Status
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-xs text-green-600 font-medium">Growing</div>
                            <div className="text-xl font-bold text-green-700">
                              {analytics.growingCount}
                            </div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-3">
                            <div className="text-xs text-red-600 font-medium">Declining</div>
                            <div className="text-xl font-bold text-red-700">
                              {analytics.decliningCount}
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-xs text-blue-600 font-medium">New</div>
                            <div className="text-xl font-bold text-blue-700">
                              {analytics.newCount}
                            </div>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="text-xs text-gray-600 font-medium">Lost</div>
                            <div className="text-xl font-bold text-gray-700">
                              {analytics.lostCount}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top Color Groups */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Palette className="w-4 h-4 text-gray-400" />
                          Top Color Groups
                        </h4>
                        {analytics.colorGroupBreakdown.length > 0 ? (
                          <div className="space-y-2">
                            {analytics.colorGroupBreakdown.slice(0, 5).map((cg, idx) => {
                              const maxUnits = analytics.colorGroupBreakdown[0]?.units || 1;
                              const percentage = (cg.units / maxUnits) * 100;
                              return (
                                <div key={cg.color_group} className="flex items-center gap-3">
                                  <span className="text-xs text-gray-500 w-4">{idx + 1}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-700 truncate">
                                        {cg.color_group}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {cg.units.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${percentage}%`,
                                          backgroundColor: route.color,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No data available</p>
                        )}
                      </div>

                      {/* Cities in Route */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 lg:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          Cities ({route.cities.length})
                        </h4>
                        {route.cities.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {analytics.cities.map((city) => (
                              <div
                                key={city.city}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                              >
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="font-medium text-gray-700">{city.city}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-500">{city.total_accounts} accounts</span>
                                <span className={`text-xs ${
                                  city.units_change >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {city.units_change >= 0 ? '+' : ''}{city.units_change.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No cities assigned to this route</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Route Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Accounts
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Units CY
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Units PY
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  % Change
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Growing
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Declining
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allAnalytics.map((analytics) => {
                const route = routes.find(r => r.id === analytics.routeId);
                if (!route) return null;

                return (
                  <tr key={analytics.routeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: route.color }}
                        />
                        <span className="font-medium text-gray-900">{route.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {analytics.totalAccounts.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {analytics.totalUnitsCY.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {analytics.totalUnitsPY.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${
                      analytics.unitsChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analytics.unitsChange >= 0 ? '+' : ''}{analytics.unitsChange.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${
                      analytics.unitsChangePct >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analytics.unitsChangePct >= 0 ? '+' : ''}{analytics.unitsChangePct.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right text-green-600">
                      {analytics.growingCount}
                    </td>
                    <td className="px-6 py-4 text-right text-red-600">
                      {analytics.decliningCount}
                    </td>
                  </tr>
                );
              })}
              {/* Totals Row */}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 text-gray-900">Total</td>
                <td className="px-6 py-4 text-right text-gray-900">
                  {totals.accounts.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  {totals.unitsCY.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-gray-500">
                  {totals.unitsPY.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-right ${
                  totalChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalChange >= 0 ? '+' : ''}{totalChange.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-right ${
                  totalChangePct >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalChangePct >= 0 ? '+' : ''}{totalChangePct.toFixed(1)}%
                </td>
                <td className="px-6 py-4 text-right text-green-600">
                  {totals.growing}
                </td>
                <td className="px-6 py-4 text-right text-red-600">
                  {totals.declining}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RouteAnalyticsView;
