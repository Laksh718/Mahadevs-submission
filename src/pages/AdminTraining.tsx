import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Calendar,
  Users,
  MapPin,
  BookOpen,
  Award,
  TrendingUp,
  Plus,
  Filter,
  Download,
  BarChart3,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getTrainingDashboardStats,
  getTrainingSessions,
  getTrainingCoverage,
  TrainingDashboardStats,
  TrainingSession,
} from "@/lib/trainingService";
import TrainingDataEntry from "@/components/TrainingDataEntry";
import TrainingReports from "@/components/TrainingReports";
import TrainingSystemStatus from "@/components/TrainingSystemStatus";
import TrainingCoverageMap from "@/components/TrainingCoverageMap";
import TrainingAnalyticsCharts from "@/components/TrainingAnalyticsCharts";
import TrainingHeatSignatures from "@/components/TrainingHeatSignatures";
import TrainingReportsDashboard from "@/components/TrainingReportsDashboard";

const AdminTraining = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sessions");
  const [dashboardStats, setDashboardStats] = useState<TrainingDashboardStats>({
    total_sessions: 0,
    total_participants: 0,
    states_covered: 0,
    completion_rate: 0,
    ongoing_sessions: 0,
    planned_sessions: 0,
  });
  const [recentSessions, setRecentSessions] = useState<TrainingSession[]>([]);
  const [coverageData, setCoverageData] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load dashboard statistics
      const stats = await getTrainingDashboardStats();
      setDashboardStats(stats);

      // Load recent training sessions
      const sessions = await getTrainingSessions({
        state: selectedState !== "all" ? selectedState : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });
      setRecentSessions(sessions?.slice(0, 10) || []);

      // Load coverage data
      const coverage = await getTrainingCoverage();
      setCoverageData(coverage || []);

      toast.success("Training data loaded successfully");
    } catch (error) {
      console.error("Error loading training data:", error);
      toast.error("Failed to load training data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "ONGOING":
        return "bg-blue-500";
      case "PLANNED":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return "text-red-600";
    if (priority >= 70) return "text-orange-600";
    if (priority >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              NDMA Training Management
            </h1>
            <p className="text-gray-600">
              Capacity Building & Training Division Dashboard
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={loadDashboardData}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button onClick={() => setActiveTab("entry")}>
              <Plus className="w-4 h-4 mr-2" />
              New Training
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.total_sessions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Users className="w-4 h-4 mr-2 text-green-600" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.total_participants.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total trained</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                States Covered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.states_covered}/28
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((dashboardStats.states_covered / 28) * 100)}%
                coverage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Award className="w-4 h-4 mr-2 text-yellow-600" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.completion_rate}%
              </div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Clock className="w-4 h-4 mr-2 text-orange-600" />
                Ongoing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.ongoing_sessions}
              </div>
              <p className="text-xs text-muted-foreground">Active sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                Planned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.planned_sessions}
              </div>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="sessions">Training Sessions</TabsTrigger>
              <TabsTrigger value="coverage">Coverage Maps</TabsTrigger>
              <TabsTrigger value="analytics">Analytics Charts</TabsTrigger>
              <TabsTrigger value="heat">Heat Signatures</TabsTrigger>
              <TabsTrigger value="reports">Reports Dashboard</TabsTrigger>
              <TabsTrigger value="entry">Data Entry</TabsTrigger>
              <TabsTrigger value="status">System Status</TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Kerala">Kerala</SelectItem>
                  <SelectItem value="West Bengal">West Bengal</SelectItem>
                  <SelectItem value="Punjab">Punjab</SelectItem>
                  <SelectItem value="Telangana">Telangana</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>

          {/* Training Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Training Sessions
                  <Badge variant="outline">
                    {recentSessions.length} sessions
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Latest training activities across all partners and states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.length > 0 ? (
                    recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-semibold">{session.title}</h4>
                              <p className="text-sm text-gray-600">
                                {session.venue} • {session.district},{" "}
                                {session.state}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(session.start_date)} -{" "}
                                {formatDate(session.end_date)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-semibold">
                              {session.actual_participants ||
                                session.expected_participants ||
                                0}
                            </div>
                            <div className="text-xs text-gray-500">
                              Participants
                            </div>
                          </div>

                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No training sessions found. Create your first training
                      session to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coverage Maps Tab */}
          <TabsContent value="coverage" className="space-y-4">
            <TrainingCoverageMap />
          </TabsContent>

          {/* Analytics Charts Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <TrainingAnalyticsCharts />
          </TabsContent>

          {/* Heat Signatures Tab */}
          <TabsContent value="heat" className="space-y-4">
            <TrainingHeatSignatures />
          </TabsContent>

          {/* Data Entry Tab */}
          <TabsContent value="entry" className="space-y-4">
            <TrainingDataEntry onSuccess={loadDashboardData} />
          </TabsContent>

          {/* Reports Dashboard Tab */}
          <TabsContent value="reports" className="space-y-4">
            <TrainingReportsDashboard />
          </TabsContent>

          {/* System Status Tab */}
          <TabsContent value="status" className="space-y-4">
            <TrainingSystemStatus />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminTraining;
