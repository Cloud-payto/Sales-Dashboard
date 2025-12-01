import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Territory,
  Place,
  PlaceMarker,
  PlaceStatus,
  PlaceRouteWaypoint,
  Route,
} from '../types/territory';
import { TERRITORIES } from '../constants/territories';
import { parseCSV, getCachedPlaces, cachePlaces } from '../utils/csvLoader';

// Place status colors
const PLACE_STATUS_COLORS: Record<PlaceStatus, string> = {
  active: '#10b981',      // Green
  cold_call: '#3b82f6',   // Blue
  prospect: '#f59e0b',    // Amber
  inactive: '#6b7280',    // Gray
};

interface PlaceTerritoryContextType {
  // Territories
  territories: Territory[];
  selectedTerritory: Territory | null;
  setSelectedTerritory: (territory: Territory | null) => void;

  // Places from CSV
  places: Place[];
  isLoading: boolean;
  loadError: string | null;
  loadPlacesFromFile: (file: File) => Promise<void>;
  reloadPlaces: () => Promise<void>;

  // Place management
  updatePlaceStatus: (placeId: string, status: PlaceStatus) => void;
  updatePlaceNotes: (placeId: string, notes: string) => void;

  // Map State
  selectedMarkers: PlaceMarker[];
  hoveredMarker: PlaceMarker | null;
  toggleMarkerSelection: (marker: PlaceMarker) => void;
  setHoveredMarker: (marker: PlaceMarker | null) => void;
  clearSelection: () => void;

  // Routes
  routes: Route[];
  currentRoute: Route | null;
  setCurrentRoute: (route: Route | null) => void;
  createRouteFromPlaces: (name: string) => void;
  optimizeRoute: (routeId: string) => Promise<Route>;
  deleteRoute: (routeId: string) => void;

