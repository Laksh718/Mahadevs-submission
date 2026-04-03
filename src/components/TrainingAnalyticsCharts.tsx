import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Download,
  Calendar,
  Users,
  MapPin,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Treemap,
} from "recharts";
import {
  getTrainingAnalytics,
  getCoverageAnalytics,
  getParticipantDemographics,
  getPerformanceMetrics,
} from "@/lib/trainingService";

interface ChartData {
  name: string;
  value: number;
  sessions?: number;
  participants?: number;
  coverage?: number;
  completion?: number;
  budget?: number;
  fill?: string;
  [key: string]: any; // Index signature for compatibility
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

const TrainingAnalyticsCharts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");
  const [chartType, setChartType] = useState("overview");

  // Chart data states
  const [stateWiseData, setStateWiseData] = useState<ChartData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<ChartData[]>([]);
  const [themeDistribution, setThemeDistribution] = useState<ChartData[]>([]);
  const [audienceData, setAudienceData] = useState<ChartData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<ChartData[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<ChartData[]>([]);
  const [completionTrends, setCompletionTrends] = useState<ChartData[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<ChartData[]>([]);

  useEffect(() => {
    loadChartData();
  }, [timeRange]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const [analytics, coverage, demographics, performance] =
        await Promise.all([
          getTrainingAnalytics(),
          getCoverageAnalytics(),
          getParticipantDemographics(),
          getPerformanceMetrics(),
        ]);

      // State-wise training data
      const stateData = coverage.statesCovered.map((state, index) => ({
        name: state.state,
        sessions: state.sessionCount,
        participants: state.participantCount,
        coverage: Math.random() * 100, // Replace with actual coverage calculation
        completion: Math.random() * 100,
        value: state.sessionCount,
        fill: COLORS[index % COLORS.length],
      }));
      setStateWiseData(stateData);

      // Generate time series data (mock data - replace with real historical data)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const timeData = months.map((month) => ({
        name: month,
        sessions: Math.floor(Math.random() * 50) + 10,
        participants: Math.floor(Math.random() * 500) + 100,
        completion: Math.floor(Math.random() * 30) + 70,
        budget: Math.floor(Math.random() * 100000) + 50000,
        value: Math.floor(Math.random() * 50) + 10,
      }));
      setTimeSeriesData(timeData);

      // Theme distribution
      const themes = demographics.byTheme.map((theme, index) => ({
        name: theme.theme,
        value: theme.count,
        fill: COLORS[index % COLORS.length],
      }));
      setThemeDistribution(themes);

      // Audience distribution
      const audiences = demographics.byAudience.map((audience, index) => ({
        name: audience.audience,
        value: audience.count,
        fill: COLORS[index % COLORS.length],
      }));
      setAudienceData(audiences);

      // Performance metrics radar chart
      const perfData = [
        {
          name: "Performance",
          value:
            (performance.completedSessions / performance.totalSessions) * 100,
          completion:
            (performance.completedSessions / performance.totalSessions) * 100,
          budget: performance.budgetUtilization,
          capacity: performance.capacityUtilization,
          diversity: performance.partnerDiversity * 10,
          effectiveness: Math.random() * 100,
          reach: Math.random() * 100,
        },
      ];
      setPerformanceMetrics(perfData);

      // Budget analysis
      const budgetData = stateData.map((state) => ({
        name: state.name,
        allocated: Math.random() * 500000 + 100000,
        spent: Math.random() * 400000 + 80000,
        efficiency: Math.random() * 100,
        value: Math.random() * 500000 + 100000,
      }));
      setBudgetAnalysis(budgetData);

      // Completion trends
      setCompletionTrends(
        timeData.map((item) => ({
          ...item,
          target: 85,
          actual: item.completion,
        }))
      );

      // Risk assessment data
      const riskLevels = ["Low", "Medium", "High", "Critical"];
      const riskData = riskLevels.map((level, index) => ({
        name: level,
        value: Math.floor(Math.random() * 20) + 5,
        fill: ["#22c55e", "#f59e0b", "#f97316", "#ef4444"][index],
      }));
      setRiskAssessment(riskData);
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportChartData = (chartName: string, data: any[]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(data[0] || {}).join(",") +
      "\n" +
      data.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${chartName}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Training Analytics Dashboard
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">JanRakshak</div>
              <div className="text-xs text-gray-500">
                Disaster Management Training System
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Time Range:</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="2years">2 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Chart Type:</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="trends">Trends</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => exportChartData("analytics", stateWiseData)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts Tabs */}
      <Tabs defaultValue="geographic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        {/* Geographic Analysis */}
        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* State-wise Training Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    State-wise Training Sessions
                  </div>
                  <Badge variant="outline">
                    {stateWiseData.reduce(
                      (sum, item) => sum + (item.sessions || 0),
                      0
                    )}{" "}
                    total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stateWiseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="sessions" fill="#0088FE" name="Sessions" />
                    <Bar
                      dataKey="participants"
                      fill="#00C49F"
                      name="Participants"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* State-wise Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Training Coverage by State
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stateWiseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="coverage"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Coverage %"
                    />
                    <Area
                      type="monotone"
                      dataKey="completion"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Completion %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Analysis */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Training Effectiveness Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="completion"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Budget Utilization"
                      dataKey="budget"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Completion vs Target */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Completion Rate vs Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={completionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="actual" fill="#0088FE" name="Actual %" />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#ff7300"
                      name="Target %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Analysis */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Training Trends Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Training Activity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sessions"
                      stroke="#0088FE"
                      strokeWidth={3}
                      name="Sessions"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="participants"
                      stroke="#00C49F"
                      strokeWidth={3}
                      name="Participants"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="completion"
                      stroke="#FFBB28"
                      strokeWidth={3}
                      name="Completion %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Analysis */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Training Themes Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-4 h-4 mr-2" />
                  Training Themes Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={themeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${((percent as number) * 100).toFixed(0)}%`
                      }
                    >
                      {themeDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Target Audience Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Target Audience Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <Treemap
                    data={audienceData}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                  />
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget Analysis */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation vs Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={budgetAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="allocated"
                    fill="#0088FE"
                    name="Allocated ₹"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="spent"
                    fill="#00C49F"
                    name="Spent ₹"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#ff7300"
                    name="Efficiency %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={riskAssessment}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {riskAssessment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Mitigation Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="completion"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Risk Reduction %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingAnalyticsCharts;
