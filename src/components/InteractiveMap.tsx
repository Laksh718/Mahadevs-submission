import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPoint, RouteInfo } from '@/hooks/useInteractiveMap';
import { graphHopperService } from '@/services/graphhopper';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Bike, 
  Footprints, 
  Truck,
  Zap,
  Route,
  Trash2,
  RotateCcw,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Map,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  points: MapPoint[];
  routes: RouteInfo[];
  isCalculating: boolean;
  showInstructions: boolean;
  onAddPoint: (lat: number, lng: number, type: MapPoint['type'], label?: string) => void;
  onRemovePoint: (pointId: string) => void;
  onCalculateRoute: () => Promise<void>;
  onOptimizeRoute: () => Promise<void>;
  onToggleInstructions: () => void;
  onClearPoints: () => void;
  onOpenFullscreen?: () => void;
}

// Component to handle map clicks with improved reliability
const MapClickHandler: React.FC<{
  onAddPoint: (lat: number, lng: number, type: MapPoint['type'], label?: string) => void;
  points: MapPoint[];
  onShowClickFeedback: (lat: number, lng: number) => void;
}> = ({ onAddPoint, points, onShowClickFeedback }) => {
  try {
    const map = useMapEvents({
      click: (e) => {
        try {
          // Prevent event bubbling
          e.originalEvent.stopPropagation();
          
          const { lat, lng } = e.latlng;
          
          console.log('Map clicked at:', lat, lng, 'Current points:', points.length);
          
          // Show visual feedback immediately
          onShowClickFeedback(lat, lng);
          
          // Determine point type based on existing points
          let type: MapPoint['type'] = 'waypoint';
          if (points.length === 0) {
            type = 'origin';
          } else if (points.length === 1) {
            type = 'destination';
          }
          
          // Add point immediately without delay
          onAddPoint(lat, lng, type);
        } catch (error) {
          console.error('Error handling map click:', error);
        }
      },
      
      // Prevent map dragging when clicking
      mousedown: (e) => {
        try {
          // Only prevent dragging if it's a single click
          if (e.originalEvent.detail === 1) {
            e.originalEvent.preventDefault();
          }
        } catch (error) {
          console.error('Error handling map mousedown:', error);
        }
      }
    });
    
    return null;
  } catch (error) {
    console.error('Error in MapClickHandler:', error);
    return null;
  }
};

// Component to handle map view updates without reloading
const MapViewUpdater: React.FC<{
  center: [number, number];
  zoom: number;
  points: MapPoint[];
}> = ({ center, zoom, points }) => {
  try {
    const map = useMap();
    const [hasInitialized, setHasInitialized] = React.useState(false);
    
    React.useEffect(() => {
      if (map && !hasInitialized) {
        try {
          // Only set initial view once
          map.setView(center, zoom, { animate: false });
          setHasInitialized(true);
        } catch (error) {
          console.error('Error setting initial map view:', error);
        }
      }
    }, [map, center, zoom, hasInitialized]);
    
    // Only update view when points change significantly (not on every click)
    React.useEffect(() => {
      if (map && hasInitialized && points.length > 1) {
        try {
          // Calculate bounds to fit all points
          const lats = points.map(p => p.lat);
          const lngs = points.map(p => p.lng);
          const bounds = [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)]
          ];
          
          // Only fit bounds if we have multiple points
          if (points.length >= 2) {
            map.fitBounds(bounds as [[number, number], [number, number]], { 
              padding: [20, 20],
              animate: true,
              duration: 1
            });
          }
        } catch (error) {
          console.error('Error updating map bounds:', error);
        }
      }
    }, [map, points.length, hasInitialized]); // Only depend on points.length, not individual points
    
    return null;
  } catch (error) {
    console.error('Error in MapViewUpdater:', error);
    return null;
  }
};

