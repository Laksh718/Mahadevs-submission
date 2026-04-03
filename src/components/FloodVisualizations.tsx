import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  Droplets, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  CloudRain,
  Wind,
  Thermometer,
  Gauge
} from 'lucide-react';
import { ForecastDetail, floodPredictionService } from '@/lib/floodPredictionService';

interface FloodVisualizationsProps {
  detailedForecast: ForecastDetail[];
  riskLevel: string;
  confidence: string;
  location: string;
}

const FloodVisualizations: React.FC<FloodVisualizationsProps> = ({
  detailedForecast,
  riskLevel,
  confidence,
  location
}) => {
  // Prepare data for charts
  const rainfallData = detailedForecast.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rainfall: day.rainfall_mm,
    riskLevel: day.risk_level,
    confidence: day.confidence * 100,
    riskScore: day.risk_level === 'High Risk' ? 4 : 
               day.risk_level === 'Medium Risk' ? 3 :
               day.risk_level === 'Low Risk' ? 2 : 1
  }));

  const riskDistribution = [
    { name: 'High Risk', value: detailedForecast.filter(d => d.risk_level === 'High Risk').length, color: '#ef4444' },
    { name: 'Medium Risk', value: detailedForecast.filter(d => d.risk_level === 'Medium Risk').length, color: '#f97316' },
    { name: 'Low Risk', value: detailedForecast.filter(d => d.risk_level === 'Low Risk').length, color: '#eab308' },
    { name: 'Safe', value: detailedForecast.filter(d => d.risk_level === 'No Significant Risk').length, color: '#22c55e' }
  ];

  const cumulativeRainfall = rainfallData.reduce((acc, day, index) => {
    acc.push({
      date: day.date,
      cumulative: acc.length > 0 ? acc[acc.length - 1].cumulative + day.rainfall : day.rainfall,
      daily: day.rainfall
    });
    return acc;
  }, [] as any[]);

  const riskTrend = rainfallData.map((day, index) => ({
    date: day.date,
    riskScore: day.riskScore,
    confidence: day.confidence
  }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High Risk': return '#ef4444';
      case 'Medium Risk': return '#f97316';
      case 'Low Risk': return '#eab308';
      default: return '#22c55e';
    }
  };

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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Rainfall</p>
                <p className="text-2xl font-bold text-blue-800">
                  {rainfallData.reduce((sum, day) => sum + day.rainfall, 0).toFixed(1)}mm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Peak Risk</p>
                <p className="text-lg font-bold text-orange-800">{riskLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Avg Confidence</p>
                <p className="text-2xl font-bold text-green-800">
                  {(rainfallData.reduce((sum, day) => sum + day.confidence, 0) / rainfallData.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <CloudRain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Risk Days</p>
                <p className="text-2xl font-bold text-purple-800">
                  {rainfallData.filter(day => day.riskScore > 1).length}/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-blue-600" />
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
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
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
                  stroke="#3b82f6"
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
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
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
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
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

        {/* Risk Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="w-5 h-5 mr-2 text-purple-600" />
              Risk Trend Analysis
            </CardTitle>
            <CardDescription>
              Risk score and confidence over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="risk"
                  orientation="left"
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="confidence"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: 'Confidence (%)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="risk"
                  type="monotone"
                  dataKey="riskScore"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  yAxisId="confidence"
                  type="monotone"
                  dataKey="confidence"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Detailed Risk Analysis for {location}
          </CardTitle>
          <CardDescription>
            Comprehensive flood risk assessment with visual indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Risk Level Indicator */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getRiskColor(riskLevel) }}
                ></div>
                <span className="font-medium">Current Risk Level</span>
              </div>
              <Badge 
                className="text-white px-3 py-1"
                style={{ 
                  backgroundColor: getRiskColor(riskLevel),
                  color: 'white'
                }}
              >
                {riskLevel}
              </Badge>
            </div>

            {/* Risk Timeline */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">7-Day Risk Timeline</h4>
              <div className="grid grid-cols-7 gap-2">
                {rainfallData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className="w-full h-8 rounded mb-1 flex items-center justify-center text-xs font-medium"
                      style={{ 
                        backgroundColor: getRiskColor(day.riskLevel),
                        color: day.riskLevel === 'Low Risk' ? 'black' : 'white'
                      }}
                    >
                      {day.riskScore}
                    </div>
                    <p className="text-xs text-gray-600">{day.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Wind className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Wind Conditions</p>
                  <p className="text-lg font-bold text-blue-800">Moderate</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Thermometer className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Temperature</p>
                  <p className="text-lg font-bold text-green-800">24°C</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <CloudRain className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Humidity</p>
                  <p className="text-lg font-bold text-purple-800">78%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloodVisualizations;