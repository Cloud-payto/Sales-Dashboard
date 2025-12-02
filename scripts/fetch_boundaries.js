/**
 * City Boundaries Pre-Fetch Script (Node.js)
 *
 * Fetches city boundary polygons from OpenStreetMap Nominatim API
 * and saves them to a static JSON file for use in the frontend.
 *
 * Usage:
 *   node scripts/fetch_boundaries.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Cities to fetch - add your territory cities here
const CITIES_TO_FETCH = [
  // Arizona cities
  { city: 'Phoenix', state: 'Arizona' },
  { city: 'Tucson', state: 'Arizona' },
  { city: 'Mesa', state: 'Arizona' },
  { city: 'Chandler', state: 'Arizona' },
  { city: 'Scottsdale', state: 'Arizona' },
  { city: 'Gilbert', state: 'Arizona' },
  { city: 'Glendale', state: 'Arizona' },
  { city: 'Tempe', state: 'Arizona' },
  { city: 'Peoria', state: 'Arizona' },
  { city: 'Surprise', state: 'Arizona' },
  { city: 'Yuma', state: 'Arizona' },
  { city: 'Avondale', state: 'Arizona' },
  { city: 'Goodyear', state: 'Arizona' },
  { city: 'Flagstaff', state: 'Arizona' },
  { city: 'Buckeye', state: 'Arizona' },
  { city: 'Lake Havasu City', state: 'Arizona' },
  { city: 'Casa Grande', state: 'Arizona' },
  { city: 'Sierra Vista', state: 'Arizona' },
  { city: 'Maricopa', state: 'Arizona' },
  { city: 'Oro Valley', state: 'Arizona' },
  { city: 'Prescott', state: 'Arizona' },
  { city: 'Prescott Valley', state: 'Arizona' },
  { city: 'Bullhead City', state: 'Arizona' },
  { city: 'Apache Junction', state: 'Arizona' },
  { city: 'Queen Creek', state: 'Arizona' },
  { city: 'Sun City', state: 'Arizona' },
  { city: 'Sun City West', state: 'Arizona' },
  { city: 'El Mirage', state: 'Arizona' },
  { city: 'Kingman', state: 'Arizona' },
  { city: 'San Tan Valley', state: 'Arizona' },
  { city: 'Fountain Hills', state: 'Arizona' },
  { city: 'Nogales', state: 'Arizona' },
  { city: 'Douglas', state: 'Arizona' },
  { city: 'Eloy', state: 'Arizona' },
  { city: 'Safford', state: 'Arizona' },
  { city: 'Cottonwood', state: 'Arizona' },
  { city: 'Camp Verde', state: 'Arizona' },
  { city: 'Sedona', state: 'Arizona' },
  { city: 'Show Low', state: 'Arizona' },
  { city: 'Payson', state: 'Arizona' },
  { city: 'Globe', state: 'Arizona' },
  { city: 'Winslow', state: 'Arizona' },
  { city: 'Coolidge', state: 'Arizona' },
  { city: 'Florence', state: 'Arizona' },
  { city: 'Somerton', state: 'Arizona' },
  { city: 'San Luis', state: 'Arizona' },
  { city: 'Sahuarita', state: 'Arizona' },
  { city: 'Page', state: 'Arizona' },
  { city: 'Benson', state: 'Arizona' },
  { city: 'Wickenburg', state: 'Arizona' },
  { city: 'Tolleson', state: 'Arizona' },
  { city: 'Litchfield Park', state: 'Arizona' },
  { city: 'Paradise Valley', state: 'Arizona' },

  // Nevada cities
  { city: 'Las Vegas', state: 'Nevada' },
  { city: 'Henderson', state: 'Nevada' },
  { city: 'Reno', state: 'Nevada' },
  { city: 'North Las Vegas', state: 'Nevada' },
  { city: 'Sparks', state: 'Nevada' },
  { city: 'Carson City', state: 'Nevada' },
  { city: 'Fernley', state: 'Nevada' },
  { city: 'Elko', state: 'Nevada' },
  { city: 'Mesquite', state: 'Nevada' },
  { city: 'Boulder City', state: 'Nevada' },
  { city: 'Fallon', state: 'Nevada' },
  { city: 'Winnemucca', state: 'Nevada' },
  { city: 'West Wendover', state: 'Nevada' },
  { city: 'Ely', state: 'Nevada' },
  { city: 'Yerington', state: 'Nevada' },
  { city: 'Carlin', state: 'Nevada' },
  { city: 'Lovelock', state: 'Nevada' },
  { city: 'Pahrump', state: 'Nevada' },
  { city: 'Laughlin', state: 'Nevada' },
];

/**
 * Fetch city boundary from Nominatim API
 */
