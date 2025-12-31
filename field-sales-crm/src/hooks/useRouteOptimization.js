import { useState, useCallback } from 'react';
import { calculateRoute, calculateDistance } from '../services/mapsService';

/**
 * Hook for route optimization and planning
 * Implements nearest neighbor algorithm for route optimization
 */
export const useRouteOptimization = () => {
  const [route, setRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Calculate optimized route using nearest neighbor algorithm
   * @param {Array} clients - Array of client objects with location data
   * @param {Object} startLocation - Starting location {latitude, longitude}
   * @returns {Promise<Object>} Optimized route data
   */
  const optimizeRoute = useCallback(async (clients, startLocation = null) => {
    if (!clients || clients.length === 0) {
      setError('No clients provided');
      return null;
    }

    // Filter clients with valid locations
    const validClients = clients.filter(
      client => client.location?.latitude && client.location?.longitude
    );

    if (validClients.length === 0) {
      setError('No clients with valid locations');
      return null;
    }

    if (validClients.length === 1) {
      // Single client - no optimization needed
      return {
        clients: validClients,
        totalDistance: 0,
        totalDuration: 0,
      };
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Use nearest neighbor algorithm for route optimization
      const optimizedOrder = nearestNeighborTSP(
        validClients,
        startLocation || validClients[0].location
      );

      // Get waypoints from optimized order
      const waypoints = optimizedOrder.map(client => client.location);

      // Calculate route using Google Directions API
      const routeResult = await calculateRoute(waypoints, { optimize: true });

      if (routeResult.success) {
        const optimizedRoute = {
          clients: optimizedOrder,
          polyline: routeResult.route.polyline,
          coordinates: routeResult.route.coordinates,
          totalDistance: routeResult.route.distance,
          totalDuration: routeResult.route.duration,
          legs: routeResult.route.legs,
        };

        console.log('[ROUTE] Optimized route created:', {
          clientCount: optimizedRoute.clients.length,
          hasPolyline: !!optimizedRoute.polyline,
          hasCoordinates: !!optimizedRoute.coordinates,
          coordinateCount: optimizedRoute.coordinates?.length
        });

        setRoute(optimizedRoute);
        setIsCalculating(false);
        return optimizedRoute;
      } else {
        setError(routeResult.error || 'Failed to calculate route');
        setIsCalculating(false);
        return null;
      }
    } catch (err) {
      console.error('[ROUTE] Optimization error:', err);
      setError(err.message);
      setIsCalculating(false);
      return null;
    }
  }, []);

  /**
   * Calculate simple route without optimization
   * @param {Array} clients - Array of client objects in desired order
   * @returns {Promise<Object>} Route data
   */
  const calculateSimpleRoute = useCallback(async (clients) => {
    if (!clients || clients.length < 2) {
      setError('At least 2 clients required for route');
      return null;
    }

    const validClients = clients.filter(
      client => client.location?.latitude && client.location?.longitude
    );

    if (validClients.length < 2) {
      setError('At least 2 clients with valid locations required');
      return null;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const waypoints = validClients.map(client => client.location);
      const routeResult = await calculateRoute(waypoints, { optimize: false });

      if (routeResult.success) {
        const simpleRoute = {
          clients: validClients,
          polyline: routeResult.route.polyline,
          coordinates: routeResult.route.coordinates,
          totalDistance: routeResult.route.distance,
          totalDuration: routeResult.route.duration,
          legs: routeResult.route.legs,
        };

        console.log('[ROUTE] Simple route created:', {
          clientCount: simpleRoute.clients.length,
          hasPolyline: !!simpleRoute.polyline,
          hasCoordinates: !!simpleRoute.coordinates,
          coordinateCount: simpleRoute.coordinates?.length
        });

        setRoute(simpleRoute);
        setIsCalculating(false);
        return simpleRoute;
      } else {
        setError(routeResult.error || 'Failed to calculate route');
        setIsCalculating(false);
        return null;
      }
    } catch (err) {
      console.error('[ROUTE] Calculation error:', err);
      setError(err.message);
      setIsCalculating(false);
      return null;
    }
  }, []);

  /**
   * Clear current route
   */
  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return {
    route,
    isCalculating,
    error,
    optimizeRoute,
    calculateSimpleRoute,
    clearRoute,
  };
};

/**
 * Nearest Neighbor TSP algorithm for route optimization
 * @param {Array} clients - Array of clients with location data
 * @param {Object} startLocation - Starting location
 * @returns {Array} Optimized order of clients
 */
function nearestNeighborTSP(clients, startLocation) {
  if (clients.length <= 2) {
    return clients;
  }

  const unvisited = [...clients];
  const visited = [];
  let currentLocation = startLocation;

  while (unvisited.length > 0) {
    // Find nearest unvisited client
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    unvisited.forEach((client, index) => {
      const distance = calculateDistance(currentLocation, client.location);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    // Move nearest client to visited
    const nearestClient = unvisited.splice(nearestIndex, 1)[0];
    visited.push(nearestClient);
    currentLocation = nearestClient.location;
  }

  return visited;
}

export default useRouteOptimization;
