import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NGOLayout from "@/components/NGOLayout";
import GradientCard from "@/components/GradientCard";
import AnimatedCard from "@/components/AnimatedCard";
import { supabase } from "@/lib/supabase";
import {
  Apple,
  Coffee,
  Utensils,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  MapPin,
  Thermometer,
} from "lucide-react";
import { toast } from "sonner";

interface FoodItem {
  id: string;
  name: string;
  category:
    | "grains"
    | "vegetables"
    | "fruits"
    | "dairy"
    | "protein"
    | "beverages"
    | "packaged"
    | "baby_food";
  quantity: number;
  unit: string;
  expiry_date?: string;
  storage_temperature?: string;
  location: string;
  status: "available" | "reserved" | "distributed" | "expired";
  donated_by?: string;
  received_date: string;
  notes?: string;
  nutritional_info?: string;
  created_at: string;
  updated_at: string;
}

interface CreateFoodRequest {
  name: string;
  category: FoodItem["category"];
  quantity: number;
  unit: string;
  expiry_date?: string;
  storage_temperature?: string;
  location: string;
  donated_by?: string;
  notes?: string;
  nutritional_info?: string;
}

const NGOFoodResources: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state for adding new food item
  const [newFoodItem, setNewFoodItem] = useState<CreateFoodRequest>({
    name: "",
    category: "grains",
    quantity: 0,
    unit: "",
    expiry_date: "",
    storage_temperature: "",
    location: "",
    donated_by: "",
    notes: "",
    nutritional_info: "",
  });

  // Real-time data fetching
  useEffect(() => {
    fetchFoodResources();

    // Set up real-time subscription
    const subscription = supabase
      .channel("food_resources")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_resources" },
        (payload) => {
          console.log("Food resource change:", payload);
          fetchFoodResources();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchFoodResources = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("food_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching food resources:", error);
        toast.error("Failed to load food resources");
        return;
      }

      setFoodItems(data || []);
    } catch (error) {
      console.error("Error in fetchFoodResources:", error);
      toast.error("Failed to load food resources");
    } finally {
      setLoading(false);
    }
  };

  const addFoodResource = async () => {
    try {
      const { error } = await supabase.from("food_resources").insert([
        {
          ...newFoodItem,
          status: "available",
          received_date: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error adding food resource:", error);
        toast.error("Failed to add food resource");
        return;
      }

      toast.success("Food resource added successfully");
      setIsCreateDialogOpen(false);
      setNewFoodItem({
        name: "",
        category: "grains",
        quantity: 0,
        unit: "",
        expiry_date: "",
        storage_temperature: "",
        location: "",
        donated_by: "",
        notes: "",
        nutritional_info: "",
      });
      fetchFoodResources();
    } catch (error) {
      console.error("Error in addFoodResource:", error);
      toast.error("Failed to add food resource");
    }
  };

  const updateFoodStatus = async (id: string, status: FoodItem["status"]) => {
    try {
      const { error } = await supabase
        .from("food_resources")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating food status:", error);
        toast.error("Failed to update status");
        return;
      }

      toast.success(`Status updated to ${status}`);
      fetchFoodResources();
    } catch (error) {
      console.error("Error in updateFoodStatus:", error);
      toast.error("Failed to update status");
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from("food_resources")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating quantity:", error);
        toast.error("Failed to update quantity");
        return;
      }

      toast.success("Quantity updated successfully");
      fetchFoodResources();
    } catch (error) {
      console.error("Error in updateQuantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  // Filter food items
  const filteredFoodItems = foodItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.donated_by &&
        item.donated_by.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category: FoodItem["category"]) => {
    switch (category) {
      case "grains":
        return <Coffee className="h-4 w-4" />;
      case "vegetables":
        return <Apple className="h-4 w-4 text-green-500" />;
      case "fruits":
        return <Apple className="h-4 w-4 text-red-500" />;
      case "dairy":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "protein":
        return <Utensils className="h-4 w-4 text-orange-500" />;
      case "beverages":
        return <Coffee className="h-4 w-4 text-purple-500" />;
      case "packaged":
        return <Package className="h-4 w-4 text-gray-500" />;
      case "baby_food":
        return <Package className="h-4 w-4 text-pink-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: FoodItem["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "distributed":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry =
      (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now;
  };

  // Calculate statistics
  const stats = {
    total: foodItems.length,
    available: foodItems.filter((item) => item.status === "available").length,
    reserved: foodItems.filter((item) => item.status === "reserved").length,
    distributed: foodItems.filter((item) => item.status === "distributed")
      .length,
    expiringSoon: foodItems.filter((item) => isExpiringSoon(item.expiry_date))
      .length,
    expired: foodItems.filter((item) => isExpired(item.expiry_date)).length,
  };

  if (loading) {
    return (
      <NGOLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Loading food resources...</span>
          </div>
        </div>
      </NGOLayout>
    );
  }

  return (
    <NGOLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <AnimatedCard delay={0} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Food Resources</h1>
              <p className="text-gray-300 mt-1">
                Manage food inventory and distribution
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={fetchFoodResources}
                variant="outline"
                className="flex items-center gap-2 border-white/30 text-gray-100 hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700">
                    <Plus className="h-4 w-4" />
                    Add Food Item
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Food Resource</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Food Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Rice bags, Fresh apples, Milk cartons"
                      value={newFoodItem.name}
                      onChange={(e) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newFoodItem.category}
                      onValueChange={(value: any) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grains">Grains & Cereals</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="dairy">Dairy Products</SelectItem>
                        <SelectItem value="protein">Protein</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                        <SelectItem value="packaged">Packaged Food</SelectItem>
                        <SelectItem value="baby_food">Baby Food</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newFoodItem.quantity}
                      onChange={(e) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={newFoodItem.unit}
                      onValueChange={(value) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          unit: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="packets">Packets</SelectItem>
                        <SelectItem value="bottles">Bottles</SelectItem>
                        <SelectItem value="cans">Cans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiry_date">Expiry Date</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={newFoodItem.expiry_date}
                      onChange={(e) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          expiry_date: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storage_temperature">
                      Storage Requirements
                    </Label>
                    <Select
                      value={newFoodItem.storage_temperature}
                      onValueChange={(value) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          storage_temperature: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select temperature requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="room_temperature">
                          Room Temperature
                        </SelectItem>
                        <SelectItem value="refrigerated">
                          Refrigerated (2-8°C)
                        </SelectItem>
                        <SelectItem value="frozen">Frozen (-18°C)</SelectItem>
                        <SelectItem value="cool_dry">Cool & Dry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Storage Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Warehouse A, Cold Storage, Room 101"
                      value={newFoodItem.location}
                      onChange={(e) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donated_by">Donated By</Label>
                    <Input
                      id="donated_by"
                      placeholder="Donor name or organization"
                      value={newFoodItem.donated_by}
                      onChange={(e) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          donated_by: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="nutritional_info">
                      Nutritional Information
                    </Label>
                    <Input
                      id="nutritional_info"
                      placeholder="e.g., High protein, Low sodium, Vegetarian, etc."
                      value={newFoodItem.nutritional_info}
                      onChange={(e) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          nutritional_info: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about storage, handling, or distribution"
                      value={newFoodItem.notes}
                      onChange={(e) =>
                        setNewFoodItem((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={addFoodResource}>Add Food Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </AnimatedCard>

        {/* Alert for expiring items */}
        {stats.expiringSoon > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>{stats.expiringSoon}</strong> food items are expiring
              within 7 days. Consider prioritizing their distribution.
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <GradientCard variant="info" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-6 w-6 text-blue-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">
                    Total Items
                  </p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="success" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">Available</p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.available}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="warning" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">Reserved</p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.reserved}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="info" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">
                    Distributed
                  </p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.distributed}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="warning" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">
                    Expiring Soon
                  </p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.expiringSoon}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="danger" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingDown className="h-6 w-6 text-red-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">Expired</p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.expired}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>
        </div>

        {/* Filters */}
        <AnimatedCard delay={0.1} className="p-6 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="grains">Grains & Cereals</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="dairy">Dairy Products</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                  <SelectItem value="packaged">Packaged Food</SelectItem>
                  <SelectItem value="baby_food">Baby Food</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="distributed">Distributed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Food Resources List */}
        {filteredFoodItems.length === 0 ? (
          <GradientCard variant="default" className="p-12 text-center">
            <CardContent className="p-12 text-center">
              <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">
                No food resources found
              </h3>
              <p className="text-gray-300 mb-6">
                {foodItems.length === 0
                  ? "Add your first food item to get started."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </GradientCard>
        ) : (
          <div className="space-y-4">
            {filteredFoodItems.map((item, index) => (
              <AnimatedCard
                key={item.id}
                delay={0.2 + index * 0.05}
                className={`p-6 ${
                  isExpired(item.expiry_date)
                    ? "border-red-400/50"
                    : isExpiringSoon(item.expiry_date)
                    ? "border-orange-400/50"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <h3 className="text-lg font-semibold text-gray-100">
                            {item.name}
                          </h3>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        {isExpired(item.expiry_date) && (
                          <Badge className="bg-red-100 text-red-800">
                            EXPIRED
                          </Badge>
                        )}
                        {isExpiringSoon(item.expiry_date) &&
                          !isExpired(item.expiry_date) && (
                            <Badge className="bg-orange-100 text-orange-800">
                              EXPIRING SOON
                            </Badge>
                          )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300 mb-2">
                        <div>
                          <span className="font-medium">Quantity:</span>{" "}
                          {item.quantity} {item.unit}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{item.location}</span>
                        </div>
                        {item.expiry_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Expires:{" "}
                              {new Date(item.expiry_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {item.storage_temperature && (
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-4 w-4" />
                            <span>
                              {item.storage_temperature.replace("_", " ")}
                            </span>
                          </div>
                        )}
                      </div>

                      {item.donated_by && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Donated by:</span>{" "}
                          {item.donated_by}
                        </p>
                      )}

                      {item.nutritional_info && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Nutritional info:</span>{" "}
                          {item.nutritional_info}
                        </p>
                      )}

                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {item.status === "available" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              updateFoodStatus(item.id, "reserved")
                            }
                          >
                            Reserve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateFoodStatus(item.id, "distributed")
                            }
                          >
                            Distribute
                          </Button>
                        </>
                      )}

                      {item.status === "reserved" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              updateFoodStatus(item.id, "distributed")
                            }
                          >
                            Distribute
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateFoodStatus(item.id, "available")
                            }
                          >
                            Unreserve
                          </Button>
                        </>
                      )}

                      {(item.status === "available" ||
                        item.status === "reserved") && (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            placeholder="Qty"
                            className="w-16 h-8 text-xs"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const target = e.target as HTMLInputElement;
                                const newQty = parseInt(target.value);
                                if (newQty >= 0) {
                                  updateQuantity(item.id, newQty);
                                  target.value = "";
                                }
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </NGOLayout>
  );
};

export default NGOFoodResources;
