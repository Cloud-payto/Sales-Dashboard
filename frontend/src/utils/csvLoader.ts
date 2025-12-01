// CSV Loader Utility for Places Data
import { Place, PlaceStatus } from '../types/territory';

// Parse CSV string into Place objects
export function parseCSV(csvContent: string): Place[] {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const header = parseCSVLine(lines[0]);
  const titleIdx = header.findIndex(h => h.toLowerCase() === 'title');
  const addressIdx = header.findIndex(h => h.toLowerCase() === 'address');
  const latIdx = header.findIndex(h => h.toLowerCase() === 'latitude');
  const lngIdx = header.findIndex(h => h.toLowerCase() === 'longitude');
  const urlIdx = header.findIndex(h => h.toLowerCase().includes('url'));

  const places: Place[] = [];
  const seenIds = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);

      const title = values[titleIdx] || '';
      const address = values[addressIdx] || '';
      const latitude = parseFloat(values[latIdx]);
      const longitude = parseFloat(values[lngIdx]);
      const originalUrl = values[urlIdx] || '';

      // Skip invalid coordinates
      if (isNaN(latitude) || isNaN(longitude)) {
        console.warn(`Skipping row ${i + 1}: Invalid coordinates`);
        continue;
      }

      // Generate unique ID
      let baseId = `place_${i}`;
      if (title) {
        baseId = title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50);
      }

      let id = baseId;
      let counter = 1;
      while (seenIds.has(id)) {
        id = `${baseId}_${counter}`;
        counter++;
      }
      seenIds.add(id);

      const place: Place = {
        id,
        title: title || address.split(',')[0] || `Location ${i}`,
        address,
        latitude,
        longitude,
        originalUrl: originalUrl !== 'URL' ? originalUrl : undefined,
        status: 'cold_call', // Default status - user can change this
      };

      places.push(place);
    } catch (error) {
      console.warn(`Error parsing row ${i + 1}:`, error);
    }
  }

  return places;
}

// Parse a single CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

// Load places from CSV file
export async function loadPlacesFromCSV(filePath: string): Promise<Place[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }
    const csvContent = await response.text();
    return parseCSV(csvContent);
  } catch (error) {
    console.error('Error loading places from CSV:', error);
    throw error;
  }
}

// Get cached places from localStorage
export function getCachedPlaces(): Place[] | null {
  try {
    const cached = localStorage.getItem('places_data');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading cached places:', error);
  }
  return null;
}

// Cache places to localStorage
export function cachePlaces(places: Place[]): void {
  try {
    localStorage.setItem('places_data', JSON.stringify(places));
  } catch (error) {
    console.error('Error caching places:', error);
  }
}

// Update a single place's status
export function updatePlaceStatus(places: Place[], placeId: string, status: PlaceStatus): Place[] {
  const updated = places.map(p =>
    p.id === placeId ? { ...p, status } : p
  );
  cachePlaces(updated);
  return updated;
}

// Update a place's notes
export function updatePlaceNotes(places: Place[], placeId: string, notes: string): Place[] {
  const updated = places.map(p =>
    p.id === placeId ? { ...p, notes } : p
  );
  cachePlaces(updated);
  return updated;
}

// Filter places by status
export function filterPlacesByStatus(places: Place[], statuses: PlaceStatus[]): Place[] {
  if (statuses.length === 0) return places;
  return places.filter(p => statuses.includes(p.status));
}

// Search places by title or address
export function searchPlaces(places: Place[], query: string): Place[] {
  const lowerQuery = query.toLowerCase();
  return places.filter(p =>
    p.title.toLowerCase().includes(lowerQuery) ||
    p.address.toLowerCase().includes(lowerQuery)
  );
}
