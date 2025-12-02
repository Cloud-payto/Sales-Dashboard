// Type definitions for Google Maps JavaScript API
// This allows TypeScript to understand google.maps types

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      getZoom(): number;
      getCenter(): LatLng;
      getBounds(): LatLngBounds | undefined;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      styles?: MapTypeStyle[];
      gestureHandling?: string;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      scaleControl?: boolean;
      rotateControl?: boolean;
      clickableIcons?: boolean;
      restriction?: {
        latLngBounds: LatLngBoundsLiteral;
        strictBounds: boolean;
      };
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers: any[];
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      contains(latLng: LatLng | LatLngLiteral): boolean;
      getCenter(): LatLng;
    }

    interface LatLngBoundsLiteral {
      north: number;
      south: number;
      east: number;
      west: number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng | LatLngLiteral): void;
      setIcon(icon: string | Icon | Symbol): void;
      setTitle(title: string): void;
      getPosition(): LatLng | undefined;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      icon?: string | Icon | Symbol;
      title?: string;
      label?: string | MarkerLabel;
      draggable?: boolean;
      animation?: Animation;
      optimized?: boolean;
    }

    interface Icon {
      url?: string;
      scaledSize?: Size;
      size?: Size;
      origin?: Point;
      anchor?: Point;
      labelOrigin?: Point;
    }

    interface Symbol {
      path: string | SymbolPath;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      scale?: number;
      anchor?: Point;
      labelOrigin?: Point;
    }

    enum SymbolPath {
      CIRCLE = 0,
      FORWARD_CLOSED_ARROW = 1,
      FORWARD_OPEN_ARROW = 2,
      BACKWARD_CLOSED_ARROW = 3,
      BACKWARD_OPEN_ARROW = 4,
    }

    interface MarkerLabel {
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
    }

    enum Animation {
      BOUNCE = 1,
      DROP = 2,
    }

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
      width: number;
      height: number;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: Marker): void;
      close(): void;
      setContent(content: string | HTMLElement): void;
      setPosition(position: LatLng | LatLngLiteral): void;
    }

    interface InfoWindowOptions {
      content?: string | HTMLElement;
      position?: LatLng | LatLngLiteral;
      maxWidth?: number;
      disableAutoPan?: boolean;
      pixelOffset?: Size;
    }

    class Geocoder {
      constructor();
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[], status: GeocoderStatus) => void
      ): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
      placeId?: string;
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      region?: string;
    }

    interface GeocoderResult {
      address_components: GeocoderAddressComponent[];
      formatted_address: string;
      geometry: GeocoderGeometry;
      place_id: string;
      types: string[];
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    interface GeocoderGeometry {
      location: LatLng;
      location_type: GeocoderLocationType;
      viewport: LatLngBounds;
      bounds?: LatLngBounds;
    }

    enum GeocoderLocationType {
      ROOFTOP = 'ROOFTOP',
      RANGE_INTERPOLATED = 'RANGE_INTERPOLATED',
      GEOMETRIC_CENTER = 'GEOMETRIC_CENTER',
      APPROXIMATE = 'APPROXIMATE',
    }

    enum GeocoderStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
      ERROR = 'ERROR',
    }

    class DirectionsService {
      constructor();
      route(
        request: DirectionsRequest,
        callback: (result: DirectionsResult, status: DirectionsStatus) => void
      ): void;
    }

    interface DirectionsRequest {
      origin: string | LatLng | LatLngLiteral | Place;
      destination: string | LatLng | LatLngLiteral | Place;
      waypoints?: DirectionsWaypoint[];
      travelMode: TravelMode;
      optimizeWaypoints?: boolean;
      provideRouteAlternatives?: boolean;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
    }

    interface DirectionsWaypoint {
      location: string | LatLng | LatLngLiteral;
      stopover: boolean;
    }

    interface Place {
      placeId: string;
      location?: LatLng | LatLngLiteral;
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT',
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      legs: DirectionsLeg[];
      overview_polyline: { points: string };
      waypoint_order: number[];
      bounds: LatLngBounds;
      summary: string;
    }

    interface DirectionsLeg {
      start_address: string;
      end_address: string;
      start_location: LatLng;
      end_location: LatLng;
      distance?: { value: number; text: string };
      duration?: { value: number; text: string };
      steps: DirectionsStep[];
    }

    interface DirectionsStep {
      instructions: string;
      distance: { value: number; text: string };
      duration: { value: number; text: string };
      start_location: LatLng;
      end_location: LatLng;
      path: LatLng[];
      travel_mode: TravelMode;
    }

    enum DirectionsStatus {
      OK = 'OK',
      NOT_FOUND = 'NOT_FOUND',
      ZERO_RESULTS = 'ZERO_RESULTS',
      MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    }

    interface MapsEventListener {
      remove(): void;
    }

    // Polygon class for drawing shapes on the map
    class Polygon {
      constructor(opts?: PolygonOptions);
      setMap(map: Map | null): void;
      getPath(): any;
      getPaths(): any;
      setOptions(options: PolygonOptions): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface PolygonOptions {
      paths?: LatLngLiteral[] | LatLngLiteral[][] | LatLng[] | LatLng[][];
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
      clickable?: boolean;
      draggable?: boolean;
      editable?: boolean;
      geodesic?: boolean;
      visible?: boolean;
      zIndex?: number;
    }

    // Circle class for drawing circles on the map
    class Circle {
      constructor(opts?: CircleOptions);
      setMap(map: Map | null): void;
      setCenter(center: LatLng | LatLngLiteral): void;
      setRadius(radius: number): void;
      getCenter(): LatLng;
      getRadius(): number;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface CircleOptions {
      center?: LatLng | LatLngLiteral;
      radius?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
      clickable?: boolean;
      draggable?: boolean;
      editable?: boolean;
      visible?: boolean;
      zIndex?: number;
    }

    namespace event {
      function addListener(
        instance: any,
        eventName: string,
        handler: Function
      ): MapsEventListener;
      function clearInstanceListeners(instance: any): void;
      function removeListener(listener: MapsEventListener): void;
    }
  }
}

interface Window {
  google: typeof google;
}
