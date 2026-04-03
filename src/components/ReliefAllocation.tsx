import React, { useState, useEffect } from "react";
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";
import { supabase } from "../lib/supabase";
import {
  Package,
  Truck,
  MapPin,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface ReliefItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  destination: string;
  priority: "low" | "medium" | "high" | "critical";
  allocated_by: string;
  allocated_at: string;
  estimated_delivery: string;
  notes?: string;
}

export default function ReliefAllocation() {
  const { user } = useSupabaseAuth();
  const [reliefAllocations, setReliefAllocations] = useState<ReliefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ReliefItem | null>(null);
  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: 0,
    unit: "",
    destination: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    estimated_delivery: "",
    notes: "",
  });

  // Fetch relief allocations from Supabase
  const fetchReliefAllocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("relief_allocations")
        .select("*")
        .order("allocated_at", { ascending: false });

      if (error) throw error;
      setReliefAllocations(data || []);
    } catch (err) {
      console.error("Error fetching relief allocations:", err);
      setError("Failed to load relief allocations");
    } finally {
      setLoading(false);
    }
  };

  // Add new relief allocation
  const addReliefAllocation = async () => {
    if (!user || !newItem.item_name || !newItem.destination) return;

    try {
      const { data, error } = await supabase
        .from("relief_allocations")
        .insert({
          ...newItem,
          allocated_by: user.id,
          allocated_at: new Date().toISOString(),
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      setReliefAllocations((prev) => [data, ...prev]);
      setShowAddModal(false);
      setNewItem({
        item_name: "",
        quantity: 0,
        unit: "",
        destination: "",
        priority: "medium",
        estimated_delivery: "",
        notes: "",
      });
    } catch (err) {
      console.error("Error adding relief allocation:", err);
      setError("Failed to add relief allocation");
    }
  };

  // Update relief allocation status
  const updateStatus = async (id: string, status: ReliefItem["status"]) => {
    try {
      const { error } = await supabase
        .from("relief_allocations")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setReliefAllocations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
  };

  // Delete relief allocation
  const deleteAllocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("relief_allocations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setReliefAllocations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting allocation:", err);
      setError("Failed to delete allocation");
    }
  };

  useEffect(() => {
    fetchReliefAllocations();

    // Set up real-time subscription
    const subscription = supabase
      .channel("relief_allocations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "relief_allocations" },
        (payload) => {
          console.log("Relief allocations change received:", payload);
          fetchReliefAllocations(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-100";
      case "in_transit":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600" />
            Relief Allocation
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track relief supply distributions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Allocation
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Allocations
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {reliefAllocations.length}
              </p>
            </div>
            <Package className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  reliefAllocations.filter(
                    (item) => item.status === "in_transit"
                  ).length
                }
              </p>
            </div>
            <Truck className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  reliefAllocations.filter(
                    (item) => item.status === "delivered"
                  ).length
                }
              </p>
            </div>
            <Package className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  reliefAllocations.filter((item) => item.status === "pending")
                    .length
                }
              </p>
            </div>
            <Calendar className="text-yellow-600" size={24} />
          </div>
        </div>
      </div>

      {/* Relief Allocations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Relief Allocations
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reliefAllocations.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="text-gray-400 mr-3" size={16} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.item_name}
                        </div>
                        {item.notes && (
                          <div className="text-sm text-gray-500">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.quantity} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="text-gray-400 mr-1" size={14} />
                      {item.destination}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateStatus(
                          item.id,
                          e.target.value as ReliefItem["status"]
                        )
                      }
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${getStatusColor(
                        item.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.estimated_delivery
                      ? new Date(item.estimated_delivery).toLocaleDateString()
                      : "Not set"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteAllocation(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reliefAllocations.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No allocations yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new relief allocation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? "Edit Allocation" : "Add New Allocation"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newItem.item_name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, item_name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Water bottles, Food packets"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="bottles, kg, boxes"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={newItem.destination}
                  onChange={(e) =>
                    setNewItem({ ...newItem, destination: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Area or shelter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newItem.priority}
                  onChange={(e) =>
                    setNewItem({ ...newItem, priority: e.target.value as any })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery
                </label>
                <input
                  type="date"
                  value={newItem.estimated_delivery}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      estimated_delivery: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) =>
                    setNewItem({ ...newItem, notes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addReliefAllocation}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                {editingItem ? "Update" : "Add"} Allocation
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  setNewItem({
                    item_name: "",
                    quantity: 0,
                    unit: "",
                    destination: "",
                    priority: "medium",
                    estimated_delivery: "",
                    notes: "",
                  });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
