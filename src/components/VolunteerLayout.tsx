import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import AnimatedBackground from "@/components/AnimatedBackground";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Menu,
  X,
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
  RefreshCw,
  BookOpen,
  GraduationCap,
  HandHeart,
  Truck,
  Package,
  Calendar,
  Award,
  Target,
  BookOpen as Library,
  Heart as FirstAid,
  Clock,
  Download,
  Sun,
  Contrast,
} from "lucide-react";

interface VolunteerLayoutProps {
  children: React.ReactNode;
}

const VolunteerLayout = ({ children }: VolunteerLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [realTimeCounts, setRealTimeCounts] = useState({
    totalActivities: 0,
    pendingTasks: 0,
    completedTraining: 0,
    hoursLogged: 0,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useSupabaseAuth();
  const { theme, toggleTheme } = useTheme();

  console.log('VolunteerLayout - Current theme:', theme);

  // For volunteers, extract profile info from user metadata or create a basic profile
  const userProfile = user
    ? {
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email ||
          "Volunteer",
        email: user.email || "",
        role: user.user_metadata?.role || "VOLUNTEER",
      }
    : null;

  console.log("🏗️ VolunteerLayout: Rendering with auth state", {
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    userProfileRole: userProfile?.role,
    currentPath: location.pathname,
  });

  useEffect(() => {
    loadRealTimeCounts();
  }, []);

  const loadRealTimeCounts = async () => {
    try {
      setRealTimeCounts({
        totalActivities: 23,
        pendingTasks: 5,
        completedTraining: 8,
        hoursLogged: 156,
      });
    } catch (error) {
      console.error("Error loading real-time counts:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("🔐 Volunteer Layout: Starting signout process...");

      // Always try to sign out from RoleAware auth (which handles both Firebase and Supabase)
      console.log("📤 Volunteer Layout: Signing out from auth systems...");
      await signOut();
      console.log("✅ Volunteer Layout: Signout completed successfully");

      console.log("🔄 Volunteer Layout: Navigating to auth page...");
      navigate("/auth");
    } catch (error) {
      console.error("❌ Volunteer Layout: Error during signout:", error);
      // Even if signout fails, navigate to auth to prevent being stuck
      console.log(
        "🔄 Volunteer Layout: Signout failed, navigating to auth anyway..."
      );
      navigate("/auth");
    }
  };

  const navigation = [
    // MAIN DASHBOARD
    {
      name: "Dashboard",
      href: "/volunteer-dashboard",
      icon: Home,
      badge: null,
      section: "main",
    },

    // VOLUNTEER ACTIVITIES
    {
      name: "My Activities",
      href: "/volunteer/activities",
      icon: Activity,
      badge:
        realTimeCounts.totalActivities > 0
          ? realTimeCounts.totalActivities.toString()
          : null,
      section: "activities",
    },
    {
      name: "Task Management",
      href: "/volunteer/activities",
      icon: Target,
      badge:
        realTimeCounts.pendingTasks > 0
          ? realTimeCounts.pendingTasks.toString()
          : null,
      section: "activities",
    },
    {
      name: "Field Operations",
      href: "/volunteer/activities",
      icon: MapPin,
      badge: "LIVE",
      section: "activities",
    },

    // TRAINING & DEVELOPMENT
    {
      name: "Training Programs",
      href: "/volunteer/training",
      icon: GraduationCap,
      badge:
        realTimeCounts.completedTraining > 0
          ? `${realTimeCounts.completedTraining}/10`
          : null,
      section: "training",
    },
    {
      name: "Skill Development",
      href: "/volunteer/training",
      icon: BookOpen,
      badge: "NEW",
      section: "training",
    },
    {
      name: "Certification Center",
      href: "/volunteer/training",
      icon: Award,
      badge: null,
      section: "training",
    },

    // RESOURCES & EQUIPMENT
    {
      name: "Equipment Tracking",
      href: "/volunteer/activities",
      icon: Package,
      badge: null,
      section: "resources",
    },
    {
      name: "Resource Library",
      href: "/volunteer/training",
      icon: Library,
      badge: null,
      section: "resources",
    },
    {
      name: "Emergency Supplies",
      href: "/volunteer/activities",
      icon: FirstAid,
      badge: null,
      section: "resources",
    },

    // SCHEDULE & REPORTS
    {
      name: "My Schedule",
      href: "/volunteer/activities",
      icon: Calendar,
      badge: null,
      section: "management",
    },
    {
      name: "Report Submissions",
      href: "/volunteer/reports",
      icon: FileText,
      badge: null,
      section: "management",
    },
    {
      name: "Performance Analytics",
      href: "/volunteer/reports",
      icon: BarChart3,
      badge: null,
      section: "management",
    },
  ];

  // Group navigation by sections
  const navigationSections = {
    main: navigation.filter((item) => item.section === "main"),
    activities: navigation.filter((item) => item.section === "activities"),
    training: navigation.filter((item) => item.section === "training"),
    resources: navigation.filter((item) => item.section === "resources"),
    management: navigation.filter((item) => item.section === "management"),
  };

  const displayName = userProfile?.name || "Volunteer";
  const email = userProfile?.email || "";
  const initials =
    displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "V";

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

      {/* Sidebar matching AdminLayout with purple theme */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-100 to-pink-200 text-gray-700 backdrop-blur-xl shadow-2xl border border-purple-200 rounded-r-2xl transform transition-all duration-300 ease-out lg:translate-x-0 lg:left-4 lg:top-4 lg:bottom-4 lg:rounded-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with purple theme */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="JanRakshak Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-purple-700">
              JanRakshak
            </span>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 text-xs"
            >
              Volunteer
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-purple-700 hover:bg-purple-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Enhanced Navigation matching AdminLayout exactly */}
        <nav className="flex-1 px-4 py-6 space-y-3">
          {/* Main Dashboard */}
          <div className="space-y-1">
            {navigationSections.main.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-purple-700 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "hover:bg-purple-200"
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

          {/* Volunteer Activities */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider px-2">
              Volunteer Activities
            </h3>
            {navigationSections.activities.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-purple-700 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "hover:bg-purple-200"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.name === "Task Management" &&
                    realTimeCounts.pendingTasks > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-auto text-xs animate-pulse"
                      >
                        {realTimeCounts.pendingTasks}
                      </Badge>
                    )}
                  {item.badge && item.name !== "Task Management" && (
                    <Badge
                      className={`ml-auto text-xs ${
                        item.badge === "LIVE"
                          ? "bg-green-500 text-white"
                          : item.badge === "NEW"
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

          {/* Training & Development */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider px-2">
              Training & Development
            </h3>
            {navigationSections.training.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-purple-700 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "hover:bg-purple-200"
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

          {/* Resources & Equipment */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider px-2">
              Resources & Equipment
            </h3>
            {navigationSections.resources.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-purple-700 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "hover:bg-purple-200"
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

          {/* Schedule & Reports */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider px-2">
              Schedule & Reports
            </h3>
            {navigationSections.management.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-purple-700 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "hover:bg-purple-200"
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
        </nav>

        {/* User Profile Section with purple theme */}
        <nav className="p-4 border-t border-purple-200">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-purple-700 hover:bg-purple-200"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </nav>
      </div>

      {/* Main content with space for floating sidebar */}
      <div className="lg:ml-72">
        {/* Enhanced Volunteer Top bar - Green/Emerald Theme */}
        <div className="bg-gradient-to-r from-green-700 via-emerald-700 to-green-700 shadow-2xl border-2 border-green-400/30 rounded-xl mx-4 mt-4 px-6 py-4">
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
                  <HandHeart className="w-6 h-6 mr-2" />
                  JanRakshak Volunteer Portal
                </h1>
                <p className="text-sm text-green-200">
                  Emergency Response & Community Support
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Real-time status indicators */}
              <div className="flex items-center space-x-3 text-white text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {realTimeCounts.pendingTasks} Tasks
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Activity className="w-3 h-3 mr-1" />
                  {realTimeCounts.totalActivities} Activities
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-white/50 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm font-medium shadow-lg"
                  onClick={loadRealTimeCounts}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-yellow-400 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm font-medium shadow-lg"
                  onClick={() => {
                    console.log('Volunteer Theme toggle clicked, current theme:', theme);
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-white/50 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm font-medium shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Quick Actions
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Volunteer Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate("/volunteer-activities")}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      View Activities
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/volunteer-reports")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Report
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/volunteer-schedule")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      View Schedule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Page Content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default VolunteerLayout;
