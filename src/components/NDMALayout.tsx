import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import AnimatedBackground from "@/components/AnimatedBackground";
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
  BarChart3,
  Activity,
  Search,
  Plus,
  RefreshCw,
  CloudRain,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface NDMALayoutProps {
  children: React.ReactNode;
}

const NDMALayout = ({ children }: NDMALayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [realTimeCounts, setRealTimeCounts] = useState({
    pendingReports: 0,
    criticalReports: 0,
    activeAlerts: 0,
    activeShelters: 0,
    totalUsers: 0,
    trainingEvents: 0,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useSupabaseAuth();
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile from Supabase
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Load real-time counts for NDMA dashboard
  useEffect(() => {
    loadRealTimeCounts();
    const interval = setInterval(loadRealTimeCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const loadRealTimeCounts = async () => {
    try {
      // Load NDMA-specific metrics
      const { data: alertsData } = await supabase
        .from("emergency_alerts")
        .select("id")
        .eq("status", "active");

      const { data: reportsData } = await supabase
        .from("damage_reports")
        .select("id")
        .eq("status", "pending");

      const { data: usersData } = await supabase
        .from("user_profiles")
        .select("id");

      const { data: sheltersData } = await supabase
        .from("emergency_shelters")
        .select("id")
        .eq("status", "active");

      setRealTimeCounts({
        activeAlerts: alertsData?.length || 0,
        pendingReports: reportsData?.length || 0,
        totalUsers: usersData?.length || 0,
        activeShelters: sheltersData?.length || 0,
        criticalReports: 0, // Would come from critical reports query
        trainingEvents: 0, // Would come from training events query
      });
    } catch (error) {
      console.error("Error loading NDMA metrics:", error);
    }
  };

  // DMA-specific navigation - dedicated DMA routes
  const navigation = [
    { name: "DMA Dashboard", href: "/dma-dashboard", icon: Home, badge: null },
    {
      name: "Emergency Alerts",
      href: "/dma/alerts",
      icon: AlertTriangle,
      badge:
        realTimeCounts.activeAlerts > 0
          ? realTimeCounts.activeAlerts.toString()
          : null,
    },
    {
      name: "Reports & Analytics",
      href: "/dma/reports",
      icon: FileText,
      badge:
        realTimeCounts.pendingReports > 0
          ? realTimeCounts.pendingReports.toString()
          : null,
    },
    {
      name: "Training Management",
      href: "/dma/training",
      icon: BookOpen,
      badge: null,
    },
    {
      name: "GIS Intelligence",
      href: "/dma/gis-mapping",
      icon: MapPin,
      badge: null,
    },
    {
      name: "Flood Prediction",
      href: "/dma/flood-prediction",
      icon: CloudRain,
      badge: null,
    },
    {
      name: "Risk Assessment",
      href: "/dma/risk-assessment",
      icon: Shield,
      badge: null,
    },
    {
      name: "Shelter Management",
      href: "/dma/shelters",
      icon: Shield,
      badge:
        realTimeCounts.activeShelters > 0
          ? realTimeCounts.activeShelters.toString()
          : null,
    },
    {
      name: "Response Analytics",
      href: "/dma/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      name: "System Health",
      href: "/dma/system",
      icon: Activity,
      badge: null,
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-teal-100 to-blue-200 text-gray-700 backdrop-blur-xl shadow-2xl border border-teal-200 rounded-r-2xl transform transition-all duration-300 ease-out lg:translate-x-0 lg:left-4 lg:top-4 lg:bottom-4 lg:rounded-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-teal-200">
          <div className="flex items-center space-x-2">
            <img src="/favicon.svg" alt="JanRakshak Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-teal-700">JanRakshak</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-teal-700 hover:bg-teal-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-teal-700 ${
                    isActive ? "bg-teal-600 text-white" : "hover:bg-teal-200"
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

          <div className="border-t border-teal-200 my-4"></div>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-100"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* DMA Header Bar */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white shadow-lg mx-4 mt-4 px-6 py-4 rounded-xl">
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
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold">DMA Control Center</h1>
                  <Badge
                    variant="outline"
                    className="text-xs bg-white/20 border-white/30 text-white"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    DMA AUTHORITY
                  </Badge>
                </div>
                <p className="text-sm opacity-90">
                  District/State Disaster Management Authority
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <div className="text-xs text-white/80 hidden md:block">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/50 hover:bg-white/30 bg-white/20 font-medium"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Refresh</span>
                </Button>
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-white/20 border-white/30 text-white"
              >
                {realTimeCounts.pendingReports || 0} Critical Alerts
              </Badge>
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div className="bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 rounded-xl mx-4 mt-4 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Emergency Response: Standby Mode
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* Real-time status indicators */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <Activity className="w-3 h-3 mr-1" />
                  System Online
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {realTimeCounts.totalUsers} Active Users
                </Badge>
              </div>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {userProfile?.name?.charAt(0)?.toUpperCase() || "N"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <p className="font-medium">
                        {userProfile?.name || "NDMA User"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <Badge variant="secondary" className="mt-1 text-xs w-fit">
                        {userProfile?.role} Officer
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    System Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default NDMALayout;
