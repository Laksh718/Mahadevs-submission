import React, { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FileText,
  Download,
  Filter,
  Search,
  Calendar,
  MapPin,
  Users,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Eye,
  Share,
  Printer,
  Settings,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getTrainingAnalytics,
  getCoverageAnalytics,
  getTrainingSessionsWithDetails,
  getParticipantDemographics,
  getTrainingSessions,
  getTrainingPartners,
} from "@/lib/trainingService";

interface ReportData {
  id: string;
  title: string;
  type: "summary" | "detailed" | "analytics" | "compliance";
  status: "completed" | "pending" | "in-progress" | "failed";
  createdDate: string;
  generatedDate: string;
  scope: string;
  format: "pdf" | "excel" | "csv" | "json";
  size: string;
  participants: number;
  sessions: number;
  completion: number;
  regions: string[];
  themes: string[];
  period: string;
  accessibility: boolean;
}

interface TrainingMetrics {
  totalSessions: number;
  totalParticipants: number;
  averageCompletion: number;
  budgetUtilization: number;
  geographicCoverage: number;
  satisfactionScore: number;
  impactRating: number;
  complianceScore: number;
}

const TrainingReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [selectedReportType, setSelectedReportType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortBy, setSortBy] = useState("createdDate");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [analytics, coverage] = await Promise.all([
        getTrainingAnalytics(),
        getCoverageAnalytics(),
      ]);

      // Calculate metrics
      const calculatedMetrics: TrainingMetrics = {
        totalSessions: analytics.totalSessions,
        totalParticipants: analytics.totalParticipants,
        averageCompletion:
          (analytics.completedSessions / analytics.totalSessions) * 100,
        budgetUtilization: Math.random() * 20 + 80, // Mock budget utilization
        geographicCoverage: (coverage.statesCovered.length / 28) * 100, // 28 states in India
        satisfactionScore: Math.random() * 20 + 80, // Mock satisfaction score
        impactRating: Math.random() * 25 + 75, // Mock impact rating
        complianceScore: Math.random() * 15 + 85, // Mock compliance score
      };
      setMetrics(calculatedMetrics);

      // Generate mock reports data
      const mockReports: ReportData[] = [
        {
          id: "RPT-001",
          title: "Q3 2024 Training Summary Report",
          type: "summary",
          status: "completed",
          createdDate: "2024-10-15",
          generatedDate: "2024-10-16",
          scope: "National",
          format: "pdf",
          size: "2.4 MB",
          participants: 1250,
          sessions: 45,
          completion: 87.5,
          regions: ["North", "South", "East", "West"],
          themes: ["Disaster Management", "Emergency Response"],
          period: "Q3 2024",
          accessibility: true,
        },
        {
          id: "RPT-002",
          title: "State-wise Training Analytics",
          type: "analytics",
          status: "completed",
          createdDate: "2024-10-10",
          generatedDate: "2024-10-12",
          scope: "Multi-State",
          format: "excel",
          size: "5.1 MB",
          participants: 890,
          sessions: 32,
          completion: 92.3,
          regions: ["Maharashtra", "Karnataka", "Tamil Nadu"],
          themes: ["Community Training", "Risk Assessment"],
          period: "Sep 2024",
          accessibility: true,
        },
        {
          id: "RPT-003",
          title: "Compliance Assessment Report",
          type: "compliance",
          status: "in-progress",
          createdDate: "2024-10-18",
          generatedDate: "",
          scope: "National",
          format: "pdf",
          size: "",
          participants: 0,
          sessions: 0,
          completion: 0,
          regions: ["All States"],
          themes: ["Regulatory Compliance", "Training Standards"],
          period: "Oct 2024",
          accessibility: false,
        },
        {
          id: "RPT-004",
          title: "Training Impact Analysis",
          type: "detailed",
          status: "completed",
          createdDate: "2024-10-05",
          generatedDate: "2024-10-08",
          scope: "Regional",
          format: "csv",
          size: "1.8 MB",
          participants: 560,
          sessions: 28,
          completion: 78.9,
          regions: ["Northern Region"],
          themes: ["Flood Management", "Evacuation Planning"],
          period: "Aug-Sep 2024",
          accessibility: true,
        },
        {
          id: "RPT-005",
          title: "Budget Utilization Report",
          type: "summary",
          status: "pending",
          createdDate: "2024-10-20",
          generatedDate: "",
          scope: "National",
          format: "excel",
          size: "",
          participants: 0,
          sessions: 0,
          completion: 0,
          regions: ["All States"],
          themes: ["Budget Analysis", "Cost Effectiveness"],
          period: "Q3 2024",
          accessibility: false,
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    setIsGeneratingReport(true);

    try {
      // Fetch comprehensive training data
      const [analytics, coverage, participantDemographics] = await Promise.all([
        getTrainingAnalytics(),
        getCoverageAnalytics(),
        getParticipantDemographics?.() || Promise.resolve(null),
      ]);

      // Create new jsPDF instance
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let currentY = 20;

      // Helper function to add page break if needed
      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }
      };

      // === PAGE 1: COVER PAGE ===
      // JanRakshak Header
      pdf.setFillColor(37, 99, 235); // Blue background
      pdf.rect(0, 0, pageWidth, 60, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      pdf.text("JanRakshak", pageWidth / 2, 30, { align: "center" });

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "National Disaster Management Training System",
        pageWidth / 2,
        45,
        { align: "center" }
      );

      currentY = 80;
      pdf.setTextColor(0, 0, 0);

      // Report Title
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        "Comprehensive Training Analytics Report",
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      currentY += 20;

      // Report Details
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const reportDate = new Date().toLocaleDateString("en-IN");
      const reportTime = new Date().toLocaleTimeString("en-IN");

      pdf.text(
        `Generated on: ${reportDate} at ${reportTime}`,
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      currentY += 10;
      pdf.text(
        `Report Period: ${new Date().getFullYear()}`,
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      currentY += 30;

      // Executive Summary Box
      pdf.setFillColor(240, 245, 255);
      pdf.rect(20, currentY, pageWidth - 40, 60, "F");
      pdf.setDrawColor(37, 99, 235);
      pdf.rect(20, currentY, pageWidth - 40, 60, "S");

      currentY += 15;
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Executive Summary", pageWidth / 2, currentY, {
        align: "center",
      });

      currentY += 12;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const summaryText = [
        `• Total Training Sessions Conducted: ${analytics.totalSessions}`,
        `• Total Participants Trained: ${analytics.totalParticipants?.toLocaleString()}`,
        `• States/UTs Covered: ${coverage.statesCovered?.length || 28}`,
        `• Completion Rate: ${(
          (analytics.completedSessions / analytics.totalSessions) *
          100
        ).toFixed(1)}%`,
        `• Average Session Duration: ${
          analytics.averageDuration?.toFixed(1) || "N/A"
        } hours`,
        `• Budget Utilization: ${
          metrics?.budgetUtilization?.toFixed(1) || "N/A"
        }%`,
      ];

      summaryText.forEach((text) => {
        pdf.text(text, 25, currentY);
        currentY += 5;
      });

      // === PAGE 2: DETAILED ANALYTICS ===
      pdf.addPage();
      currentY = 20;

      // Page Header
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Training Analytics Overview", 20, currentY);
      currentY += 15;

      // Training Sessions Analysis
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("1. Training Sessions Analysis", 20, currentY);
      currentY += 10;

      // Create table data for sessions
      const sessionData = [
        ["Metric", "Value", "Percentage"],
        ["Total Sessions", analytics.totalSessions.toString(), "100%"],
        [
          "Completed Sessions",
          analytics.completedSessions.toString(),
          `${(
            (analytics.completedSessions / analytics.totalSessions) *
            100
          ).toFixed(1)}%`,
        ],
        [
          "Ongoing Sessions",
          (analytics.totalSessions - analytics.completedSessions).toString(),
          `${(
            ((analytics.totalSessions - analytics.completedSessions) /
              analytics.totalSessions) *
            100
          ).toFixed(1)}%`,
        ],
        [
          "Average Participants per Session",
          Math.round(
            analytics.totalParticipants / analytics.totalSessions
          ).toString(),
          "-",
        ],
        [
          "Total Training Hours",
          (analytics.totalSessions * (analytics.averageDuration || 24)).toFixed(
            0
          ),
          "-",
        ],
      ];

      // Draw table
      let tableY = currentY;
      const colWidths = [60, 40, 30];
      const rowHeight = 8;

      sessionData.forEach((row, rowIndex) => {
        let cellX = 20;
        row.forEach((cell, colIndex) => {
          // Header row styling
          if (rowIndex === 0) {
            pdf.setFillColor(37, 99, 235);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
          } else {
            if (rowIndex % 2 === 0) {
              pdf.setFillColor(248, 250, 252);
            } else {
              pdf.setFillColor(255, 255, 255);
            }
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "normal");
          }

          pdf.rect(cellX, tableY, colWidths[colIndex], rowHeight, "FD");
          pdf.setFontSize(9);
          pdf.text(cell, cellX + 2, tableY + 5);
          cellX += colWidths[colIndex];
        });
        tableY += rowHeight;
      });

      currentY = tableY + 10;

      // Geographic Coverage
      checkPageBreak(60);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("2. Geographic Coverage Analysis", 20, currentY);
      currentY += 10;

      // States coverage data
      const topStates = coverage.statesCovered?.slice(0, 8) || [];
      if (topStates.length > 0) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        const stateTableData = [
          ["State", "Sessions", "Participants", "Coverage %"],
        ];
        topStates.forEach((state) => {
          const coveragePercent = (
            (state.sessionCount / analytics.totalSessions) *
            100
          ).toFixed(1);
          stateTableData.push([
            state.state,
            state.sessionCount.toString(),
            state.participantCount.toString(),
            `${coveragePercent}%`,
          ]);
        });

        // Draw states table
        tableY = currentY;
        const stateColWidths = [45, 25, 35, 25];

        stateTableData.forEach((row, rowIndex) => {
          let cellX = 20;
          row.forEach((cell, colIndex) => {
            if (rowIndex === 0) {
              pdf.setFillColor(37, 99, 235);
              pdf.setTextColor(255, 255, 255);
              pdf.setFont("helvetica", "bold");
            } else {
              if (rowIndex % 2 === 0) {
                pdf.setFillColor(248, 250, 252);
              } else {
                pdf.setFillColor(255, 255, 255);
              }
              pdf.setTextColor(0, 0, 0);
              pdf.setFont("helvetica", "normal");
            }

            pdf.rect(cellX, tableY, stateColWidths[colIndex], rowHeight, "FD");
            pdf.setFontSize(8);
            pdf.text(cell, cellX + 2, tableY + 5);
            cellX += stateColWidths[colIndex];
          });
          tableY += rowHeight;
        });

        currentY = tableY + 15;
      }

      // === PAGE 3: PARTNER ANALYSIS ===
      checkPageBreak(100);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("3. Training Partners Analysis", 20, currentY);
      currentY += 10;

      const partnerTypes =
        coverage.partnersCovered?.reduce((acc: any, partner) => {
          acc[partner.partnerType] =
            (acc[partner.partnerType] || 0) + partner.sessionCount;
          return acc;
        }, {}) || {};

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const partnerTableData = [["Partner Type", "Sessions", "Percentage"]];
      Object.entries(partnerTypes).forEach(
        ([type, sessions]: [string, any]) => {
          const percentage = (
            (sessions / analytics.totalSessions) *
            100
          ).toFixed(1);
          partnerTableData.push([type, sessions.toString(), `${percentage}%`]);
        }
      );

      // Draw partner table
      tableY = currentY;
      const partnerColWidths = [60, 30, 30];

      partnerTableData.forEach((row, rowIndex) => {
        let cellX = 20;
        row.forEach((cell, colIndex) => {
          if (rowIndex === 0) {
            pdf.setFillColor(37, 99, 235);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
          } else {
            if (rowIndex % 2 === 0) {
              pdf.setFillColor(248, 250, 252);
            } else {
              pdf.setFillColor(255, 255, 255);
            }
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "normal");
          }
          pdf.rect(cellX, tableY, partnerColWidths[colIndex], rowHeight, "FD");
          pdf.setFontSize(9);
          pdf.text(cell, cellX + 2, tableY + 5);
          cellX += partnerColWidths[colIndex];
        });
        tableY += rowHeight;
      });

      currentY = tableY + 15;

      // === PAGE 4: BUDGET AND PERFORMANCE ===
      checkPageBreak(100);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("4. Budget Utilization and Performance Metrics", 20, currentY);
      currentY += 10;

      // Budget analysis
      const budgetData = [
        ["Metric", "Amount (INR)", "Status"],
        ["Total Allocated Budget", "₹ 2,50,00,000", "100%"],
        [
          "Amount Utilized",
          `₹ ${(analytics.totalBudget || 2.1e7).toLocaleString()}`,
          `${metrics?.budgetUtilization?.toFixed(1) || 84}%`,
        ],
        [
          "Average Cost per Session",
          `₹ ${Math.round(
            (analytics.totalBudget || 2.1e7) / analytics.totalSessions
          ).toLocaleString()}`,
          "-",
        ],
        [
          "Cost per Participant",
          `₹ ${Math.round(
            (analytics.totalBudget || 2.1e7) / analytics.totalParticipants
          ).toLocaleString()}`,
          "-",
        ],
      ];

      // Draw budget table
      tableY = currentY;
      const budgetColWidths = [60, 45, 25];

      budgetData.forEach((row, rowIndex) => {
        let cellX = 20;
        row.forEach((cell, colIndex) => {
          if (rowIndex === 0) {
            pdf.setFillColor(37, 99, 235);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
          } else {
            if (rowIndex % 2 === 0) {
              pdf.setFillColor(248, 250, 252);
            } else {
              pdf.setFillColor(255, 255, 255);
            }
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "normal");
          }

          pdf.rect(cellX, tableY, budgetColWidths[colIndex], rowHeight, "FD");
          pdf.setFontSize(9);
          pdf.text(cell, cellX + 2, tableY + 5);
          cellX += budgetColWidths[colIndex];
        });
        tableY += rowHeight;
      });

      currentY = tableY + 20;

      // === PAGE 5: RECOMMENDATIONS ===
      checkPageBreak(80);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("5. Key Insights and Recommendations", 20, currentY);
      currentY += 15;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const recommendations = [
        "• Excellent training completion rate indicates strong program effectiveness",
        "• Geographic distribution shows good national coverage across states",
        "• Budget utilization is within acceptable parameters and cost-effective",
        "• Partner diversity ensures comprehensive expertise and reach",
        "• Recommend expanding online training programs for broader accessibility",
        "• Consider increasing focus on high-risk disaster-prone regions",
        "• Strengthen partnerships with private sector for enhanced resources",
        "• Implement advanced analytics for predictive training needs assessment",
      ];

      recommendations.forEach((recommendation) => {
        checkPageBreak(10);
        pdf.text(recommendation, 20, currentY, { maxWidth: pageWidth - 40 });
        currentY += 8;
      });

      // === FOOTER ON LAST PAGE ===
      currentY = pageHeight - 30;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, currentY, pageWidth, 30, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "© 2024 JanRakshak - National Disaster Management Training System",
        pageWidth / 2,
        currentY + 15,
        { align: "center" }
      );
      pdf.text(
        "This report contains confidential information for authorized personnel only",
        pageWidth / 2,
        currentY + 22,
        { align: "center" }
      );

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `JanRakshak_Comprehensive_Training_Report_${timestamp}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error("Error generating comprehensive PDF:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const exportDetailedSessionReport = async () => {
    setIsGeneratingReport(true);

    try {
      // Fetch session data
      const sessions = (await getTrainingSessions?.()) || [];
      const partners = (await getTrainingPartners?.()) || [];

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let currentY = 20;

      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }
      };

      // Header
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 50, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text("JanRakshak", pageWidth / 2, 25, { align: "center" });

      pdf.setFontSize(12);
      pdf.text("Detailed Training Sessions Report", pageWidth / 2, 38, {
        align: "center",
      });

      currentY = 65;
      pdf.setTextColor(0, 0, 0);

      // Report Info
      pdf.setFontSize(10);
      pdf.text(
        `Generated: ${new Date().toLocaleDateString(
          "en-IN"
        )} ${new Date().toLocaleTimeString("en-IN")}`,
        20,
        currentY
      );
      pdf.text(`Total Sessions: ${sessions.length}`, pageWidth - 60, currentY);
      currentY += 15;

      // Sessions Details
      sessions.slice(0, 20).forEach((session, index) => {
        checkPageBreak(50);

        // Session header
        pdf.setFillColor(240, 245, 255);
        pdf.rect(20, currentY - 5, pageWidth - 40, 35, "F");

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. ${session.title}`, 25, currentY + 5);

        currentY += 12;
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");

        const partner = partners.find((p) => p.id === session.partner_id);
        const sessionDetails = [
          `Partner: ${partner?.name || "N/A"}`,
          `Location: ${session.district}, ${session.state}`,
          `Venue: ${session.venue || "N/A"}`,
          `Duration: ${new Date(
            session.start_date
          ).toLocaleDateString()} - ${new Date(
            session.end_date
          ).toLocaleDateString()}`,
          `Mode: ${session.training_mode} | Status: ${session.status}`,
          `Participants: ${
            session.actual_participants || session.expected_participants || 0
          } | Budget: ₹${(session.budget_allocated || 0).toLocaleString()}`,
        ];

        sessionDetails.forEach((detail) => {
          pdf.text(detail, 25, currentY);
          currentY += 4;
        });

        if (session.description) {
          currentY += 2;
          pdf.setFont("helvetica", "italic");
          const splitDescription = pdf.splitTextToSize(
            session.description,
            pageWidth - 50
          );
          pdf.text(splitDescription, 25, currentY);
          currentY += splitDescription.length * 4;
        }

        currentY += 8;
      });

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, footerY, pageWidth, 15, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(
        "© 2024 JanRakshak - Confidential Training Sessions Report",
        pageWidth / 2,
        footerY + 8,
        { align: "center" }
      );

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      pdf.save(`JanRakshak_Detailed_Sessions_Report_${timestamp}.pdf`);
    } catch (error) {
      console.error("Error generating detailed session report:", error);
      alert("Error generating detailed report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesType =
      selectedReportType === "all" || report.type === selectedReportType;
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const generateNewReport = async (type: string, format: string) => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newReport: ReportData = {
        id: `RPT-${String(reports.length + 1).padStart(3, "0")}`,
        title: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } Report - ${new Date().toLocaleDateString()}`,
        type: type as any,
        status: "completed",
        createdDate: new Date().toISOString().split("T")[0],
        generatedDate: new Date().toISOString().split("T")[0],
        scope: "National",
        format: format as any,
        size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
        participants: Math.floor(Math.random() * 1000) + 100,
        sessions: Math.floor(Math.random() * 50) + 10,
        completion: Math.random() * 20 + 80,
        regions: ["All Regions"],
        themes: ["Generated Report"],
        period: "Current",
        accessibility: true,
      };

      setReports((prev) => [newReport, ...prev]);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const downloadReport = (report: ReportData) => {
    // Simulate download
    const link = document.createElement("a");
    link.href = `#`;
    link.download = `${report.id}_${report.title}.${report.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareReport = (report: ReportData) => {
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: `Training Report: ${report.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(
        `${report.title} - ${window.location.href}`
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      case "pending":
        return "outline";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Reports Header & Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Training Reports Dashboard
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isGeneratingReport}>
                  {isGeneratingReport ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Comprehensive Analytics Report (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportDetailedSessionReport}>
                  <FileText className="w-4 h-4 mr-2" />
                  Download Detailed Session Report (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => generateNewReport("summary", "pdf")}
                >
                  Generate Summary Report (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => generateNewReport("analytics", "excel")}
                >
                  Generate Analytics Report (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => generateNewReport("detailed", "csv")}
                >
                  Generate Detailed Report (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => generateNewReport("compliance", "pdf")}
                >
                  Generate Compliance Report (PDF)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.totalSessions}
                </div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.totalParticipants.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.averageCompletion.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Avg Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.geographicCoverage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Coverage</div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select
              value={selectedReportType}
              onValueChange={setSelectedReportType}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Reports List</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Report Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Reports List */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Reports ({filteredReports.length})</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {reports.filter((r) => r.status === "completed").length}{" "}
                    completed
                  </Badge>
                  <Badge variant="secondary">
                    {reports.filter((r) => r.status === "in-progress").length}{" "}
                    in progress
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Metrics</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-gray-600">
                            {report.id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Created:{" "}
                            {new Date(report.createdDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {report.format.toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <Badge variant={getStatusBadgeVariant(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{report.period}</div>
                        {report.generatedDate && (
                          <div className="text-xs text-gray-500">
                            Generated:{" "}
                            {new Date(
                              report.generatedDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{report.scope}</div>
                        <div className="text-xs text-gray-500">
                          {report.regions.slice(0, 2).join(", ")}
                          {report.regions.length > 2 &&
                            ` +${report.regions.length - 2}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.status === "completed" && (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span className="text-xs">
                                {report.participants}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="w-3 h-3" />
                              <span className="text-xs">{report.sessions}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3" />
                              <span className="text-xs">
                                {report.completion.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {report.status === "completed" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadReport(report)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => shareReport(report)}
                              >
                                <Share className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "Executive Summary",
                icon: BarChart3,
                description: "High-level overview for leadership",
              },
              {
                name: "Training Analytics",
                icon: PieChart,
                description: "Detailed statistical analysis",
              },
              {
                name: "Compliance Report",
                icon: Award,
                description: "Regulatory compliance assessment",
              },
              {
                name: "Performance Dashboard",
                icon: Activity,
                description: "KPI tracking and trends",
              },
              {
                name: "Impact Assessment",
                icon: TrendingUp,
                description: "Training effectiveness analysis",
              },
              {
                name: "Budget Report",
                icon: FileText,
                description: "Financial utilization overview",
              },
            ].map((template, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <template.icon className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Report Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Generation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Summary", "Analytics", "Detailed", "Compliance"].map(
                    (type, index) => {
                      const count = reports.filter(
                        (r) => r.type === type.toLowerCase()
                      ).length;
                      const percentage = (count / reports.length) * 100;
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              {type} Reports
                            </span>
                            <span className="text-sm text-gray-600">
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Quality Score</span>
                      <Badge variant="default">
                        {metrics.complianceScore.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Report Accuracy</span>
                      <Badge variant="default">95.8%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Generation Speed</span>
                      <Badge variant="secondary">2.3 sec avg</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Satisfaction</span>
                      <Badge variant="default">
                        {metrics.satisfactionScore.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scheduled Reports */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Scheduled Reports</span>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  New Schedule
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Weekly Summary",
                    frequency: "Every Monday",
                    next: "2024-10-28",
                    type: "summary",
                  },
                  {
                    name: "Monthly Analytics",
                    frequency: "1st of each month",
                    next: "2024-11-01",
                    type: "analytics",
                  },
                  {
                    name: "Quarterly Review",
                    frequency: "Every quarter",
                    next: "2024-12-31",
                    type: "detailed",
                  },
                ].map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{schedule.name}</h4>
                      <p className="text-sm text-gray-600">
                        {schedule.frequency}
                      </p>
                      <p className="text-xs text-gray-500">
                        Next: {schedule.next}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{schedule.type}</Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingReportsDashboard;
