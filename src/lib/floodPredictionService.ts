// Enhanced Flood Prediction Service for JanRakshak Pre-Alert Model
// Integrates with the deployed Python API backend and Windy weather data

export interface PredictionSummary {
  Location?: string;
  "Risk Level": string;
  "Risk Date"?: string;
  Confidence?: string;
  "Water Level"?: string;
  "Rainfall Forecast"?: string;
}

export interface ForecastDetail {
  date: string;
  rainfall_mm: number;
  confidence: number;
  risk_level: string;
}

export interface PredictionResponse {
  main_prediction: PredictionSummary | null;
  regional_analysis?: PredictionSummary[];
  detailed_forecast: ForecastDetail[];
}

// Location coordinates supported by the JanRakshak Pre-Alert Model
export const LOCATION_COORDS = {
  Chennai: { lat: 13.08, lon: 80.27, state: "Tamil Nadu" },
  Hyderabad: { lat: 17.38, lon: 78.48, state: "Telangana" },
  Kolhapur: { lat: 16.7, lon: 74.24, state: "Maharashtra" },
  Sangli: { lat: 16.85, lon: 74.58, state: "Maharashtra" },
  Satara: { lat: 17.68, lon: 74.0, state: "Maharashtra" },
  Wayanad: { lat: 11.68, lon: 76.13, state: "Kerala" },
  Idukki: { lat: 9.85, lon: 76.97, state: "Kerala" },
  Ludhiana: { lat: 30.9, lon: 75.85, state: "Punjab" },
  Firozpur: { lat: 30.92, lon: 74.6, state: "Punjab" },
  Kolkata: { lat: 22.57, lon: 88.36, state: "West Bengal" },
};

// Risk level color mapping
export const RISK_COLORS = {
  "High Risk": "#ef4444", // red-500
  "Medium Risk": "#f97316", // orange-500
  "Low Risk": "#eab308", // yellow-500
  "No Significant Risk": "#22c55e", // green-500
  Critical: "#dc2626", // red-600
  Warning: "#f59e0b", // amber-500
  Safe: "#10b981", // emerald-500
};

export const RISK_TEXT_COLORS = {
  "High Risk": "white",
  "Medium Risk": "white",
  "Low Risk": "black",
  "No Significant Risk": "white",
  Critical: "white",
  Warning: "white",
  Safe: "white",
};

export class FloodPredictionService {
  private apiBaseUrl: string;
  private windyApiKey: string;
  private cache: Map<string, { data: PredictionResponse; timestamp: number }> =
    new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private apiHealthChecked = false;
  private isApiHealthy = false;

  constructor() {
    this.apiBaseUrl =
      import.meta.env.VITE_BACKEND_URL ||
      "https://janrakshak-pre-alert-model.onrender.com";
    this.windyApiKey =
      import.meta.env.WINDY_API || "g2m3HcyH0yVSaf54Naep9RPvE88hJXQl";
  }

  // Check if API is available
  private async checkApiHealth(): Promise<boolean> {
    if (this.apiHealthChecked) {
      return this.isApiHealthy;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 3000);

      const response = await fetch(`${this.apiBaseUrl}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.isApiHealthy = response.ok;
      this.apiHealthChecked = true;
      return this.isApiHealthy;
    } catch (error) {
      this.isApiHealthy = false;
      this.apiHealthChecked = true;
      return false;
    }
  }

  // Get cached data if available
  private getCachedData(key: string): PredictionResponse | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // Cache data
  private setCachedData(key: string, data: PredictionResponse): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Predict flood risk for a specific location
  async predictRegionalRisk(location: string): Promise<PredictionResponse> {
    try {
      // Check cache first
      const cacheKey = `regional_${location}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Get location coordinates
      const coords = this.getLocationCoords(location);
      if (!coords) {
        throw new Error(`Location ${location} not found in our database`);
      }

      // API handles weather data internally
      const apiUrl = `${this.apiBaseUrl}/predict`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000);

      const requestBody = {
        lat: coords.lat,
        lon: coords.lon,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const apiData = await response.json();

        // Return the API data as-is (no enhancement needed)
        const enhancedData: PredictionResponse = {
          ...apiData,
        };

        // Cache the result
        this.setCachedData(cacheKey, enhancedData);
        return enhancedData;
      } else {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `JanRakshak API returned ${response.status}: ${response.statusText} - ${errorText}`
        );
      }
    } catch (error) {
      throw error;
    }
  }

  // Predict flood risk by coordinates
  async predictRiskByCoords(
    lat: number,
    lon: number
  ): Promise<PredictionResponse> {
    try {
      const cacheKey = `coords_${lat.toFixed(4)}_${lon.toFixed(4)}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // API handles weather data internally
      const apiUrl = `${this.apiBaseUrl}/predict`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000);

      const requestBody = {
        lat: lat,
        lon: lon,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const apiData = await response.json();

        // Return the API data as-is (no enhancement needed)
        const enhancedData: PredictionResponse = {
          ...apiData,
        };

        // Cache the result
        this.setCachedData(cacheKey, enhancedData);
        return enhancedData;
      } else {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `JanRakshak API returned ${response.status}: ${response.statusText} - ${errorText}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            `Request timeout for coordinates ${lat}, ${lon}. Please try again.`
          );
        } else if (error.message.includes("Failed to fetch")) {
          throw new Error(
            `Network error for coordinates ${lat}, ${lon}. Please check your connection.`
          );
        }
      }

      throw error;
    }
  }

  // Get supported locations
  getSupportedLocations(): string[] {
    return Object.keys(LOCATION_COORDS);
  }

  // Get location coordinates
  getLocationCoords(
    location: string
  ): { lat: number; lon: number; state: string } | null {
    return LOCATION_COORDS[location as keyof typeof LOCATION_COORDS] || null;
  }

  // Get risk level color
  getRiskColor(riskLevel: string): string {
    return RISK_COLORS[riskLevel as keyof typeof RISK_COLORS] || "#6b7280";
  }

  // Get risk level text color
  getRiskTextColor(riskLevel: string): string {
    return (
      RISK_TEXT_COLORS[riskLevel as keyof typeof RISK_TEXT_COLORS] || "black"
    );
  }

  // Get locations by state
  getLocationsByState(state: string): string[] {
    return Object.entries(LOCATION_COORDS)
      .filter(([_, coords]) => coords.state === state)
      .map(([location, _]) => location);
  }

  // Get all states
  getStates(): string[] {
    const states = new Set(
      Object.values(LOCATION_COORDS).map((coords) => coords.state)
    );
    return Array.from(states).sort();
  }

  // Clear cache for refresh functionality
  clearCache(): void {
    this.cache.clear();
    this.apiHealthChecked = false;
    this.isApiHealthy = false;
  }

  // Get API status
  async getApiStatus(): Promise<{
    healthy: boolean;
    url: string;
    lastChecked: string;
  }> {
    const healthy = await this.checkApiHealth();
    return {
      healthy,
      url: this.apiBaseUrl,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const floodPredictionService = new FloodPredictionService();
export default floodPredictionService;
