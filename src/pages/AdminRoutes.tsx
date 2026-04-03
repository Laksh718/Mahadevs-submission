import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InteractiveMap from '@/components/InteractiveMap';
import { useInteractiveMap } from '@/hooks/useInteractiveMap';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { 
  Route,
  MapPin,
  Navigation,
  Clock,
  Users,
  Plus,
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
  Activity,
  Target,
  BarChart3,
  Car,
  Ship,
  Plane,
  Phone,
  Mail,
  Calendar,
  Download,
  Settings,
  Map,
  Globe,
  Zap,
  Maximize,
  Minimize,
  Layers,
  Compass,
} from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// MapClickHandler component for the fullscreen dialog
const MapClickHandler: React.FC<{
  onAddPoint: (lat: number, lng: number, type: 'origin' | 'destination' | 'waypoint', label?: string) => void;
  points: any[];
  onShowClickFeedback: (lat: number, lng: number) => void;
}> = ({ onAddPoint, points, onShowClickFeedback }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      
      // Show visual feedback
      onShowClickFeedback(lat, lng);
      
      // Determine point type based on existing points
      let type: 'origin' | 'destination' | 'waypoint' = 'waypoint';
      if (points.length === 0) {
        type = 'origin';
      } else if (points.length === 1) {
        type = 'destination';
      }
      
      // Add point
      onAddPoint(lat, lng, type);
    }
  });
  
  return null;
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

// Mock data for development
const mockData = {
  missions: [
    {
      id: 1,
      missionId: "RESCUE-001",
      title: "Emergency Evacuation - Sector 17",
      origin: "Rescue Base Alpha",
      destination: "Sector 17 Community Center",
      mode: "Boat",
      assignedTeam: "Team Alpha",
      teamLeader: "Captain Rajesh",
      teamContact: "+91 98765 43210",
      status: "active",
      priority: "critical",
      estimatedTime: "45 minutes",
      distance: "12.5 km",
      startTime: "2024-01-15T10:30:00Z",
      expectedCompletion: "2024-01-15T11:15:00Z",
      actualCompletion: null,
      description: "Evacuate 25 families from flooded residential area",
      coordinates: {
        origin: { lat: 30.7333, lng: 76.7794 },
        destination: { lat: 30.7400, lng: 76.7850 }
      },
      route: [
        { lat: 30.7333, lng: 76.7794 },
        { lat: 30.7350, lng: 76.7800 },
        { lat: 30.7375, lng: 76.7825 },
        { lat: 30.7400, lng: 76.7850 }
      ],
      alternateRoutes: [
        {
          id: 1,
          distance: "15.2 km",
          estimatedTime: "55 minutes",
          reason: "Avoid flooded main road"
        },
        {
          id: 2,
          distance: "18.7 km",
          estimatedTime: "65 minutes",
          reason: "Use highway bypass"
        }
      ]
    },
    {
      id: 2,
      missionId: "RESCUE-002",
      title: "Medical Supply Delivery",
      origin: "Medical Center",
      destination: "Sector 22 School",
      mode: "Road",
      assignedTeam: "Team Beta",
      teamLeader: "Dr. Priya",
      teamContact: "+91 98765 43211",
      status: "planned",
      priority: "high",
      estimatedTime: "30 minutes",
      distance: "8.3 km",
      startTime: "2024-01-15T12:00:00Z",
      expectedCompletion: "2024-01-15T12:30:00Z",
      actualCompletion: null,
      description: "Deliver emergency medical supplies to shelter",
      coordinates: {
        origin: { lat: 30.7200, lng: 76.7700 },
        destination: { lat: 30.7300, lng: 76.7800 }
      },
      route: [
        { lat: 30.7200, lng: 76.7700 },
        { lat: 30.7250, lng: 76.7750 },
        { lat: 30.7300, lng: 76.7800 }
      ],
      alternateRoutes: [
        {
          id: 1,
          distance: "9.1 km",
          estimatedTime: "35 minutes",
          reason: "Avoid traffic congestion"
        }
      ]
    },
    {
      id: 3,
      missionId: "RESCUE-003",
      title: "Food Distribution - Sector 35",
      origin: "Food Distribution Center",
      destination: "Sports Complex Sector 35",
      mode: "Road",
      assignedTeam: "Team Gamma",
      teamLeader: "Amit Singh",
      teamContact: "+91 98765 43212",
      status: "completed",
      priority: "medium",
      estimatedTime: "25 minutes",
      distance: "6.7 km",
      startTime: "2024-01-15T08:00:00Z",
      expectedCompletion: "2024-01-15T08:25:00Z",
      actualCompletion: "2024-01-15T08:22:00Z",
      description: "Distribute food packets to 200 people at shelter",
      coordinates: {
        origin: { lat: 30.7100, lng: 76.7600 },
        destination: { lat: 30.7500, lng: 76.7900 }
      },
      route: [
        { lat: 30.7100, lng: 76.7600 },
        { lat: 30.7300, lng: 76.7750 },
        { lat: 30.7500, lng: 76.7900 }
      ],
      alternateRoutes: []
    }
  ],
  rescueTeams: [
    { id: 1, name: "Team Alpha", leader: "Captain Rajesh", contact: "+91 98765 43210", status: "active", specialization: "Water Rescue" },
    { id: 2, name: "Team Beta", leader: "Dr. Priya", contact: "+91 98765 43211", status: "active", specialization: "Medical" },
    { id: 3, name: "Team Gamma", leader: "Amit Singh", contact: "+91 98765 43212", status: "active", specialization: "Logistics" },
    { id: 4, name: "Team Delta", leader: "Sarah Wilson", contact: "+91 98765 43213", status: "standby", specialization: "Search & Rescue" }
  ],
  locations: [
    "Rescue Base Alpha",
    "Medical Center",
    "Food Distribution Center",
    "Sector 17 Community Center",
    "Sector 22 School",
    "Sports Complex Sector 35",
    "Sector 8 Temple Hall",
    "Sector 11 Community Hall"
  ]
};

