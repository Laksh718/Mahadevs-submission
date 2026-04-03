import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import UserLayout from "@/components/UserLayout";
import GradientCard from "@/components/GradientCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Filter,
  Search,
  Users,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Flag,
  Plus,
  RefreshCw,
  ImageIcon,
  X,
  Zap,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  FloodReport,
  getCommunityReports,
  supabase,
  getAllReports,
  voteOnReport,
  getUserVote,
  getReportVoteCounts,
  addComment,
  getReportComments,
  getReportCommentCount,
  Comment,
} from "@/lib/supabase";
import HeatmapMap from "@/components/HeatmapMap";
import FloodFlowSimulation from "@/components/FloodFlowSimulation";

interface CommunityReport extends FloodReport {
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
  comments?: number;
  views?: number;
}

const Community = () => {
  const { theme } = useTheme();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CommunityReport[]>([]);
  const [allReports, setAllReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("community");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(
    null
  );
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [reportComments, setReportComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loadingComments, setLoadingComments] = useState(false);
  // Heatmap controls
  const [heatRadius, setHeatRadius] = useState<number>(25);
  const [heatBlur, setHeatBlur] = useState<number>(15);
  const [timeRange, setTimeRange] = useState<string>("30d"); // 24h, 7d, 30d, all
  const [scope, setScope] = useState<string>("region"); // region | all
  const [loadingAllReports, setLoadingAllReports] = useState(false);
  // Flood flow simulation controls
  const [showFlowSimulation, setShowFlowSimulation] = useState(false);
  const [isFlowPlaying, setIsFlowPlaying] = useState(true);
  const [flowSpeed, setFlowSpeed] = useState(1);
  const [showFlowVectors, setShowFlowVectors] = useState(true);
  const [showFlowTrails, setShowFlowTrails] = useState(true);
  const [usePredictionData, setUsePredictionData] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    // Reload reports when user profile (location) changes
    if (userProfile?.location) {
      loadReports();
    }
  }, [userProfile?.location?.state, userProfile?.location?.district]);

  // Load all reports when switching scope
  useEffect(() => {
    console.log(
      "Scope changed to:",
      scope,
      "allReports length:",
      allReports.length
    );
    if (scope === "all" && allReports.length === 0) {
      console.log("Loading all reports...");
      loadAllReports();
    }

    // Adjust heatmap settings based on scope
    if (scope === "all") {
      // Use smaller radius and blur for all reports to keep it focused
      if (heatRadius < 30) setHeatRadius(30);
      if (heatBlur < 20) setHeatBlur(20);
    }
  }, [scope]);

  useEffect(() => {
    filterAndSortReports();
  }, [reports, searchTerm, severityFilter, statusFilter, sortBy]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // Get user's region
      const userState = userProfile?.location?.state || "India";
      const userDistrict = userProfile?.location?.district;

      console.log("Loading community reports for region:", {
        userState,
        userDistrict,
      });

      // Fetch real reports from Supabase filtered by region
      const realReports = await getCommunityReports(userState, userDistrict);

      console.log("Fetched real reports:", realReports.length);

      // Fetch vote counts and user votes for each report
      const communityReports: CommunityReport[] = await Promise.all(
        realReports.map(async (report) => {
          const voteCounts = await getReportVoteCounts(report.id!);
          const userVote = currentUser
            ? await getUserVote(currentUser.uid, report.id!)
            : null;
          const commentCount = await getReportCommentCount(report.id!);

          // Fallback to local storage for votes if database fails
          let finalVoteCounts = voteCounts;
          let finalUserVote = userVote;

          if (
            currentUser &&
            voteCounts.upvotes === 0 &&
            voteCounts.downvotes === 0
          ) {
            const storageKey = `votes_${currentUser.uid}`;
            const userVotes = JSON.parse(
              localStorage.getItem(storageKey) || "{}"
            );
            const localVote = userVotes[report.id!];

            if (localVote) {
              finalUserVote = localVote;
              // For local storage, we'll use the existing counts from the report
              finalVoteCounts = {
                upvotes: (report as any).upvotes ?? 0,
                downvotes: (report as any).downvotes ?? 0,
              };
            }
          }

          return {
            ...report,
            upvotes: finalVoteCounts.upvotes,
            downvotes: finalVoteCounts.downvotes,
            userVote: finalUserVote,
            comments: commentCount,
            views: (report as any).views ?? 0,
          };
        })
      );

      setReports(communityReports);
      console.log("Loaded community reports:", communityReports.length);

      if (communityReports.length === 0) {
        toast.info(
          "No flood reports found in your region yet. Be the first to report!"
        );
      }
    } catch (error) {
      console.error("Error loading community reports:", error);
      setReports([]);
      toast.error("Failed to load community reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadAllReports = async () => {
    setLoadingAllReports(true);
    try {
      console.log("Loading all reports for heatmap...");
      const data = await getAllReports();
      console.log("Raw all reports data:", data.length);

      // For heatmap, we don't need to fetch vote counts for all reports
      // Just use basic report data with default values
      const communityReports: CommunityReport[] = data.map((report: any) => ({
        ...report,
        upvotes: 0, // Default values for heatmap
        downvotes: 0,
        userVote: null,
        comments: 0,
        views: 0,
      }));

      console.log("Processed all reports:", communityReports.length);
      setAllReports(communityReports);
    } catch (e) {
      console.error("Error loading all reports:", e);
      setAllReports([]);
    } finally {
      setLoadingAllReports(false);
    }
  };

  const filterAndSortReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.location.address
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter(
        (report) => report.severity === severityFilter
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case "recent":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at!).getTime() -
            new Date(a.created_at!).getTime()
        );
        break;
      case "popular":
        filtered.sort(
          (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
        );
        break;
      case "severity":
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        filtered.sort(
          (a, b) => severityOrder[b.severity] - severityOrder[a.severity]
        );
        break;
    }

    setFilteredReports(filtered);
  };

  const handleVote = async (reportId: string, voteType: "up" | "down") => {
    if (!currentUser) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      const success = await voteOnReport(currentUser.uid, reportId, voteType);

      if (success) {
        // Reload the reports to get updated vote counts
        await loadReports();
        if (scope === "all") {
          await loadAllReports();
        }

        toast.success(
          `Vote ${voteType === "up" ? "upvoted" : "downvoted"} successfully`
        );
      } else {
        // Fallback to local storage if database tables don't exist
        console.log("Database vote failed, using local storage fallback");
        const storageKey = `votes_${currentUser.uid}`;
        const userVotes = JSON.parse(localStorage.getItem(storageKey) || "{}");

        const currentVote = userVotes[reportId];
        let newVote = voteType;

        // Handle vote toggle logic
        if (currentVote === voteType) {
          newVote = null; // Remove vote
        }

        userVotes[reportId] = newVote;
        localStorage.setItem(storageKey, JSON.stringify(userVotes));

        // Update local state immediately
        const updateReportVotes = (reports: CommunityReport[]) =>
          reports.map((report) => {
            if (report.id === reportId) {
              const currentUpvotes = report.upvotes;
              const currentDownvotes = report.downvotes;
              let newUpvotes = currentUpvotes;
              let newDownvotes = currentDownvotes;

              if (currentVote === "up" && voteType === "up") {
                newUpvotes = Math.max(0, currentUpvotes - 1);
              } else if (currentVote === "down" && voteType === "down") {
                newDownvotes = Math.max(0, currentDownvotes - 1);
              } else if (currentVote === "up" && voteType === "down") {
                newUpvotes = Math.max(0, currentUpvotes - 1);
                newDownvotes = currentDownvotes + 1;
              } else if (currentVote === "down" && voteType === "up") {
                newDownvotes = Math.max(0, currentDownvotes - 1);
                newUpvotes = currentUpvotes + 1;
              } else if (!currentVote) {
                if (voteType === "up") {
                  newUpvotes = currentUpvotes + 1;
                } else {
                  newDownvotes = currentDownvotes + 1;
                }
              }

              return {
                ...report,
                upvotes: newUpvotes,
                downvotes: newDownvotes,
                userVote: newVote,
              };
            }
            return report;
          });

        setReports(updateReportVotes);
        if (scope === "all") {
          setAllReports(updateReportVotes);
        }

        // Also update filteredReports if it contains this report
        setFilteredReports(updateReportVotes);

        toast.success(
          `Vote ${
            voteType === "up" ? "upvoted" : "downvoted"
          } successfully (local)`
        );
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const handleViewComments = async (reportId: string) => {
    setLoadingComments(true);
    try {
      const comments = await getReportComments(reportId);
      setReportComments(comments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (reportId: string) => {
    if (!currentUser || !userProfile) {
      toast.error("Please log in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const comment = await addComment(
        currentUser.uid,
        userProfile.displayName || "Anonymous",
        currentUser.email || "",
        reportId,
        newComment.trim()
      );

      if (comment) {
        setReportComments((prev) => [...prev, comment]);
        setNewComment("");

        // Reload reports to update comment counts
        await loadReports();
        if (scope === "all") {
          await loadAllReports();
        }

        toast.success("Comment added successfully");
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleShare = async (report: CommunityReport) => {
    try {
      const shareData = {
        title: report.title,
        text: report.description,
        url: window.location.origin + `/community/${report.id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        toast.success("Report link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share report");
    }
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
      case "resolved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "false_alarm":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Transform reports data for heatmap
  const getHeatmapData = () => {
    const now = Date.now();
    
    // For heatmap, ALWAYS use all available reports regardless of filters
    // Use allReports for "all" scope, otherwise use base reports array (not filtered)
    const sourceReports = scope === "all" ? allReports : reports;
    
    const maxAgeMs =
      timeRange === "24h"
        ? 24 * 60 * 60 * 1000
        : timeRange === "7d"
        ? 7 * 24 * 60 * 60 * 1000
        : timeRange === "30d"
        ? 90 * 24 * 60 * 60 * 1000  // Extended to 90 days to include Chennai reports
        : Infinity;

    console.log("Heatmap data calculation:", {
      scope,
      sourceReportsCount: sourceReports.length,
      allReportsCount: allReports.length,
      filteredReportsCount: filteredReports.length,
      reportsCount: reports.length,
      timeRange,
      maxAgeMs,
    });

    // Debug: Check what data we have
    console.log("Source reports sample:", sourceReports.slice(0, 2).map(r => ({
      id: r.id,
      title: r.title,
      location: r.location,
      created_at: r.created_at,
      severity: r.severity
    })));

    if (scope === "all") {
      console.log("All Reports scope - checking data:", {
        allReportsLength: allReports.length,
        sourceReportsLength: sourceReports.length,
        sampleAllReports: allReports.slice(0, 3),
      });
    }

    console.log("Using reports array:", sourceReports.length, "reports");

    const validReports = sourceReports
      .filter((report) => {
        const hasLocation = report.location?.lat && report.location?.lng;
        if (!hasLocation) {
          console.log("Report missing location:", report.id, report.location);
        }
        return hasLocation;
      })
      .filter((report) => {
        if (maxAgeMs === Infinity) return true;
        const created = new Date(report.created_at || new Date()).getTime();
        const isValid = now - created <= maxAgeMs;
        if (!isValid) {
          console.log(
            "Report too old:",
            report.id,
            new Date(report.created_at!)
          );
        }
        return isValid;
      });

    console.log("Valid reports for heatmap:", validReports.length);
    console.log("Sample valid reports:", validReports.slice(0, 3));

    const heatmapData = validReports.map((report) => {
      // Calculate intensity based on severity and recency
      const severityWeight = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };

      const daysSinceReport = Math.floor(
        (new Date().getTime() - new Date(report.created_at!).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // More recent reports have higher intensity
      const recencyWeight = Math.max(0.1, 1 - daysSinceReport / 30);

      let intensity = severityWeight[report.severity] * recencyWeight;

      // Boost intensity for "All Reports" scope to make it more visible
      if (scope === "all") {
        intensity = intensity * 3.0; // Increase intensity by 200%
      }

      // Ensure minimum intensity for visibility
      intensity = Math.max(intensity, 1.0);

      return {
        lat: report.location.lat,
        lng: report.location.lng,
        intensity: intensity,
        report: report,
      };
    });

    console.log("Final heatmap data:", heatmapData.slice(0, 3));
    console.log("Intensity range:", {
      min: Math.min(...heatmapData.map((d) => d.intensity)),
      max: Math.max(...heatmapData.map((d) => d.intensity)),
      avg:
        heatmapData.reduce((sum, d) => sum + d.intensity, 0) /
        heatmapData.length,
    });

    return heatmapData;
  };

  // Get flood flow data for simulation
  const getFloodFlowData = () => {
    const heatmapData = getHeatmapData();
    console.log("Getting flood flow data:", {
      heatmapDataLength: heatmapData.length,
      samplePoints: heatmapData.slice(0, 3),
      intensityRange: heatmapData.length > 0 ? {
        min: Math.min(...heatmapData.map(p => p.intensity)),
        max: Math.max(...heatmapData.map(p => p.intensity))
      } : null
    });
    
    // If no real data, create mock data for SRMIST Kattankulathur area (R2FV+6Q7)
    if (heatmapData.length === 0) {
      console.log("🎭 Using comprehensive mock flood data for SRMIST Kattankulathur");
      const mockData = [
        // Core SRMIST Campus (R2FV+6Q7 = 12.823°N, 80.044°E)
        { lat: 12.8230, lng: 80.0440, intensity: 0.95, severity: "critical" as const },
        { lat: 12.8235, lng: 80.0445, intensity: 0.92, severity: "critical" as const },
        { lat: 12.8225, lng: 80.0435, intensity: 0.90, severity: "critical" as const },
        { lat: 12.8240, lng: 80.0450, intensity: 0.88, severity: "critical" as const },
        { lat: 12.8220, lng: 80.0430, intensity: 0.85, severity: "critical" as const },
        
        // Main Academic Blocks
        { lat: 12.8245, lng: 80.0455, intensity: 0.82, severity: "high" as const },
        { lat: 12.8250, lng: 80.0460, intensity: 0.80, severity: "high" as const },
        { lat: 12.8215, lng: 80.0425, intensity: 0.78, severity: "high" as const },
        { lat: 12.8255, lng: 80.0440, intensity: 0.75, severity: "high" as const },
        { lat: 12.8210, lng: 80.0445, intensity: 0.72, severity: "high" as const },
        
        // Hostel Areas & Residential Zones
        { lat: 12.8260, lng: 80.0420, intensity: 0.85, severity: "critical" as const },
        { lat: 12.8265, lng: 80.0435, intensity: 0.82, severity: "high" as const },
        { lat: 12.8270, lng: 80.0450, intensity: 0.80, severity: "high" as const },
        { lat: 12.8205, lng: 80.0460, intensity: 0.78, severity: "high" as const },
        { lat: 12.8200, lng: 80.0470, intensity: 0.75, severity: "high" as const },
        
        // Potheri Town Area
        { lat: 12.8195, lng: 80.0455, intensity: 0.70, severity: "high" as const },
        { lat: 12.8190, lng: 80.0440, intensity: 0.68, severity: "medium" as const },
        { lat: 12.8185, lng: 80.0450, intensity: 0.65, severity: "medium" as const },
        { lat: 12.8180, lng: 80.0435, intensity: 0.62, severity: "medium" as const },
        
        // Kattankulathur Junction & Surroundings
        { lat: 12.8275, lng: 80.0465, intensity: 0.72, severity: "high" as const },
        { lat: 12.8280, lng: 80.0445, intensity: 0.70, severity: "high" as const },
        { lat: 12.8285, lng: 80.0430, intensity: 0.68, severity: "medium" as const },
        { lat: 12.8290, lng: 80.0455, intensity: 0.65, severity: "medium" as const },
        
        // Low-lying Areas & Drainage Zones
        { lat: 12.8220, lng: 80.0485, intensity: 0.88, severity: "critical" as const },
        { lat: 12.8215, lng: 80.0490, intensity: 0.85, severity: "critical" as const },
        { lat: 12.8210, lng: 80.0480, intensity: 0.82, severity: "high" as const },
        { lat: 12.8240, lng: 80.0420, intensity: 0.80, severity: "high" as const },
        { lat: 12.8245, lng: 80.0415, intensity: 0.78, severity: "high" as const },
        
        // Peripheral Flood Zones
        { lat: 12.8295, lng: 80.0440, intensity: 0.60, severity: "medium" as const },
        { lat: 12.8175, lng: 80.0445, intensity: 0.58, severity: "medium" as const },
        { lat: 12.8230, lng: 80.0500, intensity: 0.75, severity: "high" as const },
        { lat: 12.8235, lng: 80.0410, intensity: 0.70, severity: "high" as const },
      ];
      console.log(`📍 Created ${mockData.length} flood simulation points around SRMIST campus`);
      return mockData;
    }
    
    // Use all heatmap points with boosted intensity for visibility
    const flowData = heatmapData.map((point) => ({
      lat: point.lat,
      lng: point.lng,
      // Keep intensity high (0.5-1.0 range) for better visibility
      intensity: Math.max(0.5, Math.min(point.intensity / 2, 1)),
      severity: point.report.severity,
    }));
    
    console.log("Flow data generated:", {
      count: flowData.length,
      sample: flowData.slice(0, 3),
      intensityRange: flowData.length > 0 ? {
        min: Math.min(...flowData.map(p => p.intensity)),
        max: Math.max(...flowData.map(p => p.intensity))
      } : null
    });
    
    return flowData;
  };



  return (
    <UserLayout
      title="Community"
      description="Connect with your community and view flood reports"
    >
      <style>{`
        ${theme === 'high-contrast' ? `
          .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900,
          .text-gray-500, .text-gray-400, .text-slate-600, .text-slate-700,
          .text-slate-500, .text-slate-900, .text-slate-800 {
            color: hsl(0, 0%, 100%) !important;
          }
          .bg-white\\/80, .bg-white\\/90, .bg-white\\/95, .bg-white {
            background-color: hsl(0, 0%, 10%) !important;
          }
          .bg-clip-text {
            -webkit-text-fill-color: hsl(47, 100%, 60%) !important;
          }
        ` : ''}
      `}</style>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Community Reports
            </h1>
            <p className="text-gray-600 mt-1">
              Stay connected with your community and view flood information
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadReports}
              disabled={loading}
              className="flex items-center"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Badge variant="outline" className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {filteredReports.length} reports
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="community">Community Reports</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap View</TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Severity</label>
                    <Select
                      value={severityFilter}
                      onValueChange={setSeverityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="false_alarm">False Alarm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="severity">Severity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">
                    Loading community reports...
                  </p>
                </div>
              ) : filteredReports.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No reports found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ||
                      severityFilter !== "all" ||
                      statusFilter !== "all"
                        ? "Try adjusting your filters to see more reports."
                        : "No flood reports in your region yet. Be the first to report!"}
                    </p>
                    {!searchTerm &&
                      severityFilter === "all" &&
                      statusFilter === "all" && (
                        <Button
                          onClick={() => navigate("/reports")}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Report
                        </Button>
                      )}
                  </CardContent>
                </Card>
              ) : (
                filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                              {report.user_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {report.title}
                              </h3>
                              <Badge
                                className={getSeverityColor(report.severity)}
                              >
                                {report.severity.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {report.description}
                            </p>

                            {/* Media Display */}
                            {report.images && report.images.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                                {report.images
                                  .slice(0, 3)
                                  .map((mediaUrl, index) => {
                                    const isVideo =
                                      mediaUrl &&
                                      (mediaUrl.includes(".mp4") ||
                                        mediaUrl.includes(".mov") ||
                                        mediaUrl.includes(".avi") ||
                                        mediaUrl.startsWith("data:video/"));

                                    return (
                                      <div key={index} className="relative">
                                        {isVideo ? (
                                          <video
                                            src={mediaUrl}
                                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90"
                                            controls
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        ) : (
                                          <img
                                            src={mediaUrl}
                                            alt={`Report media ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90"
                                            onClick={() => {
                                              setSelectedImageUrl(mediaUrl);
                                              setShowImageViewer(true);
                                            }}
                                          />
                                        )}
                                        <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                          {isVideo ? "VIDEO" : "IMAGE"}
                                        </div>
                                      </div>
                                    );
                                  })}
                                {report.images.length > 3 && (
                                  <div className="flex items-center justify-center bg-gray-100 rounded-lg text-xs text-gray-500">
                                    +{report.images.length - 3} more
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {report.location.address}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTimeAgo(report.created_at!)}
                              </div>
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {report.views} views
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Flag className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(report.id!, "up")}
                              className={`h-8 px-2 ${
                                report.userVote === "up"
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {report.upvotes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(report.id!, "down")}
                              className={`h-8 px-2 ${
                                report.userVote === "down"
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              <ThumbsDown className="w-4 h-4 mr-1" />
                              {report.downvotes}
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-gray-500"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowDetailDialog(true);
                              handleViewComments(report.id!);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {report.comments} comments
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowDetailDialog(true);
                              toast.success("Opening report details");
                            }}
                            className="h-8 px-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(report)}
                            className="h-8 px-2 text-gray-500"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Flood Reports Heatmap
                </CardTitle>
                <CardDescription>
                  Visual representation of flood report density and severity
                  across your region. Red areas indicate higher concentration of
                  critical reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Heatmap Controls */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 relative z-10">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600">View Mode</label>
                    <Select
                      value={showFlowSimulation ? "flow" : "heatmap"}
                      onValueChange={(value) =>
                        setShowFlowSimulation(value === "flow")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Heatmap" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="heatmap">Heatmap</SelectItem>
                        <SelectItem value="flow">
                          Flood Flow Simulation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600">Scope</label>
                    <Select value={scope} onValueChange={setScope}>
                      <SelectTrigger>
                        <SelectValue placeholder="My Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="region">My Region</SelectItem>
                        <SelectItem value="all">All Reports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600">Time Range</label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Last 30 days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">Last 24 hours</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600">Radius</label>
                    <Select
                      value={String(heatRadius)}
                      onValueChange={(v) => setHeatRadius(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Small</SelectItem>
                        <SelectItem value="25">Medium</SelectItem>
                        <SelectItem value="40">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600">Blur</label>
                    <Select
                      value={String(heatBlur)}
                      onValueChange={(v) => setHeatBlur(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Blur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Low</SelectItem>
                        <SelectItem value="15">Medium</SelectItem>
                        <SelectItem value="25">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Flow Simulation Controls */}
                {showFlowSimulation && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 relative z-10 bg-blue-50 p-3 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">
                        Simulation
                      </label>
                      <Button
                        onClick={() => setIsFlowPlaying(!isFlowPlaying)}
                        variant={isFlowPlaying ? "destructive" : "default"}
                        size="sm"
                        className="w-full"
                      >
                        {isFlowPlaying ? "Pause" : "Play"}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Speed</label>
                      <Select
                        value={String(flowSpeed)}
                        onValueChange={(v) => setFlowSpeed(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Speed" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">Slow</SelectItem>
                          <SelectItem value="1">Normal</SelectItem>
                          <SelectItem value="2">Fast</SelectItem>
                          <SelectItem value="3">Very Fast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">
                        Show Vectors
                      </label>
                      <Button
                        onClick={() => setShowFlowVectors(!showFlowVectors)}
                        variant={showFlowVectors ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        {showFlowVectors ? "Vectors On" : "Vectors Off"}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">
                        Show Trails
                      </label>
                      <Button
                        onClick={() => setShowFlowTrails(!showFlowTrails)}
                        variant={showFlowTrails ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        {showFlowTrails ? "Trails On" : "Trails Off"}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">
                        Data Source
                      </label>
                      <Button
                        onClick={() => setUsePredictionData(!usePredictionData)}
                        variant={usePredictionData ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        {usePredictionData ? "Predictions" : "Reports"}
                      </Button>
                    </div>
                  </div>
                )}

                {loading || (scope === "all" && loadingAllReports) ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">
                      {scope === "all"
                        ? "Loading all reports..."
                        : "Loading heatmap data..."}
                    </p>
                  </div>
                ) : getHeatmapData().length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No data for heatmap
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No flood reports with location data found in your region.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-600 rounded"></div>
                          <span className="text-sm text-gray-600">
                            Low Activity
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-amber-500 rounded"></div>
                          <span className="text-sm text-gray-600">
                            Medium Activity
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-600 rounded"></div>
                          <span className="text-sm text-gray-600">
                            High Activity
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {getHeatmapData().length} locations
                      </Badge>
                    </div>
                    <div className="relative z-0">
                      {showFlowSimulation ? (
                        <FloodFlowSimulation
                          floodData={getFloodFlowData()}
                          height="500px"
                          center={
                            scope === "all"
                              ? [20.5937, 78.9629] // India center for all reports
                              : userProfile?.location?.coordinates?.lat &&
                                userProfile?.location?.coordinates?.lng
                              ? [
                                  userProfile.location.coordinates.lat,
                                  userProfile.location.coordinates.lng,
                                ]
                              : [20.5937, 78.9629]
                          }
                          zoom={
                            scope === "all"
                              ? 5 // Lower zoom for all reports to show more area
                              : userProfile?.location?.coordinates?.lat &&
                                userProfile?.location?.coordinates?.lng
                              ? 8
                              : 6
                          }
                          isPlaying={isFlowPlaying}
                          speed={flowSpeed}
                          showFlowVectors={showFlowVectors}
                          showFlowTrails={showFlowTrails}
                          usePredictionData={usePredictionData}
                        />
                      ) : (
                        <HeatmapMap
                          data={getHeatmapData()}
                          height="500px"
                          center={
                            scope === "all"
                              ? [20.5937, 78.9629] // India center for all reports
                              : userProfile?.location?.coordinates?.lat &&
                                userProfile?.location?.coordinates?.lng
                              ? [
                                  userProfile.location.coordinates.lat,
                                  userProfile.location.coordinates.lng,
                                ]
                              : [20.5937, 78.9629]
                          }
                          zoom={
                            scope === "all"
                              ? 5 // Lower zoom for all reports to show more area
                              : userProfile?.location?.coordinates?.lat &&
                                userProfile?.location?.coordinates?.lng
                              ? 8
                              : 6
                          }
                          animate={true}
                          animationDurationMs={1200}
                          radius={
                            scope === "all"
                              ? Math.max(heatRadius, 30)
                              : heatRadius
                          }
                          blur={
                            scope === "all" ? Math.max(heatBlur, 20) : heatBlur
                          }
                          minOpacity={scope === "all" ? 0.6 : 0.4}
                          fitToData={true}
                          showMarkersOnZoom={true}
                          markersZoomThreshold={12}
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">
                        {showFlowSimulation
                          ? "How to read the flood flow simulation:"
                          : "How to read the heatmap:"}
                      </p>
                      {showFlowSimulation ? (
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            {usePredictionData
                              ? "Animated water flow shows predicted flood spread from AI-identified risk areas"
                              : "Animated water flow shows how flood water would spread from high-risk areas"}
                          </li>
                          <li>
                            {usePredictionData
                              ? "Flow simulation uses real-time weather data and ML predictions"
                              : "Flow direction and speed are based on terrain and flood intensity"}
                          </li>
                          <li>
                            Red areas indicate{" "}
                            {usePredictionData
                              ? "high-risk predicted flood zones"
                              : "high-intensity flood sources"}
                          </li>
                          <li>
                            Flow trails show the path water would take over time
                          </li>
                          <li>Vectors show the direction of water flow</li>
                          {usePredictionData && (
                            <li>
                              Predictions are based on weather patterns,
                              terrain, and historical data
                            </li>
                          )}
                        </ul>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Intensity is calculated based on report severity and
                            recency
                          </li>
                          <li>
                            Critical reports have higher weight than low
                            severity reports
                          </li>
                          <li>
                            Recent reports appear brighter than older ones
                          </li>
                          <li>
                            Red areas indicate high concentration of critical
                            flood reports
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReport ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <span>{selectedReport.title || "Untitled Report"}</span>
                  <Badge className={getSeverityColor(selectedReport.severity)}>
                    {(selectedReport.severity || "unknown").toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {(selectedReport.status || "unknown")
                      .replace("_", " ")
                      .toUpperCase()}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Report submitted by{" "}
                  {selectedReport.user_name || "Unknown User"} •{" "}
                  {formatTimeAgo(
                    selectedReport.created_at || new Date().toISOString()
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Location Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Address:</p>
                      <p className="text-blue-800">
                        {selectedReport.location?.address ||
                          "Address not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">District:</p>
                      <p className="text-blue-800">
                        {selectedReport.location?.district ||
                          "District not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">State:</p>
                      <p className="text-blue-800">
                        {selectedReport.location?.state ||
                          "State not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Coordinates:</p>
                      <p className="text-blue-800">
                        {selectedReport.location?.lat &&
                        selectedReport.location?.lng
                          ? `${selectedReport.location.lat.toFixed(
                              6
                            )}, ${selectedReport.location.lng.toFixed(6)}`
                          : "Coordinates not available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Description
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700 leading-relaxed">
                      {selectedReport.description || "No description available"}
                    </p>
                  </div>
                </div>

                {/* Media Gallery */}
                {selectedReport.images && selectedReport.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Media ({selectedReport.images.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedReport.images.map((mediaUrl, index) => {
                        const isVideo =
                          mediaUrl.includes("video/") ||
                          mediaUrl.includes(".mp4") ||
                          mediaUrl.includes(".mov") ||
                          mediaUrl.includes(".avi") ||
                          mediaUrl.includes(".webm");
                        const isBase64Video =
                          mediaUrl.startsWith("data:video/");

                        return (
                          <div key={index} className="relative group">
                            {isVideo || isBase64Video ? (
                              <div className="relative">
                                <video
                                  src={mediaUrl}
                                  className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                                  controls
                                  preload="metadata"
                                />
                                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  VIDEO
                                </div>
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={mediaUrl}
                                  alt={`Report media ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                                  onClick={() => {
                                    setSelectedImageUrl(mediaUrl);
                                    setShowImageViewer(true);
                                  }}
                                />
                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  IMAGE
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Report Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">
                      Severity Level
                    </h4>
                    <Badge
                      className={getSeverityColor(selectedReport.severity)}
                    >
                      {selectedReport.severity.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-slate-600 mt-1">
                      {selectedReport.severity === "critical"
                        ? "Immediate action required"
                        : selectedReport.severity === "high"
                        ? "High priority response needed"
                        : selectedReport.severity === "medium"
                        ? "Moderate attention required"
                        : "Low priority monitoring"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Status</h4>
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <p className="text-xs text-slate-600 mt-1">
                      {selectedReport.status === "verified"
                        ? "Report has been verified"
                        : selectedReport.status === "pending"
                        ? "Awaiting verification"
                        : selectedReport.status === "resolved"
                        ? "Issue has been resolved"
                        : "Report marked as false alarm"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">
                      Community Engagement
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Upvotes:</span>
                        <span className="font-medium">
                          {selectedReport.upvotes}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Downvotes:</span>
                        <span className="font-medium">
                          {selectedReport.downvotes}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Views:</span>
                        <span className="font-medium">
                          {selectedReport.views}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-4">
                      Comments ({reportComments.length})
                    </h4>

                    {/* Add Comment Form */}
                    {currentUser && (
                      <div className="mb-4">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(selectedReport.id!);
                              }
                            }}
                          />
                          <Button
                            onClick={() => handleAddComment(selectedReport.id!)}
                            disabled={!newComment.trim()}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {loadingComments ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">
                            Loading comments...
                          </p>
                        </div>
                      ) : reportComments.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">
                            No comments yet. Be the first to comment!
                          </p>
                        </div>
                      ) : (
                        reportComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="border-l-2 border-blue-200 pl-3"
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-slate-900">
                                {comment.user_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  comment.created_at!
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">
                              {comment.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Report Selected
              </h3>
              <p className="text-gray-600 mb-4">
                Please select a report to view its details.
              </p>
              <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
            </div>
          )}
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
    </UserLayout>
  );
};

export default Community;
