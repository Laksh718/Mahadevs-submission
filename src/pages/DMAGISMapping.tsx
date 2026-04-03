import React, { useEffect, useState } from "react";
import NDMALayout from "@/components/NDMALayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Layers,
  Satellite,
  Navigation,
  Shield,
  Users,
  Home,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  Filter,
  Search,
  MapIcon,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
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

// Mock data for demonstration
const mockTrainingEvents = [
  {
    id: "1",
    title: "Flood Rescue Training",
    type: "flood_rescue" as const,
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: "Central Delhi Training Center",
      district: "Central Delhi",
      state: "Delhi",
    },
    date: "2024-10-20",
    participants: 25,
    maxParticipants: 50,
    status: "upcoming" as const,
    organizingBody: "Delhi DMA",
  },
  {
    id: "2",
    title: "Community Awareness Program",
    type: "community_awareness" as const,
    location: {
      lat: 28.7041,
      lng: 77.1025,
      address: "Rohini Community Hall",
      district: "North West Delhi",
      state: "Delhi",
    },
    date: "2024-10-25",
    participants: 15,
    maxParticipants: 30,
    status: "ongoing" as const,
    organizingBody: "Delhi DMA",
  },
];

const mockShelters = [
  {
    id: "1",
    name: "Central Emergency Shelter",
    location: {
      lat: 28.65,
      lng: 77.23,
      address: "Connaught Place Emergency Center",
    },
    capacity: 500,
    currentOccupancy: 120,
    facilities: ["Medical", "Food", "Water", "Blankets"],
    status: "active" as const,
    lastInspection: "2024-10-10",
  },
  {
    id: "2",
    name: "North Delhi Shelter",
    location: {
      lat: 28.72,
      lng: 77.15,
      address: "Kashmere Gate Relief Center",
    },
    capacity: 300,
    currentOccupancy: 45,
    facilities: ["Medical", "Food", "Water"],
    status: "active" as const,
    lastInspection: "2024-10-08",
  },
];

interface LayerControls {
  trainingEvents: boolean;
  shelters: boolean;
  riskAreas: boolean;
  volunteerCoverage: boolean;
}

const DMAGISMapping = () => {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    eventType: "all",
    eventStatus: "all",
    district: "all",
  });
  const [layerControls, setLayerControls] = useState<LayerControls>({
    trainingEvents: true,
    shelters: true,
    riskAreas: true,
    volunteerCoverage: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const toggleLayer = (layer: keyof LayerControls) => {
    setLayerControls((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <NDMALayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span>DMA GIS Intelligence Center</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time geographical intelligence and mapping for district
              disaster management
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button>
              <MapIcon className="w-4 h-4 mr-2" />
              Full Screen Map
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Map Controls & Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <Select
                  value={selectedFilters.eventType}
                  onValueChange={(value) =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      eventType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="flood_rescue">Flood Rescue</SelectItem>
                    <SelectItem value="evacuation_drill">
                      Evacuation Drill
                    </SelectItem>
                    <SelectItem value="first_aid">First Aid</SelectItem>
                    <SelectItem value="community_awareness">
                      Community Awareness
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={selectedFilters.eventStatus}
                  onValueChange={(value) =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      eventStatus: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">District</label>
                <Select
                  value={selectedFilters.district}
                  onValueChange={(value) =>
                    setSelectedFilters((prev) => ({ ...prev, district: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="central_delhi">Central Delhi</SelectItem>
                    <SelectItem value="north_delhi">North Delhi</SelectItem>
                    <SelectItem value="south_delhi">South Delhi</SelectItem>
                    <SelectItem value="east_delhi">East Delhi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search locations..."
                    className="pl-10 pr-4 py-2 border rounded-md w-full text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Layer Controls */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={layerControls.trainingEvents ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLayer("trainingEvents")}
                className="flex items-center space-x-2"
              >
                {layerControls.trainingEvents ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>Training Events</span>
              </Button>
              <Button
                variant={layerControls.shelters ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLayer("shelters")}
                className="flex items-center space-x-2"
              >
                {layerControls.shelters ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>Shelters</span>
              </Button>
              <Button
                variant={layerControls.riskAreas ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLayer("riskAreas")}
                className="flex items-center space-x-2"
              >
                {layerControls.riskAreas ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>Risk Areas</span>
              </Button>
              <Button
                variant={
                  layerControls.volunteerCoverage ? "default" : "outline"
                }
                size="sm"
                onClick={() => toggleLayer("volunteerCoverage")}
                className="flex items-center space-x-2"
              >
                {layerControls.volunteerCoverage ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>Volunteer Coverage</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Map Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="w-5 h-5" />
                  District Intelligence Map
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                <div className="h-full w-full rounded-lg overflow-hidden">
                  <MapContainer
                    center={[28.6139, 77.209]} // Delhi coordinates
                    zoom={10}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0"
                  >
                    <LayersControl position="topright">
                      <LayersControl.BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                      </LayersControl.BaseLayer>
                      <LayersControl.BaseLayer name="Satellite">
                        <TileLayer
                          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                      </LayersControl.BaseLayer>

                      {/* Training Events Layer */}
                      {layerControls.trainingEvents && (
                        <LayersControl.Overlay checked name="Training Events">
                          <LayerGroup>
                            {mockTrainingEvents.map((event) => (
                              <Marker
                                key={event.id}
                                position={[
                                  event.location.lat,
                                  event.location.lng,
                                ]}
                                icon={L.icon({
                                  iconUrl:
                                    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                                  shadowUrl:
                                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                                  iconSize: [25, 41],
                                  iconAnchor: [12, 41],
                                  popupAnchor: [1, -34],
                                  shadowSize: [41, 41],
                                })}
                              >
                                <Popup>
                                  <div className="p-2">
                                    <h3 className="font-semibold text-sm">
                                      {event.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-1">
                                      {event.location.address}
                                    </p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Type:</span>
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {event.type.replace("_", " ")}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span>Status:</span>
                                        <Badge
                                          className={`text-xs ${getStatusColor(
                                            event.status
                                          )}`}
                                        >
                                          {event.status}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span>Participants:</span>
                                        <span>
                                          {event.participants}/
                                          {event.maxParticipants}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span>Date:</span>
                                        <span>
                                          {new Date(
                                            event.date
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </Popup>
                              </Marker>
                            ))}
                          </LayerGroup>
                        </LayersControl.Overlay>
                      )}

                      {/* Shelters Layer */}
                      {layerControls.shelters && (
                        <LayersControl.Overlay
                          checked
                          name="Emergency Shelters"
                        >
                          <LayerGroup>
                            {mockShelters.map((shelter) => (
                              <Marker
                                key={shelter.id}
                                position={[
                                  shelter.location.lat,
                                  shelter.location.lng,
                                ]}
                                icon={L.icon({
                                  iconUrl:
                                    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                                  shadowUrl:
                                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                                  iconSize: [25, 41],
                                  iconAnchor: [12, 41],
                                  popupAnchor: [1, -34],
                                  shadowSize: [41, 41],
                                })}
                              >
                                <Popup>
                                  <div className="p-2">
                                    <h3 className="font-semibold text-sm">
                                      {shelter.name}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-2">
                                      {shelter.location.address}
                                    </p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Capacity:</span>
                                        <span>
                                          {shelter.currentOccupancy}/
                                          {shelter.capacity}
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div
                                          className="bg-red-600 h-2 rounded-full"
                                          style={{
                                            width: `${
                                              (shelter.currentOccupancy /
                                                shelter.capacity) *
                                              100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span>Status:</span>
                                        <Badge
                                          className={`text-xs ${getStatusColor(
                                            shelter.status
                                          )}`}
                                        >
                                          {shelter.status}
                                        </Badge>
                                      </div>
                                      <div className="text-xs">
                                        <span className="font-medium">
                                          Facilities:
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {shelter.facilities.map(
                                            (facility, idx) => (
                                              <Badge
                                                key={idx}
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
                      )}

                      {/* Risk Areas Layer */}
                      {layerControls.riskAreas && (
                        <LayersControl.Overlay name="Risk Areas">
                          <LayerGroup>
                            <Marker
                              position={[28.65, 77.23]}
                              icon={L.icon({
                                iconUrl:
                                  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
                                shadowUrl:
                                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41],
                              })}
                            >
                              <Popup>
                                <div className="p-2">
                                  <h3 className="font-semibold text-sm">
                                    High Risk Area - Central Delhi
                                  </h3>
                                  <p className="text-xs text-gray-600 mb-1">
                                    Flood-prone zone near Yamuna River
                                  </p>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>Risk Level:</span>
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        High
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span>Population:</span>
                                      <span>~50,000</span>
                                    </div>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          </LayerGroup>
                        </LayersControl.Overlay>
                      )}
                    </LayersControl>
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information Panels */}
          <div className="space-y-4">
            {/* Statistics Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Training Events</span>
                  </div>
                  <Badge variant="secondary">{mockTrainingEvents.length}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Active Shelters</span>
                  </div>
                  <Badge variant="secondary">
                    {mockShelters.filter((s) => s.status === "active").length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Risk Areas</span>
                  </div>
                  <Badge variant="secondary">3</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Training Events List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  Active Training Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTrainingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge
                        className={getStatusColor(event.status)}
                        variant="secondary"
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {event.location.address}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {event.participants}/{event.maxParticipants}{" "}
                        participants
                      </span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shelter Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="w-5 h-5" />
                  Shelter Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockShelters.map((shelter) => (
                  <div key={shelter.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{shelter.name}</h4>
                      <Badge
                        className={getStatusColor(shelter.status)}
                        variant="secondary"
                      >
                        {shelter.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {shelter.location.address}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Capacity:</span>
                        <span>
                          {shelter.currentOccupancy}/{shelter.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (shelter.currentOccupancy / shelter.capacity) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {shelter.facilities.map((facility, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </NDMALayout>
  );
};

export default DMAGISMapping;
