import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GradientCard from "@/components/GradientCard";
import EvacuationPlanner from "@/components/EvacuationPlanner";
import Notch from "@/components/Notch";
import ImageAnalysis from "@/components/ImageAnalysis";
import UserLayout from "@/components/UserLayout";
import {
  MapPin,
  Route,
  Home,
  Truck,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Navigation,
  Shield,
  Heart,
  Utensils,
  Droplets,
  Zap,
  Phone,
  Camera
} from "lucide-react";

const Planning = () => {
  const [selectedRoute, setSelectedRoute] = useState("primary");

  const evacuationRoutes = [
    {
      id: "primary",
      name: "Primary Route A",
      status: "clear",
      distance: "2.3 km",
      time: "8 min",
      capacity: 850,
      current: 245,
    },
    {
      id: "secondary",
      name: "Secondary Route B",
      status: "congested",
      distance: "3.1 km",
      time: "15 min",
      capacity: 600,
      current: 520,
    },
    {
      id: "emergency",
      name: "Emergency Route C",
      status: "blocked",
      distance: "4.2 km",
      time: "N/A",
      capacity: 400,
      current: 0,
    },
  ];

  const shelters = [
    {
      name: "Community Center",
      location: "Downtown",
      capacity: 500,
      occupied: 245,
      amenities: ["Food", "Medical", "WiFi"],
      status: "available",
      contact: "+91-98765-43210",
      lat: 30.7333,
      lon: 76.7794,
    },
    {
      name: "High School Gymnasium",
      location: "North District",
      capacity: 300,
      occupied: 180,
      amenities: ["Food", "Restrooms"],
      status: "available",
      contact: "+91-98765-43211",
      lat: 30.7500,
      lon: 76.8000,
    },
    {
      name: "Sports Complex",
      location: "East Side",
      capacity: 800,
      occupied: 650,
      amenities: ["Food", "Medical", "WiFi", "Parking"],
      status: "near_capacity",
      contact: "+91-98765-43212",
      lat: 30.7200,
      lon: 76.7500,
    },
    {
      name: "Church Hall",
      location: "West End",
      capacity: 200,
      occupied: 195,
      amenities: ["Food", "Restrooms"],
      status: "full",
      contact: "+91-98765-43213",
      lat: 30.7600,
      lon: 76.7200,
    },
  ];

  const resources = [
    { name: "Water Bottles", current: 10000, capacity: 50000, icon: Droplets, color: "blue" },
    { name: "MREs (Meals, Ready-to-Eat)", current: 5000, capacity: 20000, icon: Utensils, color: "orange" },
    { name: "First-Aid Kits", current: 2000, capacity: 5000, icon: Heart, color: "red" },
    { name: "Blankets", current: 8000, capacity: 15000, icon: Package, color: "green" },
  ];

  const deliveryMissions = [
    {
      id: "Alpha-1",
      destination: "Community Center",
      eta: "15 min",
      status: "In Transit",
      contents: "500 water, 200 MREs",
    },
    {
      id: "Bravo-2",
      destination: "High School Gymnasium",
      eta: "25 min",
      status: "Loading",
      contents: "300 first-aid, 1000 blankets",
    },
    {
      id: "Charlie-3",
      destination: "Sports Complex",
      eta: "5 min",
      status: "Delivered",
      contents: "1000 water, 500 MREs",
    },
  ];

  const getRouteStatus = (status: string) => {
    switch (status) {
      case "clear":
        return { color: "text-green-600 bg-green-100", icon: CheckCircle };
      case "congested":
        return { color: "text-yellow-600 bg-yellow-100", icon: Clock };
      case "blocked":
        return { color: "text-red-600 bg-red-100", icon: AlertTriangle };
      default:
        return { color: "text-blue-600 bg-blue-100", icon: MapPin };
    }
  };

  const getShelterStatus = (status: string) => {
    switch (status) {
      case "available":
        return { color: "text-green-600 bg-green-100", text: "Available" };
      case "near_capacity":
        return { color: "text-yellow-600 bg-yellow-100", text: "Near Full" };
      case "full":
        return { color: "text-red-600 bg-red-100", text: "Full" };
      default:
        return { color: "text-blue-600 bg-blue-100", text: "Unknown" };
    }
  };
  
  const getMissionStatus = (status: string) => {
    switch (status) {
      case "In Transit":
        return { color: "text-blue-600 bg-blue-100", icon: Truck };
      case "Loading":
        return { color: "text-yellow-600 bg-yellow-100", icon: Clock };
      case "Delivered":
        return { color: "text-green-600 bg-green-100", icon: CheckCircle };
      default:
        return { color: "text-slate-600 bg-slate-100", icon: Package };
    }
  };

  return (
    <UserLayout title="Emergency Planning" description="Plan your evacuation routes and emergency response">
      <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-800 bg-clip-text text-transparent">
          Planning & Resource Allocation
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Strategic evacuation planning with real-time resource tracking and
          emergency coordination
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="evacuation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 to-teal-50">
          <TabsTrigger
            value="evacuation"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
          >
            <Route className="w-4 h-4 mr-2" />
            Evacuation Planning
          </TabsTrigger>
          <TabsTrigger
            value="shelters"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Shelter Management
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
          >
            <Truck className="w-4 h-4 mr-2" />
            Resource Distribution
          </TabsTrigger>
           <TabsTrigger
            value="damage"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Damage Assessment
          </TabsTrigger>
        </TabsList>

        {/* Evacuation Planning */}
        <TabsContent value="evacuation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Interactive Map */}
            <div className="lg:col-span-2">
              <GradientCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Interactive Evacuation Map
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Live Traffic
                  </Badge>
                </div>

                {/* Evacuation Planner Map */}
                <div className="relative bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl h-96 overflow-hidden">
                  <EvacuationPlanner />
                  <Notch text="Flood-Aware Routing" />
                </div>

                {/* Route Legend */}
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Clear Route</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Congested</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Blocked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-600">Shelter</span>
                  </div>
                </div>
              </GradientCard>
            </div>

            {/* Route Status */}
            <div className="space-y-6">
              <GradientCard className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Evacuation Routes
                </h3>
                <div className="space-y-3">
                  {evacuationRoutes.map((route) => {
                    const statusInfo = getRouteStatus(route.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div
                        key={route.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRoute === route.id
                            ? "border-blue-400 bg-gradient-to-r from-blue-50 to-teal-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => setSelectedRoute(route.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">
                            {route.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className={statusInfo.color}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {route.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Distance: {route.distance}</span>
                            <span>ETA: {route.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Capacity: {route.capacity}</span>
                            <span>Current: {route.current}</span>
                          </div>
                          <Progress
                            value={(route.current / route.capacity) * 100}
                            className="h-1 mt-2"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GradientCard>

              <GradientCard className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    onClick={() => window.open('tel:108', '_self')}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Activate Emergency Protocol
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
                    onClick={() => window.location.reload()}
                  >
                    <Route className="w-4 h-4 mr-2" />
                    Update Route Status
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    onClick={() => window.open('tel:+91-98765-43210', '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Traffic Control
                  </Button>
                </div>
              </GradientCard>
            </div>
          </div>
        </TabsContent>

        {/* Shelter Management */}
        <TabsContent value="shelters" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shelters.map((shelter, index) => {
              const statusInfo = getShelterStatus(shelter.status);
              const occupancyPercentage =
                (shelter.occupied / shelter.capacity) * 100;

              return (
                <GradientCard key={index} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {shelter.name}
                    </h3>
                    <Badge variant="secondary" className={statusInfo.color}>
                      {statusInfo.text}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{shelter.location}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Occupancy</span>
                        <span className="font-medium text-slate-900">
                          {shelter.occupied}/{shelter.capacity}
                        </span>
                      </div>
                      <Progress value={occupancyPercentage} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {shelter.amenities.map((amenity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {amenity === "Food" && (
                            <Utensils className="w-3 h-3 mr-1" />
                          )}
                          {amenity === "Medical" && (
                            <Heart className="w-3 h-3 mr-1" />
                          )}
                          {amenity === "WiFi" && (
                            <Zap className="w-3 h-3 mr-1" />
                          )}
                          {amenity}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(`tel:${shelter.contact || '+91-98765-43210'}`, '_self')}
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Contact
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          window.open(`https://www.google.com/maps?q=${shelter.lat},${shelter.lon}`, '_blank');
                        }}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </GradientCard>
              );
            })}
          </div>
        </TabsContent>

        {/* Resource Distribution */}
        <TabsContent value="resources" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GradientCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Resource Inventory</h3>
            <div className="space-y-4">
              {resources.map((resource) => {
                const Icon = resource.icon;
                const percentage = (resource.current / resource.capacity) * 100;
                return (
                  <div key={resource.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <Icon className={`w-4 h-4 mr-2 text-${resource.color}-500`} />
                        <span className="text-sm font-medium text-slate-800">{resource.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{resource.current.toLocaleString()} / {resource.capacity.toLocaleString()}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </GradientCard>
          <GradientCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Delivery Missions</h3>
            <div className="space-y-3">
              {deliveryMissions.map((mission) => {
                const statusInfo = getMissionStatus(mission.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={mission.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-900">Mission: {mission.id}</span>
                      <Badge variant="secondary" className={statusInfo.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {mission.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold">To:</span> {mission.destination}</p>
                      <p><span className="font-semibold">ETA:</span> {mission.eta}</p>
                      <p><span className="font-semibold">Contents:</span> {mission.contents}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GradientCard>
        </TabsContent>
        
        {/* Damage Assessment */}
        <TabsContent value="damage">
          <ImageAnalysis />
        </TabsContent>
      </Tabs>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            People Evacuated
          </h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            2,847
          </p>
          <p className="text-sm text-slate-600 mt-1">Successfully relocated</p>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Active Shelters
          </h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            18
          </p>
          <p className="text-sm text-slate-600 mt-1">Operational facilities</p>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Supply Deliveries
          </h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            156
          </p>
          <p className="text-sm text-slate-600 mt-1">Completed today</p>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Response Time
          </h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            12min
          </p>
          <p className="text-sm text-slate-600 mt-1">Average deployment</p>
        </GradientCard>
      </div>
      </div>
    </UserLayout>
  );
};

export default Planning;
