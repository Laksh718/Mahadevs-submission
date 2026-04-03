import React, { useState, useEffect } from "react";
import UserLayout from "@/components/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, MapPin, Users, Award, Clock, RefreshCw, Eye } from "lucide-react";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { toast } from "sonner";
import { 
  getAdminAlerts,
  AdminAlert 
} from '@/lib/adminSupabase';

const VolunteerActivities = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useRoleAwareAuth();

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Load recent alerts as activities for volunteers
      const alertData = await getAdminAlerts();
      setAlerts(alertData.slice(0, 5)); // Show recent 5 alerts
    } catch (error) {
      console.error("Error loading activities:", error);
      toast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  // Mock volunteer stats - in real app, this would come from user profile
  const volunteerStats = {
    activitiesJoined: 12,
    hoursContributed: 48,
    peopleHelped: 156,
    certificationsEarned: 3
  };

  return (
    <UserLayout title="My Volunteer Activities">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Activities</h1>
            <p className="text-gray-600 mt-1">Track your volunteer contributions and upcoming activities</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadActivities} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Activity className="w-4 h-4 mr-2" />
              Join Activity
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Activities Joined</p>
                  <p className="text-3xl font-bold text-green-800">{volunteerStats.activitiesJoined}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Hours Contributed</p>
                  <p className="text-3xl font-bold text-blue-800">{volunteerStats.hoursContributed}</p>
                  <p className="text-3xl font-bold text-blue-800">{volunteerStats.peopleHelped}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">People Helped</p>
                  <p className="text-3xl font-bold text-purple-800">340</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Badges Earned</p>
                  <p className="text-3xl font-bold text-yellow-800">{volunteerStats.certificationsEarned}</p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Flood Relief Distribution", location: "District Center", date: "Dec 10, 2024", status: "Completed" },
                { title: "Community Training Workshop", location: "Community Hall", date: "Dec 8, 2024", status: "Completed" },
                { title: "Emergency Shelter Setup", location: "School Ground", date: "Dec 5, 2024", status: "Completed" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {activity.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {activity.date}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default VolunteerActivities;