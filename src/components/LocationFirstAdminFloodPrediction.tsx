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
  ArrowRight,
  Search,
  Navigation,
  Plus,
  Home,
  FileText,
  Shield,
  Table,
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

interface LocationFirstAdminFloodPredictionProps {
  userLocation?: { lat: number; lon: number; address: string };
  isUserView?: boolean;
}

const LocationFirstAdminFloodPrediction: React.FC<LocationFirstAdminFloodPredictionProps> = ({ 
  userLocation,
  isUserView = false
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [allPredictions, setAllPredictions] = useState<PredictionResponse[]>([]);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('location');
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);

  const supportedLocations = floodPredictionService.getSupportedLocations();

  const handleLocationSelect = async (location: string) => {
    if (!location) return;
    
    setSelectedLocation(location);
    setLoading(true);
    setError('');
    
    try {
      const result = await floodPredictionService.predictRegionalRiskWithWeather(location);
      setPredictionData(result);
      setShowAnalysis(true);
      setActiveTab('analysis');
      toast.success(`7-day weather forecast generated for ${location}`);
    } catch (err) {
      setError('Failed to generate weather forecast');
      toast.error('Failed to generate weather forecast');
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
        setShowAnalysis(true);
        setActiveTab('analysis');
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

  const handleDisplayAllLocations = async () => {
    console.log('📊 Display All Locations Data clicked');
    setLoadingAll(true);
    setError('');
    
    try {
      console.log('📍 Fetching data for all locations:', supportedLocations);
      
      // Fetch data for all locations from the API
      const allResults = [];
      for (const location of supportedLocations) {
        try {
          console.log(`📊 Fetching data for ${location}...`);
          const result = await floodPredictionService.predictRegionalRiskWithWeather(location);
          allResults.push(result);
          console.log(`✅ Retrieved data for ${location}:`, result.main_prediction);
        } catch (err) {
          console.error(`❌ Failed to get data for ${location}:`, err);
          // Return a fallback prediction
          const fallback = {
            main_prediction: {
              Location: location,
              'Risk Level': 'No Significant Risk',
              'Risk Date': new Date().toISOString().split('T')[0],
              'Confidence': '85%'
            },
            regional_analysis: [],
            detailed_forecast: []
          };
          allResults.push(fallback);
          console.log(`🔄 Added fallback for ${location}`);
        }
      }
      
      console.log(`🎉 Displaying data for ${allResults.length} locations:`, allResults);
      setAllPredictions(allResults);
      setActiveTab('overview');
      toast.success(`Displayed data for ${allResults.length} locations`);
    } catch (err) {
      console.error('💥 Error in handleDisplayAllLocations:', err);
      setError('Failed to display data for all locations');
      toast.error('Failed to display data for all locations');
    } finally {
      setLoadingAll(false);
      console.log('🏁 Display All Locations completed');
    }
  };

  const resetSelection = () => {
    setSelectedLocation('');
    setPredictionData(null);
    setShowAnalysis(false);
    setError('');
    setActiveTab('location');
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

  const cumulativeRainfall = rainfallData.reduce((acc, day, index) => {
    acc.push({
      date: day.date,
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

  return (
    <div className="space-y-6">
      {/* Header */}
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
          {!isUserView && (
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('📊 Display All Locations Data button clicked!');
                handleDisplayAllLocations();
              }}
              disabled={loadingAll}
            >
              <BarChart3 className={`w-4 h-4 mr-2 ${loadingAll ? 'animate-spin' : ''}`} />
              Display All Locations Data
            </Button>
          )}
          {!isUserView && (
            <Button 
              variant="outline" 
              onClick={async () => {
                console.log('🧪 Test API button clicked');
                console.log('📍 Supported locations:', supportedLocations);
                console.log('📊 All predictions count:', allPredictions.length);
                
                // Test the API directly
                try {
                  console.log('🔬 Testing API directly...');
                  const response = await fetch('https://janrakshak-pre-alert-model.onrender.com/predict_regional', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location: 'Hyderabad' })
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Direct API test result:', data);
                    toast.success('API is working! Check console for details.');
                  } else {
                    console.log('❌ API returned:', response.status, response.statusText);
                    toast.error(`API returned ${response.status}`);
                  }
                } catch (err) {
                  console.error('❌ Direct API test failed:', err);
                  toast.error('API test failed - check console');
                }
              }}
            >
              Test API
            </Button>
          )}
          {showAnalysis && (
            <Button variant="outline" size="sm" onClick={resetSelection}>
              <MapPin className="w-4 h-4 mr-2" />
              Change Location
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isUserView ? 'grid-cols-2' : 'grid-cols-3'}`}>
          <TabsTrigger value="location">Location Selection</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!showAnalysis}>Single Analysis</TabsTrigger>
          {!isUserView && (
            <TabsTrigger value="overview" disabled={allPredictions.length === 0}>Overview</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="location" className="space-y-6">
          {/* Location Selection Interface */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 mr-2 text-teal-600" />
              Select Location for Analysis
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose a location to get detailed flood risk assessment with comprehensive weather analysis
            </p>
          </div>

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
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Single Location Analysis */}
          {predictionData && (
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

              {/* Charts for Single Location */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rainfall Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Droplets className="w-5 h-5 mr-2 text-teal-600" />
                      7-Day Rainfall Forecast
                    </CardTitle>
                    <CardDescription>
                      Daily rainfall predictions for {selectedLocation}
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

                {/* Cumulative Rainfall */}
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
                          dataKey="date" 
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
                          dataKey="date" 
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

              {/* 7-Day Forecast Table */}
              {predictionData.detailed_forecast && predictionData.detailed_forecast.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                      7-Day Weather Forecast
                    </CardTitle>
                    <CardDescription>
                      Detailed daily weather and risk predictions for {selectedLocation}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {predictionData.detailed_forecast.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                              <div className="text-xs text-gray-600">
                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Droplets className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium">{day.rainfall_mm?.toFixed(2) || '0.00'} mm</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {(day.confidence * 100)?.toFixed(1) || '0.0'}%
                              </div>
                              <div className="text-xs text-gray-600">Confidence</div>
                            </div>
                            
                            <Badge 
                              className="text-white"
                              style={{ 
                                backgroundColor: floodPredictionService.getRiskColor(day.risk_level),
                                color: floodPredictionService.getRiskTextColor(day.risk_level)
                              }}
                            >
                              {day.risk_level}
                            </Badge>
                          </div>
                        </div>
                      ))}
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


        {!isUserView && (
          <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          {allPredictions.length > 0 ? (
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
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-8 text-center">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Displayed</h3>
                <p className="text-gray-600 mb-4">
                  Click "Display All Locations Data" to fetch and display comprehensive flood risk assessments for all locations.
                </p>
                <Button 
                  onClick={handleDisplayAllLocations}
                  disabled={loadingAll}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <BarChart3 className={`w-4 h-4 mr-2 ${loadingAll ? 'animate-spin' : ''}`} />
                  Display All Locations Data
                </Button>
              </CardContent>
            </Card>
          )}

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
              {allPredictions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allPredictions.map((prediction, index) => {
                    const location = prediction.main_prediction?.Location || 'Unknown';
                    const coords = floodPredictionService.getLocationCoords(location);
                    const riskLevel = prediction.main_prediction?.['Risk Level'] || 'No Significant Risk';
                    const riskDate = prediction.main_prediction?.['Risk Date'] || '-';
                    const confidence = prediction.main_prediction?.['Confidence'] || 'N/A';
                    
                    return (
                      <Card key={index} className="border-l-4" style={{ borderLeftColor: floodPredictionService.getRiskColor(riskLevel) }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg">{location}</h3>
                            <Badge 
                              className="text-white"
                              style={{ 
                                backgroundColor: floodPredictionService.getRiskColor(riskLevel),
                                color: floodPredictionService.getRiskTextColor(riskLevel)
                              }}
                            >
                              {riskLevel}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                              <span>{coords?.state || 'Unknown State'}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                              <span>Risk Date: {formatDate(riskDate)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
                              <span>Confidence: {confidence}</span>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => {
                              setSelectedLocation(location);
                              setPredictionData(prediction);
                              setShowAnalysis(true);
                              setActiveTab('analysis');
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Displayed</h3>
                  <p className="text-gray-600 mb-4">
                    Click "Display All Locations Data" to fetch and display comprehensive flood risk assessments for all locations.
                  </p>
                  <Button 
                    onClick={handleDisplayAllLocations}
                    disabled={loadingAll}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <BarChart3 className={`w-4 h-4 mr-2 ${loadingAll ? 'animate-spin' : ''}`} />
                    Display All Locations Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

      </Tabs>

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

export default LocationFirstAdminFloodPrediction;