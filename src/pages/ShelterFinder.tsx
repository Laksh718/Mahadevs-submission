import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import UserLayout from '@/components/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import {
  MapPin,
  Phone,
  Users,
  Shield,
  Navigation,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Home,
  Heart,
  Star,
  ArrowLeft,
  RefreshCw,
  Wifi,
  Car,
  Droplets,
  Zap,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLocationWithDetails, type LocationInfo } from '@/lib/locationService';

// Component to handle map view updates
const MapViewUpdater: React.FC<{
  center: [number, number];
  zoom: number;
  userLocation: LocationInfo | null;
}> = ({ center, zoom, userLocation }) => {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = React.useState(false);
  
  React.useEffect(() => {
    if (map && !hasInitialized) {
      map.setView(center, zoom, { animate: false });
      setHasInitialized(true);
    }
  }, [map, center, zoom, hasInitialized]);
  
  // Update view when user location changes
  React.useEffect(() => {
    if (map && hasInitialized && userLocation) {
      map.setView([userLocation.coords.lat, userLocation.coords.lng], zoom, { 
        animate: true,
        duration: 1
      });
    }
  }, [map, userLocation, hasInitialized]);
  
  return null;
};

interface Shelter {
  id: string;
  name: string;
  location: string;
  address: string;
  capacity: number;
  current_occupancy: number;
  status: 'available' | 'busy' | 'full';
  facilities: string[];
  contact_number: string;
  coordinates: [number, number] | { lat: number; lng: number };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ShelterFinder = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [filteredShelters, setFilteredShelters] = useState<Shelter[]>([]);
  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [nearbyShelters, setNearbyShelters] = useState<Shelter[]>([]);
  const [maxDistance, setMaxDistance] = useState(25); // Default 25km radius
  const [showMap, setShowMap] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default center (Center of India)
  const [locationLoading, setLocationLoading] = useState(false);

  // Load shelters data
  useEffect(() => {
    loadShelters();
    loadUserLocation();
  }, []);

  // Filter shelters when search or filters change
  useEffect(() => {
    filterShelters();
  }, [shelters, searchTerm, statusFilter, capacityFilter]);

  // Update nearby shelters when user location or shelters change
  useEffect(() => {
    if (userLocation && shelters.length > 0) {
      updateNearbyShelters();
    }
  }, [userLocation, shelters, maxDistance]);

  // Real-time updates for shelter data
  useEffect(() => {
    const interval = setInterval(() => {
      loadShelters(); // Refresh shelter data every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadShelters = async () => {
    setLoading(true);
    try {
      console.log('Loading shelters from Supabase...');
      
      const { data, error } = await supabase
        .from('admin_shelters')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading shelters:', error);
        toast.error('Failed to load shelters');
        return;
      }

      console.log('Shelters loaded:', data);
      
      // Validate and clean shelter data
      const validShelters = (data || []).map(shelter => {
        // Ensure coordinates are properly formatted
        let coordinates = shelter.coordinates;
        if (typeof coordinates === 'string') {
          try {
            coordinates = JSON.parse(coordinates);
          } catch (e) {
            console.warn('Invalid coordinates format for shelter:', shelter.name, coordinates);
            coordinates = { lat: 0, lng: 0 }; // Default fallback
          }
        }
        
        return {
          ...shelter,
          coordinates
        };
      });
      
      console.log('Validated shelters:', validShelters);
      setShelters(validShelters);
    } catch (error) {
      console.error('Error loading shelters:', error);
      toast.error('Failed to load shelters');
    } finally {
      setLoading(false);
    }
  };

  const loadUserLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getLocationWithDetails();
      setUserLocation(location);
      setMapCenter([location.coords.lat, location.coords.lng]);
      toast.success(`Location detected: ${location.district || location.state}`);
    } catch (error) {
      console.error('Error loading user location:', error);
      // Set default location if geolocation fails
      const defaultLocation: LocationInfo = {
        coords: { lat: 20.5937, lng: 78.9629 },
        address: "Center of India",
        state: "India",
        district: "Central India",
        country: "India"
      };
      setUserLocation(defaultLocation);
      setMapCenter([defaultLocation.coords.lat, defaultLocation.coords.lng]);
      toast.warning('Using default location. Please enable location access for better results.');
    } finally {
      setLocationLoading(false);
    }
  };

