import React, { useState, useEffect } from "react";
import NGOLayout from "@/components/NGOLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Heart, UserPlus, UserCheck, Award, RefreshCw, Activity, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { 
  getAdminUsers, 
  updateUserRole, 
  updateUserStatus, 
  subscribeToUsers,
  AdminUser 
} from '@/lib/adminSupabase';

const NGOUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Load initial data
  useEffect(() => {
    loadUsers();
  }, []);

  // Real-time user updates
  useEffect(() => {
    if (!isLive) return;

    const subscription = subscribeToUsers((payload) => {
      console.log('User update received:', payload);
      
      if (payload.eventType === 'UPDATE' && payload.new) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === payload.new.id ? { ...user, ...payload.new } : user
          )
        );
      } else if (payload.eventType === 'INSERT' && payload.new) {
        setUsers(prevUsers => [payload.new, ...prevUsers]);
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== payload.old.id));
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
      console.log('Loading users from Supabase...');
      const userData = await getAdminUsers();
      console.log('Loaded users:', userData);
      setUsers(userData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    volunteers: users.filter(u => u.role === "volunteer").length,
    active: users.filter(u => u.status === "active").length,
    ngo: users.filter(u => u.role === "emergency_responder").length
  };

  return (
    <NGOLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NGO User Management</h1>
            <p className="text-gray-600 mt-1">Manage volunteers and community members</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadUsers} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant={isLive ? "default" : "outline"} 
              onClick={() => setIsLive(!isLive)}
            >
              <Activity className="w-4 h-4 mr-2" />
              Live Updates {isLive ? 'ON' : 'OFF'}
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Volunteer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Users</p>
                  <p className="text-3xl font-bold text-purple-800">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Members</p>
                  <p className="text-3xl font-bold text-green-800">{stats.active}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Volunteers</p>
                  <p className="text-3xl font-bold text-blue-800">{stats.volunteers}</p>
                </div>
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600">NGO Staff</p>
                  <p className="text-3xl font-bold text-pink-800">{stats.ngo}</p>
                </div>
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Certified Trainers</p>
                  <p className="text-3xl font-bold text-yellow-800">23</p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name, email, or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="volunteer">Volunteers</option>
            <option value="emergency_responder">NGO Staff</option>
            <option value="user">Citizens</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No users found matching your filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.display_name || user.email}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            user.role === 'volunteer' ? 'border-purple-200 text-purple-800' :
                            user.role === 'emergency_responder' ? 'border-pink-200 text-pink-800' :
                            'border-gray-200 text-gray-800'
                          }
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            user.status === 'active' ? 'border-green-200 text-green-800' :
                            user.status === 'suspended' ? 'border-red-200 text-red-800' :
                            'border-gray-200 text-gray-800'
                          }
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.region}</TableCell>
                      <TableCell>{new Date(user.joined_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </NGOLayout>
  );
};

export default NGOUsers;