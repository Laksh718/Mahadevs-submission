import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  User,
  Heart,
  Star,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Settings,
  Plus,
  Target,
  Globe,
  Award,
  Zap,
} from "lucide-react";
import {
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  subscribeToUsers,
  testSupabaseConnection,
  checkCurrentUserAdminStatus,
  syncFirebaseUsersToSupabase,
  AdminUser,
  getSupabaseAdminUsers,
  createSupabaseAdminUser,
  updateSupabaseAdminUser,
  deleteSupabaseAdminUser,
  SupabaseAdminUser,
} from "@/lib/adminSupabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// Static data for dropdowns
const staticData = {
  roles: [
    { value: "CITIZEN", label: "Citizen" },
    { value: "VOLUNTEER", label: "Volunteer" },
    { value: "NGO", label: "NGO" },
    { value: "DMA", label: "DMA" },
    { value: "ADMIN", label: "Admin" },
    // Legacy roles for backward compatibility
    { value: "user", label: "User (Legacy)" },
    { value: "rescue_team", label: "Rescue Team (Legacy)" },
  ],
  regions: [
    "All Regions",
    "Sector 17",
    "Sector 22",
    "Sector 35",
    "Sector 8",
    "Sector 11",
  ],
};

const AdminUsers = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Manage user form state
  const [manageForm, setManageForm] = useState({
    role: "",
    status: "",
    region: "",
    notes: "",
  });

  // Real data state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [volunteers, setVolunteers] = useState<AdminUser[]>([]);
  const [ngos, setNgos] = useState<AdminUser[]>([]);
  const [supabaseAdmins, setSupabaseAdmins] = useState<SupabaseAdminUser[]>([]);

  // Load initial data
  useEffect(() => {
    loadUsers();
    loadSupabaseAdmins();
  }, []);

  // Real-time user updates
  useEffect(() => {
    if (!isLive) return;

    const subscription = subscribeToUsers((payload) => {
      console.log("User update received:", payload);

      // Handle Supabase real-time payload structure
      if (payload.eventType === "UPDATE" && payload.new) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === payload.new.id ? { ...user, ...payload.new } : user
          )
        );
        setVolunteers((prevVolunteers) =>
          prevVolunteers.map((user) =>
            user.id === payload.new.id ? payload.new : user
          )
        );
        setNgos((prevNgos) =>
          prevNgos.map((user) =>
            user.id === payload.new.id ? payload.new : user
          )
        );
      } else if (payload.eventType === "INSERT" && payload.new) {
        setUsers((prevUsers) => [payload.new, ...prevUsers]);
        if (
          payload.new.role === "VOLUNTEER" ||
          payload.new.role === "volunteer" ||
          payload.new.role === "rescue_team"
        ) {
          setVolunteers((prevVolunteers) => [payload.new, ...prevVolunteers]);
        }
        if (payload.new.role === "NGO") {
          setNgos((prevNgos) => [payload.new, ...prevNgos]);
        }
      } else if (payload.eventType === "DELETE" && payload.old) {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== payload.old.id)
        );
        setVolunteers((prevVolunteers) =>
          prevVolunteers.filter((user) => user.id !== payload.old.id)
        );
        setNgos((prevNgos) =>
          prevNgos.filter((user) => user.id !== payload.old.id)
        );
      }

      setLastUpdate(new Date());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLive]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log("Loading users from Supabase...");
      const userData = await getAdminUsers();
      console.log("Loaded users:", userData);
      setUsers(userData);
      setVolunteers(
        userData.filter(
          (user) =>
            user.role === "VOLUNTEER" ||
            user.role === "volunteer" ||
            user.role === "rescue_team"
        )
      );
      setNgos(userData.filter((user) => user.role === "NGO"));
      setLastUpdate(new Date());
      console.log("Users state updated:", userData.length, "users loaded");
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadSupabaseAdmins = async () => {
    try {
      console.log("Loading Supabase admin users...");
      const adminData = await getSupabaseAdminUsers();
      console.log("Loaded Supabase admins:", adminData);
      setSupabaseAdmins(adminData);
      console.log(
        "Supabase admins state updated:",
        adminData.length,
        "admins loaded"
      );
    } catch (error) {
      console.error("Error loading Supabase admins:", error);
      toast.error("Failed to load admin users");
    }
  };

  const refreshData = async () => {
    await loadUsers();
    await loadSupabaseAdmins();
    toast.success("User data refreshed successfully");
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        toast.success("Supabase connection successful!");
      } else {
        toast.error("Supabase connection failed!");
      }
    } catch (error) {
      console.error("Connection test error:", error);
      toast.error("Connection test failed!");
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    setLoading(true);
    try {
      const { isAdmin, user } = await checkCurrentUserAdminStatus();
      if (isAdmin) {
        toast.success(`Admin access confirmed! Role: ${user?.role}`);
      } else {
        toast.error(`Not an admin! Current role: ${user?.role || "Unknown"}`);
      }
    } catch (error) {
      console.error("Admin status check error:", error);
      toast.error("Admin status check failed!");
    } finally {
      setLoading(false);
    }
  };

  const syncUsers = async () => {
    setLoading(true);
    try {
      console.log("Syncing Firebase users to Supabase...");
      const result = await syncFirebaseUsersToSupabase();

      if (result.success) {
        toast.success(result.message);
        // Reload users after sync
        await loadUsers();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync users");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "DMA":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "NGO":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "VOLUNTEER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CITIZEN":
        return "bg-green-100 text-green-800 border-green-200";
      // Legacy role support
      case "RESCUE_TEAM":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "USER":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "standby":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return <Crown className="h-4 w-4" />;
      case "DMA":
        return <Shield className="h-4 w-4" />;
      case "NGO":
        return <Heart className="h-4 w-4" />;
      case "VOLUNTEER":
        return <Users className="h-4 w-4" />;
      case "CITIZEN":
        return <User className="h-4 w-4" />;
      // Legacy role support
      case "RESCUE_TEAM":
        return <Shield className="h-4 w-4" />;
      case "USER":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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

  const handleManageUser = (user: any) => {
    setSelectedUser(user);
    setManageForm({
      role: user.role,
      status: user.status,
      region: user.region,
      notes: user.notes || "",
    });
    setShowManageDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const success = await updateUserRole(selectedUser.id, manageForm.role);
      if (success) {
        await updateUserStatus(selectedUser.id, manageForm.status);
        await loadUsers(); // Reload data
        setShowManageDialog(false);
        setSelectedUser(null);
        toast.success("User updated successfully");
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    setLoading(true);
    try {
      const success = await updateUserStatus(userId, "suspended");
      if (success) {
        await loadUsers();
        toast.success("User suspended successfully");
      } else {
        toast.error("Failed to suspend user");
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      toast.error("Failed to suspend user");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId: string) => {
    setLoading(true);
    try {
      const success = await updateUserStatus(userId, "active");
      if (success) {
        await loadUsers();
        toast.success("User activated successfully");
      } else {
        toast.error("Failed to activate user");
      }
    } catch (error) {
      console.error("Error activating user:", error);
      toast.error("Failed to activate user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const success = await deleteUser(userId);
      if (success) {
        await loadUsers();
        toast.success("User deleted successfully");
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const openManageDialog = (user: any) => {
    setSelectedUser(user);
    setManageForm({
      role: user.role,
      status: user.status,
      region: user.region,
      notes: "",
    });
    setShowManageDialog(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      (user.display_name || user.email)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    const matchesRegion =
      filterRegion === "all" || user.region === filterRegion;

    return matchesSearch && matchesRole && matchesStatus && matchesRegion;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const volunteerCount = users.filter(
    (u) =>
      u.role?.toUpperCase() === "VOLUNTEER" ||
      u.role === "volunteer" ||
      u.role === "rescue_team"
  ).length;
  const ngoCount = users.filter((u) => u.role?.toUpperCase() === "NGO").length;
  const admins = supabaseAdmins.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Real-time Status Bar */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-teal-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {isLive ? "Live User Status" : "Paused"}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <div className="text-xs text-green-600">
              Online: {users.filter((u) => u.is_online).length}/{users.length}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className={
                isLive
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              }
            >
              <Activity className="h-4 w-4 mr-2" />
              {isLive ? "Live" : "Paused"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={loading}
              className="hover:bg-green-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={checkAdminStatus}
              disabled={loading}
              className="hover:bg-blue-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              Check Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={syncUsers}
              disabled={loading}
              className="hover:bg-purple-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Sync Users
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </div>
        </div>

        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-5">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Volunteers
              </CardTitle>
              <Heart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerCount}</div>
              <p className="text-xs text-muted-foreground">Active volunteers</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                NGOs
              </CardTitle>
              <Heart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ngoCount}</div>
              <p className="text-xs text-muted-foreground">NGO Partners</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admins
              </CardTitle>
              <Crown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins}</div>
              <p className="text-xs text-muted-foreground">Administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              <Users className="h-4 w-4 mr-2" />
              All Users
            </TabsTrigger>
            <TabsTrigger
              value="volunteers"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              <Heart className="h-4 w-4 mr-2" />
              Volunteers
            </TabsTrigger>
            <TabsTrigger
              value="ngos"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              <Heart className="h-4 w-4 mr-2" />
              NGOs
            </TabsTrigger>
            <TabsTrigger
              value="admins"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              <Crown className="h-4 w-4 mr-2" />
              Admins
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* All Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-teal-600" />
                      User List
                    </CardTitle>
                    <CardDescription>
                      Manage all registered users
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshData}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 border-gray-200"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-32 bg-white/50 border-gray-200">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="rescue_team">Rescue Team</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 bg-white/50 border-gray-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterRegion} onValueChange={setFilterRegion}>
                    <SelectTrigger className="w-32 bg-white/50 border-gray-200">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {staticData.regions.slice(1).map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {loading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading users...</span>
                      </div>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Users Found
                      </h3>
                      <p className="text-gray-600 text-center">
                        {users.length === 0
                          ? "No users in database"
                          : "No users match your filters"}
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <Card
                        key={user.id}
                        className="bg-white/50 border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar || ""} />
                              <AvatarFallback className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                                {(user.display_name || user.email)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {user.display_name || user.email}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                              {user.is_online && (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.role)}
                            <Badge className={getRoleColor(user.role)}>
                              {user.role.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user.region}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Reports: {user.reports_submitted}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(user.last_activity)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openManageDialog(user)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                            {user.status === "active" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuspendUser(user.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActivateUser(user.id)}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-purple-600" />
                      Volunteer Directory
                    </CardTitle>
                    <CardDescription>
                      Manage volunteers and their specializations
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshData}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {loading ? (
                    <div className="col-span-full flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading volunteers...</span>
                      </div>
                    </div>
                  ) : volunteers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-8">
                      <Heart className="h-8 w-8 text-gray-400" />
                      <span className="text-gray-500 mt-2">
                        No volunteers found
                      </span>
                      <span className="text-sm text-gray-400">
                        {users.length === 0
                          ? "No users in database"
                          : "No volunteers available"}
                      </span>
                    </div>
                  ) : (
                    volunteers.map((volunteer) => (
                      <Card
                        key={volunteer.id}
                        className="bg-white/50 border-gray-200"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                {(volunteer.display_name || volunteer.email)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {volunteer.display_name || volunteer.email}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {volunteer.email}
                              </p>
                            </div>
                            <Badge className={getStatusColor(volunteer.status)}>
                              {volunteer.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">
                              {volunteer.specialization}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">
                              {volunteer.experience} experience
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{volunteer.region}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-orange-600" />
                            <span className="text-sm">
                              {volunteer.reports_submitted} reports
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">
                              {volunteer.rating}/5.0 rating
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-teal-600" />
                            <span className="text-sm">
                              {volunteer.volunteer_status}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Last active: {formatDate(volunteer.last_activity)}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() =>
                                  toast.success(
                                    `Calling ${volunteer.name} at ${volunteer.phone}`
                                  )
                                }
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() =>
                                  toast.success(
                                    `Email sent to ${volunteer.email}`
                                  )
                                }
                              >
                                <Mail className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleManageUser(volunteer)}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NGOs Tab */}
          <TabsContent value="ngos" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-purple-600" />
                      NGO Directory
                    </CardTitle>
                    <CardDescription>
                      Manage NGO partners and their operations
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshData}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Showing {ngos.length} NGO partners</span>
                  </div>
                  {ngos.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No NGO Partners Found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        NGO partners will appear here once they register
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {ngos.map((ngo) => (
                        <Card
                          key={ngo.id}
                          className="border border-purple-100 hover:border-purple-300 transition-colors"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={ngo.avatar || ""}
                                    alt={ngo.name || ngo.email}
                                  />
                                  <AvatarFallback className="bg-purple-100 text-purple-700">
                                    {(ngo.name || ngo.email || "N")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {ngo.name || ngo.email}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {ngo.organization || "NGO Organization"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {ngo.district}, {ngo.state}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <Badge
                                className={getRoleColor(ngo.role)}
                                variant="outline"
                              >
                                {getRoleIcon(ngo.role)}
                                <span className="ml-1">{ngo.role}</span>
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Joined {formatDate(ngo.created_at)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Crown className="h-5 w-5 mr-2 text-red-600" />
                      Admin Directory
                    </CardTitle>
                    <CardDescription>
                      Manage administrator accounts and permissions
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshData}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {loading ? (
                    <div className="col-span-full flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading admins...</span>
                      </div>
                    </div>
                  ) : supabaseAdmins.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-8">
                      <Crown className="h-8 w-8 text-gray-400" />
                      <span className="text-gray-500 mt-2">
                        No admins found
                      </span>
                      <span className="text-sm text-gray-400">
                        No Supabase admin accounts available
                      </span>
                    </div>
                  ) : (
                    supabaseAdmins.map((admin) => (
                      <Card
                        key={admin.id}
                        className="bg-white/50 border-red-200"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                                {(admin.user_metadata?.full_name || admin.email)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {admin.user_metadata?.full_name || admin.email}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {admin.email}
                              </p>
                            </div>
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">
                              Supabase Administrator
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                admin.email_confirmed_at
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }
                            >
                              {admin.email_confirmed_at
                                ? "Verified"
                                : "Pending"}
                            </Badge>
                            {admin.last_sign_in_at && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600">
                                  Active
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">
                              Created: {formatDate(admin.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">
                              Last sign-in:{" "}
                              {admin.last_sign_in_at
                                ? formatDate(admin.last_sign_in_at)
                                : "Never"}
                            </span>
                          </div>
                          {admin.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{admin.phone}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Supabase Admin ID: {admin.id.slice(0, 8)}...
                            </span>
                            <div className="flex items-center space-x-1">
                              {admin.phone && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() =>
                                    toast.success(
                                      `Calling ${
                                        admin.user_metadata?.full_name ||
                                        admin.email
                                      } at ${admin.phone}`
                                    )
                                  }
                                >
                                  <Phone className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() =>
                                  toast.success(`Email sent to ${admin.email}`)
                                }
                              >
                                <Mail className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() =>
                                  toast.info(`Supabase admin: ${admin.email}`)
                                }
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                    User Role Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {users.filter((u) => u.role === "user").length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Regular Users
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {users.filter((u) => u.role === "volunteer").length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Volunteers
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {
                              users.filter((u) => u.role === "rescue_team")
                                .length
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            Rescue Teams
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {users.filter((u) => u.role === "admin").length}
                          </div>
                          <div className="text-sm text-gray-600">Admins</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: {users.length} users
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-green-600" />
                    User Growth Trend
                  </CardTitle>
                  <CardDescription>
                    Monthly user registration trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center w-full">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {users.filter((u) => u.status === "active").length}
                          </div>
                          <div className="text-sm text-gray-600">Active</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {users.filter((u) => u.status === "pending").length}
                          </div>
                          <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {
                              users.filter((u) => u.status === "suspended")
                                .length
                            }
                          </div>
                          <div className="text-sm text-gray-600">Suspended</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        Status Distribution
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Active Users</span>
                          <span className="font-medium">
                            {users.length > 0
                              ? Math.round(
                                  (users.filter((u) => u.status === "active")
                                    .length /
                                    users.length) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                users.length > 0
                                  ? (users.filter((u) => u.status === "active")
                                      .length /
                                      users.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Manage User Dialog */}
        <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage User</DialogTitle>
              <DialogDescription>
                Update user role, status, and region
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                      {(selectedUser.display_name || selectedUser.email)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {selectedUser.display_name || selectedUser.email}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={manageForm.role}
                      onValueChange={(value) =>
                        setManageForm((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {staticData.roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={manageForm.status}
                      onValueChange={(value) =>
                        setManageForm((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={manageForm.region}
                    onValueChange={(value) =>
                      setManageForm((prev) => ({ ...prev, region: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {staticData.regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={manageForm.notes}
                    onChange={(e) =>
                      setManageForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Add notes about this user..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowManageDialog(false)}
              >
                Cancel
              </Button>
              {selectedUser && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowManageDialog(false);
                    handleDeleteUser(selectedUser.id);
                  }}
                  disabled={loading}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </Button>
              )}
              <Button onClick={handleUpdateUser} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
