import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  MapPin,
  CloudRain,
  AlertTriangle,
  RefreshCw,
  Shield,
  Database,
  Calendar,
  TrendingUp,
  Droplets,
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
import { toast } from "sonner";
import { floodPredictionService } from "@/lib/floodPredictionService";

const FloodPredictionSimple: React.FC = () => {
  const { theme } = useTheme();
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [loading, setLoading] = useState(false);
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
      // Check API health first
      const healthResponse = await fetch(
        "https://janrakshak-pre-alert-model.onrender.com/health"
      );
      const healthData = await healthResponse.json();

      // If API is healthy, proceed normally without delay
      if (healthData.status === "healthy") {
        const predictionResult =
          await floodPredictionService.predictRegionalRisk(selectedLocation);
        setResult(predictionResult);
        toast.success(`Flood prediction generated for ${selectedLocation}`);
      } else {
        // If API is not healthy, simulate error with 5 second delay
        await new Promise((resolve) => setTimeout(resolve, 5000));
        throw new Error("API service is currently unavailable");
      }
    } catch (err) {
      // If health check fails or API returns error, show 5 second loading
      if (err instanceof Error && err.message.includes("API service")) {
        // Already waited 5 seconds above
      } else {
        // Health check failed, add 5 second delay
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate flood prediction";
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
    <div className="space-y-6">
      <style>{`
        ${theme === 'high-contrast' ? `
          .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900,
          .text-gray-500, .text-gray-400, .text-slate-600, .text-slate-700,
          .text-slate-500, .text-slate-900, .text-slate-800 {
            color: hsl(0, 0%, 100%) !important;
          }
          .bg-white\\/80, .bg-white\\/90, .bg-white\\/95, .bg-white {
            background-color: hsl(0, 0%, 10%) !important;
          }
          .bg-clip-text {
            -webkit-text-fill-color: hsl(47, 100%, 60%) !important;
          }
        ` : ''}
      `}</style>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <span>Flood Prediction</span>
        </h1>
        <p className="text-gray-600">
          AI-powered flood prediction using JanRakshak Pre-Alert Model
        </p>
      </div>

      {/* Location Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Location Selection</span>
          </CardTitle>
          <CardDescription>
            Select your state and location to get flood predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">Select State</Label>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a state" />
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
              <Label htmlFor="location">Select Location</Label>
              <Select
                value={selectedLocation}
                onValueChange={handleLocationChange}
                disabled={!selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a location" />
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
                Analyzing Damage...
              </>
            ) : (
              <>
                <CloudRain className="w-4 h-4 mr-2" />
                Predict Flood Damage
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charts">Charts & Graphs</TabsTrigger>
              <TabsTrigger value="forecast">Detailed Forecast</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Main Prediction Card */}
              {result.main_prediction && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-800">
                      <MapPin className="w-6 h-6" />
                      <span>Flood Damage Assessment - {selectedLocation}</span>
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
                        Daily flood damage assessment and weather conditions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {result.detailed_forecast
                          .filter((day) => day && typeof day === "object")
                          .slice(0, 10)
                          .map((day, index) => (
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
              {/* Charts and Graphs */}
              {chartData.length > 0 && (
                <div className="space-y-6">
                  {/* Rainfall Trend Chart */}
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-purple-800">
                        <LineChart className="w-6 h-6" />
                        <span>Rainfall Trend Analysis</span>
                      </CardTitle>
                      <CardDescription className="text-purple-600">
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

                  {/* Risk Level Trend Chart */}
                  <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-orange-800">
                        <BarChart3 className="w-6 h-6" />
                        <span>Risk Level Trend</span>
                      </CardTitle>
                      <CardDescription className="text-orange-600">
                        Daily risk level progression (1=Safe, 5=Critical)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 5]} />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="riskScore"
                              fill="#ef4444"
                              name="Risk Score (1-5)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Level Distribution */}
                  <Card className="bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-indigo-800">
                        <PieChart className="w-6 h-6" />
                        <span>Risk Level Distribution</span>
                      </CardTitle>
                      <CardDescription className="text-indigo-600">
                        Distribution of risk levels across the forecast period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={chartData.map((day) => ({
                                name: day.riskLevel,
                                value: 1,
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.riskLevel
                                      .toLowerCase()
                                      .includes("critical")
                                      ? "#dc2626"
                                      : entry.riskLevel
                                          .toLowerCase()
                                          .includes("high")
                                      ? "#ef4444"
                                      : entry.riskLevel
                                          .toLowerCase()
                                          .includes("medium")
                                      ? "#f97316"
                                      : entry.riskLevel
                                          .toLowerCase()
                                          .includes("low")
                                      ? "#eab308"
                                      : "#22c55e"
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [value, "Days"]}
                              labelFormatter={(label) => `Risk Level: ${label}`}
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={60}
                              wrapperStyle={{
                                fontSize: "12px",
                                paddingTop: "10px",
                              }}
                              iconType="circle"
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* No Chart Data Message */}
              {chartData.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No Chart Data Available
                    </h3>
                    <p className="text-gray-500">
                      Generate a prediction to see interactive charts and
                      graphs.
                    </p>
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
                        Daily flood damage assessment and weather conditions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {result.detailed_forecast
                          .filter((day) => day && typeof day === "object")
                          .slice(0, 10)
                          .map((day, index) => (
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

              {/* Model Information */}
              {result.model_info && (
                <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                      <Database className="w-5 h-5" />
                      <span>Model Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Version
                        </h4>
                        <p className="text-blue-600 font-medium">
                          {result.model_info.version || "N/A"}
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Accuracy
                        </h4>
                        <p className="text-green-600 font-medium">
                          {result.model_info.accuracy || "N/A"}%
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Last Updated
                        </h4>
                        <p className="text-purple-600 font-medium">
                          {result.model_info.last_updated || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default FloodPredictionSimple;
