import React, { useEffect, useState } from "react";
import NDMALayout from "@/components/NDMALayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CloudRain,
  Droplets,
  AlertTriangle,
  TrendingUp,
  MapPin,
  RefreshCw,
  Shield,
  Database,
  Calendar,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import { floodPredictionService } from "@/lib/floodPredictionService";

const DMAFloodPrediction = () => {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const states = floodPredictionService.getStates();
  const locations = selectedState
    ? floodPredictionService.getLocationsByState(selectedState)
    : [];

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedLocation("");
    setResult(null);
    setError("");
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setResult(null);
    setError("");
  };

  const handleGeneratePrediction = async () => {
    if (!selectedLocation) {
      toast.error("Please select a location first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const predictionResult = await floodPredictionService.predictRegionalRisk(
        selectedLocation
      );
      setResult(predictionResult);
      toast.success(`Prediction generated for ${selectedLocation}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate prediction";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from real API data
  const prepareChartData = () => {
    if (!result?.detailed_forecast || !Array.isArray(result.detailed_forecast))
      return [];

    return result.detailed_forecast
      .slice(0, 10)
      .map((day: any, index: number) => {
        const rainfall =
          typeof day.rainfall_mm === "number" ? day.rainfall_mm : 0;
        const confidence =
          typeof day.confidence === "number" ? day.confidence * 100 : 0;
        const riskLevel = day.risk_level || "Unknown";

        return {
          day: `Day ${index + 1}`,
          date: new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          rainfall: rainfall,
          confidence: confidence,
          riskLevel: riskLevel,
          riskScore: getRiskScore(riskLevel),
        };
      });
  };

  const getRiskScore = (riskLevel: string): number => {
    if (!riskLevel) return 0;

    const level = riskLevel.toLowerCase();
    if (level.includes("critical")) return 5;
    if (level.includes("high")) return 4;
    if (level.includes("medium")) return 3;
    if (level.includes("low")) return 2;
    if (level.includes("safe") || level.includes("no significant")) return 1;
    return 0;
  };

  const chartData = prepareChartData();
  return (
    <NDMALayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span>DMA Flood Prediction Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Generate and analyze flood predictions for district management
            </p>
          </div>
        </div>

        {/* Location Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Select Location</span>
            </CardTitle>
            <CardDescription>
              Choose a state and location to generate flood prediction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={selectedState} onValueChange={handleStateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={selectedLocation}
                  onValueChange={handleLocationChange}
                  disabled={!selectedState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGeneratePrediction}
              disabled={!selectedLocation || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CloudRain className="w-4 h-4 mr-2" />
                  Generate Prediction
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="charts">Charts & Graphs</TabsTrigger>
                <TabsTrigger value="forecast">Detailed Forecast</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Main Prediction Card */}
                {result.main_prediction && (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-blue-800">
                        <MapPin className="w-6 h-6" />
                        <span>Flood Risk Assessment - {selectedLocation}</span>
                      </CardTitle>
                      <CardDescription className="text-blue-600">
                        AI-powered flood prediction using JanRakshak Pre-Alert
                        Model
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-blue-100">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-gray-700">
                              Risk Level
                            </h3>
                          </div>
                          <p className="text-2xl font-bold text-gray-800">
                            {result.main_prediction["Risk Level"] || "N/A"}
                          </p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow-sm border border-blue-100">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-700">
                              Confidence
                            </h3>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {result.main_prediction["Confidence"] || "N/A"}
                          </p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow-sm border border-blue-100">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-700">
                              Risk Date
                            </h3>
                          </div>
                          <p className="text-lg font-semibold text-blue-600">
                            {result.main_prediction["Risk Date"] || "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="forecast" className="space-y-4">
                {/* Detailed Forecast */}
                {result.detailed_forecast &&
                  Array.isArray(result.detailed_forecast) &&
                  result.detailed_forecast.length > 0 && (
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-green-800">
                          <CloudRain className="w-6 h-6" />
                          <span>10-Day Detailed Forecast</span>
                        </CardTitle>
                        <CardDescription className="text-green-600">
                          Daily flood risk assessment and weather conditions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {result.detailed_forecast
                            .filter(
                              (day: any) => day && typeof day === "object"
                            )
                            .slice(0, 10)
                            .map((day: any, index: number) => (
                              <div
                                key={index}
                                className="p-4 bg-white rounded-xl shadow-sm border border-green-100 text-center"
                              >
                                <div className="text-sm font-medium text-gray-600 mb-2">
                                  {new Date(day.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </div>
                                <div className="text-sm font-bold mb-2 text-gray-800">
                                  {day.risk_level || "N/A"}
                                </div>
                                <div className="space-y-1 text-xs text-gray-600">
                                  <div className="flex items-center justify-center space-x-1">
                                    <Droplets className="w-3 h-3" />
                                    <span>
                                      {day.rainfall_mm
                                        ? day.rainfall_mm.toFixed(3)
                                        : "N/A"}
                                      mm
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-center space-x-1">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>
                                      {day.confidence
                                        ? (day.confidence * 100).toFixed(0)
                                        : "N/A"}
                                      %
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </TabsContent>

              <TabsContent value="charts" className="space-y-4">
                {/* Rainfall Trend Chart */}
                {chartData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <LineChart className="w-5 h-5" />
                        <span>Rainfall Trend Analysis</span>
                      </CardTitle>
                      <CardDescription>
                        10-day rainfall forecast with confidence levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="rainfall"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              name="Rainfall (mm)"
                            />
                            <Line
                              type="monotone"
                              dataKey="confidence"
                              stroke="#10b981"
                              strokeWidth={2}
                              name="Confidence (%)"
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Level Trend Chart */}
                {chartData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Risk Level Trend</span>
                      </CardTitle>
                      <CardDescription>
                        Daily risk level progression (1=Safe, 5=Critical)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="riskScore"
                              fill="#f59e0b"
                              name="Risk Score"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="raw" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="w-5 h-5" />
                      <span>Raw API Response</span>
                    </CardTitle>
                    <CardDescription>
                      Complete JSON response from the flood prediction service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                      <pre className="text-sm">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </NDMALayout>
  );
};

export default DMAFloodPrediction;
