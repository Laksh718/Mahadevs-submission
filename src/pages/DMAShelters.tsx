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
  Building,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users,
  Filter,
  RefreshCw,
  Download,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Bed,
  Utensils,
  Droplets,
  Zap,
  Phone,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import {
  getAdminShelters,
  createShelter,
  updateShelterOccupancy,
  deleteShelter,
  subscribeToShelters,
  AdminShelter,
} from "@/lib/adminSupabase";

const DMAShelters = () => {
  const [shelters, setShelters] = useState<AdminShelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { user } = useSupabaseAuth();

  // Load initial data
  useEffect(() => {
    loadShelters();
  }, []);

  // Real-time shelter updates
  useEffect(() => {
    if (!isLive) return;

    const subscription = subscribeToShelters((payload) => {
      console.log("Shelter update received:", payload);

      if (payload.eventType === "UPDATE" && payload.new) {
        setShelters((prevShelters) =>
          prevShelters.map((shelter) =>
            shelter.id === payload.new.id
              ? { ...shelter, ...payload.new }
              : shelter
          )
        );
      } else if (payload.eventType === "INSERT" && payload.new) {
        setShelters((prevShelters) => [payload.new, ...prevShelters]);
      } else if (payload.eventType === "DELETE" && payload.old) {
        setShelters((prevShelters) =>
          prevShelters.filter((shelter) => shelter.id !== payload.old.id)
        );
      }

      setLastUpdate(new Date());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLive]);

  const loadShelters = async () => {
    setLoading(true);
    try {
      console.log("Loading shelters from Supabase...");
      const shelterData = await getAdminShelters();
      console.log("Loaded shelters:", shelterData);
      setShelters(shelterData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading shelters:", error);
      toast.error("Failed to load shelters");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "near_full":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "full":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const filteredShelters = shelters.filter((shelter) => {
    const matchesSearch =
      shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelter.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelter.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || shelter.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: shelters.length,
    active: shelters.filter((s) => s.is_active).length,
    available: shelters.filter((s) => s.status === "available").length,
    nearFull: shelters.filter((s) => s.status === "near_full").length,
    full: shelters.filter((s) => s.status === "full").length,
    totalCapacity: shelters.reduce((sum, s) => sum + s.capacity, 0),
    totalOccupancy: shelters.reduce((sum, s) => sum + s.current_occupancy, 0),
    availableSpace: shelters.reduce(
      (sum, s) => sum + (s.capacity - s.current_occupancy),
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
              DMA Shelter Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage emergency shelters and capacity across districts
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadShelters} variant="outline" disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant={isLive ? "default" : "outline"}
              onClick={() => setIsLive(!isLive)}
            >
              <Activity className="w-4 h-4 mr-2" />
              Live Updates {isLive ? "ON" : "OFF"}
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Shelter
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
                    Total Shelters
                  </p>
                  <p className="text-3xl font-bold text-orange-800">
                    {stats.total}
                  </p>
                </div>
                <Building className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Active Shelters
                  </p>
                  <p className="text-3xl font-bold text-green-800">
                    {stats.active}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Capacity
                  </p>
                  <p className="text-3xl font-bold text-blue-800">
                    {stats.totalCapacity}
                  </p>
                </div>
                <Bed className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Current Occupancy
                  </p>
                  <p className="text-3xl font-bold text-purple-800">
                    {stats.totalOccupancy}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600">
                    Available Space
                  </p>
                  <p className="text-3xl font-bold text-teal-800">
                    {stats.availableSpace}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search shelters by name, address, or location..."
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
            <option value="available">Available</option>
            <option value="near_full">Near Full</option>
            <option value="full">Full</option>
          </select>
        </div>

        {/* Shelters List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading shelters...</p>
            </div>
          ) : filteredShelters.length === 0 ? (
            <div className="col-span-2">
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No shelters found
                  </h3>
                  <p className="text-gray-600">
                    No shelters match your current filters.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredShelters.map((shelter) => (
              <Card
                key={shelter.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{shelter.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {shelter.location}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(shelter.status)}
                    >
                      {shelter.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{shelter.address}</p>

                    {/* Capacity Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Occupancy
                        </span>
                        <span
                          className={`text-sm font-bold ${getOccupancyColor(
                            shelter.current_occupancy,
                            shelter.capacity
                          )}`}
                        >
                          {shelter.current_occupancy} / {shelter.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              (shelter.current_occupancy / shelter.capacity) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Facilities */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Facilities:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {shelter.facilities?.map((facility, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {facility}
                          </Badge>
                        )) || (
                          <span className="text-sm text-gray-500">
                            No facilities listed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-700">
                            {shelter.contact_person}
                          </p>
                          <p className="text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {shelter.contact_phone}
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

export default DMAShelters;
