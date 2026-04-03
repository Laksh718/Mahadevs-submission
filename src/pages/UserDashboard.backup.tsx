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

  // State management - preserving all existing state
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

  // Wake up the pre-alert model service - preserving existing functionality
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

  // Load user data - preserving existing functionality
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  // Handle tab changes from navigation - preserving existing functionality
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Real-time updates - preserving existing functionality
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      loadUserData();
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [isLive]);

  // Preserving all existing load functions
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

  // Preserving existing helper functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-green-600 bg-green-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "investigating": return "text-blue-600 bg-blue-100";
      case "resolved": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  // Preserving existing filtered reports logic
  const filteredReports = userReports.filter((report) => {
    const matchesSearch = 
      report.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesSeverity = filterSeverity === "all" || report.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Preserving existing chart data
  const severityData = [
    { name: "Critical", value: reportStats.critical_reports, color: "#dc2626" },
    { name: "High", value: userReports.filter(r => r.severity === "high").length, color: "#ea580c" },
    { name: "Medium", value: userReports.filter(r => r.severity === "medium").length, color: "#ca8a04" },
    { name: "Low", value: userReports.filter(r => r.severity === "low").length, color: "#65a30d" },
  ].filter(item => item.value > 0);

  const statusData = [
    { name: "Verified", value: reportStats.verified_reports, color: "#16a34a" },
    { name: "Pending", value: reportStats.pending_reports, color: "#ca8a04" },
    { name: "Investigating", value: userReports.filter(r => r.status === "investigating").length, color: "#2563eb" },
    { name: "Resolved", value: userReports.filter(r => r.status === "resolved").length, color: "#64748b" },
  ].filter(item => item.value > 0);

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
    <UserLayout title="Dashboard" description="Welcome back to JanRakshak">
      {/* Modern Header with Live Status */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {currentUser.displayName || "Citizen"}
            </h1>
            <p className="text-gray-600 mt-1">
              Stay informed and help protect your community
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isLive ? 'Live' : 'Paused'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Pause' : 'Resume'} Updates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadUserData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Last updated: {lastUpdate.toLocaleString()}
        </p>
      </div>

      {/* Enhanced Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white">
            <FileText className="w-4 h-4 mr-2" />
            My Reports ({userReports.length})
          </TabsTrigger>
          <TabsTrigger value="shelters" className="data-[state=active]:bg-white">
            <Shield className="w-4 h-4 mr-2" />
            Shelters
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enhanced Design */}
        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
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
                <p className="text-xs text-gray-600 mt-1">
                  All your flood reports
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Critical Reports
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {reportStats.critical_reports}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
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
                <p className="text-xs text-gray-600 mt-1">
                  Confirmed by authorities
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Pending Reports
                </CardTitle>
                <Clock className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {reportStats.pending_reports}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Awaiting verification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Essential emergency actions and reporting tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => navigate("/reports")}
                  className="flex flex-col items-center p-6 h-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                  variant="outline"
                >
                  <Plus className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">New Report</span>
                </Button>
                <Button
                  onClick={() => navigate("/shelters")}
                  className="flex flex-col items-center p-6 h-auto bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                  variant="outline"
                >
                  <Shield className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Find Shelter</span>
                </Button>
                <Button
                  onClick={() => navigate("/alerts")}
                  className="flex flex-col items-center p-6 h-auto bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  variant="outline"
                >
                  <Bell className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">View Alerts</span>
                </Button>
                <Button
                  onClick={() => navigate("/community")}
                  className="flex flex-col items-center p-6 h-auto bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                  variant="outline"
                >
                  <Users className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Community</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Reports
              </CardTitle>
              <CardDescription>
                Your latest flood reports and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports submitted yet</p>
                  <Button
                    onClick={() => navigate("/reports")}
                    className="mt-4"
                    size="sm"
                  >
                    Submit Your First Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userReports.slice(0, 5).map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Droplets className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.location}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(report.severity)}>
                          {report.severity}
                        </Badge>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {userReports.length > 5 && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("reports")}
                      className="w-full"
                    >
                      View All Reports
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab - Preserving all existing functionality */}
        <TabsContent value="reports" className="space-y-6">
          {/* Enhanced Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Report Management</CardTitle>
              <CardDescription>
                Filter and search through your flood reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search reports by location or description..."
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
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
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
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm || filterStatus !== "all" || filterSeverity !== "all" 
                      ? "No reports match your filters" 
                      : "No reports submitted yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{report.location}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(report.severity)}>
                              {report.severity}
                            </Badge>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{report.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(report.created_at).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Shelters Tab - Preserving existing functionality */}
        <TabsContent value="shelters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Nearby Emergency Shelters
              </CardTitle>
              <CardDescription>
                Find safe shelters in your area during emergencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border">
                <NearbySheltersMap 
                  userLocation={userLocation.coords} 
                  className="h-96"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab - Enhanced with preserved functionality */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Report Severity Distribution
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
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Report Status Overview
                </CardTitle>
                <CardDescription>
                  Current status of all your submitted reports
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
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats - Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Summary Statistics
              </CardTitle>
              <CardDescription>
                Key metrics about your reporting activity and impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {reportStats.total_reports}
                  </div>
                  <p className="text-sm font-medium text-blue-800">Total Reports Submitted</p>
                  <p className="text-xs text-blue-600 mt-1">Community contribution</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {reportStats.total_reports > 0
                      ? Math.round((reportStats.verified_reports / reportStats.total_reports) * 100)
                      : 0}%
                  </div>
                  <p className="text-sm font-medium text-green-800">Verification Rate</p>
                  <p className="text-xs text-green-600 mt-1">Report accuracy</p>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {reportStats.critical_reports}
                  </div>
                  <p className="text-sm font-medium text-red-800">Critical Alerts</p>
                  <p className="text-xs text-red-600 mt-1">Emergency situations</p>
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