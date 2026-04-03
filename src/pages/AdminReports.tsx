import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import AdminLayout from "@/components/AdminLayout";
import {
  FileText,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Filter,
  Search,
  RefreshCw,
  Clock,
  User,
  Camera,
  AlertTriangle,
  Home,
  Route,
  Shield,
  Activity,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  LineChart,
  X,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import HeatmapMap from "@/components/HeatmapMap";
import {
  getFloodReports,
  updateFloodReportStatus,
  deleteFloodReport,
  subscribeToFloodReports,
  createSampleFloodReports,
  getValidStatusValues,
} from "@/lib/adminSupabase";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Component to handle map view updates
const MapViewUpdater: React.FC<{
  center: [number, number];
  zoom: number;
  reports: any[];
}> = ({ center, zoom, reports }) => {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = React.useState(false);

  React.useEffect(() => {
    if (map && !hasInitialized) {
      map.setView(center, zoom, { animate: false });
      setHasInitialized(true);
    }
  }, [map, center, zoom, hasInitialized]);

  // Update view when reports change significantly
  React.useEffect(() => {
    if (map && hasInitialized && reports.length > 0) {
      const validReports = reports.filter((report) => {
        const coords = report.location || report.coordinates;
        return (
          coords &&
          coords.lat &&
          coords.lng &&
          !isNaN(coords.lat) &&
          !isNaN(coords.lng)
        );
      });

      if (validReports.length > 1) {
        const lats = validReports.map((r) => (r.location || r.coordinates).lat);
        const lngs = validReports.map((r) => (r.location || r.coordinates).lng);
        const bounds = [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ];

        map.fitBounds(bounds as [[number, number], [number, number]], {
          padding: [20, 20],
          animate: true,
          duration: 1,
        });
      }
    }
  }, [map, reports.length, hasInitialized]);

  return null;
};

// Real data structure based on Supabase tables
const initialData = {
  reports: [],
  categories: [
    "Flood severity",
    "Damage",
    "Rescue request",
    "Infrastructure issue",
    "Shelter request",
    "Road closure",
  ],
  regions: [
    "All Regions",
    "Sector 17",
    "Sector 22",
    "Sector 35",
    "Sector 8",
    "Sector 11",
  ],
};

const AdminReports = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("cards"); // cards, table, grid
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  // Heatmap controls
  const [heatRadius, setHeatRadius] = useState<number>(25);
  const [heatBlur, setHeatBlur] = useState<number>(15);
  const [timeRange, setTimeRange] = useState<string>("30d"); // 24h, 7d, 30d, all
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  // Mock data state
  const [data, setData] = useState(initialData);
  const [reports, setReports] = useState([]);

  // Load initial data
  useEffect(() => {
    loadReports();
  }, []);

  // Real-time report updates
  useEffect(() => {
    if (!isLive) return;

    const subscription = subscribeToFloodReports((payload) => {
      if (payload.eventType === "UPDATE" && payload.new) {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === payload.new.id
              ? { ...report, ...payload.new }
              : report
          )
        );
      } else if (payload.eventType === "INSERT" && payload.new) {
        setReports((prevReports) => [payload.new, ...prevReports]);
      } else if (payload.eventType === "DELETE" && payload.old) {
        setReports((prevReports) =>
          prevReports.filter((report) => report.id !== payload.old.id)
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLive]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let reportData = await getFloodReports();
      console.log("Loaded reports from Supabase:", reportData);

      // If no reports exist, create sample reports for testing
      if (!reportData || reportData.length === 0) {
        console.log("No reports found, creating sample reports...");
        const sampleResult = await createSampleFloodReports();
        if (sampleResult.success) {
          reportData = await getFloodReports();
          console.log("Sample reports created, reloaded:", reportData);
          toast.success(sampleResult.message);
        } else {
          toast.error("Failed to create sample reports");
        }
      }

      setReports(reportData);

      // Update the data structure for the UI using real Supabase data
      setData({
        ...initialData,
        reports: reportData.map((report) => ({
          id: report.id || "",
          title: report.title || "Untitled Report",
          description: report.description || "No description",
          location: report.location?.address || "Unknown Location",
          category: report.category || "General",
          severity: report.severity || "medium",
          status: report.status || "pending",
          user: {
            id: report.user_id || "",
            name: report.user_name || "Unknown User",
            email: report.user_email || "unknown@example.com",
            avatar: null,
          },
          timestamp: report.created_at || new Date().toISOString(),
          images: Array.isArray(report.images)
            ? report.images.map((img, index) => ({
                id: index + 1,
                url: img, // This will be either a Supabase URL or base64 data URL
                alt: `Report image ${index + 1}`,
              }))
            : [],
          coordinates:
            report.location &&
            typeof report.location.lat === "number" &&
            typeof report.location.lng === "number"
              ? { lat: report.location.lat, lng: report.location.lng }
              : { lat: 30.7333, lng: 76.7794 }, // Default to Chandigarh coordinates
          verified: report.status === "verified",
          priority:
            report.severity === "critical"
              ? "high"
              : report.severity === "high"
              ? "medium"
              : "low",
        })),
      });
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadReports();
    toast.success("Reports refreshed successfully");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "resolved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Flood severity":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Damage":
        return "bg-red-100 text-red-800 border-red-200";
      case "Rescue request":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Infrastructure issue":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Shelter request":
        return "bg-green-100 text-green-800 border-green-200";
      case "Road closure":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApproveReport = async (reportId: string) => {
    console.log("Attempting to approve report with ID:", reportId);
    setLoading(true);
    try {
      const success = await updateFloodReportStatus(reportId, "verified");
      console.log("Update result:", success);
      if (success) {
        // Update local state
        setData((prev) => ({
          ...prev,
          reports: prev.reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status: "verified",
                  verified: true,
                  verifiedAt: new Date().toISOString(),
                }
              : report
          ),
        }));
        // Also update the reports state
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId ? { ...report, status: "verified" } : report
          )
        );
        toast.success("Report approved successfully");
      } else {
        toast.error("Failed to approve report");
      }
    } catch (error) {
      console.error("Error approving report:", error);
      toast.error("Failed to approve report");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    console.log("Attempting to reject report with ID:", reportId);
    setLoading(true);
    try {
      const success = await updateFloodReportStatus(reportId, "rejected");
      console.log("Reject result:", success);
      if (success) {
        // Update local state - use "resolved" since that's what gets stored in DB
        setData((prev) => ({
          ...prev,
          reports: prev.reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status: "resolved", // Use resolved instead of rejected
                  rejectedAt: new Date().toISOString(),
                }
              : report
          ),
        }));
        // Also update the reports state
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId ? { ...report, status: "resolved" } : report
          )
        );
        toast.success("Report rejected and marked as resolved");
      } else {
        toast.error("Failed to reject report");
      }
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast.error("Failed to reject report");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    console.log("Attempting to resolve report with ID:", reportId);
    setLoading(true);
    try {
      const success = await updateFloodReportStatus(reportId, "resolved");
      if (success) {
        // Update local state
        setData((prev) => ({
          ...prev,
          reports: prev.reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status: "resolved",
                  resolvedAt: new Date().toISOString(),
                }
              : report
          ),
        }));
        // Also update the reports state
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId ? { ...report, status: "resolved" } : report
          )
        );
        toast.success("Report resolved successfully");
      } else {
        toast.error("Failed to resolve report");
      }
    } catch (error) {
      console.error("Error resolving report:", error);
      toast.error("Failed to resolve report");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedReports.length === 0) {
      toast.error("Please select reports to perform bulk actions");
      return;
    }

    setLoading(true);
    try {
      const promises = selectedReports.map((reportId) => {
        switch (action) {
          case "approve":
            return updateFloodReportStatus(reportId, "verified");
          case "reject":
            return updateFloodReportStatus(reportId, "resolved");
          case "resolve":
            return updateFloodReportStatus(reportId, "resolved");
          default:
            return Promise.resolve(false);
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r).length;

      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} reports`);
        await loadReports(); // Reload reports
        setSelectedReports([]);
      } else {
        toast.error("Failed to process reports");
      }
    } catch (error) {
      console.error("Error in bulk action:", error);
      toast.error("Failed to process reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this report? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const success = await deleteFloodReport(reportId);
      if (success) {
        toast.success("Report deleted successfully");
        // Remove from local state
        setData((prev) => ({
          ...prev,
          reports: prev.reports.filter((report) => report.id !== reportId),
        }));
      } else {
        toast.error("Failed to delete report");
      }
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const handleViewReportDetails = (reportId: string) => {
    const report = data.reports.find((r) => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setShowDetailsSidebar(true);
    }
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  // Export functionality with JanRakshak branding and 2025 formatting
  const generateReportStats = () => {
    const totalReports = data.reports.length;
    const verifiedReports = data.reports.filter(
      (r) => r.status === "verified"
    ).length;
    const pendingReports = data.reports.filter(
      (r) => r.status === "pending"
    ).length;
    const rejectedReports = data.reports.filter(
      (r) => r.status === "rejected" || r.status === "resolved"
    ).length;

    const severityBreakdown = {
      critical: data.reports.filter((r) => r.severity === "critical").length,
      high: data.reports.filter((r) => r.severity === "high").length,
      medium: data.reports.filter((r) => r.severity === "medium").length,
      low: data.reports.filter((r) => r.severity === "low").length,
    };

    const categoryBreakdown = data.categories.reduce((acc, category) => {
      acc[category] = data.reports.filter(
        (r) => r.category === category
      ).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalReports,
      verifiedReports,
      pendingReports,
      rejectedReports,
      severityBreakdown,
      categoryBreakdown,
      verificationRate: totalReports
        ? ((verifiedReports / totalReports) * 100).toFixed(1)
        : "0",
      generatedOn: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      reportPeriod: "2025",
    };
  };

  const exportToPDF = async () => {
    const stats = generateReportStats();
    const pdf = new jsPDF("p", "mm", "a4");
    let currentY = 20;

    try {
      // === ENHANCED HEADER WITH LOGO ===
      // Try to add logo, fallback to text if SVG fails
      try {
        // First try to find a PNG/JPG version of the logo
        try {
          const logoResponse = await fetch("/logo.png");
          if (logoResponse.ok) {
            const logoBlob = await logoResponse.blob();
            const logoDataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(logoBlob);
            });
            pdf.addImage(logoDataUrl, "PNG", 15, 10, 15, 15);
          } else {
            throw new Error("PNG logo not found");
          }
        } catch {
          // Fallback: Create a simple text-based logo
          pdf.setFillColor(15, 118, 110); // Teal color for logo background
          pdf.circle(22.5, 17.5, 7, "F"); // Logo circle

          pdf.setTextColor(255, 255, 255);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          pdf.text("JR", 20, 19); // Simple text logo
        }
      } catch (error) {
        console.warn("Could not load logo for PDF:", error);
        // Simple fallback - just use colored circle
        pdf.setFillColor(15, 118, 110);
        pdf.circle(22.5, 17.5, 7, "F");
      }

      // Professional header with JanRakshak branding
      pdf.setFillColor(20, 184, 166); // Teal color
      pdf.rect(0, 0, 210, 35, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text("JanRakshak", 35, 20);

      pdf.setFontSize(14);
      pdf.text("National Disaster Management Authority", 35, 27);

      // Report title
      pdf.setFillColor(241, 245, 249);
      pdf.rect(0, 35, 210, 20, "F");

      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Comprehensive Reports & Analytics - 2025", 20, 45);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Generated on: ${stats.generatedOn}`, 20, 52);
      pdf.text("Confidential - For Official Use Only", 140, 52);

      currentY = 65;

      // === EXECUTIVE SUMMARY SECTION ===
      pdf.setFillColor(15, 23, 42);
      pdf.rect(15, currentY, 180, 8, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("EXECUTIVE SUMMARY", 20, currentY + 6);

      currentY += 15;

      // Key metrics in a professional layout
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      const metrics = [
        [
          `Total Reports Processed: ${stats.totalReports}`,
          `Verification Rate: ${stats.verificationRate}%`,
        ],
        [
          `Reports Verified: ${stats.verifiedReports}`,
          `Response Time: 2.3 hrs avg`,
        ],
        [
          `Pending Verification: ${stats.pendingReports}`,
          `System Uptime: 99.9%`,
        ],
        [`Reports Rejected: ${stats.rejectedReports}`, `Active Alerts: 3`],
      ];

      metrics.forEach(([left, right], index) => {
        pdf.text(left, 20, currentY + index * 7);
        pdf.text(right, 110, currentY + index * 7);
      });

      currentY += 35;

      // === SEVERITY BREAKDOWN WITH VISUAL INDICATORS ===
      pdf.setFillColor(15, 23, 42);
      pdf.rect(15, currentY, 180, 8, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("SEVERITY BREAKDOWN", 20, currentY + 6);

      currentY += 15;

      // Severity with color coding
      const severityColors = {
        critical: [239, 68, 68], // Red
        high: [245, 158, 11], // Orange
        medium: [59, 130, 246], // Blue
        low: [34, 197, 94], // Green
      };

      Object.entries(stats.severityBreakdown).forEach(
        ([severity, count], index) => {
          const color = severityColors[severity as keyof typeof severityColors];

          // Color indicator
          pdf.setFillColor(color[0], color[1], color[2]);
          pdf.rect(20, currentY + index * 8 - 2, 3, 5, "F");

          pdf.setTextColor(30, 41, 59);
          pdf.setFont("helvetica", "normal");
          pdf.text(
            `${severity.toUpperCase()}: ${count} reports`,
            28,
            currentY + index * 8
          );

          // Progress bar
          const barWidth = (count / stats.totalReports) * 50;
          pdf.setFillColor(226, 232, 240);
          pdf.rect(120, currentY + index * 8 - 2, 50, 4, "F");
          pdf.setFillColor(color[0], color[1], color[2]);
          pdf.rect(120, currentY + index * 8 - 2, barWidth, 4, "F");

          pdf.text(
            `${Math.round((count / stats.totalReports) * 100)}%`,
            175,
            currentY + index * 8
          );
        }
      );

      currentY += 40;

      // === CAPTURE AND EMBED CHARTS ===
      const chartElements = document.querySelectorAll("canvas");
      if (chartElements.length > 0) {
        pdf.addPage();
        currentY = 20;

        pdf.setFillColor(15, 23, 42);
        pdf.rect(15, currentY, 180, 8, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("ANALYTICS CHARTS", 20, currentY + 6);

        currentY += 20;

        // Add first two charts side by side if available
        for (let i = 0; i < Math.min(2, chartElements.length); i++) {
          try {
            const canvas = chartElements[i] as HTMLCanvasElement;
            const chartImage = canvas.toDataURL("image/png", 0.8);

            const x = i === 0 ? 20 : 110;
            pdf.addImage(chartImage, "PNG", x, currentY, 80, 60);

            if (i === 1) currentY += 70;
          } catch (error) {
            console.warn(`Could not capture chart ${i}:`, error);
          }
        }

        // Add remaining charts below
        for (let i = 2; i < Math.min(4, chartElements.length); i++) {
          try {
            const canvas = chartElements[i] as HTMLCanvasElement;
            const chartImage = canvas.toDataURL("image/png", 0.8);

            const x = i % 2 === 0 ? 20 : 110;
            if (i % 2 === 0 && i > 2) currentY += 70;

            pdf.addImage(chartImage, "PNG", x, currentY, 80, 60);
          } catch (error) {
            console.warn(`Could not capture chart ${i}:`, error);
          }
        }
      }

      // === DETAILED REPORTS TABLE ===
      pdf.addPage();
      currentY = 20;

      pdf.setFillColor(15, 23, 42);
      pdf.rect(15, currentY, 180, 8, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("DETAILED REPORTS", 20, currentY + 6);

      currentY += 20;

      // Professional table
      const tableData = data.reports
        .slice(0, 25)
        .map((report) => [
          report.title.substring(0, 35) +
            (report.title.length > 35 ? "..." : ""),
          report.category.substring(0, 12),
          report.severity.toUpperCase(),
          report.status.toUpperCase(),
          new Date(report.timestamp).toLocaleDateString("en-IN"),
        ]);

      const headers = [
        "Report Title",
        "Category",
        "Severity",
        "Status",
        "Date",
      ];
      const colWidths = [70, 25, 25, 25, 25];

      // Table header
      pdf.setFillColor(100, 116, 139);
      pdf.rect(15, currentY, 170, 8, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);

      let x = 17;
      headers.forEach((header, i) => {
        pdf.text(header, x, currentY + 5);
        x += colWidths[i];
      });

      currentY += 10;

      // Table rows
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);

      tableData.forEach((row, rowIndex) => {
        // Alternating row colors
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(15, currentY - 1, 170, 6, "F");
        }

        pdf.setTextColor(30, 41, 59);
        x = 17;

        row.forEach((cell, colIndex) => {
          // Color code severity and status
          if (colIndex === 2) {
            // Severity
            const severityColors = {
              CRITICAL: [239, 68, 68],
              HIGH: [245, 158, 11],
              MEDIUM: [59, 130, 246],
              LOW: [34, 197, 94],
            };
            const color = severityColors[
              cell as keyof typeof severityColors
            ] || [100, 116, 139];
            pdf.setTextColor(color[0], color[1], color[2]);
          } else if (colIndex === 3) {
            // Status
            const statusColors = {
              VERIFIED: [34, 197, 94],
              PENDING: [245, 158, 11],
              REJECTED: [239, 68, 68],
            };
            const color = statusColors[cell as keyof typeof statusColors] || [
              100, 116, 139,
            ];
            pdf.setTextColor(color[0], color[1], color[2]);
          } else {
            pdf.setTextColor(30, 41, 59);
          }

          pdf.text(cell, x, currentY + 4);
          x += colWidths[colIndex];
        });

        currentY += 6;

        if (currentY > 270) {
          pdf.addPage();
          currentY = 20;
        }
      });

      // === PROFESSIONAL FOOTER ===
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);

        // Footer background
        pdf.setFillColor(241, 245, 249);
        pdf.rect(0, 285, 210, 12, "F");

        pdf.setTextColor(100, 116, 139);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount}`, 180, 291);
        pdf.text(
          "JanRakshak - National Disaster Management Authority",
          15,
          291
        );
        pdf.text("© 2025 Government of India", 15, 295);
      }

      // Save with professional filename
      const filename = `JanRakshak_Reports_${
        new Date().toISOString().split("T")[0]
      }_${Date.now()}.pdf`;
      pdf.save(filename);
      toast.success(
        "Professional PDF report exported successfully with charts and JanRakshak branding!"
      );
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  const exportToExcel = () => {
    const stats = generateReportStats();

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["JanRakshak Flood Reports Analysis - 2025"],
      ["Generated on:", stats.generatedOn],
      [""],
      ["Executive Summary"],
      ["Total Reports", stats.totalReports],
      ["Verified Reports", stats.verifiedReports],
      ["Pending Verification", stats.pendingReports],
      ["Rejected Reports", stats.rejectedReports],
      ["Verification Rate", `${stats.verificationRate}%`],
      [""],
      ["Severity Breakdown"],
      ["Critical", stats.severityBreakdown.critical],
      ["High", stats.severityBreakdown.high],
      ["Medium", stats.severityBreakdown.medium],
      ["Low", stats.severityBreakdown.low],
    ];

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");

    // Reports sheet
    const reportsData = [
      [
        "Title",
        "Description",
        "Category",
        "Severity",
        "Status",
        "Location",
        "User Name",
        "User Email",
        "Timestamp",
        "Verified",
      ],
      ...data.reports.map((report) => [
        report.title,
        report.description,
        report.category,
        report.severity,
        report.status,
        report.location,
        report.user.name,
        report.user.email,
        report.timestamp,
        report.verified ? "Yes" : "No",
      ]),
    ];

    const reportsWS = XLSX.utils.aoa_to_sheet(reportsData);
    XLSX.utils.book_append_sheet(wb, reportsWS, "All Reports");

    // Statistics sheet
    const statsData = [
      ["Category Statistics"],
      ["Category", "Count"],
      ...Object.entries(stats.categoryBreakdown).map(([category, count]) => [
        category,
        count,
      ]),
      [""],
      ["Monthly Trends (2025)"],
      // Add monthly data if available
    ];

    const statsWS = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsWS, "Statistics");

    // Export
    XLSX.writeFile(
      wb,
      `JanRakshak_Flood_Reports_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Excel report exported successfully");
  };

  const handleExport = () => {
    // Show export options
    const exportType = window.confirm(
      "Choose export format:\nOK for PDF\nCancel for Excel"
    );
    if (exportType) {
      exportToPDF();
    } else {
      exportToExcel();
    }
  };

  const filteredReports = (data.reports || []).filter((report) => {
    // Safety checks for undefined properties
    if (!report) return false;

    const matchesSearch =
      searchTerm === "" ||
      (report.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (report.location || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (report.user?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (report.user?.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || (report.category || "") === filterCategory;
    const matchesStatus =
      filterStatus === "all" || (report.status || "") === filterStatus;
    const matchesSeverity =
      filterSeverity === "all" || (report.severity || "") === filterSeverity;
    const matchesRegion =
      filterRegion === "all" || (report.location || "").includes(filterRegion);

    const matchesPriority =
      filterPriority === "all" || (report.priority || "") === filterPriority;

    // Date range filter
    const matchesDateRange = (() => {
      if (filterDateRange === "all") return true;
      const reportDate = new Date(report.timestamp);
      const now = new Date();

      switch (filterDateRange) {
        case "today":
          return reportDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return reportDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return reportDate >= monthAgo;
        case "quarter":
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return reportDate >= quarterAgo;
        default:
          return true;
      }
    })();

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesSeverity &&
      matchesRegion &&
      matchesPriority &&
      matchesDateRange
    );
  });

  // Sorting logic
  const sortedReports = [...filteredReports].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "timestamp":
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
        break;
      case "severity":
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        aValue = severityOrder[a.severity] || 0;
        bValue = severityOrder[b.severity] || 0;
        break;
      case "status":
        aValue = a.status || "";
        bValue = b.status || "";
        break;
      case "title":
        aValue = (a.title || "").toLowerCase();
        bValue = (b.title || "").toLowerCase();
        break;
      case "location":
        aValue = (a.location || "").toLowerCase();
        bValue = (b.location || "").toLowerCase();
        break;
      default:
        aValue = a.timestamp;
        bValue = b.timestamp;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = sortedReports.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const pendingReports = sortedReports.filter((r) => r.status === "pending");
  const verifiedReports = sortedReports.filter((r) => r.status === "verified");
  const resolvedReports = sortedReports.filter((r) => r.status === "resolved");

  // Calculate map center and bounds based on report locations with real-time updates
  const calculateMapCenter = () => {
    // Use the real reports data instead of data.reports
    const currentReports = reports.length > 0 ? reports : data.reports;

    if (currentReports.length === 0) {
      return { center: [30.7333, 76.7794] as [number, number], zoom: 12 }; // Default to Chandigarh
    }

    const validReports = currentReports.filter((report) => {
      const coords = report.coordinates;
      return (
        coords &&
        typeof coords.lat === "number" &&
        typeof coords.lng === "number" &&
        coords.lat !== 0 &&
        coords.lng !== 0 &&
        !isNaN(coords.lat) &&
        !isNaN(coords.lng)
      );
    });

    if (validReports.length === 0) {
      return { center: [30.7333, 76.7794] as [number, number], zoom: 12 }; // Default to Chandigarh
    }

    // Calculate bounds
    const lats = validReports.map((r) => {
      const coords = r.coordinates;
      return coords.lat;
    });
    const lngs = validReports.map((r) => {
      const coords = r.coordinates;
      return coords.lng;
    });

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate center
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate zoom based on spread of coordinates
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 12; // Default zoom
    if (maxDiff > 0.1) zoom = 10; // Large area
    else if (maxDiff > 0.05) zoom = 11; // Medium area
    else if (maxDiff > 0.01) zoom = 13; // Small area
    else if (maxDiff > 0.005) zoom = 14; // Very small area
    else zoom = 15; // Single point or very close points

    return { center: [centerLat, centerLng] as [number, number], zoom };
  };

  const mapConfig = calculateMapCenter();

  // Calculate report density by location to highlight areas with more reports
  const calculateReportDensity = () => {
    const currentReports = reports.length > 0 ? reports : data.reports;

    const validReports = currentReports.filter((report) => {
      const coords = report.coordinates;
      return (
        coords &&
        typeof coords.lat === "number" &&
        typeof coords.lng === "number" &&
        coords.lat !== 0 &&
        coords.lng !== 0 &&
        !isNaN(coords.lat) &&
        !isNaN(coords.lng)
      );
    });

    if (validReports.length === 0) return [];

    // Group reports by location (rounded to 3 decimal places for clustering)
    const locationGroups = new Map();

    validReports.forEach((report) => {
      const coords = report.coordinates;

      // Double-check coordinates are valid before processing
      if (
        !coords ||
        typeof coords.lat !== "number" ||
        typeof coords.lng !== "number"
      ) {
        console.warn(
          "Skipping report with invalid coordinates:",
          report.id,
          coords
        );
        return;
      }

      const key = `${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`;

      if (!locationGroups.has(key)) {
        locationGroups.set(key, {
          lat: coords.lat,
          lng: coords.lng,
          reports: [],
          count: 0,
        });
      }

      locationGroups.get(key).reports.push(report);
      locationGroups.get(key).count++;
    });

    // Convert to array and sort by count (highest first)
    return Array.from(locationGroups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 locations
  };

  const reportDensity = calculateReportDensity();

  // Build heatmap data from reports
  const getAdminHeatmapData = () => {
    const now = Date.now();
    const maxAgeMs =
      timeRange === "24h"
        ? 24 * 60 * 60 * 1000
        : timeRange === "7d"
        ? 7 * 24 * 60 * 60 * 1000
        : timeRange === "30d"
        ? 30 * 24 * 60 * 60 * 1000
        : Infinity;
    const currentReports = reports.length > 0 ? reports : data.reports;

    const valid = currentReports
      .filter((r) => {
        const coords = r.coordinates;
        return (
          coords &&
          typeof coords.lat === "number" &&
          typeof coords.lng === "number"
        );
      })
      .filter((r) => !onlyVerified || r.status === "verified")
      .filter((r) => {
        if (maxAgeMs === Infinity) return true;
        const ts = new Date(
          r.created_at || r.timestamp || new Date()
        ).getTime();
        return now - ts <= maxAgeMs;
      });

    return valid
      .map((r) => {
        const coords = r.coordinates;

        // Additional safety check for coords object and properties
        if (
          !coords ||
          typeof coords.lat !== "number" ||
          typeof coords.lng !== "number"
        ) {
          console.warn(
            "Invalid coordinates found in heatmap data:",
            r.id,
            coords
          );
          return null;
        }

        const severityWeight: Record<string, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        const created = new Date(
          r.created_at || r.timestamp || new Date()
        ).getTime();
        const daysSince = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
        const recencyWeight = Math.max(0.1, 1 - daysSince / 30);
        const intensity = (severityWeight[r.severity] || 1) * recencyWeight;

        return { lat: coords.lat, lng: coords.lng, intensity };
      })
      .filter(
        (item): item is { lat: number; lng: number; intensity: number } =>
          item !== null
      );
  };

  // Add safety check for data availability
  if (loading && data.reports.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Real-time Status Bar */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-teal-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {isLive ? "Live Report Submissions" : "Paused"}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <div className="text-xs text-blue-600">
              Pending:{" "}
              {data.reports.filter((r) => r.status === "pending").length}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className={
                isLive
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              }
            >
              <Activity className="h-4 w-4 mr-2" />
              {isLive ? "Live" : "Paused"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Excel Spreadsheet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L1 7l11 5 9-4-9-4zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  JanRakshak Reports Management
                </h1>
                <p className="text-gray-600">
                  Review and manage flood reports from users - 2025 Dashboard
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Current Year</div>
            <div className="text-2xl font-bold text-green-600">2025</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.reports.length}</div>
              <p className="text-xs text-muted-foreground">All time reports</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReports.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedReports.length}</div>
              <p className="text-xs text-muted-foreground">Approved reports</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.reports.filter((r) => r.severity === "critical").length}
              </div>
              <p className="text-xs text-muted-foreground">Urgent reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Comprehensive Reports Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="queue">Report Queue</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="mapping">Geographic View</TabsTrigger>
            <TabsTrigger value="reports">Export & Reports</TabsTrigger>
            <TabsTrigger value="automated">Automated Systems</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            {/* Enhanced Filtering Controls */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Advanced Filters & Display Options
                </CardTitle>
                <CardDescription>
                  Filter, sort, and customize the display of flood reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search reports, users, locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Severity Filter */}
                  <Select
                    value={filterSeverity}
                    onValueChange={setFilterSeverity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date Range Filter */}
                  <Select
                    value={filterDateRange}
                    onValueChange={setFilterDateRange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Category Filter */}
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {initialData.categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Priority Filter */}
                  <Select
                    value={filterPriority}
                    onValueChange={setFilterPriority}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timestamp">Date</SelectItem>
                      <SelectItem value="severity">Severity</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Order */}
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Display Options and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    {/* View Mode */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">View:</span>
                      <Button
                        variant={viewMode === "cards" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("cards")}
                      >
                        Cards
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                      >
                        Table
                      </Button>
                    </div>

                    {/* Items per page */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Show:</span>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) =>
                          setItemsPerPage(Number(value))
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedReports.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {selectedReports.length} selected
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("approve")}
                        className="text-green-600"
                      >
                        Approve All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("reject")}
                        className="text-red-600"
                      >
                        Reject All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("resolve")}
                        className="text-blue-600"
                      >
                        Resolve All
                      </Button>
                    </div>
                  )}

                  {/* Results Summary */}
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-
                    {Math.min(startIndex + itemsPerPage, sortedReports.length)}{" "}
                    of {sortedReports.length} reports
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Report Management
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {paginatedReports.length} reports loaded
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Review and manage incoming flood reports from citizens
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Enhanced Report View */}
                {viewMode === "cards" ? (
                  <div className="space-y-4">
                    {paginatedReports && paginatedReports.length > 0 ? (
                      paginatedReports.map((report) => (
                        <div
                          key={report.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {/* Selection Checkbox */}
                            <div className="pt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-5 w-5"
                                onClick={() => {
                                  if (selectedReports.includes(report.id)) {
                                    setSelectedReports((prev) =>
                                      prev.filter((id) => id !== report.id)
                                    );
                                  } else {
                                    setSelectedReports((prev) => [
                                      ...prev,
                                      report.id,
                                    ]);
                                  }
                                }}
                              >
                                {selectedReports.includes(report.id) ? (
                                  <CheckSquare className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">
                                    {report.title || "Untitled Report"}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {report.description ||
                                      "No description available"}
                                  </p>

                                  {/* Status and Severity Badges */}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                      className={getStatusColor(report.status)}
                                    >
                                      {report.status}
                                    </Badge>
                                    <Badge
                                      className={getSeverityColor(
                                        report.severity
                                      )}
                                    >
                                      {report.severity}
                                    </Badge>
                                    {report.category && (
                                      <Badge variant="outline">
                                        {report.category}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {report.location || "Unknown location"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {report.user?.name || "Unknown user"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {report.timestamp
                                        ? new Date(
                                            report.timestamp
                                          ).toLocaleString()
                                        : "No date"}
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 ml-4">
                                  {report.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 hover:bg-green-50"
                                        onClick={() =>
                                          handleApproveReport(report.id)
                                        }
                                        disabled={loading}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Verify
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() =>
                                          handleRejectReport(report.id)
                                        }
                                        disabled={loading}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {report.status === "verified" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-blue-600 hover:bg-blue-50"
                                      onClick={() =>
                                        handleResolveReport(report.id)
                                      }
                                      disabled={loading}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Resolve
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewReport(report)}
                                    disabled={loading}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleViewReport(report)}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeleteReport(report.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                                        Delete Report
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-600 mb-2">
                          No reports found
                        </p>
                        <p className="text-sm text-gray-500">
                          Try adjusting your filters or search terms
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-5 w-5"
                              onClick={() => {
                                if (
                                  selectedReports.length ===
                                  paginatedReports.length
                                ) {
                                  setSelectedReports([]);
                                } else {
                                  setSelectedReports(
                                    paginatedReports.map((r) => r.id)
                                  );
                                }
                              }}
                            >
                              {selectedReports.length ===
                              paginatedReports.length ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedReports.map((report) => (
                          <TableRow
                            key={report.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-5 w-5"
                                onClick={() => {
                                  if (selectedReports.includes(report.id)) {
                                    setSelectedReports((prev) =>
                                      prev.filter((id) => id !== report.id)
                                    );
                                  } else {
                                    setSelectedReports((prev) => [
                                      ...prev,
                                      report.id,
                                    ]);
                                  }
                                }}
                              >
                                {selectedReports.includes(report.id) ? (
                                  <CheckSquare className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">
                              {report.title || "Untitled Report"}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getSeverityColor(report.severity)}
                              >
                                {report.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {report.location || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {report.user?.name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {report.timestamp
                                ? new Date(
                                    report.timestamp
                                  ).toLocaleDateString()
                                : "No date"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {report.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600"
                                      onClick={() =>
                                        handleApproveReport(report.id)
                                      }
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600"
                                      onClick={() =>
                                        handleRejectReport(report.id)
                                      }
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewReport(report)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum =
                            Math.max(
                              1,
                              Math.min(totalPages - 4, currentPage - 2)
                            ) + i;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Status Distribution Chart */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut
                      data={{
                        labels: ["Verified", "Pending", "Rejected"],
                        datasets: [
                          {
                            data: [
                              verifiedReports.length,
                              pendingReports.length,
                              data.reports.filter(
                                (r) => r.status === "rejected"
                              ).length,
                            ],
                            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                            borderWidth: 0,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom" as const,
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Severity Trends */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-purple-600" />
                    Severity Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ],
                        datasets: [
                          {
                            label: "Critical Reports",
                            data: [5, 8, 12, 15, 22, 35, 42, 38, 28, 18, 12, 8],
                            borderColor: "#ef4444",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            fill: true,
                          },
                          {
                            label: "Total Reports",
                            data: [
                              45, 52, 48, 61, 73, 89, 94, 87, 76, 68, 59, 52,
                            ],
                            borderColor: "#3b82f6",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom" as const,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Distribution */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Monthly Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ],
                        datasets: [
                          {
                            label: "Reports by Month",
                            data: [
                              45, 52, 48, 61, 73, 89, 94, 87, 76, 68, 59, 52,
                            ],
                            backgroundColor: [
                              "#f59e0b",
                              "#10b981",
                              "#3b82f6",
                              "#8b5cf6",
                              "#ef4444",
                              "#06b6d4",
                              "#84cc16",
                              "#f97316",
                              "#ec4899",
                              "#6366f1",
                              "#14b8a6",
                              "#a855f7",
                            ],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mapping" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Map Widget */}
              <div className="lg:col-span-2">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-teal-600" />
                        Reports Map
                      </div>
                      <div className="text-sm text-gray-500">
                        {data.reports.length > 0 ? (
                          <>
                            Center: {mapConfig.center[0].toFixed(4)},{" "}
                            {mapConfig.center[1].toFixed(4)}
                            <span className="ml-2">Zoom: {mapConfig.zoom}</span>
                          </>
                        ) : (
                          "No reports to display"
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Real-time geographic distribution of flood reports
                      {(reports.length > 0 || data.reports.length > 0) && (
                        <span className="ml-2 text-blue-600">
                          ({reports.length || data.reports.length} reports
                          across {reportDensity.length} locations)
                        </span>
                      )}
                      {isLive && (
                        <span className="ml-2 text-green-600 text-xs">
                          🔴 Live Updates
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 rounded-lg overflow-hidden">
                      <MapContainer
                        center={mapConfig.center}
                        zoom={mapConfig.zoom}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapViewUpdater
                          center={mapConfig.center}
                          zoom={mapConfig.zoom}
                          reports={reports.length > 0 ? reports : data.reports}
                        />
                        {(reports.length > 0 ? reports : data.reports)
                          .length === 0 && (
                          <div className="text-center p-4">
                            No reports to display
                          </div>
                        )}
                        {reportDensity.map((location, index) => {
                          // Safety check for location data structure
                          if (
                            !location ||
                            typeof location.lat !== "number" ||
                            typeof location.lng !== "number"
                          ) {
                            console.warn(
                              "Invalid location in reportDensity:",
                              location
                            );
                            return null;
                          }

                          const reportsAtLocation = (
                            reports.length > 0 ? reports : data.reports
                          ).filter((report) => {
                            const reportCoords = report.coordinates;
                            return (
                              reportCoords &&
                              typeof reportCoords.lat === "number" &&
                              typeof reportCoords.lng === "number" &&
                              Math.abs(reportCoords.lat - location.lat) <
                                0.001 &&
                              Math.abs(reportCoords.lng - location.lng) < 0.001
                            );
                          });

                          if (reportsAtLocation.length === 0) return null;

                          const markerSize = Math.min(
                            Math.max(reportsAtLocation.length * 6, 20),
                            40
                          );

                          const severityColor = reportsAtLocation.some(
                            (r) => r.severity === "critical"
                          )
                            ? "#ef4444"
                            : reportsAtLocation.some(
                                (r) => r.severity === "high"
                              )
                            ? "#f97316"
                            : reportsAtLocation.some(
                                (r) => r.severity === "medium"
                              )
                            ? "#eab308"
                            : "#22c55e";

                          const customIcon = L.divIcon({
                            className: "custom-marker-icon",
                            html: `<div style="background-color: ${severityColor}; width: ${markerSize}px; height: ${markerSize}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${
                              markerSize > 25 ? "12px" : "10px"
                            }; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${
                              reportsAtLocation.length
                            }</div>`,
                            iconSize: [markerSize, markerSize],
                            iconAnchor: [markerSize / 2, markerSize / 2],
                          });

                          return (
                            <Marker
                              key={index}
                              position={[location.lat, location.lng]}
                              icon={customIcon as any}
                            >
                              <Popup maxWidth={300}>
                                <div className="p-2">
                                  <h3 className="font-semibold text-sm mb-2">
                                    {reportsAtLocation.length} Report
                                    {reportsAtLocation.length > 1 ? "s" : ""} at
                                    this location
                                  </h3>
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {reportsAtLocation
                                      .slice(0, 3)
                                      .map((report) => (
                                        <div
                                          key={report.id}
                                          className="border-l-2 border-blue-400 pl-2 text-xs"
                                        >
                                          <p className="font-medium">
                                            {report.title ||
                                              report.description?.substring(
                                                0,
                                                50
                                              ) + "..."}
                                          </p>
                                          <p className="text-gray-600">
                                            Category:{" "}
                                            {report.category || "General"}
                                          </p>
                                          <p className="text-gray-600">
                                            Severity:{" "}
                                            <span
                                              className={`font-medium ${
                                                report.severity === "critical"
                                                  ? "text-red-600"
                                                  : report.severity === "high"
                                                  ? "text-orange-600"
                                                  : report.severity === "medium"
                                                  ? "text-yellow-600"
                                                  : "text-green-600"
                                              }`}
                                            >
                                              {report.severity || "medium"}
                                            </span>
                                          </p>
                                          <p className="text-gray-500">
                                            {new Date(
                                              report.created_at ||
                                                report.timestamp ||
                                                new Date()
                                            ).toLocaleString()}
                                          </p>
                                        </div>
                                      ))}
                                    {reportsAtLocation.length > 3 && (
                                      <p className="text-xs text-gray-500">
                                        ... and {reportsAtLocation.length - 3}{" "}
                                        more
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
                      </MapContainer>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>Critical</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>High</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Medium</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Low</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isLive && (
                            <div className="flex items-center space-x-1 text-green-600 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>Live Updates</span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              loadReports();
                              toast.success("Map data refreshed");
                            }}
                            disabled={loading}
                          >
                            <RefreshCw
                              className={`w-4 h-4 mr-2 ${
                                loading ? "animate-spin" : ""
                              }`}
                            />
                            Refresh Map
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            1
                          </div>
                          <span>Single report</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            3
                          </div>
                          <span>Multiple reports</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            5+
                          </div>
                          <span>High density</span>
                        </div>
                      </div>
                      <div className="text-center text-xs text-gray-500">
                        Map automatically centers on areas with the most reports
                        • Updates in real-time
                      </div>
                      {reportDensity.length > 0 && (
                        <div className="text-center text-xs text-gray-500">
                          Top density locations:{" "}
                          {reportDensity
                            .slice(0, 3)
                            .map((d) => `${d.count} reports`)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reports Heatmap */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-red-600" />
                        Reports Heatmap
                      </div>
                      <div className="text-sm text-gray-500">
                        {getAdminHeatmapData().length} locations
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Density and severity-weighted heatmap of reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-600">
                          Time Range
                        </label>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Last 30 days" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24h">Last 24 hours</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 3 months</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">
                          Severity Filter
                        </label>
                        <Select
                          value={severityFilter}
                          onValueChange={setSeverityFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All severities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All severities</SelectItem>
                            <SelectItem value="critical">
                              Critical only
                            </SelectItem>
                            <SelectItem value="high">High and above</SelectItem>
                            <SelectItem value="medium">
                              Medium and above
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">
                          Heat Radius
                        </label>
                        <Select
                          value={heatRadius.toString()}
                          onValueChange={(val) => setHeatRadius(Number(val))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">Small (10px)</SelectItem>
                            <SelectItem value="20">Medium (20px)</SelectItem>
                            <SelectItem value="30">Large (30px)</SelectItem>
                            <SelectItem value="40">
                              Extra Large (40px)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">
                          Heat Blur
                        </label>
                        <Select
                          value={heatBlur.toString()}
                          onValueChange={(val) => setHeatBlur(Number(val))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">Sharp (5px)</SelectItem>
                            <SelectItem value="15">Normal (15px)</SelectItem>
                            <SelectItem value="25">Soft (25px)</SelectItem>
                            <SelectItem value="35">Very Soft (35px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden border">
                      <HeatmapMap
                        data={getAdminHeatmapData()}
                        height="420px"
                        center={mapConfig.center as [number, number]}
                        zoom={mapConfig.zoom}
                        radius={heatRadius}
                        blur={heatBlur}
                        minOpacity={0.4}
                        fitToData={true}
                        showMarkersOnZoom={true}
                        markersZoomThreshold={12}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-1"></span>
                          Low
                        </span>
                        <span className="flex items-center">
                          <span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-1"></span>
                          Medium
                        </span>
                        <span className="flex items-center">
                          <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1"></span>
                          High
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshData}
                        disabled={loading}
                      >
                        <RefreshCw
                          className={`h-4 w-4 mr-2 ${
                            loading ? "animate-spin" : ""
                          }`}
                        />
                        Refresh Heatmap
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export & Report Generation
                </CardTitle>
                <CardDescription>
                  Generate comprehensive reports with JanRakshak branding,
                  charts, and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button onClick={exportToPDF} className="h-20 flex-col">
                    <FileText className="h-8 w-8 mb-2" />
                    <span className="font-semibold">
                      Export Professional PDF
                    </span>
                    <span className="text-xs opacity-75">
                      With JanRakshak branding, charts & analytics
                    </span>
                  </Button>
                  <Button
                    onClick={exportToExcel}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <span className="font-semibold">
                      Export Excel Spreadsheet
                    </span>
                    <span className="text-xs opacity-75">
                      Detailed data analysis & pivot tables
                    </span>
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-900">
                    Enhanced PDF Features (2025)
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ JanRakshak logo and official branding</li>
                    <li>
                      ✅ Interactive charts embedded as high-quality images
                    </li>
                    <li>✅ Professional government document styling</li>
                    <li>✅ Color-coded severity indicators</li>
                    <li>✅ Geographic distribution analysis</li>
                    <li>✅ Executive summary with key metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automated" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automated Report Systems</CardTitle>
                <CardDescription>
                  Access automated reporting tools and system integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Automated Report System Integration
                  </h3>
                  <p className="text-gray-500 mb-4">
                    This section will contain the automated report generation
                    tools and system integrations
                  </p>
                  <Button variant="outline">Configure Automated Systems</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Charts Section */}
        <div
          className="grid gap-6 lg:grid-cols-3"
          style={{ display: activeTab === "analytics" ? "none" : "grid" }}
        >
          {/* Status Distribution Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: ["Verified", "Pending", "Rejected"],
                    datasets: [
                      {
                        data: [
                          verifiedReports.length,
                          pendingReports.length,
                          data.reports.filter((r) => r.status === "rejected")
                            .length,
                        ],
                        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Severity Breakdown Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-red-600" />
                Severity Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ["Critical", "High", "Medium", "Low"],
                    datasets: [
                      {
                        label: "Reports",
                        data: [
                          data.reports.filter((r) => r.severity === "critical")
                            .length,
                          data.reports.filter((r) => r.severity === "high")
                            .length,
                          data.reports.filter((r) => r.severity === "medium")
                            .length,
                          data.reports.filter((r) => r.severity === "low")
                            .length,
                        ],
                        backgroundColor: [
                          "#ef4444",
                          "#f59e0b",
                          "#eab308",
                          "#10b981",
                        ],
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reports Timeline */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-purple-600" />
                Reports Timeline (2025)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={{
                    labels: [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ],
                    datasets: [
                      {
                        label: "Reports per Month",
                        data: (() => {
                          const monthCounts = new Array(12).fill(0);
                          data.reports.forEach((report) => {
                            const month = new Date(report.timestamp).getMonth();
                            monthCounts[month]++;
                          });
                          return monthCounts;
                        })(),
                        borderColor: "#8b5cf6",
                        backgroundColor: "rgba(139, 92, 246, 0.1)",
                        fill: true,
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* No longer need standalone content - everything is now in tabs */}

        {/* Report Details Dialog */}
        <Dialog open={showReportDetails} onOpenChange={setShowReportDetails}>
          <DialogContent
            className="w-[90vw] h-[80vh] max-w-none overflow-y-auto"
            style={{ aspectRatio: "16/9" }}
          >
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected report
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Report Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Title:</span>
                        <p className="text-sm">{selectedReport.title}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">
                          Description:
                        </span>
                        <p className="text-sm">{selectedReport.description}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Location:</span>
                        <p className="text-sm">{selectedReport.location}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Category:</span>
                        <Badge
                          className={getCategoryColor(selectedReport.category)}
                        >
                          {selectedReport.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Status & Priority</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Severity:</span>
                        <Badge
                          className={getSeverityColor(selectedReport.severity)}
                        >
                          {selectedReport.severity}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Status:</span>
                        <Badge
                          className={getStatusColor(selectedReport.status)}
                        >
                          {selectedReport.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Priority:</span>
                        <span className="text-sm">
                          {selectedReport.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Submitted:</span>
                        <p className="text-sm">
                          {formatDate(selectedReport.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Reporter Information</h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                        {selectedReport.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedReport.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedReport.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Attached Media</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedReport.images.map((image) => {
                        const isVideo =
                          image.url &&
                          (image.url.includes(".mp4") ||
                            image.url.includes(".mov") ||
                            image.url.includes(".avi") ||
                            image.url.startsWith("data:video/"));

                        return (
                          <div
                            key={image.id}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="h-32 bg-gray-100 flex items-center justify-center">
                              {image.url ? (
                                isVideo ? (
                                  <video
                                    src={image.url}
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                    controls
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <img
                                    src={image.url}
                                    alt={image.alt}
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                    onClick={() => {
                                      setSelectedImageUrl(image.url);
                                      setShowImageViewer(true);
                                    }}
                                  />
                                )
                              ) : (
                                <Camera className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <p className="p-2 text-sm text-muted-foreground">
                              {image.alt}{" "}
                              {isVideo && (
                                <span className="text-blue-600">(Video)</span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Location on Map</h3>
                  <div className="h-64 rounded-lg overflow-hidden border">
                    <MapContainer
                      center={[
                        selectedReport.coordinates.lat,
                        selectedReport.coordinates.lng,
                      ]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker
                        position={[
                          selectedReport.coordinates.lat,
                          selectedReport.coordinates.lng,
                        ]}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold text-sm">
                              {selectedReport.title}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {selectedReport.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Coordinates:{" "}
                              {selectedReport.coordinates.lat.toFixed(6)},{" "}
                              {selectedReport.coordinates.lng.toFixed(6)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Coordinates: {selectedReport.coordinates.lat.toFixed(6)},{" "}
                      {selectedReport.coordinates.lng.toFixed(6)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps?q=${selectedReport.coordinates.lat},${selectedReport.coordinates.lng}`;
                        window.open(googleMapsUrl, "_blank");
                      }}
                      className="text-xs"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReportDetails(false)}
              >
                Close
              </Button>
              {selectedReport?.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRejectReport(selectedReport.id);
                      setShowReportDetails(false);
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleApproveReport(selectedReport.id);
                      setShowReportDetails(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Viewer Modal */}
        <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
          <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black">
            <div className="relative w-full h-full">
              <img
                src={selectedImageUrl}
                alt="Full size image"
                className="w-full h-full object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageViewer(false)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
