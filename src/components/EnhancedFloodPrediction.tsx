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
  Wind,
  Thermometer,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  floodPredictionService, 
  PredictionResponse, 
  PredictionSummary, 
  ForecastDetail 
} from '@/lib/floodPredictionService';
import FloodVisualizations from './FloodVisualizations';

interface EnhancedFloodPredictionProps {
  userLocation?: { lat: number; lon: number; address: string };
  className?: string;
}

const EnhancedFloodPrediction: React.FC<EnhancedFloodPredictionProps> = ({ 
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
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'Medium Risk':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'Low Risk':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-500" />;
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center mb-2">
                <CloudRain className="w-8 h-8 mr-3" />
                Advanced Flood Risk Prediction
              </h2>
              <p className="text-blue-100 text-lg">
                AI-powered flood risk assessment with detailed visualizations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  if (selectedLocation) {
                    handleLocationSelect(selectedLocation);
                  }
                }}
                disabled={loading || !selectedLocation}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
        {/* Floating elements for visual appeal */}
        <div className="absolute top-4 right-4 opacity-20">
          <Droplets className="w-16 h-16 animate-pulse" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-20">
          <Wind className="w-12 h-12 animate-bounce" />
        </div>
      </div>

      {/* Enhanced Controls */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardTitle className="flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-blue-600" />
            Location Selection & Analysis
          </CardTitle>
          <CardDescription className="text-gray-600">
            Select a location for comprehensive flood risk analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Select Location</label>
              <Select value={selectedLocation} onValueChange={handleLocationSelect}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a location for analysis..." />
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
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Search Location</label>
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
          </div>
          
          {userLocation && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Your Current Location</p>
                    <p className="text-sm text-blue-700">{userLocation.address}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLocationPrediction(userLocation.lat, userLocation.lon, userLocation.address)}
                  disabled={loading}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Analyze My Location
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="relative">
              <RefreshCw className="w-16 h-16 animate-spin mx-auto mb-6 text-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CloudRain className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Weather Data</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Our AI model is processing meteorological data and generating comprehensive flood risk predictions...
            </p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {predictionData && !loading && (
        <div className="space-y-6">
          {/* Main Prediction Card */}
          {predictionData.main_prediction && (
            <Card className="border-0 shadow-lg overflow-hidden">
              <div 
                className="h-2 w-full"
                style={{ backgroundColor: getRiskColor(predictionData.main_prediction['Risk Level']) }}
              ></div>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center text-xl">
                    {getRiskIcon(predictionData.main_prediction['Risk Level'])}
                    <span className="ml-3">Risk Assessment for {selectedLocation}</span>
                  </span>
                  <Badge 
                    className="text-white px-4 py-2 text-lg font-semibold"
                    style={{ 
                      backgroundColor: getRiskColor(predictionData.main_prediction['Risk Level']),
                      color: getRiskTextColor(predictionData.main_prediction['Risk Level'])
                    }}
                  >
                    {predictionData.main_prediction['Risk Level']}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Predicted Date</p>
                      <p className="text-xl font-bold text-blue-800">{formatDate(predictionData.main_prediction['Risk Date'] || '-')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">AI Confidence</p>
                      <p className="text-xl font-bold text-green-800">{predictionData.main_prediction['Confidence'] || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Risk Level</p>
                      <p className="text-xl font-bold text-purple-800">{predictionData.main_prediction['Risk Level']}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Different Views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
                <Eye className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="visualizations" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
                <BarChart3 className="w-4 h-4 mr-2" />
                Visualizations
              </TabsTrigger>
              <TabsTrigger value="regional" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
                <MapPin className="w-4 h-4 mr-2" />
                Regional Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Regional Analysis */}
              {predictionData.regional_analysis && predictionData.regional_analysis.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <CardTitle className="flex items-center">
                      <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                      Regional Analysis
                    </CardTitle>
                    <CardDescription>
                      Flood risk assessment for nearby locations in the same state
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      {predictionData.regional_analysis.map((location, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <div>
                              <span className="font-semibold text-gray-900">{location.Location}</span>
                              <p className="text-sm text-gray-600">
                                Risk Date: {formatDate(location['Risk Date'] || '-')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">{location['Confidence']}</span>
                            <Badge 
                              className="text-white px-3 py-1"
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

            <TabsContent value="visualizations" className="space-y-6">
              {predictionData.detailed_forecast && predictionData.detailed_forecast.length > 0 && (
                <FloodVisualizations
                  detailedForecast={predictionData.detailed_forecast}
                  riskLevel={predictionData.main_prediction?.['Risk Level'] || 'No Significant Risk'}
                  confidence={predictionData.main_prediction?.['Confidence'] || 'N/A'}
                  location={selectedLocation}
                />
              )}
            </TabsContent>

            <TabsContent value="regional" className="space-y-6">
              {/* Detailed Regional Map View */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50">
                  <CardTitle className="flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-green-600" />
                    Regional Risk Map
                  </CardTitle>
                  <CardDescription>
                    Interactive map showing flood risk across the region
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-400" />
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

export default EnhancedFloodPrediction;