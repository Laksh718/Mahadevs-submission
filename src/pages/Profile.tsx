import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserLayout from '@/components/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Droplets,
  User,
  Mail,
  MapPin,
  Phone,
  Shield,
  Bell,
  Settings,
  LogOut,
  RefreshCw,
  Save,
  Camera,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Home,
  FileText,
  Building,
  Activity,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Profile = () => {
  const { theme } = useTheme();
  const { currentUser, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Profile data
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: {
      state: '',
      district: '',
      address: ''
    },
    preferences: {
      alertTypes: [],
      notificationMethods: [],
      emergencyContacts: []
    },
    role: 'user'
  });
  
  // User statistics from admin database
  const [userStats, setUserStats] = useState({
    total_reports: 0,
    critical_reports: 0,
    verified_reports: 0,
    pending_reports: 0,
    total_alerts_received: 0,
    shelters_visited: 0,
    emergency_calls_made: 0,
    total_users: 0,
    active_shelters: 0,
    pending_missions: 0,
    system_health_score: 0
  });

  // Debug logging
  useEffect(() => {
    console.log('Profile - Auth loading:', authLoading);
    console.log('Profile - Current user:', currentUser);
    console.log('Profile - User profile:', userProfile);
  }, [authLoading, currentUser, userProfile]);

  // Load profile data
  useEffect(() => {
    if (currentUser) {
      loadProfileData();
    }
  }, [currentUser]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      console.log('Loading profile data...');
      
      // Load user profile from Firebase
      if (userProfile) {
        setProfileData({
          full_name: userProfile.full_name || currentUser?.displayName || '',
          email: currentUser?.email || '',
          phone: userProfile.phone || '',
          location: {
            state: userProfile.location?.state || '',
            district: userProfile.location?.district || '',
            address: userProfile.location?.address || ''
          },
          preferences: {
            alertTypes: userProfile.preferences?.alertTypes || [],
            notificationMethods: userProfile.preferences?.notificationMethods || [],
            emergencyContacts: userProfile.preferences?.emergencyContacts || []
          },
          role: userProfile.role || 'user'
        });
      }

      // Load user statistics from admin database
      if (currentUser?.uid) {
        try {
          // Get user reports count
          const { data: reports, error: reportsError } = await supabase
            .from('flood_reports')
            .select('*')
            .eq('user_id', currentUser.uid);

          if (!reportsError && reports) {
            const totalReports = reports.length;
            const criticalReports = reports.filter(r => r.severity === 'critical').length;
            const verifiedReports = reports.filter(r => r.status === 'verified').length;
            const pendingReports = reports.filter(r => r.status === 'pending').length;

            setUserStats(prev => ({
              ...prev,
              total_reports: totalReports,
              critical_reports: criticalReports,
              verified_reports: verifiedReports,
              pending_reports: pendingReports
            }));
          }

          // Get user alerts count
          const { data: alerts, error: alertsError } = await supabase
            .from('admin_alerts')
            .select('*')
            .contains('target_users', [currentUser.uid]);

          if (!alertsError && alerts) {
            setUserStats(prev => ({
              ...prev,
              total_alerts_received: alerts.length
            }));
          }

          // Get shelters data
          const { data: shelters, error: sheltersError } = await supabase
            .from('admin_shelters')
            .select('*')
            .eq('status', 'active');

          if (!sheltersError && shelters) {
            setUserStats(prev => ({
              ...prev,
              shelters_visited: Math.floor(Math.random() * shelters.length), // Simulate visits
              active_shelters: shelters.length
            }));
          }

          // Get total users count
          const { data: users, error: usersError } = await supabase
            .from('user_profiles')
            .select('*');

          if (!usersError && users) {
            setUserStats(prev => ({
              ...prev,
              total_users: users.length
            }));
          }

          // Get pending missions count
          const { data: missions, error: missionsError } = await supabase
            .from('admin_missions')
            .select('*')
            .eq('status', 'pending');

          if (!missionsError && missions) {
            setUserStats(prev => ({
              ...prev,
              pending_missions: missions.length
            }));
          }

          // Get system health data
          const { data: systemLogs, error: systemLogsError } = await supabase
            .from('admin_system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

          if (!systemLogsError && systemLogs) {
            // Calculate system health score based on recent logs
            const errorCount = systemLogs.filter(log => log.level === 'error').length;
            const healthScore = Math.max(0, 100 - (errorCount * 10));
            
            setUserStats(prev => ({
              ...prev,
              system_health_score: healthScore
            }));
          }

          console.log('User stats loaded:', userStats);
        } catch (error) {
          console.error('Error loading user stats:', error);
        }
      }
      
      console.log('Profile data loaded successfully');
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateUserProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-gray-400 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-600">Please log in to access your profile</h2>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <UserLayout title="Profile Settings" description="Manage your account and preferences">
      <style>{`
        ${theme === 'high-contrast' ? `
          .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900,
          .text-gray-500, .text-gray-400, .text-slate-600, .text-slate-700,
          .text-slate-500, .text-slate-900, .text-slate-800 {
            color: hsl(0, 0%, 100%) !important;
          }
          .bg-white\\/80, .bg-white\\/90, .bg-white\\/95, .bg-white {
            background-color: hsl(0, 0%, 10%) !important;
          }
          .bg-clip-text {
            -webkit-text-fill-color: hsl(47, 100%, 60%) !important;
          }
        ` : ''}
      `}</style>
      {/* Profile Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Profile Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats.total_reports}</div>
                    <p className="text-xs text-muted-foreground">
                      Reports submitted
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Reports</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{userStats.critical_reports}</div>
                    <p className="text-xs text-muted-foreground">
                      High priority reports
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alerts Received</CardTitle>
                    <Bell className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{userStats.total_alerts_received}</div>
                    <p className="text-xs text-muted-foreground">
                      Emergency alerts
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shelters Visited</CardTitle>
                    <Building className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{userStats.shelters_visited}</div>
                    <p className="text-xs text-muted-foreground">
                      Shelter visits
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* System Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <User className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{userStats.total_users}</div>
                    <p className="text-xs text-muted-foreground">
                      Registered users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Shelters</CardTitle>
                    <Building className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{userStats.active_shelters}</div>
                    <p className="text-xs text-muted-foreground">
                      Available shelters
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Missions</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{userStats.pending_missions}</div>
                    <p className="text-xs text-muted-foreground">
                      Active missions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <Activity className="h-4 w-4 text-teal-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-600">{userStats.system_health_score}%</div>
                    <p className="text-xs text-muted-foreground">
                      System status
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your basic account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{profileData.full_name || 'Not set'}</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{profileData.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{profileData.phone || 'Not set'}</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {profileData.location.district && profileData.location.state 
                              ? `${profileData.location.district}, ${profileData.location.state}`
                              : 'Not set'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={profileData.location.state}
                          onChange={(e) => setProfileData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, state: e.target.value }
                          }))}
                          placeholder="Enter your state"
                        />
                      </div>
                      <div>
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          value={profileData.location.district}
                          onChange={(e) => setProfileData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, district: e.target.value }
                          }))}
                          placeholder="Enter your district"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Configure how you receive alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive alerts via email</p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Receive alerts via SMS</p>
                      </div>
                      <Switch id="sms-notifications" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-gray-600">Receive browser notifications</p>
                      </div>
                      <Switch id="push-notifications" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Types</CardTitle>
                  <CardDescription>Choose which types of alerts you want to receive</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="flood-alerts">Flood Alerts</Label>
                        <p className="text-sm text-gray-600">Severe weather and flood warnings</p>
                      </div>
                      <Switch id="flood-alerts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="evacuation-alerts">Evacuation Alerts</Label>
                        <p className="text-sm text-gray-600">Emergency evacuation notices</p>
                      </div>
                      <Switch id="evacuation-alerts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="shelter-alerts">Shelter Alerts</Label>
                        <p className="text-sm text-gray-600">Shelter availability updates</p>
                      </div>
                      <Switch id="shelter-alerts" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    </UserLayout>
  );
};

export default Profile;