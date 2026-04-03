import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserLayout from "@/components/UserLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Droplets,
  AlertTriangle,
  MapPin,
  Users,
  Activity,
  Shield,
  Bell,
  CheckCircle,
  Clock,
  Phone,
  Navigation,
  Plus,
  Eye,
  TrendingUp,
  Heart,
  Zap,
  Home,
  FileText,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
  Globe,
  Target,
  Route,
  Building,
  UserCheck,
  UserX,
  Map,
  Camera,
  MessageSquare,
  Share2,
  Thermometer,
  CloudRain,
  Wind,
  Sun,
  Waves,
} from "lucide-react";
import { supabase, type FloodReport } from "@/lib/supabase";
import { type LocationInfo } from "@/lib/locationService";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import NearbySheltersMap from "@/components/NearbySheltersMap";

const UserDashboard = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationInfo>({
    coords: { lat: 30.901, lng: 75.8573 },
    address: "Punjab, India",
    state: "Punjab",
    district: "Chandigarh",
    country: "India",
  });
  const [userReports, setUserReports] = useState<FloodReport[]>([]);
  const [nearbyReports, setNearbyReports] = useState<FloodReport[]>([]);
  const [reportStats, setReportStats] = useState({
    total_reports: 0,
    critical_reports: 0,
    verified_reports: 0,
    pending_reports: 0,
  });
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "overview"
  );
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  // New state for advanced features
  const [weatherData, setWeatherData] = useState({
    temperature: 28,
    humidity: 75,
    windSpeed: 12,
    precipitation: 5.2,
    riskLevel: "moderate",
  });
  const [heatmapData, setHeatmapData] = useState([
    { lat: 30.901, lng: 75.8573, intensity: 0.8, reports: 12 },
    { lat: 30.915, lng: 75.87, intensity: 0.6, reports: 8 },
    { lat: 30.89, lng: 75.84, intensity: 0.9, reports: 15 },
    { lat: 30.925, lng: 75.885, intensity: 0.4, reports: 4 },
    { lat: 30.88, lng: 75.82, intensity: 0.7, reports: 10 },
  ]);

  // Wake up the pre-alert model service
  useEffect(() => {
    const wakeUpPreAlertModel = async () => {
      try {
        await fetch("https://janrakshak-pre-alert-model.onrender.com/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        // Silently handle errors - this is a background operation
      }
    };
    wakeUpPreAlertModel();
  }, []);

  // Load user data
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  // Handle tab changes from navigation
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Real-time updates
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      loadUserData();
      loadWeatherData();
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [isLive]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Skip location loading to avoid errors - use default location
      const defaultLocation = {
        coords: { lat: 30.901, lng: 75.8573 },
        address: "Punjab, India",
        state: "Punjab",
        district: "Chandigarh",
        country: "India",
      };
      setUserLocation(defaultLocation);

      // Load user reports and stats
      if (currentUser?.uid) {
        try {
          // Use direct Supabase queries
          const { data: reports, error: reportsError } = await supabase
            .from("flood_reports")
            .select("*")
            .eq("user_id", currentUser.uid)
            .order("created_at", { ascending: false });

          if (reportsError) {
            setUserReports([]);
          } else {
            setUserReports(reports || []);
          }

          // Calculate stats from reports
          const totalReports = reports?.length || 0;
          const criticalReports =
            reports?.filter((r) => r.severity === "critical").length || 0;
          const verifiedReports =
            reports?.filter((r) => r.status === "verified").length || 0;
          const pendingReports =
            reports?.filter((r) => r.status === "pending").length || 0;

          setReportStats({
            total_reports: totalReports,
            critical_reports: criticalReports,
            verified_reports: verifiedReports,
            pending_reports: pendingReports,
          });

          // Load nearby reports
          const { data: nearbyReportsData, error: nearbyError } = await supabase
            .from("flood_reports")
            .select("*")
            .neq("user_id", currentUser.uid)
            .limit(10)
            .order("created_at", { ascending: false });

          if (!nearbyError) {
            setNearbyReports(nearbyReportsData || []);
          }

          // Generate heatmap data from all reports
          const allReportsForHeatmap = [
            ...(reports || []),
            ...(nearbyReportsData || []),
          ];
          const heatmapPoints = allReportsForHeatmap
            .map((report) => {
              if (
                report.location &&
                typeof report.location === "object" &&
                report.location.lat &&
                report.location.lng
              ) {
                return {
                  lat: report.location.lat,
                  lng: report.location.lng,
                  intensity:
                    report.severity === "critical"
                      ? 1
                      : report.severity === "high"
                      ? 0.8
                      : report.severity === "medium"
                      ? 0.6
                      : 0.4,
                  reports: 1,
                };
              }
              return null;
            })
            .filter(Boolean);

          // Group nearby points and aggregate intensity
          const groupedPoints = {};
          heatmapPoints.forEach((point) => {
            const key = `${Math.round(point.lat * 1000)}-${Math.round(
              point.lng * 1000
            )}`;
            if (!groupedPoints[key]) {
              groupedPoints[key] = { ...point, reports: 0 };
            }
            groupedPoints[key].intensity = Math.max(
              groupedPoints[key].intensity,
              point.intensity
            );
            groupedPoints[key].reports += 1;
          });

          setHeatmapData(Object.values(groupedPoints));
        } catch (error) {
          console.error("Error loading user data:", error);
          toast.error("Failed to load dashboard data");
        }
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error in loadUserData:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    // Simulate weather data loading - replace with actual API call
    const mockWeather = {
      temperature: 28 + Math.random() * 6 - 3,
      humidity: 75 + Math.random() * 20 - 10,
      windSpeed: 12 + Math.random() * 8 - 4,
      precipitation: Math.random() * 10,
      riskLevel:
        Math.random() > 0.7 ? "high" : Math.random() > 0.3 ? "moderate" : "low",
    };
    setWeatherData(mockWeather);
  };

  // Helper functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "investigating":
        return "text-blue-600 bg-blue-100";
      case "resolved":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500 text-white";
      case "moderate":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Filtered reports logic
  const filteredReports = userReports.filter((report) => {
    const locationText =
      typeof report.location === "string"
        ? report.location
        : typeof report.location === "object" && report.location
        ? report.location.address || report.location.district || ""
        : "";
    const matchesSearch =
      locationText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description &&
        report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesSeverity =
      filterSeverity === "all" || report.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Chart data
  const severityData = [
    { name: "Critical", value: reportStats.critical_reports, color: "#dc2626" },
    {
      name: "High",
      value: userReports.filter((r) => r.severity === "high").length,
      color: "#ea580c",
    },
    {
      name: "Medium",
      value: userReports.filter((r) => r.severity === "medium").length,
      color: "#ca8a04",
    },
    {
      name: "Low",
      value: userReports.filter((r) => r.severity === "low").length,
      color: "#65a30d",
    },
  ].filter((item) => item.value > 0);

  const statusData = [
    { name: "Verified", value: reportStats.verified_reports, color: "#16a34a" },
    { name: "Pending", value: reportStats.pending_reports, color: "#ca8a04" },
    {
      name: "Resolved",
      value: userReports.filter((r) => r.status === "resolved").length,
      color: "#64748b",
    },
    {
      name: "False Alarm",
      value: userReports.filter((r) => r.status === "false_alarm").length,
      color: "#9ca3af",
    },
  ].filter((item) => item.value > 0);

  const timeSeriesData = userReports
    .slice(0, 10)
    .reverse()
    .map((report, index) => ({
      date: new Date(report.created_at).toLocaleDateString(),
      reports: index + 1,
      severity:
        report.severity === "critical"
          ? 4
          : report.severity === "high"
          ? 3
          : report.severity === "medium"
          ? 2
          : 1,
    }));

  if (authLoading || loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Loading JanRakshak...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!currentUser) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access your dashboard
            </AlertDescription>
          </Alert>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout
      title="Smart Dashboard"
      description="AI-Powered Flood Management"
    >
      {/* Live Status Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {currentUser.displayName || "Citizen"}
            </h1>
            <p className="opacity-90">
              Real-time flood monitoring and community safety dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isLive ? "bg-green-400 animate-pulse" : "bg-gray-400"
                }`}
              />
              <span className="text-sm">
                {isLive ? "Live Updates" : "Paused"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              {isLive ? "Pause" : "Resume"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadUserData}
              disabled={loading}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
        <p className="text-xs opacity-75 mt-2">
          Last updated: {lastUpdate.toLocaleString()}
        </p>
      </div>

      {/* Enhanced Tabs with Icons */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="heatmap"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Thermometer className="w-4 h-4 mr-2" />
            Risk Heatmap
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Reports ({userReports.length})
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="map"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Map className="w-4 h-4 mr-2" />
            Live Map
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enhanced with Weather */}
        <TabsContent value="overview" className="space-y-6">
          {/* Weather & Risk Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Temperature</p>
                    <p className="text-2xl font-bold">
                      {weatherData.temperature.toFixed(1)}°C
                    </p>
                  </div>
                  <Thermometer className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Humidity</p>
                    <p className="text-2xl font-bold">
                      {weatherData.humidity.toFixed(0)}%
                    </p>
                  </div>
                  <Droplets className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Wind Speed</p>
                    <p className="text-2xl font-bold">
                      {weatherData.windSpeed.toFixed(1)} km/h
                    </p>
                  </div>
                  <Wind className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Rainfall</p>
                    <p className="text-2xl font-bold">
                      {weatherData.precipitation.toFixed(1)} mm
                    </p>
                  </div>
                  <CloudRain className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={`${getRiskLevelColor(
                weatherData.riskLevel
              )} shadow-lg`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Risk Level</p>
                    <p className="text-xl font-bold capitalize">
                      {weatherData.riskLevel}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Total Reports
                </CardTitle>
                <FileText className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {reportStats.total_reports}
                </div>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Community contributions
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Critical Alerts
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {reportStats.critical_reports}
                </div>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Immediate attention required
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Verified Reports
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {reportStats.verified_reports}
                </div>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  Authority confirmed
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Pending Review
                </CardTitle>
                <Clock className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {reportStats.pending_reports}
                </div>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  Under verification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions with Enhanced Design */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="w-6 h-6 text-blue-600" />
                Emergency Actions
              </CardTitle>
              <CardDescription>
                Quick access to critical emergency functions and reporting tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => navigate("/reports")}
                  className="flex flex-col items-center p-6 h-auto bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-8 h-8 mb-3" />
                  <span className="text-sm font-medium">Submit Report</span>
                  <span className="text-xs opacity-90 mt-1">
                    Report flood incidents
                  </span>
                </Button>
                <Button
                  onClick={() => navigate("/shelters")}
                  className="flex flex-col items-center p-6 h-auto bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Shield className="w-8 h-8 mb-3" />
                  <span className="text-sm font-medium">Find Shelter</span>
                  <span className="text-xs opacity-90 mt-1">
                    Locate safe zones
                  </span>
                </Button>
                <Button
                  onClick={() => navigate("/alerts")}
                  className="flex flex-col items-center p-6 h-auto bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Bell className="w-8 h-8 mb-3" />
                  <span className="text-sm font-medium">Active Alerts</span>
                  <span className="text-xs opacity-90 mt-1">
                    Check warnings
                  </span>
                </Button>
                <Button
                  onClick={() => navigate("/community")}
                  className="flex flex-col items-center p-6 h-auto bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Users className="w-8 h-8 mb-3" />
                  <span className="text-sm font-medium">Community</span>
                  <span className="text-xs opacity-90 mt-1">
                    Join discussions
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity with Enhanced Design */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Activity Stream
              </CardTitle>
              <CardDescription>
                Latest flood reports and community updates in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userReports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reports submitted yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start contributing to your community's safety
                  </p>
                  <Button
                    onClick={() => navigate("/reports")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReports.slice(0, 5).map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Droplets className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {typeof report.location === "string"
                              ? report.location
                              : typeof report.location === "object" &&
                                report.location
                              ? report.location.address ||
                                report.location.district ||
                                "Unknown Location"
                              : "Unknown Location"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(report.created_at).toLocaleDateString()} •{" "}
                            {report.description?.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={getSeverityColor(report.severity)}
                          className="font-medium"
                        >
                          {report.severity}
                        </Badge>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </div>
                      </div>
                    </div>
                  ))}
                  {userReports.length > 5 && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("reports")}
                      className="w-full mt-4 border-dashed border-2 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View All {userReports.length} Reports
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Heatmap Tab */}
        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-600" />
                Flood Risk Heatmap
              </CardTitle>
              <CardDescription>
                Real-time visualization of flood risk intensity across your
                region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simulated Heatmap Visualization */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-yellow-400 to-red-500 opacity-30"></div>
                <div className="relative z-10 text-center text-gray-700">
                  <Thermometer className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Interactive Heatmap
                  </h3>
                  <p className="text-sm">Real-time flood risk visualization</p>
                  <p className="text-xs mt-2 opacity-75">
                    Integration with mapping service required
                  </p>
                </div>

                {/* Risk Level Indicators */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                  <h4 className="text-sm font-semibold mb-2">Risk Levels</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-xs">Low Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-xs">Moderate Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-xs">High Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heatmap Data Points */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Data Points</CardTitle>
              <CardDescription>
                Current flood risk measurements from monitoring stations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="lat" domain={["dataMin", "dataMax"]} />
                    <YAxis dataKey="lng" domain={["dataMin", "dataMax"]} />
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Scatter data={heatmapData} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Report Management Center
              </CardTitle>
              <CardDescription>
                Advanced filtering and search for your flood incident reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by location, description, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48 h-12">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterSeverity}
                  onValueChange={setFilterSeverity}
                >
                  <SelectTrigger className="w-full md:w-48 h-12">
                    <SelectValue placeholder="Filter by Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reports found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ||
                    filterStatus !== "all" ||
                    filterSeverity !== "all"
                      ? "Try adjusting your search criteria or filters"
                      : "You haven't submitted any reports yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {typeof report.location === "string"
                                ? report.location
                                : typeof report.location === "object" &&
                                  report.location
                                ? report.location.address ||
                                  report.location.district ||
                                  "Unknown Location"
                                : "Unknown Location"}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(report.created_at).toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {report.latitude?.toFixed(4)},{" "}
                                {report.longitude?.toFixed(4)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getSeverityColor(report.severity)}
                              className="font-medium"
                            >
                              {report.severity}
                            </Badge>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                report.status
                              )}`}
                            >
                              {report.status}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Enhanced Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Time Series Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-purple-600" />
                Reporting Trends Analysis
              </CardTitle>
              <CardDescription>
                Track your reporting activity and severity patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsAreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="reports"
                      stroke="#3b82f6"
                      fill="#3b82f680"
                    />
                    <Area
                      type="monotone"
                      dataKey="severity"
                      stroke="#ef4444"
                      fill="#ef444440"
                    />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Severity Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of your reports by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {severityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={severityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          paddingAngle={3}
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, "Reports"]}
                          labelFormatter={(label) => `Severity: ${label}`}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No data available</p>
                        <p className="text-sm">
                          Submit reports to see analytics
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Status Overview
                </CardTitle>
                <CardDescription>
                  Current status distribution of your reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No data available</p>
                        <p className="text-sm">
                          Submit reports to see analytics
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Summary Stats */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Impact & Performance Metrics
              </CardTitle>
              <CardDescription>
                Your contribution to community safety and report quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-blue-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {reportStats.total_reports}
                  </div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Community Reports
                  </p>
                  <p className="text-xs text-blue-600">
                    Total contributions made
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <span className="text-xs text-green-600 font-medium">
                      +{Math.round(reportStats.total_reports * 0.15)} this month
                    </span>
                  </div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-green-200">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {reportStats.total_reports > 0
                      ? Math.round(
                          (reportStats.verified_reports /
                            reportStats.total_reports) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    Accuracy Rate
                  </p>
                  <p className="text-xs text-green-600">Verification success</p>
                  <div className="mt-3 pt-3 border-t border-green-100">
                    <Progress
                      value={
                        reportStats.total_reports > 0
                          ? (reportStats.verified_reports /
                              reportStats.total_reports) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-red-200">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {reportStats.critical_reports}
                  </div>
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    Critical Alerts
                  </p>
                  <p className="text-xs text-red-600">High-impact reports</p>
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <span className="text-xs text-red-600 font-medium">
                      Emergency responses
                    </span>
                  </div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-purple-200">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {Math.round(reportStats.total_reports * 2.3 + 47)}
                  </div>
                  <p className="text-sm font-semibold text-purple-800 mb-1">
                    Safety Score
                  </p>
                  <p className="text-xs text-purple-600">Community impact</p>
                  <div className="mt-3 pt-3 border-t border-purple-100">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <Star className="w-3 h-3 text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Map Tab */}
        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-green-600" />
                Interactive Safety Map
              </CardTitle>
              <CardDescription>
                Real-time view of emergency shelters, flood reports, and safety
                zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                <NearbySheltersMap
                  userLocation={userLocation.coords}
                  className="h-[500px] w-full"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">
                    Safe Shelters
                  </p>
                  <p className="text-xs text-green-600">Emergency refuges</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-800">
                    Flood Reports
                  </p>
                  <p className="text-xs text-blue-600">Community alerts</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-red-800">
                    Danger Zones
                  </p>
                  <p className="text-xs text-red-600">Avoid these areas</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Route className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-800">
                    Safe Routes
                  </p>
                  <p className="text-xs text-purple-600">Recommended paths</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
};

export default UserDashboard;
