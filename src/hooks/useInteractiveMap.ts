import { useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { graphHopperService, GraphHopperPoint } from '@/services/graphhopper';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: 'origin' | 'waypoint' | 'destination';
  label?: string;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  points: GraphHopperPoint[];
  instructions: Array<{
    text: string;
    distance: number;
    time: number;
  }>;
}

export interface InteractiveMapState {
  points: MapPoint[];
  routes: RouteInfo[];
  isCalculating: boolean;
  showInstructions: boolean;
}

export const useInteractiveMap = () => {
  const [state, setState] = useState<InteractiveMapState>({
    points: [],
    routes: [],
    isCalculating: false,
    showInstructions: false
  });

  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);

  // Add point to map
  const addPoint = useCallback((lat: number, lng: number, type: MapPoint['type'], label?: string) => {
    const newPoint: MapPoint = {
      id: `point-${Date.now()}`,
      lat,
      lng,
      type,
      label
    };

    setState(prev => ({
      ...prev,
      points: [...prev.points, newPoint]
    }));

    return newPoint;
  }, []);

  // Remove point from map
  const removePoint = useCallback((pointId: string) => {
    setState(prev => ({
      ...prev,
      points: prev.points.filter(p => p.id !== pointId)
    }));
  }, []);

  // Clear all points
  const clearPoints = useCallback(() => {
    setState(prev => ({
      ...prev,
      points: [],
      routes: []
    }));
  }, []);

  // Calculate precise route between points for rescue operations
  const calculateRoute = useCallback(async () => {
    if (state.points.length < 2) {
      throw new Error('At least 2 points are required for route calculation');
    }

    setState(prev => ({ ...prev, isCalculating: true }));

    try {
      const graphHopperPoints: GraphHopperPoint[] = state.points.map(p => ({
        lat: p.lat,
        lng: p.lng
      }));

      console.log('Calculating precise rescue route for points:', graphHopperPoints);

      // Use the specialized rescue route method for better precision
      const response = await graphHopperService.calculateRescueRoute(graphHopperPoints);

      console.log('Precise rescue route response:', response);

      const routes: RouteInfo[] = response.paths.map(path => {
        console.log('Processing precise path:', path);
        const decodedPoints = graphHopperService.decodePolyline(path.points);
        console.log('Decoded precise points:', decodedPoints);
        
        return {
          distance: graphHopperService.formatDistance(path.distance),
          duration: graphHopperService.formatDuration(path.time),
          points: decodedPoints,
          instructions: path.instructions || []
        };
      });

      console.log('Final precise routes:', routes);

      setState(prev => ({
        ...prev,
        routes,
        isCalculating: false
      }));

      return routes;
    } catch (error) {
      console.error('Precise route calculation error:', error);
      setState(prev => ({ ...prev, isCalculating: false }));
      throw error;
    }
  }, [state.points]);

  // Optimize route (TSP) for rescue operations with precise optimization
  const optimizeRoute = useCallback(async () => {
    if (state.points.length < 3) {
      throw new Error('At least 3 points are required for route optimization');
    }

    setState(prev => ({ ...prev, isCalculating: true }));

    try {
      const graphHopperPoints: GraphHopperPoint[] = state.points.map(p => ({
        lat: p.lat,
        lng: p.lng
      }));

      console.log('Optimizing precise rescue route for points:', graphHopperPoints);

      // Use the specialized rescue route method with optimization enabled
      const response = await graphHopperService.calculateRescueRoute(graphHopperPoints);
      
      console.log('Optimized rescue route response:', response);

      const routes: RouteInfo[] = response.paths.map(path => {
        console.log('Processing optimized path:', path);
        const decodedPoints = graphHopperService.decodePolyline(path.points);
        console.log('Decoded optimized points:', decodedPoints);
        
        return {
          distance: graphHopperService.formatDistance(path.distance),
          duration: graphHopperService.formatDuration(path.time),
          points: decodedPoints,
          instructions: path.instructions || []
        };
      });

      console.log('Final optimized routes:', routes);

      setState(prev => ({
        ...prev,
        routes,
        isCalculating: false
      }));

      return routes;
    } catch (error) {
      console.error('Route optimization error:', error);
      setState(prev => ({ ...prev, isCalculating: false }));
      throw error;
    }
  }, [state.points]);

  // Toggle instructions visibility
  const toggleInstructions = useCallback(() => {
    setState(prev => ({ ...prev, showInstructions: !prev.showInstructions }));
  }, []);

  // Get point by type
  const getPointByType = useCallback((type: MapPoint['type']) => {
    return state.points.find(p => p.type === type);
  }, [state.points]);

  // Reorder points for optimization
  const reorderPoints = useCallback((newOrder: string[]) => {
    const reorderedPoints = newOrder
      .map(id => state.points.find(p => p.id === id))
      .filter(Boolean) as MapPoint[];

    setState(prev => ({
      ...prev,
      points: reorderedPoints
    }));
  }, [state.points]);

  return {
    ...state,
    addPoint,
    removePoint,
    clearPoints,
    calculateRoute,
    optimizeRoute,
    toggleInstructions,
    getPointByType,
    reorderPoints,
    mapRef,
    markersRef,
    polylinesRef
  };
};