  // Filtering
  visibleMarkers: PlaceMarker[];
  statusFilter: PlaceStatus[];
  setStatusFilter: (statuses: PlaceStatus[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  territoryFilter: string | null;
  setTerritoryFilter: (territoryId: string | null) => void;
}

const TerritoryContext = createContext<PlaceTerritoryContextType | undefined>(undefined);

const ROUTES_STORAGE_KEY = 'sales_dashboard_routes';
const PLACES_STORAGE_KEY = 'places_data';

interface TerritoryProviderProps {
  children: ReactNode;
}

export const TerritoryProvider: React.FC<TerritoryProviderProps> = ({ children }) => {
  const [territories] = useState<Territory[]>(TERRITORIES);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

  // Places state
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Map state
  const [selectedMarkers, setSelectedMarkers] = useState<PlaceMarker[]>([]);
  const [hoveredMarker, setHoveredMarker] = useState<PlaceMarker | null>(null);
  const [visibleMarkers, setVisibleMarkers] = useState<PlaceMarker[]>([]);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<PlaceStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState<string | null>(null);

  // Routes state
  const [routes, setRoutes] = useState<Route[]>(() => {
    const stored = localStorage.getItem(ROUTES_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);

  // Load places from CSV on mount
  const loadPlaces = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // First check localStorage for cached places with status updates
      const cached = getCachedPlaces();
      if (cached && cached.length > 0) {
        setPlaces(cached);
        setIsLoading(false);
        return;
      }

      // Try to load from the CSV file
      const response = await fetch('/data/output/places_with_coordinates.csv');
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.statusText}`);
      }

      const csvContent = await response.text();
      const parsedPlaces = parseCSV(csvContent);

      if (parsedPlaces.length === 0) {
        throw new Error('No places found in CSV file');
      }

      setPlaces(parsedPlaces);
      cachePlaces(parsedPlaces);
    } catch (error) {
      console.error('Error loading places:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load places');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load places from a user-selected file
  const loadPlacesFromFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const csvContent = await file.text();
      const parsedPlaces = parseCSV(csvContent);

      if (parsedPlaces.length === 0) {
        throw new Error('No places found in CSV file');
      }

      setPlaces(parsedPlaces);
      cachePlaces(parsedPlaces);
    } catch (error) {
      console.error('Error loading places from file:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load places');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload places from CSV (clear cache first)
  const reloadPlaces = useCallback(async () => {
    localStorage.removeItem(PLACES_STORAGE_KEY);
    await loadPlaces();
  }, [loadPlaces]);

  // Update a place's status
  const updatePlaceStatus = useCallback((placeId: string, status: PlaceStatus) => {
    setPlaces(prev => {
      const updated = prev.map(p =>
        p.id === placeId ? { ...p, status } : p
      );
      cachePlaces(updated);
      return updated;
    });
  }, []);

  // Update a place's notes
  const updatePlaceNotes = useCallback((placeId: string, notes: string) => {
    setPlaces(prev => {
      const updated = prev.map(p =>
        p.id === placeId ? { ...p, notes } : p
      );
      cachePlaces(updated);
      return updated;
    });
  }, []);

  // Toggle marker selection
  const toggleMarkerSelection = useCallback((marker: PlaceMarker) => {
    setSelectedMarkers(prev => {
      const exists = prev.find(m => m.id === marker.id);
      if (exists) {
        return prev.filter(m => m.id !== marker.id);
      } else {
        return [...prev, { ...marker, isSelected: true }];
      }
    });
  }, []);

  // Clear all selected markers
  const clearSelection = useCallback(() => {
    setSelectedMarkers([]);
  }, []);

  // Create a route from selected markers
  const createRouteFromPlaces = useCallback((name: string) => {
    if (selectedMarkers.length < 2) return;

    const waypoints: PlaceRouteWaypoint[] = selectedMarkers.map((marker, index) => ({
      id: marker.id,
      position: marker.position,
      place: marker.place,
      order: index,
    }));

    const newRoute: Route = {
      id: Date.now().toString(),
      name,
      waypoints: waypoints as any, // Type compatibility
      totalDistance: 0,
      estimatedTime: 0,
      createdAt: new Date().toISOString(),
      optimized: false,
    };

    setRoutes(prev => {
      const updated = [...prev, newRoute];
      localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setCurrentRoute(newRoute);
    clearSelection();
  }, [selectedMarkers, clearSelection]);

  // Optimize route using Google Directions API
  const optimizeRoute = useCallback(async (routeId: string): Promise<Route> => {
    const route = routes.find(r => r.id === routeId);
    if (!route || route.waypoints.length < 2) {
      throw new Error('Invalid route or insufficient waypoints');
    }

    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API not loaded');
    }

    const directionsService = new google.maps.DirectionsService();

    const origin = route.waypoints[0].position;
    const destination = route.waypoints[route.waypoints.length - 1].position;
    const waypoints = route.waypoints.slice(1, -1).map(wp => ({
      location: new google.maps.LatLng(wp.position.latitude, wp.position.longitude),
      stopover: true,
    }));

    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.latitude, origin.longitude),
          destination: new google.maps.LatLng(destination.latitude, destination.longitude),
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            const optimizedRoute = result.routes[0];
            let totalDistance = 0;
            let totalTime = 0;

            optimizedRoute.legs.forEach(leg => {
              totalDistance += leg.distance?.value || 0;
              totalTime += leg.duration?.value || 0;
            });

            const updatedRoute: Route = {
              ...route,
              totalDistance: totalDistance / 1609.34, // Convert meters to miles
              estimatedTime: totalTime / 60, // Convert seconds to minutes
              optimized: true,
            };

            setRoutes(prev => {
              const updated = prev.map(r => (r.id === routeId ? updatedRoute : r));
              localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(updated));
              return updated;
            });

            resolve(updatedRoute);
          } else {
            reject(new Error(`Route optimization failed: ${status}`));
          }
        }
      );
    });
  }, [routes]);

  // Delete a route
  const deleteRoute = useCallback((routeId: string) => {
    setRoutes(prev => {
      const updated = prev.filter(r => r.id !== routeId);
      localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (currentRoute?.id === routeId) {
      setCurrentRoute(null);
    }
  }, [currentRoute]);

  // Update visible markers based on filters
  useEffect(() => {
    let filtered = places;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter.length > 0) {
      filtered = filtered.filter(p => statusFilter.includes(p.status));
    }

    // Filter by territory bounds
    if (territoryFilter) {
      const territory = territories.find(t => t.id === territoryFilter);
      if (territory) {
        filtered = filtered.filter(p => {
          return (
            p.latitude <= territory.bounds.north &&
            p.latitude >= territory.bounds.south &&
            p.longitude <= territory.bounds.east &&
            p.longitude >= territory.bounds.west
          );
        });
      }
    }

    // Convert to markers
    const markers: PlaceMarker[] = filtered.map(place => ({
      id: place.id,
      position: {
        latitude: place.latitude,
        longitude: place.longitude,
      },
      place,
      color: PLACE_STATUS_COLORS[place.status],
      isSelected: selectedMarkers.some(m => m.id === place.id),
    }));

    setVisibleMarkers(markers);
  }, [places, searchQuery, statusFilter, territoryFilter, territories, selectedMarkers]);

  // Load places on mount
  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const contextValue: PlaceTerritoryContextType = {
    territories,
    selectedTerritory,
    setSelectedTerritory,
    places,
    isLoading,
    loadError,
    loadPlacesFromFile,
    reloadPlaces,
    updatePlaceStatus,
    updatePlaceNotes,
    selectedMarkers,
    hoveredMarker,
    toggleMarkerSelection,
    setHoveredMarker,
    clearSelection,
    routes,
    currentRoute,
    setCurrentRoute,
    createRouteFromPlaces,
    optimizeRoute,
    deleteRoute,
    visibleMarkers,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    territoryFilter,
    setTerritoryFilter,
  };

  return (
    <TerritoryContext.Provider value={contextValue}>
      {children}
    </TerritoryContext.Provider>
  );
};

export const useTerritory = (): PlaceTerritoryContextType => {
  const context = useContext(TerritoryContext);
  if (!context) {
    throw new Error('useTerritory must be used within a TerritoryProvider');
  }
  return context;
};
