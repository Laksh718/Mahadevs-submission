import React, { useState, useEffect } from "react";
import NGOLayout from "@/components/NGOLayout";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { UserRole } from "@/lib/roleBasedAuth";
import { supabase } from "@/lib/supabase";
import {
  Building2,
  Package,
  MapPin,
  Calendar,
  Activity,
  AlertTriangle,
  Truck,
  Users,
  Apple,
  Home,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NGOMetrics {
  // Shelter metrics
  totalShelters: number;
  activeShelters: number;
  totalCapacity: number;
  occupiedCapacity: number;

  // Relief allocation metrics
  totalReliefAllocations: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  recentReliefAllocations: Array<{
    id: string;
    item_name: string;
    quantity: number;
    destination: string;
    status: string;
    priority: string;
    allocated_at: string;
  }>;

  // Food resources metrics
  totalFoodItems: number;
  availableItems: number;
  expiringItems: number;
  lowStockItems: number;
  foodResources: Array<{
    id: string;
    item_name: string;
    category: string;
    quantity: number;
    unit: string;
    expiry_date: string;
    status: string;
  }>;

  // Volunteer metrics
  totalVolunteers: number;
  activeVolunteers: number;
  availableVolunteers: number;
  totalHours: number;
  volunteers: Array<{
    id: string;
    name: string;
    status: string;
    availability: string;
    hours_volunteered: number;
    joined_at: string;
  }>;

  // Analytics data
  monthlyTrends: Array<{
    month: string;
    reliefDistributed: number;
    volunteersActive: number;
    shelterOccupancy: number;
  }>;

  priorityBreakdown: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
}

const SimplifiedNGODashboard: React.FC = () => {
  const { userProfile: firebaseUserProfile } = useRoleAwareAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const [metrics, setMetrics] = useState<NGOMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseProfile, setSupabaseProfile] = useState<any>(null);

  // Use Firebase profile if available, otherwise fetch Supabase profile
  const userProfile = firebaseUserProfile || supabaseProfile;

  useEffect(() => {
    if (!firebaseUserProfile && supabaseUser && !supabaseProfile) {
      fetchSupabaseProfile();
    }
    fetchNGOMetrics();
  }, [firebaseUserProfile, supabaseUser, supabaseProfile]);

  const fetchSupabaseProfile = async () => {
    if (!supabaseUser) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (data) {
        setSupabaseProfile(data);
        console.log("📋 Fetched Supabase profile for NGO dashboard:", data);
      } else if (error) {
        console.error("❌ Error fetching Supabase profile:", error);
      }
    } catch (err) {
      console.error("❌ Exception fetching Supabase profile:", err);
    }
  };

  const fetchNGOMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from Supabase

      // Relief Allocations
      const { data: reliefData } = await supabase
        .from("relief_allocations")
        .select("*")
        .order("allocated_at", { ascending: false })
        .limit(5);

      // Food Resources
      const { data: foodData } = await supabase
        .from("food_resources")
        .select("*")
        .order("added_at", { ascending: false })
        .limit(5);

      // Volunteers
      const { data: volunteerData } = await supabase
        .from("volunteers")
        .select("*")
        .order("joined_at", { ascending: false })
        .limit(5);

      // Shelter data (using existing emergency_shelters table)
      const { data: shelterData } = await supabase
        .from("emergency_shelters")
        .select("*");

      // Calculate metrics
      const totalShelters = shelterData?.length || 0;
      const activeShelters =
        shelterData?.filter((s) => s.status === "active")?.length || 0;
      const totalCapacity =
        shelterData?.reduce((sum, s) => sum + (s.capacity || 0), 0) || 0;
      const occupiedCapacity =
        shelterData?.reduce((sum, s) => sum + (s.current_occupancy || 0), 0) ||
        0;

      // Relief metrics
      const totalReliefAllocations = reliefData?.length || 0;
      const pendingDeliveries =
        reliefData?.filter((r) => r.status === "pending")?.length || 0;
      const completedDeliveries =
        reliefData?.filter((r) => r.status === "delivered")?.length || 0;

      // Food metrics
      const totalFoodItems = foodData?.length || 0;
      const availableItems =
        foodData?.filter((f) => f.status === "available")?.length || 0;
      const expiringItems =
        foodData?.filter((f) => {
          const expiryDate = new Date(f.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        })?.length || 0;
      const lowStockItems =
        foodData?.filter((f) => f.quantity <= 10)?.length || 0;

      // Volunteer metrics
      const totalVolunteers = volunteerData?.length || 0;
      const activeVolunteers =
        volunteerData?.filter((v) => v.status === "active")?.length || 0;
      const availableVolunteers =
        volunteerData?.filter((v) => v.availability === "available")?.length ||
        0;
      const totalHours =
        volunteerData?.reduce(
          (sum, v) => sum + (v.hours_volunteered || 0),
          0
        ) || 0;

      // Generate monthly trends (mock data for charts)
      const monthlyTrends = [
        {
          month: "Jan",
          reliefDistributed: 120,
          volunteersActive: 25,
          shelterOccupancy: 75,
        },
        {
          month: "Feb",
          reliefDistributed: 150,
          volunteersActive: 30,
          shelterOccupancy: 80,
        },
        {
          month: "Mar",
          reliefDistributed: 180,
          volunteersActive: 35,
          shelterOccupancy: 85,
        },
        {
          month: "Apr",
          reliefDistributed: 200,
          volunteersActive: 40,
          shelterOccupancy: 70,
        },
        {
          month: "May",
          reliefDistributed: 160,
          volunteersActive: 32,
          shelterOccupancy: 60,
        },
        {
          month: "Jun",
          reliefDistributed: 140,
          volunteersActive: 28,
          shelterOccupancy: 55,
        },
      ];

      // Priority breakdown for relief allocations
      const priorities =
        reliefData?.reduce((acc: any, item) => {
          acc[item.priority] = (acc[item.priority] || 0) + 1;
          return acc;
        }, {}) || {};

      const priorityBreakdown = Object.entries(priorities).map(
        ([priority, count]: [string, any]) => ({
          priority,
          count,
          percentage:
            totalReliefAllocations > 0
              ? (count / totalReliefAllocations) * 100
              : 0,
        })
      );

      setMetrics({
        // Shelter metrics
        totalShelters,
        activeShelters,
        totalCapacity,
        occupiedCapacity,

        // Relief metrics
        totalReliefAllocations,
        pendingDeliveries,
        completedDeliveries,
        recentReliefAllocations: reliefData || [],

        // Food metrics
        totalFoodItems,
        availableItems,
        expiringItems,
        lowStockItems,
        foodResources: foodData || [],

        // Volunteer metrics
        totalVolunteers,
        activeVolunteers,
        availableVolunteers,
        totalHours,
        volunteers: volunteerData || [],

        // Analytics
        monthlyTrends,
        priorityBreakdown,
      });
    } catch (error) {
      console.error("Error fetching NGO metrics:", error);
      setError("Failed to load dashboard data. Please refresh to try again.");
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "distributed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "available":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getResourceStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "distributed":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
        </div>
      </NGOLayout>
    );
  }

  if (error) {
    return (
      <NGOLayout>
        <Alert className="max-w-md mx-auto mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={fetchNGOMetrics}>Retry</Button>
        </div>
      </NGOLayout>
    );
  }

  return (
    <NGOLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              NGO Command Center
            </h1>
            <p className="text-gray-600">
              {userProfile?.organization} • {userProfile?.district},{" "}
              {userProfile?.state}
            </p>
          </div>
          <Button onClick={fetchNGOMetrics} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Relief Allocations
              </CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalReliefAllocations}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics?.completedDeliveries} delivered •{" "}
                {metrics?.pendingDeliveries} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Food Resources
              </CardTitle>
              <Apple className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalFoodItems}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics?.availableItems} available • {metrics?.expiringItems}{" "}
                expiring soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalVolunteers}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics?.activeVolunteers} active •{" "}
                {metrics?.availableVolunteers} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shelters</CardTitle>
              <Building2 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.activeShelters}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  ((metrics?.occupiedCapacity || 0) /
                    (metrics?.totalCapacity || 1)) *
                    100
                )}
                % occupancy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Recent Relief Allocations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Recent Relief Allocations
              </CardTitle>
              <CardDescription>Latest distribution activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.recentReliefAllocations.map((allocation) => (
                  <div
                    key={allocation.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{allocation.item_name}</p>
                        <p className="text-sm text-gray-500">
                          {allocation.quantity} units • {allocation.destination}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(
                            allocation.allocated_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(allocation.status)}>
                        {allocation.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {allocation.priority}
                      </p>
                    </div>
                  </div>
                ))}
                {(!metrics?.recentReliefAllocations ||
                  metrics.recentReliefAllocations.length === 0) && (
                  <p className="text-center text-gray-500 py-4">
                    No relief allocations yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Food Inventory Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Food Inventory
              </CardTitle>
              <CardDescription>Current food resource status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.foodResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Apple className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{resource.item_name}</p>
                        <p className="text-sm text-gray-500">
                          {resource.quantity} {resource.unit} •{" "}
                          {resource.category}
                        </p>
                        <p className="text-xs text-gray-400">
                          Expires:{" "}
                          {new Date(resource.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getResourceStatusColor(resource.status)}>
                      {resource.status}
                    </Badge>
                  </div>
                ))}
                {(!metrics?.foodResources ||
                  metrics.foodResources.length === 0) && (
                  <p className="text-center text-gray-500 py-4">
                    No food resources yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Volunteer Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Volunteer Management
              </CardTitle>
              <CardDescription>Active volunteer workforce</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.volunteers.map((volunteer) => (
                  <div
                    key={volunteer.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{volunteer.name}</p>
                        <p className="text-sm text-gray-500">
                          {volunteer.hours_volunteered}h volunteered
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined:{" "}
                          {new Date(volunteer.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(volunteer.status)}>
                        {volunteer.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {volunteer.availability}
                      </p>
                    </div>
                  </div>
                ))}
                {(!metrics?.volunteers || metrics.volunteers.length === 0) && (
                  <p className="text-center text-gray-500 py-4">
                    No volunteers yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operations Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Priority Distribution
              </CardTitle>
              <CardDescription>
                Relief allocation priorities breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.priorityBreakdown.map((item) => (
                  <div
                    key={item.priority}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          item.priority === "critical"
                            ? "bg-red-500"
                            : item.priority === "high"
                            ? "bg-orange-500"
                            : item.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      />
                      <span className="capitalize font-medium">
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{item.count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
                {(!metrics?.priorityBreakdown ||
                  metrics.priorityBreakdown.length === 0) && (
                  <p className="text-center text-gray-500 py-4">
                    No priority data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common operations and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium">Total Hours</p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics?.totalHours}
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm font-medium">Low Stock Items</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics?.lowStockItems}
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics?.completedDeliveries}
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                  <p className="text-sm font-medium">Expiring Soon</p>
                  <p className="text-2xl font-bold text-red-600">
                    {metrics?.expiringItems}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NGOLayout>
  );
};

export default SimplifiedNGODashboard;
