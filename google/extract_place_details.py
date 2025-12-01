"""
Extract place details from Google Maps saved places CSV.
Uses Geocoding API with place names from URLs to get coordinates.
"""

import csv
import re
import requests
import time
from urllib.parse import unquote

# Configuration
INPUT_CSV = "../data/output/modern_optical_territory.csv"
OUTPUT_CSV = "../data/output/places_with_coordinates.csv"
API_KEY_FILE = "api-key.txt"

# Load API key from file
try:
    with open(API_KEY_FILE, 'r') as f:
        API_KEY = f.read().strip()
except FileNotFoundError:
    API_KEY = ""
    print(f"Warning: {API_KEY_FILE} not found. Please create it with your Google API key.")

def extract_place_name_from_url(url):
    """Extract the place name from a Google Maps URL."""
    if not url:
        return None
    # Pattern: /maps/place/Place+Name+Here/data=
    match = re.search(r'/place/([^/]+)/data=', url)
    if match:
        # URL decode and replace + with spaces
        name = unquote(match.group(1).replace('+', ' '))
        return name
    return None

def geocode_place(query):
    """Geocode a place using Google Geocoding API."""
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": query,
        "key": API_KEY
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if data.get("status") == "OK" and data.get("results"):
            result = data["results"][0]
            location = result.get("geometry", {}).get("location", {})
            return {
                "address": result.get("formatted_address", ""),
                "lat": location.get("lat", ""),
                "lng": location.get("lng", "")
            }
        else:
            print(f"  Geocoding failed: {data.get('status')}")
            return None
    except Exception as e:
        print(f"  Request error: {e}")
        return None

def find_place(query):
    """Use Find Place to get place details."""
    url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    params = {
        "input": query,
        "inputtype": "textquery",
        "fields": "formatted_address,geometry,place_id",
        "key": API_KEY
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if data.get("status") == "OK" and data.get("candidates"):
            result = data["candidates"][0]
            location = result.get("geometry", {}).get("location", {})
            return {
                "address": result.get("formatted_address", ""),
                "lat": location.get("lat", ""),
                "lng": location.get("lng", "")
            }
        else:
            print(f"  Find Place failed: {data.get('status')}")
            return None
    except Exception as e:
        print(f"  Request error: {e}")
        return None

def main():
    results = []

    # Read input CSV (skip first line which is a title, not headers)
    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Skip the first line (title) and parse from header row
    from io import StringIO
    csv_content = ''.join(lines[2:])  # Skip title line and blank line
    reader = csv.DictReader(StringIO(csv_content), fieldnames=['Title', 'Note', 'URL', 'Tags', 'Comment'])
    rows = list(reader)

    # Filter to rows with URLs
    rows = [r for r in rows if r.get('URL') and r['URL'].strip()]

    print(f"Processing {len(rows)} places...")

    for i, row in enumerate(rows):
        title = row.get("Title", "").strip()
        url = row.get("URL", "").strip()

        # Get place name from URL if title is empty
        place_name = title if title else extract_place_name_from_url(url)

        if not place_name:
            print(f"[{i+1}/{len(rows)}] No place name found, skipping")
            continue

        print(f"[{i+1}/{len(rows)}] Looking up: {place_name}")

        # Try Find Place API first (more accurate for business names)
        details = find_place(place_name)

        if not details:
            # Fallback to geocoding
            print(f"  Trying geocoding fallback...")
            details = geocode_place(place_name)

        if details:
            results.append({
                "Title": title if title else place_name,
                "Address": details["address"],
                "Latitude": details["lat"],
                "Longitude": details["lng"],
                "Original_URL": url
            })
            print(f"  -> {details['address']}")
        else:
            results.append({
                "Title": title if title else place_name,
                "Address": "",
                "Latitude": "",
                "Longitude": "",
                "Original_URL": url
            })
            print(f"  -> NOT FOUND")

        # Rate limit
        time.sleep(0.1)

    # Write output CSV
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ["Title", "Address", "Latitude", "Longitude", "Original_URL"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    print(f"\nDone! Output written to {OUTPUT_CSV}")
    print(f"Successfully processed {len([r for r in results if r['Latitude']])} of {len(results)} places")

if __name__ == "__main__":
    main()
