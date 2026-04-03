import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  LayersControl,
  GeoJSON,
} from "react-leaflet";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Layers,
  Filter,
  Download,
} from "lucide-react";
import {
  getCoverageAnalytics,
  getTrainingAnalytics,
} from "@/lib/trainingService";
import "leaflet/dist/leaflet.css";

interface TrainingLocationData {
  state: string;
  district: string;
  coordinates: [number, number];
  sessionCount: number;
  participantCount: number;
  completionRate: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  coverageScore: number;
  lastTrainingDate?: string;
}

// Sample coordinates for major cities (in a real app, you'd get these from your database)
const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  // Tamil Nadu
  Chennai: [13.0827, 80.2707],
  Cuddalore: [11.748, 79.7714],
  Thanjavur: [10.787, 79.1378],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],

  // Maharashtra
  Mumbai: [19.076, 72.8777],
  Pune: [18.5204, 73.8567],
  Kolhapur: [16.705, 74.2433],
  Sangli: [16.8524, 74.5815],
  Satara: [17.6599, 74.0094],
  Nagpur: [21.1458, 79.0882],

  // Kerala
  Thiruvananthapuram: [8.5241, 76.9366],
  Kochi: [9.9312, 76.2673],
  Kozhikode: [11.2588, 75.7804],
  Wayanad: [11.6854, 76.132],
  Idukki: [9.856, 76.881],
  Alappuzha: [9.4981, 76.3388],
  Kottayam: [9.5915, 76.5222],

  // West Bengal
  Kolkata: [22.5726, 88.3639],
  Howrah: [22.5958, 88.2636],
  "North 24 Parganas": [22.6157, 88.4005],
  "South 24 Parganas": [22.1746, 88.4279],

  // Punjab
  Ludhiana: [30.901, 75.8573],
  Amritsar: [31.634, 74.8723],
  Firozpur: [30.9324, 74.615],
  Jalandhar: [31.326, 75.5762],

  // Telangana
  Hyderabad: [17.385, 78.4867],
  Warangal: [17.9689, 79.5941],
  Nizamabad: [18.6725, 78.0941],

  // Assam
  Guwahati: [26.1445, 91.7362],
  Dhemaji: [27.4728, 94.5527],
  Lakhimpur: [27.2046, 94.1175],
  Silchar: [24.8333, 92.7789],

  // Bihar
  Patna: [25.5941, 85.1376],
  Darbhanga: [26.1542, 85.8918],
  Muzaffarpur: [26.1209, 85.3647],
  Bhagalpur: [25.2425, 86.9842],

  // Odisha
  Bhubaneswar: [20.2961, 85.8245],
  Cuttack: [20.4625, 85.8828],
  Puri: [19.8135, 85.8312],
  Berhampur: [19.3149, 84.7941],

  // Uttarakhand
  Dehradun: [30.3165, 78.0322],
  Haridwar: [29.9457, 78.1642],
  Rishikesh: [30.0869, 78.2676],
  Nainital: [29.3803, 79.4636],
};

