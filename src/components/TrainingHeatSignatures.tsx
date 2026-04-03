import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Thermometer,
  Activity,
  MapPin,
  Download,
  Settings,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Filter,
  Zap,
  Eye,
} from "lucide-react";
import { MapContainer, TileLayer, Circle, Popup, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getTrainingAnalytics,
  getCoverageAnalytics,
} from "@/lib/trainingService";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface HeatPoint {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  sessions: number;
  participants: number;
  completion: number;
  engagement: number;
  satisfaction: number;
  impact: number;
  location: string;
  category: string;
  timestamp: string;
}

interface HeatLayer {
  id: string;
  name: string;
  color: string;
  minIntensity: number;
  maxIntensity: number;
  visible: boolean;
  opacity: number;
}

const TrainingHeatSignatures: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState("intensity");
  const [timeRange, setTimeRange] = useState("6months");
  const [intensityThreshold, setIntensityThreshold] = useState([0, 100]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [heatLayers, setHeatLayers] = useState<HeatLayer[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const heatLayerConfigs: HeatLayer[] = [
    {
      id: "sessions",
      name: "Training Sessions",
      color: "#0088FE",
      minIntensity: 0,
      maxIntensity: 100,
      visible: true,
      opacity: 0.7,
    },
    {
      id: "participants",
      name: "Participants",
      color: "#00C49F",
      minIntensity: 0,
      maxIntensity: 100,
      visible: true,
      opacity: 0.6,
    },
    {
      id: "engagement",
      name: "Engagement Level",
      color: "#FFBB28",
      minIntensity: 0,
      maxIntensity: 100,
      visible: false,
      opacity: 0.5,
    },
    {
      id: "impact",
      name: "Training Impact",
      color: "#FF8042",
      minIntensity: 0,
      maxIntensity: 100,
      visible: false,
      opacity: 0.8,
    },
    {
      id: "satisfaction",
      name: "Satisfaction Score",
      color: "#8884d8",
      minIntensity: 0,
      maxIntensity: 100,
      visible: false,
      opacity: 0.6,
    },
  ];

  // Sample coordinates for major Indian cities (training locations)
  const trainingLocations = [
    { name: "Delhi", lat: 28.6139, lng: 77.209 },
    { name: "Mumbai", lat: 19.076, lng: 72.8777 },
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { name: "Surat", lat: 21.1702, lng: 72.8311 },
    { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
    { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
    { name: "Indore", lat: 22.7196, lng: 75.8577 },
    { name: "Thane", lat: 19.2183, lng: 72.9781 },
    { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
    { name: "Pimpri-Chinchwad", lat: 18.6298, lng: 73.7997 },
    { name: "Patna", lat: 25.5941, lng: 85.1376 },
    { name: "Vadodara", lat: 22.3072, lng: 73.1812 },
  ];

  useEffect(() => {
    loadHeatData();
    setHeatLayers(heatLayerConfigs);
  }, [timeRange, selectedCategory]);

  const loadHeatData = async () => {
    setLoading(true);
    try {
      const [analytics, coverage] = await Promise.all([
        getTrainingAnalytics(),
        getCoverageAnalytics(),
      ]);

      // Generate heat points based on training locations
      const heatData: HeatPoint[] = trainingLocations.map((location, index) => {
        const baseIntensity = Math.random() * 80 + 20;
        const sessions = Math.floor(Math.random() * 50) + 5;
        const participants = Math.floor(Math.random() * 500) + 50;

        return {
          id: `heat_${index}`,
          lat: location.lat + (Math.random() - 0.5) * 0.1, // Add slight variation
          lng: location.lng + (Math.random() - 0.5) * 0.1,
          intensity: baseIntensity,
          sessions: sessions,
          participants: participants,
          completion: Math.random() * 30 + 70,
          engagement: Math.random() * 40 + 60,
          satisfaction: Math.random() * 25 + 75,
          impact: Math.random() * 35 + 65,
          location: location.name,
          category: [
            "Disaster Management",
            "Community Training",
            "Emergency Response",
            "Risk Assessment",
          ][index % 4],
          timestamp: new Date(
            Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };
      });

      setHeatPoints(heatData);
    } catch (error) {
      console.error("Error loading heat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (intensity: number, layer: HeatLayer): string => {
    const normalizedIntensity = Math.min(intensity / 100, 1);
    const baseColor = layer.color;

    // Convert hex to RGB
    const hex = baseColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${normalizedIntensity * layer.opacity})`;
  };

  const getCircleRadius = (value: number, maxValue: number): number => {
    return Math.max(10, (value / maxValue) * 50);
  };

  const filteredHeatPoints = heatPoints.filter((point) => {
    const intensityInRange =
      point.intensity >= intensityThreshold[0] &&
      point.intensity <= intensityThreshold[1];
    const categoryMatch =
      selectedCategory === "all" || point.category === selectedCategory;
    return intensityInRange && categoryMatch;
  });

  const startAnimation = () => {
    setIsAnimating(true);
    const animate = () => {
      setCurrentFrame((prev) => (prev + 1) % 60); // 60 frame cycle
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const exportHeatData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Location,Latitude,Longitude,Intensity,Sessions,Participants,Completion,Engagement,Satisfaction,Impact,Category\n" +
      filteredHeatPoints
        .map(
          (point) =>
            `${point.location},${point.lat},${point.lng},${point.intensity},${point.sessions},${point.participants},${point.completion},${point.engagement},${point.satisfaction},${point.impact},${point.category}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "training_heat_signatures.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleLayer = (layerId: string) => {
    setHeatLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setHeatLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, opacity } : layer
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heat Signature Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Thermometer className="w-5 h-5 mr-2" />
              Training Heat Signature Analysis
              <Badge variant="secondary" className="ml-2">
                {filteredHeatPoints.length} locations
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">JanRakshak</div>
              <div className="text-xs text-gray-500">
                Disaster Management Training System
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Metric</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intensity">Overall Intensity</SelectItem>
                  <SelectItem value="sessions">Training Sessions</SelectItem>
                  <SelectItem value="participants">Participants</SelectItem>
                  <SelectItem value="engagement">Engagement Level</SelectItem>
                  <SelectItem value="impact">Training Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Disaster Management">
                    Disaster Management
                  </SelectItem>
                  <SelectItem value="Community Training">
                    Community Training
                  </SelectItem>
                  <SelectItem value="Emergency Response">
                    Emergency Response
                  </SelectItem>
                  <SelectItem value="Risk Assessment">
                    Risk Assessment
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={exportHeatData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                onClick={isAnimating ? stopAnimation : startAnimation}
                variant={isAnimating ? "destructive" : "default"}
                size="sm"
              >
                {isAnimating ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Intensity Threshold Slider */}
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">
              Intensity Range: {intensityThreshold[0]}% -{" "}
              {intensityThreshold[1]}%
            </label>
            <Slider
              value={intensityThreshold}
              onValueChange={setIntensityThreshold}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
          <TabsTrigger value="layers">Layer Control</TabsTrigger>
          <TabsTrigger value="analysis">Intensity Analysis</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspot Detection</TabsTrigger>
        </TabsList>

        {/* Interactive Heat Map */}
        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Training Activity Heat Map
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Data
                  </Badge>
                  {isAnimating && (
                    <Badge variant="secondary">Frame {currentFrame}</Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapContainer
                  center={[20.5937, 78.9629]} // India center
                  zoom={5}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {/* Heat signature circles for each visible layer */}
                  {heatLayers
                    .filter((layer) => layer.visible)
                    .map((layer) =>
                      filteredHeatPoints.map((point) => {
                        const value = point[
                          selectedMetric as keyof HeatPoint
                        ] as number;
                        const maxValue = Math.max(
                          ...filteredHeatPoints.map(
                            (p) =>
                              p[selectedMetric as keyof HeatPoint] as number
                          )
                        );
                        const radius = getCircleRadius(value, maxValue);
                        const color = getHeatColor(point.intensity, layer);

                        // Add animation effect
                        const animatedRadius = isAnimating
                          ? radius +
                            Math.sin(currentFrame * 0.1 + point.lat) * 5
                          : radius;

                        return (
                          <Circle
                            key={`${layer.id}_${point.id}`}
                            center={[point.lat, point.lng]}
                            radius={animatedRadius * 1000} // Convert to meters
                            pathOptions={{
                              color: color,
                              fillColor: color,
                              fillOpacity: layer.opacity,
                              weight: 2,
                            }}
                          >
                            <Popup>
                              <div className="space-y-2">
                                <h3 className="font-bold">{point.location}</h3>
                                <p className="text-sm">{point.category}</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>Sessions: {point.sessions}</div>
                                  <div>Participants: {point.participants}</div>
                                  <div>
                                    Completion: {point.completion.toFixed(1)}%
                                  </div>
                                  <div>
                                    Engagement: {point.engagement.toFixed(1)}%
                                  </div>
                                  <div>
                                    Satisfaction:{" "}
                                    {point.satisfaction.toFixed(1)}%
                                  </div>
                                  <div>Impact: {point.impact.toFixed(1)}%</div>
                                </div>
                                <Badge
                                  variant={
                                    point.intensity > 70
                                      ? "destructive"
                                      : point.intensity > 40
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  Intensity: {point.intensity.toFixed(1)}%
                                </Badge>
                              </div>
                            </Popup>
                          </Circle>
                        );
                      })
                    )}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layer Control */}
        <TabsContent value="layers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heatLayers.map((layer) => (
              <Card key={layer.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded mr-2"
                        style={{ backgroundColor: layer.color }}
                      />
                      {layer.name}
                    </div>
                    <Button
                      variant={layer.visible ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleLayer(layer.id)}
                    >
                      {layer.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <Filter className="w-4 h-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <label className="text-xs">
                      Opacity: {Math.round(layer.opacity * 100)}%
                    </label>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={(value) =>
                        updateLayerOpacity(layer.id, value[0] / 100)
                      }
                      max={100}
                      min={0}
                      step={5}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Intensity Analysis */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  High Intensity Zones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredHeatPoints
                    .filter((point) => point.intensity > 70)
                    .sort((a, b) => b.intensity - a.intensity)
                    .slice(0, 5)
                    .map((point) => (
                      <div
                        key={point.id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{point.location}</span>
                        <Badge variant="destructive">
                          {point.intensity.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Participation Leaders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredHeatPoints
                    .sort((a, b) => b.participants - a.participants)
                    .slice(0, 5)
                    .map((point) => (
                      <div
                        key={point.id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{point.location}</span>
                        <Badge variant="secondary">{point.participants}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredHeatPoints
                    .filter(
                      (point) => point.completion < 50 || point.engagement < 60
                    )
                    .sort(
                      (a, b) =>
                        a.completion +
                        a.engagement -
                        (b.completion + b.engagement)
                    )
                    .slice(0, 5)
                    .map((point) => (
                      <div
                        key={point.id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{point.location}</span>
                        <Badge variant="destructive">
                          {((point.completion + point.engagement) / 2).toFixed(
                            1
                          )}
                          %
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hotspot Detection */}
        <TabsContent value="hotspots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Activity Hotspots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredHeatPoints
                  .sort((a, b) => b.intensity - a.intensity)
                  .slice(0, 8)
                  .map((point) => (
                    <Card
                      key={point.id}
                      className="border-l-4"
                      style={{
                        borderLeftColor:
                          point.intensity > 70
                            ? "#ef4444"
                            : point.intensity > 40
                            ? "#f59e0b"
                            : "#22c55e",
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-sm">
                              {point.location}
                            </h4>
                            <Badge
                              variant={
                                point.intensity > 70 ? "destructive" : "default"
                              }
                            >
                              {point.intensity.toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {point.category}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Sessions:</span>
                              <span className="font-medium">
                                {point.sessions}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Participants:</span>
                              <span className="font-medium">
                                {point.participants}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Completion:</span>
                              <span className="font-medium">
                                {point.completion.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingHeatSignatures;
