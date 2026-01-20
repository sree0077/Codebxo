import React, { useRef, useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';

// Platform-specific map imports
let MapViewNative, Marker, Polyline;
let GoogleMap, useJsApiLoader;

if (Platform.OS === 'web') {
  // Web: Use @react-google-maps/api
  try {
    const googleMaps = require('@react-google-maps/api');
    GoogleMap = googleMaps.GoogleMap;
    useJsApiLoader = googleMaps.useJsApiLoader;
  } catch (e) {
    console.warn('Google Maps API not available for web:', e);
  }
} else {
  // Mobile: Use react-native-maps with native Google Maps SDK
  try {
    const maps = require('react-native-maps');
    MapViewNative = maps.default;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
  } catch (e) {
    console.warn('react-native-maps not available:', e);
  }
}

// Get Google Maps API key from environment
const getGoogleMapsApiKey = () => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('[MAPS] ❌ Google Maps API key not found in environment variables.');
    console.error('[MAPS] Please set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.');
  }

  return apiKey;
};

// Static libraries array to prevent LoadScript reloads
const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

/**
 * Platform-agnostic MapView component
 * Uses Google Maps for web and react-native-maps for mobile
 */
const MapView = ({
  region,
  onRegionChange,
  onRegionChangeComplete,
  children,
  style,
  showsUserLocation = true,
  showsMyLocationButton = true,
  ...props
}) => {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(
    region ? [region.latitude, region.longitude] : [0, 0]
  );
  const [mapZoom, setMapZoom] = useState(13);

  // Update center when region changes
  useEffect(() => {
    if (region) {
      setMapCenter([region.latitude, region.longitude]);
      // Calculate zoom from latitudeDelta
      if (region.latitudeDelta) {
        const zoom = Math.log2(360 / region.latitudeDelta);
        setMapZoom(Math.max(1, Math.min(18, zoom)));
      }
    }
  }, [region]);

  // Animate to region
  const animateToRegion = (newRegion, duration = 1000) => {
    if (Platform.OS === 'web') {
      // Web: Use Google Maps panTo
      if (mapRef.current) {
        mapRef.current.panTo({
          lat: newRegion.latitude,
          lng: newRegion.longitude
        });
      }
    } else {
      // Mobile: Use animateToRegion
      if (mapRef.current?.animateToRegion) {
        mapRef.current.animateToRegion(newRegion, duration);
      }
    }
  };

  // Fit to coordinates
  const fitToCoordinates = (coordinates, options = {}) => {
    if (Platform.OS === 'web') {
      // Web: Use Google Maps fitBounds
      if (mapRef.current && coordinates.length > 0 && window.google) {
        const bounds = new window.google.maps.LatLngBounds();
        coordinates.forEach(coord => {
          bounds.extend({ lat: coord.latitude, lng: coord.longitude });
        });
        mapRef.current.fitBounds(bounds);
      }
    } else {
      // Mobile: Use fitToCoordinates
      if (mapRef.current?.fitToCoordinates) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: options.edgePadding || { top: 50, right: 50, bottom: 50, left: 50 },
          animated: options.animated !== false,
        });
      }
    }
  };

  // Expose methods via ref
  useEffect(() => {
    if (props.mapRef) {
      props.mapRef.current = {
        animateToRegion,
        fitToCoordinates,
        getMapRef: () => mapRef.current,
      };
    }
  }, [props.mapRef]);

  if (Platform.OS === 'web') {
    // Web implementation with Google Maps
    const { isLoaded, loadError } = useJsApiLoader ? useJsApiLoader({
      googleMapsApiKey: getGoogleMapsApiKey(),
      libraries: GOOGLE_MAPS_LIBRARIES
    }) : { isLoaded: false, loadError: null };

    if (loadError) {
      return (
        <View style={[styles.container, style]}>
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackIcon}>🗺️</Text>
            <Text style={styles.fallbackTitle}>Map Load Error</Text>
            <Text style={styles.fallbackMessage}>
              Failed to load Google Maps. Please check your API key.
            </Text>
          </View>
        </View>
      );
    }

    if (!isLoaded) {
      return (
        <View style={[styles.container, style]}>
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackIcon}>⏳</Text>
            <Text style={styles.fallbackTitle}>Loading Map...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, style]}>
        {GoogleMap ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: region.latitude, lng: region.longitude }}
            zoom={mapZoom}
            onLoad={(map) => { mapRef.current = map; }}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
            {...props}
          >
            {children}
          </GoogleMap>
        ) : (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackIcon}>🗺️</Text>
            <Text style={styles.fallbackTitle}>Map Not Available</Text>
            <Text style={styles.fallbackMessage}>
              Unable to load Google Maps. Please refresh the page.
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Mobile implementation with native Google Maps SDK
  return (
    <View style={[styles.container, style]}>
      {MapViewNative ? (
        <MapViewNative
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          region={region}
          onRegionChange={onRegionChange}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={showsUserLocation}
          showsMyLocationButton={showsMyLocationButton}
          mapType="standard"
          {...props}
        >
          {children}
        </MapViewNative>
      ) : (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackIcon}>🗺️</Text>
          <Text style={styles.fallbackTitle}>Map Not Available</Text>
          <Text style={styles.fallbackMessage}>
            Maps require a native build to work on mobile devices.
          </Text>
          <Text style={styles.fallbackSubMessage}>
            To use maps, build the app with EAS Build or use the web version.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  fallbackIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  fallbackSubMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MapView;
export { Marker, Polyline };
