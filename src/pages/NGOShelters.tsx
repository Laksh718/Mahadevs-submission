import React, { useState, useEffect } from "react";
import NGOLayout from "@/components/NGOLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Building,
  Users,
  MapPin,
  Heart,
  RefreshCw,
  Activity,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Utensils,
  Wifi,
  Car,
  Bed,
  Droplets,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminShelters,
  subscribeToShelters,
  createShelter,
  updateShelterOccupancy,
  deleteShelter,
  AdminShelter,
} from "@/lib/adminSupabase";
import { supabase } from "@/lib/supabase";

// Real data structure based on Supabase tables
const initialData = {
  shelters: [],
  facilities: [
    "Food",
    "Water",
    "Medical",
    "WiFi",
    "Parking",
    "Beds",
    "Shower",
    "Toilet",
    "Electricity",
    "Security",
  ],
};

const NGOShelters = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCapacity, setFilterCapacity] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Add/Edit form state
  const [shelterForm, setShelterForm] = useState({
    name: "",
    location: "",
    address: "",
    capacity: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    facilities: [],
    notes: "",
    isActive: true,
  });

  // Real data state
  const [data, setData] = useState(initialData);
  const [shelters, setShelters] = useState<AdminShelter[]>([]);

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

      // Update the data structure for the UI using real Supabase data
      setData({
        ...initialData,
        shelters: shelterData.map((shelter) => ({
          id: shelter.id || "",
          name: shelter.name || "Unknown Shelter",
          location: shelter.location || "Unknown Location",
          address: shelter.address || "Unknown Address",
          capacity: shelter.capacity || 0,
          currentOccupancy: shelter.current_occupancy || 0,
          status: shelter.status || "available",
          contactPerson: shelter.contact_person || "Unknown Contact",
          contactPhone: shelter.contact_phone || "Unknown Phone",
          contactEmail: shelter.contact_email || "Unknown Email",
          facilities: Array.isArray(shelter.facilities)
            ? shelter.facilities
            : [],
          coordinates: shelter.coordinates || { lat: 0, lng: 0 },
          isActive: shelter.is_active !== undefined ? shelter.is_active : true,
          notes: shelter.notes || "",
          lastUpdated: shelter.updated_at || new Date().toISOString(),
        })),
      });

      console.log(
        "Shelters state updated:",
        shelterData.length,
        "shelters loaded"
      );
    } catch (error) {
      console.error("Error loading shelters:", error);
      toast.error("Failed to load shelters");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadShelters();
    toast.success("Shelter data refreshed successfully");
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "near_full":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "full":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case "Food":
        return <Utensils className="h-4 w-4" />;
      case "Water":
        return <Droplets className="h-4 w-4" />;
      case "Medical":
        return <Heart className="h-4 w-4" />;
      case "WiFi":
        return <Wifi className="h-4 w-4" />;
      case "Parking":
        return <Car className="h-4 w-4" />;
      case "Beds":
        return <Bed className="h-4 w-4" />;
      case "Shower":
        return <Droplets className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
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

  const handleAddShelter = async () => {
    if (
      !shelterForm.name.trim() ||
      !shelterForm.location.trim() ||
      !shelterForm.capacity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      console.log("Creating shelter with data:", shelterForm);

      const shelterData = {
        name: shelterForm.name.trim(),
        location: shelterForm.location.trim(),
        address: shelterForm.address.trim(),
        capacity: parseInt(shelterForm.capacity),
        current_occupancy: 0,
        status: "available" as const,
        contact_person: shelterForm.contactPerson.trim(),
        contact_phone: shelterForm.contactPhone.trim(),
        contact_email: shelterForm.contactEmail.trim(),
        facilities: shelterForm.facilities,
        coordinates: { lat: 12.9716, lng: 80.2206 }, // Default to Chennai coordinates
        is_active: shelterForm.isActive,
        notes: shelterForm.notes.trim(),
      };

      const newShelter = await createShelter(shelterData);
      console.log("Shelter created successfully:", newShelter);

      toast.success("Shelter created successfully");
      setShowAddDialog(false);
      resetForm();
      await loadShelters(); // Refresh the list
    } catch (error) {
      console.error("Error creating shelter:", error);
      toast.error("Failed to create shelter");
    } finally {
      setLoading(false);
    }
  };

  const handleEditShelter = async () => {
    if (
      !selectedShelter ||
      !shelterForm.name.trim() ||
      !shelterForm.location.trim() ||
      !shelterForm.capacity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const shelterData = {
        name: shelterForm.name.trim(),
        location: shelterForm.location.trim(),
        address: shelterForm.address.trim(),
        capacity: parseInt(shelterForm.capacity),
        contact_person: shelterForm.contactPerson.trim(),
        contact_phone: shelterForm.contactPhone.trim(),
        contact_email: shelterForm.contactEmail.trim(),
        facilities: shelterForm.facilities,
        is_active: shelterForm.isActive,
        notes: shelterForm.notes.trim(),
      };

      // Direct Supabase update since updateShelterOccupancy only handles occupancy
      const { error } = await supabase
        .from("admin_shelters")
        .update(shelterData)
        .eq("id", selectedShelter.id);

      if (error) throw error;
      toast.success("Shelter updated successfully");
      setShowEditDialog(false);
      setSelectedShelter(null);
      resetForm();
      await loadShelters();
    } catch (error) {
      console.error("Error updating shelter:", error);
      toast.error("Failed to update shelter");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShelter = async (shelterId: string) => {
    if (!confirm("Are you sure you want to delete this shelter?")) return;

    setLoading(true);
    try {
      await deleteShelter(shelterId);
      toast.success("Shelter deleted successfully");
      await loadShelters();
    } catch (error) {
      console.error("Error deleting shelter:", error);
      toast.error("Failed to delete shelter");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShelterForm({
      name: "",
      location: "",
      address: "",
      capacity: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      facilities: [],
      notes: "",
      isActive: true,
    });
  };

  const openEditDialog = (shelter: any) => {
    setSelectedShelter(shelter);
    setShelterForm({
      name: shelter.name,
      location: shelter.location,
      address: shelter.address,
      capacity: shelter.capacity.toString(),
      contactPerson: shelter.contactPerson,
      contactPhone: shelter.contactPhone,
      contactEmail: shelter.contactEmail,
      facilities: shelter.facilities || [],
      notes: shelter.notes || "",
      isActive: shelter.isActive,
    });
    setShowEditDialog(true);
  };

  const filteredShelters = data.shelters.filter((shelter: any) => {
    const matchesSearch =
      shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelter.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelter.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || shelter.status === filterStatus;
    const matchesCapacity =
      filterCapacity === "all" ||
      (filterCapacity === "small" && shelter.capacity <= 50) ||
      (filterCapacity === "medium" &&
        shelter.capacity > 50 &&
        shelter.capacity <= 150) ||
      (filterCapacity === "large" && shelter.capacity > 150);

    return matchesSearch && matchesStatus && matchesCapacity;
  });

  // Calculate comprehensive statistics
  const totalShelters = data.shelters.length;
  const activeShelters = data.shelters.filter((s: any) => s.isActive).length;
  const totalCapacity = data.shelters.reduce(
    (sum: number, s: any) => sum + s.capacity,
    0
  );
  const totalOccupancy = data.shelters.reduce(
    (sum: number, s: any) => sum + s.currentOccupancy,
    0
  );
  const occupancyRate =
    totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;
  const availableShelters = data.shelters.filter(
    (s: any) => s.status === "available"
  ).length;
  const nearFullShelters = data.shelters.filter(
    (s: any) => s.status === "near_full"
  ).length;
  const fullShelters = data.shelters.filter(
    (s: any) => s.status === "full"
  ).length;

  if (loading && shelters.length === 0) {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </NGOLayout>
    );
  }

  return (
    <NGOLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shelter Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage emergency shelters and facilities
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshData} variant="outline" disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant={isLive ? "default" : "outline"}
              onClick={() => setIsLive(!isLive)}
            >
              <Activity className="h-4 w-4 mr-2" />
              Live Updates {isLive ? "ON" : "OFF"}
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Shelter
            </Button>
          </div>
        </div>

        {/* Live Status Indicator */}
        {isLive && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            Live updates enabled • Last updated:{" "}
            {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Shelters
                  </p>
                  <p className="text-3xl font-bold text-blue-800">
                    {totalShelters}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {activeShelters} active
                  </p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Total Capacity
                  </p>
                  <p className="text-3xl font-bold text-green-800">
                    {totalCapacity}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {totalOccupancy} occupied
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Occupancy Rate
                  </p>
                  <p className="text-3xl font-bold text-purple-800">
                    {occupancyRate.toFixed(1)}%
                  </p>
                  <Progress value={occupancyRate} className="mt-2 h-2" />
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Available
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-lg font-bold text-green-700">
                      {availableShelters}
                    </span>
                    <span className="text-lg font-bold text-yellow-600">
                      {nearFullShelters}
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {fullShelters}
                    </span>
                  </div>
                  <p className="text-xs text-orange-600 mt-1">
                    Available • Near Full • Full
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search shelters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="near_full">Near Full</option>
                <option value="full">Full</option>
              </select>
              <select
                value={filterCapacity}
                onChange={(e) => setFilterCapacity(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sizes</option>
                <option value="small">Small (≤50)</option>
                <option value="medium">Medium (51-150)</option>
                <option value="large">Large (&gt;150)</option>
              </select>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shelter Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading shelters...</p>
                  </div>
                ) : filteredShelters.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      No shelters found matching your filters
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Occupancy</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShelters.map((shelter) => (
                        <TableRow key={shelter.id}>
                          <TableCell className="font-medium">
                            {shelter.name}
                          </TableCell>
                          <TableCell>{shelter.location}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusColor(shelter.status)}
                            >
                              {shelter.status.charAt(0).toUpperCase() +
                                shelter.status.slice(1).replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{shelter.capacity}</TableCell>
                          <TableCell>
                            {shelter.current_occupancy} / {shelter.capacity}
                            <div className="text-xs text-gray-500">
                              {Math.round(
                                (shelter.current_occupancy / shelter.capacity) *
                                  100
                              )}
                              % full
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{shelter.contact_person}</div>
                              <div className="text-gray-500">
                                {shelter.contact_phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(shelter)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteShelter(shelter.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facilities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Facility Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShelters.map((shelter) => (
                    <Card key={shelter.id} className="border">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">
                          {shelter.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {shelter.location}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {(shelter.facilities || []).map(
                              (facility: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                                >
                                  {getFacilityIcon(facility)}
                                  {facility}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="occupancy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Occupancy Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredShelters.map((shelter) => {
                    const occupancyPercentage =
                      (shelter.currentOccupancy / shelter.capacity) * 100;
                    return (
                      <div key={shelter.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{shelter.name}</h3>
                            <p className="text-sm text-gray-600">
                              {shelter.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {shelter.currentOccupancy} / {shelter.capacity}
                            </div>
                            <div className="text-sm text-gray-500">
                              {occupancyPercentage.toFixed(1)}% occupied
                            </div>
                          </div>
                        </div>
                        <Progress value={occupancyPercentage} className="h-3" />
                        <div className="flex justify-between items-center mt-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(
                              shelter.status
                            )}`}
                          >
                            {getStatusIcon(shelter.status)}
                            {shelter.status.replace("_", " ")}
                          </span>
                          <div className="text-xs text-gray-500">
                            Updated: {formatDate(shelter.lastUpdated)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Capacity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Small Shelters (≤50)</span>
                      <span className="font-semibold">
                        {
                          data.shelters.filter((s: any) => s.capacity <= 50)
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medium Shelters (51-150)</span>
                      <span className="font-semibold">
                        {
                          data.shelters.filter(
                            (s: any) => s.capacity > 50 && s.capacity <= 150
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Large Shelters (&gt;150)</span>
                      <span className="font-semibold">
                        {
                          data.shelters.filter((s: any) => s.capacity > 150)
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Available
                      </span>
                      <span className="font-semibold">{availableShelters}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        Near Full
                      </span>
                      <span className="font-semibold">{nearFullShelters}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Full
                      </span>
                      <span className="font-semibold">{fullShelters}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Shelter Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Shelter</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Shelter Name *</label>
                <Input
                  value={shelterForm.name}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, name: e.target.value })
                  }
                  placeholder="Enter shelter name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location *</label>
                <Input
                  value={shelterForm.location}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, location: e.target.value })
                  }
                  placeholder="Enter location"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={shelterForm.address}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, address: e.target.value })
                  }
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Capacity *</label>
                <Input
                  type="number"
                  value={shelterForm.capacity}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, capacity: e.target.value })
                  }
                  placeholder="Enter capacity"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Person</label>
                <Input
                  value={shelterForm.contactPerson}
                  onChange={(e) =>
                    setShelterForm({
                      ...shelterForm,
                      contactPerson: e.target.value,
                    })
                  }
                  placeholder="Enter contact person"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  value={shelterForm.contactPhone}
                  onChange={(e) =>
                    setShelterForm({
                      ...shelterForm,
                      contactPhone: e.target.value,
                    })
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  value={shelterForm.contactEmail}
                  onChange={(e) =>
                    setShelterForm({
                      ...shelterForm,
                      contactEmail: e.target.value,
                    })
                  }
                  placeholder="Enter email"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Facilities</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {initialData.facilities.map((facility) => (
                    <label
                      key={facility}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={shelterForm.facilities.includes(facility)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setShelterForm({
                              ...shelterForm,
                              facilities: [...shelterForm.facilities, facility],
                            });
                          } else {
                            setShelterForm({
                              ...shelterForm,
                              facilities: shelterForm.facilities.filter(
                                (f) => f !== facility
                              ),
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={shelterForm.notes}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, notes: e.target.value })
                  }
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddShelter} disabled={loading}>
                {loading ? "Creating..." : "Create Shelter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Shelter Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Shelter</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Shelter Name *</label>
                <Input
                  value={shelterForm.name}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, name: e.target.value })
                  }
                  placeholder="Enter shelter name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location *</label>
                <Input
                  value={shelterForm.location}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, location: e.target.value })
                  }
                  placeholder="Enter location"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={shelterForm.address}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, address: e.target.value })
                  }
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Capacity *</label>
                <Input
                  type="number"
                  value={shelterForm.capacity}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, capacity: e.target.value })
                  }
                  placeholder="Enter capacity"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Person</label>
                <Input
                  value={shelterForm.contactPerson}
                  onChange={(e) =>
                    setShelterForm({
                      ...shelterForm,
                      contactPerson: e.target.value,
                    })
                  }
                  placeholder="Enter contact person"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  value={shelterForm.contactPhone}
                  onChange={(e) =>
                    setShelterForm({
                      ...shelterForm,
                      contactPhone: e.target.value,
                    })
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  value={shelterForm.contactEmail}
                  onChange={(e) =>
                    setShelterForm({
                      ...shelterForm,
                      contactEmail: e.target.value,
                    })
                  }
                  placeholder="Enter email"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Facilities</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {initialData.facilities.map((facility) => (
                    <label
                      key={facility}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={shelterForm.facilities.includes(facility)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setShelterForm({
                              ...shelterForm,
                              facilities: [...shelterForm.facilities, facility],
                            });
                          } else {
                            setShelterForm({
                              ...shelterForm,
                              facilities: shelterForm.facilities.filter(
                                (f) => f !== facility
                              ),
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={shelterForm.notes}
                  onChange={(e) =>
                    setShelterForm({ ...shelterForm, notes: e.target.value })
                  }
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditShelter} disabled={loading}>
                {loading ? "Updating..." : "Update Shelter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </NGOLayout>
  );
};

export default NGOShelters;