const AdminRoutes = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('planning');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [showRoutePlanningDialog, setShowRoutePlanningDialog] = useState(false);
  
  // Interactive map hook with error handling
  let interactiveMap;
  try {
    interactiveMap = useInteractiveMap();
  } catch (err) {
    console.error('Error initializing interactive map:', err);
    setError('Failed to initialize map. Please refresh the page.');
  }
  
  // Create mission form state
  const [missionForm, setMissionForm] = useState({
    title: '',
    origin: '',
    destination: '',
    mode: 'Road',
    assignedTeam: '',
    priority: 'medium',
    description: '',
    startTime: ''
  });

  // Mock data state
  const [data, setData] = useState(mockData);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call with real data updates
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        missions: prev.missions.map(mission => ({
          ...mission,
          lastUpdated: new Date().toISOString()
        }))
      }));
      setLoading(false);
      toast.success('Route data refreshed successfully');
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Boat': return <Ship className="h-4 w-4" />;
      case 'Road': return <Car className="h-4 w-4" />;
      case 'Air': return <Plane className="h-4 w-4" />;
      default: return <Navigation className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateMission = async () => {
    if (!missionForm.title.trim() || !missionForm.origin.trim() || !missionForm.destination.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newMission = {
        id: Date.now(),
        ...missionForm,
        status: 'planned',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        estimatedDuration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        distance: Math.floor(Math.random() * 50) + 5 // 5-55 km
      };

      setData(prev => ({
        ...prev,
        missions: [newMission, ...prev.missions]
      }));

      setMissionForm({
        title: '',
        origin: '',
        destination: '',
        mode: 'Road',
        assignedTeam: '',
        priority: 'medium',
        description: '',
        startTime: ''
      });
      setLoading(false);
      toast.success('Mission created successfully');
    }, 1000);
  };

  const handleUpdateMissionStatus = async (missionId: string, status: string) => {
    setLoading(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        missions: prev.missions.map(mission => 
          mission.id === missionId 
            ? { ...mission, status, lastUpdated: new Date().toISOString() }
            : mission
        )
      }));
      setLoading(false);
      toast.success(`Mission ${status} successfully`);
    }, 1000);
  };

  const handleDeleteMission = async (missionId: string) => {
    setLoading(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        missions: prev.missions.filter(mission => mission.id !== missionId)
      }));
      setLoading(false);
      toast.success('Mission deleted successfully');
    }, 1000);
  };

  const openRoutePlanningDialog = () => {
    setShowRoutePlanningDialog(true);
    toast.success('Opening enhanced route planning');
  };

  const handlePlanRoute = async () => {
    if (!routeForm.origin.trim() || !routeForm.destination.trim()) {
      toast.error('Please enter origin and destination');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Simulate route planning
      const newRoute = {
        id: Date.now(),
        origin: routeForm.origin,
        destination: routeForm.destination,
        mode: routeForm.mode,
        distance: Math.floor(Math.random() * 50) + 5,
        duration: Math.floor(Math.random() * 120) + 30,
        status: 'planned',
        createdAt: new Date().toISOString()
      };

      setData(prev => ({
        ...prev,
        routes: [newRoute, ...prev.routes]
      }));

      setRouteForm({
        origin: '',
        destination: '',
        mode: 'Road'
      });
      setLoading(false);
      toast.success('Route planned successfully');
    }, 1000);
  };





  const filteredMissions = data.missions.filter(mission => {
    const matchesSearch = searchTerm === '' || 
      mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.missionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.assignedTeam.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || mission.status === filterStatus;
    const matchesMode = filterMode === 'all' || mission.mode === filterMode;
    const matchesPriority = filterPriority === 'all' || mission.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesMode && matchesPriority;
  });

  const activeMissions = filteredMissions.filter(m => m.status === 'active');
  const plannedMissions = filteredMissions.filter(m => m.status === 'planned');
  const completedMissions = filteredMissions.filter(m => m.status === 'completed');

  // Show error if map initialization failed
  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Routes Page</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show loading if interactiveMap is not ready
  if (!interactiveMap) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Routes Page</h2>
            <p className="text-gray-600">Initializing interactive map...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Route & Rescue Planning</h1>
          <p className="text-sm text-gray-600">Plan and manage rescue missions with optimal routing</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Mission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Rescue Mission</DialogTitle>
                <DialogDescription>
                  Plan a new rescue mission with route optimization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Mission Title *</Label>
                  <Input
                    id="title"
                    value={missionForm.title}
                    onChange={(e) => setMissionForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter mission title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origin">Origin *</Label>
                    <Select value={missionForm.origin} onValueChange={(value) => setMissionForm(prev => ({ ...prev, origin: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select origin" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.locations.map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="destination">Destination *</Label>
                    <Select value={missionForm.destination} onValueChange={(value) => setMissionForm(prev => ({ ...prev, destination: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.locations.map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mode">Transport Mode</Label>
                    <Select value={missionForm.mode} onValueChange={(value) => setMissionForm(prev => ({ ...prev, mode: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Road">Road</SelectItem>
                        <SelectItem value="Boat">Boat</SelectItem>
                        <SelectItem value="Air">Air</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTeam">Assigned Team *</Label>
                    <Select value={missionForm.assignedTeam} onValueChange={(value) => setMissionForm(prev => ({ ...prev, assignedTeam: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.rescueTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={missionForm.priority} onValueChange={(value) => setMissionForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={missionForm.startTime}
                      onChange={(e) => setMissionForm(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={missionForm.description}
                    onChange={(e) => setMissionForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter mission description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMission} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create Mission
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Missions</CardTitle>
            <Activity className="h-3 w-3 text-green-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl font-bold">{activeMissions.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Planned Missions</CardTitle>
            <Calendar className="h-3 w-3 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl font-bold">{plannedMissions.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-3 w-3 text-gray-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl font-bold">{completedMissions.length}</div>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Available Teams</CardTitle>
            <Users className="h-3 w-3 text-purple-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl font-bold">{data.rescueTeams.filter(t => t.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Route Planning with Mission Tools */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Map Section */}
        <div className="lg:col-span-3">
          <InteractiveMap
            points={interactiveMap.points}
            routes={interactiveMap.routes}
            isCalculating={interactiveMap.isCalculating}
            showInstructions={interactiveMap.showInstructions}
            onAddPoint={interactiveMap.addPoint}
            onRemovePoint={interactiveMap.removePoint}
            onCalculateRoute={interactiveMap.calculateRoute}
            onOptimizeRoute={interactiveMap.optimizeRoute}
            onToggleInstructions={interactiveMap.toggleInstructions}
            onClearPoints={interactiveMap.clearPoints}
            onOpenFullscreen={openRoutePlanningDialog}
          />
        </div>

        {/* Mission Planning Tools */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Mission Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mission
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // Load mission data into interactive map
                    if (selectedMission) {
                      interactiveMap.clearPoints();
                      interactiveMap.addPoint(
                        selectedMission.coordinates.origin.lat,
                        selectedMission.coordinates.origin.lng,
                        'origin',
                        selectedMission.origin
                      );
                      interactiveMap.addPoint(
                        selectedMission.coordinates.destination.lat,
                        selectedMission.coordinates.destination.lng,
                        'destination',
                        selectedMission.destination
                      );
                      toast.success('Mission loaded into route planner');
                    } else {
                      toast.error('Please select a mission first');
                    }
                  }}
                  className="w-full"
                  size="sm"
                  disabled={!selectedMission}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Load Mission
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // Export route data
                    if (interactiveMap.routes.length > 0) {
                      const routeData = {
                        points: interactiveMap.points,
                        routes: interactiveMap.routes,
                        vehicle: 'car', // Default for rescue operations
                        timestamp: new Date().toISOString()
                      };
                      const blob = new Blob([JSON.stringify(routeData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `route-plan-${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Route data exported');
                    } else {
                      toast.error('No route data to export');
                    }
                  }}
                  className="w-full"
                  size="sm"
                  disabled={interactiveMap.routes.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Route
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Missions Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-sm">
                <Navigation className="h-4 w-4 mr-2 text-teal-600" />
                Rescue Missions
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast.success('Exporting missions data...');
                  setTimeout(() => {
                    toast.success('Missions exported successfully');
                  }, 2000);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Filters */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search missions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 border-gray-200"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-white/50 border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMode} onValueChange={setFilterMode}>
              <SelectTrigger className="w-32 bg-white/50 border-gray-200">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="Road">Road</SelectItem>
                <SelectItem value="Boat">Boat</SelectItem>
                <SelectItem value="Air">Air</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32 bg-white/50 border-gray-200">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Mission</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMissions.map((mission) => (
                  <TableRow key={mission.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{mission.title}</div>
                        <div className="text-sm text-muted-foreground">{mission.missionId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{mission.origin}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-3 w-3" />
                          <span>{mission.destination}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getModeIcon(mission.mode)}
                        <span className="text-sm">{mission.mode}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{mission.assignedTeam}</div>
                        <div className="text-muted-foreground">{mission.teamLeader}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(mission.priority)}>
                        {mission.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(mission.status)}>
                        {mission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{mission.estimatedTime}</div>
                        <div className="text-muted-foreground">{mission.distance}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMission(mission)}
                          className="hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {mission.status === 'planned' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateMissionStatus(mission.id, 'active')}
                            className="hover:bg-green-100 text-green-600"
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                        )}
                        {mission.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateMissionStatus(mission.id, 'completed')}
                            className="hover:bg-blue-100 text-blue-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedMission(mission)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedMission(mission);
                              setMissionForm({
                                title: mission.title,
                                origin: mission.origin,
                                destination: mission.destination,
                                mode: mission.mode,
                                assignedTeam: mission.assignedTeam,
                                priority: mission.priority,
                                description: mission.description,
                                startTime: mission.startTime
                              });
                              toast.info('Mission details loaded for editing');
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Mission
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              toast.success(`Contacting team: ${mission.assignedTeam}`);
                            }}>
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Team
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteMission(mission.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Enhanced Route Planning Dialog */}
      <Dialog open={showRoutePlanningDialog} onOpenChange={setShowRoutePlanningDialog}>
        <DialogContent className="max-w-[98vw] max-h-[95vh] w-[98vw] p-0">
          <div className="flex flex-col h-[90vh]">
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Enhanced Route Planning</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    <Layers className="h-3 w-3 mr-1" />
                    Fullscreen Map
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    <Compass className="h-3 w-3 mr-1" />
                    Interactive Planning
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const routeData = {
                      points: interactiveMap.points,
                      routes: interactiveMap.routes,
                      timestamp: new Date().toISOString(),
                      mode: 'enhanced_planning'
                    };
                    const blob = new Blob([JSON.stringify(routeData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `route-plan-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('Route data exported');
                  }}
                  disabled={interactiveMap.points.length === 0}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Route
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    interactiveMap.clearPoints();
                    toast.success('All points cleared');
                  }}
                  disabled={interactiveMap.points.length === 0}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
            
            {/* Dialog Content - 16:9 Map Layout */}
            <div className="flex-1 flex">
              {/* Map Container - 16:9 aspect ratio */}
              <div className="flex-1 relative">
                <div className="absolute inset-0 p-4">
                  <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
                    {/* Direct Map Implementation for Fullscreen */}
                    <div className="h-full w-full">
                      <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={12}
                        style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
                        zoomControl={true}
                        scrollWheelZoom={true}
                        doubleClickZoom={false}
                        dragging={true}
                        tap={true}
                        touchZoom={true}
                        boxZoom={false}
                        keyboard={true}
                        closePopupOnClick={false}
                        zoomSnap={0.25}
                        zoomDelta={0.5}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          maxZoom={19}
                          minZoom={3}
                        />
                        
                        {/* Map Click Handler */}
                        <MapClickHandler 
                          onAddPoint={interactiveMap.addPoint} 
                          points={interactiveMap.points} 
                          onShowClickFeedback={() => {}} 
                        />
                        
                        {/* Render points */}
                        {interactiveMap.points.map((point, index) => (
                          <Marker
                            key={point.id}
                            position={[point.lat, point.lng] as [number, number]}
                            icon={L.divIcon({
                              className: 'custom-div-icon',
                              html: `<div style="background-color: ${
                                point.type === 'origin' ? '#3b82f6' : 
                                point.type === 'destination' ? '#ef4444' : '#10b981'
                              }; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${
                                point.type === 'origin' ? '🏠' : 
                                point.type === 'destination' ? '🎯' : '📍'
                              }</div>`,
                              iconSize: [30, 30],
                              iconAnchor: [15, 15],
                            })}
                          >
                            <Popup>
                              <div className="p-3 min-w-[200px]">
                                <h3 className="font-semibold text-sm mb-2">
                                  {point.type === 'origin' ? '🏠 Origin Point' : 
                                   point.type === 'destination' ? '🎯 Destination' : 
                                   `📍 Waypoint ${index}`}
                                </h3>
                                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                                  <p><strong>Latitude:</strong> {point.lat.toFixed(6)}</p>
                                  <p><strong>Longitude:</strong> {point.lng.toFixed(6)}</p>
                                  {point.label && <p><strong>Label:</strong> {point.label}</p>}
                                  <p><strong>Order:</strong> {index + 1} of {interactiveMap.points.length}</p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => interactiveMap.removePoint(point.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove Point
                                </Button>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                        
                        {/* Render routes */}
                        {interactiveMap.routes.map((route, routeIndex) => (
                          <Polyline
                            key={routeIndex}
                            positions={route.points}
                            color="#3b82f6"
                            weight={4}
                            opacity={0.8}
                          />
                        ))}
                      </MapContainer>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Control Panel - Right side */}
              <div className="w-80 bg-gray-50 border-l p-4 overflow-y-auto">
                <div className="space-y-4">
                  {/* Route Controls */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Route className="h-4 w-4 mr-2 text-blue-600" />
                        Route Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={interactiveMap.calculateRoute}
                        disabled={interactiveMap.points.length < 2 || interactiveMap.isCalculating}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Route className="h-4 w-4 mr-2" />
                        {interactiveMap.isCalculating ? 'Calculating...' : 'Calculate Route'}
                      </Button>
                      <Button
                        onClick={interactiveMap.optimizeRoute}
                        disabled={interactiveMap.points.length < 3 || interactiveMap.isCalculating}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Optimize Route
                      </Button>
                      <Button
                        onClick={interactiveMap.toggleInstructions}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        {interactiveMap.showInstructions ? 'Hide' : 'Show'} Instructions
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Route Statistics */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
                        Route Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Points:</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {interactiveMap.points.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Routes Calculated:</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {interactiveMap.routes.length}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* External Tools */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-purple-600" />
                        External Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Generate Google Maps URL
                          if (interactiveMap.points.length >= 2) {
                            const points = interactiveMap.points.map(p => ({ lat: p.lat, lng: p.lng }));
                            const url = `https://www.google.com/maps/dir/${points.map(p => `${p.lat},${p.lng}`).join('/')}`;
                            window.open(url, '_blank');
                            toast.success('Opened in Google Maps');
                          } else {
                            toast.error('Need at least 2 points to open in Google Maps');
                          }
                        }}
                        className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        size="sm"
                        disabled={interactiveMap.points.length < 2}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Instructions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-orange-600" />
                        Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-gray-600 space-y-2">
                        <p>• Click on the map to add waypoints</p>
                        <p>• First click = Origin point</p>
                        <p>• Second click = Destination</p>
                        <p>• Additional clicks = Waypoints</p>
                        <p>• Use Calculate Route to find the best path</p>
                        <p>• Use Optimize Route for multiple waypoints</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRoutes;
