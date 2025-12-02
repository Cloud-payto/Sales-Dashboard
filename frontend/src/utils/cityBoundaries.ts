/**
 * City Boundaries Utility
 * Fetches city boundary polygons from OpenStreetMap Nominatim API
 */

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

// Cache for city boundaries to avoid repeated API calls
const boundaryCache = new Map<string, CityBoundary>();
const CACHE_KEY = 'city_boundaries_cache';

// Load cache from localStorage
function loadCache(): void {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.entries(parsed).forEach(([key, value]) => {
        boundaryCache.set(key, value as CityBoundary);
      });
    }
  } catch (e) {
    console.warn('Failed to load city boundary cache:', e);
  }
}

// Save cache to localStorage
function saveCache(): void {
  try {
    const obj: Record<string, CityBoundary> = {};
    boundaryCache.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('Failed to save city boundary cache:', e);
  }
}

// Initialize cache on load
loadCache();

/**
 * Convert GeoJSON coordinates to Google Maps LatLngLiteral format
 */
function geoJsonToLatLng(coordinates: number[][]): google.maps.LatLngLiteral[] {
  return coordinates.map(([lng, lat]) => ({ lat, lng }));
}

/**
 * Fetch city boundary from Nominatim API
 */
export async function fetchCityBoundary(
  cityName: string,
  state: string = 'Arizona'
): Promise<CityBoundary | null> {
  const cacheKey = `${cityName}, ${state}`.toLowerCase();

  // Check cache first
  if (boundaryCache.has(cacheKey)) {
    return boundaryCache.get(cacheKey)!;
  }

  try {
    // Use Nominatim API with polygon_geojson to get boundary
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
      // Simple polygon - take the outer ring
      polygon = geoJsonToLatLng(geojson.coordinates[0] as number[][]);
    } else if (geojson.type === 'MultiPolygon') {
      // MultiPolygon - convert all polygons
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

    // Cache the result
    boundaryCache.set(cacheKey, boundary);
    saveCache();

    return boundary;
  } catch (error) {
    console.error(`Error fetching boundary for ${cityName}:`, error);
    return null;
  }
}

/**
 * Fetch boundaries for multiple cities with rate limiting
 * Nominatim has a 1 request per second limit
 */
export async function fetchCityBoundaries(
  cities: string[],
  state: string = 'Arizona',
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, CityBoundary>> {
  const results = new Map<string, CityBoundary>();

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];

    // Check if already cached
    const cacheKey = `${city}, ${state}`.toLowerCase();
    if (boundaryCache.has(cacheKey)) {
      results.set(city, boundaryCache.get(cacheKey)!);
      onProgress?.(i + 1, cities.length);
      continue;
    }

    // Fetch with rate limiting (1 second delay between requests)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    const boundary = await fetchCityBoundary(city, state);
    if (boundary) {
      results.set(city, boundary);
    }

    onProgress?.(i + 1, cities.length);
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
 * Clear the boundary cache
 */
export function clearBoundaryCache(): void {
  boundaryCache.clear();
  localStorage.removeItem(CACHE_KEY);
}
