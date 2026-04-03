import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import GradientCard from "@/components/GradientCard";
import {
  Camera,
  MapPin,
  Upload,
  Send,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Video,
  Mic,
} from "lucide-react";

const Reports = () => {
  const [reportText, setReportText] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("moderate");
  const [uploadedMedia, setUploadedMedia] = useState([]);

  const handleSubmitReport = () => {
    if (!location || !reportText) {
      alert("Please fill in all required fields.");
      return;
    }

    const newReport = {
      id: Date.now(),
      user: "You",
      location,
      message: reportText,
      urgency,
      time: "Just now",
      media: uploadedMedia,
      verified: false,
      likes: 0,
      comments: 0,
    };

    const storedReports = JSON.parse(
      localStorage.getItem("communityReports") || "[]"
    );
    storedReports.unshift(newReport);
    localStorage.setItem("communityReports", JSON.stringify(storedReports));

    setLocation("");
    setReportText("");
    setUrgency("moderate");
    setUploadedMedia([]);
  };

  const communityReports = [
    ...JSON.parse(localStorage.getItem("communityReports") || "[]"),
    {
      id: 1,
      user: "Sarah M.",
      location: "Riverside District",
      message:
        "Water level rising rapidly near the bridge. Road starting to flood.",
      urgency: "critical",
      time: "5 minutes ago",
      media: ["image"],
      verified: false,
      likes: 12,
      comments: 3,
    },
    {
      id: 2,
      user: "Mike R.",
      location: "Downtown Area",
      message:
        "Heavy rainfall causing drainage issues. Some streets are waterlogged.",
      urgency: "moderate",
      time: "18 minutes ago",
      media: ["video"],
      verified: true,
      likes: 8,
      comments: 1,
    },
    {
      id: 3,
      user: "Community Admin",
      location: "Industrial Zone",
      message:
        "Water pumps activated. Situation under control. Monitoring continues.",
      urgency: "minor",
      time: "45 minutes ago",
      media: [],
      verified: true,
      likes: 25,
      comments: 7,
    },
    {
      id: 4,
      user: "Lisa K.",
      location: "Residential North",
      message: "Basement flooding reported in multiple houses on Oak Street.",
      urgency: "moderate",
      time: "1 hour ago",
      media: ["image", "video"],
      verified: false,
      likes: 15,
      comments: 5,
    },
  ];

  const getUrgencyVariant = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "danger";
      case "moderate":
        return "warning";
      case "minor":
        return "success";
      default:
        return "default";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "moderate":
        return "text-yellow-600 bg-yellow-100";
      case "minor":
        return "text-green-600 bg-green-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const handleMediaUpload = (type) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept =
      type === "image"
        ? "image/*"
        : type === "video"
        ? "video/*"
        : "audio/*";
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files[0];
      if (file) {
        setUploadedMedia((prev) => [...prev, type]);
      }
    };
    fileInput.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-800 bg-clip-text text-transparent">
          Community Reporting & Engagement
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Crowdsourced flood monitoring with AI-powered classification and
          real-time community collaboration
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Submission Form */}
        <div className="lg:col-span-1">
          <GradientCard className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Submit Report
            </h2>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-slate-700"
                >
                  Location
                </Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="location"
                    placeholder="Enter location or use GPS"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="urgency"
                  className="text-sm font-medium text-slate-700"
                >
                  Urgency Level
                </Label>
                <div className="flex space-x-2 mt-2">
                  {["minor", "moderate", "critical"].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={urgency === level ? "default" : "outline"}
                      className={
                        urgency === level
                          ? `bg-gradient-to-r ${
                              level === "critical"
                                ? "from-red-500 to-red-600"
                                : level === "moderate"
                                ? "from-yellow-500 to-yellow-600"
                                : "from-green-500 to-green-600"
                            } text-white`
                          : ""
                      }
                      onClick={() => setUrgency(level)}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label
                  htmlFor="report"
                  className="text-sm font-medium text-slate-700"
                >
                  Description
                </Label>
                <Textarea
                  id="report"
                  placeholder="Describe the situation in detail..."
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              {/* Media Upload */}
              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Add Media
                </Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center py-4"
                    onClick={() => handleMediaUpload("image")}
                  >
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-xs">Photo</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center py-4"
                    onClick={() => handleMediaUpload("video")}
                  >
                    <Video className="w-5 h-5 mb-1" />
                    <span className="text-xs">Video</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center py-4"
                    onClick={() => handleMediaUpload("audio")}
                  >
                    <Mic className="w-5 h-5 mb-1" />
                    <span className="text-xs">Audio</span>
                  </Button>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleSubmitReport}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Report
              </Button>
            </div>
          </GradientCard>

          {/* AI Classification Info */}
          <GradientCard className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              AI Classification
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Minor</p>
                  <p className="text-xs text-slate-600">
                    Low impact, monitoring required
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Moderate</p>
                  <p className="text-xs text-slate-600">
                    Potential risk, action may be needed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Critical</p>
                  <p className="text-xs text-slate-600">
                    Immediate attention required
                  </p>
                </div>
              </div>
            </div>
          </GradientCard>
        </div>

        {/* Community Feed */}
        <div className="lg:col-span-2">
          <GradientCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Live Community Feed
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Users className="w-3 h-3 mr-1" />
                {communityReports.length} Reports
              </Badge>
            </div>

            <div className="space-y-4">
              {communityReports.map((report) => (
                <GradientCard
                  key={report.id}
                  variant={getUrgencyVariant(report.urgency)}
                  className="p-4"
                  hover={false}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {report.user}
                          </span>
                          {report.verified && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={getUrgencyColor(report.urgency)}
                        >
                          {report.urgency}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-600">
                          {report.location}
                        </span>
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-600">
                          {report.time}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 mb-3">
                        {report.message}
                      </p>

                      {/* Media indicators */}
                      {report.media.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                          {report.media.map((media, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded-md"
                            >
                              {media === "image" && (
                                <ImageIcon className="w-3 h-3 text-slate-600" />
                              )}
                              {media === "video" && (
                                <Video className="w-3 h-3 text-slate-600" />
                              )}
                              <span className="text-xs text-slate-600 capitalize">
                                {media}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Engagement */}
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                          <span>👍</span>
                          <span>{report.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                          <MessageSquare className="w-3 h-3" />
                          <span>{report.comments}</span>
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </GradientCard>
              ))}
            </div>
          </GradientCard>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Critical Reports
          </h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            3
          </p>
          <p className="text-sm text-slate-600 mt-1">Last 24 hours</p>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Active Users
          </h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            1.2K
          </p>
          <p className="text-sm text-slate-600 mt-1">Contributing now</p>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Verified Reports
          </h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            87%
          </p>
          <p className="text-sm text-slate-600 mt-1">Accuracy rate</p>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Media Uploads
          </h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            456
          </p>
          <p className="text-sm text-slate-600 mt-1">Photos & videos</p>
        </GradientCard>
      </div>
    </div>
  );
};

export default Reports;
