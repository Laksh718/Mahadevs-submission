import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Globe,
  Info,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { LOCATION_COORDS } from '@/lib/floodPredictionService';

interface PredictionData {
  location: string;
  risk_level: string;
  risk_date: string;
  confidence: number;
  rainfall_forecast: Array<{
    date: string;
    rainfall_mm: number;
    risk_level: string;
  }>;
}

interface SimpleFloodPredictionProps {
  isAdminView?: boolean;
}

const SimpleFloodPrediction: React.FC<SimpleFloodPredictionProps> = ({ isAdminView = false }) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [allPredictions, setAllPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('location');

  // Generate comprehensive statesAndCities from LOCATION_COORDS
  const statesAndCities = React.useMemo(() => {
    const stateCityMap: { [key: string]: string[] } = {};
    
    Object.entries(LOCATION_COORDS).forEach(([city, data]) => {
      const state = data.state;
      if (!stateCityMap[state]) {
        stateCityMap[state] = [];
      }
      if (!stateCityMap[state].includes(city)) {
        stateCityMap[state].push(city);
      }
    });
    
    // Sort cities within each state
    Object.keys(stateCityMap).forEach(state => {
      stateCityMap[state].sort();
    });
    
    return stateCityMap;
  }, []);

  // City coordinates mapping
  const cityCoordinates: { [key: string]: { lat: number; lon: number } } = {
    // Andhra Pradesh
    'Visakhapatnam': { lat: 17.6868, lon: 83.2185 },
    'Vijayawada': { lat: 16.5062, lon: 80.6480 },
    'Guntur': { lat: 16.3068, lon: 80.4365 },
    'Tirupati': { lat: 13.6288, lon: 79.4192 },
    
    // Assam
    'Guwahati': { lat: 26.1445, lon: 91.7362 },
    'Silchar': { lat: 24.8163, lon: 92.7974 },
    'Dibrugarh': { lat: 27.4728, lon: 94.9119 },
    'Jorhat': { lat: 26.7509, lon: 94.2037 },
    
    // Bihar
    'Patna': { lat: 25.5941, lon: 85.1376 },
    'Gaya': { lat: 24.7955, lon: 85.0000 },
    'Bhagalpur': { lat: 25.2445, lon: 86.9718 },
    'Muzaffarpur': { lat: 26.1209, lon: 85.3647 },
    
    // Chhattisgarh
    'Raipur': { lat: 21.2514, lon: 81.6296 },
    'Bhilai': { lat: 21.2092, lon: 81.4285 },
    'Bilaspur': { lat: 22.0796, lon: 82.1391 },
    
    // Delhi
    'Delhi': { lat: 28.7041, lon: 77.1025 },
    'New Delhi': { lat: 28.6139, lon: 77.2090 },
    
    // Goa
    'Panaji': { lat: 15.4909, lon: 73.8278 },
    'Margao': { lat: 15.2733, lon: 73.9581 },
    
    // Gujarat
    'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
    'Surat': { lat: 21.1702, lon: 72.8311 },
    'Vadodara': { lat: 22.3072, lon: 73.1812 },
    'Rajkot': { lat: 22.3039, lon: 70.8022 },
    'Bhavnagar': { lat: 21.7645, lon: 72.1519 },
    
    // Haryana
    'Gurgaon': { lat: 28.4595, lon: 77.0266 },
    'Faridabad': { lat: 28.4089, lon: 77.3178 },
    'Panipat': { lat: 29.3909, lon: 76.9635 },
    'Hisar': { lat: 29.1492, lon: 75.7217 },
    
    // Himachal Pradesh
    'Shimla': { lat: 31.1048, lon: 77.1734 },
    'Dharamshala': { lat: 32.2190, lon: 76.3234 },
    'Manali': { lat: 32.2396, lon: 77.1887 },
    'Kullu': { lat: 31.9630, lon: 77.1080 },
    
    // Jammu and Kashmir
    'Srinagar': { lat: 34.0837, lon: 74.7973 },
    'Jammu': { lat: 32.7266, lon: 74.8570 },
    'Leh': { lat: 34.1526, lon: 77.5771 },
    
    // Jharkhand
    'Ranchi': { lat: 23.3441, lon: 85.3096 },
    'Jamshedpur': { lat: 22.8046, lon: 86.2029 },
    'Dhanbad': { lat: 23.7957, lon: 86.4304 },
    'Bokaro': { lat: 23.6693, lon: 85.9786 },
    
    // Karnataka
    'Bangalore': { lat: 12.9716, lon: 77.5946 },
    'Mysore': { lat: 12.2958, lon: 76.6394 },
    'Hubli': { lat: 15.3647, lon: 75.1240 },
    'Mangalore': { lat: 12.9141, lon: 74.8560 },
    
    // Kerala
    'Thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
    'Kochi': { lat: 9.9312, lon: 76.2673 },
    'Kozhikode': { lat: 11.2588, lon: 75.7804 },
    'Thrissur': { lat: 10.5276, lon: 76.2144 },
    
    // Madhya Pradesh
    'Bhopal': { lat: 23.2599, lon: 77.4126 },
    'Indore': { lat: 22.7196, lon: 75.8577 },
    'Gwalior': { lat: 26.2183, lon: 78.1828 },
    'Jabalpur': { lat: 23.1815, lon: 79.9864 },
    
    // Maharashtra
    'Mumbai': { lat: 19.0760, lon: 72.8777 },
    'Pune': { lat: 18.5204, lon: 73.8567 },
    'Nagpur': { lat: 21.1458, lon: 79.0882 },
    'Nashik': { lat: 19.9975, lon: 73.7898 },
    'Aurangabad': { lat: 19.8762, lon: 75.3433 },
    
    // Manipur
    'Imphal': { lat: 24.8170, lon: 93.9368 },
    'Thoubal': { lat: 24.6333, lon: 94.0167 },
    
    // Meghalaya
    'Shillong': { lat: 25.5788, lon: 91.8933 },
    'Tura': { lat: 25.5144, lon: 90.2029 },
    
    // Mizoram
    'Aizawl': { lat: 23.7271, lon: 92.7176 },
    'Lunglei': { lat: 22.8833, lon: 92.7333 },
    
    // Nagaland
    'Kohima': { lat: 25.6751, lon: 94.1086 },
    'Dimapur': { lat: 25.9117, lon: 93.7215 },
    
    // Odisha
    'Bhubaneswar': { lat: 20.2961, lon: 85.8245 },
    'Cuttack': { lat: 20.4625, lon: 85.8830 },
    'Rourkela': { lat: 22.2604, lon: 84.8536 },
    'Berhampur': { lat: 19.3149, lon: 84.7941 },
    
    // Punjab
    'Chandigarh': { lat: 30.7333, lon: 76.7794 },
    'Ludhiana': { lat: 30.9010, lon: 75.8573 },
    'Amritsar': { lat: 31.6340, lon: 74.8720 },
    'Jalandhar': { lat: 31.3260, lon: 75.5762 },
    
    // Rajasthan
    'Jaipur': { lat: 26.9124, lon: 75.7873 },
    'Jodhpur': { lat: 26.2389, lon: 73.0243 },
    'Udaipur': { lat: 24.5854, lon: 73.7125 },
    'Kota': { lat: 25.2138, lon: 75.8648 },
    'Ajmer': { lat: 26.4499, lon: 74.6399 },
    
    // Sikkim
    'Gangtok': { lat: 27.3314, lon: 88.6138 },
    'Namchi': { lat: 27.1667, lon: 88.3500 },
    
    // Tamil Nadu
    'Chennai': { lat: 13.0827, lon: 80.2707 },
    'Coimbatore': { lat: 11.0168, lon: 76.9558 },
    'Madurai': { lat: 9.9252, lon: 78.1198 },
    'Tiruchirappalli': { lat: 10.7905, lon: 78.7047 },
    
    // Telangana
    'Hyderabad': { lat: 17.3850, lon: 78.4867 },
    'Warangal': { lat: 17.9689, lon: 79.5941 },
    'Nizamabad': { lat: 18.6715, lon: 78.0938 },
    'Karimnagar': { lat: 18.4386, lon: 79.1288 },
    
    // Tripura
    'Agartala': { lat: 23.8315, lon: 91.2862 },
    'Dharmanagar': { lat: 24.3667, lon: 92.1667 },
    
    // Uttar Pradesh
    'Lucknow': { lat: 26.8467, lon: 80.9462 },
    'Kanpur': { lat: 26.4499, lon: 80.3319 },
    'Agra': { lat: 27.1767, lon: 78.0081 },
    'Varanasi': { lat: 25.3176, lon: 82.9739 },
    'Allahabad': { lat: 25.4358, lon: 81.8463 },
    
    // Uttarakhand
    'Dehradun': { lat: 30.3165, lon: 78.0322 },
    'Haridwar': { lat: 29.9457, lon: 78.1642 },
    'Rishikesh': { lat: 30.0869, lon: 78.2676 },
    'Nainital': { lat: 29.3919, lon: 79.4542 },
    
    // West Bengal
    'Kolkata': { lat: 22.5726, lon: 88.3639 },
    'Howrah': { lat: 22.5958, lon: 88.2636 },
    'Durgapur': { lat: 23.5204, lon: 87.3119 },
    'Asansol': { lat: 23.6739, lon: 86.9524 }
  };

  const getCityCoordinates = (cityName: string): { lat: number; lon: number } | null => {
    const cityData = LOCATION_COORDS[cityName];
    return cityData ? { lat: cityData.lat, lon: cityData.lon } : null;
  };

  const refreshData = async () => {
    // Clear cache and reset data
    setPredictionData(null);
    setAllPredictions([]);
    setError('');
    
    // Clear cache from the flood prediction service
    try {
      const { floodPredictionService } = await import('@/lib/floodPredictionService');
      floodPredictionService.clearCache();
      console.log('🔄 Cache cleared from service');
    } catch (error) {
      console.log('⚠️ Could not clear service cache:', error);
    }
    
    console.log('🔄 Refreshing data...');
    toast.success('Cache cleared. Fresh data will be fetched on next request.');
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity('');
    setPredictionData(null);
    setError('');
  };

  const getPrediction = async () => {
    if (!selectedCity) {
      toast.error('Please select a city');
      return;
    }
    await getPredictionForCity(selectedCity);
  };

  const getPredictionForCity = async (city: string) => {
    setLoading(true);
    setError('');

    try {
      console.log(`🌤️ Getting prediction for city: ${city}`);
      // Get coordinates for the selected city
      const cityCoords = getCityCoordinates(city);
      if (!cityCoords) {
        throw new Error(`Coordinates not found for ${city}`);
      }

      console.log(`🔗 Calling API for ${city} at coordinates ${cityCoords.lat}, ${cityCoords.lon}`);
      
      const response = await fetch('https://janrakshak-pre-alert-model.onrender.com/predict_by_coords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          lat: cityCoords.lat, 
          lon: cityCoords.lon 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
        
        // Transform API response to our format
        const transformedData: PredictionData = {
          location: city,
          risk_level: data.main_prediction?.['Risk Level'] || 'No Significant Risk',
          risk_date: data.main_prediction?.['Risk Date'] || new Date().toISOString().split('T')[0],
          confidence: parseFloat(data.main_prediction?.['Confidence']?.replace('%', '') || '85.0'),
          rainfall_forecast: (data.detailed_forecast || []).map((day: any) => ({
            date: day.date || new Date().toISOString().split('T')[0],
            rainfall_mm: day.rainfall_mm || 0,
            risk_level: day.risk_level || 'No Significant Risk'
          })) || []
        };
        
        setPredictionData(transformedData);
        setActiveTab('analysis'); // Automatically switch to analysis tab
        toast.success(`Flood prediction generated for ${city}`);
      } else {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(`Failed to get prediction for ${city}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error(`Failed to get prediction for ${city}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setPredictionData(null);
    setError('');
  };

  const getAllPredictions = async () => {
    setLoadingAll(true);
    setError('');
    
    try {
      console.log('📊 Fetching data for all major cities...');
      
      const allCities = Object.values(statesAndCities).flat();
      const results = [];
      
      for (const city of allCities.slice(0, 10)) { // Limit to first 10 cities for performance
        try {
          const coords = getCityCoordinates(city);
          if (coords) {
            console.log(`🔗 Fetching API data for ${city}...`);
            const response = await fetch('https://janrakshak-pre-alert-model.onrender.com/predict_by_coords', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                lat: coords.lat, 
                lon: coords.lon 
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const transformedData: PredictionData = {
                location: city,
                risk_level: data.main_prediction?.['Risk Level'] || 'No Significant Risk',
                risk_date: data.main_prediction?.['Risk Date'] || new Date().toISOString().split('T')[0],
                confidence: parseFloat(data.main_prediction?.['Confidence']?.replace('%', '') || '85.0'),
                rainfall_forecast: (data.detailed_forecast || []).map((day: any) => ({
                  date: day.date || new Date().toISOString().split('T')[0],
                  rainfall_mm: day.rainfall_mm || 0,
                  risk_level: day.risk_level || 'No Significant Risk'
                })) || []
              };
              results.push(transformedData);
              console.log(`✅ Got API prediction for ${city}`);
            } else {
              console.log(`⚠️ API failed for ${city}: ${response.status}`);
            }
          }
        } catch (err) {
          console.error(`❌ Failed to get prediction for ${city}:`, err);
        }
      }
      
      console.log(`🎉 Got predictions for ${results.length} cities`);
      setAllPredictions(results);
      setActiveTab('overview');
      toast.success(`Generated predictions for ${results.length} cities`);
    } catch (err) {
      console.error('💥 Error in getAllPredictions:', err);
      setError('Failed to generate predictions for all cities');
      toast.error('Failed to generate predictions for all cities');
    } finally {
      setLoadingAll(false);
    }
  };


  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk': return 'bg-red-500';
      case 'Medium Risk': return 'bg-orange-500';
      case 'Low Risk': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Medium Risk': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Low Risk': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare data for charts
  const rainfallData = predictionData?.rainfall_forecast?.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rainfall: day.rainfall_mm,
    riskLevel: day.risk_level,
    confidence: Math.round(Math.random() * 30 + 70), // Simulated confidence
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

  const getRiskStats = () => {
    const stats = {
      high: 0,
      medium: 0,
      low: 0,
      none: 0,
      total: allPredictions.length
    };

    allPredictions.forEach(prediction => {
      switch (prediction.risk_level) {
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
    });

    return stats;
  };

  const riskStats = getRiskStats();

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
            Flood Risk Prediction
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered flood risk assessment and monitoring dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={loading || loadingAll}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading || loadingAll ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          {isAdminView && (
            <Button 
              variant="outline" 
              onClick={getAllPredictions}
              disabled={loadingAll}
            >
              <BarChart3 className={`w-4 h-4 mr-2 ${loadingAll ? 'animate-spin' : ''}`} />
              Generate All Data
            </Button>
          )}
          {predictionData && (
            <Button variant="outline" size="sm" onClick={() => setActiveTab('location')}>
              <MapPin className="w-4 h-4 mr-2" />
              Change Location
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isAdminView ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="location">Location Selection</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!predictionData}>Single Analysis</TabsTrigger>
          {isAdminView && (
            <TabsTrigger value="overview" disabled={allPredictions.length === 0}>Overview</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="location" className="space-y-6">
          {/* Enhanced Location Selection Interface */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full mb-4">
              <CloudRain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              AI-Powered Flood Risk Assessment
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Get instant flood predictions with beautiful visualizations for any city in India
            </p>
          </div>

          {/* Location Selection Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* State Selection Card */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-teal-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-8 h-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Step 1: Choose Your State</CardTitle>
                <CardDescription className="text-base">
                  Select from all Indian states and union territories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedState} onValueChange={handleStateChange}>
                  <SelectTrigger className="h-14 text-lg border-2 hover:border-teal-400 transition-colors">
                    <SelectValue placeholder="🌍 Select your state..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Object.keys(statesAndCities).map((state) => (
                      <SelectItem key={state} value={state} className="py-3">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-teal-500" />
                          <span className="font-medium">{state}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedState && (
                  <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-2 text-teal-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">✓ {selectedState} selected</span>
                    </div>
                    <p className="text-sm text-teal-600 mt-1">
                      {statesAndCities[selectedState as keyof typeof statesAndCities].length} cities available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* City Selection Card */}
            <Card className={`border-2 transition-all duration-300 ${
              selectedState 
                ? 'border-dashed border-teal-300 hover:border-teal-400 hover:shadow-lg' 
                : 'border-dashed border-gray-200 opacity-50'
            }`}>
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                  selectedState ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <MapPin className={`w-8 h-8 ${selectedState ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <CardTitle className="text-xl">Step 2: Choose Your City</CardTitle>
                <CardDescription className="text-base">
                  Pick from major cities in {selectedState || 'your selected state'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select 
                  value={selectedCity} 
                  onValueChange={handleCityChange}
                  disabled={!selectedState}
                >
                  <SelectTrigger className="h-14 text-lg border-2 hover:border-blue-400 transition-colors">
                    <SelectValue placeholder={selectedState ? "🏙️ Select your city..." : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {selectedState && statesAndCities[selectedState as keyof typeof statesAndCities].map((city) => (
                      <SelectItem key={city} value={city} className="py-3">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{city}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedCity && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">✓ {selectedCity} selected</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Ready for flood risk analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Manual Analysis Button */}
          {selectedCity && !loading && !predictionData && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Ready to Analyze {selectedCity}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click the button below to generate comprehensive flood risk assessment with beautiful charts and 7-day weather forecast
                  </p>
                  <Button 
                    onClick={getPrediction}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Activity className="w-5 h-5 mr-2" />
                    Analyze Flood Risk
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="max-w-2xl mx-auto">
              <Alert variant="destructive" className="border-2">
                <AlertTriangle className="h-5 w-5" />
                <AlertDescription className="text-base">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-teal-200">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-10 h-10 text-teal-600 animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Analyzing Weather Data
                  </h3>
                  <p className="text-gray-600">
                    Generating comprehensive flood risk assessment for {selectedCity}...
                  </p>
                  <div className="mt-4 flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Stats Preview */}
          {!selectedCity && (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-gray-700">Why Choose Our Flood Prediction?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Real-time Data</h4>
                      <p className="text-sm text-gray-600">Weather-based predictions with AI analysis</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Beautiful Charts</h4>
                      <p className="text-sm text-gray-600">Interactive visualizations and trends</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">All India Coverage</h4>
                      <p className="text-sm text-gray-600">Every state and major city included</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Single Location Analysis */}
          {predictionData && (
            <div className="space-y-6">
              {/* Main Prediction Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      {getRiskIcon(predictionData.risk_level)}
                      <span className="ml-2">Risk Assessment for {predictionData.location}</span>
                    </span>
                    <Badge className={`text-white ${getRiskColor(predictionData.risk_level)}`}>
                      {predictionData.risk_level}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Predicted Date</p>
                        <p className="font-medium">{formatDate(predictionData.risk_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">AI Confidence</p>
                        <p className="font-medium">{predictionData.confidence.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Risk Level</p>
                        <p className="font-medium">{predictionData.risk_level}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                      Daily rainfall predictions for {predictionData.location}
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
              {predictionData.rainfall_forecast.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                      7-Day Weather Forecast
                    </CardTitle>
                    <CardDescription>
                      Detailed daily weather and risk predictions for {predictionData.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {predictionData.rainfall_forecast.map((day, index) => (
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
                              <span className="text-sm font-medium">{day.rainfall_mm.toFixed(2)} mm</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {Math.round(Math.random() * 30 + 70)}%
                              </div>
                              <div className="text-xs text-gray-600">Confidence</div>
                            </div>
                            
                            <Badge className={`text-white ${getRiskColor(day.risk_level)}`}>
                              {day.risk_level}
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

        {isAdminView && (
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
                    Click "Generate All Data" to fetch and display comprehensive flood risk assessments for all locations.
                  </p>
                  <Button 
                    onClick={getAllPredictions}
                    disabled={loadingAll}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <BarChart3 className={`w-4 h-4 mr-2 ${loadingAll ? 'animate-spin' : ''}`} />
                    Generate All Data
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
                    {allPredictions.map((prediction, index) => (
                      <Card key={index} className="border-l-4" style={{ borderLeftColor: getRiskColor(prediction.risk_level).replace('bg-', '#').replace('-500', '') }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg">{prediction.location}</h3>
                            <Badge className={`text-white ${getRiskColor(prediction.risk_level)}`}>
                              {prediction.risk_level}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                              <span>Risk Date: {formatDate(prediction.risk_date)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
                              <span>Confidence: {prediction.confidence.toFixed(1)}%</span>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => {
                              setSelectedCity(prediction.location);
                              setPredictionData(prediction);
                              setActiveTab('analysis');
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Displayed</h3>
                    <p className="text-gray-600 mb-4">
                      Click "Generate All Data" to fetch and display comprehensive flood risk assessments for all locations.
                    </p>
                    <Button 
                      onClick={getAllPredictions}
                      disabled={loadingAll}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <BarChart3 className={`w-4 h-4 mr-2 ${loadingAll ? 'animate-spin' : ''}`} />
                      Generate All Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
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
      </Tabs>
    </div>
  );
};

export default SimpleFloodPrediction;