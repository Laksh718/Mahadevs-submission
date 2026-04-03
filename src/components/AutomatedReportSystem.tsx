import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  FileBarChart,
  Download,
  Calendar,
  MapPin,
  Users,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { UserRole, UserProfile } from "../lib/roleBasedAuth";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  requiredRole: UserRole[];
  reportType: "comprehensive" | "summary" | "detailed" | "seasonal";
  frequency: "on-demand" | "weekly" | "monthly" | "quarterly" | "annually";
}

interface ReportData {
  trainingMetrics: {
    totalSessions: number;
    completedSessions: number;
    totalParticipants: number;
    avgCompletionRate: number;
    topPerformingStates: string[];
  };
  volunteerMetrics: {
    totalVolunteers: number;
    activeVolunteers: number;
    avgResponseTime: number;
    specializations: Record<string, number>;
  };
  geoAnalytics: {
    statesCovered: number;
    districtsCovered: number;
    riskZones: number;
    shelterPoints: number;
  };
  impactAnalysis: {
    responseTimeImprovement: number;
    damageReduction: number;
    evacuationSuccess: number;
    communityReadiness: number;
  };
}

export const AutomatedReportSystem: React.FC<{
  userProfile: UserProfile | null;
}> = ({ userProfile }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string>("");

  const reportTemplates: ReportTemplate[] = [
    {
      id: "national_resilience",
      name: "National Resilience Report",
      description:
        "Comprehensive national disaster preparedness analysis with AI insights",
      requiredRole: [UserRole.ADMIN, UserRole.SDMA],
      reportType: "comprehensive",
      frequency: "monthly",
    },
    {
      id: "state_performance",
      name: "State Performance Dashboard",
      description:
        "State-wise training coverage and volunteer density analysis",
      requiredRole: [UserRole.ADMIN, UserRole.SDMA],
      reportType: "detailed",
      frequency: "weekly",
    },
    {
      id: "district_operations",
      name: "District Operations Summary",
      description:
        "District-level training programs and rescue operations overview",
      requiredRole: [UserRole.DDMA, UserRole.SDMA, UserRole.ADMIN],
      reportType: "summary",
      frequency: "weekly",
    },
    {
      id: "ngo_impact",
      name: "NGO Impact Assessment",
      description:
        "NGO training programs effectiveness and community reach analysis",
      requiredRole: [
        UserRole.NGO,
        UserRole.DDMA,
        UserRole.SDMA,
        UserRole.ADMIN,
      ],
      reportType: "detailed",
      frequency: "monthly",
    },
    {
      id: "volunteer_performance",
      name: "Volunteer Performance Report",
      description:
        "Volunteer engagement, training completion, and response metrics",
      requiredRole: [
        UserRole.VOLUNTEER,
        UserRole.NGO,
        UserRole.DDMA,
        UserRole.ADMIN,
      ],
      reportType: "summary",
      frequency: "monthly",
    },
    {
      id: "seasonal_preparedness",
      name: "Seasonal Preparedness Analysis",
      description:
        "Pre-monsoon readiness assessment with gap analysis and recommendations",
      requiredRole: [UserRole.ADMIN, UserRole.SDMA, UserRole.DDMA],
      reportType: "seasonal",
      frequency: "quarterly",
    },
    {
      id: "citizen_engagement",
      name: "Citizen Engagement Metrics",
      description:
        "Community participation, feedback analysis, and awareness levels",
      requiredRole: [
        UserRole.ADMIN,
        UserRole.SDMA,
        UserRole.DDMA,
        UserRole.NGO,
      ],
      reportType: "summary",
      frequency: "monthly",
    },
  ];

  const sampleReportData: ReportData = {
    trainingMetrics: {
      totalSessions: 342,
      completedSessions: 298,
      totalParticipants: 15680,
      avgCompletionRate: 87.1,
      topPerformingStates: [
        "Kerala",
        "Tamil Nadu",
        "Maharashtra",
        "Gujarat",
        "Odisha",
      ],
    },
    volunteerMetrics: {
      totalVolunteers: 8960,
      activeVolunteers: 7420,
      avgResponseTime: 12.4,
      specializations: {
        "Flood Rescue": 2340,
        "First Aid": 1890,
        "Evacuation Coordination": 1560,
        "Community Awareness": 1420,
        "Technical Support": 980,
        "Medical Response": 770,
      },
    },
    geoAnalytics: {
      statesCovered: 28,
      districtsCovered: 456,
      riskZones: 89,
      shelterPoints: 1240,
    },
    impactAnalysis: {
      responseTimeImprovement: 34.6,
      damageReduction: 28.3,
      evacuationSuccess: 91.7,
      communityReadiness: 76.8,
    },
  };

  const generateComprehensiveReport = async (
    template: ReportTemplate
  ): Promise<jsPDF> => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Page 1: Cover Page
    pdf.setFillColor(37, 99, 235); // Blue background
    pdf.rect(0, 0, pageWidth, 60, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text("JalRakshak Intelligence Platform", 20, 30);

    pdf.setFontSize(16);
    pdf.text(template.name, 20, 45);

    // Current date and report info
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 80);
    pdf.text(`Report Type: ${template.reportType.toUpperCase()}`, 20, 90);
    pdf.text(`Frequency: ${template.frequency}`, 20, 100);
    pdf.text(
      `Generated for: ${userProfile?.role} - ${userProfile?.name}`,
      20,
      110
    );

    // Executive Summary Box
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(1);
    pdf.rect(20, 130, pageWidth - 40, 80);

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Executive Summary", 25, 145);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const summaryText = [
      `• Total Training Sessions: ${sampleReportData.trainingMetrics.totalSessions} (${sampleReportData.trainingMetrics.completedSessions} completed)`,
      `• Participants Trained: ${sampleReportData.trainingMetrics.totalParticipants.toLocaleString()}`,
      `• Geographic Coverage: ${sampleReportData.geoAnalytics.statesCovered} states, ${sampleReportData.geoAnalytics.districtsCovered} districts`,
      `• Active Volunteers: ${sampleReportData.volunteerMetrics.activeVolunteers.toLocaleString()}`,
      `• Response Time Improvement: ${sampleReportData.impactAnalysis.responseTimeImprovement}%`,
      `• Community Readiness Score: ${sampleReportData.impactAnalysis.communityReadiness}%`,
    ];

    summaryText.forEach((line, index) => {
      pdf.text(line, 25, 160 + index * 8);
    });

    // Page 2: Training Analytics
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Training Program Analysis", 20, 30);

    // Training metrics table
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Training Sessions Overview", 20, 50);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const trainingData = [
      ["Metric", "Value", "Status"],
      [
        "Total Sessions Conducted",
        sampleReportData.trainingMetrics.totalSessions.toString(),
        "Active",
      ],
      [
        "Sessions Completed",
        sampleReportData.trainingMetrics.completedSessions.toString(),
        "Success",
      ],
      [
        "Average Completion Rate",
        `${sampleReportData.trainingMetrics.avgCompletionRate}%`,
        "Good",
      ],
      [
        "Total Participants",
        sampleReportData.trainingMetrics.totalParticipants.toLocaleString(),
        "Growing",
      ],
      [
        "Participants per Session",
        Math.round(
          sampleReportData.trainingMetrics.totalParticipants /
            sampleReportData.trainingMetrics.totalSessions
        ).toString(),
        "Optimal",
      ],
    ];

    let yPos = 65;
    trainingData.forEach((row, index) => {
      if (index === 0) {
        pdf.setFillColor(59, 130, 246);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
      } else {
        const fillColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
        pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
      }

      pdf.rect(20, yPos - 5, 50, 10, "F");
      pdf.rect(70, yPos - 5, 70, 10, "F");
      pdf.rect(140, yPos - 5, 40, 10, "F");

      pdf.text(row[0], 22, yPos);
      pdf.text(row[1], 72, yPos);
      pdf.text(row[2], 142, yPos);

      yPos += 12;
    });

    // Top Performing States
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Top Performing States", 20, yPos + 20);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    sampleReportData.trainingMetrics.topPerformingStates.forEach(
      (state, index) => {
        pdf.text(`${index + 1}. ${state}`, 25, yPos + 35 + index * 8);
      }
    );

    // Page 3: Geographic Coverage
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Geographic Coverage Analysis", 20, 30);

    const geoData = [
      ["Coverage Area", "Count", "Percentage"],
      [
        "States Covered",
        sampleReportData.geoAnalytics.statesCovered.toString(),
        `${Math.round(
          (sampleReportData.geoAnalytics.statesCovered / 28) * 100
        )}%`,
      ],
      [
        "Districts Covered",
        sampleReportData.geoAnalytics.districtsCovered.toString(),
        `${Math.round(
          (sampleReportData.geoAnalytics.districtsCovered / 766) * 100
        )}%`,
      ],
      [
        "Risk Zones Monitored",
        sampleReportData.geoAnalytics.riskZones.toString(),
        "100%",
      ],
      [
        "Shelter Points Active",
        sampleReportData.geoAnalytics.shelterPoints.toString(),
        "98%",
      ],
      ["Evacuation Routes", "1,240", "95%"],
    ];

    yPos = 55;
    geoData.forEach((row, index) => {
      if (index === 0) {
        pdf.setFillColor(59, 130, 246);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
      } else {
        const fillColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
        pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
      }

      pdf.rect(20, yPos - 5, 80, 10, "F");
      pdf.rect(100, yPos - 5, 40, 10, "F");
      pdf.rect(140, yPos - 5, 40, 10, "F");

      pdf.text(row[0], 22, yPos);
      pdf.text(row[1], 102, yPos);
      pdf.text(row[2], 142, yPos);

      yPos += 12;
    });

    // Page 4: Impact Analysis
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Impact Assessment & ROI Analysis", 20, 30);

    const impactData = [
      ["Impact Metric", "Improvement", "Target", "Status"],
      [
        "Response Time",
        `+${sampleReportData.impactAnalysis.responseTimeImprovement}%`,
        "30%",
        "✓ Exceeded",
      ],
      [
        "Damage Reduction",
        `+${sampleReportData.impactAnalysis.damageReduction}%`,
        "25%",
        "✓ Achieved",
      ],
      [
        "Evacuation Success",
        `${sampleReportData.impactAnalysis.evacuationSuccess}%`,
        "90%",
        "✓ Achieved",
      ],
      [
        "Community Readiness",
        `${sampleReportData.impactAnalysis.communityReadiness}%`,
        "80%",
        "○ In Progress",
      ],
      ["Volunteer Response Rate", "94.3%", "85%", "✓ Exceeded"],
    ];

    yPos = 55;
    impactData.forEach((row, index) => {
      if (index === 0) {
        pdf.setFillColor(59, 130, 246);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
      } else {
        const fillColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
        pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
      }

      pdf.rect(20, yPos - 5, 60, 10, "F");
      pdf.rect(80, yPos - 5, 35, 10, "F");
      pdf.rect(115, yPos - 5, 30, 10, "F");
      pdf.rect(145, yPos - 5, 35, 10, "F");

      pdf.text(row[0], 22, yPos);
      pdf.text(row[1], 82, yPos);
      pdf.text(row[2], 117, yPos);
      pdf.text(row[3], 147, yPos);

      yPos += 12;
    });

    // Page 5: Recommendations
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Strategic Recommendations", 20, 30);

    const recommendations = [
      {
        priority: "High",
        area: "Training Coverage",
        recommendation:
          "Expand training programs in Northeastern states by 40%",
        timeline: "3 months",
        impact: "High",
      },
      {
        priority: "High",
        area: "Volunteer Recruitment",
        recommendation:
          "Launch targeted volunteer recruitment in rural districts",
        timeline: "6 months",
        impact: "Medium",
      },
      {
        priority: "Medium",
        area: "Technology Integration",
        recommendation: "Implement AI-driven early warning system integration",
        timeline: "12 months",
        impact: "High",
      },
      {
        priority: "Medium",
        area: "Community Engagement",
        recommendation: "Enhance citizen feedback mechanisms and gamification",
        timeline: "4 months",
        impact: "Medium",
      },
    ];

    yPos = 50;
    pdf.setFontSize(10);
    recommendations.forEach((rec, index) => {
      const bgColor =
        rec.priority === "High" ? [254, 226, 226] : [254, 249, 195];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(20, yPos - 5, pageWidth - 40, 35, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${index + 1}. ${rec.area}`, 25, yPos + 5);

      pdf.setFont("helvetica", "normal");
      pdf.text(`Priority: ${rec.priority}`, 25, yPos + 15);
      pdf.text(`Timeline: ${rec.timeline}`, 100, yPos + 15);
      pdf.text(`Impact: ${rec.impact}`, 150, yPos + 15);

      // Word wrap for recommendation text
      const words = rec.recommendation.split(" ");
      let line = "";
      let lineY = yPos + 25;

      words.forEach((word) => {
        const testLine = line + word + " ";
        const testWidth =
          (pdf.getStringUnitWidth(testLine) * 10) / pdf.internal.scaleFactor;

        if (testWidth > pageWidth - 50 && line !== "") {
          pdf.text(line.trim(), 25, lineY);
          line = word + " ";
          lineY += 8;
        } else {
          line = testLine;
        }
      });

      if (line.trim() !== "") {
        pdf.text(line.trim(), 25, lineY);
      }

      yPos += 45;
    });

    // Footer on each page
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `JalRakshak Intelligence Platform - ${template.name}`,
        20,
        pageHeight - 15
      );
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 15);
      pdf.text(
        `Generated: ${new Date().toLocaleString()}`,
        20,
        pageHeight - 10
      );
      pdf.text(
        "Confidential - For Authorized Personnel Only",
        pageWidth - 80,
        pageHeight - 10
      );
    }

    return pdf;
  };

  const generateReport = async (templateId: string, format: "pdf" | "csv") => {
    const template = reportTemplates.find((t) => t.id === templateId);
    if (!template) return;

    setGenerating(true);

    try {
      if (format === "pdf") {
        const pdf = await generateComprehensiveReport(template);
        pdf.save(
          `${template.name.replace(/\s+/g, "_")}_${
            new Date().toISOString().split("T")[0]
          }.pdf`
        );
      } else {
        // Generate CSV report
        const csvContent = generateCSVReport(template);
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${template.name.replace(/\s+/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setLastGenerated(new Date().toLocaleString());
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGenerating(false);
    }
  };

  const generateCSVReport = (template: ReportTemplate): string => {
    const headers = ["Metric", "Value", "Category", "Status"];
    const rows = [
      [
        "Total Training Sessions",
        sampleReportData.trainingMetrics.totalSessions.toString(),
        "Training",
        "Active",
      ],
      [
        "Completed Sessions",
        sampleReportData.trainingMetrics.completedSessions.toString(),
        "Training",
        "Completed",
      ],
      [
        "Total Participants",
        sampleReportData.trainingMetrics.totalParticipants.toString(),
        "Training",
        "Engaged",
      ],
      [
        "Completion Rate",
        `${sampleReportData.trainingMetrics.avgCompletionRate}%`,
        "Training",
        "Good",
      ],
      [
        "Active Volunteers",
        sampleReportData.volunteerMetrics.activeVolunteers.toString(),
        "Volunteers",
        "Active",
      ],
      [
        "Response Time Improvement",
        `${sampleReportData.impactAnalysis.responseTimeImprovement}%`,
        "Impact",
        "Improved",
      ],
      [
        "States Covered",
        sampleReportData.geoAnalytics.statesCovered.toString(),
        "Geography",
        "Covered",
      ],
      [
        "Districts Covered",
        sampleReportData.geoAnalytics.districtsCovered.toString(),
        "Geography",
        "Covered",
      ],
      [
        "Community Readiness",
        `${sampleReportData.impactAnalysis.communityReadiness}%`,
        "Impact",
        "Improving",
      ],
    ];

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  // Filter templates based on user role
  const availableTemplates = reportTemplates.filter(
    (template) =>
      userProfile && template.requiredRole.includes(userProfile.role)
  );

  const scheduleAutomatedReport = (templateId: string) => {
    // This would integrate with a scheduling service
    console.log(`Scheduling automated report for template: ${templateId}`);
    // Implementation would depend on backend scheduling system
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <FileBarChart className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            JalRakshak Automated Reporting
          </h1>
        </div>
        <p className="text-gray-600">
          Multi-role report generation with AI insights and automated scheduling
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Templates */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <Badge
                        variant={
                          template.reportType === "comprehensive"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {template.reportType}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-600 mb-3">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-500">
                          {template.frequency}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {template.requiredRole
                          .slice(0, 2)
                          .map((role, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))}
                        {template.requiredRole.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{template.requiredRole.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Reports */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Generate Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => generateReport(selectedTemplate, "pdf")}
                      disabled={generating}
                      className="flex items-center space-x-2"
                    >
                      {generating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span>Generate PDF Report</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => generateReport(selectedTemplate, "csv")}
                      disabled={generating}
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export CSV Data</span>
                    </Button>
                  </div>

                  {lastGenerated && (
                    <p className="text-sm text-green-600 flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Last generated: {lastGenerated}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Report Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {sampleReportData.trainingMetrics.totalSessions}
                  </div>
                  <div className="text-xs text-gray-600">Training Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sampleReportData.volunteerMetrics.activeVolunteers.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Active Volunteers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {sampleReportData.geoAnalytics.statesCovered}
                  </div>
                  <div className="text-xs text-gray-600">States Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {sampleReportData.impactAnalysis.communityReadiness}%
                  </div>
                  <div className="text-xs text-gray-600">Readiness Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full flex items-center justify-start space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule Monthly Report</span>
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-start space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Export Map Screenshots</span>
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-start space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Generate Trend Analysis</span>
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-start space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Emergency Report Template</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Sync Status</span>
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Report Generation</span>
                <Badge variant="secondary">
                  {generating ? "Processing..." : "Ready"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Last Data Update</span>
                <span className="text-xs text-gray-600">2 minutes ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
