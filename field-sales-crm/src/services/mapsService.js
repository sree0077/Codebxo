import { Platform } from 'react-native';

/**
 * Maps Service
 * Provides platform-agnostic interface for Google Maps functionality
 * Handles route calculation, distance matrix, and geocoding
 */

const GOOGLE_MAPS_API_KEY = Platform.select({
  web: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_WEB,
  android: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID,
  ios: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS,
});

/**
 * Calculate route between multiple waypoints using Google Directions API
 * @param {Array} waypoints - Array of {latitude, longitude} objects
 * @param {Object} options - Route options (optimize, mode, etc.)
 * @returns {Promise<Object>} Route data with polyline, distance, duration
 */
export const calculateRoute = async (waypoints, options = {}) => {
  if (!waypoints || waypoints.length < 2) {
    return { success: false, error: 'At least 2 waypoints required' };
  }

  try {
    const origin = `${waypoints[0].latitude},${waypoints[0].longitude}`;
    const destination = `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`;
    
    // Middle waypoints
    const waypointsParam = waypoints.slice(1, -1).map(wp => 
      `${wp.latitude},${wp.longitude}`
    ).join('|');

    const params = new URLSearchParams({
      origin,
      destination,
      key: GOOGLE_MAPS_API_KEY,
      mode: options.mode || 'driving',
      optimize: options.optimize ? 'true' : 'false',
    });

    if (waypointsParam) {
      params.append('waypoints', `optimize:${options.optimize ? 'true' : 'false'}|${waypointsParam}`);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        success: true,
        route: {
          polyline: route.overview_polyline.points,
          distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0), // meters
          duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0), // seconds
          legs: route.legs.map(leg => ({
            distance: leg.distance,
            duration: leg.duration,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps,
          })),
          waypointOrder: data.routes[0].waypoint_order || [],
        },
      };
    }

    return { success: false, error: data.status || 'Route calculation failed' };
  } catch (error) {
    console.error('[MAPS] Route calculation error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate distance matrix between multiple origins and destinations
 * @param {Array} origins - Array of {latitude, longitude} objects
 * @param {Array} destinations - Array of {latitude, longitude} objects
 * @returns {Promise<Object>} Distance matrix data
 */
export const calculateDistanceMatrix = async (origins, destinations) => {
  if (!origins?.length || !destinations?.length) {
    return { success: false, error: 'Origins and destinations required' };
  }

  try {
    const originsParam = origins.map(o => `${o.latitude},${o.longitude}`).join('|');
    const destinationsParam = destinations.map(d => `${d.latitude},${d.longitude}`).join('|');

    const params = new URLSearchParams({
      origins: originsParam,
      destinations: destinationsParam,
      key: GOOGLE_MAPS_API_KEY,
      mode: 'driving',
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status === 'OK') {
      return {
        success: true,
        matrix: data.rows.map((row, i) => ({
          origin: origins[i],
          elements: row.elements.map((element, j) => ({
            destination: destinations[j],
            distance: element.distance,
            duration: element.duration,
            status: element.status,
          })),
        })),
      };
    }

    return { success: false, error: data.status || 'Distance calculation failed' };
  } catch (error) {
    console.error('[MAPS] Distance matrix error:', error);
    return { success: false, error: error.message };
  }
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

export default {
  calculateRoute,
  calculateDistanceMatrix,
  decodePolyline,
  calculateCenter,
  calculateDistance,
  formatDistance,
  formatDuration,
  getRegionFromCoordinates,
};

