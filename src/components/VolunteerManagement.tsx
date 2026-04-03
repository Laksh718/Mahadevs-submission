import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Shield,
  Clock,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  RefreshCw,
} from "lucide-react";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  skills: string[];
  availability: "available" | "busy" | "unavailable";
  status: "active" | "inactive" | "pending" | "suspended";
  experience_level: "beginner" | "intermediate" | "experienced" | "expert";
  emergency_contact: string;
  emergency_phone: string;
  background_checked: boolean;
  training_completed: boolean;
  hours_volunteered: number;
  last_active: string;
  joined_at: string;
  assigned_tasks: number;
  rating: number;
  notes?: string;
}

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [newVolunteer, setNewVolunteer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    skills: "",
    emergency_contact: "",
    emergency_phone: "",
    experience_level: "beginner" as Volunteer["experience_level"],
    notes: "",
  });

  // Fetch volunteers from Supabase
  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("volunteers")
        .select("*")
        .order("joined_at", { ascending: false });

      if (error) throw error;
      setVolunteers(data || []);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      setError("Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  };

  // Add new volunteer
  const addVolunteer = async () => {
    if (!newVolunteer.name || !newVolunteer.email || !newVolunteer.phone)
      return;

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("volunteers")
        .insert({
          ...newVolunteer,
          skills: newVolunteer.skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
          availability: "available",
          status: "pending",
          background_checked: false,
          training_completed: false,
          hours_volunteered: 0,
          assigned_tasks: 0,
          rating: 0,
          joined_at: now,
          last_active: now,
        })
        .select()
        .single();

      if (error) throw error;

      setVolunteers((prev) => [data, ...prev]);
      setShowAddModal(false);
      resetNewVolunteer();
    } catch (err) {
      console.error("Error adding volunteer:", err);
      setError("Failed to add volunteer");
    }
  };

  // Update volunteer status
  const updateStatus = async (id: string, status: Volunteer["status"]) => {
    try {
      const { error } = await supabase
        .from("volunteers")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setVolunteers((prev) =>
        prev.map((volunteer) =>
          volunteer.id === id ? { ...volunteer, status } : volunteer
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
  };

  // Update volunteer availability
  const updateAvailability = async (
    id: string,
    availability: Volunteer["availability"]
  ) => {
    try {
      const { error } = await supabase
        .from("volunteers")
        .update({
          availability,
          last_active: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setVolunteers((prev) =>
        prev.map((volunteer) =>
          volunteer.id === id
            ? {
                ...volunteer,
                availability,
                last_active: new Date().toISOString(),
              }
            : volunteer
        )
      );
    } catch (err) {
      console.error("Error updating availability:", err);
      setError("Failed to update availability");
    }
  };

  // Toggle background check
  const toggleBackgroundCheck = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("volunteers")
        .update({ background_checked: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setVolunteers((prev) =>
        prev.map((volunteer) =>
          volunteer.id === id
            ? { ...volunteer, background_checked: !currentStatus }
            : volunteer
        )
      );
    } catch (err) {
      console.error("Error updating background check:", err);
      setError("Failed to update background check");
    }
  };

  // Toggle training status
  const toggleTrainingStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("volunteers")
        .update({ training_completed: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setVolunteers((prev) =>
        prev.map((volunteer) =>
          volunteer.id === id
            ? { ...volunteer, training_completed: !currentStatus }
            : volunteer
        )
      );
    } catch (err) {
      console.error("Error updating training status:", err);
      setError("Failed to update training status");
    }
  };

  // Delete volunteer
  const deleteVolunteer = async (id: string) => {
    try {
      const { error } = await supabase.from("volunteers").delete().eq("id", id);

      if (error) throw error;

      setVolunteers((prev) => prev.filter((volunteer) => volunteer.id !== id));
    } catch (err) {
      console.error("Error deleting volunteer:", err);
      setError("Failed to delete volunteer");
    }
  };

  const resetNewVolunteer = () => {
    setNewVolunteer({
      name: "",
      email: "",
      phone: "",
      address: "",
      skills: "",
      emergency_contact: "",
      emergency_phone: "",
      experience_level: "beginner",
      notes: "",
    });
  };

  useEffect(() => {
    fetchVolunteers();

    // Set up real-time subscription
    const subscription = supabase
      .channel("volunteers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "volunteers" },
        (payload) => {
          console.log("Volunteers change received:", payload);
          fetchVolunteers(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      case "suspended":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "text-green-600 bg-green-100";
      case "busy":
        return "text-yellow-600 bg-yellow-100";
      case "unavailable":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case "expert":
        return "text-purple-600 bg-purple-100";
      case "experienced":
        return "text-blue-600 bg-blue-100";
      case "intermediate":
        return "text-yellow-600 bg-yellow-100";
      case "beginner":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredVolunteers =
    selectedStatus === "all"
      ? volunteers
      : volunteers.filter((volunteer) => volunteer.status === selectedStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Volunteer System Active
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Total Volunteers: {volunteers.length}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchVolunteers}
            className="px-3 py-1.5 text-sm border border-green-300 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Volunteer
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-lg border p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-blue-700">
              Total Volunteers
            </div>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {volunteers.length}
          </div>
          <p className="text-xs text-blue-600">Registered volunteers</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 rounded-lg border p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-green-700">Active</div>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-800">
            {volunteers.filter((v) => v.status === "active").length}
          </div>
          <p className="text-xs text-green-600">Currently active</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg border p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-emerald-700">
              Available
            </div>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800">
            {volunteers.filter((v) => v.availability === "available").length}
          </div>
          <p className="text-xs text-emerald-600">Ready for assignment</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-lg border p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-purple-700">
              Total Hours
            </div>
            <Star className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-800">
            {volunteers.reduce(
              (total, v) => total + (v.hours_volunteered || 0),
              0
            )}
          </div>
          <p className="text-xs text-purple-600">Hours volunteered</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Status
          </button>
          {["active", "pending", "inactive", "suspended"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Volunteer Directory
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <Users className="text-blue-600" size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {volunteer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {volunteer.hours_volunteered || 0}h volunteered •
                          Rating: {volunteer.rating || 0}/5
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        {volunteer.email}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone size={12} />
                        {volunteer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {volunteer.skills?.slice(0, 2).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {volunteer.skills?.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{volunteer.skills.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getExperienceColor(
                        volunteer.experience_level
                      )}`}
                    >
                      {volunteer.experience_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={volunteer.status}
                      onChange={(e) =>
                        updateStatus(
                          volunteer.id,
                          e.target.value as Volunteer["status"]
                        )
                      }
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${getStatusColor(
                        volunteer.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={volunteer.availability}
                      onChange={(e) =>
                        updateAvailability(
                          volunteer.id,
                          e.target.value as Volunteer["availability"]
                        )
                      }
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${getAvailabilityColor(
                        volunteer.availability
                      )}`}
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          toggleBackgroundCheck(
                            volunteer.id,
                            volunteer.background_checked
                          )
                        }
                        className={`p-1 rounded ${
                          volunteer.background_checked
                            ? "text-green-600 bg-green-100"
                            : "text-gray-400 bg-gray-100"
                        }`}
                        title="Background Check"
                      >
                        <Shield size={14} />
                      </button>
                      <button
                        onClick={() =>
                          toggleTrainingStatus(
                            volunteer.id,
                            volunteer.training_completed
                          )
                        }
                        className={`p-1 rounded ${
                          volunteer.training_completed
                            ? "text-blue-600 bg-blue-100"
                            : "text-gray-400 bg-gray-100"
                        }`}
                        title="Training Completed"
                      >
                        <CheckCircle size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingVolunteer(volunteer)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteVolunteer(volunteer.id)}
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
          {filteredVolunteers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No volunteers yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding volunteers to your team.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingVolunteer) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingVolunteer ? "Edit Volunteer" : "Add New Volunteer"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newVolunteer.name}
                  onChange={(e) =>
                    setNewVolunteer({ ...newVolunteer, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newVolunteer.email}
                    onChange={(e) =>
                      setNewVolunteer({
                        ...newVolunteer,
                        email: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={newVolunteer.phone}
                    onChange={(e) =>
                      setNewVolunteer({
                        ...newVolunteer,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newVolunteer.address}
                  onChange={(e) =>
                    setNewVolunteer({
                      ...newVolunteer,
                      address: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Street, City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={newVolunteer.skills}
                  onChange={(e) =>
                    setNewVolunteer({ ...newVolunteer, skills: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="First Aid, Communication, Leadership"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  value={newVolunteer.experience_level}
                  onChange={(e) =>
                    setNewVolunteer({
                      ...newVolunteer,
                      experience_level: e.target
                        .value as Volunteer["experience_level"],
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="experienced">Experienced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={newVolunteer.emergency_contact}
                    onChange={(e) =>
                      setNewVolunteer({
                        ...newVolunteer,
                        emergency_contact: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Contact Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={newVolunteer.emergency_phone}
                    onChange={(e) =>
                      setNewVolunteer({
                        ...newVolunteer,
                        emergency_phone: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={newVolunteer.notes}
                  onChange={(e) =>
                    setNewVolunteer({ ...newVolunteer, notes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Additional notes about the volunteer..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addVolunteer}
                disabled={
                  !newVolunteer.name ||
                  !newVolunteer.email ||
                  !newVolunteer.phone
                }
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {editingVolunteer ? "Update" : "Add"} Volunteer
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingVolunteer(null);
                  resetNewVolunteer();
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