  const filterShelters = () => {
    let filtered = shelters;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(shelter =>
        shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shelter => shelter.status === statusFilter);
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      const availableCapacity = filtered.map(s => s.capacity - s.current_occupancy);
      const maxAvailable = Math.max(...availableCapacity);
      
      if (capacityFilter === 'high') {
        filtered = filtered.filter(s => (s.capacity - s.current_occupancy) > maxAvailable * 0.7);
      } else if (capacityFilter === 'medium') {
        filtered = filtered.filter(s => {
          const available = s.capacity - s.current_occupancy;
          return available > maxAvailable * 0.3 && available <= maxAvailable * 0.7;
        });
      } else if (capacityFilter === 'low') {
        filtered = filtered.filter(s => (s.capacity - s.current_occupancy) <= maxAvailable * 0.3);
      }
    }

    setFilteredShelters(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'full': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'busy': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'full': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Create custom icons for map markers
  const createShelterIcon = (status: string, isNearby: boolean = false) => {
    const colors = {
      available: '#10b981',
      busy: '#f59e0b', 
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

  const createUserLocationIcon = () => {
    return L.divIcon({
      className: 'user-location-icon',
      html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">📍</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

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

  const getDistanceFromUser = (shelter: Shelter) => {
    if (!userLocation?.coords) return null;
    
    // Handle both array and object coordinate formats
    let lat: number, lng: number;
    if (Array.isArray(shelter.coordinates)) {
      [lat, lng] = shelter.coordinates;
    } else {
      lat = shelter.coordinates.lat;
      lng = shelter.coordinates.lng;
    }
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat === null || lng === null) {
      console.warn('Invalid coordinates for shelter:', shelter.name, shelter.coordinates);
      return null;
    }
    
    return calculateDistance(
      userLocation.coords.lat,
      userLocation.coords.lng,
      lat,
      lng
    );
  };

  const updateNearbyShelters = () => {
    if (!userLocation?.coords) return;

    const nearby = shelters.filter(shelter => {
      const distance = getDistanceFromUser(shelter);
      return distance !== null && !isNaN(distance) && distance <= maxDistance;
    });

    // Sort by distance
    nearby.sort((a, b) => {
      const distanceA = getDistanceFromUser(a);
      const distanceB = getDistanceFromUser(b);
      
      if (distanceA === null && distanceB === null) return 0;
      if (distanceA === null) return 1;
      if (distanceB === null) return -1;
      
      return distanceA - distanceB;
    });

    setNearbyShelters(nearby);
  };

  const sortSheltersByDistance = () => {
    const sorted = [...filteredShelters].sort((a, b) => {
      const distanceA = getDistanceFromUser(a);
      const distanceB = getDistanceFromUser(b);
      
      // Handle null/NaN values
      if ((distanceA === null || isNaN(distanceA)) && (distanceB === null || isNaN(distanceB))) return 0;
      if (distanceA === null || isNaN(distanceA)) return 1;
      if (distanceB === null || isNaN(distanceB)) return -1;
      
      return distanceA - distanceB;
    });
    
    setFilteredShelters(sorted);
  };

  const handleCallShelter = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleGetDirections = (shelter: Shelter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.coordinates[0]},${shelter.coordinates[1]}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading shelters...</p>
        </div>
      </div>
    );
  }

  return (
    <UserLayout title="Shelter Finder" description="Find nearby flood shelters">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card 
          className="border-0 shadow-lg" 
          style={theme === 'high-contrast' ? {
            backgroundColor: 'hsl(0, 0%, 10%)',
            borderColor: 'hsl(0, 0%, 40%)'
          } : {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center" style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 100%)' } : undefined}>
              <Search className="w-5 h-5 mr-2" style={theme === 'high-contrast' ? { color: 'hsl(47, 100%, 60%)' } : { color: '#2563eb' }} />
              Search & Filter Shelters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, location, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  style={theme === 'high-contrast' ? {
                    backgroundColor: 'hsl(0, 0%, 15%)',
                    color: 'hsl(0, 0%, 100%)',
                    borderColor: 'hsl(0, 0%, 40%)'
                  } : undefined}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
              <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Capacity</SelectItem>
                  <SelectItem value="high">High Availability</SelectItem>
                  <SelectItem value="medium">Medium Availability</SelectItem>
                  <SelectItem value="low">Low Availability</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={sortSheltersByDistance}
                disabled={!userLocation?.coords}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Sort by Distance
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  loadShelters();
                  toast.success('Shelter data refreshed');
                }}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  loadUserLocation();
                }}
                disabled={loading || locationLoading}
              >
                <MapPin className={`w-4 h-4 mr-2 ${locationLoading ? 'animate-pulse' : ''}`} />
                {locationLoading ? 'Getting Location...' : 'Get My Location'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant={showMap ? "default" : "outline"}
              onClick={() => setShowMap(!showMap)}
              className="flex items-center space-x-2"
              style={theme === 'high-contrast' && showMap ? {
                backgroundColor: 'hsl(47, 100%, 60%)',
                color: 'hsl(0, 0%, 0%)'
              } : theme === 'high-contrast' ? {
                backgroundColor: 'transparent',
                color: 'hsl(0, 0%, 100%)',
                borderColor: 'hsl(0, 0%, 40%)'
              } : undefined}
            >
              <MapPin className="w-4 h-4" />
              <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
            </Button>
            {userLocation && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {userLocation.district || userLocation.state}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm" style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 100%)' } : { color: '#4b5563' }}>View:</span>
            <Select value={maxDistance.toString()} onValueChange={(value) => setMaxDistance(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10km</SelectItem>
                <SelectItem value="25">25km</SelectItem>
                <SelectItem value="50">50km</SelectItem>
                <SelectItem value="100">100km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interactive Map */}
        {showMap && (
          <Card 
            className="border-0 shadow-lg"
            style={theme === 'high-contrast' ? {
              backgroundColor: 'hsl(0, 0%, 10%)',
              borderColor: 'hsl(0, 0%, 40%)'
            } : {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between" style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 100%)' } : undefined}>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" style={theme === 'high-contrast' ? { color: 'hsl(47, 100%, 60%)' } : { color: '#2563eb' }} />
                  Nearby Shelters Map
                </div>
                <Badge variant="outline" className="text-xs">
                  {nearbyShelters.length} shelters within {maxDistance}km
                </Badge>
              </CardTitle>
              <CardDescription style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 95%)' } : undefined}>
                Real-time map showing shelters near your location. Click on markers for details.
                {userLocation && (
                  <span className="ml-2 text-xs" style={theme === 'high-contrast' ? { color: 'hsl(47, 100%, 60%)' } : { color: '#16a34a' }}>
                    📍 Using your location: {userLocation.district || userLocation.state}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapContainer
                  center={mapCenter}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapViewUpdater 
                    center={mapCenter} 
                    zoom={12} 
                    userLocation={userLocation} 
                  />
                  
                  {/* User location marker */}
                  {userLocation && (
                    <Marker
                      position={[userLocation.coords.lat, userLocation.coords.lng]}
                      icon={createUserLocationIcon()}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-sm mb-1">Your Location</h3>
                          <p className="text-xs text-gray-600">{userLocation.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Shelter markers */}
                  {shelters.map((shelter) => {
                    const distance = getDistanceFromUser(shelter);
                    const isNearby = distance !== null && distance <= maxDistance;
                    const availableCapacity = shelter.capacity - shelter.current_occupancy;
                    const occupancyPercentage = (shelter.current_occupancy / shelter.capacity) * 100;

                    // Handle both array and object coordinate formats
                    let lat: number, lng: number;
                    if (Array.isArray(shelter.coordinates)) {
                      [lat, lng] = shelter.coordinates;
                    } else {
                      lat = shelter.coordinates.lat;
                      lng = shelter.coordinates.lng;
                    }

                    // Skip markers with invalid coordinates
                    if (isNaN(lat) || isNaN(lng) || lat === null || lng === null) {
                      return null;
                    }

                    return (
                      <Marker
                        key={shelter.id}
                        position={[lat, lng]}
                        icon={createShelterIcon(shelter.status, isNearby)}
                      >
                        <Popup>
                          <div className="p-3 min-w-[250px]">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-sm">{shelter.name}</h3>
                              <Badge className={getStatusColor(shelter.status)}>
                                {getStatusIcon(shelter.status)}
                                <span className="ml-1 capitalize">{shelter.status}</span>
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="w-3 h-3 mr-1" />
                                {shelter.location}
                              </div>
                              {distance !== null && !isNaN(distance) && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <Navigation className="w-3 h-3 mr-1" />
                                  {distance.toFixed(1)} km away
                                </div>
                              )}
                              <div className="flex items-center text-xs text-gray-600">
                                <Users className="w-3 h-3 mr-1" />
                                {availableCapacity} spots available ({occupancyPercentage.toFixed(0)}% occupied)
                              </div>
                              <div className="flex items-center text-xs text-gray-600">
                                <Phone className="w-3 h-3 mr-1" />
                                {shelter.contact_number}
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
                                onClick={() => handleCallShelter(shelter.contact_number)}
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

              {/* Map Legend */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs" style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 100%)' } : undefined}>
                  <span className="font-medium">Legend:</span>
                  <span>{nearbyShelters.length} nearby shelters</span>
                </div>
                <div className="flex items-center space-x-4 text-xs" style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 100%)' } : undefined}>
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
                    <span>Busy</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Full</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm" style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 100%)' } : { color: '#4b5563' }}>
              Showing {filteredShelters.length} of {shelters.length} shelters
            </p>
            {nearbyShelters.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {nearbyShelters.length} nearby (within {maxDistance}km)
              </Badge>
            )}
          </div>
          {userLocation && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {userLocation.district || userLocation.state}
            </Badge>
          )}
        </div>

        {/* Nearby Shelters Section */}
        {nearbyShelters.length > 0 && (
          <Card 
            className="border shadow-lg"
            style={theme === 'high-contrast' ? {
              backgroundColor: 'hsl(0, 0%, 10%)',
              borderColor: 'hsl(0, 0%, 40%)'
            } : {
              backgroundColor: 'rgba(239, 246, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              borderColor: '#bfdbfe'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center" style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 100%)' } : { color: '#1e40af' }}>
                <MapPin className="w-5 h-5 mr-2" />
                Nearby Shelters ({nearbyShelters.length})
              </CardTitle>
              <CardDescription style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 95%)' } : { color: '#2563eb' }}>
                Shelters within {maxDistance}km of your location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyShelters.slice(0, 6).map((shelter) => {
                  const distance = getDistanceFromUser(shelter);
                  const availableCapacity = shelter.capacity - shelter.current_occupancy;
                  
                  return (
                    <div 
                      key={shelter.id} 
                      className="rounded-lg p-4 border"
                      style={theme === 'high-contrast' ? {
                        backgroundColor: 'hsl(0, 0%, 15%)',
                        borderColor: 'hsl(0, 0%, 40%)',
                        color: 'hsl(0, 0%, 100%)'
                      } : {
                        backgroundColor: 'white',
                        borderColor: '#bfdbfe'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm" style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 100%)' } : undefined}>{shelter.name}</h4>
                        <Badge className={getStatusColor(shelter.status)}>
                          {getStatusIcon(shelter.status)}
                          <span className="ml-1 capitalize">{shelter.status}</span>
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs mb-3" style={theme === 'high-contrast' ? { color: 'hsl(0, 0%, 95%)' } : { color: '#4b5563' }}>
                        <div className="flex items-center">
                          <Navigation className="w-3 h-3 mr-1" />
                          {distance !== null && !isNaN(distance) ? `${distance.toFixed(1)} km away` : 'Distance unavailable'}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {availableCapacity} spots available
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {shelter.contact_number}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleCallShelter(shelter.contact_number)}
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
                  );
                })}
              </div>
              {nearbyShelters.length > 6 && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Scroll to main shelters list
                      document.getElementById('main-shelters')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    View All {nearbyShelters.length} Nearby Shelters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Shelters List */}
        <div id="main-shelters" className="space-y-4">
          {filteredShelters.length > 0 ? (
            filteredShelters.map((shelter) => {
              const distance = getDistanceFromUser(shelter);
              const availableCapacity = shelter.capacity - shelter.current_occupancy;
              const occupancyPercentage = (shelter.current_occupancy / shelter.capacity) * 100;
              const isNearby = distance !== null && distance <= maxDistance;

              return (
                <Card 
                  key={shelter.id} 
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                  style={theme === 'high-contrast' ? {
                    backgroundColor: 'hsl(0, 0%, 10%)',
                    borderLeft: isNearby ? '4px solid hsl(47, 100%, 60%)' : 'none'
                  } : {
                    backgroundColor: isNearby ? 'rgba(239, 246, 255, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderLeft: isNearby ? '4px solid #3b82f6' : 'none'
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{shelter.name}</h3>
                          <Badge className={getStatusColor(shelter.status)}>
                            {getStatusIcon(shelter.status)}
                            <span className="ml-1 capitalize">{shelter.status}</span>
                          </Badge>
                          {isNearby && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              Nearby
                            </Badge>
                          )}
                          {distance !== null && !isNaN(distance) ? (
                            <Badge variant="outline" className="text-xs">
                              <Navigation className="w-3 h-3 mr-1" />
                              {distance.toFixed(1)} km
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Location unavailable
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {shelter.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Home className="w-4 h-4 mr-2" />
                            {shelter.address}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {shelter.contact_number}
                          </div>
                        </div>

                        {/* Capacity Info */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium">Capacity</span>
                            <span>{shelter.current_occupancy} / {shelter.capacity} people</span>
                          </div>
                          <Progress 
                            value={occupancyPercentage} 
                            className="h-2"
                            style={{
                              backgroundColor: occupancyPercentage > 80 ? '#ef4444' : 
                                             occupancyPercentage > 60 ? '#f59e0b' : '#10b981'
                            }}
                          />
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span>{availableCapacity} spots available</span>
                            <span>{occupancyPercentage.toFixed(0)}% occupied</span>
                          </div>
                        </div>

                        {/* Facilities */}
                        {shelter.facilities && shelter.facilities.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Facilities:</p>
                            <div className="flex flex-wrap gap-2">
                              {shelter.facilities.map((facility, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleCallShelter(shelter.contact_number)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGetDirections(shelter)}
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Directions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedShelter(shelter);
                            setShowDetails(true);
                          }}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No shelters found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || capacityFilter !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'No active shelters available in the system'
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCapacityFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Shelter Details Modal */}
      {showDetails && selectedShelter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  {selectedShelter.name}
                </CardTitle>
                <CardDescription>{selectedShelter.location}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Alert */}
              <Alert className={selectedShelter.status === 'available' ? 'border-green-200 bg-green-50' : 
                               selectedShelter.status === 'busy' ? 'border-yellow-200 bg-yellow-50' : 
                               'border-red-200 bg-red-50'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Status:</strong> {selectedShelter.status.charAt(0).toUpperCase() + selectedShelter.status.slice(1)}
                  {selectedShelter.status === 'available' && ' - Ready to accept evacuees'}
                  {selectedShelter.status === 'busy' && ' - Limited capacity remaining'}
                  {selectedShelter.status === 'full' && ' - At maximum capacity'}
                </AlertDescription>
              </Alert>

              {/* Contact Information */}
              <div>
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{selectedShelter.contact_number}</span>
                    <Button
                      size="sm"
                      className="ml-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleCallShelter(selectedShelter.contact_number)}
                    >
                      Call Now
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{selectedShelter.address}</span>
                  </div>
                </div>
              </div>

              {/* Capacity Details */}
              <div>
                <h4 className="font-medium mb-3">Capacity Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Capacity:</span>
                    <span className="font-medium">{selectedShelter.capacity} people</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Occupancy:</span>
                    <span className="font-medium">{selectedShelter.current_occupancy} people</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available Spots:</span>
                    <span className="font-medium text-green-600">
                      {selectedShelter.capacity - selectedShelter.current_occupancy} people
                    </span>
                  </div>
                  <Progress 
                    value={(selectedShelter.current_occupancy / selectedShelter.capacity) * 100} 
                    className="h-2 mt-2"
                  />
                </div>
              </div>

              {/* Facilities */}
              {selectedShelter.facilities && selectedShelter.facilities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Available Facilities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedShelter.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        {facility}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleCallShelter(selectedShelter.contact_number)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Shelter
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleGetDirections(selectedShelter)}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </UserLayout>
  );
};

export default ShelterFinder;