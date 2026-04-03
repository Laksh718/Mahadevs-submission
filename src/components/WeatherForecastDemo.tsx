import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Droplets,
  Wind,
  CloudRain,
  Thermometer,
  Eye,
  Gauge
} from 'lucide-react';
import { floodPredictionService, PredictionResponse } from '@/lib/floodPredictionService';

const WeatherForecastDemo: React.FC = () => {
  const [forecastData, setForecastData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Hyderabad');

  const locations = ['Hyderabad', 'Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Kolkata'];

  const loadForecast = async (location: string) => {
    setLoading(true);
    setSelectedLocation(location);
    try {
      const result = await floodPredictionService.predictRegionalRiskWithWeather(location);
      setForecastData(result);
    } catch (error) {
      console.error('Error loading forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast('Hyderabad');
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'heavy rain':
        return '🌧️';
      case 'moderate rain':
        return '🌦️';
      case 'light rain':
        return '🌧️';
      case 'cloudy':
        return '☁️';
      case 'partly cloudy':
        return '⛅';
      default:
        return '☀️';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🌤️ Real 7-Day Weather Forecast
        </h1>
        <p className="text-gray-600">
          Detailed daily weather and flood risk data powered by AI prediction model
        </p>
      </div>

      {/* Location Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Select Location
          </CardTitle>
          <CardDescription>
            Choose a city to view detailed 7-day weather forecast
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => (
              <Button
                key={location}
                variant={selectedLocation === location ? "default" : "outline"}
                onClick={() => loadForecast(location)}
                disabled={loading}
                className="mb-2"
              >
                {location}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating weather forecast for {selectedLocation}...</p>
          </CardContent>
        </Card>
      )}

      {/* Main Prediction */}
      {forecastData && !loading && (
        <div className="space-y-6">
          {/* Risk Assessment */}
          {forecastData.main_prediction && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Flood Risk Assessment for {selectedLocation}
                  </span>
                  <Badge 
                    className="text-white"
                    style={{ 
                      backgroundColor: floodPredictionService.getRiskColor(forecastData.main_prediction['Risk Level']),
                      color: floodPredictionService.getRiskTextColor(forecastData.main_prediction['Risk Level'])
                    }}
                  >
                    {forecastData.main_prediction['Risk Level']}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Risk Date</p>
                      <p className="font-medium">{forecastData.main_prediction['Risk Date'] || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="font-medium">{forecastData.main_prediction['Confidence'] || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Avg Temperature</p>
                      <p className="font-medium">
                        {(forecastData.detailed_forecast.reduce((sum, day) => sum + day.temperature, 0) / forecastData.detailed_forecast.length).toFixed(1)}°C
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 7-Day Detailed Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                7-Day Detailed Weather Forecast
              </CardTitle>
              <CardDescription>
                Daily weather conditions, rainfall, and flood risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {forecastData.detailed_forecast.map((day, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-lg transition-shadow">
                    {/* Date and Risk */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">{formatDate(day.date)}</span>
                      </div>
                      <Badge 
                        className="text-xs"
                        style={{ 
                          backgroundColor: floodPredictionService.getRiskColor(day.risk_level),
                          color: floodPredictionService.getRiskTextColor(day.risk_level)
                        }}
                      >
                        {day.risk_level}
                      </Badge>
                    </div>
                    
                    {/* Weather Condition */}
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-1">{getWeatherIcon(day.weather_condition)}</div>
                      <div className="text-lg font-semibold text-gray-800">{day.weather_condition}</div>
                      <div className="text-3xl font-bold text-blue-600">{day.temperature}°C</div>
                    </div>
                    
                    {/* Weather Stats */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600">Rainfall</span>
                        </div>
                        <span className="font-semibold text-blue-700">{day.rainfall_mm.toFixed(1)} mm</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Wind className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Wind</span>
                        </div>
                        <span className="font-semibold text-gray-700">{day.wind_speed} km/h</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CloudRain className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Humidity</span>
                        </div>
                        <span className="font-semibold text-gray-700">{day.humidity}%</span>
                      </div>
                    </div>
                    
                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span>Pressure:</span>
                        <span className="font-medium">{day.pressure} hPa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visibility:</span>
                        <span className="font-medium">{day.visibility} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>UV Index:</span>
                        <span className="font-medium">{day.uv_index}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rain Chance:</span>
                        <span className="font-medium">{day.precipitation_probability}%</span>
                      </div>
                    </div>
                    
                    {/* Rainfall Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((day.rainfall_mm / 50) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {day.rainfall_mm > 20 ? 'Heavy' : day.rainfall_mm > 10 ? 'Moderate' : day.rainfall_mm > 0 ? 'Light' : 'None'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Confidence */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-semibold text-green-700">{(day.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary Statistics */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">7-Day Weather Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {forecastData.detailed_forecast.reduce((sum, day) => sum + day.rainfall_mm, 0).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Total Rainfall (mm)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {(forecastData.detailed_forecast.reduce((sum, day) => sum + day.temperature, 0) / forecastData.detailed_forecast.length).toFixed(1)}°C
                    </div>
                    <div className="text-sm text-gray-600">Avg Temperature</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {forecastData.detailed_forecast.filter(day => day.risk_level.includes('High')).length}
                    </div>
                    <div className="text-sm text-gray-600">High Risk Days</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.max(...forecastData.detailed_forecast.map(day => day.rainfall_mm)).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Peak Rainfall (mm)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WeatherForecastDemo;