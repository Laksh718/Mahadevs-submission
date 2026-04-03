import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Plus,
  Eye,
  Edit,
  Users,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Award,
  RefreshCw,
  Filter,
  CheckCircle,
  PlayCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import {
  getTrainingDashboardStats,
  getTrainingSessions,
  getTrainingCoverage,
  TrainingDashboardStats,
  TrainingSession,
} from "@/lib/trainingService";

interface TrainingEvent {
  id: string;
  title: string;
  description: string;
  type: "workshop" | "drill" | "seminar" | "certification";
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
  location: {
    state: string;
    district: string;
    venue: string;
  };
  max_participants: number;
  registered_count: number;
  instructor: string;
  created_at: string;
}

const DMATraining = () => {
  const [trainings, setTrainings] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const { user } = useSupabaseAuth();

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      setLoading(true);

      // Load training sessions using the same service as admin
      const sessions = await getTrainingSessions({
        status: filterStatus !== "all" ? filterStatus : undefined,
      });

      // Convert training sessions to the format expected by this component
      const trainingEvents =
        sessions?.map((session) => ({
          id: session.id,
          title: session.title || "Training Event",
          description: session.description || "",
          type: (session.type || "workshop") as
            | "workshop"
            | "drill"
            | "seminar"
            | "certification",
          start_date: session.date || new Date().toISOString().split("T")[0],
          end_date: session.date || new Date().toISOString().split("T")[0],
          location: {
            state: "N/A",
            district: "N/A",
            venue: session.location || "TBD",
          },
          max_participants: session.capacity || 50,
          registered_count: session.registered || 0,
          instructor: session.instructor || "TBD",
          status: session.status || "scheduled",
          created_at: session.created_at || new Date().toISOString(),
        })) || [];

      setTrainings(trainingEvents);
      toast.success("Training events loaded successfully");
    } catch (error) {
      console.error("Error loading training events:", error);
      toast.error("Failed to load training events");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "workshop":
        return <BookOpen className="w-4 h-4" />;
      case "drill":
        return <PlayCircle className="w-4 h-4" />;
      case "seminar":
        return <Users className="w-4 h-4" />;
      case "certification":
        return <Award className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.location.district
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || training.status === filterStatus;
    const matchesType = filterType === "all" || training.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: trainings.length,
    scheduled: trainings.filter((t) => t.status === "scheduled").length,
    ongoing: trainings.filter((t) => t.status === "ongoing").length,
    completed: trainings.filter((t) => t.status === "completed").length,
    totalParticipants: trainings.reduce(
      (sum, t) => sum + t.registered_count,
      0
    ),
  };

  return (
    <NDMALayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              DMA Training Management
            </h1>
            <p className="text-gray-600 mt-1">
              Coordinate disaster preparedness training programs
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadTrainings} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Training
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Total Programs
                  </p>
                  <p className="text-3xl font-bold text-orange-800">
                    {stats.total}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Scheduled</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {stats.scheduled}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Ongoing</p>
                  <p className="text-3xl font-bold text-green-800">
                    {stats.ongoing}
                  </p>
                </div>
                <PlayCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.completed}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Participants
                  </p>
                  <p className="text-3xl font-bold text-purple-800">
                    {stats.totalParticipants}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search training programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="workshop">Workshop</option>
            <option value="drill">Drill</option>
            <option value="seminar">Seminar</option>
            <option value="certification">Certification</option>
          </select>
        </div>

        {/* Training Events List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading training programs...</p>
            </div>
          ) : filteredTrainings.length === 0 ? (
            <div className="col-span-2">
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No training programs found
                  </h3>
                  <p className="text-gray-600">
                    No programs match your current filters.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredTrainings.map((training) => (
              <Card
                key={training.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(training.type)}
                        <CardTitle className="text-lg">
                          {training.title}
                        </CardTitle>
                      </div>
                      <CardDescription>{training.description}</CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(training.status)}
                    >
                      {training.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Date and Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(training.start_date).toLocaleDateString()}
                        </span>
                        {training.end_date !== training.start_date && (
                          <span>
                            - {new Date(training.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {training.location.district},{" "}
                          {training.location.state}
                        </span>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Participants
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {training.registered_count} /{" "}
                          {training.max_participants}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              (training.registered_count /
                                training.max_participants) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Instructor and Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Instructor:</p>
                        <p className="font-medium text-gray-900">
                          {training.instructor}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </NDMALayout>
  );
};

export default DMATraining;
