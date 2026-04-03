import React, { useState, useEffect } from "react";
import UserLayout from "@/components/UserLayout";
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
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  MapPin,
  Clock,
  Activity,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCommunityReports, getAllReports, supabase } from "@/lib/supabase";

interface AnalyticsData {
  totalReports: number;
  myReports: number;
  communityReports: number;
  criticalReports: number;
  verifiedReports: number;
  pendingReports: number;
  reportsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  reportsByStatus: {
    verified: number;
    pending: number;
    resolved: number;
  };
  reportsByTimeRange: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  engagementStats: {
    totalViews: number;
    totalUpvotes: number;
    totalDownvotes: number;
    totalComments: number;
  };
  locationStats: {
    reportsWithLocation: number;
    uniqueLocations: number;
  };
}

const Analytics = () => {
  const { currentUser, userProfile } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<string>("30d");

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log("Loading analytics data...");

      // Get all reports
      const allReports = await getAllReports();
      console.log("All reports:", allReports.length);

      // Get community reports (filtered by user location)
      const communityReports = await getCommunityReports(
        userProfile?.location?.state || "",
        userProfile?.location?.district || ""
      );
      console.log("Community reports:", communityReports.length);

      // Filter user's own reports
      const myReports = allReports.filter(
        (report) => report.user_id === currentUser?.uid
      );

      // Calculate analytics
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const reportsBySeverity = {
        critical: allReports.filter((r) => r.severity === "critical").length,
        high: allReports.filter((r) => r.severity === "high").length,
        medium: allReports.filter((r) => r.severity === "medium").length,
        low: allReports.filter((r) => r.severity === "low").length,
      };

      const reportsByStatus = {
        verified: allReports.filter((r) => r.status === "verified").length,
        pending: allReports.filter((r) => r.status === "pending").length,
        resolved: allReports.filter((r) => r.status === "resolved").length,
      };

      const reportsByTimeRange = {
        last24h: allReports.filter((r) => new Date(r.created_at) >= last24h)
          .length,
        last7d: allReports.filter((r) => new Date(r.created_at) >= last7d)
          .length,
        last30d: allReports.filter((r) => new Date(r.created_at) >= last30d)
          .length,
      };

      // Calculate engagement stats (using default values for now)
      const engagementStats = {
        totalViews: allReports.reduce((sum, r) => sum + (r.views || 0), 0),
        totalUpvotes: allReports.reduce((sum, r) => sum + (r.upvotes || 0), 0),
        totalDownvotes: allReports.reduce(
          (sum, r) => sum + (r.downvotes || 0),
          0
        ),
        totalComments: allReports.reduce(
          (sum, r) => sum + (r.comments || 0),
          0
        ),
      };

      // Location stats
      const reportsWithLocation = allReports.filter(
        (r) => r.location?.lat && r.location?.lng
      );
      const uniqueLocations = new Set(
        reportsWithLocation.map((r) => `${r.location?.lat},${r.location?.lng}`)
      ).size;

      const data: AnalyticsData = {
        totalReports: allReports.length,
        myReports: myReports.length,
        communityReports: communityReports.length,
        criticalReports: reportsBySeverity.critical,
        verifiedReports: reportsByStatus.verified,
        pendingReports: reportsByStatus.pending,
        reportsBySeverity,
        reportsByStatus,
        reportsByTimeRange,
        engagementStats,
        locationStats: {
          reportsWithLocation: reportsWithLocation.length,
          uniqueLocations,
        },
      };

      setAnalyticsData(data);
      setLastUpdated(new Date());
      console.log("Analytics data loaded:", data);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [currentUser, userProfile, timeRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalyticsData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "resolved":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading && !analyticsData) {
    return (
      <UserLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Real-time insights into flood reports and community engagement
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              onClick={loadAnalyticsData}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reports
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(analyticsData?.totalReports || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all regions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Reports</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData?.myReports || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Reports I've submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Critical Reports
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analyticsData?.criticalReports || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Verified Reports
              </CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analyticsData?.verifiedReports || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Confirmed by authorities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reports by Severity */}
              <Card>
                <CardHeader>
                  <CardTitle>Reports by Severity</CardTitle>
                  <CardDescription>
                    Distribution of flood reports by severity level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData?.reportsBySeverity || {}).map(
                      ([severity, count]) => (
                        <div
                          key={severity}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${getSeverityColor(
                                severity
                              )}`}
                            />
                            <span className="capitalize font-medium">
                              {severity}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">{count}</span>
                            <span className="text-sm text-gray-500">
                              (
                              {(
                                (count / (analyticsData?.totalReports || 1)) *
                                100
                              ).toFixed(1)}
                              %)
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reports by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Reports by Status</CardTitle>
                  <CardDescription>
                    Current status of flood reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData?.reportsByStatus || {}).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${getStatusColor(
                                status
                              )}`}
                            />
                            <span className="capitalize font-medium">
                              {status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">{count}</span>
                            <span className="text-sm text-gray-500">
                              (
                              {(
                                (count / (analyticsData?.totalReports || 1)) *
                                100
                              ).toFixed(1)}
                              %)
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Time Range Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Reports by Time Range</CardTitle>
                <CardDescription>
                  Flood reports submitted in different time periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analyticsData?.reportsByTimeRange.last24h || 0}
                    </div>
                    <div className="text-sm text-gray-600">Last 24 Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analyticsData?.reportsByTimeRange.last7d || 0}
                    </div>
                    <div className="text-sm text-gray-600">Last 7 Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analyticsData?.reportsByTimeRange.last30d || 0}
                    </div>
                    <div className="text-sm text-gray-600">Last 30 Days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Statistics</CardTitle>
                  <CardDescription>
                    Detailed breakdown of flood reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Reports</span>
                    <Badge variant="outline">
                      {analyticsData?.totalReports || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>My Reports</span>
                    <Badge variant="outline">
                      {analyticsData?.myReports || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Community Reports</span>
                    <Badge variant="outline">
                      {analyticsData?.communityReports || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Verification</span>
                    <Badge variant="outline">
                      {analyticsData?.pendingReports || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Quality</CardTitle>
                  <CardDescription>
                    Quality metrics for submitted reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Verification Rate</span>
                    <Badge variant="outline">
                      {analyticsData?.totalReports
                        ? (
                            (analyticsData.verifiedReports /
                              analyticsData.totalReports) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Critical Rate</span>
                    <Badge variant="outline">
                      {analyticsData?.totalReports
                        ? (
                            (analyticsData.criticalReports /
                              analyticsData.totalReports) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Reports with Location</span>
                    <Badge variant="outline">
                      {analyticsData?.locationStats.reportsWithLocation || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Engagement</CardTitle>
                  <CardDescription>
                    How the community interacts with reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span>Total Views</span>
                    </div>
                    <Badge variant="outline">
                      {formatNumber(
                        analyticsData?.engagementStats.totalViews || 0
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                      <span>Total Upvotes</span>
                    </div>
                    <Badge variant="outline">
                      {formatNumber(
                        analyticsData?.engagementStats.totalUpvotes || 0
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                      <span>Total Downvotes</span>
                    </div>
                    <Badge variant="outline">
                      {formatNumber(
                        analyticsData?.engagementStats.totalDownvotes || 0
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-purple-500" />
                      <span>Total Comments</span>
                    </div>
                    <Badge variant="outline">
                      {formatNumber(
                        analyticsData?.engagementStats.totalComments || 0
                      )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Calculated engagement rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Views per Report</span>
                    <Badge variant="outline">
                      {analyticsData?.totalReports
                        ? Math.round(
                            (analyticsData.engagementStats.totalViews || 0) /
                              analyticsData.totalReports
                          )
                        : 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Upvote Rate</span>
                    <Badge variant="outline">
                      {analyticsData?.engagementStats.totalUpvotes &&
                      analyticsData?.engagementStats.totalDownvotes
                        ? (
                            (analyticsData.engagementStats.totalUpvotes /
                              (analyticsData.engagementStats.totalUpvotes +
                                analyticsData.engagementStats.totalDownvotes)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Comment Rate</span>
                    <Badge variant="outline">
                      {analyticsData?.totalReports
                        ? (
                            (analyticsData.engagementStats.totalComments || 0) /
                            analyticsData.totalReports
                          ).toFixed(1)
                        : 0}{" "}
                      per report
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location Coverage</CardTitle>
                  <CardDescription>
                    Geographic distribution of reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>Reports with Location</span>
                    </div>
                    <Badge variant="outline">
                      {analyticsData?.locationStats.reportsWithLocation || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>Unique Locations</span>
                    </div>
                    <Badge variant="outline">
                      {analyticsData?.locationStats.uniqueLocations || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Location Coverage Rate</span>
                    <Badge variant="outline">
                      {analyticsData?.totalReports
                        ? (
                            (analyticsData.locationStats.reportsWithLocation /
                              analyticsData.totalReports) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Insights</CardTitle>
                  <CardDescription>
                    Your region's contribution to flood reporting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Your Region Reports</span>
                    <Badge variant="outline">
                      {analyticsData?.communityReports || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Regional Share</span>
                    <Badge variant="outline">
                      {analyticsData?.totalReports
                        ? (
                            (analyticsData.communityReports /
                              analyticsData.totalReports) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Your Contribution</span>
                    <Badge variant="outline">
                      {analyticsData?.communityReports
                        ? (
                            (analyticsData.myReports /
                              analyticsData.communityReports) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
};

export default Analytics;

