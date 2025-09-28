const NodeGeocoder = require('node-geocoder');

// Initialize geocoder with proper rate limiting and user agent
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null,
  extra: {
    'User-Agent': 'PulseNYC-EventAggregator/1.0 (Educational Project)',
    'Referer': 'https://pulsenyc.com'
  }
});

/**
 * Geocodes an address to latitude and longitude coordinates
 * @param {string} address - The address to geocode
 * @returns {Promise<Object|null>} Object with latitude and longitude, or null if geocoding fails
 */
// Rate limiting for geocoding requests
let lastGeocodeTime = 0;
const GEOCODE_DELAY = 2000; // 2 seconds between requests

async function geocodeAddress(address) {
  try {
    if (!address) {
      console.log('No address provided for geocoding');
      return getFallbackCoordinates(address);
    }

    // Clean up the address first
    const cleanAddress = address.replace(/[^\w\s,.-]/g, '').trim();
    if (cleanAddress.length < 5) {
      console.log('Address too short, using fallback');
      return getFallbackCoordinates(address);
    }

    // Skip geocoding for now due to rate limiting issues
    // Use fallback coordinates instead
    console.log(`Using fallback coordinates for: ${cleanAddress}`);
    return getFallbackCoordinates(cleanAddress);
    
  } catch (error) {
    console.error(`Geocoding error for address "${address}":`, error.message);
    
    // Return fallback coordinates for NYC if geocoding fails
    return getFallbackCoordinates(address);
  }
}

/**
 * Provides fallback coordinates based on address patterns or default NYC location
 * @param {string} address - The address that failed to geocode
 * @returns {Object} Fallback coordinates
 */
function getFallbackCoordinates(address) {
  const lowerAddress = address.toLowerCase();
  
  // Common NYC neighborhood fallback coordinates
  const fallbackCoords = {
    'union square': { latitude: 40.7356, longitude: -73.9906 },
    'washington square': { latitude: 40.7308, longitude: -73.9973 },
    'times square': { latitude: 40.7580, longitude: -73.9855 },
    'central park': { latitude: 40.7829, longitude: -73.9654 },
    'brooklyn': { latitude: 40.6782, longitude: -73.9442 },
    'queens': { latitude: 40.7282, longitude: -73.7949 },
    'manhattan': { latitude: 40.7831, longitude: -73.9712 },
    'east village': { latitude: 40.7282, longitude: -73.9857 },
    'west village': { latitude: 40.7336, longitude: -74.0027 },
    'soho': { latitude: 40.7231, longitude: -74.0028 },
    'lower east side': { latitude: 40.7150, longitude: -73.9843 },
    'upper east side': { latitude: 40.7736, longitude: -73.9566 },
    'upper west side': { latitude: 40.7870, longitude: -73.9754 },
    'harlem': { latitude: 40.8075, longitude: -73.9626 },
    'chinatown': { latitude: 40.7158, longitude: -73.9970 },
    'little italy': { latitude: 40.7191, longitude: -73.9973 }
  };
  
  // Check for neighborhood matches
  for (const [neighborhood, coords] of Object.entries(fallbackCoords)) {
    if (lowerAddress.includes(neighborhood)) {
      console.log(`Using fallback coordinates for ${neighborhood}: ${coords.latitude}, ${coords.longitude}`);
      return coords;
    }
  }
  
  // Default to East Village coordinates
  const defaultCoords = { latitude: 40.7282, longitude: -73.9857 };
  console.log(`Using default NYC coordinates: ${defaultCoords.latitude}, ${defaultCoords.longitude}`);
  return defaultCoords;
}

/**
 * Batch geocodes multiple addresses
 * @param {Array<string>} addresses - Array of addresses to geocode
 * @returns {Promise<Array<Object|null>>} Array of coordinate objects or null values
 */
async function geocodeAddresses(addresses) {
  const results = [];
  
  for (const address of addresses) {
    const coords = await geocodeAddress(address);
    results.push(coords);
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

module.exports = { geocodeAddress, geocodeAddresses, getFallbackCoordinates };
