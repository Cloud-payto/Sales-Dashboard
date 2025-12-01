// Google Maps Configuration Types
import { Coordinates } from './territory';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds?: MapBounds;
}

export interface MapStyle {
  featureType: string;
  elementType: string;
  stylers: Array<{ [key: string]: any }>;
}

export interface MapOptions {
  center: Coordinates;
  zoom: number;
  styles?: MapStyle[];
  gestureHandling?: 'greedy' | 'cooperative' | 'none' | 'auto';
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  scaleControl?: boolean;
  rotateControl?: boolean;
  clickableIcons?: boolean;
  restriction?: {
    latLngBounds: MapBounds;
    strictBounds: boolean;
  };
}

export interface MapControlPosition {
  position: 'TOP_LEFT' | 'TOP_CENTER' | 'TOP_RIGHT' | 'LEFT_TOP' | 'LEFT_CENTER' | 'LEFT_BOTTOM' | 'RIGHT_TOP' | 'RIGHT_CENTER' | 'RIGHT_BOTTOM' | 'BOTTOM_LEFT' | 'BOTTOM_CENTER' | 'BOTTOM_RIGHT';
}

export interface InfoWindowOptions {
  position: Coordinates;
  content: string | HTMLElement;
  maxWidth?: number;
  disableAutoPan?: boolean;
  pixelOffset?: { width: number; height: number };
}

export interface DirectionsRequest {
  origin: Coordinates;
  destination: Coordinates;
  waypoints?: Array<{
    location: Coordinates;
    stopover: boolean;
  }>;
  optimizeWaypoints?: boolean;
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
}

export interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: { value: number; text: string };
      duration: { value: number; text: string };
      start_address: string;
      end_address: string;
      steps: Array<any>;
    }>;
    overview_polyline: { points: string };
    waypoint_order: number[];
  }>;
}

export interface GeocodeRequest {
  address?: string;
  location?: Coordinates;
  placeId?: string;
}

export interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: Coordinates;
    location_type: 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE';
  };
  place_id: string;
  types: string[];
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface MapMarkerIcon {
  url: string;
  scaledSize?: { width: number; height: number };
  origin?: { x: number; y: number };
  anchor?: { x: number; y: number };
  labelOrigin?: { x: number; y: number };
}

export interface PolylineOptions {
  path: Coordinates[];
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  geodesic?: boolean;
  editable?: boolean;
  draggable?: boolean;
}