// Custom icon creator
const createCustomIcon = (color: string, iconType: string = 'default') => {
  const iconHtml = iconType === 'origin' ? '🏠' : iconType === 'destination' ? '🎯' : '📍';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${iconHtml}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  points,
  routes,
  isCalculating,
  showInstructions,
  onAddPoint,
  onRemovePoint,
  onCalculateRoute,
  onOptimizeRoute,
  onToggleInstructions,
  onClearPoints,
  onOpenFullscreen
}) => {
  const mapRef = useRef<L.Map>(null);
  const [apiStatus, setApiStatus] = useState<'testing' | 'connected' | 'disconnected'>('testing');
  const [clickFeedback, setClickFeedback] = useState<{lat: number, lng: number} | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Default color for rescue operations
  const routeColor = '#3b82f6'; // Blue for rescue routes

  // Test API connection on component mount
  useEffect(() => {
    const testApi = async () => {
      try {
        setApiStatus('testing');
        setMapError(null);
        const isConnected = await graphHopperService.testConnection();
        setApiStatus(isConnected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('API test error:', error);
        setMapError('Failed to connect to routing service');
        setApiStatus('disconnected');
      }
    };
    
    testApi();
  }, []);

  // Generate Google Maps URL for the current route
  const generateGoogleMapsUrl = () => {
    if (points.length < 2) return '';
    
    const graphHopperPoints = points.map(p => ({ lat: p.lat, lng: p.lng }));
    return graphHopperService.generateGoogleMapsDirectionsUrl(graphHopperPoints);
  };

  // Open route in Google Maps
  const openInGoogleMaps = () => {
    const url = generateGoogleMapsUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Show click feedback (memoized to prevent unnecessary re-renders)
  const showClickFeedback = React.useCallback((lat: number, lng: number) => {
    setClickFeedback({ lat, lng });
    // Clear feedback after 800ms for faster response
    setTimeout(() => {
      setClickFeedback(null);
    }, 800);
  }, []);

  // Calculate map center based on points (stable calculation)
  const getMapCenter = (): [number, number] => {
    if (points.length === 0) {
      return [20.5937, 78.9629]; // Default center (Center of India)
    }
    
    if (points.length === 1) {
      return [points[0].lat, points[0].lng];
    }
    
    // Calculate center of all points
    const avgLat = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
    const avgLng = points.reduce((sum, point) => sum + point.lng, 0) / points.length;
    
    return [avgLat, avgLng];
  };

  // Memoize the map center to prevent unnecessary recalculations
  const mapCenter = React.useMemo(() => getMapCenter(), [points]);
  const mapZoom = React.useMemo(() => points.length > 1 ? 10 : 12, [points.length]);

  // Calculate map bounds to fit all points
  const getMapBounds = () => {
    if (points.length === 0) return null;
    
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ] as [[number, number], [number, number]];
  };

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Interactive Map */}
      <div className="lg:col-span-3">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-teal-600" />
                  Interactive Route Planner
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Click map to add waypoints: Origin → Destination → Waypoints
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {apiStatus === 'testing' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {apiStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {apiStatus === 'disconnected' && <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="text-xs text-muted-foreground">
                    {apiStatus === 'testing' && 'Testing API...'}
                    {apiStatus === 'connected' && 'API Connected'}
                    {apiStatus === 'disconnected' && 'Using Fallback'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearPoints}
                  disabled={points.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleInstructions}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showInstructions ? 'Hide' : 'Show'} Instructions
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80 rounded-lg overflow-hidden relative group">
              {/* Click instruction overlay */}
              <div className="absolute top-4 left-4 z-[1001] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-700">
                    {points.length === 0 && 'Click to add origin point'}
                    {points.length === 1 && 'Click to add destination'}
                    {points.length >= 2 && 'Click to add waypoints'}
                  </span>
                </div>
              </div>
              
              {/* Error overlay */}
              {mapError && (
                <div className="absolute top-4 right-4 z-[1001] bg-red-50 border border-red-200 rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-700">{mapError}</span>
                  </div>
                </div>
              )}
              <style jsx>{`
                @keyframes pulse {
                  0% { transform: scale(0.8); opacity: 0.8; }
                  50% { transform: scale(1.3); opacity: 1; }
                  100% { transform: scale(1); opacity: 0.9; }
                }
                .click-feedback-marker {
                  animation: pulse 0.8s ease-out;
                }
              `}</style>
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
                ref={mapRef}
                zoomControl={true}
                scrollWheelZoom={true}
                doubleClickZoom={false}
                dragging={true}
                tap={true}
                touchZoom={true}
                boxZoom={false}
                keyboard={true}
                closePopupOnClick={false}
                zoomSnap={0.25}
                zoomDelta={0.5}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  maxZoom={19}
                  minZoom={3}
                />
                
                <MapClickHandler onAddPoint={onAddPoint} points={points} onShowClickFeedback={showClickFeedback} />
                <MapViewUpdater center={mapCenter} zoom={mapZoom} points={points} />
                
                {/* Click feedback marker */}
                {clickFeedback && (
                  <Marker
                    position={[clickFeedback.lat, clickFeedback.lng] as [number, number]}
                    icon={L.divIcon({
                      className: 'click-feedback-marker',
                      html: '<div style="background-color: rgba(34, 197, 94, 0.9); width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); animation: pulse 0.8s ease-in-out;"></div>',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                  />
                )}
                
                {/* Render points */}
                {points.map((point, index) => (
                  <Marker
                    key={point.id}
                    position={[point.lat, point.lng] as [number, number]}
                    icon={createCustomIcon(
                      point.type === 'origin' ? '#3b82f6' : 
                      point.type === 'destination' ? '#ef4444' : '#10b981',
                      point.type
                    )}
                  >
                    <Popup>
                      <div className="p-3 min-w-[200px]">
                        <h3 className="font-semibold text-sm mb-2">
                          {point.type === 'origin' ? '🏠 Origin Point' : 
                           point.type === 'destination' ? '🎯 Destination' : 
                           `📍 Waypoint ${index}`}
                        </h3>
                        <div className="space-y-1 text-xs text-muted-foreground mb-3">
                          <p><strong>Latitude:</strong> {point.lat.toFixed(6)}</p>
                          <p><strong>Longitude:</strong> {point.lng.toFixed(6)}</p>
                          {point.label && <p><strong>Label:</strong> {point.label}</p>}
                          <p><strong>Order:</strong> {index + 1} of {points.length}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => onRemovePoint(point.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove Point
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Render routes */}
                {routes.map((route, routeIndex) => (
                  <Polyline
                    key={routeIndex}
                    positions={route.points}
                    color={routeColor}
                    weight={4}
                    opacity={0.8}
                  />
                ))}
              </MapContainer>
            </div>
            
            {/* Map Controls */}
            <div className="mt-3 space-y-3">
              {/* Route Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={onCalculateRoute}
                  disabled={points.length < 2 || isCalculating}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Route className="h-4 w-4 mr-2" />
                  {isCalculating ? 'Calculating...' : 'Calculate Rescue Route'}
                </Button>
                <Button
                  onClick={onOptimizeRoute}
                  disabled={points.length < 3 || isCalculating}
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Optimize Route
                </Button>
                <Button
                  onClick={openInGoogleMaps}
                  disabled={points.length < 2}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
                {onOpenFullscreen && (
                  <Button
                    onClick={onOpenFullscreen}
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  >
                    <Maximize className="h-4 w-4 mr-2" />
                    Fullscreen
                  </Button>
                )}
              </div>
              
              {/* Status and Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Points: {points.length}</span>
                  <div className="text-xs text-muted-foreground">
                    {points.length === 0 && 'Click to add origin'}
                    {points.length === 1 && 'Click to add destination'}
                    {points.length >= 2 && 'Click to add waypoints'}
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Origin</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Destination</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Waypoints</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-4 bg-blue-500"></div>
                    <span>Route</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Information Panel */}
      <div className="lg:col-span-1">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Navigation className="h-4 w-4 mr-2 text-blue-600" />
              Route Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {/* Points Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium text-xs">Waypoints ({points.length})</h4>
                  {points.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Click map to add waypoints</p>
                  ) : (
                    <div className="space-y-1">
                      {points.map((point, index) => (
                        <div key={point.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              point.type === 'origin' ? 'bg-blue-500' :
                              point.type === 'destination' ? 'bg-red-500' : 'bg-green-500'
                            }`}></div>
                            <span>
                              {point.type === 'origin' ? 'Origin' : 
                               point.type === 'destination' ? 'Destination' : 
                               `Waypoint ${index}`}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemovePoint(point.id)}
                            className="h-4 w-4 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Route Results */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-xs">Routes ({routes.length})</h4>
                    {routes.length > 0 && (
                      <Button
                        onClick={openInGoogleMaps}
                        size="sm"
                        variant="outline"
                        className="h-5 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        <Map className="h-3 w-3 mr-1" />
                        Maps
                      </Button>
                    )}
                  </div>
                  {routes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Calculate route to see results</p>
                  ) : (
                    <div className="space-y-3">
                      {routes.map((route, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">Route {index + 1}</h5>
                            <div className="flex items-center space-x-2">
                              {index === 0 && <Badge className="bg-green-100 text-green-800">Best</Badge>}
                              <Button
                                onClick={openInGoogleMaps}
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>Distance: {route.distance}</div>
                            <div>Duration: {route.duration}</div>
                            <div>Points: {route.points.length}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {showInstructions && routes.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Turn-by-Turn Instructions</h4>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {routes[0]?.instructions.map((instruction, index) => (
                            <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                              <div className="font-medium">{instruction.text}</div>
                              <div className="text-muted-foreground">
                                {Math.round(instruction.distance)}m • {Math.round(instruction.time / 60000)}min
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveMap;