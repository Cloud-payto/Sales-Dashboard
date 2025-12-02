import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Route, RouteAnalytics, CityColorGroup } from '../types';
import { useDashboard } from './DashboardContext';

// Predefined route colors
const ROUTE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

const STORAGE_KEY = 'sales_dashboard_routes';

interface RouteContextType {
  routes: Route[];
  selectedRouteId: string | null;
  isManagingRoutes: boolean;

  // Route CRUD
  createRoute: (name: string, description?: string) => Route;
  updateRoute: (id: string, updates: Partial<Omit<Route, 'id' | 'createdAt'>>) => void;
  deleteRoute: (id: string) => void;

  // City assignment
  addCityToRoute: (routeId: string, cityName: string) => void;
  removeCityFromRoute: (routeId: string, cityName: string) => void;
  getCityRoute: (cityName: string) => Route | null;

  // Selection
  selectRoute: (routeId: string | null) => void;
  setManagingRoutes: (managing: boolean) => void;

  // Analytics
  getRouteAnalytics: (routeId: string) => RouteAnalytics | null;
  getAllRoutesAnalytics: () => RouteAnalytics[];

  // Utilities
  getNextColor: () => string;
  getUnassignedCities: () => string[];
}

const RouteContext = createContext<RouteContextType | null>(null);

export const useRoutes = () => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoutes must be used within a RouteProvider');
  }
  return context;
};

interface RouteProviderProps {
  children: React.ReactNode;
}

