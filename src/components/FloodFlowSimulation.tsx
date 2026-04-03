import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  floodPredictionService,
  LOCATION_COORDS,
  PredictionResponse,
} from "@/lib/floodPredictionService";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Force map to stay centered on SRM
const MapCenterController: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    // Force center on mount with exact SRM coordinates
    console.log("🗺️ MapCenterController: Forcing SRM center");
    map.setView([12.830732370295095, 80.04578928752656], 15);
  }, [map]);
  
  return null;
};

interface FlowPoint {
  lat: number;
  lng: number;
  intensity: number;
  direction: number; // in degrees
  speed: number;
  age: number; // how long this flow point has been active
}

interface FloodFlowSimulationProps {
  floodData: Array<{
    lat: number;
    lng: number;
    intensity: number;
    severity: string;
  }>;
  center?: [number, number];
  zoom?: number;
  height?: string;
  isPlaying?: boolean;
  speed?: number;
  showFlowVectors?: boolean;
  showFlowTrails?: boolean;
  usePredictionData?: boolean;
  adjustableRadius?: number;
}

// Component to handle flood flow simulation
const FloodFlowLayer: React.FC<{
  floodData: Array<{
    lat: number;
    lng: number;
    intensity: number;
    severity: string;
  }>;
  isPlaying: boolean;
  speed: number;
  showFlowVectors: boolean;
  showFlowTrails: boolean;
  usePredictionData: boolean;
  adjustableRadius?: number;
}> = ({
  floodData,
  isPlaying,
  speed,
  showFlowVectors,
  showFlowTrails,
  usePredictionData,
  adjustableRadius = 150,
}) => {
  const map = useMap();
  const flowPointsRef = useRef<FlowPoint[]>([]);
  const flowLayerRef = useRef<L.LayerGroup | null>(null);
  const trailLayerRef = useRef<L.LayerGroup | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const [predictionData, setPredictionData] = useState<PredictionResponse[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // FAKE DATA FOR SRM UNIVERSITY - Always available (EXACT SRM COORDINATES)
  const SRM_CENTER_LAT = 12.830732370295095;
  const SRM_CENTER_LNG = 80.04578928752656;
  
  const SRM_FAKE_DATA = [
    { lat: SRM_CENTER_LAT, lng: SRM_CENTER_LNG, intensity: 0.95, severity: "critical" },
    { lat: SRM_CENTER_LAT + 0.003, lng: SRM_CENTER_LNG + 0.003, intensity: 0.75, severity: "high" },
    { lat: SRM_CENTER_LAT - 0.003, lng: SRM_CENTER_LNG - 0.003, intensity: 0.70, severity: "high" },
    { lat: SRM_CENTER_LAT + 0.005, lng: SRM_CENTER_LNG - 0.002, intensity: 0.60, severity: "medium" },
    { lat: SRM_CENTER_LAT - 0.004, lng: SRM_CENTER_LNG + 0.004, intensity: 0.55, severity: "medium" },
  ];

  // Fetch prediction data for all supported locations
  const fetchPredictionData = async () => {
    if (!usePredictionData) return;

    setLoadingPredictions(true);
    try {
      console.log("Fetching flood prediction data for flow simulation...");
      const predictions: PredictionResponse[] = [];

      // Get predictions for all supported locations
      for (const [locationName, coords] of Object.entries(LOCATION_COORDS)) {
        try {
          const prediction = await floodPredictionService.predictRegionalRisk(
            locationName
          );
          predictions.push(prediction);
          console.log(
            `Prediction for ${locationName}:`,
            prediction.main_prediction
          );
        } catch (error) {
          console.error(`Failed to get prediction for ${locationName}:`, error);
        }
      }

      setPredictionData(predictions);
      console.log("Loaded prediction data:", predictions.length, "locations");
    } catch (error) {
      console.error("Error fetching prediction data:", error);
    } finally {
      setLoadingPredictions(false);
    }
  };

  // Convert prediction data to flow points
  const getPredictionFlowPoints = (): FlowPoint[] => {
    if (!usePredictionData || !predictionData.length) return [];

    const flowPoints: FlowPoint[] = [];

    predictionData.forEach((prediction) => {
      const locationName = prediction.main_prediction?.Location;
      if (!locationName || !LOCATION_COORDS[locationName]) return;

      const coords = LOCATION_COORDS[locationName];
      const riskLevel = prediction.main_prediction?.["Risk Level"];
      const confidence = parseFloat(
        prediction.main_prediction?.["Confidence"]?.replace("%", "") || "0"
      );

      // Convert risk level to intensity
      let intensity = 0;
      switch (riskLevel) {
        case "Critical":
          intensity = 0.9;
          break;
        case "High Risk":
          intensity = 0.7;
          break;
        case "Medium Risk":
          intensity = 0.5;
          break;
        case "Low Risk":
          intensity = 0.3;
          break;
        default:
          intensity = 0.1;
      }

      // Adjust intensity based on confidence
      intensity = intensity * (confidence / 100);

      // Only add points with significant risk
      if (intensity > 0.2) {
        flowPoints.push({
          lat: coords.lat,
          lng: coords.lon,
          intensity: intensity,
          direction: Math.random() * 360,
          speed: intensity * 0.002, // Higher speed for prediction data
          age: 0,
        });
      }
    });

    console.log("Generated flow points from predictions:", flowPoints.length);
    return flowPoints;
  };

  // Fetch prediction data when component mounts
  useEffect(() => {
    if (usePredictionData) {
      fetchPredictionData();
    }
  }, [usePredictionData]);

  // Initialize flow points from flood data or prediction data
  useEffect(() => {
    if (!map) return;
    
    // ALWAYS FORCE USE SRM FAKE DATA - IGNORE ALL INCOMING PROPS
    console.log("🚀 FORCE LOADING SRM FAKE DATA - IGNORING ALL CONDITIONS");
    console.log("Received floodData length:", floodData.length);
    console.log("BUT USING FAKE DATA INSTEAD");
    
    // Clear any existing data and FORCE SRM fake data with FIXED directions
    flowPointsRef.current = SRM_FAKE_DATA.map((point, index) => ({
      lat: point.lat,
      lng: point.lng,
      intensity: point.intensity,
      direction: 45 + (index * 72), // Fixed directions: 45°, 117°, 189°, 261°, 333°
      speed: point.intensity * 0.5, // Controlled speed based on intensity
      age: 0,
    }));
    
    console.log(`✅ LOADED ${flowPointsRef.current.length} FLOOD POINTS FOR SRM UNIVERSITY`);
    console.log("Sample SRM points:", flowPointsRef.current.slice(0, 3));
    
    // Immediately center on SRM with EXACT coordinates
    map.setView([12.830732370295095, 80.04578928752656], 15);
    console.log("📍 Map centered on SRM:", map.getCenter(), "Zoom:", map.getZoom());
    
    // Render immediately AND continuously
    updateFlowVisualization();
    console.log("🎨 Initial SRM visualization complete");
  }, [map]); // Remove dependencies on floodData, predictionData, etc

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !map) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current < 1000 / (speed * 10)) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastUpdateRef.current = timestamp;

      // Update flow points with smooth, controlled movement
      flowPointsRef.current = flowPointsRef.current.map((point) => {
        // Calculate new position based on direction and speed
        const distance = point.speed * speed;
        const radians = (point.direction * Math.PI) / 180;

        // Smooth flow movement
        const newLat = point.lat + Math.cos(radians) * distance * 0.00005;
        const newLng = point.lng + Math.sin(radians) * distance * 0.00005;

        // Age the point slowly
        const newAge = point.age + 1;

        // Keep intensity relatively stable (slow decay)
        const newIntensity = point.intensity * (1 - newAge * 0.0001);

        return {
          lat: newLat,
          lng: newLng,
          intensity: Math.max(0.3, newIntensity), // Minimum intensity
          direction: point.direction, // Keep direction consistent
          speed: point.speed,
          age: newAge,
        };
      });

      // Reset points that get too far or too old
      flowPointsRef.current = flowPointsRef.current.map((point, index) => {
        const originalPoint = SRM_FAKE_DATA[index % SRM_FAKE_DATA.length];
        const distance = Math.sqrt(
          Math.pow(point.lat - originalPoint.lat, 2) +
          Math.pow(point.lng - originalPoint.lng, 2)
        );

        // Reset if too far (>0.01 degrees ~1.1km) or too old
        if (distance > 0.01 || point.age > 500) {
          return {
            lat: originalPoint.lat,
            lng: originalPoint.lng,
            intensity: originalPoint.intensity,
            direction: 45 + (index * 72),
            speed: originalPoint.intensity * 0.5,
            age: 0,
          };
        }
        return point;
      });

      // Update visualization
      updateFlowVisualization();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, speed, map, floodData, adjustableRadius]);

  const updateFlowVisualization = () => {
    if (!map) {
      console.warn("❌ No map available for visualization");
      return;
    }

    console.log("🎨 RENDERING CIRCLES:", {
      pointCount: flowPointsRef.current.length,
      mapCenter: map.getCenter(),
      mapZoom: map.getZoom(),
      samplePoint: flowPointsRef.current[0]
    });

    // Remove existing layers
    if (flowLayerRef.current) {
      flowLayerRef.current.remove();
    }
    if (trailLayerRef.current) {
      trailLayerRef.current.remove();
    }

    // Create new flow layer
    const flowLayer = L.layerGroup();
    const trailLayer = L.layerGroup();

    console.log("Updating flow visualization with", flowPointsRef.current.length, "points");

    flowPointsRef.current.forEach((point, index) => {
      if (point.intensity < 0.1) return;

      // Get border color based on intensity (severity)
      const getBorderColor = (intensity: number) => {
        if (intensity > 0.7) return "#DC2626"; // Red for critical
        if (intensity > 0.5) return "#F59E0B"; // Orange for high
        if (intensity > 0.3) return "#3B82F6"; // Blue for medium
        return "#22C55E"; // Green for low
      };

      // Use adjustableRadius prop (50-500m range)
      const baseRadius = adjustableRadius || 150;
      const radius = Math.max(point.intensity * baseRadius, baseRadius * 0.5);
      const fillColor = getFlowColor(point.intensity, point.age);
      const borderColor = getBorderColor(point.intensity);

      console.log(`Circle ${index}:`, {
        lat: point.lat,
        lng: point.lng,
        radius,
        adjustableRadius,
        fillColor,
        borderColor,
        intensity: point.intensity
      });

      // Create flow circle with adjustable size
      const circle = L.circle([point.lat, point.lng], {
        radius: radius, // Adjustable radius based on slider
        fillColor: fillColor,
        fillOpacity: 0.6, // Visible but not overwhelming
        color: borderColor, // Dynamic border color based on severity
        weight: 2, // Thinner border
      });

      flowLayer.addLayer(circle);
      console.log(`✅ Added circle ${index} to layer`);

      // Create flow vector if enabled (HIGHLY VISIBLE)
      if (showFlowVectors) {
        const vectorLength = 0.006; // Much longer vector for visibility
        const endLat =
          point.lat + Math.cos((point.direction * Math.PI) / 180) * vectorLength;
        const endLng =
          point.lng + Math.sin((point.direction * Math.PI) / 180) * vectorLength;

        // Arrow line with high contrast
        const line = L.polyline(
          [
            [point.lat, point.lng],
            [endLat, endLng],
          ],
          {
            color: '#FFFFFF', // White for maximum visibility
            weight: 4,
            opacity: 1,
          }
        );

        // Large arrow head
        const arrowHead = L.circleMarker([endLat, endLng], {
          radius: 8,
          fillColor: '#FFFF00', // Yellow for high contrast
          fillOpacity: 1,
          color: '#000000', // Black border
          weight: 2,
        });

        flowLayer.addLayer(line);
        flowLayer.addLayer(arrowHead);
      }

      // Create flow trail if enabled
      if (showFlowTrails && point.age > 10) {
        const trailLength = Math.min(point.age, 50);
        const trailPoints = [];

        for (let i = 0; i < trailLength; i++) {
          const trailAge = point.age - i;
          const trailIntensity = point.intensity * (1 - trailAge * 0.001);
          const trailLat =
            point.lat -
            Math.cos((point.direction * Math.PI) / 180) * i * 0.0001;
          const trailLng =
            point.lng -
            Math.sin((point.direction * Math.PI) / 180) * i * 0.0001;

          trailPoints.push([trailLat, trailLng]);
        }

        if (trailPoints.length > 1) {
          const trail = L.polyline(trailPoints, {
            color: getFlowColor(point.intensity, point.age),
            weight: 1,
            opacity: 0.3,
          });

          trailLayer.addLayer(trail);
        }
      }
    });

    // Add layers to map
    flowLayerRef.current = flowLayer;
    trailLayerRef.current = trailLayer;

    if (showFlowTrails) {
      trailLayer.addTo(map);
      console.log("✅ Added trail layer to map");
    }
    flowLayer.addTo(map);
    console.log("✅ Added flow layer to map with", flowPointsRef.current.length, "circles");
  };

  const getFlowColor = (intensity: number, age: number): string => {
    // Color based on intensity and age
    const alpha = Math.min(1, intensity);
    const ageFactor = Math.max(0.3, 1 - age * 0.001);

    if (intensity > 0.7) {
      return `rgba(220, 38, 38, ${alpha * ageFactor})`; // Red
    } else if (intensity > 0.4) {
      return `rgba(245, 158, 11, ${alpha * ageFactor})`; // Orange
    } else if (intensity > 0.2) {
      return `rgba(59, 130, 246, ${alpha * ageFactor})`; // Blue
    } else {
      return `rgba(34, 197, 94, ${alpha * ageFactor})`; // Green
    }
  };

  return null;
};

const FloodFlowSimulation: React.FC<FloodFlowSimulationProps> = ({
  floodData,
  center = [12.8230, 80.0440], // Ignored - always use SRM
  zoom = 15, // Ignored - always use SRM zoom
  height = "500px",
  isPlaying = false,
  speed = 1,
  showFlowVectors = true,
  showFlowTrails = true,
  usePredictionData = false,
  adjustableRadius = 150,
}) => {
  // FORCE SRM University location - ignore all props (EXACT COORDINATES)
  const SRM_CENTER: [number, number] = [12.830732370295095, 80.04578928752656];
  const SRM_ZOOM = 15;

  return (
    <div
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden border"
    >
      <MapContainer
        center={SRM_CENTER}
        zoom={SRM_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterController />
        <FloodFlowLayer
          floodData={floodData}
          isPlaying={isPlaying}
          speed={speed}
          showFlowVectors={showFlowVectors}
          showFlowTrails={showFlowTrails}
          usePredictionData={usePredictionData}
          adjustableRadius={adjustableRadius}
        />
      </MapContainer>
    </div>
  );
};

export default FloodFlowSimulation;
