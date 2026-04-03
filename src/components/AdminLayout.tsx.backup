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
import { useSupabaseAuthMinimal } from "@/contexts/SupabaseAuthContextMinimal";
import { getRealTimeCounts } from "@/lib/adminSupabase";
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
    { name: "Dashboard", href: "/admin", icon: Home, badge: null },
    {
      name: "Alerts",
      href: "/admin/alerts",
      icon: AlertTriangle,
      badge:
        realTimeCounts.activeAlerts > 0
          ? realTimeCounts.activeAlerts.toString()
          : null,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: FileText,
      badge:
        realTimeCounts.pendingReports > 0
          ? realTimeCounts.pendingReports.toString()
          : null,
    },
    { name: "Users", href: "/admin/users", icon: Users, badge: null },
    {
      name: "Shelters",
      href: "/admin/shelters",
      icon: MapPin,
      badge:
        realTimeCounts.activeShelters > 0
          ? realTimeCounts.activeShelters.toString()
          : null,
    },
    {
      name: "Damage Assessment",
      href: "/admin/risk-assessment",
      icon: Shield,
      badge: null,
    },
    {
      name: "Flood Prediction",
      href: "/admin/flood-prediction",
      icon: CloudRain,
      badge: null,
    },
    {
      name: "Training Management",
      href: "/admin/training",
      icon: BookOpen,
      badge: null,
    },
    { name: "Route Planning", href: "/admin/routes", icon: Route, badge: null },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      name: "System Health",
      href: "/admin/system",
      icon: Activity,
      badge: null,
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
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
        {/* Top bar */}
        <div className="bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 rounded-xl mx-4 mt-4 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-600"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-600">Welcome back, Admin</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                ADMIN
              </Badge>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadRealTimeCounts}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
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

        {/* Page content */}
        <div className="p-6 pt-4">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
