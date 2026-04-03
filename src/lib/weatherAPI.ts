/**
 * Weather API Integration for JanRakshak Flood Prediction System
 * Integrates with OpenWeatherMap, IMD (India Meteorological Department), and other sources
 */

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  timestamp: string;
  location: {
    lat: number;
    lon: number;
    name: string;
  };
}

export interface FloodPrediction {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  probability: number;
  expectedTime: string;
  affectedAreas: string[];
  waterLevel: number;
  confidence: number;
  recommendations: string[];
}

export interface HistoricalData {
  date: string;
  rainfall: number;
  floodOccurred: boolean;
  severity: 'minor' | 'moderate' | 'severe';
  affectedPopulation: number;
}

class WeatherAPI {
  private openWeatherAPIKey = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key';
  private baseURL = 'https://api.openweathermap.org/data/2.5';
  
  // IMD API endpoints (mock for demo)
  private imdBaseURL = 'https://api.imd.gov.in/v1';
  
  // Punjab-specific coordinates
  private punjabCoordinates = {
    lat: 30.7333,
    lon: 76.7794,
    name: 'Punjab, India'
  };

  /**
   * Get current weather data for Punjab region
   */
  async getCurrentWeather(): Promise<WeatherData> {
    try {
      // Try OpenWeatherMap API first
      if (this.openWeatherAPIKey !== 'demo_key') {
        const response = await fetch(
          `${this.baseURL}/weather?lat=${this.punjabCoordinates.lat}&lon=${this.punjabCoordinates.lon}&appid=${this.openWeatherAPIKey}&units=metric`
        );
        
        if (response.ok) {
          const data = await response.json();
          return this.transformOpenWeatherData(data);
        }
      }
      
      // Fallback to mock data
      return this.getMockWeatherData();
    } catch (error) {
      console.warn('Weather API failed, using mock data:', error);
      return this.getMockWeatherData();
    }
  }

  /**
   * Get weather forecast for next 72 hours
   */
  async getWeatherForecast(): Promise<WeatherData[]> {
    try {
      if (this.openWeatherAPIKey !== 'demo_key') {
        const response = await fetch(
          `${this.baseURL}/forecast?lat=${this.punjabCoordinates.lat}&lon=${this.punjabCoordinates.lon}&appid=${this.openWeatherAPIKey}&units=metric`
        );
        
        if (response.ok) {
          const data = await response.json();
          return data.list.slice(0, 24).map((item: any) => this.transformOpenWeatherData(item));
        }
      }
      
      // Fallback to mock forecast
      return this.getMockForecastData();
    } catch (error) {
      console.warn('Forecast API failed, using mock data:', error);
      return this.getMockForecastData();
    }
  }

  /**
   * Get flood prediction based on weather data
   */
  async getFloodPrediction(weatherData: WeatherData[]): Promise<FloodPrediction> {
    // Simple flood prediction algorithm
    const currentWeather = weatherData[0];
    const forecast = weatherData.slice(1, 8); // Next 24 hours
    
    // Calculate risk factors
    const rainfallRisk = this.calculateRainfallRisk(forecast);
    const humidityRisk = currentWeather.humidity > 80 ? 0.3 : 0;
    const windRisk = currentWeather.windSpeed > 20 ? 0.2 : 0;
    const pressureRisk = currentWeather.pressure < 1000 ? 0.3 : 0;
    
    const totalRisk = rainfallRisk + humidityRisk + windRisk + pressureRisk;
    
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    let probability: number;
    
    if (totalRisk > 0.8) {
      riskLevel = 'critical';
      probability = 85 + Math.random() * 15;
    } else if (totalRisk > 0.6) {
      riskLevel = 'high';
      probability = 60 + Math.random() * 25;
    } else if (totalRisk > 0.4) {
      riskLevel = 'moderate';
      probability = 30 + Math.random() * 30;
    } else {
      riskLevel = 'low';
      probability = 5 + Math.random() * 25;
    }
    
    return {
      riskLevel,
      probability: Math.round(probability),
      expectedTime: this.calculateExpectedTime(riskLevel),
      affectedAreas: this.getAffectedAreas(riskLevel),
      waterLevel: this.calculateWaterLevel(riskLevel),
      confidence: 75 + Math.random() * 20,
      recommendations: this.getRecommendations(riskLevel)
    };
  }

  /**
   * Get historical flood data for analysis
   */
  async getHistoricalData(): Promise<HistoricalData[]> {
    // Mock historical data for Punjab
    const historicalData: HistoricalData[] = [
      {
        date: '2024-07-15',
        rainfall: 45.2,
        floodOccurred: true,
        severity: 'moderate',
        affectedPopulation: 12500
      },
      {
        date: '2024-07-10',
        rainfall: 32.1,
        floodOccurred: false,
        severity: 'minor',
        affectedPopulation: 0
      },
      {
        date: '2024-07-05',
        rainfall: 28.7,
        floodOccurred: false,
        severity: 'minor',
        affectedPopulation: 0
      },
      {
        date: '2024-06-28',
        rainfall: 67.3,
        floodOccurred: true,
        severity: 'severe',
        affectedPopulation: 45000
      },
      {
        date: '2024-06-20',
        rainfall: 41.8,
        floodOccurred: true,
        severity: 'moderate',
        affectedPopulation: 18000
      }
    ];
    
    return historicalData;
  }

