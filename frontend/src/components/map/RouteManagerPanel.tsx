import React, { useState } from 'react';
import { useRoutes } from '../../contexts/RouteContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { Route as RouteType, CityData } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronRight,
  ChevronDown,
  MapPin,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
} from 'lucide-react';

interface RouteManagerPanelProps {
  onClose: () => void;
  onSelectCity?: (city: CityData) => void;
}

const RouteManagerPanel: React.FC<RouteManagerPanelProps> = ({ onClose, onSelectCity }) => {
  const {
    routes,
    selectedRouteId,
    createRoute,
    updateRoute,
    deleteRoute,
    addCityToRoute,
    removeCityFromRoute,
    selectRoute,
    getRouteAnalytics,
    getUnassignedCities,
  } = useRoutes();
  const { dashboardData } = useDashboard();

  const [isCreating, setIsCreating] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [showUnassigned, setShowUnassigned] = useState(false);

  const cityInsights = dashboardData?.city_insights;
  const unassignedCities = getUnassignedCities();

  const handleCreateRoute = () => {
    if (newRouteName.trim()) {
      const route = createRoute(newRouteName.trim());
      setNewRouteName('');
      setIsCreating(false);
      setExpandedRouteId(route.id);
    }
  };

  const handleStartEdit = (route: RouteType) => {
    setEditingRouteId(route.id);
    setEditingName(route.name);
  };

  const handleSaveEdit = (routeId: string) => {
    if (editingName.trim()) {
      updateRoute(routeId, { name: editingName.trim() });
    }
    setEditingRouteId(null);
    setEditingName('');
  };

  const handleDeleteRoute = (routeId: string) => {
    if (confirm('Are you sure you want to delete this route? Cities will become unassigned.')) {
      deleteRoute(routeId);
    }
  };

  const handleAssignCity = (routeId: string, cityName: string) => {
    addCityToRoute(routeId, cityName);
  };

  const handleRemoveCity = (routeId: string, cityName: string) => {
    removeCityFromRoute(routeId, cityName);
  };

  const getCityData = (cityName: string): CityData | undefined => {
    return cityInsights?.cities.find(c => c.city === cityName);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercent = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  return (
    <div className="absolute top-20 left-4 w-96 max-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Route Manager</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Create New Route */}
        {isCreating ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
              placeholder="Route name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateRoute();
                if (e.key === 'Escape') setIsCreating(false);
              }}
            />
            <button
              onClick={handleCreateRoute}
              disabled={!newRouteName.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Route
          </button>
        )}

        {/* Routes List */}
        {routes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No routes created yet.</p>
            <p className="text-sm">Create a route to start grouping cities.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routes.map((route) => {
              const analytics = getRouteAnalytics(route.id);
              const isExpanded = expandedRouteId === route.id;
              const isEditing = editingRouteId === route.id;

              return (
                <div
                  key={route.id}
                  className={`border rounded-lg overflow-hidden transition-colors ${
                    selectedRouteId === route.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Route Header */}
                  <div
                    className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: route.color }}
                    />

                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(route.id);
                          if (e.key === 'Escape') setEditingRouteId(null);
                        }}
                      />
                    ) : (
                      <span className="flex-1 font-medium text-gray-900">{route.name}</span>
                    )}

                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {route.cities.length} cities
                    </span>

                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-3 space-y-3">
                      {/* Analytics Summary */}
                      {analytics && analytics.totalAccounts > 0 && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 rounded p-2">
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <Users className="w-3 h-3" />
                              Accounts
                            </div>
                            <div className="font-semibold text-gray-900">
                              {formatNumber(analytics.totalAccounts)}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <BarChart3 className="w-3 h-3" />
                              Units CY
                            </div>
                            <div className="font-semibold text-gray-900">
                              {formatNumber(analytics.totalUnitsCY)}
                            </div>
                          </div>
                          <div className="col-span-2 bg-gray-50 rounded p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">YoY Change</span>
                              <span
                                className={`flex items-center gap-1 font-semibold ${
                                  analytics.unitsChange >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {analytics.unitsChange >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {formatNumber(analytics.unitsChange)} ({formatPercent(analytics.unitsChangePct)})
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cities in Route */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-2">Cities in Route</div>
                        {route.cities.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No cities assigned</p>
                        ) : (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {route.cities.map((cityName) => {
                              const cityData = getCityData(cityName);
                              return (
                                <div
                                  key={cityName}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm group"
                                >
                                  <div
                                    className="flex-1 cursor-pointer hover:text-blue-600"
                                    onClick={() => cityData && onSelectCity?.(cityData)}
                                  >
                                    <span>{cityName}</span>
                                    {cityData && (
                                      <span className="text-xs text-gray-400 ml-2">
                                        {cityData.total_accounts} accts
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleRemoveCity(route.id, cityName)}
                                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Add City Dropdown */}
                      {unassignedCities.length > 0 && (
                        <div>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignCity(route.id, e.target.value);
                              }
                            }}
                          >
                            <option value="">Add a city...</option>
                            {unassignedCities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Route Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(route.id)}
                              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRouteId(null)}
                              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectRoute(selectedRouteId === route.id ? null : route.id);
                              }}
                              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                                selectedRouteId === route.id
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {selectedRouteId === route.id ? 'Selected' : 'Select'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(route);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRoute(route.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Unassigned Cities */}
        {unassignedCities.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowUnassigned(!showUnassigned)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {showUnassigned ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span>Unassigned Cities ({unassignedCities.length})</span>
            </button>

            {showUnassigned && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {unassignedCities.map((cityName) => {
                  const cityData = getCityData(cityName);
                  return (
                    <div
                      key={cityName}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <div
                        className="flex-1 cursor-pointer hover:text-blue-600"
                        onClick={() => cityData && onSelectCity?.(cityData)}
                      >
                        <span>{cityName}</span>
                        {cityData && (
                          <span className="text-xs text-gray-400 ml-2">
                            {cityData.total_accounts} accts
                          </span>
                        )}
                      </div>
                      {routes.length > 0 && (
                        <select
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignCity(e.target.value, cityName);
                            }
                          }}
                        >
                          <option value="">Assign...</option>
                          {routes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 text-xs text-gray-500">
        Routes are saved locally in your browser.
      </div>
    </div>
  );
};

export default RouteManagerPanel;
