// Territory Definitions for Phoenix Metro Area
import { Territory } from '../types/territory';

export const PHOENIX_METRO_CENTER = {
  latitude: 33.4484,
  longitude: -112.0740,
};

export const TERRITORIES: Territory[] = [
  {
    id: 'north_phoenix',
    name: 'North Phoenix',
    description: 'North of Loop 101, includes Anthem and Desert Ridge',
    color: '#3b82f6', // Blue
    bounds: {
      north: 33.8,
      south: 33.6,
      east: -111.9,
      west: -112.2,
    },
    zones: ['anthem', 'desert_ridge', 'cave_creek', 'carefree'],
  },
  {
    id: 'scottsdale',
    name: 'Scottsdale',
    description: 'Scottsdale city limits',
    color: '#10b981', // Green
    bounds: {
      north: 33.8,
      south: 33.4,
      east: -111.8,
      west: -111.9,
    },
    zones: ['old_town', 'north_scottsdale', 'south_scottsdale', 'mccormick_ranch'],
  },
  {
    id: 'tempe',
    name: 'Tempe',
    description: 'Tempe and ASU area',
    color: '#f59e0b', // Amber
    bounds: {
      north: 33.45,
      south: 33.35,
      east: -111.85,
      west: -111.95,
    },
    zones: ['asu', 'downtown_tempe', 'south_tempe'],
  },
  {
    id: 'mesa',
    name: 'Mesa',
    description: 'Mesa and east valley',
    color: '#ef4444', // Red
    bounds: {
      north: 33.5,
      south: 33.3,
      east: -111.6,
      west: -111.85,
    },
    zones: ['downtown_mesa', 'east_mesa', 'red_mountain'],
  },
  {
    id: 'chandler',
    name: 'Chandler',
    description: 'Chandler area',
    color: '#8b5cf6', // Purple
    bounds: {
      north: 33.35,
      south: 33.2,
      east: -111.7,
      west: -111.95,
    },
    zones: ['downtown_chandler', 'ocotillo', 'sun_lakes'],
  },
  {
    id: 'gilbert',
    name: 'Gilbert',
    description: 'Gilbert area',
    color: '#ec4899', // Pink
    bounds: {
      north: 33.4,
      south: 33.25,
      east: -111.6,
      west: -111.75,
    },
    zones: ['downtown_gilbert', 'san_tan', 'higley'],
  },
  {
    id: 'glendale',
    name: 'Glendale',
    description: 'Glendale and west valley',
    color: '#06b6d4', // Cyan
    bounds: {
      north: 33.6,
      south: 33.4,
      east: -112.1,
      west: -112.3,
    },
    zones: ['downtown_glendale', 'arrowhead', 'westgate'],
  },
  {
    id: 'peoria',
    name: 'Peoria',
    description: 'Peoria area',
    color: '#84cc16', // Lime
    bounds: {
      north: 33.7,
      south: 33.5,
      east: -112.1,
      west: -112.3,
    },
    zones: ['old_peoria', 'vistancia', 'arrowhead_ranch'],
  },
];

// Status Color Mapping
export const STATUS_COLORS = {
  active: '#10b981', // Green
  cold_call: '#3b82f6', // Blue
  lost: '#ef4444', // Red
  new: '#8b5cf6', // Purple
  reactivated: '#f59e0b', // Amber
} as const;

// Map Zoom Levels
export const MAP_ZOOM_LEVELS = {
  METRO: 11, // View entire Phoenix metro
  TERRITORY: 13, // View single territory
  CLUSTER: 14, // View cluster of accounts
  ACCOUNT: 16, // View individual account
  STREET: 18, // Street-level view
} as const;

// Phoenix Metro Area Bounds (for map restriction)
export const PHOENIX_METRO_BOUNDS = {
  north: 33.9,
  south: 33.0,
  east: -111.5,
  west: -112.5,
};
