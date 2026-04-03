// Local Flood Prediction Model
// Based on the JanRakshak Pre-Alert Model logic

export interface WeatherData {
  temperature: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  precipitation: number;
  visibility: number;
  uv_index: number;
}

export interface LocationData {
  lat: number;
  lon: number;
  state: string;
  elevation?: number;
  river_proximity?: number;
}

export interface FloodPrediction {
  risk_level: 'No Significant Risk' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical';
  confidence: number;
  flood_probability: number;
  water_level_change: number;
  risk_factors: string[];
  recommendations: string[];
  forecast_days: number;
}

export interface DailyForecast {
  date: string;
  rainfall_mm: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  flood_probability: number;
  risk_level: string;
}

export class LocalFloodModel {
  private readonly RISK_THRESHOLDS = {
    precipitation: {
      low: 5,      // mm/day
      medium: 15,   // mm/day
      high: 30,     // mm/day
      critical: 50  // mm/day
    },
    humidity: {
      low: 60,      // %
      medium: 75,   // %
      high: 85,     // %
      critical: 95  // %
    },
    pressure: {
      low: 1000,    // hPa
      medium: 1010, // hPa
      high: 1020,  // hPa
      critical: 1030 // hPa
    }
  };

  private readonly LOCATION_FACTORS = {
    'Punjab': { flood_prone: 0.3, elevation_factor: 0.8 },
    'Haryana': { flood_prone: 0.4, elevation_factor: 0.7 },
    'Delhi': { flood_prone: 0.5, elevation_factor: 0.6 },
    'Rajasthan': { flood_prone: 0.2, elevation_factor: 0.9 },
    'Uttar Pradesh': { flood_prone: 0.6, elevation_factor: 0.5 },
    'Himachal Pradesh': { flood_prone: 0.4, elevation_factor: 0.8 },
    'Jammu and Kashmir': { flood_prone: 0.3, elevation_factor: 0.9 },
    'Maharashtra': { flood_prone: 0.5, elevation_factor: 0.6 },
    'Karnataka': { flood_prone: 0.4, elevation_factor: 0.7 },
    'Tamil Nadu': { flood_prone: 0.3, elevation_factor: 0.8 },
    'West Bengal': { flood_prone: 0.7, elevation_factor: 0.4 },
    'Telangana': { flood_prone: 0.4, elevation_factor: 0.7 },
    'Gujarat': { flood_prone: 0.3, elevation_factor: 0.8 }
  };

  predictFloodRisk(
    location: string,
    coordinates: LocationData,
    weatherData: WeatherData,
    forecastDays: number = 7
  ): { prediction: FloodPrediction; daily_forecast: DailyForecast[] } {
    
    console.log(`🌊 Local Flood Model: Predicting for ${location}`);
    console.log('📍 Location:', coordinates);
    console.log('🌤️ Weather:', weatherData);

    // Calculate base flood probability
    const baseProbability = this.calculateBaseFloodProbability(weatherData, coordinates);
    
    // Apply location-specific factors
    const locationFactor = this.LOCATION_FACTORS[coordinates.state] || { flood_prone: 0.4, elevation_factor: 0.7 };
    const adjustedProbability = baseProbability * locationFactor.flood_prone;
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(adjustedProbability, weatherData);
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(weatherData, coordinates);
    
    // Generate risk factors
    const riskFactors = this.identifyRiskFactors(weatherData, coordinates, adjustedProbability);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(riskLevel, riskFactors);
    
    // Generate daily forecast
    const dailyForecast = this.generateDailyForecast(weatherData, forecastDays, adjustedProbability);
    
    const prediction: FloodPrediction = {
      risk_level: riskLevel,
      confidence: confidence,
      flood_probability: Math.min(adjustedProbability * 100, 100),
      water_level_change: this.calculateWaterLevelChange(weatherData, adjustedProbability),
      risk_factors: riskFactors,
      recommendations: recommendations,
      forecast_days: forecastDays
    };

    return {
      prediction,
      daily_forecast: dailyForecast
    };
  }

  private calculateBaseFloodProbability(weather: WeatherData, location: LocationData): number {
    let probability = 0;
    
    // Precipitation factor (most important)
    if (weather.precipitation > this.RISK_THRESHOLDS.precipitation.critical) {
      probability += 0.4;
    } else if (weather.precipitation > this.RISK_THRESHOLDS.precipitation.high) {
      probability += 0.3;
    } else if (weather.precipitation > this.RISK_THRESHOLDS.precipitation.medium) {
      probability += 0.2;
    } else if (weather.precipitation > this.RISK_THRESHOLDS.precipitation.low) {
      probability += 0.1;
    }
    
    // Humidity factor
    if (weather.humidity > this.RISK_THRESHOLDS.humidity.critical) {
      probability += 0.2;
    } else if (weather.humidity > this.RISK_THRESHOLDS.humidity.high) {
      probability += 0.15;
    } else if (weather.humidity > this.RISK_THRESHOLDS.humidity.medium) {
      probability += 0.1;
    }
    
    // Pressure factor (low pressure = higher risk)
    if (weather.pressure < this.RISK_THRESHOLDS.pressure.low) {
      probability += 0.15;
    } else if (weather.pressure < this.RISK_THRESHOLDS.pressure.medium) {
      probability += 0.1;
    }
    
    // Wind speed factor
    if (weather.wind_speed > 20) {
      probability += 0.1;
    } else if (weather.wind_speed > 15) {
      probability += 0.05;
    }
    
    return Math.min(probability, 1.0);
  }

