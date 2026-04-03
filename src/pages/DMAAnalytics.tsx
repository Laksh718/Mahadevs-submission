import React, { useState, useEffect } from "react";
import NDMALayout from "@/components/NDMALayout";
import { EnhancedTrainingGISMap } from "@/components/EnhancedTrainingGISMap";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  AlertTriangle,
  Activity,
  Clock,
  Target,
  Globe,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  PieChart,
  LineChart,
  AreaChart,
  Zap,
  Shield,
  MapPin,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
  Route,
  Navigation,
  Droplets,
  UserCheck,
  UserX,
  Building,
  Map,
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
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

// Sample data for DMA analytics
const dmaMetricsData = [
  { name: "Jan", reports: 45, resolved: 38, response_time: 12 },
  { name: "Feb", reports: 52, resolved: 47, response_time: 10 },
  { name: "Mar", reports: 38, resolved: 35, response_time: 8 },
  { name: "Apr", reports: 67, resolved: 59, response_time: 11 },
  { name: "May", reports: 78, resolved: 71, response_time: 9 },
  { name: "Jun", reports: 89, resolved: 82, response_time: 7 },
];

const districtData = [
  { name: "North District", value: 35, color: "#3b82f6" },
  { name: "South District", value: 28, color: "#10b981" },
  { name: "East District", value: 22, color: "#f59e0b" },
  { name: "West District", value: 15, color: "#ef4444" },
];

const responseTimeData = [
  { name: "Emergency", avg_time: 8, target: 10 },
  { name: "High Priority", avg_time: 15, target: 20 },
  { name: "Medium Priority", avg_time: 45, target: 60 },
  { name: "Low Priority", avg_time: 120, target: 180 },
];

const DMAAnalytics = () => {
  const { user } = useSupabaseAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("last_30_days");
  const [selectedMetric, setSelectedMetric] = useState("response_efficiency");

  const [analyticsData, setAnalyticsData] = useState({
    totalReports: 456,
    resolvedReports: 398,
    averageResponseTime: 9.2,
    activeShelters: 24,
    trainedVolunteers: 156,
    districtsCovered: 8,
    emergencyAlerts: 12,
    resourcesDeployed: 89,
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call for DMA-specific analytics
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation, this would fetch data from Supabase
      // filtered by DMA district/state jurisdiction

      setAnalyticsData({
        totalReports: Math.floor(Math.random() * 500) + 400,
        resolvedReports: Math.floor(Math.random() * 400) + 350,
        averageResponseTime: Math.random() * 5 + 7,
        activeShelters: Math.floor(Math.random() * 10) + 20,
        trainedVolunteers: Math.floor(Math.random() * 50) + 120,
        districtsCovered: 8,
        emergencyAlerts: Math.floor(Math.random() * 15) + 5,
        resourcesDeployed: Math.floor(Math.random() * 30) + 70,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadAnalyticsData();
  };

  const resolutionRate = Math.round(
    (analyticsData.resolvedReports / analyticsData.totalReports) * 100
  );

  return (
    <NDMALayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-orange-600" />
              DMA Response Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive analysis of disaster management operations and
              response metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={refreshData} disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData.totalReports}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resolution Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {resolutionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +5% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.averageResponseTime.toFixed(1)}m
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  -2m from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Resources
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.resourcesDeployed}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +8 from last month
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="geography">Geographic</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Performance Analytics */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Response Metrics</CardTitle>
                  <CardDescription>
                    Reports handled and resolution efficiency over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={dmaMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="reports"
                          stroke="#f97316"
                          strokeWidth={2}
                          name="Total Reports"
                        />
                        <Line
                          type="monotone"
                          dataKey="resolved"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Resolved"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>District-wise Response Distribution</CardTitle>
                  <CardDescription>
                    Response coverage across operational districts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={districtData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {districtData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geographic Analytics */}
          <TabsContent value="geography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>GIS Response Mapping</CardTitle>
                <CardDescription>
                  Geographic distribution of emergency responses and resource
                  deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <EnhancedTrainingGISMap />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Analytics */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time by Priority</CardTitle>
                  <CardDescription>
                    Average response times vs targets by priority level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={responseTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="avg_time"
                          fill="#f97316"
                          name="Actual Time (min)"
                        />
                        <Bar
                          dataKey="target"
                          fill="#94a3b8"
                          name="Target Time (min)"
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Deployment Status</CardTitle>
                  <CardDescription>
                    Current status of deployed emergency resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Emergency Shelters
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: "80%" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">24/30</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rescue Teams</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: "95%" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">19/20</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Medical Units</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: "60%" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">12/20</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Communication Systems
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">18/20</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Analytics */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Efficiency Trends</CardTitle>
                <CardDescription>
                  Long-term trends in disaster response efficiency and resource
                  optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsAreaChart data={dmaMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="response_time"
                        stroke="#f97316"
                        fill="#fed7aa"
                        name="Response Time (min)"
                      />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </NDMALayout>
  );
};

export default DMAAnalytics;
