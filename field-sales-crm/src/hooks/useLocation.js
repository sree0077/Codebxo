import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  // Check permission status
  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (err) {
      console.error('Error checking permission:', err);
      return false;
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (err) {
      setError('Failed to request location permission');
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check/request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        setIsLoading(false);
        return null;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
      };

      setLocation(locationData);

      // Try to get address (reverse geocoding)
      try {
        const [addressResult] = await Location.reverseGeocodeAsync({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });

        if (addressResult) {
          const formattedAddress = [
            addressResult.streetNumber,
            addressResult.street,
            addressResult.city,
            addressResult.region,
            addressResult.postalCode,
            addressResult.country,
          ]
            .filter(Boolean)
            .join(', ');
          setAddress(formattedAddress);
        }
      } catch (geocodeError) {
        console.log('Geocoding failed:', geocodeError);
        // Address is optional, continue without it
      }

      setIsLoading(false);
      return locationData;
    } catch (err) {
      console.error('Error getting location:', err);
      setError('Failed to get current location');
      setIsLoading(false);
      return null;
    }
  }, [requestPermission]);

  // Clear location data
  const clearLocation = useCallback(() => {
    setLocation(null);
    setAddress('');
    setError(null);
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    location,
    address,
    isLoading,
    error,
    permissionStatus,
    getCurrentLocation,
    requestPermission,
    clearLocation,
  };
};

export default useLocation;

