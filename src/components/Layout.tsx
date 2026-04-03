import { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/lib/firebase";
import AnimatedBackground from "@/components/AnimatedBackground";
import {
  Home,
  TrendingUp,
  AlertTriangle,
  Users,
  Camera,
  MapPin,
  Menu,
  X,
  Droplets,
  Shield,
  LogOut,
  Settings,
  User,
  Bell,
  ChevronDown,
  Crown,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Flood Prediction", href: "/flood-prediction", icon: Droplets },
    { name: "Predictions", href: "/predictions", icon: TrendingUp },
    { name: "Alerts", href: "/alerts", icon: AlertTriangle },
    { name: "Reports", href: "/reports", icon: Users },
    { name: "Assessment", href: "/assessment", icon: Camera },
    { name: "Planning", href: "/planning", icon: MapPin },
  ];

  const handleLogout = async () => {
    await logout();
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-100 to-teal-200 text-gray-100 backdrop-blur-xl shadow-2xl border border-blue-100 rounded-r-2xl transform transition-all duration-300 ease-out lg:translate-x-0 lg:left-4 lg:top-4 lg:bottom-4 lg:rounded-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-100 bg-gradient-to-r from-green-100 to-teal-200">
          <div className="flex items-center space-x-3">
            <img
              src="/favicon.svg"
              alt="JanRakshak Logo"
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                JanRakshak
              </h1>
              <p className="text-xs text-slate-500">Flood Warning System</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          {/* User Welcome Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-teal-100 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 ring-2 ring-blue-300">
                <AvatarImage src={currentUser?.photoURL || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white font-bold">
                  {userProfile?.displayName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900">Welcome back!</p>
                <p className="text-xs text-blue-700 truncate">
                  {userProfile?.displayName || "User"}
                </p>
              </div>
              <Button
                onClick={() => navigate("/profile")}
                size="sm"
                variant="ghost"
                className="bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-full p-2 relative"
              >
                <Settings className="w-4 h-4" />
                {/* Notification dot for profile updates */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
            </div>
          </div>

          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-3 mb-2 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-400 to-teal-400 text-gray-800 shadow-md shadow-blue-400/30"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-teal-100 hover:text-gray-800"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-20 left-3 right-3">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-blue-300">
                <AvatarImage src={currentUser?.photoURL || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white text-lg font-bold">
                  {userProfile?.displayName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-blue-900 truncate">
                  {userProfile?.displayName || "User"}
                </p>
                <p className="text-xs text-blue-700 truncate">
                  {userProfile?.email}
                </p>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 text-xs mt-1"
                >
                  {userProfile?.role?.replace("_", " ").toUpperCase() || "USER"}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full border border-blue-300"
                  >
                    <ChevronDown className="w-4 h-4 text-blue-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-blue-900 font-semibold">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="hover:bg-blue-50"
                  >
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-blue-50">
                    <Bell className="w-4 h-4 mr-2 text-blue-600" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-blue-50">
                    <Settings className="w-4 h-4 mr-2 text-blue-600" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-3 right-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">
                System Status
              </span>
            </div>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 hover:bg-green-100"
            >
              All Systems Operational
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-white/90 backdrop-blur-sm border border-blue-100 rounded-xl mx-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-blue-600">JanRakshak</span>
          </div>
          {/* Mobile User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 bg-blue-50 border-2 border-blue-200 rounded-full p-1 cursor-pointer hover:bg-blue-100 transition-colors">
                <Avatar className="w-8 h-8 ring-2 ring-blue-300">
                  <AvatarImage src={currentUser?.photoURL || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white text-sm font-bold">
                    {userProfile?.displayName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3 h-3 text-blue-600 mr-1" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-blue-900 font-semibold">
                <div className="flex items-center space-x-2">
                  <span>My Account</span>
                </div>
                <div className="text-xs text-blue-600 font-normal truncate">
                  {userProfile?.displayName || "User"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="hover:bg-blue-50"
              >
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-blue-50">
                <Bell className="w-4 h-4 mr-2 text-blue-600" />
                Notifications
              </DropdownMenuItem>
              {isAdmin(currentUser?.email) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/admin")}
                    className="hover:bg-purple-50"
                  >
                    <Crown className="w-4 h-4 mr-2 text-purple-600" />
                    Admin Panel
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page content */}
        <main className="p-6 pt-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
