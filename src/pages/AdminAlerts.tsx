import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminRegionSelector from "@/components/AdminRegionSelector";
import { getAllStates } from "@/lib/comprehensiveRegionData";
import {
  AlertTriangle,
  Bell,
  Send,
  Clock,
  MapPin,
  Users,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  Globe,
  Target,
  Zap,
  Shield,
  Activity,
  CloudRain,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAlert } from "@/contexts/AlertContext";
import {
  getAdminAlerts,
  createAlert,
  updateAlertStatus,
  deleteAlert,
  resendAlert,
  subscribeToAlerts,
  createSampleAlerts,
  AdminAlert,
} from "@/lib/adminSupabase";
import { FloodPredictionService } from "@/lib/floodPredictionService";
// Charts temporarily disabled for testing
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts';

// Real data structure based on Supabase tables
const initialData = {
  activeAlerts: [],
  alertHistory: [],
  regions: [
    "All Users",
    "All States",
    "Regional Alert",
    "City Wide Alert",
    "All Areas",
  ],
};

const AdminAlerts = () => {
  const { testFlashWarning, alerts: contextAlerts, refreshAlerts } = useAlert();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);

  // Broadcast form state
  const [broadcastForm, setBroadcastForm] = useState({
    type: "Flood Warning",
    severity: "medium",
    message: "",
    sentTo: [],
    expiresIn: "2",
  });

  // Real data state
  const [data, setData] = useState(initialData);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Flood prediction state
  const [floodPredictions, setFloodPredictions] = useState<any[]>([]);
  const [floodLoading, setFloodLoading] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState(["Chennai"]);
  const floodService = new FloodPredictionService();

  // Load initial data
  useEffect(() => {
    loadAlerts();
  }, []);

  // Sync local alerts with context alerts
  useEffect(() => {
    setAlerts(contextAlerts);
  }, [contextAlerts]);

  // Real-time alert updates
  useEffect(() => {
    if (!isLive) return;

    const subscription = subscribeToAlerts((payload) => {
      console.log("Alert update received:", payload);

      if (payload.eventType === "UPDATE" && payload.new) {
        console.log("Updating alert:", payload.new);
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === payload.new.id ? { ...alert, ...payload.new } : alert
          )
        );
      } else if (payload.eventType === "INSERT" && payload.new) {
        console.log("Adding new alert:", payload.new);
        setAlerts((prevAlerts) => [payload.new, ...prevAlerts]);
      } else if (payload.eventType === "DELETE" && payload.old) {
        console.log("Removing alert:", payload.old);
        setAlerts((prevAlerts) =>
          prevAlerts.filter((alert) => alert.id !== payload.old.id)
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLive]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      console.log("Loading alerts from Supabase...");
      const alertData = await getAdminAlerts();
      console.log("Loaded alerts:", alertData);
      setAlerts(alertData);
    } catch (error) {
      console.error("Error loading alerts:", error);
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const loadFloodPredictions = async () => {
    setFloodLoading(true);
    try {
      if (selectedRegions.length === 0) {
        toast.error("Please select at least one region");
        return;
      }

      // Map states to their cities with flood data
      const stateToCity = {
        "Tamil Nadu": "Chennai",
        Telangana: "Hyderabad",
        Maharashtra: "Kolhapur",
        Kerala: "Wayanad",
        Punjab: "Ludhiana",
        "West Bengal": "Kolkata",
      };

      // Convert selected regions to valid location names
      const validLocations = selectedRegions
        .map((region) => {
          // If it's a state, map to a representative city
          if (stateToCity[region as keyof typeof stateToCity]) {
            return stateToCity[region as keyof typeof stateToCity];
          }
          // If it's a special option, use Chennai as default
          if (region === "All Users" || region === "All States") {
            return "Chennai";
          }
          // Otherwise assume it's a city name
          return region;
        })
        .filter((location) =>
          floodService.getSupportedLocations().includes(location)
        );

      console.log("Selected regions:", selectedRegions);
      console.log("Valid locations for prediction:", validLocations);

      if (validLocations.length === 0) {
        toast.error("No valid locations selected for flood prediction");
        return;
      }

      const predictions = await Promise.all(
        validLocations.map((location) =>
          floodService.predictRegionalRisk(location)
        )
      );
      setFloodPredictions(predictions);
      toast.success(
        `Flood predictions loaded for ${validLocations.length} location${
          validLocations.length > 1 ? "s" : ""
        }`
      );
    } catch (error) {
      console.error("Error loading flood prediction:", error);
      toast.error("Failed to load flood prediction");
    } finally {
      setFloodLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!broadcastForm.message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (broadcastForm.sentTo.length === 0) {
      toast.error("Please select at least one region");
      return;
    }

    setLoading(true);
    try {
      const newAlert = await createAlert({
        type: broadcastForm.type,
        severity: broadcastForm.severity as
          | "low"
          | "medium"
          | "high"
          | "critical",
        message: broadcastForm.message,
        region: broadcastForm.sentTo.join(", "),
        sent_to: broadcastForm.sentTo,
        expires_at: new Date(
          Date.now() + parseInt(broadcastForm.expiresIn) * 60 * 60 * 1000
        ).toISOString(),
        created_by: "admin@janrakshak.com",
        status: "active",
      });

      setAlerts((prev) => [newAlert, ...prev]);
      setShowBroadcastDialog(false);
      setBroadcastForm({
        type: "Flood Warning",
        severity: "medium",
        message: "",
        sentTo: [],
        expiresIn: "2",
      });
      toast.success("Alert sent successfully!");
    } catch (error) {
      console.error("Error creating alert:", error);
      toast.error("Failed to send alert");
    } finally {
      setLoading(false);
    }
  };

  const handleResendAlert = async (alertId: string) => {
    try {
      await resendAlert(alertId);
      toast.success("Alert resent successfully!");
    } catch (error) {
      console.error("Error resending alert:", error);
      toast.error("Failed to resend alert");
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;

    try {
      await deleteAlert(alertId);
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      toast.success("Alert deleted successfully!");
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Failed to delete alert");
    }
  };

  const handleDeleteAllAlerts = async () => {
    const filteredAlerts = getFilteredAlerts();
    if (filteredAlerts.length === 0) {
      toast.info("No alerts to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ALL ${filteredAlerts.length} alerts? This action cannot be undone!`
      )
    )
      return;

    try {
      setLoading(true);
      const deletePromises = filteredAlerts.map((alert) =>
        deleteAlert(alert.id)
      );
      await Promise.all(deletePromises);
      setAlerts((prev) =>
        prev.filter(
          (alert) =>
            !filteredAlerts.some(
              (filteredAlert) => filteredAlert.id === alert.id
            )
        )
      );
      toast.success(`Successfully deleted ${filteredAlerts.length} alerts!`);
    } catch (error) {
      console.error("Error deleting all alerts:", error);
      toast.error("Failed to delete some alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    alertId: string,
    status: "active" | "delivered" | "dismissed"
  ) => {
    try {
      await updateAlertStatus(alertId, status);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status } : alert
        )
      );
      toast.success("Alert status updated!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update alert status");
    }
  };

  const getActiveAlerts = () => {
    return alerts.filter((alert) => alert && alert.status === "active");
  };

  const getFilteredAlerts = () => {
    return alerts.filter((alert) => {
      if (!alert) return false;

      const matchesSearch =
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.region.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity =
        filterSeverity === "all" || alert.severity === filterSeverity;
      const matchesRegion =
        filterRegion === "all" || alert.region === filterRegion;

      return matchesSearch && matchesSeverity && matchesRegion;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
        return <Bell className="w-4 h-4" />;
      case "low":
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Alert Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage emergency alerts and notifications
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsLive(!isLive)}
              className={
                isLive ? "bg-green-50 text-green-700 border-green-200" : ""
              }
            >
              <Activity className="w-4 h-4 mr-2" />
              {isLive ? "Live" : "Offline"}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await createSampleAlerts();
                  await loadAlerts();
                  toast.success("Sample alerts created successfully!");
                } catch (error) {
                  toast.error("Failed to create sample alerts");
                }
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Sample Data
            </Button>
            <Button variant="outline" onClick={testFlashWarning}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Test Alert
            </Button>
            <Button onClick={() => setShowBroadcastDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Alert
            </Button>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {getActiveAlerts().filter((alert) => alert.severity === "critical")
          .length > 0 && (
          <div className="bg-red-500 text-white p-4 rounded-lg flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Critical Alerts Active</p>
              <p className="text-sm opacity-90">
                {
                  getActiveAlerts().filter(
                    (alert) => alert.severity === "critical"
                  ).length
                }{" "}
                critical alerts require immediate attention
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Admin Quick Actions
            </CardTitle>
            <CardDescription>
              Quick access to common admin alert operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setBroadcastForm((prev) => ({
                    ...prev,
                    type: "Flood Warning",
                    severity: "critical",
                    message:
                      "URGENT: Flood warning issued for your area. Please evacuate immediately to higher ground.",
                    sentTo: ["All Users"],
                  }));
                  setShowBroadcastDialog(true);
                }}
              >
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <span className="text-sm font-medium">
                  Critical Flood Alert
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setBroadcastForm((prev) => ({
                    ...prev,
                    type: "Evacuation Notice",
                    severity: "high",
                    message:
                      "EVACUATION NOTICE: Please evacuate your area immediately. Emergency shelters are available.",
                    sentTo: ["All Users"],
                  }));
                  setShowBroadcastDialog(true);
                }}
              >
                <Users className="w-6 h-6 text-orange-500" />
                <span className="text-sm font-medium">Evacuation Notice</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setBroadcastForm((prev) => ({
                    ...prev,
                    type: "Weather Alert",
                    severity: "medium",
                    message:
                      "WEATHER ALERT: Heavy rainfall expected in your area. Please stay indoors and avoid unnecessary travel.",
                    sentTo: ["All Users"],
                  }));
                  setShowBroadcastDialog(true);
                }}
              >
                <CloudRain className="w-6 h-6 text-blue-500" />
                <span className="text-sm font-medium">Weather Alert</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Alerts
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getActiveAlerts().length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  alerts.filter(
                    (alert) => alert && alert.severity === "critical"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Urgent alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  alerts.filter(
                    (alert) => alert && alert.status === "delivered"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Successfully sent</p>
            </CardContent>
          </Card>
        </div>

        {/* NEW FLOOD PREDICTION SECTION */}
        <Card className="border-2 border-blue-500">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center justify-between text-blue-800">
              <div className="flex items-center">
                <CloudRain className="w-6 h-6 mr-2 text-blue-600" />
                EXTENSIVE FLOOD PREDICTION SYSTEM
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-60">
                  <AdminRegionSelector
                    selectedRegions={selectedRegions}
                    onRegionsChange={setSelectedRegions}
                    className="bg-white"
                  />
                </div>
                <Button
                  onClick={loadFloodPredictions}
                  disabled={floodLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {floodLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CloudRain className="w-4 h-4 mr-2" />
                  )}
                  LOAD DATA
                </Button>
              </div>
            </CardTitle>
            <CardDescription className="text-blue-600">
              Real-time AI flood prediction with live data
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {floodPredictions.length > 0 ? (
              <div className="space-y-6">
                {/* BIG METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 bg-red-500 text-white rounded-xl text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="text-lg font-bold">RISK LEVEL</h3>
                    <p className="text-3xl font-black mt-2">
                      {floodPredictions[0].main_prediction?.["Risk Level"] ||
                        "Loading..."}
                    </p>
                  </div>

                  <div className="p-6 bg-blue-500 text-white rounded-xl text-center">
                    <Target className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="text-lg font-bold">CONFIDENCE</h3>
                    <p className="text-3xl font-black mt-2">
                      {floodPredictions[0].main_prediction?.Confidence ||
                        "Calculating..."}
                    </p>
                  </div>

                  <div className="p-6 bg-green-500 text-white rounded-xl text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="text-lg font-bold">RISK DATE</h3>
                    <p className="text-xl font-black mt-2">
                      {floodPredictions[0].main_prediction?.["Risk Date"] ||
                        "TBD"}
                    </p>
                  </div>

                  <div className="p-6 bg-purple-500 text-white rounded-xl text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="text-lg font-bold">DAYS</h3>
                    <p className="text-3xl font-black mt-2">
                      {floodPredictions[0].detailed_forecast?.length || 0}
                    </p>
                  </div>
                </div>

                {/* SIMPLE FORECAST */}
                {floodPredictions[0].detailed_forecast && (
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      10-DAY FORECAST
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {floodPredictions[0].detailed_forecast
                        .slice(0, 10)
                        .map((day: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-lg border-2 border-gray-200 text-center"
                          >
                            <div className="text-sm font-bold text-gray-600 mb-1">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div
                              className={`text-sm font-bold mb-2 ${
                                day.risk_level === "High Risk"
                                  ? "text-red-600"
                                  : day.risk_level === "Medium Risk"
                                  ? "text-yellow-600"
                                  : day.risk_level === "Low Risk"
                                  ? "text-yellow-500"
                                  : "text-green-600"
                              }`}
                            >
                              {day.risk_level}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(day.confidence * 100)}% confidence
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-red-100 p-8 rounded-xl border-2 border-red-300">
                  <CloudRain className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <h3 className="text-xl font-bold mb-2 text-red-700">
                    NO FLOOD DATA LOADED
                  </h3>
                  <p className="text-red-600 mb-4">
                    Click the button below to load flood prediction data
                  </p>
                  <Button
                    onClick={loadFloodPredictions}
                    disabled={floodLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
                  >
                    {floodLoading ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <CloudRain className="w-5 h-5 mr-2" />
                    )}
                    LOAD FLOOD DATA
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={filterSeverity}
                  onValueChange={setFilterSeverity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {getAllStates().map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await refreshAlerts();
                      await loadAlerts();
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterSeverity("all");
                      setFilterRegion("all");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>
                  Manage and monitor all emergency alerts
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const activeAlerts = getFilteredAlerts().filter(
                      (alert) => alert && alert.status === "active"
                    );
                    if (activeAlerts.length === 0) {
                      toast.info("No active alerts to dismiss");
                      return;
                    }
                    if (
                      confirm(
                        `Dismiss all ${activeAlerts.length} active alerts?`
                      )
                    ) {
                      activeAlerts.forEach((alert) =>
                        handleUpdateStatus(alert.id, "dismissed")
                      );
                      toast.success(`Dismissed ${activeAlerts.length} alerts`);
                    }
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Dismiss All Active
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const criticalAlerts = getFilteredAlerts().filter(
                      (alert) => alert && alert.severity === "critical"
                    );
                    if (criticalAlerts.length === 0) {
                      toast.info("No critical alerts to resend");
                      return;
                    }
                    if (
                      confirm(
                        `Resend all ${criticalAlerts.length} critical alerts?`
                      )
                    ) {
                      criticalAlerts.forEach((alert) =>
                        handleResendAlert(alert.id)
                      );
                      toast.success(
                        `Resent ${criticalAlerts.length} critical alerts`
                      );
                    }
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Resend Critical
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAllAlerts}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading alerts...
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredAlerts().length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No alerts found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ||
                      filterSeverity !== "all" ||
                      filterRegion !== "all"
                        ? "Try adjusting your filters"
                        : "Create your first alert to get started"}
                    </p>
                    {!searchTerm &&
                      filterSeverity === "all" &&
                      filterRegion === "all" && (
                        <Button onClick={() => setShowBroadcastDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Alert
                        </Button>
                      )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredAlerts().map((alert) => {
                        if (!alert) return null;
                        return (
                          <TableRow key={alert.id}>
                            <TableCell className="font-medium">
                              {alert.type}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getSeverityColor(
                                  alert.severity
                                )} text-white`}
                              >
                                {getSeverityIcon(alert.severity)}
                                <span className="ml-1 capitalize">
                                  {alert.severity}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {alert.message}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                {alert.region}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(
                                  alert.created_at
                                ).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResendAlert(alert.id)}
                                  className="h-8 px-2"
                                >
                                  <Send className="w-4 h-4 mr-1" />
                                  Resend
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateStatus(alert.id, "dismissed")
                                  }
                                  className="h-8 px-2"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Dismiss
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Alert Dialog */}
        <Dialog
          open={showBroadcastDialog}
          onOpenChange={setShowBroadcastDialog}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription>
                Send an emergency alert to selected regions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-type">Alert Type</Label>
                  <Select
                    value={broadcastForm.type}
                    onValueChange={(value) => {
                      setBroadcastForm((prev) => ({ ...prev, type: value }));
                      // Auto-fill message based on type
                      const templates = {
                        "Flood Warning":
                          "URGENT: Flood warning issued for your area. Please evacuate immediately to higher ground.",
                        "Evacuation Notice":
                          "EVACUATION NOTICE: Please evacuate your area immediately. Emergency shelters are available.",
                        "Weather Alert":
                          "WEATHER ALERT: Heavy rainfall expected in your area. Please stay indoors and avoid unnecessary travel.",
                        "Emergency Notice":
                          "EMERGENCY NOTICE: Emergency situation in your area. Please follow official instructions.",
                        "Safety Advisory":
                          "SAFETY ADVISORY: Please take necessary precautions for your safety.",
                      };
                      if (templates[value as keyof typeof templates]) {
                        setBroadcastForm((prev) => ({
                          ...prev,
                          message: templates[value as keyof typeof templates],
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flood Warning">
                        Flood Warning
                      </SelectItem>
                      <SelectItem value="Evacuation Notice">
                        Evacuation Notice
                      </SelectItem>
                      <SelectItem value="Weather Alert">
                        Weather Alert
                      </SelectItem>
                      <SelectItem value="Emergency Notice">
                        Emergency Notice
                      </SelectItem>
                      <SelectItem value="Safety Advisory">
                        Safety Advisory
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={broadcastForm.severity}
                    onValueChange={(value) =>
                      setBroadcastForm((prev) => ({ ...prev, severity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter alert message..."
                  value={broadcastForm.message}
                  onChange={(e) =>
                    setBroadcastForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Target Regions</Label>
                <AdminRegionSelector
                  selectedRegions={broadcastForm.sentTo}
                  onRegionsChange={(regions) =>
                    setBroadcastForm((prev) => ({ ...prev, sentTo: regions }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires">Expires In</Label>
                <Select
                  value={broadcastForm.expiresIn}
                  onValueChange={(value) =>
                    setBroadcastForm((prev) => ({ ...prev, expiresIn: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="6">6 Hours</SelectItem>
                    <SelectItem value="12">12 Hours</SelectItem>
                    <SelectItem value="24">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBroadcastDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAlert} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Alert
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAlerts;
