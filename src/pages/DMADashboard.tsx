import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import NDMALayout from "@/components/NDMALayout";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { UserRole } from "@/lib/roleBasedAuth";
import { supabase } from "@/lib/supabase";
import {
  Users,
  MapPin,
  AlertTriangle,
  Activity,
  Building2,
  GraduationCap,
  BarChart3,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Shield,
  Globe,
  Map,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DMAMetrics {
  totalOperationalAreas: number;
  activeOperations: number;
  resourcesDeployed: number;
  responseTime: number;
  recentOperations: Array<{
    id: string;
    title: string;
    location: string;
    scope: string; // "District" or "State" or "Multi-District"
    date: string;
    status: string;
    severity: string;
    resourcesUsed: number;
  }>;
  areaStatus: Array<{
    area: string;
    type: string; // "District" or "State"
    status: string;
    riskLevel: string;
    population: number;
    efficiency?: number;
    lastUpdate: string;
  }>;
}

const DMADashboard = () => {
  const { theme } = useTheme();
  const { user, loading } = useSupabaseAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [metrics, setMetrics] = useState<DMAMetrics>({
    totalOperationalAreas: 0,
    activeOperations: 0,
    resourcesDeployed: 0,
    responseTime: 0,
    recentOperations: [],
    areaStatus: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Redirect unauthorized users
  if (!loading && !user) {
    window.location.href = "/admin/signin";
    return null;
  }

  // Check if user has DMA role
  if (userProfile && userProfile.role !== "DMA") {
    window.location.href = "/admin/signin";
    return null;
  }

  useEffect(() => {
    if (user && userProfile) {
      fetchDMAMetrics();
    }
  }, [user, userProfile]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchDMAMetrics = async () => {
    setIsLoading(true);
    try {
      // Mock data for DMA metrics - unified district and state operations
      const mockMetrics: DMAMetrics = {
        totalOperationalAreas: 12,
        activeOperations: 4,
        resourcesDeployed: 285,
        responseTime: 10, // minutes
        recentOperations: [
          {
            id: "1",
            title: "State-wide Flood Response 2024",
            location: "Multi-District Operation",
            scope: "State",
            date: "2024-01-15",
            status: "Active",
            severity: "High",
            resourcesUsed: 150,
          },
          {
            id: "2",
            title: "District Emergency Drill",
            location: "Central District",
            scope: "District",
            date: "2024-01-12",
            status: "Completed",
            severity: "Medium",
            resourcesUsed: 45,
          },
          {
            id: "3",
            title: "Cyclone Preparedness Training",
            location: "Coastal Districts",
            scope: "Multi-District",
            date: "2024-01-18",
            status: "Scheduled",
            severity: "Low",
            resourcesUsed: 0,
          },
          {
            id: "4",
            title: "Inter-Agency Coordination",
            location: "State Capital",
            scope: "State",
            date: "2024-01-20",
            status: "Planning",
            severity: "Medium",
            resourcesUsed: 25,
          },
        ],
        areaStatus: [
          {
            area: "Central District",
            type: "District",
            status: "Alert",
            riskLevel: "High",
            population: 245000,
            efficiency: 92,
            lastUpdate: "2024-01-15T10:30:00Z",
          },
          {
            area: "North District",
            type: "District",
            status: "Normal",
            riskLevel: "Low",
            population: 189000,
            efficiency: 88,
            lastUpdate: "2024-01-15T09:15:00Z",
          },
          {
            area: "Coastal Region",
            type: "State",
            status: "Watch",
            riskLevel: "Medium",
            population: 1250000,
            efficiency: 85,
            lastUpdate: "2024-01-15T11:45:00Z",
          },
          {
            area: "Mountain Districts",
            type: "State",
            status: "Normal",
            riskLevel: "Low",
            population: 890000,
            efficiency: 90,
            lastUpdate: "2024-01-15T08:20:00Z",
          },
        ],
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error fetching DMA metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <NDMALayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading DMA dashboard...</div>
        </div>
      </NDMALayout>
    );
  }

  if (!user || !userProfile) {
    return (
      <NDMALayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-600">
            Access denied. DMA credentials required.
          </div>
        </div>
      </NDMALayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      Active: "bg-red-100 text-red-800",
      Completed: "bg-green-100 text-green-800",
      Scheduled: "bg-blue-100 text-blue-800",
      Planning: "bg-purple-100 text-purple-800",
      Monitoring: "bg-yellow-100 text-yellow-800",
    };
    return (
      statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800"
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };
    return (
      severityMap[severity as keyof typeof severityMap] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getRiskBadge = (risk: string) => {
    const riskMap = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };
    return riskMap[risk as keyof typeof riskMap] || "bg-gray-100 text-gray-800";
  };

  const getScopeBadge = (scope: string) => {
    const scopeMap = {
      District: "bg-blue-100 text-blue-800",
      State: "bg-purple-100 text-purple-800",
      "Multi-District": "bg-teal-100 text-teal-800",
    };
    return (
      scopeMap[scope as keyof typeof scopeMap] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <NDMALayout>
      <style>{`
        ${theme === 'high-contrast' ? `
          .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900,
          .text-gray-500, .text-gray-400, .text-slate-600, .text-slate-700,
          .text-slate-500, .text-slate-800, .text-muted-foreground {
            color: hsl(0, 0%, 100%) !important;
          }
          .bg-white\\/80, .bg-white\\/90, .bg-white\\/95 {
            background-color: hsl(0, 0%, 10%) !important;
          }
        ` : ''}
      `}</style>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              DMA Command Center
            </h1>
            <p className="text-gray-600 mt-1">
              Disaster Management Authority -{" "}
              {userProfile.district || userProfile.state || "Multi-Area"}{" "}
              Operations
            </p>
          </div>
          <Badge variant="outline" className="text-teal-600 border-teal-200">
            <Map className="w-4 h-4 mr-1" />
            DMA Officer
          </Badge>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-teal-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Operational Areas
              </CardTitle>
              <MapPin className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                {metrics.totalOperationalAreas}
              </div>
              <p className="text-xs text-gray-600">
                Districts & regions managed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Operations
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {metrics.activeOperations}
              </div>
              <p className="text-xs text-gray-600">Emergency responses</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resources Deployed
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.resourcesDeployed}
              </div>
              <p className="text-xs text-gray-600">Personnel & equipment</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Response Time
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.responseTime}m
              </div>
              <p className="text-xs text-gray-600">Emergency deployment</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="operations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="operations">Operations Center</TabsTrigger>
            <TabsTrigger value="areas">Area Status</TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-teal-600" />
                  Emergency Operations Center
                </CardTitle>
                <CardDescription>
                  Current and recent disaster management operations across all
                  jurisdictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.recentOperations.map((operation) => (
                    <div
                      key={operation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{operation.title}</h3>
                          <Badge className={getStatusBadge(operation.status)}>
                            {operation.status}
                          </Badge>
                          <Badge
                            className={getSeverityBadge(operation.severity)}
                          >
                            {operation.severity}
                          </Badge>
                          <Badge className={getScopeBadge(operation.scope)}>
                            {operation.scope}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {operation.location} •{" "}
                          {new Date(operation.date).toLocaleDateString()}
                        </div>
                        {operation.resourcesUsed > 0 && (
                          <div className="text-sm text-gray-600">
                            <Building2 className="w-3 h-3 inline mr-1" />
                            {operation.resourcesUsed} resources deployed
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="areas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-teal-600" />
                  Area Status Monitor
                </CardTitle>
                <CardDescription>
                  Real-time status of all districts and state regions under DMA
                  jurisdiction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metrics.areaStatus.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{area.area}</h3>
                          <Badge variant="outline" className="text-xs">
                            {area.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Population: {area.population.toLocaleString()}
                        </p>
                        {area.efficiency && (
                          <p className="text-sm text-gray-600">
                            Efficiency: {area.efficiency}%
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Updated: {new Date(area.lastUpdate).toLocaleString()}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Badge className={getRiskBadge(area.riskLevel)}>
                            {area.riskLevel} Risk
                          </Badge>
                          <Badge
                            className={getStatusBadge(
                              area.status === "Normal"
                                ? "Completed"
                                : area.status === "Alert"
                                ? "Active"
                                : "Monitoring"
                            )}
                          >
                            {area.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Monitor
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </NDMALayout>
  );
};

export default DMADashboard;
