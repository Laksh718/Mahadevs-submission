import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import GradientCard from "@/components/GradientCard";
import UserLayout from "@/components/UserLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslatedText } from "@/components/TranslatedText";
import { toast } from "sonner";
import {
  Bell,
  Phone,
  MapPin,
  Users,
  Volume2,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  X,
  Shield,
  Zap,
} from "lucide-react";

const Alerts = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const { 
    alerts, 
    soundEnabled, 
    setSoundEnabled, 
    refreshAlerts,
    enableAudioContext,
    testFlashWarning
  } = useAlert();
  
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [filteredAlerts, setFilteredAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // Get user's locality for filtering
  const userLocality = userProfile?.location ? 
    `${userProfile.location.district}, ${userProfile.location.state}` : 
    null;

  // Initialize alerts from global context
  useEffect(() => {
    if (alerts.length > 0) {
      console.log('Using alerts from global context:', alerts);
    }
  }, [alerts]);

  // Filter alerts by user locality
  useEffect(() => {
    if (!alerts.length) {
      setFilteredAlerts([]);
      return;
    }

    if (showAllAlerts || !userLocality) {
      setFilteredAlerts(alerts);
    } else {
      // Filter alerts that match user's locality (district, state, or region)
      const localityAlerts = alerts.filter(alert => {
        const alertRegion = alert.region.toLowerCase();
        const userDistrict = userProfile?.location?.district?.toLowerCase() || '';
        const userState = userProfile?.location?.state?.toLowerCase() || '';
        
        return alertRegion.includes(userDistrict) || 
               alertRegion.includes(userState) ||
               alertRegion.includes('regional') ||
               alertRegion.includes('city wide') ||
               alertRegion.includes('all areas');
      });
      
      setFilteredAlerts(localityAlerts);
    }
  }, [alerts, userLocality, showAllAlerts, userProfile]);


  // Helper function to format time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const alertDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };


  // Real emergency contacts - these would come from a database in a real app
  const emergencyContacts = [
    { name: "Emergency Services", number: "100", type: "emergency" },
    { name: "Flood Control Center", number: "+91-XXX-XXXX", type: "flood" },
    { name: "Disaster Management", number: "+91-XXX-XXXX", type: "disaster" },
    { name: "Municipal Office", number: "+91-XXX-XXXX", type: "municipal" },
  ];

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "critical":
        return "danger";
      case "warning":
        return "warning";
      case "success":
        return "success";
      default:
        return "default";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return AlertTriangle;
      case "warning":
        return Bell;
      case "success":
        return CheckCircle;
      default:
        return Bell;
    }
  };

  try {
    return (
      <UserLayout title="Alerts" description="Early warning and communications">
        <div className="space-y-8">
          {/* Animated Header */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-5xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Early Warning & Communications
              </h1>
            </motion.div>
            <motion.p 
              className="text-lg text-gray-700 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Real-time alert system with multi-channel communication and emergency
              response coordination
            </motion.p>
          </motion.div>

          {/* Alert Controls */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <GradientCard variant="warning" glow className="p-6 max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-orange-600" />
                  Alert Settings
                </h3>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                  Live
                </Badge>
              </div>
              <div className="space-y-6">
                <motion.div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full shadow-md ${soundEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-semibold text-gray-700">Sound Alerts</span>
                  </div>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={(enabled) => {
                      setSoundEnabled(enabled);
                      if (enabled) {
                        enableAudioContext();
                      }
                    }}
                    className="data-[state=checked]:bg-green-600"
                  />
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full shadow-md ${autoTranslate ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-semibold text-gray-700">Auto-Translate</span>
                  </div>
                  <Switch
                    checked={autoTranslate}
                    onCheckedChange={setAutoTranslate}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </motion.div>
              </div>
            </GradientCard>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Alert Feed */}
            <div className="lg:col-span-2" id="alerts-section">
              <GradientCard variant="danger" glow className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                      {userLocality ? `${userLocality} Alerts` : 'All Alerts'}
                    </h2>
                    {userLocality && (
                      <p className="text-sm text-gray-600 mt-1 font-medium">
                        Showing alerts for your area
                      </p>
                    )}
              </div>
              <div className="flex items-center space-x-3">
                {userLocality && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllAlerts(!showAllAlerts)}
                  >
                    {showAllAlerts ? 'Show Local Only' : 'Show All Alerts'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testFlashWarning}
                >
                  Test Flash Warning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await refreshAlerts();
                      toast.success('Alerts refreshed');
                    } catch (err) {
                      toast.error('Failed to refresh alerts');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Bell className="w-3 h-3 mr-1" />
                  {filteredAlerts.filter((a) => a.status === "active").length} Active
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading alerts...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2" />
                  <p>
                    {userLocality && !showAllAlerts 
                      ? `No alerts for ${userLocality}` 
                      : 'No alerts available'
                    }
                  </p>
                  {userLocality && !showAllAlerts && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowAllAlerts(true)}
                    >
                      Show All Alerts
                    </Button>
                  )}
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const AlertIcon = getAlertIcon(alert.severity);
                  return (
                    <GradientCard
                      key={alert.id}
                      variant={getAlertVariant(alert.severity)}
                      className="p-4"
                      hover={false}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            alert.severity === "critical"
                              ? "bg-red-100"
                              : alert.severity === "high"
                              ? "bg-orange-100"
                              : alert.severity === "medium"
                              ? "bg-yellow-100"
                              : "bg-green-100"
                          }`}
                        >
                          <AlertIcon
                            className={`w-5 h-5 ${
                              alert.severity === "critical"
                                ? "text-red-600"
                                : alert.severity === "high"
                                ? "text-orange-600"
                                : alert.severity === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                            </h3>
                            <Badge
                              variant={
                                alert.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                alert.status === "active"
                                  ? "bg-red-100 text-red-700"
                                  : ""
                              }
                            >
                              {alert.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-700 mb-3">
                            {alert.message}
                          </p>

                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {alert.region}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {alert.sent_to?.length || 0} recipients
                              </span>
                            </div>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {getTimeAgo(alert.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </GradientCard>
                  );
                })
              )}
            </div>
          </GradientCard>
        </div>

        {/* Emergency Actions & Contacts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <GradientCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <MapPin className="w-4 h-4 mr-2" />
                View Evacuation Routes
              </Button>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Users className="w-4 h-4 mr-2" />
                Find Nearest Shelter
              </Button>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <MessageSquare className="w-4 h-4 mr-2" />
                Community Chat
              </Button>
            </div>
          </GradientCard>

          {/* Emergency Contacts */}
          <GradientCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Emergency Contacts
            </h3>
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {contact.name}
                    </p>
                    <p className="text-xs text-slate-600">{contact.number}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-green-50 hover:border-green-200"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </GradientCard>

        </div>
      </div>

      </div>
    </UserLayout>
  );
  } catch (renderError) {
    console.error('Alerts component: Error rendering:', renderError);
    return (
      <UserLayout title="Alerts" description="Early warning and communications">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Alert System Error</h1>
          <p className="text-gray-600 mb-4">There was an error loading the alerts page.</p>
          <p className="text-sm text-gray-500 mb-4">Error: {renderError?.message || 'Unknown error'}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </UserLayout>
    );
  }
};

export default Alerts;
