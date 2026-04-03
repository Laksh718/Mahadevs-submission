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
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
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
  Heart,
  HandHeart,
  Truck,
  Package,
  Calendar,
  Award,
  Target,
  Clock,
  Download,
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
  const { userProfile, signOut } = useRoleAwareAuth();
  const { user: supabaseUser, signOut: supabaseSignOut } = useSupabaseAuth();

  // Load real-time counts
  useEffect(() => {
    loadRealTimeCounts();
  }, []);

  const loadRealTimeCounts = async () => {
    try {
      // Mock data for now - replace with actual Supabase queries
      setRealTimeCounts({
        totalActivities: 25,
        pendingTasks: 3,
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

      if (supabaseUser) {
        console.log("📤 Volunteer Layout: Signing out from Supabase...");
        await supabaseSignOut();
      }

      if (userProfile) {
        console.log("📤 Volunteer Layout: Signing out from Firebase...");
        await signOut();
      }

      console.log(
        "✅ Volunteer Layout: Signout completed, navigating to login..."
      );
      navigate("/login");
    } catch (error) {
      console.error("❌ Volunteer Layout: Error during signout:", error);
    }
  };

  const navigation = [
    // MAIN DASHBOARD
    { 
      name: "Dashboard", 
      href: "/volunteer-dashboard", 
      icon: Home, 
      badge: null,
      section: "main" 
    },
    
    // VOLUNTEER ACTIVITIES
    {
      name: "My Activities",
      href: "/volunteer-activities",
      icon: Activity,
      badge: realTimeCounts.totalActivities > 0 ? realTimeCounts.totalActivities.toString() : null,
      section: "activities"
    },
    {
      name: "Task Management",
      href: "/volunteer-tasks", 
      icon: Target,
      badge: realTimeCounts.pendingTasks > 0 ? realTimeCounts.pendingTasks.toString() : null,
      section: "activities"
    },
    {
      name: "Field Operations",
      href: "/volunteer-operations",
      icon: MapPin,
      badge: "LIVE",
      section: "activities"
    },
    
    // TRAINING & DEVELOPMENT
    {
      name: "Training Programs",
      href: "/volunteer-training",
      icon: GraduationCap,
      badge: realTimeCounts.completedTraining > 0 ? `${realTimeCounts.completedTraining}/12` : null,
      section: "training"
    },
    {
      name: "Skills Assessment",
      href: "/volunteer-skills",
      icon: Award,
      badge: null,
      section: "training"
    },
    {
      name: "Certification Hub",
      href: "/volunteer-certifications",
      icon: BookOpen,
      badge: "NEW",
      section: "training"
    },
    
    // RESOURCE MANAGEMENT
    {
      name: "Resource Access",
      href: "/volunteer-resources",
      icon: Package,
      badge: null,
      section: "resources"
    },
    {
      name: "Equipment Status",
      href: "/volunteer-equipment",
      icon: Truck,
      badge: null,
      section: "resources"
    },
    
    // REPORTING & ANALYTICS
    {
      name: "Schedule Management", 
      href: "/volunteer-schedule",
      icon: Calendar,
      badge: null,
      section: "management"
    },
    {
      name: "Report Submissions",
      href: "/volunteer-reports",
      icon: FileText,
      badge: null,
      section: "management"
    },
    {
      name: "Performance Analytics",
      href: "/volunteer-analytics",
      icon: BarChart3,
      badge: null,
      section: "management"
    }
  ];

  // Group navigation by sections
  const navigationSections = {
    main: navigation.filter(item => item.section === "main"),
    activities: navigation.filter(item => item.section === "activities"),
    training: navigation.filter(item => item.section === "training"),
    resources: navigation.filter(item => item.section === "resources"),
    management: navigation.filter(item => item.section === "management"),
  };

  const displayName =
    userProfile?.name ||
    supabaseUser?.user_metadata?.full_name ||
    "Volunteer";
  const email = userProfile?.email || supabaseUser?.email || "";
  const initials =
    displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "V";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar with AdminLayout Styling */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r border-teal-200 transform transition-all duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header matching AdminLayout */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="JanRakshak Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-teal-700">JanRakshak</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              Volunteer
            </Badge>
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

        {/* Real-time Status Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-teal-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">System Active</span>
            </div>
            <div className="flex items-center gap-2 text-teal-600">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation matching AdminLayout */}
        <nav className="flex-1 px-4 py-6 space-y-3">
          {/* Main Dashboard */}
          <div className="space-y-1">
            {navigationSections.main.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-teal-700 ${
                    isActive ? "bg-teal-600 text-white shadow-lg" : "hover:bg-teal-200"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge className="ml-auto bg-green-500 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Volunteer Activities */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider px-2">
              Volunteer Activities
            </h3>
            {navigationSections.activities.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-teal-700 ${
                    isActive ? "bg-teal-600 text-white shadow-lg" : "hover:bg-teal-200"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.name === "Task Management" && realTimeCounts.pendingTasks > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs animate-pulse">
                      {realTimeCounts.pendingTasks}
                    </Badge>
                  )}
                  {item.badge && item.name !== "Task Management" && (
                    <Badge className={`ml-auto text-xs ${
                      item.badge === "LIVE" ? "bg-green-500 text-white" : 
                      "bg-blue-500 text-white"
                    }`}>
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Training & Development */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider px-2">
              Training & Development
            </h3>
            {navigationSections.training.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-teal-700 ${
                    isActive ? "bg-teal-600 text-white shadow-lg" : "hover:bg-teal-200"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge className={`ml-auto text-xs ${
                      item.badge === "NEW" ? "bg-green-500 text-white" : 
                      "bg-blue-500 text-white"
                    }`}>
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Resources & Equipment */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider px-2">
              Resources & Equipment
            </h3>
            {navigationSections.resources.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-teal-700 ${
                    isActive ? "bg-teal-600 text-white shadow-lg" : "hover:bg-teal-200"
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
            <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider px-2">
              Schedule & Reports
            </h3>
            {navigationSections.management.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-teal-700 ${
                    isActive ? "bg-teal-600 text-white shadow-lg" : "hover:bg-teal-200"
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

        {/* Quick Stats Card */}
        <div className="mx-4 mb-4">
          <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 rounded-xl p-4 border border-teal-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                My Performance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Activities</span>
                  </div>
                  <span className="text-sm font-semibold text-teal-700">{realTimeCounts.totalActivities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Hours</span>
                  </div>
                  <span className="text-sm font-semibold text-green-700">{realTimeCounts.hoursLogged}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Training</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">{realTimeCounts.completedTraining}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced User Profile Section */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto p-3 hover:bg-white/50 rounded-xl transition-all duration-200"
              >
                <Avatar className="h-9 w-9 ring-2 ring-teal-200">
                  <AvatarImage />
                  <AvatarFallback className="bg-gradient-to-br from-teal-100 to-green-100 text-teal-700 font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                  <div className="text-xs text-gray-500 truncate">{email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 shadow-xl">
              <DropdownMenuLabel className="text-teal-700">Volunteer Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-teal-50">
                <User className="mr-2 h-4 w-4 text-teal-600" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-green-50">
                <Settings className="mr-2 h-4 w-4 text-green-600" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-blue-50">
                <Bell className="mr-2 h-4 w-4 text-blue-600" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content matching AdminLayout */}
      <div className="lg:ml-72">
        {/* Enhanced Top bar with gradient matching AdminLayout */}
        <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 shadow-xl border-2 border-teal-300 rounded-xl mx-4 mt-4 px-6 py-4">
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
                <p className="text-sm text-teal-100">Emergency Response & Community Support</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Bell className="w-4 h-4 mr-2" />
                Alerts
                {realTimeCounts.pendingTasks > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs animate-pulse">
                    {realTimeCounts.pendingTasks}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Quick Actions
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    Activity Report
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Export
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Performance Stats
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* System Status Bar */}
          <div className="px-6 py-2 bg-black/10 border-t border-white/20">
            <div className="flex items-center justify-between text-sm text-white/90">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>All Systems Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Connected Users: 12</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span>Last Updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Page Content */}
        <main className="bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VolunteerLayout;
