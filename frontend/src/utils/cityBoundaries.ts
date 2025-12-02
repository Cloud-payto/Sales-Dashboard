/**
 * City Boundaries Utility
 *
 * Uses pre-fetched city boundary data from a static JSON file.
 * Falls back to Nominatim API if a city isn't in the pre-fetched data.
 *
 * To update the static data, run: node scripts/fetch_boundaries.js
 */

// Import pre-fetched boundaries (will be empty object if file doesn't exist yet)
import staticBoundaries from '../data/cityBoundaries.json';

export interface CityBoundary {
  city: string;
  state: string;
  polygon: google.maps.LatLngLiteral[] | google.maps.LatLngLiteral[][];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    lat: number;
    lng: number;
  };
}

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  geojson?: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

// Runtime cache for any API-fetched boundaries (supplements static data)
const runtimeCache = new Map<string, CityBoundary>();

// Type the static boundaries
const preloadedBoundaries = staticBoundaries as Record<string, CityBoundary>;

/**
 * Convert GeoJSON coordinates to Google Maps LatLngLiteral format
 */
function geoJsonToLatLng(coordinates: number[][]): google.maps.LatLngLiteral[] {
  return coordinates.map(([lng, lat]) => ({ lat, lng }));
}

/**
 * Get city boundary - checks static data first, then runtime cache, then falls back to API
 */
export async function fetchCityBoundary(
  cityName: string,
  state: string = 'Arizona'
): Promise<CityBoundary | null> {
  const cacheKey = `${cityName}, ${state}`.toLowerCase();

  // 1. Check pre-loaded static boundaries first (instant, no API call)
  if (preloadedBoundaries[cacheKey]) {
    return preloadedBoundaries[cacheKey];
  }

  // 2. Check runtime cache
  if (runtimeCache.has(cacheKey)) {
    return runtimeCache.get(cacheKey)!;
  }

  // 3. Fallback to API for cities not in static data
  console.log(`[CityBoundaries] Fetching ${cityName}, ${state} from API (not in static data)`);

  try {
    const query = encodeURIComponent(`${cityName}, ${state}, USA`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&polygon_geojson=1&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SalesDashboard/1.0 (contact@example.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results: NominatimResult[] = await response.json();

    if (results.length === 0 || !results[0].geojson) {
      console.warn(`No boundary found for ${cityName}, ${state}`);
      return null;
    }

    const result = results[0];
    const geojson = result.geojson!;

    let polygon: google.maps.LatLngLiteral[] | google.maps.LatLngLiteral[][];

    if (geojson.type === 'Polygon') {
      polygon = geoJsonToLatLng(geojson.coordinates[0] as number[][]);
    } else if (geojson.type === 'MultiPolygon') {
      polygon = (geojson.coordinates as number[][][][]).map((poly: number[][][]) =>
        geoJsonToLatLng(poly[0])
      );
    } else {
      console.warn(`Unsupported geometry type: ${geojson.type}`);
      return null;
    }

    const [south, north, west, east] = result.boundingbox.map(Number);

    const boundary: CityBoundary = {
      city: cityName,
      state,
      polygon,
      bounds: { north, south, east, west },
      center: {
        lat: Number(result.lat),
        lng: Number(result.lon),
      },
    };

    // Cache in runtime (not localStorage - static file is the source of truth)
    runtimeCache.set(cacheKey, boundary);

    return boundary;
  } catch (error) {
    console.error(`Error fetching boundary for ${cityName}:`, error);
    return null;
  }
}

/**
 * Fetch boundaries for multiple cities
 * Uses static data when available, only calls API for missing cities
 */
export async function fetchCityBoundaries(
  cities: string[],
  state: string = 'Arizona',
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, CityBoundary>> {
  const results = new Map<string, CityBoundary>();
  const citiesToFetch: string[] = [];

  // First pass: get all cities from static data (instant)
  for (const city of cities) {
    const cacheKey = `${city}, ${state}`.toLowerCase();

    if (preloadedBoundaries[cacheKey]) {
      results.set(city, preloadedBoundaries[cacheKey]);
    } else if (runtimeCache.has(cacheKey)) {
      results.set(city, runtimeCache.get(cacheKey)!);
    } else {
      citiesToFetch.push(city);
    }
  }

  // Report progress for static lookups
  const staticCount = cities.length - citiesToFetch.length;
  if (staticCount > 0) {
    onProgress?.(staticCount, cities.length);
  }

  // Second pass: fetch remaining from API with rate limiting
  for (let i = 0; i < citiesToFetch.length; i++) {
    const city = citiesToFetch[i];

    // Rate limiting for API calls
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    const boundary = await fetchCityBoundary(city, state);
    if (boundary) {
      results.set(city, boundary);
    }

    onProgress?.(staticCount + i + 1, cities.length);
  }

  return results;
}

/**
 * Get color for city based on performance
 */
export function getCityPerformanceColor(
  _unitsChange: number,
  unitsChangePct: number
): string {
  if (unitsChangePct >= 20) return '#22c55e'; // Strong growth - green
  if (unitsChangePct >= 5) return '#86efac';  // Moderate growth - light green
  if (unitsChangePct >= -5) return '#fbbf24'; // Stable - amber
  if (unitsChangePct >= -20) return '#f87171'; // Moderate decline - light red
  return '#ef4444'; // Strong decline - red
}

/**
 * Get opacity for city based on total units (market presence)
 */
export function getCityOpacity(totalUnits: number, maxUnits: number): number {
  const ratio = totalUnits / maxUnits;
  return Math.max(0.3, Math.min(0.7, ratio * 0.7 + 0.2));
}

/**
 * Check how many cities are in the static data
 */
export function getStaticBoundaryCount(): number {
  return Object.keys(preloadedBoundaries).length;
}

/**
 * Get list of cities in static data
 */
export function getStaticCities(): string[] {
  return Object.keys(preloadedBoundaries);
}
