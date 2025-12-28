import React from 'react';
import { Platform } from 'react-native';
import { Polyline } from './MapView';
import { decodePolyline } from '../../services/mapsService';

/**
 * RoutePolyline component
 * Displays route path on the map
 */
const RoutePolyline = ({ encodedPolyline, coordinates, strokeColor = '#3b82f6', strokeWidth = 4 }) => {
  // Decode polyline if encoded string is provided
  const routeCoordinates = encodedPolyline 
    ? decodePolyline(encodedPolyline)
    : coordinates || [];

  if (!routeCoordinates || routeCoordinates.length === 0) {
    return null;
  }

  if (Platform.OS === 'web') {
    // Web: Use Google Maps Polyline
    return (
      <div>
        {/* Web polyline will be rendered by Google Maps API */}
        {/* This is handled in the MapViewScreen component */}
      </div>
    );
  }

  // Mobile: Use react-native-maps Polyline
  return (
    <Polyline
      coordinates={routeCoordinates}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      lineCap="round"
      lineJoin="round"
    />
  );
};

export default RoutePolyline;
