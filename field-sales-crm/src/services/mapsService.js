import { Platform } from 'react-native';

/**
 * Maps Service
 * Provides platform-agnostic interface for Google Maps Directions API
 * Handles route calculation, distance matrix, and geocoding
 *
 * Uses Google Maps Directions API
 */

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDIo5YFAdFpGkuErvDMpiAGP-1Dq9Tj6F0';

// Check if we're running in browser (for Google Maps JS API)
const isBrowser = () => {
  return typeof window !== 'undefined' &&
         typeof window.google !== 'undefined' &&
         typeof window.google.maps !== 'undefined' &&
         typeof window.google.maps.DirectionsService !== 'undefined';
};

/**
 * Calculate route between multiple waypoints using Google Maps Directions API
 * @param {Array} waypoints - Array of {latitude, longitude} objects
 * @param {Object} options - Route options (optimize, mode, etc.)
 * @returns {Promise<Object>} Route data with polyline, distance, duration
 */
export const calculateRoute = async (waypoints, options = {}) => {
  if (!waypoints || waypoints.length < 2) {
    return { success: false, error: 'At least 2 waypoints required' };
  }

  try {
    console.log('[MAPS] Calculating route with Google Maps Directions API:', {
      waypoints: waypoints.length,
      optimize: options.optimize,
      mode: options.mode || 'driving',
      hasBrowserAPI: isBrowser()
    });

    // If running in browser with Google Maps loaded, use DirectionsService
    if (isBrowser()) {
      console.log('[MAPS] Using Google Maps JavaScript API (browser)');
      return await calculateRouteWithGoogleMapsJS(waypoints, options);
    }

    // Otherwise use Google Maps Directions REST API
    console.log('[MAPS] Using Google Maps REST API (fallback)');
    return await calculateRouteWithRestAPI(waypoints, options);
  } catch (error) {
    console.error('[MAPS] Route calculation error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a simple straight-line route (fallback when Directions API is not enabled)
 */
const createSimpleStraightLineRoute = (waypoints) => {
  console.log('[MAPS] Creating simple straight-line route (fallback)');

  // Just connect waypoints with straight lines
  const coordinates = waypoints.map(wp => ({
    latitude: wp.latitude,
    longitude: wp.longitude
  }));

  // Calculate total distance using Haversine formula
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
  }

  // Estimate duration (assuming 50 km/h average speed)
  const totalDuration = (totalDistance / 1000) * 72; // seconds

  return {
    success: true,
    route: {
      coordinates: coordinates,
      polyline: encodePolyline(coordinates),
      distance: totalDistance,
      duration: totalDuration,
      legs: waypoints.slice(0, -1).map((wp, i) => {
        const distance = calculateDistance(wp, waypoints[i + 1]);
        const duration = (distance / 1000) * 72;
        return {
          distance: { value: distance, text: formatDistance(distance) },
          duration: { value: duration, text: formatDuration(duration) },
          steps: [],
        };
      }),
      waypointOrder: [],
    },
  };
};

/**
 * Calculate route using Google Maps JavaScript API (for web)
 */
const calculateRouteWithGoogleMapsJS = async (waypoints, options) => {
  return new Promise((resolve, reject) => {
    const directionsService = new window.google.maps.DirectionsService();

    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const waypointsFormatted = waypoints.slice(1, -1).map(wp => ({
      location: { lat: wp.latitude, lng: wp.longitude },
      stopover: true
    }));

    const travelMode = options.mode === 'walking' ? 'WALKING'
                     : options.mode === 'cycling' ? 'BICYCLING'
                     : 'DRIVING';

    const request = {
      origin: { lat: origin.latitude, lng: origin.longitude },
      destination: { lat: destination.latitude, lng: destination.longitude },
      waypoints: waypointsFormatted,
      optimizeWaypoints: options.optimize || false,
      travelMode: window.google.maps.TravelMode[travelMode],
    };

    console.log('[MAPS] Google Maps JS API request:', request);

    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        console.log('[MAPS] Route calculated successfully');

        const route = result.routes[0];

        // Extract all coordinates from the route path
        const coordinates = [];
        route.overview_path.forEach(point => {
          coordinates.push({
            latitude: point.lat(),
            longitude: point.lng()
          });
        });

        // Encode polyline for compatibility
        const encodedPolyline = encodePolyline(coordinates);

        console.log('[MAPS] Route details:', {
          coordinatesCount: coordinates.length,
          totalDistance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
          totalDuration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0)
        });

        resolve({
          success: true,
          route: {
            coordinates: coordinates,
            polyline: encodedPolyline,
            distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
            duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
            legs: route.legs.map(leg => ({
              distance: leg.distance,
              duration: leg.duration,
              steps: leg.steps || [],
            })),
            waypointOrder: result.routes[0].waypoint_order || [],
          },
        });
      } else if (status === 'REQUEST_DENIED') {
        console.error('[MAPS] Directions API not enabled. Using simple straight-line route.');
        console.warn('⚠️ Please enable Directions API in Google Cloud Console:');
        console.warn('   https://console.cloud.google.com/apis/library/directions-backend.googleapis.com');

        // Fallback: Create simple straight-line route
        resolve(createSimpleStraightLineRoute(waypoints));
      } else {
        console.error('[MAPS] Directions request failed:', status);
        reject(new Error(`Directions request failed: ${status}`));
      }
    });
  });
};

/**
 * Calculate route using Google Maps Directions REST API (fallback)
 */
