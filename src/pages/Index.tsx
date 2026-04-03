import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import GradientCard from "@/components/GradientCard";
import MapComponent from "@/components/Map";
import Notch from "@/components/Notch";
import { useAuth } from "@/contexts/AuthContext";
import { getLocationData, getNearbyReports } from "@/lib/supabase";
import {
  getLocationWithDetails,
  type LocationInfo,
} from "@/lib/locationService";
import {
  Droplets,
  AlertTriangle,
  TrendingUp,
  Phone,
  MapPin,
  Users,
  Activity,
  Shield,
  Zap,
  Eye,
  Download,
  Bell,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Navigation,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import JanRakshakChatbot from "@/components/JanRakshakChatbot";

const Dashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Location-based state
  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [localReports, setLocalReports] = useState(0);
  const [localRiskLevel, setLocalRiskLevel] = useState<
    "safe" | "warning" | "critical"
  >("safe");

  // Existing state
  const [waterLevel, setWaterLevel] = useState(65);
  const [activeAlerts, setActiveAlerts] = useState(5);
  const [protectedAreas, setProtectedAreas] = useState(1247);
  const [watchZones, setWatchZones] = useState(23);
  const [communityMembers, setCommunityMembers] = useState(89456);

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

  // Load user location and local data
  useEffect(() => {
    loadLocationData();
  }, []);

  const loadLocationData = async () => {
    setLocationLoading(true);
    try {
      const location = await getLocationWithDetails();
      setUserLocation(location);

      // Load location-based data
      if (location.state) {
        const locationData = await getLocationData(
          location.state,
          location.district
        );
        if (locationData.length > 0) {
          const currentData = locationData[0];
          setWaterLevel(currentData.current_water_level || 65);
          setLocalRiskLevel(currentData.risk_level || "safe");
        }

        // Load nearby reports
        const reports = await getNearbyReports(
          location.coords.lat,
          location.coords.lng,
          50
        );
        setLocalReports(reports.length);
        setActiveAlerts(
          reports.filter(
            (r) => r.severity === "critical" || r.severity === "high"
          ).length
        );
      }

      toast.success(
        `Location detected: ${location.district}, ${location.state}`
      );
    } catch (error) {
      console.error("Error loading location data:", error);
      // Use default Punjab location
      setUserLocation({
        coords: { lat: 30.901, lng: 75.8573 },
        address: "Punjab, India",
        state: "Punjab",
        district: "",
        country: "India",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWaterLevel((prev) =>
        Math.max(20, Math.min(95, prev + (Math.random() - 0.5) * 3))
      );
      setActiveAlerts((prev) =>
        Math.max(0, Math.min(15, prev + Math.floor((Math.random() - 0.5) * 2)))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const riskLevel =
    waterLevel > 80 ? "Critical" : waterLevel > 60 ? "Moderate" : "Safe";
  const riskColor =
    waterLevel > 80 ? "danger" : waterLevel > 60 ? "warning" : "success";

  const riskZones = [
    {
      name: "Normal Levels",
      percentage: 67,
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: CheckCircle,
    },
    {
      name: "Warning Zones",
      percentage: 28,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      icon: AlertTriangle,
    },
    {
      name: "Critical Areas",
      percentage: 5,
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: AlertTriangle,
    },
  ];

  const waterLevelGauges = [
    {
      city: userLocation?.district || "Amritsar",
      level: waterLevel,
      status:
        localRiskLevel === "critical"
          ? "Critical"
          : localRiskLevel === "warning"
          ? "Warning"
          : "Normal",
      color:
        localRiskLevel === "critical"
          ? "bg-red-500"
          : localRiskLevel === "warning"
          ? "bg-yellow-500"
          : "bg-green-500",
    },
    { city: "Ludhiana", level: 62, status: "Moderate", color: "bg-yellow-500" },
    { city: "Jalandhar", level: 35, status: "Light", color: "bg-green-500" },
    { city: "Patiala", level: 15, status: "Minimal", color: "bg-green-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-teal-500 to-green-400 p-8 text-white">
        <div className="relative z-10 text-center space-y-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <h1 className="text-5xl font-bold">Real-Time Flood Monitoring</h1>
            {locationLoading && <Loader2 className="w-6 h-6 animate-spin" />}
          </div>

          {/* Location Banner */}
          {userLocation && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>
                  Monitoring: {userLocation.district || userLocation.state},{" "}
                  {userLocation.state}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-4 mt-2 text-xs">
                <Badge
                  className={`${
                    localRiskLevel === "critical"
                      ? "bg-red-500"
                      : localRiskLevel === "warning"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  } text-white`}
                >
                  {localRiskLevel.toUpperCase()} RISK
                </Badge>
                <span>{localReports} Local Reports</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadLocationData}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <Navigation className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            {userLocation
              ? `Advanced AI-powered flood prediction and early warning system protecting your community in ${userLocation.state} with precision and care`
              : "Advanced AI-powered flood prediction and early warning system protecting communities across India with precision and care"}
          </p>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold">
                {protectedAreas.toLocaleString()}
              </div>
              <div className="text-sm opacity-80">Protected Areas</div>
              <div className="flex items-center justify-center mt-2 text-xs">
                <ArrowUp className="w-3 h-3 mr-1" />
                <span>+12% this week</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold">{watchZones}</div>
              <div className="text-sm opacity-80">Watch Zones</div>
              <div className="flex items-center justify-center mt-2 text-xs">
                <Activity className="w-3 h-3 mr-1" />
                <span>Monitoring active</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold">{activeAlerts}</div>
              <div className="text-sm opacity-80">Alert Areas</div>
              <div className="flex items-center justify-center mt-2 text-xs">
                <Bell className="w-3 h-3 mr-1" />
                <span>Immediate action</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold">
                {communityMembers.toLocaleString()}
              </div>
              <div className="text-sm opacity-80">Community Members</div>
              <div className="flex items-center justify-center mt-2 text-xs">
                <Users className="w-3 h-3 mr-1" />
                <span>Engaged community</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button
              onClick={() => navigate("/reports")}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Detailed Analytics
            </Button>
            <Button
              onClick={() => navigate("/alerts")}
              className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              Get Mobile Alerts
            </Button>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full opacity-10"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>
      </div>

      {/* Live Flood Risk Assessment */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">
            Live Flood Risk Assessment
          </h2>
          <p className="text-lg text-slate-600">
            Real-time monitoring of water levels, rainfall, and flood risk
            across Punjab
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Risk Heatmap */}
          <div className="lg:col-span-2">
            <GradientCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  Punjab Risk Heatmap
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700"
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log("Exporting map...")}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Enhanced Punjab Heatmap */}
              <div className="relative bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl h-80 overflow-hidden">
                <MapComponent />
                <Notch text="Live Weather Data" />
              </div>

              {/* Risk Zone Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {riskZones.map((zone, index) => {
                  const IconComponent = zone.icon;
                  return (
                    <div
                      key={index}
                      className={`${zone.bgColor} rounded-xl p-4 text-center`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <IconComponent
                          className={`w-5 h-5 ${zone.color} mr-2`}
                        />
                        <span className={`text-sm font-semibold ${zone.color}`}>
                          {zone.name}
                        </span>
                      </div>
                      <div className={`text-2xl font-bold ${zone.color}`}>
                        {zone.percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </GradientCard>
          </div>

          {/* Water Level Gauges & Rainfall Intensity */}
          <div className="space-y-6">
            <GradientCard className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Water Level Gauges
              </h3>
              <div className="space-y-4">
                {waterLevelGauges.map((gauge, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        {gauge.city}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 ${gauge.color} rounded-full`}
                        ></div>
                        <span className="text-xs text-slate-600">
                          {gauge.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 ${gauge.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${gauge.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </GradientCard>

            <GradientCard className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Rainfall Intensity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Amritsar</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Heavy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Ludhiana</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Moderate</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Jalandhar</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Light</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Patiala</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-slate-600">Minimal</span>
                  </div>
                </div>
              </div>
            </GradientCard>
          </div>
        </div>
      </div>

      {/* Quick Actions & System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientCard className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            AI Accuracy
          </h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            94.7%
          </p>
          <p className="text-sm text-slate-600 mt-1">Prediction Accuracy</p>
          <div className="flex items-center justify-center mt-2 text-xs text-green-600">
            <ArrowUp className="w-3 h-3 mr-1" />
            <span>+2.3% from last month</span>
          </div>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Early Warning
          </h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            47 min
          </p>
          <p className="text-sm text-slate-600 mt-1">Average Lead Time</p>
          <div className="flex items-center justify-center mt-2 text-xs text-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            <span>Within target range</span>
          </div>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Data Sources
          </h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            1,247
          </p>
          <p className="text-sm text-slate-600 mt-1">Active Sensors</p>
          <div className="flex items-center justify-center mt-2 text-xs text-purple-600">
            <Zap className="w-3 h-3 mr-1" />
            <span>Real-time monitoring</span>
          </div>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Response Time
          </h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            2.3min
          </p>
          <p className="text-sm text-slate-600 mt-1">Average Alert Time</p>
          <div className="flex items-center justify-center mt-2 text-xs text-green-600">
            <ArrowDown className="w-3 h-3 mr-1" />
            <span>15% faster than target</span>
          </div>
        </GradientCard>
      </div>

      {/* Recent Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GradientCard className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">
            Recent Alerts & Updates
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Critical Flood Warning
                </p>
                <p className="text-xs text-slate-600 mb-1">
                  Amritsar District - 5 minutes ago
                </p>
                <p className="text-xs text-slate-700">
                  Water levels rising rapidly. Immediate evacuation required.
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-700 text-xs"
              >
                Critical
              </Badge>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Water Level Alert
                </p>
                <p className="text-xs text-slate-600 mb-1">
                  Ludhiana Industrial Zone - 18 minutes ago
                </p>
                <p className="text-xs text-slate-700">
                  Approaching warning threshold. Monitoring continues.
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-700 text-xs"
              >
                Warning
              </Badge>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  System Update
                </p>
                <p className="text-xs text-slate-600 mb-1">
                  Punjab State Wide - 1 hour ago
                </p>
                <p className="text-xs text-slate-700">
                  All sensors online and functioning normally.
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 text-xs"
              >
                Info
              </Badge>
            </div>
          </div>
        </GradientCard>

        {/* JanRakshak AI Assistant */}
        <GradientCard className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            AI Emergency Assistant
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Available Features:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Emergency Assistance
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-green-500" />
                  Submit Reports
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                  Find Shelters
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  Emergency Contacts
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Click the chat button in the bottom right corner to start a
              conversation with our AI assistant. It can help you submit flood
              reports, find emergency resources, and get safety information.
            </p>
          </div>
        </GradientCard>

        <GradientCard className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">
            Emergency Actions
          </h3>
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/assessment")}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12"
            >
              <AlertTriangle className="w-5 h-5 mr-3" />
              Report Emergency Situation
            </Button>
            <Button
              onClick={() => navigate("/predictions")}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12"
            >
              <Eye className="w-5 h-5 mr-3" />
              View Flood Predictions
            </Button>
            <Button
              onClick={() => {
                // Check if device supports phone calls
                if (navigator.userAgent.match(/iPhone|Android/i)) {
                  window.open("tel:108", "_self");
                } else {
                  // Show emergency contact information for desktop
                  window.open("https://www.dial108.com/", "_blank");
                }
                console.log("Emergency helpline activated");
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12"
            >
              <Phone className="w-5 h-5 mr-3" />
              Emergency Helpline
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12"
            >
              <Users className="w-5 h-5 mr-3" />
              Community Reports
            </Button>
          </div>
        </GradientCard>
      </div>
    </div>
  );
};

export default Dashboard;
