import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseAuthMinimal } from "@/contexts/SupabaseAuthContextMinimal";
import { getRealTimeCounts } from "@/lib/adminSupabase";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Menu,
  X,
  Shield,
  LogOut,
  Settings,
  User,
  Bell,
  ChevronDown,
  Home,
  AlertTriangle,
  FileText,
  Users,
  MapPin,
  Route,
  BarChart3,
  Activity,
  Search,
  Plus,
  RefreshCw,
  CloudRain,
  BookOpen,
  Download,
  Eye,
  Filter,
  Calendar,
  Globe,
  Sparkles,
  Zap,
  Sun,
  Contrast,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [realTimeCounts, setRealTimeCounts] = useState({
    pendingReports: 0,
    criticalReports: 0,
    activeAlerts: 0,
    pendingMissions: 0,
    activeShelters: 0,
    totalUsers: 0,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useSupabaseAuthMinimal();
  const { theme, toggleTheme } = useTheme();

  console.log('AdminLayout - Current theme:', theme);

  // Load real-time counts
  useEffect(() => {
    loadRealTimeCounts();

    // Update counts every 30 seconds
    const interval = setInterval(loadRealTimeCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRealTimeCounts = async () => {
    try {
      const counts = await getRealTimeCounts();
      setRealTimeCounts(counts);
    } catch (error) {
      console.error("Error loading real-time counts:", error);
    }
  };

  const navigation = [
    // MAIN DASHBOARD
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      badge: null,
      section: "main",
    },

    // REAL-TIME MONITORING & ALERTS
    {
      name: "Live Alerts",
      href: "/admin/alerts",
      icon: AlertTriangle,
      badge:
        realTimeCounts.activeAlerts > 0
          ? realTimeCounts.activeAlerts.toString()
          : null,
      section: "monitoring",
    },
    {
      name: "Report Management",
      href: "/admin/reports",
      icon: FileText,
      badge:
        realTimeCounts.pendingReports > 0
          ? realTimeCounts.pendingReports.toString()
          : null,
      section: "monitoring",
    },

    // GIS & INTELLIGENCE SYSTEMS
    {
      name: "GIS Intelligence Hub",
      href: "/admin/gis-mapping",
      icon: MapPin,
      badge: "NEW",
      section: "gis",
    },
    {
      name: "Route Optimization",
      href: "/admin/routes",
      icon: Route,
      badge: null,
      section: "gis",
    },

    // USER & RESOURCE MANAGEMENT
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      badge: null,
      section: "management",
    },
    {
      name: "Shelter Networks",
      href: "/admin/shelters",
      icon: Home,
      badge:
        realTimeCounts.activeShelters > 0
          ? realTimeCounts.activeShelters.toString()
          : null,
      section: "management",
    },

    // PREDICTION & ASSESSMENT
    {
      name: "AI Flood Prediction",
      href: "/admin/flood-prediction",
      icon: CloudRain,
      badge: "AI",
      section: "prediction",
    },
    {
      name: "Model Accuracy",
      href: "/admin/flood-accuracy",
      icon: Activity,
      badge: null,
      section: "prediction",
    },
    {
      name: "Risk Assessment",
      href: "/admin/risk-assessment",
      icon: Shield,
      badge: null,
      section: "prediction",
    },

    // ANALYTICS & REPORTING
    {
      name: "Advanced Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      badge: null,
      section: "analytics",
    },
    {
      name: "Report Generation",
      href: "/admin/report-system",
      icon: FileText,
      badge: "PDF",
      section: "analytics",
    },

    // TRAINING & CAPACITY BUILDING
    {
      name: "Training Management",
      href: "/admin/training",
      icon: BookOpen,
      badge: null,
      section: "training",
    },

    // SYSTEM OPERATIONS
    {
      name: "System Health Monitor",
      href: "/admin/system",
      icon: Activity,
      badge: null,
      section: "system",
    },
  ];

  // Group navigation by sections
  const navigationSections = {
    main: navigation.filter((item) => item.section === "main"),
    monitoring: navigation.filter((item) => item.section === "monitoring"),
    gis: navigation.filter((item) => item.section === "gis"),
    management: navigation.filter((item) => item.section === "management"),
    prediction: navigation.filter((item) => item.section === "prediction"),
    analytics: navigation.filter((item) => item.section === "analytics"),
    training: navigation.filter((item) => item.section === "training"),
    system: navigation.filter((item) => item.section === "system"),
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 backdrop-blur-xl shadow-2xl border border-slate-700/50 rounded-r-2xl transform transition-all duration-300 ease-out lg:translate-x-0 lg:left-4 lg:top-4 lg:bottom-4 lg:rounded-2xl overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          boxShadow: '0 0 40px rgba(100, 116, 139, 0.15), 0 0 80px rgba(71, 85, 105, 0.1)'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-tr-2xl lg:rounded-tl-2xl">
          <div className="flex items-center space-x-2">
            <img src="/favicon.svg" alt="JanRakshak Logo" className="w-8 h-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">JanRakshak</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-slate-200 hover:bg-purple-500/20"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Enhanced Navigation with sections */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto custom-scrollbar">
          {/* Main Dashboard */}
          <div className="space-y-1">
            {navigationSections.main.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-slate-300 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "hover:bg-slate-800/70 hover:text-white"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Training Management - Moved up */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Training Management
            </h3>
            {navigationSections.training.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-slate-300 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "hover:bg-slate-800/70 hover:text-white"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge className="ml-auto bg-blue-500 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* GIS Intelligence - Moved up */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              GIS Intelligence
            </h3>
            {navigationSections.gis.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-slate-300 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "hover:bg-slate-800/70 hover:text-white"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge
                      className={`ml-auto text-xs ${
                        item.badge === "NEW"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Real-time Monitoring */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Real-time Monitoring
            </h3>
            {navigationSections.monitoring.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-slate-300 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "hover:bg-slate-800/70 hover:text-white"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge
                      className={`ml-auto text-xs ${
                        item.badge === "NEW"
                          ? "bg-green-500 text-white"
                          : item.badge === "AI"
                          ? "bg-purple-500 text-white"
                          : item.badge === "PDF"
                          ? "bg-orange-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Management */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Management
            </h3>
            {navigationSections.management.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-slate-300 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "hover:bg-slate-800/70 hover:text-white"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Prediction & Assessment */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Prediction & Assessment
            </h3>
            {navigationSections.prediction.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-slate-300 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "hover:bg-slate-800/70 hover:text-white"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge
                      className={`ml-auto text-xs ${
                        item.badge === "AI"
                          ? "bg-purple-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Analytics & Reporting */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Analytics & Reporting
            </h3>
            {navigationSections.analytics.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-slate-300 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "hover:bg-slate-800/70 hover:text-white"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge
                      className={`ml-auto text-xs ${
                        item.badge === "PDF"
                          ? "bg-orange-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* System Operations */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              System Operations
            </h3>
            {navigationSections.system.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-slate-300 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "hover:bg-slate-800/70 hover:text-white"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              );
            })}
          </div>

          <div className="border-t border-slate-700/50 my-4"></div>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-80">
        {/* Enhanced Admin Top bar - Purple/Indigo Theme */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-700 shadow-2xl border-2 border-purple-400/30 rounded-xl mx-4 mt-4 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/20"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  JanRakshak Admin Portal
                </h1>
                <p className="text-sm text-purple-200">
                  Emergency Management & Disaster Response System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Real-time status indicators */}
              <div className="hidden xl:flex items-center space-x-3 text-white text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
                <Badge className="bg-purple-500/30 text-white border-purple-300/50">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {realTimeCounts.activeAlerts} Alerts
                </Badge>
                <Badge className="bg-purple-500/30 text-white border-purple-300/50">
                  <FileText className="w-3 h-3 mr-1" />
                  {realTimeCounts.pendingReports} Reports
                </Badge>
                <Badge className="bg-purple-500/30 text-white border-purple-300/50">
                  <Users className="w-3 h-3 mr-1" />
                  {realTimeCounts.totalUsers} Users
                </Badge>
              </div>

              <div className="flex items-center space-x-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex border-2 border-purple-300/50 text-white hover:bg-purple-500/30 bg-purple-500/20 backdrop-blur-sm font-medium shadow-lg"
                  onClick={loadRealTimeCounts}
                >
                  <RefreshCw className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Refresh Data</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden lg:flex border-2 border-purple-300/50 text-white hover:bg-purple-500/30 bg-purple-500/20 backdrop-blur-sm font-medium shadow-lg"
                  onClick={() => navigate("/admin/gis-mapping")}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  GIS Portal
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden lg:flex border-2 border-purple-300/50 text-white hover:bg-purple-500/30 bg-purple-500/20 backdrop-blur-sm font-medium shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Quick Reports
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Export Reports</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => window.open("/admin/reports?export=daily")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Daily Report (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        window.open("/admin/reports?export=weekly")
                      }
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Weekly Analytics (Excel)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        window.open("/admin/reports?export=monthly")
                      }
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Monthly Summary (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/admin/reports")}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View All Reports
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Theme Toggle - Always Visible */}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-yellow-400 text-white hover:bg-purple-500/30 bg-purple-500/20 backdrop-blur-sm font-medium shadow-lg"
                  onClick={() => {
                    console.log('Theme toggle clicked, current theme:', theme);
                    toggleTheme();
                  }}
                  title={`Toggle Theme (Current: ${theme})`}
                >
                  {theme === 'light' ? (
                    <>
                      <Sun className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline text-xs">Light</span>
                    </>
                  ) : (
                    <>
                      <Contrast className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline text-xs">High</span>
                    </>
                  )}
                </Button>
                {/* User Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.user_metadata?.avatar_url}
                          alt={user?.email}
                        />
                        <AvatarFallback>
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Admin
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Bar */}
        <div className="mx-4 mt-2 mb-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-700 font-medium">
                    System Operational
                  </span>
                </div>
                <div className="text-emerald-600">
                  <span className="font-medium">Uptime:</span> 99.9%
                </div>
                <div className="text-emerald-600">
                  <span className="font-medium">Response Time:</span> 120ms
                </div>
                <div className="text-emerald-600">
                  <span className="font-medium">Active Users:</span>{" "}
                  {Math.floor(realTimeCounts.totalUsers * 0.15)}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-emerald-600">
                  <span className="font-medium">Last Update:</span>{" "}
                  {new Date().toLocaleTimeString()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-emerald-600 hover:bg-emerald-100"
                  onClick={() => navigate("/admin/system")}
                >
                  <Activity className="w-3 h-3 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 pt-0">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
