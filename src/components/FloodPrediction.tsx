import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Droplets, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Eye, 
  Sun, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  floodPredictionService, 
  PredictionResponse, 
  ForecastDetail,
  LOCATION_COORDS 
} from '@/lib/floodPredictionService';

const FloodPrediction: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<{ healthy: boolean; url: string; lastChecked: string } | null>(null);

  const states = floodPredictionService.getStates();
  const locations = selectedState ? floodPredictionService.getLocationsByState(selectedState) : [];

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const status = await floodPredictionService.getApiStatus();
      setApiStatus(status);
    } catch (error) {
      console.error('Error checking API status:', error);
    }
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedLocation('');
    setPredictionData(null);
    setError('');
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setPredictionData(null);
    setError('');
  };

  const handleGeneratePrediction = async () => {
    if (!selectedLocation) {
      toast.error('Please select a location first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log(`🌤️ Generating prediction for ${selectedLocation}`);
      const result = await floodPredictionService.predictRegionalRisk(selectedLocation);
      setPredictionData(result);
      toast.success(`Flood prediction generated for ${selectedLocation}`);
    } catch (err) {
      console.error('❌ Error generating prediction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate flood prediction';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a location to search');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Try to find the location in our database first
      const coords = floodPredictionService.getLocationCoords(searchQuery);
      if (coords) {
        setSelectedState(coords.state);
        setSelectedLocation(searchQuery);
        const result = await floodPredictionService.predictRegionalRisk(searchQuery);
        setPredictionData(result);
        toast.success(`Flood prediction generated for ${searchQuery}`);
      } else {
        toast.error(`Location "${searchQuery}" not found in our database`);
      }
    } catch (err) {
      console.error('❌ Error searching location:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to search location';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    floodPredictionService.clearCache();
    await checkApiStatus();
    toast.success('Cache cleared. Fresh data will be fetched on next request.');
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high risk':
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium risk':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'low risk':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'no significant risk':
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flood Prediction</h1>
          <p className="text-gray-600 mt-2">AI-powered flood risk assessment using JanRakshak Pre-Alert Model</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* API Status */}
      {apiStatus && (
        <Alert className={apiStatus.healthy ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>API Status:</strong> {apiStatus.healthy ? 'Healthy' : 'Unhealthy'} 
            <span className="text-gray-500 ml-2">({apiStatus.url})</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Location Selection</span>
          </CardTitle>
          <CardDescription>
            Select a location or search for a specific city to get flood predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search for a city (e.g., Chandigarh, Ludhiana, Amritsar)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>

          {/* State and Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">Select State</Label>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Select Location</Label>
              <Select 
                value={selectedLocation} 
                onValueChange={handleLocationChange}
                disabled={!selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Prediction Button */}
          <Button 
            onClick={handleGeneratePrediction}
            disabled={!selectedLocation || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Prediction...
              </>
            ) : (
              <>
                <CloudRain className="w-4 h-4 mr-2" />
                Generate Flood Prediction
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Prediction Results */}
      {predictionData && (
        <div className="space-y-6">
          {/* Main Prediction */}
          {predictionData.main_prediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Main Prediction - {selectedLocation}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {getRiskIcon(predictionData.main_prediction['Risk Level'])}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-600">Risk Level</h3>
                    <Badge 
                      className="mt-2"
                      style={{ 
                        backgroundColor: floodPredictionService.getRiskColor(predictionData.main_prediction['Risk Level']),
                        color: floodPredictionService.getRiskTextColor(predictionData.main_prediction['Risk Level'])
                      }}
                    >
                      {predictionData.main_prediction['Risk Level']}
                    </Badge>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold text-sm text-gray-600">Confidence</h3>
                    <p className="text-lg font-bold text-blue-600">
                      {predictionData.main_prediction['Confidence'] || 'N/A'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold text-sm text-gray-600">Risk Date</h3>
                    <p className="text-sm font-medium text-purple-600">
                      {predictionData.main_prediction['Risk Date'] || 'N/A'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Droplets className="w-5 h-5 mx-auto mb-2 text-cyan-500" />
                    <h3 className="font-semibold text-sm text-gray-600">Water Level</h3>
                    <p className="text-sm font-medium text-cyan-600">
                      {predictionData.main_prediction['Water Level'] || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Forecast */}
          {predictionData.detailed_forecast && predictionData.detailed_forecast.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CloudRain className="w-5 h-5" />
                  <span>7-Day Detailed Forecast</span>
                </CardTitle>
                <CardDescription>
                  Hourly weather and flood risk predictions for the next 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="forecast" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="forecast">Forecast</TabsTrigger>
                    <TabsTrigger value="weather">Weather Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="forecast" className="space-y-4">
                    <div className="grid gap-4">
                      {predictionData.detailed_forecast.slice(0, 7).map((forecast, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{formatDate(forecast.date)}</span>
                              <span className="text-sm text-gray-500">{formatTime(forecast.date)}</span>
                            </div>
                            <Badge 
                              style={{ 
                                backgroundColor: floodPredictionService.getRiskColor(forecast.risk_level),
                                color: floodPredictionService.getRiskTextColor(forecast.risk_level)
                              }}
                            >
                              {forecast.risk_level}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <CloudRain className="w-4 h-4 text-blue-500" />
                              <span>{forecast.rainfall_mm}mm</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Thermometer className="w-4 h-4 text-red-500" />
                              <span>{forecast.temperature}°C</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Wind className="w-4 h-4 text-gray-500" />
                              <span>{forecast.wind_speed} km/h</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Eye className="w-4 h-4 text-purple-500" />
                              <span>{forecast.visibility} km</span>
                            </div>
                          </div>
                          
                          {forecast.flood_probability && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Flood Probability</span>
                                <span>{forecast.flood_probability}%</span>
                              </div>
                              <Progress value={forecast.flood_probability} className="h-2" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="weather" className="space-y-4">
                    <div className="grid gap-4">
                      {predictionData.detailed_forecast.slice(0, 7).map((forecast, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3">{formatDate(forecast.date)}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Thermometer className="w-4 h-4 text-red-500" />
                                <span>Temperature: {forecast.temperature}°C</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Droplets className="w-4 h-4 text-blue-500" />
                                <span>Humidity: {forecast.humidity}%</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Wind className="w-4 h-4 text-gray-500" />
                                <span>Wind: {forecast.wind_speed} km/h</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-purple-500" />
                                <span>Pressure: {forecast.pressure} hPa</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Eye className="w-4 h-4 text-indigo-500" />
                                <span>Visibility: {forecast.visibility} km</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Sun className="w-4 h-4 text-yellow-500" />
                                <span>UV Index: {forecast.uv_index}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Model Information */}
          {predictionData.model_info && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Model Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Version:</span> {predictionData.model_info.version}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {formatDate(predictionData.model_info.last_updated)}
                  </div>
                  <div>
                    <span className="font-medium">Accuracy:</span> {predictionData.model_info.accuracy}%
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FloodPrediction;