export const RouteProvider: React.FC<RouteProviderProps> = ({ children }) => {
  const { dashboardData } = useDashboard();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isManagingRoutes, setIsManagingRoutes] = useState(false);

  // Load routes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRoutes(parsed);
      }
    } catch (e) {
      console.warn('Failed to load routes from localStorage:', e);
    }
  }, []);

  // Save routes to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
    } catch (e) {
      console.warn('Failed to save routes to localStorage:', e);
    }
  }, [routes]);

  // Get next available color
  const getNextColor = useCallback((): string => {
    const usedColors = routes.map(r => r.color);
    const availableColor = ROUTE_COLORS.find(c => !usedColors.includes(c));
    return availableColor || ROUTE_COLORS[routes.length % ROUTE_COLORS.length];
  }, [routes]);

  // Create a new route
  const createRoute = useCallback((name: string, description?: string): Route => {
    const newRoute: Route = {
      id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      color: getNextColor(),
      cities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoutes(prev => [...prev, newRoute]);
    return newRoute;
  }, [getNextColor]);

  // Update a route
  const updateRoute = useCallback((id: string, updates: Partial<Omit<Route, 'id' | 'createdAt'>>) => {
    setRoutes(prev => prev.map(route =>
      route.id === id
        ? { ...route, ...updates, updatedAt: new Date().toISOString() }
        : route
    ));
  }, []);

  // Delete a route
  const deleteRoute = useCallback((id: string) => {
    setRoutes(prev => prev.filter(route => route.id !== id));
    if (selectedRouteId === id) {
      setSelectedRouteId(null);
    }
  }, [selectedRouteId]);

  // Add city to a route
  const addCityToRoute = useCallback((routeId: string, cityName: string) => {
    setRoutes(prev => prev.map(route => {
      // First, remove from any other route
      if (route.id !== routeId && route.cities.includes(cityName)) {
        return {
          ...route,
          cities: route.cities.filter(c => c !== cityName),
          updatedAt: new Date().toISOString(),
        };
      }
      // Then add to target route
      if (route.id === routeId && !route.cities.includes(cityName)) {
        return {
          ...route,
          cities: [...route.cities, cityName],
          updatedAt: new Date().toISOString(),
        };
      }
      return route;
    }));
  }, []);

  // Remove city from a route
  const removeCityFromRoute = useCallback((routeId: string, cityName: string) => {
    setRoutes(prev => prev.map(route =>
      route.id === routeId
        ? {
            ...route,
            cities: route.cities.filter(c => c !== cityName),
            updatedAt: new Date().toISOString(),
          }
        : route
    ));
  }, []);

  // Get which route a city belongs to
  const getCityRoute = useCallback((cityName: string): Route | null => {
    return routes.find(route => route.cities.includes(cityName)) || null;
  }, [routes]);

  // Select a route
  const selectRoute = useCallback((routeId: string | null) => {
    setSelectedRouteId(routeId);
  }, []);

  // Toggle route management mode
  const setManagingRoutes = useCallback((managing: boolean) => {
    setIsManagingRoutes(managing);
  }, []);

  // Get cities that aren't assigned to any route
  const getUnassignedCities = useCallback((): string[] => {
    if (!dashboardData?.city_insights?.cities) return [];

    const assignedCities = new Set(routes.flatMap(r => r.cities));
    return dashboardData.city_insights.cities
      .map(c => c.city)
      .filter(city => !assignedCities.has(city));
  }, [dashboardData, routes]);

  // Calculate analytics for a single route
  const getRouteAnalytics = useCallback((routeId: string): RouteAnalytics | null => {
    const route = routes.find(r => r.id === routeId);
    if (!route || !dashboardData?.city_insights?.cities) return null;

    // Get city data for cities in this route
    const routeCities = dashboardData.city_insights.cities.filter(
      city => route.cities.includes(city.city)
    );

    if (routeCities.length === 0) {
      return {
        routeId: route.id,
        routeName: route.name,
        totalAccounts: 0,
        totalUnitsCY: 0,
        totalUnitsPY: 0,
        unitsChange: 0,
        unitsChangePct: 0,
        growingCount: 0,
        decliningCount: 0,
        lostCount: 0,
        newCount: 0,
        cities: [],
        colorGroupBreakdown: [],
      };
    }

    // Aggregate metrics
    const totalAccounts = routeCities.reduce((sum, c) => sum + c.total_accounts, 0);
    const totalUnitsCY = routeCities.reduce((sum, c) => sum + c.total_units_cy, 0);
    const totalUnitsPY = routeCities.reduce((sum, c) => sum + c.total_units_py, 0);
    const unitsChange = totalUnitsCY - totalUnitsPY;
    const unitsChangePct = totalUnitsPY > 0
      ? ((totalUnitsCY / totalUnitsPY) - 1) * 100
      : 0;

    const growingCount = routeCities.reduce((sum, c) => sum + c.growing_count, 0);
    const decliningCount = routeCities.reduce((sum, c) => sum + c.declining_count, 0);
    const lostCount = routeCities.reduce((sum, c) => sum + c.lost_count, 0);
    const newCount = routeCities.reduce((sum, c) => sum + c.new_count, 0);

    // Aggregate color groups
    const colorGroupMap = new Map<string, number>();
    routeCities.forEach(city => {
      city.color_groups_cy.forEach(cg => {
        colorGroupMap.set(cg.color_group, (colorGroupMap.get(cg.color_group) || 0) + cg.units);
      });
    });

    const colorGroupBreakdown: CityColorGroup[] = Array.from(colorGroupMap.entries())
      .map(([color_group, units]) => ({ color_group, units }))
      .sort((a, b) => b.units - a.units);

    return {
      routeId: route.id,
      routeName: route.name,
      totalAccounts,
      totalUnitsCY,
      totalUnitsPY,
      unitsChange,
      unitsChangePct,
      growingCount,
      decliningCount,
      lostCount,
      newCount,
      cities: routeCities,
      colorGroupBreakdown,
    };
  }, [routes, dashboardData]);

  // Get analytics for all routes
  const getAllRoutesAnalytics = useCallback((): RouteAnalytics[] => {
    return routes
      .map(route => getRouteAnalytics(route.id))
      .filter((analytics): analytics is RouteAnalytics => analytics !== null);
  }, [routes, getRouteAnalytics]);

  const value = useMemo(() => ({
    routes,
    selectedRouteId,
    isManagingRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    addCityToRoute,
    removeCityFromRoute,
    getCityRoute,
    selectRoute,
    setManagingRoutes,
    getRouteAnalytics,
    getAllRoutesAnalytics,
    getNextColor,
    getUnassignedCities,
  }), [
    routes,
    selectedRouteId,
    isManagingRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    addCityToRoute,
    removeCityFromRoute,
    getCityRoute,
    selectRoute,
    setManagingRoutes,
    getRouteAnalytics,
    getAllRoutesAnalytics,
    getNextColor,
    getUnassignedCities,
  ]);

  return (
    <RouteContext.Provider value={value}>
      {children}
    </RouteContext.Provider>
  );
};

export default RouteContext;
