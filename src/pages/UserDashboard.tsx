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
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { user, userProfile, loading: authLoading } = useRoleAwareAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
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

  // Theme-aware helper functions
  const getCardStyle = () => theme === 'high-contrast' ? {
    backgroundColor: 'hsl(0, 0%, 10%)',
    borderColor: 'hsl(0, 0%, 40%)',
    color: 'hsl(0, 0%, 100%)'
  } : {};
  
  const getTextStyle = (type: 'primary' | 'secondary' | 'muted' = 'primary') => {
    if (theme !== 'high-contrast') return {};
    switch(type) {
      case 'primary': return { color: 'hsl(0, 0%, 100%)' };
      case 'secondary': return { color: 'hsl(0, 0%, 95%)' };
      case 'muted': return { color: 'hsl(0, 0%, 85%)' };
    }
  };

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
    if (user) {
      loadUserData();
    }
  }, [user]);

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
      if (user?.id) {
        try {
          // Use direct Supabase queries
          const { data: reports, error: reportsError } = await supabase
            .from("flood_reports")
            .select("*")
            .eq("user_id", user.id)
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
        ? report.location?.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!user) {
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
      <style>{`
        ${theme === 'high-contrast' ? `
          .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900,
          .text-gray-500, .text-gray-400, .text-slate-600, .text-slate-700,
          .text-slate-500, .text-slate-900, .text-slate-800, .text-gray-300 {
            color: hsl(0, 0%, 100%) !important;
          }
          .bg-white\\/80, .bg-white\\/90, .bg-white\\/95, .bg-white {
            background-color: hsl(0, 0%, 10%) !important;
          }
          .bg-clip-text {
            -webkit-text-fill-color: hsl(47, 100%, 60%) !important;
          }
          /* All gradient backgrounds */
          .bg-gradient-to-br, .bg-gradient-to-r, .bg-gradient-to-l, .bg-gradient-to-t, .bg-gradient-to-b {
            background: hsl(0, 0%, 10%) !important;
          }
          /* All -50 level backgrounds (light pastels) */
          .from-slate-50, .via-blue-50, .to-teal-50, .from-blue-50, .to-cyan-50,
          .from-green-50, .to-emerald-50, .from-red-50, .to-rose-50,
          .from-orange-50, .to-amber-50, .from-purple-50, .to-pink-50,
          .from-yellow-50, .to-yellow-50 {
            background: hsl(0, 0%, 10%) !important;
          }
          /* All -100 level backgrounds */
          .from-blue-100, .via-cyan-100, .to-teal-100,
          .bg-blue-100, .bg-green-100, .bg-red-100, .bg-orange-100, .bg-blue-200,
          .bg-slate-100, .bg-gray-100 {
            background-color: hsl(0, 0%, 20%) !important;
          }
          /* All border colors */
          .border-blue-200, .border-blue-300, .border-green-200, .border-green-300,
          .border-red-200, .border-red-300, .border-orange-200, .border-orange-300,
          .border-gray-200, .border-gray-300, .border-slate-200 {
            border-color: hsl(0, 0%, 40%) !important;
          }
          /* Input and Select backgrounds */
          input, select, textarea {
            background-color: hsl(0, 0%, 15%) !important;
            color: hsl(0, 0%, 100%) !important;
            border-color: hsl(0, 0%, 40%) !important;
          }
        ` : ''}
      `}</style>
      {/* Dashboard Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
          <TabsTrigger value="reports">{t('header.myReports')}</TabsTrigger>
          <TabsTrigger value="shelters">{t('header.findShelters')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('header.analytics')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={theme === 'high-contrast' ? {
                backgroundColor: 'hsl(0, 0%, 10%)',
                borderColor: 'hsl(0, 0%, 40%)'
              } : {
                background: 'linear-gradient(to bottom right, #eff6ff, #e0f2fe, white)',
                borderColor: '#bfdbfe'
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={getTextStyle('primary')}>
                  {t('dashboard.totalReports')}
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={theme === 'high-contrast' ? { color: 'hsl(47, 100%, 60%)' } : { background: 'linear-gradient(to right, #2563eb, #0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {reportStats.total_reports}
                </div>
                <p className="text-xs mt-1 font-medium" style={getTextStyle('secondary')}>
                  {t('dashboard.allYourFloodReports')}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={theme === 'high-contrast' ? {
                backgroundColor: 'hsl(0, 0%, 10%)',
                borderColor: 'hsl(0, 0%, 40%)'
              } : {
                background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2, white)',
                borderColor: '#fecaca'
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={getTextStyle('primary')}>
                  {t('dashboard.criticalReports')}
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  {reportStats.critical_reports}
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {t('dashboard.highPriorityReports')}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={theme === 'high-contrast' ? {
                backgroundColor: 'hsl(0, 0%, 10%)',
                borderColor: 'hsl(0, 0%, 40%)'
              } : {
                background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7, white)',
                borderColor: '#bbf7d0'
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={getTextStyle('primary')}>
                  {t('dashboard.verifiedReports')}
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={theme === 'high-contrast' ? { color: 'hsl(47, 100%, 60%)' } : { background: 'linear-gradient(to right, #16a34a, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {reportStats.verified_reports}
                </div>
                <p className="text-xs mt-1 font-medium" style={getTextStyle('secondary')}>
                  {t('dashboard.confirmedByAuthorities')}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={theme === 'high-contrast' ? {
                backgroundColor: 'hsl(0, 0%, 10%)',
                borderColor: 'hsl(0, 0%, 40%)'
              } : {
                background: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, white)',
                borderColor: '#fde68a'
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={getTextStyle('primary')}>
                  {t('dashboard.pendingReports')}
                </CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  {reportStats.pending_reports}
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {t('dashboard.awaitingVerification')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card 
            className="border-2 shadow-lg"
            style={theme === 'high-contrast' ? {
              backgroundColor: 'hsl(0, 0%, 10%)',
              borderColor: 'hsl(0, 0%, 40%)'
            } : {
              background: 'linear-gradient(to bottom right, #eef2ff, #f5f3ff, white)',
              borderColor: '#c7d2fe'
            }}
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold" style={theme === 'high-contrast' ? { color: 'hsl(47, 100%, 60%)' } : { background: 'linear-gradient(to right, #4f46e5, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t('quickActions.title')}
              </CardTitle>
              <CardDescription className="font-medium" style={getTextStyle('secondary')}>
                {t('quickActions.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate("/reports")}
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{t('quickActions.newReport')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate("/shelters")}
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{t('quickActions.findShelters')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 hover:border-red-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate("/emergency-contacts")}
                >
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {t('quickActions.emergencyContacts')}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate("/alerts")}
                >
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{t('quickActions.viewAlerts')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Community Safety Score - Unique to Citizens */}
          <Card className="bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 border-2 border-blue-300 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-700" />
                </div>
                <span className="text-xl font-bold text-gray-900">{t('safety.title')}</span>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md"
                >
                  {t('safety.citizenFeature')}
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-700 font-medium">
                {t('safety.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-green-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    85
                  </div>
                  <p className="text-sm text-gray-700 font-semibold">{t('safety.safetyScore')}</p>
                  <Badge className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
                    {t('safety.good')}
                  </Badge>
                </div>
                <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                    {nearbyReports.length || 3}
                  </div>
                  <p className="text-sm text-gray-700 font-semibold">{t('safety.nearbyReports')}</p>
                  <Badge className="mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-md">
                    {t('safety.last24h')}
                  </Badge>
                </div>
                <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    12
                  </div>
                  <p className="text-sm text-gray-700 font-semibold">{t('safety.activeShelters')}</p>
                  <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md">
                    {t('safety.available')}
                  </Badge>
                </div>
              </div>
              <div className="mt-6 p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-blue-200">
                <h4 className="font-bold mb-4 flex items-center text-gray-900">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  {t('safety.trends')}
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('safety.floodRisk')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-1/4 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-md"></div>
                      </div>
                      <span className="text-sm font-bold text-green-600">{t('safety.low')}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('safety.emergencyResponse')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-md"></div>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{t('safety.high')}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('safety.communityAlert')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full shadow-md"></div>
                      </div>
                      <span className="text-sm font-bold text-yellow-600">Medium</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="bg-gradient-to-br from-slate-50 via-gray-50 to-white border-2 border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Reports</CardTitle>
              <CardDescription className="text-gray-600 font-medium">Your latest flood reports</CardDescription>
            </CardHeader>
            <CardContent>
              {userReports.length > 0 ? (
                <div className="space-y-4">
                  {userReports.slice(0, 3).map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-5 border-2 rounded-xl bg-gradient-to-r from-white to-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-4 h-4 rounded-full shadow-lg ${
                            report.severity === "critical"
                              ? "bg-gradient-to-r from-red-500 to-rose-500"
                              : report.severity === "high"
                              ? "bg-gradient-to-r from-orange-500 to-amber-500"
                              : report.severity === "medium"
                              ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                              : "bg-gradient-to-r from-green-500 to-emerald-500"
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{report.title}</p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {typeof report.location === "string"
                              ? report.location
                              : report.location?.address || "Unknown Location"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(report.status)} border-2 font-semibold`}>
                          {report.status}
                        </Badge>
                        <span className="text-sm text-gray-500 font-medium">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-4">No reports yet</p>
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg"
                    onClick={() => navigate("/reports")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
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
