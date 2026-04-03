import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Ensure leaflet.heat is properly loaded
declare module "leaflet" {
  namespace L {
    function heatLayer(latlngs: [number, number, number][], options?: any): any;
  }
}

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

interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number;
}

interface HeatmapMapProps {
  data: HeatmapData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  radius?: number;
  blur?: number;
  minOpacity?: number;
  maxIntensity?: number;
  gradient?: Record<number, string>;
  fitToData?: boolean;
  showMarkersOnZoom?: boolean;
  markersZoomThreshold?: number;
  animate?: boolean;
  animationDurationMs?: number;
}

// Component to handle heatmap layer
const HeatmapLayer: React.FC<{
  data: HeatmapData[];
  radius: number;
  blur: number;
  minOpacity: number;
  maxIntensity?: number;
  gradient?: Record<number, string>;
  fitToData: boolean;
  showMarkersOnZoom: boolean;
  markersZoomThreshold: number;
}> = ({
  data,
  radius,
  blur,
  minOpacity,
  maxIntensity,
  gradient,
  fitToData,
  showMarkersOnZoom,
  markersZoomThreshold,
}) => {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    console.log("HeatmapLayer useEffect - data:", data.length, "points");
    console.log("Sample data points:", data.slice(0, 3));

    if (!map || !data.length) {
      console.log("No map or no data, returning");
      return;
    }

    // Convert data to format expected by leaflet.heat
    const heatData = data.map(
      (point) =>
        [point.lat, point.lng, point.intensity] as [number, number, number]
    );

    console.log("Heat data for leaflet.heat:", heatData.slice(0, 3));

    // Remove existing heat layer if it exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Adjust radius/blur with zoom for geographic consistency
    const currentZoom = map.getZoom();
    const zoomScale = Math.pow(2, (currentZoom - 10) / 2);
    const effectiveRadius = Math.max(5, Math.round(radius * zoomScale));
    const effectiveBlur = Math.max(5, Math.round(blur * Math.sqrt(zoomScale)));

    // For very low zoom levels (All Reports scope), use smaller minimum values
    const minRadius = currentZoom < 7 ? 20 : 5;
    const minBlur = currentZoom < 7 ? 15 : 5;
    const finalRadius = Math.max(minRadius, effectiveRadius);
    const finalBlur = Math.max(minBlur, effectiveBlur);

    // Darker gradient without green (blue to red)
    const terrainGradient = gradient || {
      0.0: "rgba(0,0,0,0)",
      0.2: "#1e40af", // Dark blue
      0.4: "#3b82f6", // Blue
      0.6: "#f59e0b", // Amber
      0.8: "#f97316", // Orange
      1.0: "#dc2626", // Dark red
    };

    // Create new heat layer
    const heatLayerOptions = {
      radius: finalRadius,
      blur: finalBlur,
      maxZoom: 18,
      gradient: terrainGradient,
      minOpacity: Math.min(0.7, Math.max(0.4, minOpacity)),
      max: maxIntensity ?? Math.max(...data.map((d) => d.intensity)),
    };

    console.log("Heat layer options:", heatLayerOptions);
    console.log("Effective radius:", finalRadius, "blur:", finalBlur);
    console.log("Max intensity:", heatLayerOptions.max);

    try {
      // Check if leaflet.heat is available
      if (!(L as any).heatLayer) {
        console.error("leaflet.heat plugin not available");
        return;
      }

      const heatLayer = (L as any).heatLayer(heatData, heatLayerOptions);

      console.log("Heat layer created:", heatLayer);

      heatLayerRef.current = heatLayer;
      map.addLayer(heatLayer);

      console.log("Heat layer added to map");
    } catch (error) {
      console.error("Error creating heat layer:", error);
    }

    // Optionally fit map to show all data points
    if (fitToData && data.length > 0) {
      const group = new L.FeatureGroup();
      data.forEach((point) => {
        L.marker([point.lat, point.lng]).addTo(group);
      });
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Cleanup function
    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
      if (markerLayerRef.current) {
        map.removeLayer(markerLayerRef.current);
      }
    };
  }, [
    map,
    data,
    radius,
    blur,
    minOpacity,
    maxIntensity,
    gradient,
    fitToData,
    showMarkersOnZoom,
    markersZoomThreshold,
  ]);

  // Optional markers when zoomed in
  useMapEvents({
    zoomend: () => {
      if (!showMarkersOnZoom) return;
      const currentZoom = map.getZoom();
      if (currentZoom >= markersZoomThreshold) {
        // show markers
        if (markerLayerRef.current) {
          map.removeLayer(markerLayerRef.current);
        }
        const layer = L.layerGroup();
        data.forEach((p) => {
          L.circleMarker([p.lat, p.lng], {
            radius: 4,
            color: "#1f2937",
            weight: 1,
            fillColor: "#3b82f6",
            fillOpacity: 0.7,
          }).addTo(layer);
        });
        markerLayerRef.current = layer;
        layer.addTo(map);
      } else {
        // hide markers
        if (markerLayerRef.current) {
          map.removeLayer(markerLayerRef.current);
          markerLayerRef.current = null;
        }
      }
    },
  });

  return null;
};

const HeatmapMap: React.FC<HeatmapMapProps> = ({
  data,
  center = [20.5937, 78.9629], // Default to India center
  zoom = 6,
  height = "400px",
  radius = 25,
  blur = 15,
  minOpacity = 0.3,
  maxIntensity,
  gradient,
  fitToData = true,
  showMarkersOnZoom = true,
  markersZoomThreshold = 13,
  animate = true,
  animationDurationMs = 1200,
}) => {
  const [animatedData, setAnimatedData] = useState<HeatmapData[]>(data);

  useEffect(() => {
    if (!animate || !data || data.length === 0) {
      setAnimatedData(data);
      return;
    }
    let cancelled = false;
    const sorted = [...data].sort((a, b) => b.intensity - a.intensity);
    const total = sorted.length;
    const steps = Math.min(total, 30);
    const batchSize = Math.ceil(total / steps);
    const intervalMs = Math.max(30, Math.floor(animationDurationMs / steps));

    let index = 0;
    setAnimatedData([]);
    const timer = setInterval(() => {
      if (cancelled) return;
      index += batchSize;
      setAnimatedData(sorted.slice(0, Math.min(index, total)));
      if (index >= total) {
        clearInterval(timer);
      }
    }, intervalMs);

    return () => {
      cancelled = true;
    };
  }, [animate, data, animationDurationMs]);

  return (
    <div
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden border"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer
          data={animate ? animatedData : data}
          radius={radius}
          blur={blur}
          minOpacity={minOpacity}
          maxIntensity={maxIntensity}
          gradient={gradient}
          fitToData={fitToData}
          showMarkersOnZoom={showMarkersOnZoom}
          markersZoomThreshold={markersZoomThreshold}
        />
      </MapContainer>
    </div>
  );
};

export default HeatmapMap;
