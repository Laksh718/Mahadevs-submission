import React, { useState, useEffect } from "react";
import NDMALayout from "@/components/NDMALayout";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { UserRole } from "@/lib/roleBasedAuth";
import { supabase } from "@/lib/supabase";
import {
  Users,
  MapPin,
  AlertTriangle,
  Activity,
  Building2,
  GraduationCap,
  BarChart3,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NDMAMetrics {
  totalTrainingSessions: number;
  activePartners: number;
  trainedPersonnel: number;
  coverageStates: number;
  recentSessions: Array<{
    id: string;
    title: string;
    state: string;
    district: string;
    start_date: string;
    status: string;
    actual_participants: number;
  }>;
  partnerTypes: Array<{
    type: string;
    count: number;
  }>;
  stateWiseCoverage: Array<{
    state: string;
    sessions: number;
    participants: number;
  }>;
}

const NDMADashboard: React.FC = () => {
  const { userProfile } = useRoleAwareAuth();
  const [metrics, setMetrics] = useState<NDMAMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNDMAMetrics();
  }, []);

  const fetchNDMAMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch training sessions data
      const { data: sessions, error: sessionsError } = await supabase
        .from("training_sessions")
        .select(
          `
          id,
          title,
          state,
          district,
          start_date,
          status,
          actual_participants,
          expected_participants
        `
        )
        .order("start_date", { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch training partners data
      const { data: partners, error: partnersError } = await supabase
        .from("training_partners")
        .select("id, type, is_active")
        .eq("is_active", true);

      if (partnersError) throw partnersError;

      // Process metrics
      const totalTrainingSessions = sessions?.length || 0;
      const activePartners = partners?.length || 0;

      const trainedPersonnel =
        sessions?.reduce(
          (sum, session) => sum + (session.actual_participants || 0),
          0
        ) || 0;

      const uniqueStates = new Set(
        sessions?.map((s) => s.state).filter(Boolean)
      );
      const coverageStates = uniqueStates.size;

      // Recent sessions (last 10)
      const recentSessions = sessions?.slice(0, 10) || [];

      // Partner types breakdown
      const partnerTypeCounts =
        partners?.reduce((acc, partner) => {
          acc[partner.type] = (acc[partner.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      const partnerTypes = Object.entries(partnerTypeCounts).map(
        ([type, count]) => ({
          type,
          count,
        })
      );

      // State-wise coverage
      const stateMetrics =
        sessions?.reduce((acc, session) => {
          if (!session.state) return acc;

          if (!acc[session.state]) {
            acc[session.state] = { sessions: 0, participants: 0 };
          }

          acc[session.state].sessions++;
          acc[session.state].participants += session.actual_participants || 0;

          return acc;
        }, {} as Record<string, { sessions: number; participants: number }>) ||
        {};

      const stateWiseCoverage = Object.entries(stateMetrics)
        .map(([state, data]) => ({
          state,
          sessions: data.sessions,
          participants: data.participants,
        }))
        .sort((a, b) => b.sessions - a.sessions);

      setMetrics({
        totalTrainingSessions,
        activePartners,
        trainedPersonnel,
        coverageStates,
        recentSessions,
        partnerTypes,
        stateWiseCoverage,
      });
    } catch (error) {
      console.error("Error fetching NDMA metrics:", error);
      setError(
        "Failed to load dashboard data. Please check database connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <NDMALayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
        </div>
      </NDMALayout>
    );
  }

  if (error) {
    return (
      <NDMALayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Dashboard Error
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchNDMAMetrics} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </NDMALayout>
    );
  }

  return (
    <NDMALayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              NDMA National Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {userProfile?.name}</p>
            <p className="text-sm text-gray-500">
              Role: {userProfile?.role} • Organization:{" "}
              {userProfile?.organization}
            </p>
          </div>
          <Button
            onClick={fetchNDMAMetrics}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Training Sessions
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalTrainingSessions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time sessions conducted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Partners
              </CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.activePartners.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Training partner organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Trained Personnel
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.trainedPersonnel.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total participants trained
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                State Coverage
              </CardTitle>
              <MapPin className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.coverageStates}
              </div>
              <p className="text-xs text-muted-foreground">
                States with training programs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="coverage">State Coverage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Partner Distribution</CardTitle>
                  <CardDescription>
                    Training partners by organization type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics?.partnerTypes.map((partner, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {partner.type}
                        </span>
                        <Badge variant="secondary">{partner.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Impact</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          Avg. Participants per Session
                        </span>
                      </div>
                      <span className="font-bold">
                        {metrics?.totalTrainingSessions
                          ? Math.round(
                              (metrics?.trainedPersonnel || 0) /
                                metrics.totalTrainingSessions
                            )
                          : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Geographic Reach</span>
                      </div>
                      <span className="font-bold">
                        {metrics?.coverageStates} States
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Active Partners</span>
                      </div>
                      <span className="font-bold">
                        {metrics?.activePartners} Organizations
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Training Sessions</CardTitle>
                <CardDescription>
                  Latest training activities across the country
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium">{session.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.district}, {session.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(session.start_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {session.actual_participants || 0} participants
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Partner Analytics</CardTitle>
                <CardDescription>
                  Organization breakdown and collaboration metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {metrics?.partnerTypes.map((partner, index) => (
                    <div
                      key={index}
                      className="text-center p-4 border rounded-lg"
                    >
                      <div className="text-2xl font-bold text-blue-600">
                        {partner.count}
                      </div>
                      <div className="text-sm font-medium">{partner.type}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>State-wise Training Coverage</CardTitle>
                <CardDescription>
                  Training sessions and participant distribution by state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.stateWiseCoverage.map((state, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{state.state}</h4>
                        <p className="text-sm text-gray-600">
                          {state.sessions} training sessions
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {state.participants.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          participants
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </NDMALayout>
  );
};

export default NDMADashboard;
