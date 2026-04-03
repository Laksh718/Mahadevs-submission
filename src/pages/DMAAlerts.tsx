import React, { useState, useEffect } from "react";
import NDMALayout from "@/components/NDMALayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Users,
  Filter,
  RefreshCw,
  Download,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import {
  getAdminAlerts,
  createAlert,
  updateAlertStatus,
  deleteAlert,
  subscribeToAlerts,
  AdminAlert,
} from "@/lib/adminSupabase";

const DMAAlerts = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { user } = useSupabaseAuth();

  // Load initial data
  useEffect(() => {
    loadAlerts();
  }, []);

  // Real-time alert updates
  useEffect(() => {
    if (!isLive) return;

    const subscription = subscribeToAlerts((payload) => {
      console.log("Alert update received:", payload);

      if (payload.eventType === "UPDATE" && payload.new) {
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === payload.new.id ? { ...alert, ...payload.new } : alert
          )
        );
      } else if (payload.eventType === "INSERT" && payload.new) {
        setAlerts((prevAlerts) => [payload.new, ...prevAlerts]);
      } else if (payload.eventType === "DELETE" && payload.old) {
        setAlerts((prevAlerts) =>
          prevAlerts.filter((alert) => alert.id !== payload.old.id)
        );
      }

      setLastUpdate(new Date());
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
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading alerts:", error);
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (
    alertData: Omit<AdminAlert, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const newAlert = await createAlert(alertData);
      if (newAlert) {
        toast.success("Alert created successfully");
        await loadAlerts();
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      toast.error("Failed to create alert");
    }
  };

  const handleUpdateAlertStatus = async (alertId: string, status: string) => {
    try {
      const success = await updateAlertStatus(alertId, status);
      if (success) {
        toast.success("Alert status updated");
        await loadAlerts();
      } else {
        toast.error("Failed to update alert status");
      }
    } catch (error) {
      console.error("Error updating alert status:", error);
      toast.error("Failed to update alert status");
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const success = await deleteAlert(alertId);
      if (success) {
        toast.success("Alert deleted successfully");
        await loadAlerts();
      } else {
        toast.error("Failed to delete alert");
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Failed to delete alert");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800 border-red-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "dismissed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || alert.status === filterStatus;
    const matchesSeverity =
      filterSeverity === "all" || alert.severity === filterSeverity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => a.status === "active").length,
    delivered: alerts.filter((a) => a.status === "delivered").length,
    dismissed: alerts.filter((a) => a.status === "dismissed").length,
    critical: alerts.filter(
      (a) => a.severity === "critical" && a.status === "active"
    ).length,
  };

  return (
    <NDMALayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              DMA Emergency Alerts
            </h1>
            <p className="text-gray-600 mt-1">
              Manage district-level emergency alerts and responses
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadAlerts} variant="outline" disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant={isLive ? "default" : "outline"}
              onClick={() => setIsLive(!isLive)}
            >
              <Activity className="w-4 h-4 mr-2" />
              Live Updates {isLive ? "ON" : "OFF"}
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Alert
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Total Alerts
                  </p>
                  <p className="text-3xl font-bold text-orange-800">
                    {stats.total}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Active Alerts
                  </p>
                  <p className="text-3xl font-bold text-red-800">
                    {stats.active}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">
                    Critical Alerts
                  </p>
                  <p className="text-3xl font-bold text-yellow-800">
                    {stats.critical}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Delivered
                  </p>
                  <p className="text-3xl font-bold text-green-800">
                    {stats.delivered}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search alerts by type, message, or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="delivered">Delivered</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No alerts found
                </h3>
                <p className="text-gray-600">
                  No alerts match your current filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {alert.type}
                        </h3>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getStatusColor(alert.status)}
                        >
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{alert.message}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {alert.region}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {alert.sent_to.length} recipients
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(alert.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </NDMALayout>
  );
};

export default DMAAlerts;
