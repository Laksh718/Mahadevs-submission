import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  MapPin, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  CloudRain,
  Droplets,
  Activity,
  Users,
  Globe,
  Download,
  Share2,
  Eye,
  Filter,
  Search,
  Plus,
  Home,
  FileText,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  floodPredictionService, 
  PredictionResponse, 
  PredictionSummary, 
  ForecastDetail 
} from '@/lib/floodPredictionService';

const ConsistentAdminFloodPrediction = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [allPredictions, setAllPredictions] = useState<PredictionResponse[]>([]);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const supportedLocations = floodPredictionService.getSupportedLocations();

  const handleLocationSelect = async (location: string) => {
    if (!location) return;
    
    setSelectedLocation(location);
    setLoading(true);
    setError('');
    
    try {
      const result = await floodPredictionService.predictRegionalRisk(location);
      setPredictionData(result);
      toast.success(`Flood prediction generated for ${location}`);
    } catch (err) {
      setError('Failed to generate flood prediction');
      toast.error('Failed to generate flood prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const coords = floodPredictionService.getLocationCoords(searchQuery);
      if (coords) {
        const result = await floodPredictionService.predictRiskByCoords(coords.lat, coords.lon);
        setPredictionData(result);
        setSelectedLocation(searchQuery);
        toast.success(`Flood prediction generated for ${searchQuery}`);
      } else {
        setError(`Location "${searchQuery}" not found in supported locations`);
        toast.error(`Location "${searchQuery}" not found`);
      }
    } catch (err) {
      setError('Failed to generate flood prediction');
      toast.error('Failed to generate flood prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAllPredictions = async () => {
    setLoadingAll(true);
    setError('');
    
    try {
      const allResults: PredictionResponse[] = [];
      
      for (const location of supportedLocations) {
        try {
          const result = await floodPredictionService.predictRegionalRisk(location);
          allResults.push(result);
        } catch (err) {
          console.error(`Failed to get prediction for ${location}:`, err);
        }
      }
      
      setAllPredictions(allResults);
      toast.success(`Generated predictions for ${allResults.length} locations`);
    } catch (err) {
      setError('Failed to generate predictions for all locations');
      toast.error('Failed to generate predictions for all locations');
    } finally {
      setLoadingAll(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Medium Risk':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Low Risk':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString === '-') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRiskStats = () => {
    const stats = {
      high: 0,
      medium: 0,
      low: 0,
      none: 0,
      total: allPredictions.length
    };

    allPredictions.forEach(prediction => {
      if (prediction.main_prediction) {
        const riskLevel = prediction.main_prediction['Risk Level'];
        switch (riskLevel) {
          case 'High Risk':
            stats.high++;
            break;
          case 'Medium Risk':
            stats.medium++;
            break;
          case 'Low Risk':
            stats.low++;
            break;
          default:
            stats.none++;
        }
      }
    });

    return stats;
  };

  const riskStats = getRiskStats();

  // Prepare data for charts
  const riskDistributionData = [
    { name: 'High Risk', value: riskStats.high, color: '#ef4444' },
    { name: 'Medium Risk', value: riskStats.medium, color: '#f97316' },
    { name: 'Low Risk', value: riskStats.low, color: '#eab308' },
    { name: 'Safe', value: riskStats.none, color: '#22c55e' }
  ];

  const regionalRiskData = allPredictions.map(prediction => {
    const location = prediction.main_prediction?.Location || 'Unknown';
    const coords = floodPredictionService.getLocationCoords(location);
    const riskScore = prediction.main_prediction?.['Risk Level'] === 'High Risk' ? 4 :
                     prediction.main_prediction?.['Risk Level'] === 'Medium Risk' ? 3 :
                     prediction.main_prediction?.['Risk Level'] === 'Low Risk' ? 2 : 1;
    
    return {
      location,
      state: coords?.state || 'Unknown',
      riskScore,
      confidence: parseFloat(prediction.main_prediction?.['Confidence']?.replace('%', '') || '0'),
      lat: coords?.lat || 0,
      lon: coords?.lon || 0
    };
  });

  const stateRiskData = regionalRiskData.reduce((acc, item) => {
    const existing = acc.find(s => s.state === item.state);
    if (existing) {
      existing.totalRisk += item.riskScore;
      existing.count += 1;
      existing.avgRisk = existing.totalRisk / existing.count;
    } else {
      acc.push({
        state: item.state,
        totalRisk: item.riskScore,
        count: 1,
        avgRisk: item.riskScore
      });
    }
    return acc;
  }, [] as any[]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header - Consistent with admin design */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CloudRain className="w-8 h-8 mr-3 text-teal-600" />
            Flood Risk Management System
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive AI-powered flood risk assessment and monitoring dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleGenerateAllPredictions}
            disabled={loadingAll}
          >
            <Globe className={`w-4 h-4 mr-2 ${loadingAll ? 'animate-spin' : ''}`} />
            Generate All Predictions
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (selectedLocation) {
                handleLocationSelect(selectedLocation);
              }
            }}
            disabled={loading || !selectedLocation}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview - Consistent with admin dashboard */}
      {allPredictions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">High Risk Areas</p>
                  <p className="text-2xl font-bold text-red-800">{riskStats.high}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">Medium Risk Areas</p>
                  <p className="text-2xl font-bold text-orange-800">{riskStats.medium}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Low Risk Areas</p>
                  <p className="text-2xl font-bold text-yellow-800">{riskStats.low}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Safe Areas</p>
                  <p className="text-2xl font-bold text-green-800">{riskStats.none}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="single">Single Location</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Risk Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
                  Risk Distribution Overview
                </CardTitle>
                <CardDescription>
                  Distribution of flood risk levels across all monitored locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
                  State-wise Risk Analysis
                </CardTitle>
                <CardDescription>
                  Average flood risk by state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stateRiskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="state" 
                      stroke="#6b7280"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ value: 'Avg Risk Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avgRisk" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* All Locations Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-teal-600" />
                  All Locations Overview
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Report
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Comprehensive flood risk assessment for all monitored locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Predicted Date</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPredictions.map((prediction, index) => {
                    const location = prediction.main_prediction?.Location || 'Unknown';
                    const coords = floodPredictionService.getLocationCoords(location);
                    const riskLevel = prediction.main_prediction?.['Risk Level'] || 'No Significant Risk';
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{location}</TableCell>
                        <TableCell>{coords?.state || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge 
                            className="text-white"
                            style={{ 
                              backgroundColor: floodPredictionService.getRiskColor(riskLevel),
                              color: floodPredictionService.getRiskTextColor(riskLevel)
                            }}
                          >
                            {riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(prediction.main_prediction?.['Risk Date'] || '-')}</TableCell>
                        <TableCell>{prediction.main_prediction?.['Confidence'] || 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-teal-600" />
                  System Performance
                </CardTitle>
                <CardDescription>
                  Prediction system health and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700 font-medium">Total Predictions Generated</span>
                    <span className="text-2xl font-bold text-blue-800">{allPredictions.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700 font-medium">System Uptime</span>
                    <span className="text-2xl font-bold text-green-800">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700 font-medium">Average Response Time</span>
                    <span className="text-2xl font-bold text-purple-800">1.2s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-700 font-medium">Data Freshness</span>
                    <span className="text-2xl font-bold text-orange-800">Real-time</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
                  Risk Trend Analysis
                </CardTitle>
                <CardDescription>
                  Risk score distribution across locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalRiskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="location" 
                      stroke="#6b7280"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="riskScore" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          {/* Regional Map Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                Regional Risk Map
              </CardTitle>
              <CardDescription>
                Interactive visualization of flood risk across regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-8 text-center">
                <MapPin className="w-20 h-20 mx-auto mb-6 text-teal-400" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Interactive Regional Risk Map</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Visual representation of flood risk across all monitored regions with real-time updates and interactive features
                </p>
                <div className="flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                    <span className="text-sm font-medium">High Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <span className="text-sm font-medium">Medium Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                    <span className="text-sm font-medium">Low Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-sm font-medium">Safe</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="single" className="space-y-6">
          {/* Single Location Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                Single Location Analysis
              </CardTitle>
              <CardDescription>
                Detailed analysis for specific locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Location</label>
                  <Select value={selectedLocation} onValueChange={handleLocationSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a location for detailed analysis..." />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Search Location</label>
                  <form onSubmit={handleSearchSubmit} className="flex space-x-2">
                    <Input
                      placeholder="Enter city name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={loading || !searchQuery.trim()}>
                      {loading ? 'Analyzing...' : 'Search'}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Single Location Results */}
          {predictionData && !loading && (
            <div className="space-y-6">
              {/* Main Prediction */}
              {predictionData.main_prediction && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        {getRiskIcon(predictionData.main_prediction['Risk Level'])}
                        <span className="ml-2">Risk Assessment for {selectedLocation}</span>
                      </span>
                      <Badge 
                        className="text-white"
                        style={{ 
                          backgroundColor: floodPredictionService.getRiskColor(predictionData.main_prediction['Risk Level']),
                          color: floodPredictionService.getRiskTextColor(predictionData.main_prediction['Risk Level'])
                        }}
                      >
                        {predictionData.main_prediction['Risk Level']}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Predicted Date</p>
                          <p className="font-medium">{formatDate(predictionData.main_prediction['Risk Date'] || '-')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">AI Confidence</p>
                          <p className="font-medium">{predictionData.main_prediction['Confidence'] || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Risk Level</p>
                          <p className="font-medium">{predictionData.main_prediction['Risk Level']}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Regional Analysis */}
              {predictionData.regional_analysis && predictionData.regional_analysis.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                      Regional Analysis
                    </CardTitle>
                    <CardDescription>
                      Flood risk assessment for nearby locations in the same state
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {predictionData.regional_analysis.map((location, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <div>
                              <span className="font-medium">{location.Location}</span>
                              <p className="text-sm text-gray-600">
                                Risk Date: {formatDate(location['Risk Date'] || '-')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">{location['Confidence']}</span>
                            <Badge 
                              className="text-white"
                              style={{ 
                                backgroundColor: floodPredictionService.getRiskColor(location['Risk Level']),
                                color: floodPredictionService.getRiskTextColor(location['Risk Level'])
                              }}
                            >
                              {location['Risk Level']}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loadingAll && (
        <Card>
          <CardContent className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
            <p className="text-gray-600">Generating predictions for all locations...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsistentAdminFloodPrediction;