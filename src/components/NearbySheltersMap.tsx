import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Users, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { type LocationInfo } from '@/lib/locationService';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Shelter {
  id: string;
  name: string;
  location: string;
  address: string;
  capacity: number;
  current_occupancy: number;
  status: 'available' | 'near_full' | 'full';
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  facilities: string[];
  coordinates: { lat: number; lng: number };
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface NearbySheltersMapProps {
  userLocation: LocationInfo;
  maxDistance?: number; // in kilometers
}

const NearbySheltersMap: React.FC<NearbySheltersMapProps> = ({ 
  userLocation, 
  maxDistance = 50 
}) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [nearbyShelters, setNearbyShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Load shelters and filter nearby ones
  useEffect(() => {
    const loadShelters = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('admin_shelters')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error loading shelters:', error);
          return;
        }

        const allShelters = data || [];
        setShelters(allShelters);

        // Filter shelters within maxDistance
        const nearby = allShelters.filter(shelter => {
          const distance = calculateDistance(
            userLocation.coords.lat,
            userLocation.coords.lng,
            shelter.coordinates.lat,
            shelter.coordinates.lng
          );
          return distance <= maxDistance;
        });

        // Sort by distance
        nearby.sort((a, b) => {
          const distanceA = calculateDistance(
            userLocation.coords.lat,
            userLocation.coords.lng,
            a.coordinates.lat,
            a.coordinates.lng
          );
          const distanceB = calculateDistance(
            userLocation.coords.lat,
            userLocation.coords.lng,
            b.coordinates.lat,
            b.coordinates.lng
          );
          return distanceA - distanceB;
        });

        setNearbyShelters(nearby);
      } catch (error) {
        console.error('Error loading shelters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadShelters();
  }, [userLocation, maxDistance]);

  // Create custom icons for shelters
  const createShelterIcon = (status: string, isNearby: boolean = false) => {
    const colors = {
      available: '#10b981',
      near_full: '#f59e0b', 
      full: '#ef4444'
    };
    
    const color = colors[status as keyof typeof colors] || '#6b7280';
    const size = isNearby ? 35 : 25;
    
    return L.divIcon({
      className: 'custom-shelter-icon',
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${size > 30 ? '14px' : '12px'};">${isNearby ? '🏠' : '🏢'}</div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'near_full': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'full': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'near_full': return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case 'full': return <AlertTriangle className="w-3 h-3 text-red-600" />;
      default: return <Clock className="w-3 h-3 text-gray-600" />;
    }
  };

  const handleCallShelter = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleGetDirections = (shelter: Shelter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.coordinates.lat},${shelter.coordinates.lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Nearby Shelters Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Loading shelters...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Nearby Shelters Map
          </div>
          <Badge variant="outline" className="text-xs">
            {nearbyShelters.length} shelters within {maxDistance}km
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 rounded-lg overflow-hidden">
          <MapContainer
            center={[userLocation.coords.lat, userLocation.coords.lng]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User location marker */}
            <Marker
              position={[userLocation.coords.lat, userLocation.coords.lng]}
              icon={L.divIcon({
                className: 'user-location-icon',
                html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">📍</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              })}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">Your Location</h3>
                  <p className="text-xs text-gray-600">{userLocation.address}</p>
                </div>
              </Popup>
            </Marker>

            {/* Nearby shelters markers */}
            {nearbyShelters.map((shelter) => {
              const distance = calculateDistance(
                userLocation.coords.lat,
                userLocation.coords.lng,
                shelter.coordinates.lat,
                shelter.coordinates.lng
              );
              const availableCapacity = shelter.capacity - shelter.current_occupancy;
              const occupancyPercentage = (shelter.current_occupancy / shelter.capacity) * 100;

              return (
                <Marker
                  key={shelter.id}
                  position={[shelter.coordinates.lat, shelter.coordinates.lng]}
                  icon={createShelterIcon(shelter.status, true)}
                >
                  <Popup>
                    <div className="p-3 min-w-[250px]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{shelter.name}</h3>
                        <Badge className={getStatusColor(shelter.status)}>
                          {getStatusIcon(shelter.status)}
                          <span className="ml-1 capitalize">{shelter.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          {shelter.location}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Navigation className="w-3 h-3 mr-1" />
                          {distance.toFixed(1)} km away
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="w-3 h-3 mr-1" />
                          {availableCapacity} spots available ({occupancyPercentage.toFixed(0)}% occupied)
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Phone className="w-3 h-3 mr-1" />
                          {shelter.contact_phone}
                        </div>
                      </div>

                      {/* Facilities */}
                      {shelter.facilities && shelter.facilities.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium mb-1">Facilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {shelter.facilities.slice(0, 3).map((facility, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                {facility}
                              </Badge>
                            ))}
                            {shelter.facilities.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{shelter.facilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleCallShelter(shelter.contact_phone)}
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGetDirections(shelter)}
                          className="text-xs px-2 py-1"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Legend:</span>
            <span>{nearbyShelters.length} shelters found</span>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Near Full</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Full</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbySheltersMap;