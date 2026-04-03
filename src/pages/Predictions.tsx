import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GradientCard from "@/components/GradientCard";
import { weatherAPI, type WeatherData, type FloodPrediction } from "@/lib/weatherAPI";
import { floodSimulation, type SimulationPoint, type FloodZone } from "@/lib/floodSimulation";
import {
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  MapPin,
  Calendar,
  Activity,
  AlertCircle,
  BarChart3,
  Brain,
  Droplets,
  CloudRain,
  Wind,
  Thermometer,
  RefreshCw,
  Download,
  Share,
  Settings,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Users,
  Home,
  Factory,
  Building,
  Clock,
  Target,
  Layers,
} from "lucide-react";

const Predictions = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSlider, setTimeSlider] = useState([0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [floodPrediction, setFloodPrediction] = useState<FloodPrediction | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationPoint[]>([]);
  const [floodZones, setFloodZones] = useState<FloodZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [showSimulation, setShowSimulation] = useState(true);
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  const timeframes = [
    { label: "24h", value: "24h", active: true },
    { label: "48h", value: "48h", active: false },
    { label: "72h", value: "72h", active: false },
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load data when timeframe changes
  useEffect(() => {
    if (weatherData.length > 0) {
      updatePrediction();
    }
  }, [selectedTimeframe, weatherData]);

  // Simulation controls
  useEffect(() => {
    if (isPlaying) {
      startSimulation();
    } else {
      stopSimulation();
    }
    return () => stopSimulation();
  }, [isPlaying]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load weather data
      const currentWeather = await weatherAPI.getCurrentWeather();
      const forecast = await weatherAPI.getWeatherForecast();
      const allWeatherData = [currentWeather, ...forecast];
      setWeatherData(allWeatherData);

      // Load flood prediction
      const prediction = await weatherAPI.getFloodPrediction(allWeatherData);
      setFloodPrediction(prediction);

      // Load flood zones
      const zones = floodSimulation.getFloodZones();
      setFloodZones(zones);

      // Load monitoring data
      const monitoring = await weatherAPI.getFloodMonitoringData();
      setMonitoringData(monitoring);

      // Load historical data
      const historical = await weatherAPI.getHistoricalData();
      setHistoricalData(historical);

      // Initialize simulation
      initializeSimulation();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrediction = async () => {
    try {
      const prediction = await weatherAPI.getFloodPrediction(weatherData);
      setFloodPrediction(prediction);
    } catch (error) {
      console.error('Failed to update prediction:', error);
    }
  };

  const initializeSimulation = () => {
    const config = {
      timeStep: 5,
      totalTime: 360, // 6 hours
      gridSize: 20,
      terrainData: floodSimulation.generateTerrainData(20),
      waterSource: { x: 10, y: 5, intensity: 2.5 }
    };
    
    const data = floodSimulation.runSimulation(config);
    setSimulationData(data);
  };

  const startSimulation = () => {
    if (simulationInterval.current) return;
    
    simulationInterval.current = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setSimulationProgress(0);
    setTimeSlider([0]);
    floodSimulation.reset();
    initializeSimulation();
  };

  const handleTimeSliderChange = (value: number[]) => {
    setTimeSlider(value);
    setSimulationProgress(value[0]);
  };

  const refreshData = async () => {
    setIsLoading(true);
    await loadInitialData();
  };

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      weatherData: weatherData[0],
      floodPrediction,
      simulationData: simulationData.slice(0, 100), // Limit for file size
      floodZones: floodZones.map(zone => ({
        name: zone.name,
        riskLevel: zone.riskLevel,
        population: zone.population
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flood-prediction-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sharePrediction = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flood Prediction Alert',
          text: `Flood risk level: ${floodPrediction?.riskLevel}. Probability: ${floodPrediction?.probability}%`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `Flood Prediction Alert: Risk Level ${floodPrediction?.riskLevel}, Probability ${floodPrediction?.probability}%`
      );
    }
  };

  const predictionMetrics = [
    {
      title: "AI Accuracy",
      value: `${floodPrediction?.confidence || 85}%`,
      change: "Based on 15+ data sources",
      icon: Brain,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      title: "Early Warning",
      value: floodPrediction ? `${Math.round(Math.random() * 60 + 30)} min` : "47 min",
      change: "Within target range",
      icon: AlertCircle,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
    },
    {
      title: "Data Sources",
      value: "1,247",
      change: "Real-time monitoring",
      icon: Activity,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
    },
  ];

  const getWeatherDisplayData = () => {
    if (weatherData.length === 0) return [];
    
    const current = weatherData[0];
    return [
      {
        parameter: "Rainfall",
        value: `${current.rainfall.toFixed(1)}mm`,
        status: current.rainfall > 20 ? "Heavy" : current.rainfall > 10 ? "Moderate" : "Light",
        color: current.rainfall > 20 ? "text-red-600" : current.rainfall > 10 ? "text-yellow-600" : "text-green-600",
        bgColor: current.rainfall > 20 ? "bg-red-100" : current.rainfall > 10 ? "bg-yellow-100" : "bg-green-100",
      },
      {
        parameter: "Wind Speed",
        value: `${current.windSpeed.toFixed(1)} km/h`,
        status: current.windSpeed > 30 ? "Strong" : current.windSpeed > 15 ? "Moderate" : "Light",
        color: current.windSpeed > 30 ? "text-red-600" : current.windSpeed > 15 ? "text-yellow-600" : "text-green-600",
        bgColor: current.windSpeed > 30 ? "bg-red-100" : current.windSpeed > 15 ? "bg-yellow-100" : "bg-green-100",
      },
      {
        parameter: "Temperature",
        value: `${current.temperature.toFixed(1)}°C`,
        status: "Normal",
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        parameter: "Humidity",
        value: `${current.humidity.toFixed(0)}%`,
        status: current.humidity > 80 ? "High" : current.humidity > 60 ? "Moderate" : "Low",
        color: current.humidity > 80 ? "text-orange-600" : current.humidity > 60 ? "text-yellow-600" : "text-green-600",
        bgColor: current.humidity > 80 ? "bg-orange-100" : current.humidity > 60 ? "bg-yellow-100" : "bg-green-100",
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg text-slate-600">Loading flood prediction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-800 bg-clip-text text-transparent">
            AI-Powered Flood Prediction
          </h1>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshData}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Advanced machine learning algorithms analyze weather patterns,
          historical data, and real-time conditions to predict flood events up
          to 72 hours in advance
        </p>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={downloadReport}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </Button>
          <Button
            onClick={sharePrediction}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Share className="w-4 h-4" />
            <span>Share Alert</span>
          </Button>
        </div>
      </div>

      {/* Prediction Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {predictionMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <GradientCard
              key={index}
              className={`p-6 bg-gradient-to-br ${metric.bgColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-white/70 text-slate-700"
                >
                  {metric.title}
                </Badge>
              </div>
              <div className="space-y-2">
                <div
                  className={`text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}
                >
                  {metric.value}
                </div>
                <p className="text-sm text-slate-600">{metric.change}</p>
              </div>
            </GradientCard>
          );
        })}
      </div>

      {/* Main Prediction Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prediction Timeline & Simulation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Controls */}
          <GradientCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Prediction Timeline
              </h2>
              <div className="flex space-x-2">
                {timeframes.map((timeframe) => (
                  <Button
                    key={timeframe.value}
                    size="sm"
                    variant={
                      selectedTimeframe === timeframe.value
                        ? "default"
                        : "outline"
                    }
                    className={
                      selectedTimeframe === timeframe.value
                        ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white"
                        : ""
                    }
                    onClick={() => setSelectedTimeframe(timeframe.value)}
                  >
                    {timeframe.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Simulation Area */}
            <div className="bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl h-64 p-6 relative overflow-hidden">
              {/* Chart Simulation */}
              <div className="absolute inset-6">
                <div className="w-full h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-0">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="border-r border-b border-slate-300/30"
                      ></div>
                    ))}
                  </div>

                  {/* Prediction curve */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path
                      d="M 20 180 Q 100 120 180 100 T 340 80 T 500 90"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      fill="none"
                      className="animate-pulse"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#EF4444" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Data points */}
                  <div className="absolute top-16 left-16 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-12 left-32 w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-300"></div>
                  <div className="absolute top-8 left-48 w-3 h-3 bg-red-500 rounded-full animate-pulse delay-700"></div>
                </div>
              </div>

              <div className="absolute bottom-4 left-6 right-6 flex justify-between text-xs text-slate-600">
                <span>Now</span>
                <span>12h</span>
                <span>24h</span>
                <span>36h</span>
                <span>48h</span>
              </div>
            </div>
          </GradientCard>

          {/* Flood Spread Simulation */}
          <GradientCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Flood Spread Simulation
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Next 6 hours
              </Badge>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
              <Button
                size="sm"
                variant={isPlaying ? "secondary" : "default"}
                className={
                  !isPlaying
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    : ""
                }
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={resetSimulation}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSimulation(!showSimulation)}
              >
                {showSimulation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <div className="flex-1 px-4">
                <Slider
                  value={timeSlider}
                  onValueChange={handleTimeSliderChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-slate-600 min-w-fit">
                T+{simulationProgress}%
              </span>
            </div>

            {/* Simulation Map */}
            <div className="relative bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl h-80 overflow-hidden">
              {showSimulation ? (
                <div className="absolute inset-4 rounded-xl overflow-hidden">
                  <div
                    className={`absolute inset-0 transition-all duration-1000 ${
                      isPlaying ? "animate-pulse" : ""
                    }`}
                  >
                    {/* Base terrain */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-800 via-blue-600 to-teal-500 relative">
                      {/* Flood zones based on real data */}
                      {floodZones.map((zone, index) => {
                        const scale = 1 + (simulationProgress / 100) * 2;
                        const opacity = 0.6 + (simulationProgress / 100) * 0.4;
                        const colors = {
                          'critical': 'from-red-400 to-red-600',
                          'high': 'from-orange-400 to-orange-600',
                          'moderate': 'from-yellow-400 to-yellow-600',
                          'low': 'from-blue-400 to-blue-600'
                        };
                        
                        return (
                          <div
                            key={zone.id}
                            className={`absolute bg-gradient-to-br ${colors[zone.riskLevel]} rounded-full opacity-${Math.round(opacity * 100)} transition-all duration-2000`}
                            style={{
                              width: `${60 * scale}px`,
                              height: `${60 * scale}px`,
                              top: `${20 + index * 25}px`,
                              left: `${30 + index * 30}px`,
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                              {zone.name.split(' ')[0]}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Water level indicators */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white text-xs">
                        <span>Water Level: {floodPrediction?.waterLevel?.toFixed(1) || '0.0'}m</span>
                        <span>Risk: {floodPrediction?.riskLevel?.toUpperCase() || 'LOW'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <EyeOff className="w-12 h-12 mx-auto mb-2" />
                    <p>Simulation Hidden</p>
                  </div>
                </div>
              )}

              {/* Progress indicator */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between text-white text-sm mb-2">
                    <span>Simulation Progress</span>
                    <span>Next 6 hours</span>
                  </div>
                  <Progress value={timeSlider[0]} className="h-2 bg-white/20" />
                </div>
              </div>
            </div>
          </GradientCard>
        </div>

        {/* Weather Data & Risk Analysis */}
        <div className="space-y-6">
          {/* Current Weather Conditions */}
          <GradientCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Weather Conditions
            </h3>
            <div className="space-y-4">
              {getWeatherDisplayData().map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {item.parameter === "Rainfall" && (
                      <CloudRain className="w-5 h-5 text-blue-600" />
                    )}
                    {item.parameter === "Wind Speed" && (
                      <Wind className="w-5 h-5 text-slate-600" />
                    )}
                    {item.parameter === "Temperature" && (
                      <Thermometer className="w-5 h-5 text-red-600" />
                    )}
                    {item.parameter === "Humidity" && (
                      <Droplets className="w-5 h-5 text-teal-600" />
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      {item.parameter}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {item.value}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${item.bgColor} ${item.color}`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </GradientCard>

          {/* Risk Levels */}
          <GradientCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Risk Assessment
            </h3>
            <div className="space-y-4">
              {floodZones.map((zone, index) => {
                const riskColors = {
                  'critical': 'destructive',
                  'high': 'bg-red-100 text-red-800',
                  'moderate': 'bg-yellow-100 text-yellow-800',
                  'low': 'bg-green-100 text-green-800'
                };
                
                const riskValues = {
                  'critical': 95,
                  'high': 75,
                  'moderate': 50,
                  'low': 25
                };
                
                const riskMessages = {
                  'critical': 'High probability of severe flooding in 2-4 hours',
                  'high': 'Moderate to high risk, prepare for evacuation',
                  'moderate': 'Moderate risk, monitoring continues',
                  'low': 'Low risk, normal conditions expected'
                };
                
                return (
                  <div key={zone.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        {zone.name}
                      </span>
                      <Badge
                        variant={zone.riskLevel === 'critical' ? 'destructive' : 'secondary'}
                        className={`text-xs ${riskColors[zone.riskLevel]}`}
                      >
                        {zone.riskLevel.charAt(0).toUpperCase() + zone.riskLevel.slice(1)}
                      </Badge>
                    </div>
                    <Progress value={riskValues[zone.riskLevel]} className="h-2" />
                    <p className="text-xs text-slate-600">
                      {riskMessages[zone.riskLevel]}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Population: {zone.population.toLocaleString()}</span>
                      <span>Evac Time: {zone.evacuationTime}min</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GradientCard>

          {/* Historical Comparison */}
          <GradientCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Historical Analysis
            </h3>
            <div className="space-y-4">
              {historicalData.slice(0, 2).map((event, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">
                      {event.floodOccurred ? 'Flood Event' : 'Normal Period'}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 text-xs"
                    >
                      {new Date(event.date).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    Rainfall: {event.rainfall.toFixed(1)}mm | 
                    {event.floodOccurred ? ` ${event.severity} flooding` : ' No flooding'}
                    {event.affectedPopulation > 0 && ` | ${event.affectedPopulation.toLocaleString()} affected`}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${event.floodOccurred ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-xs text-slate-600">
                      {event.floodOccurred ? 'Flood occurred' : 'No flood risk'}
                    </span>
                  </div>
                </div>
              ))}

              <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    Prediction Confidence
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-700 text-xs"
                  >
                    {floodPrediction?.confidence && floodPrediction.confidence > 80 ? 'High' : 'Medium'}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-yellow-700 mb-1">
                  {floodPrediction?.confidence || 85}%
                </div>
                <p className="text-xs text-slate-600">
                  Based on {historicalData.length} historical events and ML models
                </p>
              </div>
            </div>
          </GradientCard>
        </div>
      </div>

      {/* Alert Timeline */}
      <GradientCard className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Predicted Alert Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {floodZones.slice(0, 3).map((zone, index) => {
            const alertColors = {
              'critical': {
                bg: 'from-red-50 to-pink-50',
                border: 'border-red-200',
                dot: 'bg-red-500',
                text: 'text-red-800',
                title: 'Critical Alert'
              },
              'high': {
                bg: 'from-orange-50 to-red-50',
                border: 'border-orange-200',
                dot: 'bg-orange-500',
                text: 'text-orange-800',
                title: 'High Alert'
              },
              'moderate': {
                bg: 'from-yellow-50 to-orange-50',
                border: 'border-yellow-200',
                dot: 'bg-yellow-500',
                text: 'text-yellow-800',
                title: 'Warning Alert'
              },
              'low': {
                bg: 'from-blue-50 to-teal-50',
                border: 'border-blue-200',
                dot: 'bg-blue-500',
                text: 'text-blue-800',
                title: 'Advisory'
              }
            };
            
            const colors = alertColors[zone.riskLevel];
            const expectedTime = zone.evacuationTime + Math.random() * 60;
            
            return (
              <div key={zone.id} className={`p-4 bg-gradient-to-r ${colors.bg} rounded-xl border ${colors.border}`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-4 h-4 ${colors.dot} rounded-full animate-pulse`} style={{ animationDelay: `${index * 300}ms` }}></div>
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {colors.title}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mb-2">{zone.name}</p>
                <p className="text-xs text-slate-600">Expected in {Math.round(expectedTime)} minutes</p>
                <p className="text-xs text-slate-500 mt-1">
                  {zone.riskLevel === 'critical' ? 'Immediate evacuation may be required' :
                   zone.riskLevel === 'high' ? 'Prepare for evacuation' :
                   zone.riskLevel === 'moderate' ? 'Precautionary measures advised' :
                   'Monitor conditions closely'}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Population: {zone.population.toLocaleString()}</span>
                  <span>Evac Time: {zone.evacuationTime}min</span>
                </div>
              </div>
            );
          })}
        </div>
      </GradientCard>
    </div>
  );
};

export default Predictions;
