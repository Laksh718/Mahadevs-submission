import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import AdminLayout from "@/components/AdminLayout";
import {
  Users,
  FileText,
  AlertTriangle,
  MapPin,
  Activity,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Home,
  Droplets,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Bell,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Filter,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
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
} from "recharts";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDashboardStats, getAnalyticsData } from "@/lib/adminSupabase";

// Real data structure - will be populated from Supabase
const initialData = {
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    criticalReports: 0,
    verifiedReports: 0,
    sheltersActivated: 0,
    shelterCapacity: 0,
    avgResponseTime: 0,
    systemUptime: 100,
  },
  recentReports: [],
  alerts: [],
  shelters: [],
  trends: {
    userGrowth: [],
    reportSubmissions: [],
  },
  floodRegions: [],
  mapReports: [],
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real data state
  const [data, setData] = useState(initialData);

  // Load real data from Supabase
  useEffect(() => {
    loadRealData();
  }, []);

  // Real-time data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      loadRealData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const loadRealData = async () => {
    setLoading(true);
    try {
      console.log("Loading dashboard data...");

      // Get dashboard stats and analytics data in parallel
      const [statsData, analyticsData] = await Promise.all([
        getDashboardStats(),
        getAnalyticsData(),
      ]);

      console.log("Stats data:", statsData);
      console.log("Analytics data:", analyticsData);

      // Update the data state with real Supabase data
      setData((prev) => ({
        ...prev,
        stats: {
          totalUsers: statsData.totalUsers,
          activeUsers: statsData.activeUsers,
          totalReports: statsData.totalReports,
          pendingReports: statsData.pendingReports,
          criticalReports: statsData.criticalReports,
          verifiedReports: statsData.verifiedReports,
          sheltersActivated: statsData.activeShelters,
          shelterCapacity: statsData.shelterCapacity,
          avgResponseTime: statsData.avgResponseTime,
          systemUptime: statsData.systemUptime,
        },
        trends: {
          userGrowth: analyticsData.userGrowth,
          reportSubmissions: analyticsData.reportSubmissions,
        },
        shelters: analyticsData.shelterOccupancy.map((shelter) => ({
          id: shelter.shelter,
          name: shelter.shelter,
          location: shelter.shelter,
          capacity: shelter.capacity,
          currentOccupancy: shelter.occupancy,
          status: shelter.status,
          coordinates: [0, 0], // This would need to be fetched separately
          contact: "N/A",
          facilities: [],
        })),
        alerts: [], // This would need to be fetched separately
        recentReports: [], // This would need to be fetched separately
        floodRegions: [], // This would need to be fetched separately
        mapReports: [], // This would need to be fetched separately
      }));

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Dashboard data loading error:", error);
      toast.error("Failed to load dashboard data: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadRealData();
    toast.success("Dashboard data refreshed successfully");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getShelterStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "near_full":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "full":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Quick Actions Handlers
  const handleSendAlert = () => {
    toast.success("Opening alert broadcast form...");
    // Navigate to alerts page with broadcast form open
    navigate("/admin/alerts?action=broadcast");
  };

  const handleAddShelter = () => {
    toast.success("Opening shelter creation form...");
    // Navigate to shelters page with add form open
    navigate("/admin/shelters?action=add");
  };

  const handleAssignRescue = () => {
    toast.success("Opening rescue assignment form...");
    // Navigate to routes page with assignment form open
    navigate("/admin/routes?action=assign");
  };

  const handleViewAnalytics = () => {
    toast.success("Opening analytics dashboard...");
    navigate("/admin/analytics");
  };

  const handleManageUsers = () => {
    toast.success("Opening user management...");
    navigate("/admin/users");
  };

  const handleViewReports = () => {
    toast.success("Opening reports management...");
    navigate("/admin/reports");
  };

  // KPI Card click handlers
  const handleKPIClick = (type: string) => {
    switch (type) {
      case "users":
        handleManageUsers();
        break;
      case "reports":
        handleViewReports();
        break;
      case "shelters":
        navigate("/admin/shelters");
        break;
      case "alerts":
        navigate("/admin/alerts");
        break;
      default:
        break;
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    description,
    trend,
    type,
  }: any) => (
    <Card
      className="relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:scale-105"
      onClick={() => handleKPIClick(type)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {change && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {change > 0 ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={change > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(change)}% from last month
            </span>
          </p>
        )}
        {trend && (
          <div className="mt-2">
            <Progress value={trend} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {trend}% of target
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const filteredReports = data.recentReports.filter((report) => {
    const matchesSearch =
      searchTerm === "" ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesSeverity =
      filterSeverity === "all" || report.severity === filterSeverity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <AdminLayout>
      <style>{`
        ${theme === 'high-contrast' ? `
          .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900,
          .text-gray-500, .text-gray-400, .text-slate-600, .text-slate-700,
          .text-slate-500, .text-slate-800 {
            color: hsl(0, 0%, 100%) !important;
          }
          .bg-white\\/80, .bg-white\\/90, .bg-white\\/95 {
            background-color: hsl(0, 0%, 10%) !important;
          }
        ` : ''}
      `}</style>
      <div className="space-y-6">
        {/* Real-time Status Bar */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-teal-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {isLive ? "Live Updates" : "Paused"}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className={
                isLive
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              }
            >
              <Activity className="h-4 w-4 mr-2" />
              {isLive ? "Live" : "Paused"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        {data.alerts.filter((alert) => alert.severity === "critical").length >
          0 && (
          <div className="bg-red-500 text-white p-4 rounded-lg flex items-center space-x-3 animate-pulse">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Critical Alert Active</p>
              <p className="text-sm opacity-90">
                {
                  data.alerts.filter((alert) => alert.severity === "critical")
                    .length
                }{" "}
                critical alerts require immediate attention
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => navigate("/admin/alerts")}
            >
              View Details
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={data.stats.totalUsers.toLocaleString()}
            change={12}
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            description="Registered users"
            trend={85}
            type="users"
          />
          <StatCard
            title="Active Users"
            value={data.stats.activeUsers.toLocaleString()}
            change={8}
            icon={UserCheck}
            color="bg-gradient-to-r from-green-500 to-green-600"
            description="Recently active"
            trend={72}
            type="users"
          />
          <StatCard
            title="Total Reports"
            value={data.stats.totalReports.toLocaleString()}
            change={-3}
            icon={FileText}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            description="Flood reports"
            trend={68}
            type="reports"
          />
          <StatCard
            title="Critical Reports"
            value={data.stats.criticalReports.toLocaleString()}
            change={5}
            icon={AlertTriangle}
            color="bg-gradient-to-r from-red-500 to-red-600"
            description="Urgent alerts"
            trend={45}
            type="alerts"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Shelters Activated"
            value={data.stats.sheltersActivated}
            change={2}
            icon={Home}
            color="bg-gradient-to-r from-teal-500 to-teal-600"
            description="Active shelters"
            trend={80}
            type="shelters"
          />
          <StatCard
            title="Shelter Capacity"
            value={`${data.stats.shelterCapacity}%`}
            change={-5}
            icon={Target}
            color="bg-gradient-to-r from-indigo-500 to-indigo-600"
            description="Occupancy rate"
            trend={data.stats.shelterCapacity}
            type="shelters"
          />
          <StatCard
            title="Avg Response Time"
            value={`${data.stats.avgResponseTime}s`}
            change={-15}
            icon={Zap}
            color="bg-gradient-to-r from-yellow-500 to-yellow-600"
            description="Response time"
            trend={92}
            type="system"
          />
          <StatCard
            title="System Uptime"
            value={`${data.stats.systemUptime}%`}
            change={0.1}
            icon={Activity}
            color="bg-gradient-to-r from-emerald-500 to-emerald-600"
            description="Platform availability"
            trend={99}
            type="system"
          />
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-teal-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button
                variant="outline"
                className="h-24 flex-col hover:bg-teal-50 hover:border-teal-200 transition-colors"
                onClick={handleSendAlert}
              >
                <Bell className="h-6 w-6 mb-2 text-teal-600" />
                <span className="font-medium">Send Alert</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={handleAddShelter}
              >
                <Home className="h-6 w-6 mb-2 text-blue-600" />
                <span className="font-medium">Add Shelter</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col hover:bg-green-50 hover:border-green-200 transition-colors"
                onClick={handleAssignRescue}
              >
                <Users className="h-6 w-6 mb-2 text-green-600" />
                <span className="font-medium">Assign Rescue</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col hover:bg-purple-50 hover:border-purple-200 transition-colors"
                onClick={handleViewAnalytics}
              >
                <BarChart3 className="h-6 w-6 mb-2 text-purple-600" />
                <span className="font-medium">View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger
              value="shelters"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              <Home className="h-4 w-4 mr-2" />
              Shelters
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Map Widget */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-teal-600" />
                    Live Map
                  </CardTitle>
                  <CardDescription>
                    Active shelters, reports, and flood zones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 rounded-lg overflow-hidden">
                    <MapContainer
                      center={[30.901, 75.8573]}
                      zoom={8}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />

                      {/* Flood Regions */}
                      {data.floodRegions.map((region) => {
                        const getFloodColor = (severity: string) => {
                          switch (severity) {
                            case "high":
                              return "#ef4444";
                            case "medium":
                              return "#f59e0b";
                            case "low":
                              return "#3b82f6";
                            default:
                              return "#6b7280";
                          }
                        };

                        return (
                          <Circle
                            key={region.id}
                            center={region.center}
                            radius={region.radius}
                            pathOptions={{
                              color: getFloodColor(region.severity),
                              fillColor: getFloodColor(region.severity),
                              fillOpacity: 0.3,
                              weight: 2,
                            }}
                          >
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-semibold text-sm">
                                  {region.name}
                                </h3>
                                <p className="text-xs text-gray-600">
                                  Severity:{" "}
                                  <span
                                    className={`font-medium ${
                                      region.severity === "high"
                                        ? "text-red-600"
                                        : region.severity === "medium"
                                        ? "text-orange-600"
                                        : "text-blue-600"
                                    }`}
                                  >
                                    {region.severity}
                                  </span>
                                </p>
                                <p className="text-xs">
                                  Population:{" "}
                                  {region.population.toLocaleString()}
                                </p>
                                <p className="text-xs">
                                  Reports: {region.reports}
                                </p>
                              </div>
                            </Popup>
                          </Circle>
                        );
                      })}

                      {/* Shelters */}
                      {data.shelters.map((shelter) => {
                        const getShelterIcon = (status: string) => {
                          switch (status) {
                            case "available":
                              return "🟢";
                            case "near_full":
                              return "🟡";
                            case "full":
                              return "🔴";
                            default:
                              return "🏠";
                          }
                        };

                        const customIcon = L.divIcon({
                          className: "custom-marker",
                          html: `<div style="background-color: white; border: 2px solid #0ea5e9; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${getShelterIcon(
                            shelter.status
                          )}</div>`,
                          iconSize: [30, 30],
                          iconAnchor: [15, 15],
                        });

                        const openGoogleMaps = () => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.coordinates[0]},${shelter.coordinates[1]}`;
                          window.open(url, "_blank");
                        };

                        return (
                          <Marker
                            key={shelter.id}
                            position={shelter.coordinates}
                            icon={customIcon}
                          >
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-semibold text-sm">
                                  {shelter.name}
                                </h3>
                                <p className="text-xs text-gray-600">
                                  {shelter.location}
                                </p>
                                <p className="text-xs">
                                  Capacity: {shelter.capacity}
                                </p>
                                <p className="text-xs">
                                  Occupancy: {shelter.currentOccupancy}
                                </p>
                                <p className="text-xs">
                                  Status:{" "}
                                  <span
                                    className={`font-medium ${
                                      shelter.status === "available"
                                        ? "text-green-600"
                                        : shelter.status === "near_full"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {shelter.status.replace("_", " ")}
                                  </span>
                                </p>
                                <p className="text-xs">
                                  Contact: {shelter.contact}
                                </p>
                                <p className="text-xs">
                                  Facilities: {shelter.facilities.join(", ")}
                                </p>
                                <div className="mt-2 space-y-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      navigate(
                                        `/admin/shelters?id=${shelter.id}`
                                      )
                                    }
                                    className="w-full text-xs"
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Manage
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={openGoogleMaps}
                                    className="w-full text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                  >
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Get Directions
                                  </Button>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}

                      {/* Reports */}
                      {data.mapReports.map((report) => {
                        const getReportColor = (severity: string) => {
                          switch (severity) {
                            case "critical":
                              return "#ef4444";
                            case "high":
                              return "#f59e0b";
                            case "medium":
                              return "#eab308";
                            case "low":
                              return "#10b981";
                            default:
                              return "#6b7280";
                          }
                        };

                        const customIcon = L.divIcon({
                          className: "custom-marker",
                          html: `<div style="background-color: ${getReportColor(
                            report.severity
                          )}; border: 2px solid white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${
                            report.emoji
                          }</div>`,
                          iconSize: [25, 25],
                          iconAnchor: [12, 12],
                        });

                        return (
                          <Marker
                            key={report.id}
                            position={report.coordinates}
                            icon={customIcon}
                          >
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-semibold text-sm">
                                  {report.title}
                                </h3>
                                <p className="text-xs text-gray-600">
                                  {report.location}
                                </p>
                                <p className="text-xs">
                                  Severity:{" "}
                                  <span
                                    className={`font-medium ${
                                      report.severity === "critical"
                                        ? "text-red-600"
                                        : report.severity === "high"
                                        ? "text-orange-600"
                                        : report.severity === "medium"
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {report.severity}
                                  </span>
                                </p>
                                <p className="text-xs">
                                  Status:{" "}
                                  <span
                                    className={`font-medium ${
                                      report.status === "pending"
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {report.status}
                                  </span>
                                </p>
                                <p className="text-xs">User: {report.user}</p>
                                <p className="text-xs">
                                  Time:{" "}
                                  {new Date(report.timestamp).toLocaleString()}
                                </p>
                                <div className="mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      navigate(`/admin/reports?id=${report.id}`)
                                    }
                                    className="w-full text-xs"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                  <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Critical</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Low</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">🏠</span>
                      <span>Shelters</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    System Health
                  </CardTitle>
                  <CardDescription>
                    Platform performance and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Response</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Fast
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      75% Used
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    User Growth Trend
                  </CardTitle>
                  <CardDescription>
                    Monthly user registration trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={data.trends.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          name="Users"
                        />
                        <Line
                          type="monotone"
                          dataKey="active"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Active"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-green-600" />
                    Report Categories
                  </CardTitle>
                  <CardDescription>
                    Distribution of report types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={data.trends.reportSubmissions}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={80}
                          innerRadius={30}
                          fill="#8884d8"
                          dataKey="count"
                          paddingAngle={3}
                        >
                          {data.trends.reportSubmissions.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  "#0ea5e9",
                                  "#10b981",
                                  "#f59e0b",
                                  "#ef4444",
                                  "#8b5cf6",
                                  "#f97316",
                                  "#ec4899",
                                ][index % 7]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, "Reports"]}
                          labelFormatter={(label) => `Category: ${label}`}
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
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-teal-600" />
                      Recent Reports
                    </CardTitle>
                    <CardDescription>
                      Latest flood reports from users
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshData}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 border-gray-200"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 bg-white/50 border-gray-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterSeverity}
                    onValueChange={setFilterSeverity}
                  >
                    <SelectTrigger className="w-32 bg-white/50 border-gray-200">
                      <SelectValue placeholder="Severity" />
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

                <div className="border rounded-lg overflow-hidden bg-white/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Report</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow
                          key={report.id}
                          className="hover:bg-gray-50/50"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{report.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {report.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{report.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getSeverityColor(report.severity)}
                            >
                              {report.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs">
                                  {report.user.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{report.user}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(report.timestamp)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-gray-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/admin/reports?id=${report.id}`)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setData((prev) => ({
                                      ...prev,
                                      recentReports: prev.recentReports.map(
                                        (r) =>
                                          r.id === report.id
                                            ? { ...r, status: "verified" }
                                            : r
                                      ),
                                    }));
                                    toast.success(
                                      "Report approved successfully"
                                    );
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setData((prev) => ({
                                      ...prev,
                                      recentReports: prev.recentReports.map(
                                        (r) =>
                                          r.id === report.id
                                            ? { ...r, status: "rejected" }
                                            : r
                                      ),
                                    }));
                                    toast.success("Report rejected");
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => {
                                    setData((prev) => ({
                                      ...prev,
                                      recentReports: prev.recentReports.filter(
                                        (r) => r.id !== report.id
                                      ),
                                    }));
                                    toast.success("Report deleted");
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Active Alerts
                </CardTitle>
                <CardDescription>
                  Real-time flood warnings and system alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg ${getAlertSeverityColor(
                          alert.severity
                        )}`}
                      >
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{alert.type}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(alert.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {alert.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/alerts?id=${alert.id}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shelters Tab */}
          <TabsContent value="shelters" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-green-600" />
                  Shelter Status
                </CardTitle>
                <CardDescription>
                  Current shelter capacity and occupancy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.shelters.map((shelter) => (
                    <div
                      key={shelter.id}
                      className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Home className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{shelter.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {shelter.location}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm">
                            <span className="font-medium">
                              {shelter.currentOccupancy}
                            </span>{" "}
                            / {shelter.capacity} people
                          </span>
                          <div className="flex-1 max-w-32">
                            <Progress
                              value={
                                (shelter.currentOccupancy / shelter.capacity) *
                                100
                              }
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={getShelterStatusColor(shelter.status)}
                        >
                          {shelter.status.replace("_", " ")}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/shelters?id=${shelter.id}`)
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
