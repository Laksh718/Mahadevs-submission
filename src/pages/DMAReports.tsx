import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import NDMALayout from "@/components/NDMALayout";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  MapPin,
  Clock,
  Activity,
  Eye,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

const DMAReports = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for DMA reports
  const reports = [
    {
      id: "1",
      title: "Monthly District Alert Summary",
      type: "Alert Report",
      date: "2025-10-01",
      status: "Generated",
      size: "2.4 MB",
      description:
        "Comprehensive analysis of all emergency alerts issued in the district during October 2025",
    },
    {
      id: "2",
      title: "Shelter Capacity Analysis",
      type: "Shelter Report",
      date: "2025-10-05",
      status: "Generated",
      size: "1.8 MB",
      description: "District shelter utilization and capacity planning report",
    },
    {
      id: "3",
      title: "Emergency Response Analytics",
      type: "Response Report",
      date: "2025-10-10",
      status: "Processing",
      size: "3.2 MB",
      description:
        "Analysis of emergency response times and effectiveness across all incidents",
    },
  ];

  const stats = {
    totalReports: 24,
    generatedThisMonth: 8,
    pendingReports: 3,
    downloadCount: 156,
  };

  const refreshReports = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Reports refreshed successfully");
    }, 1000);
  };

  return (
    <NDMALayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              DMA Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              District-level reporting and performance analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={refreshReports}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Total Reports
                  </p>
                  <p className="text-3xl font-bold text-orange-800">
                    {stats.totalReports}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Generated This Month
                  </p>
                  <p className="text-3xl font-bold text-green-800">
                    {stats.generatedThisMonth}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">
                    Pending Reports
                  </p>
                  <p className="text-3xl font-bold text-yellow-800">
                    {stats.pendingReports}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Downloads
                  </p>
                  <p className="text-3xl font-bold text-blue-800">
                    {stats.downloadCount}
                  </p>
                </div>
                <Download className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              District Reports
            </CardTitle>
            <CardDescription>
              Comprehensive reports generated for district-level analysis and
              decision making
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading reports...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Generated Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{report.title}</div>
                            <div className="text-sm text-gray-500">
                              {report.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {report.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {new Date(report.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              report.status === "Generated"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }
                          >
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.size}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </NDMALayout>
  );
};

export default DMAReports;
