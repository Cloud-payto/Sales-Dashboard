// Territory and Location Types for Map Feature
import { Account } from './index';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Place from CSV file (places_with_coordinates.csv)
export interface Place {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  originalUrl?: string;
  status: PlaceStatus;
  // Zone assignment
  zoneId?: string;  // ID of assigned zone (undefined = unassigned)
  // Optional fields for user customization
  notes?: string;
  lastVisit?: string;
  nextVisit?: string;
  category?: string;
}

// Zone definition for territory management
export interface Zone {
  id: string;
  name: string;
  color: string;
  territoryId?: string;  // Optional parent territory
  description?: string;
}

export type PlaceStatus = 'active' | 'cold_call' | 'prospect' | 'inactive';

export interface PlaceMarker {
  id: string;
  position: Coordinates;
  place: Place;
  color: string;
  label?: string;
  isSelected?: boolean;
}

export interface PlaceRouteWaypoint {
  id: string;
  position: Coordinates;
  place: Place;
  order: number;
  arrivalTime?: string;
  notes?: string;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  zip?: string;
  formatted?: string;
}

export interface Territory {
  id: string;
  name: string;
  description?: string;
  color: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zones: string[];
}

export type AccountStatus = 'active' | 'cold_call' | 'lost' | 'new' | 'reactivated';

export interface AccountLocation extends Account {
  location: Coordinates;
  address: Address;
  status: AccountStatus;
  lastVisit?: string;
  nextVisit?: string;
  territory?: string;
  zone?: string;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  account: AccountLocation;
  color: string;
  label?: string;
  isSelected?: boolean;
}

export interface RouteWaypoint {
  id: string;
  position: Coordinates;
  account: AccountLocation;
  order: number;
  arrivalTime?: string;
  notes?: string;
}

export interface Route {
  id: string;
  name: string;
  waypoints: RouteWaypoint[];
  totalDistance: number; // miles
  estimatedTime: number; // minutes
  createdAt: string;
  optimized: boolean;
  isActive?: boolean;
}

export interface GeocodingCache {
  [accountNumber: number]: {
    coordinates: Coordinates;
    timestamp: string;
    address: string;
  };
}

export interface TerritoryContextType {
  // Territories
  territories: Territory[];
  selectedTerritory: Territory | null;
  setSelectedTerritory: (territory: Territory | null) => void;

  // Account Locations
  accountLocations: AccountLocation[];
  isGeocoding: boolean;
  geocodingProgress: number;
  geocodingError: string | null;

  // Map State
  selectedMarkers: MapMarker[];
  hoveredMarker: MapMarker | null;
  toggleMarkerSelection: (marker: MapMarker) => void;
  setHoveredMarker: (marker: MapMarker | null) => void;
  clearSelection: () => void;

  // Routes
  routes: Route[];
  currentRoute: Route | null;
  setCurrentRoute: (route: Route | null) => void;
  createRoute: (name: string, waypoints: RouteWaypoint[]) => void;
  optimizeRoute: (routeId: string) => Promise<Route>;
  deleteRoute: (routeId: string) => void;
  updateWaypointOrder: (routeId: string, waypoints: RouteWaypoint[]) => void;

  // Geocoding
  geocodeAccount: (account: Account) => Promise<Coordinates>;
  geocodeAllAccounts: () => Promise<void>;
  cacheGeocodedLocations: (cache: GeocodingCache) => void;
  getGeocodingCache: () => GeocodingCache;

  // Filtering
  visibleMarkers: MapMarker[];
  updateVisibleMarkers: (filters: {
    zones?: string[];
    statuses?: AccountStatus[];
    bounds?: Territory['bounds'];
  }) => void;
}

export interface MarkerClusterConfig {
  gridSize: number;
  minimumClusterSize: number;
  maxZoom: number;
  averageCenter: boolean;
  styles: MarkerClusterStyle[];
}

export interface MarkerClusterStyle {
  url: string;
  height: number;
  width: number;
  textColor: string;
  textSize: number;
  backgroundPosition?: string;
}
