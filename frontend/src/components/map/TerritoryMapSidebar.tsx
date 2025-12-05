import React, { useState } from 'react';
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Map,
  GitBranch,
  Plus,
  Edit2,
  Trash2,
  Check,
  MapPin,
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useTerritory } from '../../contexts/TerritoryContext';
import { useRoutes } from '../../contexts/RouteContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { PlaceStatus } from '../../types/territory';
import { CityData } from '../../types';

interface TerritoryMapSidebarProps {
  showCityBoundaries: boolean;
  onToggleCityBoundaries: () => void;
  colorMode: 'performance' | 'routes';
  onColorModeChange: (mode: 'performance' | 'routes') => void;
  onSelectCity?: (city: CityData) => void;
  cityAssignmentMode: boolean;
  onToggleCityAssignmentMode: () => void;
  selectedRouteForAssignment: string | null;
  onSelectRouteForAssignment: (routeId: string | null) => void;
}

const STATUS_OPTIONS: { value: PlaceStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: '#10b981' },
  { value: 'cold_call', label: 'Cold Call', color: '#3b82f6' },
  { value: 'prospect', label: 'Prospect', color: '#f59e0b' },
  { value: 'inactive', label: 'Inactive', color: '#6b7280' },
];

const TerritoryMapSidebar: React.FC<TerritoryMapSidebarProps> = ({
  showCityBoundaries,
  onToggleCityBoundaries,
  colorMode,
  onColorModeChange,
  onSelectCity,
  cityAssignmentMode,
  onToggleCityAssignmentMode,
  selectedRouteForAssignment,
  onSelectRouteForAssignment,
}) => {
  const {
    places,
    visibleMarkers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useTerritory();

  const {
    routes,
    selectedRouteId,
    createRoute,
    updateRoute,
    deleteRoute,
    selectRoute,
    getRouteAnalytics,
    getUnassignedCities,
    addCityToRoute,
    removeCityFromRoute,
  } = useRoutes();

  const { dashboardData } = useDashboard();
  const cityInsights = dashboardData?.city_insights;

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    display: true,
    routes: true,
  });

  // Route editing state
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editingRouteName, setEditingRouteName] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // Stats
  const totalPlaces = places.length;
  const visiblePlacesCount = visibleMarkers.length;
  const totalCities = cityInsights?.total_cities || 0;
  const unassignedCities = getUnassignedCities();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStatusFilterChange = (status: PlaceStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const handleCreateRoute = () => {
    if (newRouteName.trim()) {
      const route = createRoute(newRouteName.trim());
      setNewRouteName('');
      setIsCreatingRoute(false);
      setExpandedRouteId(route.id);
    }
  };

  const handleSaveRouteEdit = (routeId: string) => {
    if (editingRouteName.trim()) {
      updateRoute(routeId, { name: editingRouteName.trim() });
    }
    setEditingRouteId(null);
    setEditingRouteName('');
  };

  const handleDeleteRoute = (routeId: string) => {
    if (confirm('Delete this route? Cities will become unassigned.')) {
      deleteRoute(routeId);
      if (selectedRouteForAssignment === routeId) {
        onSelectRouteForAssignment(null);
      }
    }
  };

  const getCityData = (cityName: string): CityData | undefined => {
    return cityInsights?.cities.find(c => c.city === cityName);
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Territory Map</h2>
        <p className="text-xs text-gray-500 mt-0.5">Manage routes and territories</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('filters')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.filters ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <span className="font-medium text-sm text-gray-700">Status Filters</span>
            </div>
            {statusFilter.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {statusFilter.length} active
              </span>
            )}
          </button>

          {expandedSections.filters && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(({ value, label, color }) => {
                  const isActive = statusFilter.includes(value);
                  const count = places.filter(p => p.status === value).length;
                  return (
                    <button
                      key={value}
                      onClick={() => handleStatusFilterChange(value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: isActive ? '#fff' : color }}
                      />
                      <span className="truncate">{label}</span>
                      <span className={`ml-auto ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {statusFilter.length > 0 && (
                <button
                  onClick={() => setStatusFilter([])}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Display Options Section */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('display')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.display ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <Map className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-sm text-gray-700">Display Options</span>
            </div>
          </button>

          {expandedSections.display && (
            <div className="px-4 pb-4 space-y-4">
              {/* City Boundaries Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  {showCityBoundaries ? (
                    <Eye className="w-4 h-4 text-blue-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  City Boundaries
                </span>
                <button
                  onClick={onToggleCityBoundaries}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    showCityBoundaries ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                      showCityBoundaries ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Color Mode */}
              {showCityBoundaries && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Color Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onColorModeChange('performance')}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                        colorMode === 'performance'
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      Performance
                    </button>
                    <button
                      onClick={() => onColorModeChange('routes')}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                        colorMode === 'routes'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      Routes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Routes Section */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('routes')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.routes ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <GitBranch className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-sm text-gray-700">Routes</span>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              {routes.length}
            </span>
          </button>

          {expandedSections.routes && (
            <div className="px-4 pb-4 space-y-3">
              {/* Click-to-assign mode */}
              <div className={`p-3 rounded-lg border-2 transition-all ${
                cityAssignmentMode
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MousePointer className="w-4 h-4" />
                    Click-to-Assign
                  </span>
                  <button
                    onClick={onToggleCityAssignmentMode}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      cityAssignmentMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                        cityAssignmentMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {cityAssignmentMode && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                      Click cities on the map to add them to the selected route
                    </p>
                    <select
                      value={selectedRouteForAssignment || ''}
                      onChange={(e) => onSelectRouteForAssignment(e.target.value || null)}
                      className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a route...</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name} ({route.cities.length} cities)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Create Route */}
              {isCreatingRoute ? (
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
                      if (e.key === 'Escape') setIsCreatingRoute(false);
                    }}
                  />
                  <button
                    onClick={handleCreateRoute}
                    disabled={!newRouteName.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsCreatingRoute(false)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingRoute(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Route
                </button>
              )}

              {/* Routes List */}
              {routes.length > 0 ? (
                <div className="space-y-2">
                  {routes.map((route) => {
                    const analytics = getRouteAnalytics(route.id);
                    const isExpanded = expandedRouteId === route.id;
                    const isEditing = editingRouteId === route.id;
                    const isSelectedForAssignment = selectedRouteForAssignment === route.id;

                    return (
                      <div
                        key={route.id}
                        className={`border rounded-lg overflow-hidden transition-all ${
                          isSelectedForAssignment
                            ? 'border-blue-500 bg-blue-50'
                            : selectedRouteId === route.id
                            ? 'border-purple-500 bg-purple-50'
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
                              value={editingRouteName}
                              onChange={(e) => setEditingRouteName(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRouteEdit(route.id);
                                if (e.key === 'Escape') setEditingRouteId(null);
                              }}
                            />
                          ) : (
                            <span className="flex-1 font-medium text-sm text-gray-900 truncate">
                              {route.name}
                            </span>
                          )}

                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {route.cities.length}
                          </span>

                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 p-3 space-y-3">
                            {/* Quick Stats */}
                            {analytics && analytics.totalAccounts > 0 && (
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gray-50 rounded p-2">
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <Users className="w-3 h-3" />
                                    Accounts
                                  </div>
                                  <div className="font-semibold text-gray-900">
                                    {analytics.totalAccounts.toLocaleString()}
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded p-2">
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <BarChart3 className="w-3 h-3" />
                                    Units CY
                                  </div>
                                  <div className="font-semibold text-gray-900">
                                    {analytics.totalUnitsCY.toLocaleString()}
                                  </div>
                                </div>
                                <div className="col-span-2 bg-gray-50 rounded p-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-500">YoY Change</span>
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
                                      {analytics.unitsChange >= 0 ? '+' : ''}
                                      {analytics.unitsChange.toLocaleString()} ({analytics.unitsChangePct.toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Cities in Route */}
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-2">
                                Cities ({route.cities.length})
                              </div>
                              {route.cities.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">
                                  No cities assigned. Enable click-to-assign mode above.
                                </p>
                              ) : (
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {route.cities.map((cityName) => {
                                    const cityData = getCityData(cityName);
                                    return (
                                      <div
                                        key={cityName}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs group"
                                      >
                                        <button
                                          onClick={() => cityData && onSelectCity?.(cityData)}
                                          className="flex-1 text-left hover:text-blue-600"
                                        >
                                          {cityName}
                                          {cityData && (
                                            <span className="text-gray-400 ml-1">
                                              ({cityData.total_accounts})
                                            </span>
                                          )}
                                        </button>
                                        <button
                                          onClick={() => removeCityFromRoute(route.id, cityName)}
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
                              <select
                                className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    addCityToRoute(route.id, e.target.value);
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
                            )}

                            {/* Route Actions */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveRouteEdit(route.id)}
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
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    {selectedRouteId === route.id ? 'Selected' : 'Highlight'}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingRouteId(route.id);
                                      setEditingRouteName(route.name);
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
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">
                  <GitBranch className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p>No routes yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create a route to get started</p>
                </div>
              )}

              {/* Unassigned Cities Count */}
              {unassignedCities.length > 0 && (
                <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                  {unassignedCities.length} cities not assigned to any route
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{visiblePlacesCount}</span>
          <span className="text-gray-400">/ {totalPlaces} places</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-green-500" />
          <span className="font-medium">{totalCities}</span>
          <span className="text-gray-400">cities</span>
        </div>
      </div>
    </div>
  );
};

export default TerritoryMapSidebar;
