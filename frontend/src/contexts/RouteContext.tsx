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

  // Account assignment
  addAccountToRoute: (routeId: string, accountNumber: number) => void;
  removeAccountFromRoute: (routeId: string, accountNumber: number) => void;
  getAccountRoute: (accountNumber: number) => Route | null;

  // Place/marker assignment
  addPlaceToRoute: (routeId: string, placeId: string) => void;
  removePlaceFromRoute: (routeId: string, placeId: string) => void;
  getPlaceRoute: (placeId: string) => Route | null;

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
      accounts: [],
      placeIds: [],
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

  // Add account to a route
  const addAccountToRoute = useCallback((routeId: string, accountNumber: number) => {
    setRoutes(prev => prev.map(route => {
      // First, remove from any other route
      if (route.id !== routeId && route.accounts?.includes(accountNumber)) {
        return {
          ...route,
          accounts: route.accounts.filter(a => a !== accountNumber),
          updatedAt: new Date().toISOString(),
        };
      }
      // Then add to target route
      if (route.id === routeId && !route.accounts?.includes(accountNumber)) {
        return {
          ...route,
          accounts: [...(route.accounts || []), accountNumber],
          updatedAt: new Date().toISOString(),
        };
      }
      return route;
    }));
  }, []);

  // Remove account from a route
  const removeAccountFromRoute = useCallback((routeId: string, accountNumber: number) => {
    setRoutes(prev => prev.map(route =>
      route.id === routeId
        ? {
            ...route,
            accounts: (route.accounts || []).filter(a => a !== accountNumber),
            updatedAt: new Date().toISOString(),
          }
        : route
    ));
  }, []);

  // Get which route an account belongs to
  const getAccountRoute = useCallback((accountNumber: number): Route | null => {
    return routes.find(route => route.accounts?.includes(accountNumber)) || null;
  }, [routes]);

  // Add place to a route
  const addPlaceToRoute = useCallback((routeId: string, placeId: string) => {
    setRoutes(prev => prev.map(route => {
      // First, remove from any other route
      if (route.id !== routeId && route.placeIds?.includes(placeId)) {
        return {
          ...route,
          placeIds: route.placeIds.filter(p => p !== placeId),
          updatedAt: new Date().toISOString(),
        };
      }
      // Then add to target route
      if (route.id === routeId && !route.placeIds?.includes(placeId)) {
        return {
          ...route,
          placeIds: [...(route.placeIds || []), placeId],
          updatedAt: new Date().toISOString(),
        };
      }
      return route;
    }));
  }, []);

  // Remove place from a route
  const removePlaceFromRoute = useCallback((routeId: string, placeId: string) => {
    setRoutes(prev => prev.map(route =>
      route.id === routeId
        ? {
            ...route,
            placeIds: (route.placeIds || []).filter(p => p !== placeId),
            updatedAt: new Date().toISOString(),
          }
        : route
    ));
  }, []);

  // Get which route a place belongs to
  const getPlaceRoute = useCallback((placeId: string): Route | null => {
    return routes.find(route => route.placeIds?.includes(placeId)) || null;
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

  // Helper to get all accounts from city insights with their data
  const getAllAccountsFromCityInsights = useCallback(() => {
    if (!dashboardData?.city_insights?.cities) return [];

    const accountMap = new Map<number, {
      account_number: number;
      account_name: string;
      city: string;
      current_year_units: number;
      previous_year_units: number;
      change: number;
      status: 'growing' | 'declining' | 'lost' | 'new';
    }>();

    dashboardData.city_insights.cities.forEach(city => {
      // Add growing accounts
      city.growing_accounts?.forEach(acc => {
        accountMap.set(acc.account_number, {
          account_number: acc.account_number,
          account_name: acc.account_name,
          city: city.city,
          current_year_units: acc.current_year_units,
          previous_year_units: acc.previous_year_units,
          change: acc.change,
          status: 'growing',
        });
      });

      // Add declining accounts
      city.declining_accounts?.forEach(acc => {
        accountMap.set(acc.account_number, {
          account_number: acc.account_number,
          account_name: acc.account_name,
          city: city.city,
          current_year_units: acc.current_year_units,
          previous_year_units: acc.previous_year_units,
          change: acc.change,
          status: 'declining',
        });
      });

      // Add lost accounts
      city.lost_accounts?.forEach(acc => {
        accountMap.set(acc.account_number, {
          account_number: acc.account_number,
          account_name: acc.account_name,
          city: city.city,
          current_year_units: acc.current_year_units,
          previous_year_units: acc.previous_year_units,
          change: acc.change,
          status: 'lost',
        });
      });

      // Add new accounts
      city.new_accounts?.forEach(acc => {
        accountMap.set(acc.account_number, {
          account_number: acc.account_number,
          account_name: acc.account_name,
          city: city.city,
          current_year_units: acc.current_year_units,
          previous_year_units: acc.previous_year_units,
          change: acc.change,
          status: 'new',
        });
      });
    });

    return Array.from(accountMap.values());
  }, [dashboardData]);

  // Calculate analytics for a single route
  const getRouteAnalytics = useCallback((routeId: string): RouteAnalytics | null => {
    const route = routes.find(r => r.id === routeId);
    if (!route || !dashboardData?.city_insights?.cities) return null;

    // Get city data for cities in this route
    const routeCities = dashboardData.city_insights.cities.filter(
      city => route.cities.includes(city.city)
    );

    // Get all account numbers that are already counted via city assignments
    const cityAccountNumbers = new Set<number>();
    routeCities.forEach(city => {
      city.growing_accounts?.forEach(acc => cityAccountNumbers.add(acc.account_number));
      city.declining_accounts?.forEach(acc => cityAccountNumbers.add(acc.account_number));
      city.lost_accounts?.forEach(acc => cityAccountNumbers.add(acc.account_number));
      city.new_accounts?.forEach(acc => cityAccountNumbers.add(acc.account_number));
    });

    // Get individually assigned accounts that are NOT already counted via cities
    const allAccounts = getAllAccountsFromCityInsights();
    const individualAccounts = (route.accounts || [])
      .filter(accNum => !cityAccountNumbers.has(accNum))
      .map(accNum => allAccounts.find(a => a.account_number === accNum))
      .filter((acc): acc is NonNullable<typeof acc> => acc !== undefined);

    // Calculate metrics from cities
    let totalAccounts = routeCities.reduce((sum, c) => sum + c.total_accounts, 0);
    let totalUnitsCY = routeCities.reduce((sum, c) => sum + c.total_units_cy, 0);
    let totalUnitsPY = routeCities.reduce((sum, c) => sum + c.total_units_py, 0);
    let growingCount = routeCities.reduce((sum, c) => sum + c.growing_count, 0);
    let decliningCount = routeCities.reduce((sum, c) => sum + c.declining_count, 0);
    let lostCount = routeCities.reduce((sum, c) => sum + c.lost_count, 0);
    let newCount = routeCities.reduce((sum, c) => sum + c.new_count, 0);

    // Add metrics from individually assigned accounts
    totalAccounts += individualAccounts.length;
    individualAccounts.forEach(acc => {
      totalUnitsCY += acc.current_year_units;
      totalUnitsPY += acc.previous_year_units;

      switch (acc.status) {
        case 'growing':
          growingCount++;
          break;
        case 'declining':
          decliningCount++;
          break;
        case 'lost':
          lostCount++;
          break;
        case 'new':
          newCount++;
          break;
      }
    });

    const unitsChange = totalUnitsCY - totalUnitsPY;
    const unitsChangePct = totalUnitsPY > 0
      ? ((totalUnitsCY / totalUnitsPY) - 1) * 100
      : 0;

    // Aggregate color groups from cities
    const colorGroupMap = new Map<string, number>();
    routeCities.forEach(city => {
      city.color_groups_cy.forEach(cg => {
        colorGroupMap.set(cg.color_group, (colorGroupMap.get(cg.color_group) || 0) + cg.units);
      });
    });

    // Note: Individual accounts don't have color group info in city_insights,
    // so we can't add their color groups here without additional data source

    const colorGroupBreakdown: CityColorGroup[] = Array.from(colorGroupMap.entries())
      .map(([color_group, units]) => ({ color_group, units }))
      .sort((a, b) => b.units - a.units);

    // Handle case where route has no cities but has individual accounts
    if (routeCities.length === 0 && individualAccounts.length === 0) {
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
  }, [routes, dashboardData, getAllAccountsFromCityInsights]);

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
    addAccountToRoute,
    removeAccountFromRoute,
    getAccountRoute,
    addPlaceToRoute,
    removePlaceFromRoute,
    getPlaceRoute,
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
    addAccountToRoute,
    removeAccountFromRoute,
    getAccountRoute,
    addPlaceToRoute,
    removePlaceFromRoute,
    getPlaceRoute,
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
