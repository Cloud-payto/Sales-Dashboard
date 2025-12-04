import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
  Map,
  GitBranch,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Check,
  MapPin,
  Building2,
  GripVertical,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
} from 'lucide-react';
import { useTerritory } from '../../contexts/TerritoryContext';
import { useRoutes } from '../../contexts/RouteContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { PlaceStatus } from '../../types/territory';
import { CityData } from '../../types';

interface UnifiedControlPanelProps {
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

const PANEL_WIDTH = 340;
const COLLAPSED_SIZE = 48;

const STATUS_OPTIONS: { value: PlaceStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: '#10b981' },
  { value: 'cold_call', label: 'Cold Call', color: '#3b82f6' },
  { value: 'prospect', label: 'Prospect', color: '#f59e0b' },
  { value: 'inactive', label: 'Inactive', color: '#6b7280' },
];

const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
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

  // Panel state
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    routes: false,
    analytics: false,
  });
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('unifiedPanelPosition');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: 16, y: 16 };
      }
    }
    return { x: 16, y: 16 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Route editing state
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editingRouteName, setEditingRouteName] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const totalPlaces = places.length;
  const visiblePlacesCount = visibleMarkers.length;
  const totalCities = cityInsights?.total_cities || 0;
  const unassignedCities = getUnassignedCities();

  // Toggle section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Status filter handling
  const handleStatusFilterChange = (status: PlaceStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  // Route management
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

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    if ((e.target as HTMLElement).closest('input')) return;
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('select')) return;

    setIsDragging(true);
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const width = isExpanded ? PANEL_WIDTH : COLLAPSED_SIZE;
      const height = panelRef.current?.offsetHeight || COLLAPSED_SIZE;

      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      // Constrain to viewport
      const padding = 16;
      newX = Math.max(padding, Math.min(window.innerWidth - width - padding, newX));
      newY = Math.max(padding, Math.min(window.innerHeight - height - padding, newY));

      // Snap to edges
      if (newX < 40) newX = padding;
      if (newX > window.innerWidth - width - 40) newX = window.innerWidth - width - padding;
      if (newY < 40) newY = padding;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem('unifiedPanelPosition', JSON.stringify(position));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset, isExpanded, position]);

  // Collapsed state
  if (!isExpanded) {
    return (
      <div
        ref={panelRef}
        className="fixed z-30"
        style={{ left: position.x, top: position.y }}
      >
        <button
          onClick={() => setIsExpanded(true)}
          onMouseDown={handleMouseDown}
          className={`
            w-12 h-12 rounded-xl bg-white shadow-lg border border-gray-200
            flex items-center justify-center
            hover:shadow-xl hover:scale-105 active:scale-95
            transition-all duration-200 group
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          `}
        >
          <Settings className="w-5 h-5 text-gray-600 group-hover:rotate-45 transition-transform duration-300" />
          {statusFilter.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {statusFilter.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Expanded state
  return (
    <div
      ref={panelRef}
      className="fixed z-30"
      style={{ left: position.x, top: position.y, width: PANEL_WIDTH }}
    >
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100vh-6rem)]">
        {/* Header - Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`
            bg-gradient-to-r from-gray-800 to-gray-900 text-white
            px-4 py-3 flex items-center justify-between
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            select-none
          `}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-sm">Map Controls</h2>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="no-drag p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Search Section */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="no-drag w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="no-drag absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className="no-drag w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedSections.filters ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <span className="font-medium text-sm text-gray-700">Filters & Display</span>
              </div>
              {statusFilter.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {statusFilter.length} active
                </span>
              )}
            </button>

            {expandedSections.filters && (
              <div className="px-4 pb-4 space-y-4">
                {/* Status Filters */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Status Filters
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map(({ value, label, color }) => {
                      const isActive = statusFilter.includes(value);
                      const count = places.filter(p => p.status === value).length;
                      return (
                        <button
                          key={value}
                          onClick={() => handleStatusFilterChange(value)}
                          className={`no-drag flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: isActive ? '#fff' : color }}
                          />
                          {label}
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
                      className="no-drag mt-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {/* Display Options */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  {/* City Boundaries Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <Map className="w-4 h-4 text-gray-400" />
                      City Boundaries
                    </span>
                    <button
                      onClick={onToggleCityBoundaries}
                      className={`no-drag relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        showCityBoundaries ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                          showCityBoundaries ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Color Mode Toggle */}
                  {showCityBoundaries && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                        Color Mode
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onColorModeChange('performance')}
                          className={`no-drag flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                            colorMode === 'performance'
                              ? 'bg-green-100 text-green-700 border-2 border-green-500'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                          }`}
                        >
                          Performance
                        </button>
                        <button
                          onClick={() => onColorModeChange('routes')}
                          className={`no-drag flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
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
              </div>
            )}
          </div>

          {/* Routes Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('routes')}
              className="no-drag w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
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
                {/* Click-to-assign mode toggle */}
                <div className={`p-3 rounded-lg border-2 transition-all ${
                  cityAssignmentMode
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MousePointer className="w-4 h-4" />
                      Click-to-Assign Mode
                    </span>
                    <button
                      onClick={onToggleCityAssignmentMode}
                      className={`no-drag relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        cityAssignmentMode ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
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
                        className="no-drag w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="no-drag flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateRoute();
                        if (e.key === 'Escape') setIsCreatingRoute(false);
                      }}
                    />
                    <button
                      onClick={handleCreateRoute}
                      disabled={!newRouteName.trim()}
                      className="no-drag p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsCreatingRoute(false)}
                      className="no-drag p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreatingRoute(true)}
                    className="no-drag w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create Route
                  </button>
                )}

                {/* Routes List */}
                {routes.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
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
                            className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-gray-50"
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
                                className="no-drag flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                  <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {route.cities.map((cityName) => {
                                      const cityData = getCityData(cityName);
                                      return (
                                        <div
                                          key={cityName}
                                          className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs group"
                                        >
                                          <button
                                            onClick={() => cityData && onSelectCity?.(cityData)}
                                            className="no-drag flex-1 text-left hover:text-blue-600"
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
                                            className="no-drag p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
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
                                  className="no-drag w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                      className="no-drag px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingRouteId(null)}
                                      className="no-drag px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
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
                                      className={`no-drag px-3 py-1.5 text-xs rounded transition-colors ${
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
                                      className="no-drag p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteRoute(route.id);
                                      }}
                                      className="no-drag p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
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
                  <div className="text-center py-4 text-sm text-gray-500">
                    <GitBranch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No routes yet
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

          {/* Analytics Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('analytics')}
              className="no-drag w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedSections.analytics ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-sm text-gray-700">Analytics</span>
              </div>
            </button>

            {expandedSections.analytics && cityInsights && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="text-lg font-bold text-blue-700">
                      {cityInsights.summary.total_accounts.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-600">Total Accounts</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-green-50 border border-green-100">
                    <div className="text-lg font-bold text-green-700">
                      {cityInsights.summary.total_units_cy.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600">Units CY</div>
                  </div>
                  <div className="col-span-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Year-over-Year</span>
                      {(() => {
                        const change = cityInsights.summary.total_units_cy - cityInsights.summary.total_units_py;
                        return (
                          <span
                            className={`flex items-center gap-1 font-bold ${
                              change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {change >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {change >= 0 ? '+' : ''}
                            {change.toLocaleString()}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-medium">{visiblePlacesCount}</span>
            <span className="text-gray-400">/ {totalPlaces}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-green-500" />
            <span className="font-medium">{totalCities}</span>
            <span>cities</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedControlPanel;
