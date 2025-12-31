import React from 'react';
import { Platform } from 'react-native';
import { decodePolyline } from '../../services/mapsService';

// Import platform-specific polyline components
let Polyline, PolylineWeb;
if (Platform.OS === 'web') {
  try {
    const googleMaps = require('@react-google-maps/api');
    PolylineWeb = googleMaps.Polyline;
  } catch (e) {
    console.warn('Google Maps API not available for web');
  }
} else {
  try {
    const maps = require('react-native-maps');
    Polyline = maps.Polyline;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

/**
 * RoutePolyline component
 * Displays route path on the map
 */
const RoutePolyline = ({ encodedPolyline, coordinates, strokeColor = '#3b82f6', strokeWidth = 4 }) => {
  // Decode polyline if encoded string is provided
  const routeCoordinates = encodedPolyline
    ? decodePolyline(encodedPolyline)
    : coordinates || [];

  console.log('[POLYLINE] Rendering route:', {
    hasEncodedPolyline: !!encodedPolyline,
    hasCoordinates: !!coordinates,
    routeCoordinatesCount: routeCoordinates?.length,
    platform: Platform.OS
  });

  if (!routeCoordinates || routeCoordinates.length === 0) {
    console.log('[POLYLINE] No coordinates to render');
    return null;
  }

  if (Platform.OS === 'web') {
    // Web: Use Google Maps Polyline
    if (!PolylineWeb) {
      console.log('[POLYLINE] PolylineWeb component not available');
      return null;
    }

    // Convert to Google Maps format { lat, lng }
    const path = routeCoordinates.map(coord => ({
      lat: coord.latitude,
      lng: coord.longitude
    }));

    console.log('[POLYLINE] Rendering web polyline with', path.length, 'points');

    return (
      <PolylineWeb
        path={path}
        options={{
          strokeColor: strokeColor,
          strokeWeight: strokeWidth,
          strokeOpacity: 0.9,
          geodesic: true,
          zIndex: 100,
        }}
      />
    );
  }

  // Mobile: Use react-native-maps Polyline
  if (!Polyline) {
    console.log('[POLYLINE] Polyline component not available');
    return null;
  }

  console.log('[POLYLINE] Rendering mobile polyline with', routeCoordinates.length, 'points');

  return (
    <Polyline
      coordinates={routeCoordinates}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      lineCap="round"
      lineJoin="round"
      geodesic={true}
    />
  );
};

export default RoutePolyline;
