import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
  Polygon,
} from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Shield,
  Users,
  Home,
  AlertTriangle,
  MapPin,
  Eye,
  EyeOff,
  Download,
  Layers,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface TrainingEvent {
  id: string;
  title: string;
  type:
    | "flood_rescue"
    | "evacuation_drill"
    | "first_aid"
    | "community_awareness";
  location: {
    lat: number;
    lng: number;
    address: string;
    district: string;
    state: string;
  };
  date: string;
  participants: number;
  maxParticipants: number;
  status: "upcoming" | "ongoing" | "completed";
  organizingBody: string;
}

interface ShelterPoint {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  capacity: number;
  currentOccupancy: number;
  facilities: string[];
  status: "active" | "inactive" | "maintenance";
  lastInspection: string;
}

interface RescueZone {
  id: string;
  name: string;
  coordinates: [number, number][];
  riskLevel: "low" | "medium" | "high" | "critical";
  population: number;
  volunteers: number;
  lastDrill: string;
  evacuationRoutes: number;
}

interface LayerControls {
  trainingEvents: boolean;
  shelters: boolean;
  rescueZones: boolean;
  riskAreas: boolean;
  volunteerCoverage: boolean;
}

export const EnhancedTrainingGISMap: React.FC = () => {
  const [trainingEvents, setTrainingEvents] = useState<TrainingEvent[]>([]);
  const [shelterPoints, setShelterPoints] = useState<ShelterPoint[]>([]);
  const [rescueZones, setRescueZones] = useState<RescueZone[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    eventType: "all",
    status: "all",
    dateRange: "all",
  });

  const [layerVisibility, setLayerVisibility] = useState<LayerControls>({
    trainingEvents: true,
    shelters: true,
    rescueZones: true,
    riskAreas: false,
    volunteerCoverage: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sample training events
      setTrainingEvents([
        {
          id: "1",
          title: "Flood Rescue Training Workshop",
          type: "flood_rescue",
          location: {
            lat: 28.6139,
            lng: 77.209,
            address: "India Gate, New Delhi",
            district: "New Delhi",
            state: "Delhi",
          },
          date: "2024-11-15",
          participants: 45,
          maxParticipants: 60,
          status: "upcoming",
          organizingBody: "Delhi SDMA",
        },
        {
          id: "2",
          title: "Community Evacuation Drill",
          type: "evacuation_drill",
          location: {
            lat: 19.076,
            lng: 72.8777,
            address: "Marine Drive, Mumbai",
            district: "Mumbai",
            state: "Maharashtra",
          },
          date: "2024-11-12",
          participants: 120,
          maxParticipants: 150,
          status: "ongoing",
          organizingBody: "Mumbai DDMA",
        },
        {
          id: "3",
          title: "First Aid Response Training",
          type: "first_aid",
          location: {
            lat: 22.5726,
            lng: 88.3639,
            address: "Victoria Memorial, Kolkata",
            district: "Kolkata",
            state: "West Bengal",
          },
          date: "2024-11-08",
          participants: 80,
          maxParticipants: 80,
          status: "completed",
          organizingBody: "Red Cross Society",
        },
      ]);

      // Sample shelter points
      setShelterPoints([
        {
          id: "s1",
          name: "Central Community Shelter",
          location: {
            lat: 28.65,
            lng: 77.23,
            address: "Connaught Place, Delhi",
          },
          capacity: 500,
          currentOccupancy: 0,
          facilities: [
            "Medical Facility",
            "Kitchen",
            "Sanitation",
            "Communication",
          ],
          status: "active",
          lastInspection: "2024-10-15",
        },
        {
          id: "s2",
          name: "Riverside Emergency Shelter",
          location: {
            lat: 19.1,
            lng: 72.9,
            address: "Andheri East, Mumbai",
          },
          capacity: 300,
          currentOccupancy: 25,
          facilities: ["Medical Facility", "Kitchen", "Sanitation"],
          status: "active",
          lastInspection: "2024-10-20",
        },
      ]);

      // Sample rescue zones
      setRescueZones([
        {
          id: "rz1",
          name: "Yamuna Flood Plain",
          coordinates: [
            [28.6, 77.2],
            [28.62, 77.25],
            [28.64, 77.23],
            [28.62, 77.18],
          ],
          riskLevel: "high",
          population: 15000,
          volunteers: 45,
          lastDrill: "2024-09-15",
          evacuationRoutes: 3,
        },
      ]);
    } catch (error) {
      console.error("Error loading map data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use default Leaflet markers - can be enhanced later with custom icons

  const getRiskColor = (level: string) => {
    const colors = {
      low: "#10B981",
      medium: "#F59E0B",
      high: "#EF4444",
      critical: "#DC2626",
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  const toggleLayer = (layer: keyof LayerControls) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const exportMapData = () => {
    const mapData = {
      trainingEvents,
      shelterPoints,
      rescueZones,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(mapData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jalrakshak_map_data_${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">
            Loading enhanced GIS mapping system...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                JalRakshak GIS Intelligence
              </h1>
              <p className="text-gray-600">
                Comprehensive Training & Response Mapping System
              </p>
            </div>
          </div>
          <Button
            onClick={exportMapData}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Map Data</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Layer Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="h-5 w-5" />
                <span>Layer Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(layerVisibility).map(([layer, visible]) => (
                <div key={layer} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {layer.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayer(layer as keyof LayerControls)}
                    className={`p-1 ${
                      visible ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Active Training Events
                </span>
                <Badge variant="secondary">
                  {
                    trainingEvents.filter((e) => e.status !== "completed")
                      .length
                  }
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Operational Shelters
                </span>
                <Badge variant="secondary">
                  {shelterPoints.filter((s) => s.status === "active").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Risk Zones Monitored
                </span>
                <Badge variant="secondary">{rescueZones.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Total Participants
                </span>
                <Badge variant="secondary">
                  {trainingEvents.reduce((acc, e) => acc + e.participants, 0)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Training Events</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Flood Rescue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Evacuation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>First Aid</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Awareness</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Risk Levels</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Low Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>High Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-700 rounded"></div>
                    <span>Critical Risk</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="h-[800px] w-full rounded-lg overflow-hidden">
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <LayersControl position="topright">
                    {/* Training Events Layer */}
                    <LayersControl.Overlay
                      checked={layerVisibility.trainingEvents}
                      name="Training Events"
                    >
                      <LayerGroup>
                        {trainingEvents.map((event) => (
                          <Marker
                            key={event.id}
                            position={[event.location.lat, event.location.lng]}
                          >
                            <Popup>
                              <div className="p-2 min-w-[250px]">
                                <h3 className="font-bold text-sm">
                                  {event.title}
                                </h3>
                                <p className="text-xs text-gray-600 mb-2">
                                  {event.location.address}
                                </p>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Date:</span>
                                    <span>{event.date}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Participants:</span>
                                    <span>
                                      {event.participants}/
                                      {event.maxParticipants}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Status:</span>
                                    <Badge
                                      variant={
                                        event.status === "completed"
                                          ? "secondary"
                                          : "default"
                                      }
                                      className="text-xs"
                                    >
                                      {event.status}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Organizer:</span>
                                    <span className="font-medium">
                                      {event.organizingBody}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </LayerGroup>
                    </LayersControl.Overlay>

                    {/* Shelter Points Layer */}
                    <LayersControl.Overlay
                      checked={layerVisibility.shelters}
                      name="Emergency Shelters"
                    >
                      <LayerGroup>
                        {shelterPoints.map((shelter) => (
                          <Marker
                            key={shelter.id}
                            position={[
                              shelter.location.lat,
                              shelter.location.lng,
                            ]}
                          >
                            <Popup>
                              <div className="p-2 min-w-[250px]">
                                <h3 className="font-bold text-sm">
                                  {shelter.name}
                                </h3>
                                <p className="text-xs text-gray-600 mb-2">
                                  {shelter.location.address}
                                </p>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Capacity:</span>
                                    <span>{shelter.capacity} people</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Current Occupancy:</span>
                                    <span>
                                      {shelter.currentOccupancy} people
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Status:</span>
                                    <Badge
                                      variant={
                                        shelter.status === "active"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {shelter.status}
                                    </Badge>
                                  </div>
                                  <div className="text-xs">
                                    <span className="font-medium">
                                      Facilities:
                                    </span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {shelter.facilities.map(
                                        (facility, index) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {facility}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </LayerGroup>
                    </LayersControl.Overlay>

                    {/* Rescue Zones Layer */}
                    <LayersControl.Overlay
                      checked={layerVisibility.rescueZones}
                      name="Risk Zones"
                    >
                      <LayerGroup>
                        {rescueZones.map((zone) => (
                          <Polygon
                            key={zone.id}
                            positions={zone.coordinates}
                            pathOptions={{
                              color: getRiskColor(zone.riskLevel),
                              fillColor: getRiskColor(zone.riskLevel),
                              fillOpacity: 0.3,
                              weight: 3,
                            }}
                          >
                            <Popup>
                              <div className="p-2 min-w-[250px]">
                                <h3 className="font-bold text-sm">
                                  {zone.name}
                                </h3>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Risk Level:</span>
                                    <Badge
                                      className={`text-xs ${
                                        zone.riskLevel === "critical"
                                          ? "bg-red-600"
                                          : zone.riskLevel === "high"
                                          ? "bg-red-500"
                                          : zone.riskLevel === "medium"
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                      }`}
                                    >
                                      {zone.riskLevel.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Population:</span>
                                    <span>
                                      {zone.population.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Volunteers:</span>
                                    <span>{zone.volunteers}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Last Drill:</span>
                                    <span>{zone.lastDrill}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span>Evacuation Routes:</span>
                                    <span>{zone.evacuationRoutes}</span>
                                  </div>
                                </div>
                              </div>
                            </Popup>
                          </Polygon>
                        ))}
                      </LayerGroup>
                    </LayersControl.Overlay>
                  </LayersControl>
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
