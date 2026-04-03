import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Menu,
  X,
  LogOut,
  Home,
  FileText,
  Map,
  BarChart3,
  Plus,
  Building,
  Phone,
  Bell,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  RefreshCw,
  MapPin,
  Users,
  CloudRain,
  Heart,
  Shield,
  GraduationCap,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface UserLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const UserLayout = ({
  children,
  title = "Dashboard",
  description = "Welcome back",
}: UserLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>("");
  const { user, userProfile, signOut } = useRoleAwareAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Get role-based header colors only
  const getRoleHeaderColors = () => {
    const role = userProfile?.role?.toUpperCase();
    switch (role) {
      case "CITIZEN":
      case "USER":
        return {
          headerBg: "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 shadow-2xl border-2 border-blue-400/30",
          headerText: "text-white",
          roleLabel: "CITIZEN",
          roleIcon: "Users",
        };
      case "VOLUNTEER":
        return {
          headerBg: "bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 shadow-2xl border-2 border-green-400/30",
          headerText: "text-white",
          roleLabel: "VOLUNTEER",
          roleIcon: "Heart",
        };
      case "NGO":
        return {
          headerBg: "bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 shadow-2xl border-2 border-pink-400/30",
          headerText: "text-white",
          roleLabel: "NGO PARTNER",
          roleIcon: "Heart",
        };
      case "DMA":
        return {
          headerBg: "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 shadow-2xl border-2 border-orange-400/30",
          headerText: "text-white",
          roleLabel: "DMA OFFICER",
          roleIcon: "Shield",
        };
      case "ADMIN":
        return {
          headerBg: "bg-gradient-to-r from-red-700 via-rose-700 to-red-700 shadow-2xl border-2 border-red-400/30",
          headerText: "text-white",
          roleLabel: "ADMIN",
          roleIcon: "Shield",
        };
      default:
        return {
          headerBg: "bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 shadow-2xl border-2 border-teal-400/30",
          headerText: "text-white",
          roleLabel: "USER",
          roleIcon: "Users",
        };
    }
  };

  const roleColors = getRoleHeaderColors();

  const handleSignOut = async () => {
    try {
      console.log("🚪 UserLayout: Sign out button clicked");
      await signOut();
      console.log("🏠 UserLayout: Navigating to home page");
      navigate("/");
    } catch (error) {
      console.error("❌ UserLayout: Error signing out:", error);
    }
  };

  // Auto-translate page on mount if language is Hindi
  useEffect(() => {
    const currentLang = localStorage.getItem('language');
    console.log('🔄 UserLayout: Current language:', currentLang, 'Path:', location.pathname);
    
    if (currentLang === 'hi') {
      // Wait for DOM to be ready and translation function to be available
      const timer = setTimeout(() => {
        if ((window as any).translatePageContent) {
          console.log('🌐 UserLayout: Triggering auto-translation for path:', location.pathname);
          (window as any).translatePageContent('hi');
        } else {
          console.warn('⚠️ Translation function not available yet');
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]); // Re-run when route changes

  // Load OmniDimension widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'omnidimension-web-widget';
    script.src = 'https://omnidim.io/web_widget.js?secret_key=3be4e3bb5e468727adb5a5766ef8166a';
    script.async = true;
    document.body.appendChild(script);

    // Add custom CSS for widget dimensions and styling
    const style = document.createElement('style');
    style.id = 'omnidimension-widget-custom-style';
    style.textContent = `
      /* Backdrop overlay for depth */
      #omnidimension-widget-container::before,
      .omnidimension-widget::before,
      [class*="omnidimension"][class*="container"]::before {
        content: '' !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(0, 0, 0, 0.5) !important;
        backdrop-filter: blur(8px) !important;
        z-index: -1 !important;
        pointer-events: none !important;
      }
      
      /* Widget Container - Fixed dimensions */
      #omnidimension-widget-container,
      .omnidimension-widget,
      [class*="omnidimension"][class*="container"] {
        width: 400px !important;
        height: 600px !important;
        max-width: 400px !important;
        max-height: 600px !important;
        position: relative !important;
      }
      
      /* Widget iframe */
      #omnidimension-widget-container iframe,
      .omnidimension-widget iframe,
      [class*="omnidimension"] iframe {
        width: 400px !important;
        height: 600px !important;
        max-width: 400px !important;
        max-height: 600px !important;
      }
      
      /* Strong boundary and background for widget popup with enhanced depth */
      #omnidimension-widget-container,
      .omnidimension-widget,
      [class*="omnidimension"][class*="container"],
      [class*="omnidimension"][class*="popup"],
      [class*="omnidimension"][class*="chat"] {
        border: 5px solid #1e40af !important;
        border-radius: 20px !important;
        box-shadow: 
          0 0 0 1px rgba(255, 255, 255, 0.2),
          0 4px 6px rgba(0, 0, 0, 0.1),
          0 10px 20px rgba(0, 0, 0, 0.15),
          0 20px 40px rgba(0, 0, 0, 0.2),
          0 40px 80px rgba(0, 0, 0, 0.3),
          inset 0 0 0 3px rgba(255, 255, 255, 1) !important;
        overflow: hidden !important;
        background: linear-gradient(to bottom, #ffffff, #f9fafb) !important;
        backdrop-filter: blur(10px) !important;
        transform: translateZ(100px) !important;
        z-index: 99999 !important;
      }
      
      /* Iframe styling with depth */
      #omnidimension-widget-container iframe,
      .omnidimension-widget iframe,
      [class*="omnidimension"] iframe {
        border-radius: 15px !important;
        background: white !important;
        border: none !important;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingScript = document.getElementById('omnidimension-web-widget');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      const existingStyle = document.getElementById('omnidimension-widget-custom-style');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Detect user's location if not set
  useEffect(() => {
    const detectLocation = async () => {
      // Only detect if user doesn't have location set
      if (
        !userProfile?.state &&
        !userProfile?.district &&
        navigator.geolocation
      ) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
              });
            }
          );

          const { latitude, longitude } = position.coords;

          // Use reverse geocoding to get location details
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();

            if (data.countryName === "India") {
              const locationString = data.locality
                ? `${data.locality}, ${data.principalSubdivision}`
                : data.principalSubdivision || "India";
              setDetectedLocation(locationString);

              // Location detected and stored locally
              // Note: Auto-profile update removed for now
            }
          } catch (geocodeError) {
            console.error("Error with reverse geocoding:", geocodeError);
            setDetectedLocation("Location detected");
          }
        } catch (error) {
          console.error("Error detecting location:", error);
          setDetectedLocation("Location unavailable");
        }
      }
    };

    if (user && userProfile) {
      detectLocation();
    }
  }, [user, userProfile]);

  // Role-aware navigation
  const getNavigationItems = () => {
    const role = userProfile?.role?.toUpperCase();

    if (role === "VOLUNTEER") {
      return [
        { name: t('header.dashboard'), href: "/volunteer-dashboard", icon: Home },
        {
          name: t('volunteer.myActivities'),
          href: "/volunteer/activities",
          icon: Activity,
        },
        { name: t('volunteer.training'), href: "/volunteer/training", icon: GraduationCap },
        { name: t('header.community'), href: "/community", icon: Users },
        { name: t('volunteer.reports'), href: "/volunteer/reports", icon: FileText },
      ];
    } else if (role === "NGO") {
      return [
        { name: t('header.dashboard'), href: "/ngo-dashboard", icon: Home },
        { name: t('ngo.activeAlerts'), href: "/ngo/alerts", icon: AlertTriangle },
        { name: t('ngo.userManagement'), href: "/ngo/users", icon: Users },
        { name: t('ngo.trainingPrograms'), href: "/ngo/training", icon: BookOpen },
        { name: t('header.analytics'), href: "/ngo/analytics", icon: BarChart3 },
      ];
    } else {
      // Default for CITIZEN and other roles
      return [
        { name: t('header.dashboard'), href: "/dashboard", icon: Home },
        { name: t('header.myReports'), href: "/reports", icon: FileText },
        { name: t('header.community'), href: "/community", icon: Users },
        {
          name: t('header.floodPrediction'),
          href: "/flood-prediction",
          icon: CloudRain,
        },
        { name: t('header.analytics'), href: "/analytics", icon: BarChart3 },
      ];
    }
  };

  const navigation = getNavigationItems();

  const quickActions = [
    { name: t('header.findShelters'), href: "/shelters", icon: Building },
    { name: t('header.emergencyContacts'), href: "/emergency-contacts", icon: Phone },
    { name: t('header.viewAlerts'), href: "/alerts", icon: Bell },
  ];

  const profileActions = [
    { name: "Profile Settings", href: "/profile", icon: Settings },
  ];

  const handleNavigation = (item: any) => {
    console.log(
      "Navigation clicked:",
      item.name,
      "from:",
      location.pathname,
      "to:",
      item.href
    );

    // Prevent navigation if already on the same page
    if (location.pathname === item.href) {
      console.log("Already on same page, just closing sidebar");
      setSidebarOpen(false);
      return;
    }

    console.log("Navigating to:", item.href);

    // Close sidebar first for smoother UX
    setSidebarOpen(false);

    // Small delay to allow sidebar animation to complete
    setTimeout(() => {
      navigate(item.href, { replace: false });
    }, 100);
  };

  return (
    <div 
      className="min-h-screen relative" 
      style={theme === 'high-contrast' 
        ? { backgroundColor: 'hsl(0, 0%, 0%)', color: 'hsl(0, 0%, 100%)' } 
        : {}
      }
    >
      {theme !== 'high-contrast' && <AnimatedBackground />}
      
      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 text-white backdrop-blur-xl shadow-2xl border rounded-r-2xl transform transition-all duration-300 ease-out lg:translate-x-0 lg:left-4 lg:top-4 lg:bottom-4 lg:rounded-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          theme === 'high-contrast' ? 'border-[hsl(0,0%,40%)]' : 'border-cyan-500/20'
        }`}
        style={theme === 'high-contrast' ? {
          background: 'hsl(0, 0%, 5%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
        } : {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 51, 68, 0.95) 50%, rgba(19, 78, 74, 0.95) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between h-16 px-4 border-b ${
          theme === 'high-contrast' ? 'border-[hsl(0,0%,40%)]' : 'border-cyan-500/20'
        }`}>
          <div className="flex items-center space-x-2">
            <img src="/favicon.svg" alt="JanRakshak Logo" className="w-8 h-8" />
            <span className={`text-xl font-bold ${
              theme === 'high-contrast' ? 'text-[hsl(47,100%,60%)]' : 'bg-gradient-to-r from-cyan-100 to-teal-100 bg-clip-text text-transparent'
            }`}>JanRakshak</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`lg:hidden ${
              theme === 'high-contrast' ? 'text-white hover:bg-[hsl(0,0%,15%)]' : 'text-cyan-100 hover:bg-cyan-500/20'
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    theme === 'high-contrast'
                      ? (isActive ? 'bg-[hsl(47,100%,60%)] text-black shadow-lg' : 'text-white hover:bg-[hsl(0,0%,15%)] hover:text-[hsl(47,100%,60%)]')
                      : (isActive ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg" : "text-gray-300 hover:bg-cyan-500/10 hover:text-white")
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              );
            })}
          </div>

          <div className={`border-t my-4 ${
            theme === 'high-contrast' ? 'border-[hsl(0,0%,40%)]' : 'border-cyan-500/20'
          }`}></div>

          <div className="space-y-1">
            {quickActions.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    theme === 'high-contrast'
                      ? (isActive ? 'bg-[hsl(47,100%,60%)] text-black shadow-lg' : 'text-white hover:bg-[hsl(0,0%,15%)] hover:text-[hsl(47,100%,60%)]')
                      : (isActive ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg" : "text-gray-300 hover:bg-cyan-500/10 hover:text-white")
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              );
            })}
          </div>

          <div className={`border-t my-4 ${
            theme === 'high-contrast' ? 'border-[hsl(0,0%,40%)]' : 'border-cyan-500/20'
          }`}></div>

          <div className="space-y-1">
            {profileActions.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    theme === 'high-contrast'
                      ? (isActive ? 'bg-[hsl(47,100%,60%)] text-black shadow-lg' : 'text-white hover:bg-[hsl(0,0%,15%)] hover:text-[hsl(47,100%,60%)]')
                      : (isActive ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg" : "text-gray-300 hover:bg-cyan-500/10 hover:text-white")
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              );
            })}
          </div>

          <div className={`border-t my-4 ${
            theme === 'high-contrast' ? 'border-[hsl(0,0%,40%)]' : 'border-cyan-500/20'
          }`}></div>

          <Button
            variant="ghost"
            className={`w-full justify-start ${
              theme === 'high-contrast' ? 'text-[hsl(0,100%,60%)] hover:bg-[hsl(0,100%,60%)]/10' : 'text-red-400 hover:bg-red-950/50 hover:text-red-300'
            }`}
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {t('header.signOut')}
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Role-based Header Bar */}
        <div
          className={`${roleColors.headerBg} ${roleColors.headerText} mx-4 mt-4 px-6 py-5 rounded-2xl relative overflow-hidden backdrop-blur-sm`}
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Premium glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold tracking-tight drop-shadow-lg">{title}</h1>
                  <Badge
                    variant="outline"
                    className="text-xs bg-white/20 border-white/40 text-white flex items-center gap-1 backdrop-blur-sm shadow-lg"
                  >
                    {roleColors.roleIcon === "User" && (
                      <Users className="w-3 h-3" />
                    )}
                    {roleColors.roleIcon === "Users" && (
                      <Users className="w-3 h-3" />
                    )}
                    {roleColors.roleIcon === "Heart" && (
                      <Heart className="w-3 h-3" />
                    )}
                    {roleColors.roleIcon === "Shield" && (
                      <Shield className="w-3 h-3" />
                    )}
                    {t(`common.${roleColors.roleLabel.toLowerCase()}`)}
                  </Badge>
                </div>
                <p className="text-sm opacity-90 mt-1 drop-shadow">
                  {(userProfile?.role?.toUpperCase() === "CITIZEN" || 
                    userProfile?.role?.toUpperCase() === "USER") &&
                    t('common.communityMember')}
                  {userProfile?.role?.toUpperCase() === "VOLUNTEER" &&
                    t('volunteer.communityVolunteer')}
                  {userProfile?.role?.toUpperCase() === "NGO" &&
                    t('ngo.ngoCoordinator')}
                  {userProfile?.role?.toUpperCase() === "DMA" &&
                    t('dma.dmaOfficer')}
                  {userProfile?.role?.toUpperCase() === "ADMIN" &&
                    "System Administrator"}
                  {!userProfile?.role && "Welcome to JanRakshak"}
                  {user?.email && ` • ${user.email}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <ThemeToggle />
              <LanguageToggle />
              <div className="text-xs text-white/90 hidden md:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <Clock className="w-3.5 h-3.5" />
                {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/50 hover:bg-white/30 bg-white/15 font-medium backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
                  onClick={async () => {
                    if (navigator.geolocation && user && userProfile) {
                      try {
                        const position = await new Promise<GeolocationPosition>(
                          (resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(
                              resolve,
                              reject,
                              {
                                enableHighAccuracy: true,
                                timeout: 10000,
                                maximumAge: 0, // Force fresh location
                              }
                            );
                          }
                        );

                        const { latitude, longitude } = position.coords;

                        const response = await fetch(
                          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                        );
                        const data = await response.json();

                        if (data.countryName === "India") {
                          setDetectedLocation(
                            `${data.locality || ""}, ${
                              data.principalSubdivision || ""
                            }`
                          );
                          // Note: Profile update functionality removed for now
                        }
                      } catch (error) {
                        console.error("Error updating location:", error);
                      }
                    }
                  }}
                >
                  <MapPin className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">{t('header.updateLocation')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/50 hover:bg-white/30 bg-white/15 font-medium backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">{t('header.refresh')}</span>
                </Button>
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-white/20 border-white/40 text-white hidden lg:flex backdrop-blur-sm shadow-lg"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {userProfile?.district && userProfile?.state
                  ? `${userProfile.district}, ${userProfile.state}`
                  : userProfile?.state
                  ? userProfile.state
                  : detectedLocation || "Location not set"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div 
          className="p-6 pt-4" 
          style={theme === 'high-contrast' 
            ? { backgroundColor: 'hsl(0, 0%, 0%)', color: 'hsl(0, 0%, 100%)' }
            : { backgroundColor: 'transparent' }
          }
        >{children}</div>
      </div>

      {/* OmniDimension Widget Button - Fixed Bottom Right */}
      <button 
        id="omni-open-widget-btn"
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
        style={{ zIndex: 9999 }}
      >
        💬 Help
      </button>
    </div>
  );
};

export default UserLayout;
