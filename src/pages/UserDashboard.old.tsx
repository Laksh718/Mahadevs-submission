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

          // Skip nearby reports loading to avoid location errors
          setNearbyReports([]);
        } catch (reportsError) {
          setUserReports([]);
          setReportStats({
            total_reports: 0,
            critical_reports: 0,
            verified_reports: 0,
            pending_reports: 0,
          });
        }
      } else {
        setUserReports([]);
        setReportStats({
          total_reports: 0,
          critical_reports: 0,
          verified_reports: 0,
          pending_reports: 0,
        });
      }

      setLastUpdate(new Date());
    } catch (error) {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadUserData();
    toast.success("Dashboard refreshed");
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

  // Filter reports based on search and filters
  const filteredReports = userReports.filter((report) => {
    const matchesSearch =
      !searchTerm ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof report.location === "string"
        ? report.location.toLowerCase().includes(searchTerm.toLowerCase())
        : report.location?.address
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesSeverity =
      filterSeverity === "all" || report.severity === filterSeverity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Chart data for user activity
  const userActivityData = [
    {
      month: "Jan",
      reports:
        reportStats.total_reports > 0
          ? Math.floor(reportStats.total_reports * 0.1)
          : 0,
      verified:
        reportStats.verified_reports > 0
          ? Math.floor(reportStats.verified_reports * 0.1)
          : 0,
    },
    {
      month: "Feb",
      reports:
        reportStats.total_reports > 0
          ? Math.floor(reportStats.total_reports * 0.2)
          : 0,
      verified:
        reportStats.verified_reports > 0
          ? Math.floor(reportStats.verified_reports * 0.2)
          : 0,
    },
    {
      month: "Mar",
      reports:
        reportStats.total_reports > 0
          ? Math.floor(reportStats.total_reports * 0.15)
          : 0,
      verified:
        reportStats.verified_reports > 0
          ? Math.floor(reportStats.verified_reports * 0.15)
          : 0,
    },
    {
      month: "Apr",
      reports:
        reportStats.total_reports > 0
          ? Math.floor(reportStats.total_reports * 0.3)
          : 0,
      verified:
        reportStats.verified_reports > 0
          ? Math.floor(reportStats.verified_reports * 0.3)
          : 0,
    },
    {
      month: "May",
      reports:
        reportStats.total_reports > 0
          ? Math.floor(reportStats.total_reports * 0.25)
          : 0,
      verified:
        reportStats.verified_reports > 0
          ? Math.floor(reportStats.verified_reports * 0.25)
          : 0,
    },
    {
      month: "Jun",
      reports: reportStats.total_reports,
      verified: reportStats.verified_reports,
    },
  ];

  // Severity distribution data
  const severityData = [
    { name: "Critical", value: reportStats.critical_reports, color: "#ef4444" },
    {
      name: "High",
      value: userReports.filter((r) => r.severity === "high").length,
      color: "#f97316",
    },
    {
      name: "Medium",
      value: userReports.filter((r) => r.severity === "medium").length,
      color: "#eab308",
    },
    {
      name: "Low",
      value: userReports.filter((r) => r.severity === "low").length,
      color: "#22c55e",
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-gray-400 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-600">
            Please log in to access your dashboard
          </h2>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <UserLayout title="Dashboard" description="Welcome back">
      {/* Dashboard Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="shelters">Nearby Shelters</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reports
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportStats.total_reports}
                </div>
                <p className="text-xs text-muted-foreground">
                  All your flood reports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Reports
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {reportStats.critical_reports}
                </div>
                <p className="text-xs text-muted-foreground">
                  High priority reports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Verified Reports
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reportStats.verified_reports}
                </div>
                <p className="text-xs text-muted-foreground">
                  Confirmed by authorities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Reports
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {reportStats.pending_reports}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting verification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and emergency actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => navigate("/reports")}
                >
                  <Plus className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">New Report</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => navigate("/shelters")}
                >
                  <Building className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Find Shelters</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => navigate("/emergency-contacts")}
                >
                  <Phone className="w-6 h-6 text-red-600" />
                  <span className="text-sm font-medium">
                    Emergency Contacts
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => navigate("/alerts")}
                >
                  <Bell className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">View Alerts</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your latest flood reports</CardDescription>
            </CardHeader>
            <CardContent>
              {userReports.length > 0 ? (
                <div className="space-y-4">
                  {userReports.slice(0, 3).map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            report.severity === "critical"
                              ? "bg-red-500"
                              : report.severity === "high"
                              ? "bg-orange-500"
                              : report.severity === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-gray-600">
                            {typeof report.location === "string"
                              ? report.location
                              : report.location?.address || "Unknown Location"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/reports")}
                  >
                    Create Your First Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>My Reports</CardTitle>
              <CardDescription>
                Manage and view all your flood reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40">
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
                  <SelectTrigger className="w-full md:w-40">
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

              {/* Reports List */}
              {filteredReports.length > 0 ? (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {report.title}
                              </h3>
                              <Badge
                                className={getSeverityColor(report.severity)}
                              >
                                {report.severity}
                              </Badge>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">
                              {report.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {typeof report.location === "string"
                                  ? report.location
                                  : report.location?.address ||
                                    "Unknown Location"}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(report.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {searchTerm ||
                    filterStatus !== "all" ||
                    filterSeverity !== "all"
                      ? "No reports match your filters"
                      : "No reports yet"}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/reports")}
                  >
                    Create Your First Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nearby Shelters Tab */}
        <TabsContent value="shelters" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <NearbySheltersMap userLocation={userLocation} maxDistance={50} />
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Report Activity</CardTitle>
                <CardDescription>
                  Your reporting activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="reports"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="verified"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Report Severity Distribution</CardTitle>
                <CardDescription>
                  Breakdown of report severities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={30}
                        dataKey="value"
                        label={false}
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

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>
                Key metrics about your reporting activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {reportStats.total_reports}
                  </div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {reportStats.total_reports > 0
                      ? Math.round(
                          (reportStats.verified_reports /
                            reportStats.total_reports) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-sm text-gray-600">Verification Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {reportStats.critical_reports}
                  </div>
                  <p className="text-sm text-gray-600">Critical Reports</p>
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
