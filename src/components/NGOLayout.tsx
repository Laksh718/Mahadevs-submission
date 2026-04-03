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
import { supabase } from "@/lib/supabase";
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
  Sun,
  Contrast,
} from "lucide-react";

interface NGOLayoutProps {
  children: React.ReactNode;
}

const NGOLayout = ({ children }: NGOLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [realTimeCounts, setRealTimeCounts] = useState({
    pendingReports: 0,
    activeAlerts: 0,
    activeShelters: 0,
    totalUsers: 0,
    volunteers: 0,
    reliefOperations: 0,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useRoleAwareAuth();
  const { theme, toggleTheme } = useTheme();

  console.log('NGOLayout - Current theme:', theme);

  // Load real-time counts for NGO dashboard
  useEffect(() => {
    loadRealTimeCounts();
    const interval = setInterval(loadRealTimeCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRealTimeCounts = async () => {
    try {
      // Load NGO-specific metrics
      const { data: alertsData } = await supabase
        .from("emergency_alerts")
        .select("id")
        .eq("status", "active");

      const { data: volunteersData } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("role", "VOLUNTEER");

      const { data: usersData } = await supabase
        .from("user_profiles")
        .select("id");

      const { data: sheltersData } = await supabase
        .from("emergency_shelters")
        .select("id")
        .eq("status", "active");

      setRealTimeCounts({
        activeAlerts: alertsData?.length || 0,
        pendingReports: 0, // Would come from NGO reports
        totalUsers: usersData?.length || 0,
        activeShelters: sheltersData?.length || 0,
        volunteers: volunteersData?.length || 0,
        reliefOperations: 0, // Would come from relief operations query
      });
    } catch (error) {
      console.error("Error loading NGO metrics:", error);
    }
  };

  // NGO-specific navigation - essential features with comprehensive options
  const navigation = [
    { name: "Dashboard", href: "/ngo-dashboard", icon: Home, badge: null },
    {
      name: "Shelter Management",
      href: "/ngo/shelters",
      icon: Shield,
      badge:
        realTimeCounts.activeShelters > 0
          ? realTimeCounts.activeShelters.toString()
          : null,
    },
    {
      name: "Relief Allocation",
      href: "/ngo/relief",
      icon: Truck,
      badge: null,
    },
    {
      name: "Food Resources",
      href: "/ngo/food-resources",
      icon: Package,
      badge: null,
    },
    {
      name: "Volunteer Management",
      href: "/ngo/volunteers",
      icon: Users,
      badge:
        realTimeCounts.volunteers > 0
          ? realTimeCounts.volunteers.toString()
          : null,
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  asChild={false}
                  type="button"
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
        {/* NGO Header Bar - Pink/Rose Theme */}
        <div className="bg-gradient-to-r from-pink-700 via-rose-700 to-pink-700 text-white shadow-2xl border-2 border-pink-400/30 mx-4 mt-4 px-6 py-4 rounded-xl">
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
                  <h1 className="text-2xl font-bold">NGO Command Center</h1>
                  <Badge
                    variant="outline"
                    className="text-xs bg-pink-500/30 border-pink-300/50 text-white"
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    NGO OPERATIONS
                  </Badge>
                </div>
                <p className="text-sm opacity-90">
                  {userProfile?.organization || "Community Relief Operations"}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-2 border-yellow-400 hover:bg-white/30 bg-white/20 font-medium"
                  onClick={() => {
                    console.log('NGO Theme toggle clicked, current theme:', theme);
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
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-white/20 border-white/30 text-white"
              >
                {realTimeCounts.volunteers || 0} Active Resources
              </Badge>
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div className="bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 rounded-xl mx-4 mt-4 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Relief Operations Status: Active
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
                  <Heart className="w-3 h-3 mr-1" />
                  Relief Active
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {realTimeCounts.volunteers} Volunteers
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
                        {userProfile?.name || "NGO Coordinator"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs w-fit bg-green-100 text-green-700"
                      >
                        {userProfile?.role} • {userProfile?.organization}
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
                    Organization Settings
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

export default NGOLayout;
