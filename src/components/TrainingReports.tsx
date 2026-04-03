import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Target,
  DollarSign,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getTrainingAnalytics,
  getCoverageAnalytics,
  getParticipantDemographics,
  getPerformanceMetrics,
  TrainingAnalytics,
  CoverageAnalytics,
  ParticipantDemographics,
  PerformanceMetrics,
} from "@/lib/trainingService";

interface TrainingReportsProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const TrainingReports: React.FC<TrainingReportsProps> = ({ dateRange }) => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<TrainingAnalytics | null>(null);
  const [coverage, setCoverage] = useState<CoverageAnalytics | null>(null);
  const [demographics, setDemographics] =
    useState<ParticipantDemographics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(
    null
  );

  const [filters, setFilters] = useState({
    startDate: dateRange?.startDate || "",
    endDate: dateRange?.endDate || "",
    state: "",
    partnerType: "",
    reportType: "overview",
  });

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [analyticsData, coverageData, demographicsData, performanceData] =
        await Promise.all([
          getTrainingAnalytics(filters.startDate, filters.endDate),
          getCoverageAnalytics(),
          getParticipantDemographics(filters.startDate, filters.endDate),
          getPerformanceMetrics(filters.startDate, filters.endDate),
        ]);

      setAnalytics(analyticsData);
      setCoverage(coverageData);
      setDemographics(demographicsData);
      setPerformance(performanceData);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const exportReport = (format: "pdf" | "excel") => {
    // TODO: Implement report export functionality
    console.log(`Exporting report as ${format}`);
  };

  const getCompletionRate = (completed: number, total: number): string => {
    if (total === 0) return "0%";
    return `${Math.round((completed / total) * 100)}%`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>State</Label>
              <Select
                value={filters.state}
                onValueChange={(value) => handleFilterChange("state", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All States</SelectItem>
                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Kerala">Kerala</SelectItem>
                  <SelectItem value="West Bengal">West Bengal</SelectItem>
                  <SelectItem value="Punjab">Punjab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Partner Type</Label>
              <Select
                value={filters.partnerType}
                onValueChange={(value) =>
                  handleFilterChange("partnerType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All partners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Partners</SelectItem>
                  <SelectItem value="GOVERNMENT">Government</SelectItem>
                  <SelectItem value="NGO">NGO</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select
                value={filters.reportType}
                onValueChange={(value) =>
                  handleFilterChange("reportType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="coverage">Coverage</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => exportReport("excel")}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => exportReport("pdf")}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Sessions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.totalSessions || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Participants
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.totalParticipants || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getCompletionRate(
                        analytics?.completedSessions || 0,
                        analytics?.totalSessions || 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Budget
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.totalBudget
                        ? formatCurrency(analytics.totalBudget)
                        : "₹0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coverage Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Geographic Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">States Covered</h4>
                  {coverage?.statesCovered.map((state) => (
                    <div
                      key={state.state}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{state.state}</span>
                      <Badge variant="secondary">
                        {state.sessionCount} sessions
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Districts Covered</h4>
                  {coverage?.districtsCovered.slice(0, 5).map((district) => (
                    <div
                      key={district.district}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{district.district}</span>
                      <Badge variant="outline">
                        {district.sessionCount} sessions
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Coverage Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total States
                      </span>
                      <span className="font-medium">
                        {coverage?.statesCovered.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total Districts
                      </span>
                      <span className="font-medium">
                        {coverage?.districtsCovered.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Avg Sessions/State
                      </span>
                      <span className="font-medium">
                        {coverage?.statesCovered.length
                          ? Math.round(
                              (analytics?.totalSessions || 0) /
                                coverage.statesCovered.length
                            )
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participant Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Participant Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">By Audience Type</h4>
                  <div className="space-y-2">
                    {demographics?.byAudience.map((audience) => (
                      <div
                        key={audience.audience}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{audience.audience}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {audience.count}
                          </span>
                          <Badge variant="secondary">
                            {Math.round(
                              (audience.count /
                                (analytics?.totalParticipants || 1)) *
                                100
                            )}
                            %
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">By Training Theme</h4>
                  <div className="space-y-2">
                    {demographics?.byTheme.slice(0, 5).map((theme) => (
                      <div
                        key={theme.theme}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{theme.theme}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {theme.count}
                          </span>
                          <Badge variant="outline">
                            {Math.round(
                              (theme.count /
                                (analytics?.totalParticipants || 1)) *
                                100
                            )}
                            %
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Training Effectiveness</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Completion Rate
                      </span>
                      <span className="font-medium">
                        {getCompletionRate(
                          performance?.completedSessions || 0,
                          performance?.totalSessions || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Certification Rate
                      </span>
                      <span className="font-medium">
                        {getCompletionRate(
                          performance?.certifiedParticipants || 0,
                          analytics?.totalParticipants || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Avg Duration
                      </span>
                      <span className="font-medium">
                        {performance?.avgDurationHours || 0}h
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Resource Utilization</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Budget Utilization
                      </span>
                      <span className="font-medium">
                        {performance?.budgetUtilization
                          ? `${Math.round(performance.budgetUtilization)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Cost per Participant
                      </span>
                      <span className="font-medium">
                        {performance?.costPerParticipant
                          ? formatCurrency(performance.costPerParticipant)
                          : "₹0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Capacity Utilization
                      </span>
                      <span className="font-medium">
                        {performance?.capacityUtilization
                          ? `${Math.round(performance.capacityUtilization)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Quality Indicators</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Partner Diversity
                      </span>
                      <span className="font-medium">
                        {performance?.partnerDiversity || 0} types
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Geographic Reach
                      </span>
                      <span className="font-medium">
                        {coverage?.statesCovered.length || 0} states
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Theme Coverage
                      </span>
                      <span className="font-medium">
                        {demographics?.byTheme.length || 0} themes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900">
                    Geographic Coverage
                  </h5>
                  <p className="text-sm text-blue-700 mt-1">
                    Consider expanding training programs to underrepresented
                    states like Assam and Uttarakhand to improve national
                    coverage and disaster preparedness.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-900">
                    Resource Optimization
                  </h5>
                  <p className="text-sm text-green-700 mt-1">
                    Current budget utilization is efficient. Consider
                    reallocating savings to high-impact flood-prone areas for
                    maximum effectiveness.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h5 className="font-medium text-orange-900">
                    Capacity Building
                  </h5>
                  <p className="text-sm text-orange-700 mt-1">
                    Focus on training local government officials and community
                    leaders to ensure sustainable disaster management
                    capabilities at the grassroots level.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TrainingReports;