const TrainingCoverageMap: React.FC = () => {
  const [mapData, setMapData] = useState<TrainingLocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<
    "sessions" | "participants" | "coverage" | "risk"
  >("sessions");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [intensityThreshold, setIntensityThreshold] = useState([50]);
  const [mapStyle, setMapStyle] = useState("standard");

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [coverageData, analyticsData] = await Promise.all([
        getCoverageAnalytics(),
        getTrainingAnalytics(),
      ]);

      // Transform the data into map-ready format
      const transformedData: TrainingLocationData[] =
        coverageData.districtsCovered.map((item) => {
          const coordinates = DISTRICT_COORDINATES[item.district] || [0, 0];
          const completionRate = Math.random() * 100; // In real app, calculate from actual data
          const coverageScore = Math.random() * 100;

          // Determine risk level based on coverage and completion
          let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
          if (coverageScore < 30) riskLevel = "CRITICAL";
          else if (coverageScore < 50) riskLevel = "HIGH";
          else if (coverageScore < 75) riskLevel = "MEDIUM";

          return {
            state: item.state,
            district: item.district,
            coordinates: coordinates as [number, number],
            sessionCount: item.sessionCount,
            participantCount: item.participantCount,
            completionRate,
            riskLevel,
            coverageScore,
            lastTrainingDate: new Date(
              Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
            ).toISOString(),
          };
        });

      setMapData(transformedData);
    } catch (error) {
      console.error("Error loading map data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (location: TrainingLocationData): string => {
    switch (selectedMetric) {
      case "sessions":
        return location.sessionCount >= 5
          ? "#22c55e"
          : location.sessionCount >= 2
          ? "#f59e0b"
          : "#ef4444";
      case "participants":
        return location.participantCount >= 100
          ? "#22c55e"
          : location.participantCount >= 50
          ? "#f59e0b"
          : "#ef4444";
      case "coverage":
        return location.coverageScore >= 75
          ? "#22c55e"
          : location.coverageScore >= 50
          ? "#f59e0b"
          : "#ef4444";
      case "risk":
        switch (location.riskLevel) {
          case "LOW":
            return "#22c55e";
          case "MEDIUM":
            return "#f59e0b";
          case "HIGH":
            return "#f97316";
          case "CRITICAL":
            return "#ef4444";
        }
      default:
        return "#6b7280";
    }
  };

  const getMarkerSize = (location: TrainingLocationData): number => {
    switch (selectedMetric) {
      case "sessions":
        return Math.max(8, Math.min(25, location.sessionCount * 3));
      case "participants":
        return Math.max(8, Math.min(25, location.participantCount / 10));
      case "coverage":
        return Math.max(8, Math.min(25, location.coverageScore / 4));
      default:
        return 12;
    }
  };

  const filteredData = mapData.filter((location) => {
    if (riskFilter !== "all" && location.riskLevel !== riskFilter) return false;

    const metricValue =
      selectedMetric === "sessions"
        ? location.sessionCount
        : selectedMetric === "participants"
        ? location.participantCount
        : selectedMetric === "coverage"
        ? location.coverageScore
        : 50; // Default for risk

    return metricValue >= intensityThreshold[0];
  });

  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case "satellite":
        return "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
      case "terrain":
        return "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}";
      case "dark":
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportMapData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "State,District,Sessions,Participants,Coverage Score,Risk Level,Completion Rate\n" +
      mapData
        .map(
          (row) =>
            `${row.state},${row.district},${row.sessionCount},${
              row.participantCount
            },${row.coverageScore.toFixed(1)},${
              row.riskLevel
            },${row.completionRate.toFixed(1)}%`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "training_coverage_map_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Training Coverage Map Controls
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Metric Selection */}
            <div className="space-y-2">
              <Label>Display Metric</Label>
              <Select
                value={selectedMetric}
                onValueChange={(value: any) => setSelectedMetric(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessions">Training Sessions</SelectItem>
                  <SelectItem value="participants">
                    Participant Count
                  </SelectItem>
                  <SelectItem value="coverage">Coverage Score</SelectItem>
                  <SelectItem value="risk">Risk Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Map Style */}
            <div className="space-y-2">
              <Label>Map Style</Label>
              <Select value={mapStyle} onValueChange={setMapStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Risk Filter */}
            <div className="space-y-2">
              <Label>Risk Level Filter</Label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="CRITICAL">Critical Only</SelectItem>
                  <SelectItem value="HIGH">High Risk</SelectItem>
                  <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                  <SelectItem value="LOW">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={exportMapData}>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={loadMapData}>
                  <Activity className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Intensity Threshold */}
          <div className="mt-4 space-y-2">
            <Label>Intensity Threshold: {intensityThreshold[0]}</Label>
            <Slider
              value={intensityThreshold}
              onValueChange={setIntensityThreshold}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>

          {/* Heat Map Toggle */}
          <div className="mt-4 flex items-center space-x-2">
            <Switch
              id="heatmap"
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
            />
            <Label htmlFor="heatmap">Show Heat Signatures</Label>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Layers className="w-5 h-5 mr-2" />
              Training Coverage Heat Map
            </div>
            <Badge variant="outline">
              {filteredData.length} locations shown
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full rounded-lg overflow-hidden border">
            <MapContainer
              center={[20.5937, 78.9629]} // Center of India
              zoom={5}
              style={{ height: "100%", width: "100%" }}
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Map">
                  <TileLayer
                    url={getTileLayerUrl()}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    subdomains={
                      mapStyle === "satellite" || mapStyle === "terrain"
                        ? ["mt0", "mt1", "mt2", "mt3"]
                        : ["a", "b", "c"]
                    }
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              {/* Training Location Markers */}
              {filteredData.map((location, index) => (
                <CircleMarker
                  key={index}
                  center={location.coordinates}
                  radius={getMarkerSize(location)}
                  fillColor={getMarkerColor(location)}
                  color="#ffffff"
                  weight={2}
                  opacity={showHeatmap ? 0.8 : 0.6}
                  fillOpacity={showHeatmap ? 0.7 : 0.5}
                >
                  <Popup>
                    <div className="p-3 min-w-[250px]">
                      <div className="font-semibold text-lg mb-2">
                        {location.district}, {location.state}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Training Sessions:
                          </span>
                          <Badge variant="outline">
                            {location.sessionCount}
                          </Badge>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Participants:</span>
                          <Badge variant="outline">
                            {location.participantCount}
                          </Badge>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Coverage Score:</span>
                          <Badge variant="outline">
                            {location.coverageScore.toFixed(1)}%
                          </Badge>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Completion Rate:
                          </span>
                          <Badge variant="outline">
                            {location.completionRate.toFixed(1)}%
                          </Badge>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Risk Level:</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadgeColor(
                              location.riskLevel
                            )}`}
                          >
                            {location.riskLevel}
                          </span>
                        </div>

                        {location.lastTrainingDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Last Training:
                            </span>
                            <span className="text-sm">
                              {new Date(
                                location.lastTrainingDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Map Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Map Legend & Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Legend */}
            <div>
              <h4 className="font-semibold mb-3">
                Color Coding ({selectedMetric})
              </h4>
              <div className="space-y-2">
                {selectedMetric === "risk" ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">Low Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Medium Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      <span className="text-sm">High Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span className="text-sm">Critical Risk</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">High Performance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Medium Performance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span className="text-sm">Low Performance</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h4 className="font-semibold mb-3">Coverage Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {mapData.filter((l) => l.riskLevel === "CRITICAL").length}
                  </div>
                  <div className="text-sm text-blue-700">Critical Areas</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {mapData.filter((l) => l.coverageScore >= 75).length}
                  </div>
                  <div className="text-sm text-green-700">Well Covered</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {mapData.reduce((sum, l) => sum + l.sessionCount, 0)}
                  </div>
                  <div className="text-sm text-orange-700">Total Sessions</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {mapData.reduce((sum, l) => sum + l.participantCount, 0)}
                  </div>
                  <div className="text-sm text-purple-700">
                    Total Participants
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingCoverageMap;