const calculateRouteWithRestAPI = async (waypoints, options) => {
  const origin = `${waypoints[0].latitude},${waypoints[0].longitude}`;
  const destination = `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`;

  let waypointsParam = '';
  if (waypoints.length > 2) {
    const waypointsList = waypoints.slice(1, -1)
      .map(wp => `${wp.latitude},${wp.longitude}`)
      .join('|');
    waypointsParam = `&waypoints=${options.optimize ? 'optimize:true|' : ''}${waypointsList}`;
  }

  const mode = options.mode || 'driving';
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypointsParam}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;

  console.log('[MAPS] Google Maps REST API request');

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.routes && data.routes.length > 0) {
    console.log('[MAPS] Route calculated successfully via REST API');

    const route = data.routes[0];
    const coordinates = decodePolyline(route.overview_polyline.points);

    return {
      success: true,
      route: {
        coordinates: coordinates,
        polyline: route.overview_polyline.points,
        distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
        duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
        legs: route.legs.map(leg => ({
          distance: leg.distance,
          duration: leg.duration,
          steps: leg.steps || [],
        })),
        waypointOrder: route.waypoint_order || [],
      },
    };
  }

  throw new Error(data.error_message || `Directions request failed: ${data.status}`);
};

/**
 * Calculate distance matrix between multiple origins and destinations
 * Note: Currently using simple Haversine distance calculation
 * TODO: Implement Google Maps Distance Matrix API if needed
 * @param {Array} origins - Array of {latitude, longitude} objects
 * @param {Array} destinations - Array of {latitude, longitude} objects
 * @returns {Promise<Object>} Distance matrix data
 */
export const calculateDistanceMatrix = async (origins, destinations) => {
  if (!origins?.length || !destinations?.length) {
    return { success: false, error: 'Origins and destinations required' };
  }

  try {
    // Simple distance matrix using Haversine formula
    const matrix = origins.map(origin => ({
      origin,
      elements: destinations.map(destination => {
        const distance = calculateDistance(origin, destination);
        // Rough duration estimate: 50 km/h average speed
        const duration = (distance / 1000) * 72; // seconds

        return {
          destination,
          distance: { value: distance, text: formatDistance(distance) },
          duration: { value: duration, text: formatDuration(duration) },
          status: 'OK',
        };
      }),
    }));

    return {
      success: true,
      matrix,
    };
  } catch (error) {
    console.error('[MAPS] Distance matrix error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Encode array of coordinates to polyline string
 * @param {Array} coordinates - Array of {latitude, longitude} objects
 * @returns {string} Encoded polyline string
 */
export const encodePolyline = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return '';

  let encoded = '';
  let prevLat = 0, prevLng = 0;

  for (const coord of coordinates) {
    const lat = Math.round(coord.latitude * 1e5);
    const lng = Math.round(coord.longitude * 1e5);

    encoded += encodeValue(lat - prevLat);
    encoded += encodeValue(lng - prevLng);

    prevLat = lat;
    prevLng = lng;
  }

  return encoded;
};

/**
 * Helper function to encode a single value
 */
const encodeValue = (value) => {
  let encoded = '';
  let num = value < 0 ? ~(value << 1) : (value << 1);

  while (num >= 0x20) {
    encoded += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
    num >>= 5;
  }

  encoded += String.fromCharCode(num + 63);
  return encoded;
};

/**
 * Decode polyline string to array of coordinates
 * @param {string} encoded - Encoded polyline string
 * @returns {Array} Array of {latitude, longitude} objects
 */
export const decodePolyline = (encoded) => {
  if (!encoded) return [];

  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return poly;
};

/**
 * Calculate center point of multiple coordinates
 * @param {Array} coordinates - Array of {latitude, longitude} objects
 * @returns {Object} Center coordinate {latitude, longitude}
 */
export const calculateCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  if (coordinates.length === 1) {
    return coordinates[0];
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / coordinates.length,
    longitude: sum.longitude / coordinates.length,
  };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Object} coord1 - {latitude, longitude}
 * @param {Object} coord2 - {latitude, longitude}
 * @returns {number} Distance in meters
 */
export const calculateDistance = (coord1, coord2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

/**
 * Get map region from coordinates with padding
 * @param {Array} coordinates - Array of {latitude, longitude} objects
 * @param {number} padding - Padding factor (default 1.2)
 * @returns {Object} Map region {latitude, longitude, latitudeDelta, longitudeDelta}
 */
export const getRegionFromCoordinates = (coordinates, padding = 1.2) => {
  if (!coordinates || coordinates.length === 0) {
    return {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }

  if (coordinates.length === 1) {
    return {
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const lats = coordinates.map(c => c.latitude);
  const lngs = coordinates.map(c => c.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latDelta = (maxLat - minLat) * padding;
  const lngDelta = (maxLng - minLng) * padding;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 0.01),
    longitudeDelta: Math.max(lngDelta, 0.01),
  };
};

/**
 * Get OpenStreetMap tile URL for a given tile coordinate
 * @param {number} x - Tile X coordinate
 * @param {number} y - Tile Y coordinate
 * @param {number} z - Zoom level
 * @returns {string} Tile URL
 */
export const getOSMTileUrl = (x, y, z) => {
  // Use OpenStreetMap tile servers
  const subdomains = ['a', 'b', 'c'];
  const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)];
  return `https://${subdomain}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
};

/**
 * Get tile URL template for map libraries
 * @returns {string} Tile URL template
 */
export const getTileUrlTemplate = () => {
  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
};

/**
 * Get map attribution text
 * @returns {string} Attribution HTML
 */
export const getMapAttribution = () => {
  return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
};

export default {
  calculateRoute,
  calculateDistanceMatrix,
  encodePolyline,
  decodePolyline,
  calculateCenter,
  calculateDistance,
  formatDistance,
  formatDuration,
  getRegionFromCoordinates,
  getOSMTileUrl,
  getTileUrlTemplate,
  getMapAttribution,
};

