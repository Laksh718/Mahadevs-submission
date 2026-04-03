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
  Package,
  Truck,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface ReliefItem {
  id: string;
  type: string;
  quantity: number;
  unit: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  destination: string;
  coordinates?: { lat: number; lng: number };
  requester: string;
  contact: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
}

interface CreateReliefRequest {
  type: string;
  quantity: number;
  unit: string;
  priority: "low" | "medium" | "high" | "urgent";
  destination: string;
  requester: string;
  contact: string;
  notes?: string;
  estimated_delivery?: string;
}

const NGOReliefAllocation: React.FC = () => {
  const [reliefItems, setReliefItems] = useState<ReliefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Form state for creating new relief allocation
  const [newAllocation, setNewAllocation] = useState<CreateReliefRequest>({
    type: "",
    quantity: 0,
    unit: "",
    priority: "medium",
    destination: "",
    requester: "",
    contact: "",
    notes: "",
    estimated_delivery: "",
  });

  // Real-time data fetching
  useEffect(() => {
    fetchReliefAllocations();

    // Set up real-time subscription
    const subscription = supabase
      .channel("relief_allocations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "relief_allocations" },
        (payload) => {
          console.log("Relief allocation change:", payload);
          fetchReliefAllocations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchReliefAllocations = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("relief_allocations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching relief allocations:", error);
        toast.error("Failed to load relief allocations");
        return;
      }

      setReliefItems(data || []);
    } catch (error) {
      console.error("Error in fetchReliefAllocations:", error);
      toast.error("Failed to load relief allocations");
    } finally {
      setLoading(false);
    }
  };

  const createReliefAllocation = async () => {
    try {
      const { error } = await supabase.from("relief_allocations").insert([
        {
          ...newAllocation,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Error creating relief allocation:", error);
        toast.error("Failed to create relief allocation");
        return;
      }

      toast.success("Relief allocation created successfully");
      setIsCreateDialogOpen(false);
      setNewAllocation({
        type: "",
        quantity: 0,
        unit: "",
        priority: "medium",
        destination: "",
        requester: "",
        contact: "",
        notes: "",
        estimated_delivery: "",
      });
      fetchReliefAllocations();
    } catch (error) {
      console.error("Error in createReliefAllocation:", error);
      toast.error("Failed to create relief allocation");
    }
  };

  const updateAllocationStatus = async (
    id: string,
    status: ReliefItem["status"]
  ) => {
    try {
      const { error } = await supabase
        .from("relief_allocations")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating allocation status:", error);
        toast.error("Failed to update status");
        return;
      }

      toast.success(`Status updated to ${status}`);
      fetchReliefAllocations();
    } catch (error) {
      console.error("Error in updateAllocationStatus:", error);
      toast.error("Failed to update status");
    }
  };

  // Filter relief items based on search and filters
  const filteredReliefItems = reliefItems.filter((item) => {
    const matchesSearch =
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requester.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || item.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: ReliefItem["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ReliefItem["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in_transit":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: ReliefItem["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate statistics
  const stats = {
    total: reliefItems.length,
    pending: reliefItems.filter((item) => item.status === "pending").length,
    inTransit: reliefItems.filter((item) => item.status === "in_transit")
      .length,
    delivered: reliefItems.filter((item) => item.status === "delivered").length,
    urgent: reliefItems.filter((item) => item.priority === "urgent").length,
  };

  if (loading) {
    return (
      <NGOLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Loading relief allocations...</span>
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
              <h1 className="text-3xl font-bold text-gray-100">
                Relief Allocation
              </h1>
              <p className="text-gray-300 mt-1">
                Manage and track relief supply distributions
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={fetchReliefAllocations}
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
                    New Allocation
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Relief Allocation</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Relief Type</Label>
                    <Input
                      id="type"
                      placeholder="e.g., Water bottles, Blankets, Medical supplies"
                      value={newAllocation.type}
                      onChange={(e) =>
                        setNewAllocation((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newAllocation.quantity}
                      onChange={(e) =>
                        setNewAllocation((prev) => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={newAllocation.unit}
                      onValueChange={(value) =>
                        setNewAllocation((prev) => ({
                          ...prev,
                          unit: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="units">Units</SelectItem>
                        <SelectItem value="sets">Sets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newAllocation.priority}
                      onValueChange={(value: any) =>
                        setNewAllocation((prev) => ({
                          ...prev,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="Area/Location name"
                      value={newAllocation.destination}
                      onChange={(e) =>
                        setNewAllocation((prev) => ({
                          ...prev,
                          destination: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requester">Requester</Label>
                    <Input
                      id="requester"
                      placeholder="Name of requesting authority"
                      value={newAllocation.requester}
                      onChange={(e) =>
                        setNewAllocation((prev) => ({
                          ...prev,
                          requester: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact</Label>
                    <Input
                      id="contact"
                      placeholder="Phone number or email"
                      value={newAllocation.contact}
                      onChange={(e) =>
                        setNewAllocation((prev) => ({
                          ...prev,
                          contact: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated_delivery">
                      Estimated Delivery
                    </Label>
                    <Input
                      id="estimated_delivery"
                      type="datetime-local"
                      value={newAllocation.estimated_delivery}
                      onChange={(e) =>
                        setNewAllocation((prev) => ({
                          ...prev,
                          estimated_delivery: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional details or instructions"
                      value={newAllocation.notes}
                      onChange={(e) =>
                        setNewAllocation((prev) => ({
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
                  <Button onClick={createReliefAllocation}>
                    Create Allocation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </AnimatedCard>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <GradientCard variant="info" glow>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-200">
                    Total Allocations
                  </p>
                  <p className="text-2xl font-bold text-gray-50">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="warning" glow>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-200">Pending</p>
                  <p className="text-2xl font-bold text-gray-50">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="info" glow>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-200">
                    In Transit
                  </p>
                  <p className="text-2xl font-bold text-gray-50">
                    {stats.inTransit}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="success" glow>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-200">Delivered</p>
                  <p className="text-2xl font-bold text-gray-50">
                    {stats.delivered}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="danger" glow>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-200">Urgent</p>
                  <p className="text-2xl font-bold text-gray-50">
                    {stats.urgent}
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
                  placeholder="Search allocations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Relief Allocations List */}
        {filteredReliefItems.length === 0 ? (
          <GradientCard variant="default" className="p-12 text-center">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">
                No relief allocations found
              </h3>
              <p className="text-gray-300 mb-6">
                {reliefItems.length === 0
                  ? "Create your first relief allocation to get started."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </GradientCard>
        ) : (
          <div className="space-y-4">
            {filteredReliefItems.map((item, index) => (
              <AnimatedCard key={item.id} delay={0.2 + index * 0.05} className="p-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-100">
                          {item.quantity} {item.unit} of {item.type}
                        </h3>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(
                              item.status
                            )}`}
                          />
                          <span className="text-sm text-gray-300 capitalize">
                            {item.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{item.destination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{item.requester}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {item.estimated_delivery
                              ? new Date(
                                  item.estimated_delivery
                                ).toLocaleDateString()
                              : "No date set"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Created:{" "}
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-sm text-gray-300 mt-2 bg-white/10 p-2 rounded">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateAllocationStatus(item.id, "in_transit")
                          }
                          className="flex items-center gap-1"
                        >
                          <Truck className="h-4 w-4" />
                          Dispatch
                        </Button>
                      )}

                      {item.status === "in_transit" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateAllocationStatus(item.id, "delivered")
                          }
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Delivered
                        </Button>
                      )}

                      {item.status !== "delivered" &&
                        item.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateAllocationStatus(item.id, "cancelled")
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </Button>
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

export default NGOReliefAllocation;
