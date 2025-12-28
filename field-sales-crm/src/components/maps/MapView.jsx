import React, { useRef, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

// Platform-specific map imports
let MapViewNative, Marker, Polyline, PROVIDER_GOOGLE;
let GoogleMapReact;

if (Platform.OS === 'web') {
  // Web: Use @react-google-maps/api
  try {
    const googleMaps = require('@react-google-maps/api');
    GoogleMapReact = googleMaps.GoogleMap;
  } catch (e) {
    console.warn('Google Maps API not available for web');
  }
} else {
  // Mobile: Use react-native-maps
  try {
    const maps = require('react-native-maps');
    MapViewNative = maps.default;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

/**
 * Platform-agnostic MapView component
 * Wraps react-native-maps for mobile and @react-google-maps/api for web
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

  // Animate to region
  const animateToRegion = (newRegion, duration = 1000) => {
    if (Platform.OS === 'web') {
      // Web: Use panTo and setZoom
      if (mapRef.current) {
        mapRef.current.panTo({
          lat: newRegion.latitude,
          lng: newRegion.longitude,
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
      // Web: Calculate bounds and fit
      if (mapRef.current && coordinates.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        coordinates.forEach(coord => {
          bounds.extend({ lat: coord.latitude, lng: coord.longitude });
        });
        mapRef.current.fitBounds(bounds, options.edgePadding || 50);
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
    // Web implementation
    const mapOptions = {
      center: region ? { lat: region.latitude, lng: region.longitude } : { lat: 0, lng: 0 },
      zoom: region ? Math.log2(360 / region.latitudeDelta) : 10,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    };

    return (
      <View style={[styles.container, style]}>
        {GoogleMapReact && (
          <GoogleMapReact
            ref={mapRef}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={mapOptions}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            {...props}
          >
            {children}
          </GoogleMapReact>
        )}
      </View>
    );
  }

  // Mobile implementation
  return (
    <View style={[styles.container, style]}>
      {MapViewNative && (
        <MapViewNative
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          region={region}
          onRegionChange={onRegionChange}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={showsUserLocation}
          showsMyLocationButton={showsMyLocationButton}
          {...props}
        >
          {children}
        </MapViewNative>
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
});

export default MapView;
export { Marker, Polyline };
