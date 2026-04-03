export interface MapConfig {
  center: [number, number];
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

export const defaultMapConfig: MapConfig = {
  center: [20.5937, 78.9629],
  zoom: 5,
  minZoom: 4,
  maxZoom: 18,
};

export const stateMapConfigs: Record<string, MapConfig> = {
  Punjab: {
    center: [31.1471, 75.3412],
    zoom: 8,
    minZoom: 6,
    maxZoom: 18,
  },
  Haryana: {
    center: [29.0588, 76.0856],
    zoom: 8,
    minZoom: 6,
    maxZoom: 18,
  },
  "Tamil Nadu": {
    center: [11.1271, 78.6569],
    zoom: 7,
    minZoom: 6,
    maxZoom: 18,
  },
  Kerala: {
    center: [10.8505, 76.2711],
    zoom: 8,
    minZoom: 6,
    maxZoom: 18,
  },
  Maharashtra: {
    center: [19.7515, 75.7139],
    zoom: 7,
    minZoom: 6,
    maxZoom: 18,
  },
};

export const getMapConfigForState = (state: string): MapConfig => {
  return stateMapConfigs[state] || defaultMapConfig;
};

export const markerIcons = {
  flood: {
    iconUrl: '/markers/flood.png',
    iconSize: [32, 32] as [number, number],
    iconAnchor: [16, 32] as [number, number],
    popupAnchor: [0, -32] as [number, number],
  },
  shelter: {
    iconUrl: '/markers/shelter.png',
    iconSize: [32, 32] as [number, number],
    iconAnchor: [16, 32] as [number, number],
    popupAnchor: [0, -32] as [number, number],
  },
  user: {
    iconUrl: '/markers/user.png',
    iconSize: [24, 24] as [number, number],
    iconAnchor: [12, 24] as [number, number],
    popupAnchor: [0, -24] as [number, number],
  },
  alert: {
    iconUrl: '/markers/alert.png',
    iconSize: [28, 28] as [number, number],
    iconAnchor: [14, 28] as [number, number],
    popupAnchor: [0, -28] as [number, number],
  },
};

export const getSeverityColor = (severity: string): string => {
  const colorMap: Record<string, string> = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#7C2D12',
  };
  return colorMap[severity.toLowerCase()] || '#6B7280';
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: '#F59E0B',
    in_progress: '#3B82F6',
    resolved: '#10B981',
    verified: '#8B5CF6',
    rejected: '#EF4444',
  };
  return colorMap[status.toLowerCase()] || '#6B7280';
};