function fetchCityBoundary(city, state) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(`${city}, ${state}, USA`);
    const hostname = 'nominatim.openstreetmap.org';
    const path = `/search?q=${query}&format=json&polygon_geojson=1&limit=1`;

    const options = {
      hostname,
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'SalesDashboardApp/1.0 (https://github.com/sales-dashboard; contact@salesdashboard.com)',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://salesdashboard.local/',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      // Check for non-200 status
      if (res.statusCode !== 200) {
        resolve({ error: `HTTP ${res.statusCode}` });
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Check if response looks like HTML (error page)
          if (data.trim().startsWith('<')) {
            resolve({ error: 'Received HTML instead of JSON (rate limited or blocked)' });
            return;
          }

          const results = JSON.parse(data);

          if (!results || results.length === 0 || !results[0].geojson) {
            resolve(null);
            return;
          }

          const result = results[0];
          const geojson = result.geojson;

          let polygon = null;

          if (geojson.type === 'Polygon') {
            polygon = geojson.coordinates[0].map(coord => ({
              lat: coord[1],
              lng: coord[0]
            }));
          } else if (geojson.type === 'MultiPolygon') {
            polygon = geojson.coordinates.map(poly =>
              poly[0].map(coord => ({
                lat: coord[1],
                lng: coord[0]
              }))
            );
          } else {
            resolve(null);
            return;
          }

          const [south, north, west, east] = result.boundingbox.map(Number);

          resolve({
            city,
            state,
            polygon,
            bounds: { north, south, east, west },
            center: {
              lat: Number(result.lat),
              lng: Number(result.lon)
            }
          });
        } catch (e) {
          resolve({ error: e.message });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ error: e.message });
    });

    req.end();
  });
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  console.log('=' .repeat(60));
  console.log('City Boundaries Pre-Fetch Script');
  console.log('=' .repeat(60));
  console.log(`\nFetching boundaries for ${CITIES_TO_FETCH.length} cities...`);
  console.log('(Nominatim rate limit: 1 request/second, using 1.5s delay)\n');

  const boundaries = {};
  let found = 0;
  let notFound = 0;
  let errors = 0;

  for (let i = 0; i < CITIES_TO_FETCH.length; i++) {
    const { city, state } = CITIES_TO_FETCH[i];
    const cacheKey = `${city}, ${state}`.toLowerCase();

    process.stdout.write(`  [${i + 1}/${CITIES_TO_FETCH.length}] ${city}, ${state}... `);

    const result = await fetchCityBoundary(city, state);

    if (result && result.error) {
      console.log(`Error: ${result.error}`);
      errors++;
    } else if (result) {
      boundaries[cacheKey] = result;
      console.log('OK');
      found++;
    } else {
      console.log('Not found');
      notFound++;
    }

    // Rate limiting - use longer delay to avoid being blocked
    if (i < CITIES_TO_FETCH.length - 1) {
      await sleep(1500);
    }
  }

  // Save to JSON file
  const outputPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'cityBoundaries.json');

  // Ensure directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(boundaries, null, 2));

  console.log('\n' + '=' .repeat(60));
  console.log('SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Cities attempted: ${CITIES_TO_FETCH.length}`);
  console.log(`Boundaries found: ${found}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Errors: ${errors}`);
  console.log(`Output file: ${outputPath}`);

  if (errors > 0) {
    console.log('\nNote: Some requests failed. You can run the script again');
    console.log('to retry failed cities (already fetched ones are saved).');
  }

  console.log('\nNext step: The frontend will now use this static file.');
}

main().catch(console.error);
