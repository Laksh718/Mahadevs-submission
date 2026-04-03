import React, { useState, useEffect } from "react";
import NGOLayout from "@/components/NGOLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  Plus, 
  Eye, 
  Edit, 
  Clock, 
  MapPin, 
  Users,
  RefreshCw,
  Heart,
  HandHeart,
  Activity,
  CheckCircle
} from "lucide-react";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { toast } from "sonner";
import { 
  getAdminAlerts, 
  createAlert, 
  updateAlertStatus,
  deleteAlert,
  subscribeToAlerts,
  AdminAlert 
} from '@/lib/adminSupabase';

const NGOAlerts = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { user } = useRoleAwareAuth();

  // Load initial data
  useEffect(() => {
    loadAlerts();
  }, []);

  // Real-time alert updates
  useEffect(() => {
    if (!isLive) return;

    const subscription = subscribeToAlerts((payload) => {
      console.log('Alert update received:', payload);
      
      if (payload.eventType === 'UPDATE' && payload.new) {
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === payload.new.id ? { ...alert, ...payload.new } : alert
          )
        );
      } else if (payload.eventType === 'INSERT' && payload.new) {
        setAlerts(prevAlerts => [payload.new, ...prevAlerts]);
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== payload.old.id));
      }
      
      setLastUpdate(new Date());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLive]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      console.log('Loading alerts from Supabase...');
      const alertData = await getAdminAlerts();
      console.log('Loaded alerts:', alertData);
      setAlerts(alertData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading alerts:", error);
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NGOLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NGO Active Alerts</h1>
            <p className="text-gray-600 mt-1">Coordinate relief efforts for active emergencies</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadAlerts} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Heart className="w-4 h-4 mr-2" />
              Create Response
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Active Alerts</p>
                  <p className="text-3xl font-bold text-purple-800">{alerts.filter(a => a.status === "active").length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600">Response Teams</p>
                  <p className="text-3xl font-bold text-pink-800">12</p>
                </div>
                <Users className="w-8 h-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600">People Helped</p>
                  <p className="text-3xl font-bold text-teal-800">2,450</p>
                </div>
                <HandHeart className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <p className="text-3xl font-bold text-green-800">{alerts.filter(a => a.status === "resolved").length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Alerts Display */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading alerts...</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">NGO Alert Management</h3>
                <p className="text-gray-600">Monitor and respond to emergency situations in your area of operation.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </NGOLayout>
  );
};

export default NGOAlerts;