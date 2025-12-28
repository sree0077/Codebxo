import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Marker } from './MapView';
import { makePhoneCall, sendSMS, getPotentialColor } from '../../utils/helpers';

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
    return (
      <div
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div
          onClick={handleMarkerPress}
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: isSelected ? '#3b82f6' : markerColor,
            border: '3px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          {index !== undefined ? index + 1 : '📍'}
        </div>
        
        {showCallout && (
          <div style={webStyles.callout}>
            <div style={webStyles.calloutContent}>
              <h3 style={webStyles.clientName}>{client.clientName}</h3>
              {client.companyName && (
                <p style={webStyles.companyName}>{client.companyName}</p>
              )}
              {client.phoneNumber && (
                <p style={webStyles.phone}>📞 {client.phoneNumber}</p>
              )}
              {client.address && (
                <p style={webStyles.address}>📍 {client.address}</p>
              )}
              
              <div style={webStyles.actions}>
                <button onClick={handleCall} style={webStyles.actionButton}>
                  📞 Call
                </button>
                <button onClick={handleMessage} style={webStyles.actionButton}>
                  💬 Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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

