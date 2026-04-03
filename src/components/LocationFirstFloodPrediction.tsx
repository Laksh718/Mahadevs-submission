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
  ArrowRight,
  Search,
  Navigation,
  Table,
  Download,
  Filter,
  Info
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

interface LocationFirstFloodPredictionProps {
  userLocation?: { lat: number; lon: number; address: string };
  className?: string;
}

const LocationFirstFloodPrediction: React.FC<LocationFirstFloodPredictionProps> = ({ 
  userLocation, 
  className = "" 
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);

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
      setShowAnalysis(true);
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
      setShowAnalysis(true);
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

  const resetSelection = () => {
    setSelectedLocation('');
    setPredictionData(null);
    setShowAnalysis(false);
    setError('');
    setActiveTab('overview');
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
    date: day.date,
    displayDate: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rainfall: day.rainfall_mm,
    riskLevel: day.risk_level,
    confidence: day.confidence * 100,
    riskScore: day.risk_level === 'High Risk' ? 4 : 
               day.risk_level === 'Medium Risk' ? 3 :
               day.risk_level === 'Low Risk' ? 2 : 1
  })) || [];

  // Data is now coming from real API

  const riskDistribution = [
    { name: 'High Risk', value: rainfallData.filter(d => d.riskLevel === 'High Risk').length, color: '#ef4444' },
    { name: 'Medium Risk', value: rainfallData.filter(d => d.riskLevel === 'Medium Risk').length, color: '#f97316' },
    { name: 'Low Risk', value: rainfallData.filter(d => d.riskLevel === 'Low Risk').length, color: '#eab308' },
    { name: 'Safe', value: rainfallData.filter(d => d.riskLevel === 'No Significant Risk').length, color: '#22c55e' }
  ];

  const cumulativeRainfall = rainfallData.reduce((acc, day, index) => {
    acc.push({
      date: day.displayDate,
      cumulative: acc.length > 0 ? acc[acc.length - 1].cumulative + day.rainfall : day.rainfall,
      daily: day.rainfall
    });
    return acc;
  }, [] as any[]);

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

  // If no location is selected, show location selection interface
  if (!showAnalysis) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <CloudRain className="w-12 h-12 text-teal-600" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Powered Flood Risk Prediction
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            Get comprehensive flood risk assessment with detailed weather analysis and actionable insights
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>7-Day Forecast</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Risk Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Detailed Charts</span>
            </div>
          </div>
        </div>

        {/* Location Selection Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <MapPin className="w-6 h-6 mr-2 text-teal-600" />
              Choose Your Location
            </CardTitle>
            <CardDescription>
              Select a location to analyze flood risk and weather patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dropdown Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Select from supported locations</label>
              <Select value={selectedLocation} onValueChange={handleLocationSelect}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a location..." />
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Search Option */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Search for a location</label>
              <form onSubmit={handleSearchSubmit} className="flex space-x-2">
                <Input
                  placeholder="Enter city name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-12"
                />
                <Button type="submit" disabled={loading || !searchQuery.trim()} className="h-12 px-6">
                  {loading ? 'Analyzing...' : 'Search'}
                </Button>
              </form>
            </div>

            {/* Current Location Option */}
            {userLocation && (
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Navigation className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-medium text-teal-900">Your Current Location</p>
                      <p className="text-sm text-teal-700">{userLocation.address}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleLocationPrediction(userLocation.lat, userLocation.lon, userLocation.address)}
                    disabled={loading}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Analyze
                  </Button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
                <p className="text-gray-600">Analyzing weather data and generating flood prediction...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supported Locations Info */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-teal-600" />
              Supported Locations
            </CardTitle>
            <CardDescription>
              We provide flood risk predictions for these major cities across India
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {supportedLocations.map((location) => (
                <div key={location} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{location}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show analysis interface when location is selected
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with location info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CloudRain className="w-6 h-6 mr-2 text-teal-600" />
            Flood Risk Analysis
          </h2>
          <p className="text-gray-600 mt-1">
            Analysis for <span className="font-medium text-teal-600">{selectedLocation}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={resetSelection}>
            <MapPin className="w-4 h-4 mr-2" />
            Change Location
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleLocationSelect(selectedLocation)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Prediction Card */}
      {predictionData?.main_prediction && (
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rainfall">Rainfall Charts</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="data">Data Table</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Regional Analysis */}
          {predictionData?.regional_analysis && predictionData.regional_analysis.length > 0 && (
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

        <TabsContent value="rainfall" className="space-y-6">
          {/* Rainfall Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Rainfall Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplets className="w-5 h-5 mr-2 text-teal-600" />
                  7-Day Rainfall Forecast
                </CardTitle>
                <CardDescription>
                  Daily rainfall predictions
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
                      dataKey="displayDate" 
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

            {/* Cumulative Rainfall Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
                  Cumulative Rainfall Trend
                </CardTitle>
                <CardDescription>
                  Accumulated rainfall over the forecast period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cumulativeRainfall}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="displayDate" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ value: 'Cumulative (mm)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          {/* Risk Analysis Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
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

            {/* Risk Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
                  Daily Risk Scores
                </CardTitle>
                <CardDescription>
                  Risk scores for each day of the forecast
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rainfallData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="displayDate" 
                      stroke="#6b7280"
                      fontSize={12}
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

        <TabsContent value="data" className="space-y-6">
          {/* Detailed Data Tables */}
          <div className="space-y-6">
            {/* 7-Day Forecast Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Table className="w-5 h-5 mr-2 text-teal-600" />
                      7-Day Weather Forecast
                    </CardTitle>
                    <CardDescription>
                      Detailed daily weather and risk data for {selectedLocation}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Rainfall (mm)</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Confidence (%)</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rainfallData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <CloudRain className="w-8 h-8 text-gray-400" />
                            <p className="text-gray-500">No forecast data available</p>
                            <p className="text-sm text-gray-400">Please try refreshing or selecting a different location</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      rainfallData.map((day, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{day.rainfall.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className="text-white"
                            style={{ 
                              backgroundColor: getRiskColor(day.riskLevel),
                              color: getRiskTextColor(day.riskLevel)
                            }}
                          >
                            {day.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-teal-500 h-2 rounded-full"
                                style={{ width: `${day.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{day.confidence.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{day.riskScore}/4</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  day.riskScore >= 3.5 ? 'bg-red-500' : 
                                  day.riskScore >= 2.5 ? 'bg-orange-500' : 
                                  day.riskScore >= 1.5 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${(day.riskScore / 4) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {day.riskLevel === 'High Risk' ? (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm">Alert</span>
                            </div>
                          ) : day.riskLevel === 'Medium Risk' ? (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm">Caution</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">Safe</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary Statistics Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
                  Forecast Summary Statistics
                </CardTitle>
                <CardDescription>
                  Key statistics and insights from the 7-day forecast
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Rainfall Statistics */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Droplets className="w-4 h-4 mr-2 text-blue-500" />
                      Rainfall Statistics
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="text-sm text-blue-700">Total Rainfall</span>
                        <span className="font-medium text-blue-900">
                          {rainfallData.length > 0 ? rainfallData.reduce((sum, day) => sum + day.rainfall, 0).toFixed(1) : '0.0'} mm
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="text-sm text-blue-700">Average Daily</span>
                        <span className="font-medium text-blue-900">
                          {rainfallData.length > 0 ? (rainfallData.reduce((sum, day) => sum + day.rainfall, 0) / rainfallData.length).toFixed(1) : '0.0'} mm
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="text-sm text-blue-700">Peak Rainfall</span>
                        <span className="font-medium text-blue-900">
                          {rainfallData.length > 0 ? Math.max(...rainfallData.map(day => day.rainfall)).toFixed(1) : '0.0'} mm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Statistics */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                      Risk Statistics
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm text-red-700">High Risk Days</span>
                        <span className="font-medium text-red-900">
                          {rainfallData.filter(day => day.riskLevel === 'High Risk').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                        <span className="text-sm text-orange-700">Medium Risk Days</span>
                        <span className="font-medium text-orange-900">
                          {rainfallData.filter(day => day.riskLevel === 'Medium Risk').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm text-green-700">Safe Days</span>
                        <span className="font-medium text-green-900">
                          {rainfallData.filter(day => day.riskLevel === 'Low Risk' || day.riskLevel === 'No Significant Risk').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Statistics */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-teal-500" />
                      Confidence Statistics
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-teal-50 rounded">
                        <span className="text-sm text-teal-700">Average Confidence</span>
                        <span className="font-medium text-teal-900">
                          {rainfallData.length > 0 ? (rainfallData.reduce((sum, day) => sum + day.confidence, 0) / rainfallData.length).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-teal-50 rounded">
                        <span className="text-sm text-teal-700">Highest Confidence</span>
                        <span className="font-medium text-teal-900">
                          {rainfallData.length > 0 ? Math.max(...rainfallData.map(day => day.confidence)).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-teal-50 rounded">
                        <span className="text-sm text-teal-700">Lowest Confidence</span>
                        <span className="font-medium text-teal-900">
                          {rainfallData.length > 0 ? Math.min(...rainfallData.map(day => day.confidence)).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Timeline Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                  Risk Timeline Analysis
                </CardTitle>
                <CardDescription>
                  Detailed timeline of risk progression and key events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time Period</TableHead>
                      <TableHead>Risk Trend</TableHead>
                      <TableHead>Key Indicators</TableHead>
                      <TableHead>Recommendations</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rainfallData.map((day, index) => {
                      const trend = index > 0 ? 
                        (day.riskScore > rainfallData[index - 1].riskScore ? 'Increasing' : 
                         day.riskScore < rainfallData[index - 1].riskScore ? 'Decreasing' : 'Stable') : 'Baseline';
                      
                      const priority = day.riskLevel === 'High Risk' ? 'High' : 
                                     day.riskLevel === 'Medium Risk' ? 'Medium' : 'Low';

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {trend === 'Increasing' ? (
                                <TrendingUp className="w-4 h-4 text-red-500" />
                              ) : trend === 'Decreasing' ? (
                                <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
                              ) : (
                                <BarChart3 className="w-4 h-4 text-gray-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                trend === 'Increasing' ? 'text-red-600' : 
                                trend === 'Decreasing' ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {trend}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">Rainfall: {day.rainfall.toFixed(1)}mm</div>
                              <div className="text-sm">Confidence: {day.confidence.toFixed(1)}%</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {day.riskLevel === 'High Risk' ? 'Evacuation recommended' :
                               day.riskLevel === 'Medium Risk' ? 'Stay alert, prepare supplies' :
                               'Normal activities safe'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                priority === 'High' ? 'bg-red-100 text-red-800' :
                                priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {priority}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
                <MapPin className="w-20 h-20 mx-auto mb-6 text-teal-400" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Interactive Risk Map</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Visual representation of flood risk across {selectedLocation} and surrounding areas
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
      </Tabs>
    </div>
  );
};

export default LocationFirstFloodPrediction;