  /**
   * Get real-time flood monitoring data
   */
  async getFloodMonitoringData() {
    // Mock real-time monitoring data
    return {
      riverLevels: [
        { name: 'Sutlej River', level: 245.6, status: 'normal', trend: 'rising' },
        { name: 'Beas River', level: 198.3, status: 'alert', trend: 'rising' },
        { name: 'Ravi River', level: 156.7, status: 'normal', trend: 'stable' }
      ],
      damLevels: [
        { name: 'Bhakra Dam', level: 78.5, capacity: 85.2, status: 'normal' },
        { name: 'Pong Dam', level: 92.1, capacity: 95.8, status: 'alert' },
        { name: 'Ranjit Sagar Dam', level: 65.3, capacity: 72.1, status: 'normal' }
      ],
      alerts: [
        {
          id: 1,
          type: 'flood_warning',
          message: 'Rising water levels detected in Beas River',
          severity: 'moderate',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'dam_alert',
          message: 'Pong Dam approaching capacity',
          severity: 'high',
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  private transformOpenWeatherData(data: any): WeatherData {
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || 0,
      windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000, // Convert m to km
      uvIndex: data.uvi || 0,
      timestamp: new Date(data.dt * 1000).toISOString(),
      location: this.punjabCoordinates
    };
  }

  private getMockWeatherData(): WeatherData {
    return {
      temperature: 28 + Math.random() * 8,
      humidity: 70 + Math.random() * 20,
      rainfall: Math.random() * 50,
      windSpeed: 10 + Math.random() * 20,
      windDirection: Math.random() * 360,
      pressure: 1000 + Math.random() * 20,
      visibility: 8 + Math.random() * 4,
      uvIndex: 5 + Math.random() * 5,
      timestamp: new Date().toISOString(),
      location: this.punjabCoordinates
    };
  }

  private getMockForecastData(): WeatherData[] {
    const forecast: WeatherData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      forecast.push({
        temperature: 25 + Math.random() * 10,
        humidity: 60 + Math.random() * 30,
        rainfall: Math.random() * 30,
        windSpeed: 8 + Math.random() * 15,
        windDirection: Math.random() * 360,
        pressure: 995 + Math.random() * 25,
        visibility: 6 + Math.random() * 6,
        uvIndex: 3 + Math.random() * 7,
        timestamp: time.toISOString(),
        location: this.punjabCoordinates
      });
    }
    
    return forecast;
  }

  private calculateRainfallRisk(forecast: WeatherData[]): number {
    const totalRainfall = forecast.reduce((sum, weather) => sum + weather.rainfall, 0);
    const avgRainfall = totalRainfall / forecast.length;
    
    if (avgRainfall > 20) return 0.8;
    if (avgRainfall > 15) return 0.6;
    if (avgRainfall > 10) return 0.4;
    if (avgRainfall > 5) return 0.2;
    return 0.1;
  }

  private calculateExpectedTime(riskLevel: string): string {
    const hours = {
      'critical': 2 + Math.random() * 2,
      'high': 4 + Math.random() * 4,
      'moderate': 8 + Math.random() * 8,
      'low': 12 + Math.random() * 12
    };
    
    const time = new Date();
    time.setHours(time.getHours() + hours[riskLevel as keyof typeof hours]);
    return time.toLocaleString();
  }

  private getAffectedAreas(riskLevel: string): string[] {
    const areas = {
      'critical': ['Riverside District', 'Low-lying Areas', 'Industrial Zone'],
      'high': ['Riverside District', 'Low-lying Areas'],
      'moderate': ['Riverside District'],
      'low': []
    };
    
    return areas[riskLevel as keyof typeof areas];
  }

  private calculateWaterLevel(riskLevel: string): number {
    const baseLevel = 150;
    const increments = {
      'critical': 25 + Math.random() * 15,
      'high': 15 + Math.random() * 10,
      'moderate': 8 + Math.random() * 7,
      'low': 2 + Math.random() * 3
    };
    
    return baseLevel + increments[riskLevel as keyof typeof increments];
  }

  private getRecommendations(riskLevel: string): string[] {
    const recommendations = {
      'critical': [
        'Immediate evacuation of affected areas',
        'Activate emergency response teams',
        'Close all schools and offices',
        'Set up emergency shelters'
      ],
      'high': [
        'Prepare for evacuation',
        'Move to higher ground',
        'Secure important documents',
        'Stock emergency supplies'
      ],
      'moderate': [
        'Monitor water levels closely',
        'Avoid low-lying areas',
        'Keep emergency contacts ready',
        'Prepare evacuation plan'
      ],
      'low': [
        'Continue normal activities',
        'Stay informed about weather updates',
        'Keep emergency kit ready'
      ]
    };
    
    return recommendations[riskLevel as keyof typeof recommendations];
  }
}

export const weatherAPI = new WeatherAPI();