  private determineRiskLevel(probability: number, weather: WeatherData): FloodPrediction['risk_level'] {
    if (probability >= 0.7 || weather.precipitation >= 50) {
      return 'Critical';
    } else if (probability >= 0.5 || weather.precipitation >= 30) {
      return 'High Risk';
    } else if (probability >= 0.3 || weather.precipitation >= 15) {
      return 'Medium Risk';
    } else if (probability >= 0.1 || weather.precipitation >= 5) {
      return 'Low Risk';
    } else {
      return 'No Significant Risk';
    }
  }

  private calculateConfidence(weather: WeatherData, location: LocationData): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence with more data points
    if (weather.temperature && weather.humidity && weather.pressure) {
      confidence += 0.2;
    }
    if (weather.precipitation !== undefined) {
      confidence += 0.15;
    }
    if (weather.wind_speed && weather.visibility) {
      confidence += 0.1;
    }
    if (location.lat && location.lon) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 0.95);
  }

  private identifyRiskFactors(weather: WeatherData, location: LocationData, probability: number): string[] {
    const factors: string[] = [];
    
    if (weather.precipitation > 30) {
      factors.push('Heavy rainfall expected');
    } else if (weather.precipitation > 15) {
      factors.push('Moderate rainfall');
    }
    
    if (weather.humidity > 85) {
      factors.push('High humidity levels');
    }
    
    if (weather.pressure < 1000) {
      factors.push('Low atmospheric pressure');
    }
    
    if (weather.wind_speed > 20) {
      factors.push('Strong winds');
    }
    
    if (probability > 0.5) {
      factors.push('Historical flood-prone area');
    }
    
    if (location.state === 'West Bengal' || location.state === 'Uttar Pradesh') {
      factors.push('High-risk geographical location');
    }
    
    return factors;
  }

  private generateRecommendations(riskLevel: FloodPrediction['risk_level'], riskFactors: string[]): string[] {
    const recommendations: string[] = [];
    
    switch (riskLevel) {
      case 'Critical':
        recommendations.push('Evacuate immediately if in flood-prone areas');
        recommendations.push('Avoid all outdoor activities');
        recommendations.push('Keep emergency supplies ready');
        recommendations.push('Monitor official flood warnings');
        break;
      case 'High Risk':
        recommendations.push('Prepare for potential flooding');
        recommendations.push('Avoid unnecessary travel');
        recommendations.push('Secure important documents');
        recommendations.push('Stay updated with weather alerts');
        break;
      case 'Medium Risk':
        recommendations.push('Monitor weather conditions closely');
        recommendations.push('Avoid low-lying areas');
        recommendations.push('Keep emergency contacts ready');
        break;
      case 'Low Risk':
        recommendations.push('Stay alert to weather changes');
        recommendations.push('Keep basic emergency supplies');
        break;
      default:
        recommendations.push('Normal precautions recommended');
    }
    
    return recommendations;
  }

  private calculateWaterLevelChange(weather: WeatherData, probability: number): number {
    // Simulate water level change based on precipitation and probability
    const baseChange = weather.precipitation * 0.1; // 0.1m per mm of rain
    const probabilityMultiplier = 1 + (probability * 2); // Up to 3x multiplier
    return Math.round((baseChange * probabilityMultiplier) * 100) / 100; // Round to 2 decimal places
  }

  private generateDailyForecast(weather: WeatherData, days: number, baseProbability: number): DailyForecast[] {
    const forecast: DailyForecast[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Simulate forecast data with some variation
      const rainfallVariation = Math.random() * 0.5 + 0.75; // 0.75 to 1.25 multiplier
      const temperatureVariation = (Math.random() - 0.5) * 4; // ±2°C variation
      const humidityVariation = (Math.random() - 0.5) * 10; // ±5% variation
      
      const dailyRainfall = Math.max(0, weather.precipitation * rainfallVariation);
      const dailyTemperature = weather.temperature + temperatureVariation;
      const dailyHumidity = Math.max(0, Math.min(100, weather.humidity + humidityVariation));
      
      // Calculate daily flood probability
      const dailyProbability = baseProbability * (0.8 + Math.random() * 0.4); // 0.8 to 1.2 multiplier
      const dailyRiskLevel = this.determineRiskLevel(dailyProbability, { ...weather, precipitation: dailyRainfall });
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        rainfall_mm: Math.round(dailyRainfall * 100) / 100,
        temperature: Math.round(dailyTemperature * 10) / 10,
        humidity: Math.round(dailyHumidity),
        wind_speed: weather.wind_speed + (Math.random() - 0.5) * 4,
        pressure: weather.pressure + (Math.random() - 0.5) * 10,
        flood_probability: Math.round(dailyProbability * 100),
        risk_level: dailyRiskLevel
      });
    }
    
    return forecast;
  }
}

// Export singleton instance
export const localFloodModel = new LocalFloodModel();
export default localFloodModel;