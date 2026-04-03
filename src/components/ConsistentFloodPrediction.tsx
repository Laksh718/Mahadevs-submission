import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Eye,
  Download,
  Share2,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  floodPredictionService, 
  PredictionResponse, 
  PredictionSummary, 
  ForecastDetail 
} from '@/lib/floodPredictionService';
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

interface ConsistentFloodPredictionProps {
  userLocation?: { lat: number; lon: number; address: string };
  className?: string;
}

const ConsistentFloodPrediction: React.FC<ConsistentFloodPredictionProps> = ({ 
  userLocation, 
  className = "" 
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');

  const supportedLocations = floodPredictionService.getSupportedLocations();

  useEffect(() => {
    // Auto-predict for user's location if available
    if (userLocation) {
      handleLocationPrediction(userLocation.lat, userLocation.lon, userLocation.address);
    }
  }, [userLocation]);

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

  const handleLocationPrediction = async (lat: number, lon: number, address: string) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await floodPredictionService.predictRiskByCoords(lat, lon);
      setPredictionData(result);
      setSelectedLocation(address);
      toast.success(`Flood prediction generated for ${address}`);
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
        await handleLocationPrediction(coords.lat, coords.lon, searchQuery);
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

  const getRiskColor = (riskLevel: string) => {
    return floodPredictionService.getRiskColor(riskLevel);
  };

  const getRiskTextColor = (riskLevel: string) => {
    return floodPredictionService.getRiskTextColor(riskLevel);
  };

  // Prepare data for charts
  const rainfallData = predictionData?.detailed_forecast?.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rainfall: day.rainfall_mm,
    riskLevel: day.risk_level,
    confidence: day.confidence * 100,
    riskScore: day.risk_level === 'High Risk' ? 4 : 
               day.risk_level === 'Medium Risk' ? 3 :
               day.risk_level === 'Low Risk' ? 2 : 1
  })) || [];

  const riskDistribution = [
    { name: 'High Risk', value: rainfallData.filter(d => d.riskLevel === 'High Risk').length, color: '#ef4444' },
    { name: 'Medium Risk', value: rainfallData.filter(d => d.riskLevel === 'Medium Risk').length, color: '#f97316' },
    { name: 'Low Risk', value: rainfallData.filter(d => d.riskLevel === 'Low Risk').length, color: '#eab308' },
    { name: 'Safe', value: rainfallData.filter(d => d.riskLevel === 'No Significant Risk').length, color: '#22c55e' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.dataKey === 'rainfall' ? 'mm' : entry.dataKey === 'confidence' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - Consistent with existing design */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CloudRain className="w-6 h-6 mr-2 text-teal-600" />
            Flood Risk Prediction
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered flood risk assessment using weather data
          </p>
        </div>
        <div className="flex items-center space-x-2">
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

      {/* Location Selection - Consistent styling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-teal-600" />
            Location Selection
          </CardTitle>
          <CardDescription>
            Select a location for flood risk analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Choose Location</label>
              <Select value={selectedLocation} onValueChange={handleLocationSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location..." />
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
          
          {userLocation && (
            <div className="flex items-center space-x-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span className="text-sm text-teal-800">
                Your location: {userLocation.address}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLocationPrediction(userLocation.lat, userLocation.lon, userLocation.address)}
                disabled={loading}
                className="ml-auto border-teal-300 text-teal-700 hover:bg-teal-100"
              >
                Analyze My Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
            <p className="text-gray-600">Analyzing weather data and generating flood prediction...</p>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {predictionData && !loading && (
        <div className="space-y-6">
          {/* Main Prediction Card */}
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
                      backgroundColor: getRiskColor(predictionData.main_prediction['Risk Level']),
                      color: getRiskTextColor(predictionData.main_prediction['Risk Level'])
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
                      <p className="text-sm text-gray-600">Confidence</p>
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

          {/* Tabs for Different Views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="regional">Regional</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
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
                                backgroundColor: getRiskColor(location['Risk Level']),
                                color: getRiskTextColor(location['Risk Level'])
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
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rainfall Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Droplets className="w-5 h-5 mr-2 text-teal-600" />
                      7-Day Rainfall Forecast
                    </CardTitle>
                    <CardDescription>
                      Daily rainfall predictions with risk levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={rainfallData}>
                        <defs>
                          <linearGradient id="rainfallGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="rainfall"
                          stroke="#14b8a6"
                          fill="url(#rainfallGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Risk Level Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-teal-600" />
                      Risk Level Distribution
                    </CardTitle>
                    <CardDescription>
                      Distribution of risk levels over 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regional" className="space-y-6">
              {/* Regional Map View */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                    Regional Risk Map
                  </CardTitle>
                  <CardDescription>
                    Interactive map showing flood risk across the region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-8 text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-teal-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Risk Map</h3>
                    <p className="text-gray-600 mb-4">
                      Visual representation of flood risk across {selectedLocation} and surrounding areas
                    </p>
                    <div className="flex justify-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm">High Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm">Medium Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm">Low Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm">Safe</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ConsistentFloodPrediction;