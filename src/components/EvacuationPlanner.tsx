import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { decodePolyline, getNearestShelter, getSafeRoute } from "@/lib/routing";
import { INDIAN_SHELTERS, INDIAN_FLOOD_ZONES } from "@/lib/indianShelterData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, ExternalLink, AlertTriangle } from "lucide-react";
import AreaSelector from "./AreaSelector";

const shelterIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const startIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map click handler component
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type Props = {
  start?: { lat: number; lon: number };
};

const EvacuationPlanner = ({ start }: Props) => {
  const [current, setCurrent] = useState<{ lat: number; lon: number } | null>(start || null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [blocked, setBlocked] = useState<[number, number][][]>([]);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [shelter, setShelter] = useState<{ name: string; lat: number; lon: number; capacity_available: number; shelter_id?: string } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [directions, setDirections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance_km: number; duration_min: number } | null>(null);
  const [allShelters, setAllShelters] = useState<any[]>([]);
  const [floodZones, setFloodZones] = useState<any[]>([]);

  // Initialize data
  useEffect(() => {
    setAllShelters(INDIAN_SHELTERS);
    setFloodZones(INDIAN_FLOOD_ZONES);
  }, []);

  // Derive default start from browser geolocation if not provided
  useEffect(() => {
    if (!current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrent({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setCurrent({ lat: 28.6139, lon: 77.2090 }) // Default to Delhi center
      );
    }
  }, [current]);

  // Handle area selection
  const handleAreaSelect = (location: string, coords: { lat: number; lon: number; state: string }) => {
    setSelectedArea(location);
    setCurrent({ lat: coords.lat, lon: coords.lon });
    setSelectedLocation({ lat: coords.lat, lon: coords.lon });
    
    // Filter shelters and flood zones for the selected area
    const areaShelters = INDIAN_SHELTERS.filter(shelter => 
      shelter.state === coords.state || shelter.district === location
    );
    setAllShelters(areaShelters.length > 0 ? areaShelters : INDIAN_SHELTERS);
    
    const areaFloodZones = INDIAN_FLOOD_ZONES.filter(zone => 
      zone.state === coords.state || zone.district === location
    );
    setFloodZones(areaFloodZones.length > 0 ? areaFloodZones : INDIAN_FLOOD_ZONES);
    
    // Update blocked roads based on flood zones
    const blockedRoads = areaFloodZones.flatMap(zone => zone.coordinates);
    setBlocked(blockedRoads.length > 0 ? [blockedRoads] : []);
  };

  // Handle map click for location selection
  const handleMapClick = (lat: number, lon: number) => {
    setSelectedLocation({ lat, lon });
    setCurrent({ lat, lon });
  };

  // Fetch route when location changes
  const fetchRoute = async (start: { lat: number; lon: number }) => {
    setIsLoading(true);
    try {
      const nearest = await getNearestShelter(start);
      setShelter(nearest.shelter);
      const res = await getSafeRoute(start, { lat: nearest.shelter.lat, lon: nearest.shelter.lon });
      setWarnings(res.warnings || []);
      setDirections(res.route.steps || []);
      setRoutePoints(decodePolyline(res.route.polyline));
      setRouteInfo({
        distance_km: res.route.distance_km,
        duration_min: res.route.duration_min
      });
    } catch (error) {
      console.error("Failed to fetch route:", error);
      setWarnings(["Failed to fetch route. Using offline data."]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch route when current location changes
  useEffect(() => {
    if (current) {
      fetchRoute(current);
    }
  }, [current?.lat, current?.lon]);

  // Open Google Maps with directions
  const openGoogleMaps = (start: { lat: number; lon: number }, destination: { lat: number; lon: number }) => {
    const url = `https://www.google.com/maps/dir/${start.lat},${start.lon}/${destination.lat},${destination.lon}`;
    window.open(url, '_blank');
  };

  // Call emergency numbers
  const callEmergency = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  // Get map center based on current location or default
  const mapCenter = useMemo(() => {
    if (current) return [current.lat, current.lon] as [number, number];
    return [28.6139, 77.2090] as [number, number]; // Default to Delhi
  }, [current]);

  // Get map zoom based on whether we have a specific location
  const mapZoom = useMemo(() => {
    if (current) return 12;
    return 6; // Zoom out for India view
  }, [current]);

  return (
    <div className="space-y-6">
      {/* Area Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Select Area for Evacuation Planning</h2>
        <AreaSelector 
          onLocationSelect={handleAreaSelect}
          selectedLocation={selectedArea}
          className="max-w-md"
        />
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Evacuation Route Planner</h2>
          <p className="text-gray-600 mt-1">
            Click on the map to set your location or use the area selector above
          </p>
        </div>
        
        <div className="h-96 w-full">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapClickHandler onMapClick={handleMapClick} />
            
            {/* Current location marker */}
            {current && (
              <Marker position={[current.lat, current.lon]} icon={startIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>Your Location</strong>
                    <br />
                    {current.lat.toFixed(4)}, {current.lon.toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Shelter markers */}
            {allShelters.map((shelter) => (
              <Marker key={shelter.shelter_id} position={[shelter.lat, shelter.lon]} icon={shelterIcon}>
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-lg">{shelter.name}</h3>
                    <p className="text-sm text-gray-600">{shelter.district}, {shelter.state}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <strong>Capacity:</strong> {shelter.available}/{shelter.capacity}
                      </p>
                      <p className="text-sm">
                        <strong>Status:</strong> 
                        <Badge variant={shelter.status === 'operational' ? 'default' : 'destructive'} className="ml-1">
                          {shelter.status}
                        </Badge>
                      </p>
                      <p className="text-sm">
                        <strong>Amenities:</strong> {shelter.amenities.join(', ')}
                      </p>
                      <p className="text-sm">
                        <strong>Contact:</strong> {shelter.contact}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Route polyline */}
            {routePoints.length > 0 && (
              <Polyline
                positions={routePoints}
                color="blue"
                weight={4}
                opacity={0.7}
              />
            )}
            
            {/* Flood zone polygons */}
            {floodZones.map((zone) => (
              <Polyline
                key={zone.id}
                positions={zone.coordinates}
                color={zone.severity === 'critical' ? 'red' : zone.severity === 'high' ? 'orange' : 'yellow'}
                weight={2}
                opacity={0.6}
              />
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Route Information */}
      {shelter && routeInfo && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Evacuation Route</h2>
            <Button
              onClick={() => current && openGoogleMaps(current, { lat: shelter.lat, lon: shelter.lon })}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Maps
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shelter Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Nearest Shelter</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-lg">{shelter.name}</h4>
                <p className="text-gray-600">{shelter.district}, {shelter.state}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{shelter.lat.toFixed(4)}, {shelter.lon.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <strong>Available Capacity:</strong> {shelter.capacity_available}/{shelter.capacity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <button
                      onClick={() => callEmergency(shelter.contact)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {shelter.contact}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Route Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Route Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Distance:</strong> {routeInfo.distance_km.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <strong>Estimated Time:</strong> {Math.round(routeInfo.duration_min)} minutes
                    </span>
                  </div>
                  {isLoading && (
                    <div className="text-sm text-blue-600">Calculating route...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Important Warnings</h3>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <span className="text-sm text-yellow-800">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Directions */}
          {directions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Turn-by-Turn Directions</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ol className="space-y-2">
                  {directions.map((direction, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </span>
                      <span>{direction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvacuationPlanner;