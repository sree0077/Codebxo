import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { makePhoneCall, sendSMS, getPotentialColor } from '../../utils/helpers';

/**
 * Generate a custom marker icon as SVG data URL
 * Creates a pin-shaped marker with shadow effect
 */
const createMarkerIcon = (color, hasLabel = false) => {
  const svg = `
    <svg width="48" height="58" viewBox="0 0 48 58" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <ellipse cx="24" cy="54" rx="12" ry="4" fill="rgba(0,0,0,0.2)"/>

      <!-- Pin shape -->
      <path d="M24 2C14.6 2 7 9.6 7 19c0 11 17 35 17 35s17-24 17-35c0-9.4-7.6-17-17-17z"
            fill="${color}"
            stroke="#ffffff"
            stroke-width="2.5"/>

      <!-- Inner circle -->
      <circle cx="24" cy="19" r="7" fill="rgba(255,255,255,0.3)"/>
      <circle cx="24" cy="19" r="5" fill="rgba(255,255,255,0.5)"/>
    </svg>
  `;

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: window.google?.maps ? new window.google.maps.Size(48, 58) : { width: 48, height: 58 },
    anchor: window.google?.maps ? new window.google.maps.Point(24, 58) : { x: 24, y: 58 },
    labelOrigin: window.google?.maps ? new window.google.maps.Point(24, 19) : { x: 24, y: 19 },
  };
};

// Import platform-specific marker components
let Marker, MarkerWeb, InfoWindow, AdvancedMarkerElement;
if (Platform.OS === 'web') {
  try {
    const googleMaps = require('@react-google-maps/api');
    MarkerWeb = googleMaps.Marker;
    InfoWindow = googleMaps.InfoWindow;
    // Note: AdvancedMarkerElement not yet available in @react-google-maps/api
    // Using standard Marker for now (still supported, just deprecated)
  } catch (e) {
    console.warn('Google Maps API not available for web');
  }
} else {
  try {
    const maps = require('react-native-maps');
    Marker = maps.Marker;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

/**
 * Custom marker component for displaying client locations
 * Shows client info and quick actions (call/message)
 */
const ClientMarker = ({ client, onPress, isSelected = false, index }) => {
  const [showCallout, setShowCallout] = useState(false);

  if (!client?.location) {
    return null;
  }

  const coordinate = {
    latitude: client.location.latitude,
    longitude: client.location.longitude,
  };

  const handleMarkerPress = () => {
    setShowCallout(!showCallout);
    if (onPress) {
      onPress(client);
    }
  };

  const handleCall = (e) => {
    e?.stopPropagation();
    if (client.phoneNumber) {
      makePhoneCall(client.phoneNumber);
    }
  };

  const handleMessage = (e) => {
    e?.stopPropagation();
    if (client.phoneNumber) {
      sendSMS(client.phoneNumber);
    }
  };

  // Custom marker color based on potential
  const markerColor = getPotentialColor(client.customerPotential);

  if (Platform.OS === 'web') {
    // Web: Use Google Maps Marker with InfoWindow
    if (!MarkerWeb || !InfoWindow) return null;

    // Get marker color based on selection and potential
    const color = isSelected ? '#3b82f6' : markerColor;

    // Use custom SVG marker icon with shadow
    const markerIcon = createMarkerIcon(color, index !== undefined);

    // Add label if marker has an index (in route planning mode)
    const markerLabel = index !== undefined ? {
      text: String(index + 1),
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: 'bold',
    } : undefined;

    return (
      <MarkerWeb
        position={{ lat: coordinate.latitude, lng: coordinate.longitude }}
        onClick={handleMarkerPress}
        icon={markerIcon}
        label={markerLabel}
        zIndex={isSelected ? 1000 : index !== undefined ? 100 : 1}
        animation={isSelected && window.google?.maps ? window.google.maps.Animation.BOUNCE : null}
      >
        {showCallout && (
          <InfoWindow onCloseClick={() => setShowCallout(false)}>
            <div style={{ minWidth: '200px', padding: '8px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                {client.clientName}
              </h3>
              {client.companyName && (
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>
                  {client.companyName}
                </p>
              )}
              {client.phoneNumber && (
                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                  📞 {client.phoneNumber}
                </p>
              )}
              {client.address && (
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#64748b' }}>
                  📍 {client.address}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={handleCall}
                  style={{
                    flex: 1,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  📞 Call
                </button>
                <button
                  onClick={handleMessage}
                  style={{
                    flex: 1,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  💬 Message
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </MarkerWeb>
    );
  }

  // Mobile: Use react-native-maps Marker with Callout
  return (
    <Marker
      coordinate={coordinate}
      onPress={handleMarkerPress}
      pinColor={isSelected ? '#3b82f6' : markerColor}
      title={client.clientName}
      description={client.companyName}
    >
      {index !== undefined && (
        <View style={[styles.markerContainer, isSelected && styles.selectedMarker]}>
          <Text style={styles.markerText}>{index + 1}</Text>
        </View>
      )}
      
      {showCallout && (
        <View style={styles.callout}>
          <View style={styles.calloutContent}>
            <Text style={styles.clientName}>{client.clientName}</Text>
            {client.companyName && (
              <Text style={styles.companyName}>{client.companyName}</Text>
            )}
            {client.phoneNumber && (
              <Text style={styles.phone}>📞 {client.phoneNumber}</Text>
            )}
            {client.address && (
              <Text style={styles.address}>📍 {client.address}</Text>
            )}
            
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleCall} style={styles.actionButton}>
                <Text style={styles.actionText}>📞 Call</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMessage} style={styles.actionButton}>
                <Text style={styles.actionText}>💬 Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ef4444',
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedMarker: {
    backgroundColor: '#3b82f6',
  },
  markerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  callout: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutContent: {
    gap: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  companyName: {
    fontSize: 14,
    color: '#64748b',
  },
  phone: {
    fontSize: 13,
    color: '#475569',
  },
  address: {
    fontSize: 12,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

// Web-specific styles
const webStyles = {
  callout: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  calloutContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
  },
  companyName: {
    fontSize: 14,
    color: '#64748b',
    margin: 0,
  },
  phone: {
    fontSize: 13,
    color: '#475569',
    margin: 0,
  },
  address: {
    fontSize: 12,
    color: '#64748b',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: '8px 12px',
    borderRadius: 6,
    border: 'none',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default ClientMarker;

