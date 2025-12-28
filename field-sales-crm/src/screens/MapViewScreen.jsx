import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView from '../components/maps/MapView';
import ClientMarker from '../components/maps/ClientMarker';
import RoutePolyline from '../components/maps/RoutePolyline';
import { Button, LoadingSpinner } from '../components/common';
import { useClients } from '../hooks/useClients';
import { useLocation } from '../hooks/useLocation';
import { useRouteOptimization } from '../hooks/useRouteOptimization';
import { getRegionFromCoordinates, formatDistance, formatDuration } from '../services/mapsService';
import { SCREENS } from '../utils/constants';

const MapViewScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  
  const { filteredClients } = useClients();
  const { location: currentLocation, getCurrentLocation } = useLocation();
  const { route, isCalculating, optimizeRoute, clearRoute } = useRouteOptimization();

  const [selectedClients, setSelectedClients] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [showRoutePanel, setShowRoutePanel] = useState(false);

  // Filter clients with valid locations
  const clientsWithLocation = filteredClients.filter(
    client => client.location?.latitude && client.location?.longitude
  );

  // Initialize map region
  useEffect(() => {
    if (clientsWithLocation.length > 0) {
      const coordinates = clientsWithLocation.map(c => c.location);
      const region = getRegionFromCoordinates(coordinates);
      setMapRegion(region);
    } else if (currentLocation) {
      setMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [clientsWithLocation.length, currentLocation]);

  // Handle client marker press
  const handleMarkerPress = useCallback((client) => {
    if (showRoutePanel) {
      // Toggle selection when in route planning mode
      setSelectedClients(prev => {
        const isSelected = prev.some(c => c.id === client.id);
        if (isSelected) {
          return prev.filter(c => c.id !== client.id);
        } else {
          return [...prev, client];
        }
      });
    } else {
      // Navigate to client detail
      navigation.navigate(SCREENS.CLIENT_DETAIL, { clientId: client.id });
    }
  }, [showRoutePanel, navigation]);

  // Handle route planning
  const handlePlanRoute = useCallback(async () => {
    if (selectedClients.length < 2) {
      Alert.alert('Route Planning', 'Please select at least 2 clients to plan a route');
      return;
    }

    const optimizedRoute = await optimizeRoute(selectedClients, currentLocation);
    
    if (optimizedRoute) {
      // Fit map to show entire route
      const coordinates = optimizedRoute.clients.map(c => c.location);
      if (mapRef.current?.fitToCoordinates) {
        mapRef.current.fitToCoordinates(coordinates);
      }
    }
  }, [selectedClients, currentLocation, optimizeRoute]);

  // Toggle route planning mode
  const toggleRoutePlanning = useCallback(() => {
    if (showRoutePanel) {
      // Exit route planning mode
      setShowRoutePanel(false);
      setSelectedClients([]);
      clearRoute();
    } else {
      // Enter route planning mode
      setShowRoutePanel(true);
    }
  }, [showRoutePanel, clearRoute]);

  // Center map on current location
  const handleCenterOnLocation = useCallback(async () => {
    const loc = await getCurrentLocation();
    if (loc && mapRef.current?.animateToRegion) {
      mapRef.current.animateToRegion({
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [getCurrentLocation]);

  if (!mapRegion) {
    return <LoadingSpinner fullScreen message="Loading map..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          mapRef={mapRef}
          style={styles.map}
        >
          {/* Client Markers */}
          {clientsWithLocation.map((client, index) => {
            const isSelected = selectedClients.some(c => c.id === client.id);
            const routeIndex = route?.clients.findIndex(c => c.id === client.id);
            
            return (
              <ClientMarker
                key={client.id}
                client={client}
                onPress={handleMarkerPress}
                isSelected={isSelected}
                index={route && routeIndex !== -1 ? routeIndex : undefined}
              />
            );
          })}

          {/* Route Polyline */}
          {route && (
            <RoutePolyline
              encodedPolyline={route.polyline}
              strokeColor="#3b82f6"
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Map Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleCenterOnLocation}
          >
            <Text style={styles.controlIcon}>📍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {!showRoutePanel ? (
          // Default view
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>
              {clientsWithLocation.length} Clients on Map
            </Text>
            <Button
              title="📍 Plan Route"
              onPress={toggleRoutePlanning}
              variant="primary"
            />
          </View>
        ) : (
          // Route planning view
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>
              Select Clients ({selectedClients.length} selected)
            </Text>
            
            {route && (
              <View style={styles.routeInfo}>
                <Text style={styles.routeInfoText}>
                  📏 {formatDistance(route.totalDistance)}
                </Text>
                <Text style={styles.routeInfoText}>
                  ⏱️ {formatDuration(route.totalDuration)}
                </Text>
              </View>
            )}

            <View style={styles.routeActions}>
              <Button
                title="Cancel"
                onPress={toggleRoutePlanning}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title={route ? "Clear Route" : "Optimize Route"}
                onPress={route ? clearRoute : handlePlanRoute}
                loading={isCalculating}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  controlIcon: {
    fontSize: 24,
  },
  bottomPanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  panelContent: {
    gap: 12,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  routeInfo: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  routeInfoText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  routeActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default MapViewScreen;

