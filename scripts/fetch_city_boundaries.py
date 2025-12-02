"""
City Boundaries Pre-Fetch Script
Fetches city boundary polygons from OpenStreetMap Nominatim API
and saves them to a static JSON file for use in the frontend.

Usage:
    python scripts/fetch_city_boundaries.py

This script will:
1. Extract unique cities from your Excel data files
2. Fetch boundaries from Nominatim for Arizona and Nevada cities
3. Save to frontend/src/data/cityBoundaries.json
"""

import json
import time
import urllib.request
import urllib.parse
import os
import sys
from typing import Dict, List, Optional, Set
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd


def extract_cities_from_excel(file_path: str) -> Set[str]:
    """Extract unique cities from an Excel file"""
    try:
        df = pd.read_excel(file_path, sheet_name=0, skiprows=24)
        df.columns = df.columns.str.strip()

        if 'City' not in df.columns:
            print(f"  [WARN] No 'City' column found in {file_path}")
            return set()

        cities = df['City'].dropna().astype(str).str.strip()
        cities = cities[cities != '']
        cities = cities[cities.str.lower() != 'nan']

        return set(cities.unique())
    except Exception as e:
        print(f"  [ERROR] Failed to read {file_path}: {e}")
        return set()


def get_all_cities_from_data() -> Set[str]:
    """Extract all unique cities from data files"""
    data_dir = Path(__file__).parent.parent / 'data' / 'input'
    all_cities = set()

    print("[INFO] Scanning data files for cities...")

    for xlsx_file in data_dir.glob('*.xlsx'):
        print(f"  Processing: {xlsx_file.name}")
        cities = extract_cities_from_excel(str(xlsx_file))
        all_cities.update(cities)
        print(f"    Found {len(cities)} unique cities")

    print(f"\n[OK] Total unique cities found: {len(all_cities)}")
    return all_cities


def fetch_city_boundary(city_name: str, state: str = 'Arizona') -> Optional[Dict]:
    """Fetch city boundary from Nominatim API"""
    query = f"{city_name}, {state}, USA"
    encoded_query = urllib.parse.quote(query)
    url = f"https://nominatim.openstreetmap.org/search?q={encoded_query}&format=json&polygon_geojson=1&limit=1"

    headers = {
        'User-Agent': 'SalesDashboard/1.0 (contact@example.com)'
    }

    try:
        request = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))

        if not data or 'geojson' not in data[0]:
            return None

        result = data[0]
        geojson = result['geojson']

        # Convert GeoJSON to our format
        polygon = None
        if geojson['type'] == 'Polygon':
            # Convert [lng, lat] to {lat, lng}
            polygon = [
                {'lat': coord[1], 'lng': coord[0]}
                for coord in geojson['coordinates'][0]
            ]
        elif geojson['type'] == 'MultiPolygon':
            # Multiple polygons
            polygon = [
                [{'lat': coord[1], 'lng': coord[0]} for coord in poly[0]]
                for poly in geojson['coordinates']
            ]
        else:
            return None

        # Parse bounding box
        south, north, west, east = map(float, result['boundingbox'])

        return {
            'city': city_name,
            'state': state,
            'polygon': polygon,
            'bounds': {
                'north': north,
                'south': south,
                'east': east,
                'west': west
            },
            'center': {
                'lat': float(result['lat']),
                'lng': float(result['lon'])
            }
        }

    except Exception as e:
        print(f"    [ERROR] Failed to fetch {city_name}: {e}")
        return None


def fetch_all_boundaries(cities: Set[str], states: List[str] = None) -> Dict[str, Dict]:
    """
    Fetch boundaries for all cities across specified states

    Args:
        cities: Set of city names
        states: List of states to try (tries each state for each city)

    Returns:
        Dictionary mapping "city, state" to boundary data
    """
    if states is None:
        states = ['Arizona', 'Nevada']

    boundaries = {}
    total = len(cities) * len(states)
    processed = 0

    print(f"\n[INFO] Fetching boundaries for {len(cities)} cities across {len(states)} states...")
    print(f"       (Nominatim rate limit: 1 request/second)\n")

    for city in sorted(cities):
        for state in states:
            processed += 1
            cache_key = f"{city}, {state}".lower()

            # Skip if already have this city
            if cache_key in boundaries:
                continue

            print(f"  [{processed}/{total}] Fetching {city}, {state}...", end=' ', flush=True)

            boundary = fetch_city_boundary(city, state)

            if boundary:
                boundaries[cache_key] = boundary
                print("OK")
            else:
                print("Not found")

            # Rate limiting - Nominatim requires 1 second between requests
            time.sleep(1.1)

    return boundaries


def save_boundaries(boundaries: Dict[str, Dict], output_path: str):
    """Save boundaries to JSON file"""
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(boundaries, f, indent=2)

    print(f"\n[OK] Saved {len(boundaries)} boundaries to {output_path}")


def main():
    print("=" * 60)
    print("City Boundaries Pre-Fetch Script")
    print("=" * 60 + "\n")

    # Step 1: Extract cities from data files
    cities = get_all_cities_from_data()

    if not cities:
        print("[ERROR] No cities found in data files!")
        return

    print("\nCities found:")
    for city in sorted(cities):
        print(f"  - {city}")

    # Step 2: Fetch boundaries
    boundaries = fetch_all_boundaries(cities, states=['Arizona', 'Nevada'])

    # Step 3: Save to JSON
    output_path = Path(__file__).parent.parent / 'frontend' / 'src' / 'data' / 'cityBoundaries.json'
    save_boundaries(boundaries, str(output_path))

    # Summary
    found_count = len(boundaries)
    total_attempts = len(cities) * 2  # 2 states

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Cities in data files: {len(cities)}")
    print(f"Boundaries found: {found_count}")
    print(f"Output file: {output_path}")
    print("\nNow update the frontend to use this static file instead of API calls.")


if __name__ == '__main__':
    main()
