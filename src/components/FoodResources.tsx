import React, { useState, useEffect } from "react";
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";
import { supabase } from "../lib/supabase";
import {
  Apple,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Package2,
  Clock,
} from "lucide-react";

interface FoodResource {
  id: string;
  item_name: string;
  category:
    | "grains"
    | "vegetables"
    | "fruits"
    | "proteins"
    | "dairy"
    | "beverages"
    | "canned"
    | "other";
  quantity: number;
  unit: string;
  expiry_date: string;
  status: "available" | "low_stock" | "expired" | "distributed";
  location: string;
  supplier: string;
  cost_per_unit: number;
  added_by: string;
  added_at: string;
  last_updated: string;
  notes?: string;
}

export default function FoodResources() {
  const { user } = useSupabaseAuth();
  const [foodResources, setFoodResources] = useState<FoodResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodResource | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newItem, setNewItem] = useState({
    item_name: "",
    category: "other" as FoodResource["category"],
    quantity: 0,
    unit: "",
    expiry_date: "",
    location: "",
    supplier: "",
    cost_per_unit: 0,
    notes: "",
  });

  // Fetch food resources from Supabase
  const fetchFoodResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("food_resources")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) throw error;

      // Update status based on expiry date and quantity
      const updatedData = (data || []).map((item) => {
        const now = new Date();
        const expiryDate = new Date(item.expiry_date);
        let status = item.status;

        if (expiryDate < now && status !== "distributed") {
          status = "expired";
        } else if (item.quantity <= 10 && status === "available") {
          status = "low_stock";
        }

        return { ...item, status };
      });

      setFoodResources(updatedData);
    } catch (err) {
      console.error("Error fetching food resources:", err);
      setError("Failed to load food resources");
    } finally {
      setLoading(false);
    }
  };

  // Add new food resource
  const addFoodResource = async () => {
    if (!user || !newItem.item_name || !newItem.location) return;

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("food_resources")
        .insert({
          ...newItem,
          added_by: user.id,
          added_at: now,
          last_updated: now,
          status: "available",
        })
        .select()
        .single();

      if (error) throw error;

      setFoodResources((prev) => [data, ...prev]);
      setShowAddModal(false);
      resetNewItem();
    } catch (err) {
      console.error("Error adding food resource:", err);
      setError("Failed to add food resource");
    }
  };

  // Update food resource status
  const updateStatus = async (id: string, status: FoodResource["status"]) => {
    try {
      const { error } = await supabase
        .from("food_resources")
        .update({
          status,
          last_updated: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setFoodResources((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status, last_updated: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
  };

  // Delete food resource
  const deleteFoodResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from("food_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setFoodResources((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting food resource:", err);
      setError("Failed to delete food resource");
    }
  };

  const resetNewItem = () => {
    setNewItem({
      item_name: "",
      category: "other",
      quantity: 0,
      unit: "",
      expiry_date: "",
      location: "",
      supplier: "",
      cost_per_unit: 0,
      notes: "",
    });
  };

  useEffect(() => {
    fetchFoodResources();

    // Set up real-time subscription
    const subscription = supabase
      .channel("food_resources")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_resources" },
        (payload) => {
          console.log("Food resources change received:", payload);
          fetchFoodResources(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "grains":
        return "text-amber-600 bg-amber-100";
      case "vegetables":
        return "text-green-600 bg-green-100";
      case "fruits":
        return "text-red-600 bg-red-100";
      case "proteins":
        return "text-purple-600 bg-purple-100";
      case "dairy":
        return "text-blue-600 bg-blue-100";
      case "beverages":
        return "text-cyan-600 bg-cyan-100";
      case "canned":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-100";
      case "low_stock":
        return "text-yellow-600 bg-yellow-100";
      case "expired":
        return "text-red-600 bg-red-100";
      case "distributed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const filteredResources =
    selectedCategory === "all"
      ? foodResources
      : foodResources.filter((item) => item.category === selectedCategory);

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
            <Apple className="text-green-600" />
            Food Resources
          </h1>
          <p className="text-gray-600 mt-1">
            Manage food inventory and distribution
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Food Item
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
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {foodResources.length}
              </p>
            </div>
            <Package2 className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  foodResources.filter((item) => item.status === "available")
                    .length
                }
              </p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  foodResources.filter((item) => item.status === "low_stock")
                    .length
                }
              </p>
            </div>
            <TrendingDown className="text-yellow-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">
                {
                  foodResources.filter((item) =>
                    isExpiringSoon(item.expiry_date)
                  ).length
                }
              </p>
            </div>
            <Clock className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Categories
          </button>
          {[
            "grains",
            "vegetables",
            "fruits",
            "proteins",
            "dairy",
            "beverages",
            "canned",
            "other",
          ].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Food Resources Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Food Inventory
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Apple className="text-gray-400 mr-3" size={16} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.item_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{item.cost_per_unit}/{item.unit}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.quantity} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateStatus(
                          item.id,
                          e.target.value as FoodResource["status"]
                        )
                      }
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${getStatusColor(
                        item.status
                      )}`}
                    >
                      <option value="available">Available</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="expired">Expired</option>
                      <option value="distributed">Distributed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        isExpiringSoon(item.expiry_date)
                          ? "text-red-600 font-medium"
                          : "text-gray-900"
                      }`}
                    >
                      {new Date(item.expiry_date).toLocaleDateString()}
                      {isExpiringSoon(item.expiry_date) && (
                        <span className="ml-1 text-xs">(Soon)</span>
                      )}
                    </div>
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
                        onClick={() => deleteFoodResource(item.id)}
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
          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <Apple className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No food items yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding food items to your inventory.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? "Edit Food Item" : "Add New Food Item"}
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
                  placeholder="e.g., Rice, Wheat, Apples"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      category: e.target.value as FoodResource["category"],
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="grains">Grains</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="proteins">Proteins</option>
                  <option value="dairy">Dairy</option>
                  <option value="beverages">Beverages</option>
                  <option value="canned">Canned Goods</option>
                  <option value="other">Other</option>
                </select>
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
                    placeholder="kg, lbs, pieces"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={newItem.expiry_date}
                  onChange={(e) =>
                    setNewItem({ ...newItem, expiry_date: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) =>
                    setNewItem({ ...newItem, location: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Warehouse A, Room 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  value={newItem.supplier}
                  onChange={(e) =>
                    setNewItem({ ...newItem, supplier: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Unit (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.cost_per_unit}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      cost_per_unit: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="0.00"
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
                onClick={addFoodResource}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                {editingItem ? "Update" : "Add"} Food Item
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  resetNewItem();
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
