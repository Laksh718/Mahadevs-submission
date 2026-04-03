import React, { useState, useEffect } from 'react';
import './App.css';
import ForecastChart from './components/ForecastChart';
import { useGeolocation } from './hooks/useGeoLocation';
import { getCityFromCoordinates, getCoordinatesFromCity } from './services/locationService';

// --- CONFIGURATION ---
const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'https://janrakshak-pre-alert-model.onrender.com'}/predict`;

// --- TYPESCRIPT INTERFACES ---
interface PredictionSummary {
  'Risk Level': string;
  'Risk Date'?: string;
  'Confidence'?: string;
}

interface ForecastDetail {
  date: string;
  rainfall_mm: number;
  confidence: number;
  risk_level: string;
}

interface PredictionResponse {
  main_prediction: PredictionSummary | null;
  detailed_forecast: ForecastDetail[];
}

const colorMap: { [key: string]: string } = {
  "High Risk": "#ff4d4d",
  "Medium Risk": "#ffa500",
  "Low Risk": "#ffdd57",
  "No Significant Risk": "transparent",
};

const textColorMap: { [key: string]: string } = {
  "High Risk": "white",
  "Medium Risk": "white",
  "Low Risk": "black",
  "No Significant Risk": "black",
};

function App() {
  const [searchQuery, setSearchQuery] = useState('Chennai');
  const [mainResult, setMainResult] = useState<PredictionSummary | null>(null);
  const [detailedForecast, setDetailedForecast] = useState<ForecastDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Chennai');
  
  const geo = useGeolocation();

  const getPredictionByCoords = async (lat: number, lon: number, locationName: string) => {
    setLoading(true);
    setError('');
    setMainResult(null);
    setDetailedForecast([]);
    setCurrentLocation(locationName);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`API Error: ${errData.detail || response.statusText}`);
      }
      const data: PredictionResponse = await response.json();
      setMainResult(data.main_prediction || null);
      setDetailedForecast(data.detailed_forecast || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || loading) return;

    setLoading(true);
    setError('');
    setMainResult(null);
    setDetailedForecast([]);

    const coords = await getCoordinatesFromCity(searchQuery);
    if (coords) {
      await getPredictionByCoords(coords.lat, coords.lon, searchQuery);
    } else {
      setError(`Could not find coordinates for "${searchQuery}".`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (geo.isLoading) {
      setLoading(true);
      setError('Getting your location...');
      setMainResult(null);
      setDetailedForecast([]);
    }
    if (geo.error) {
      setError(`Geolocation Error: ${geo.error.message}`);
      setLoading(false);
    }
    if (geo.data) {
      getCityFromCoordinates(geo.data.latitude, geo.data.longitude).then(city => {
        getPredictionByCoords(geo.data!.latitude, geo.data!.longitude, city || 'your location');
      });
    }
  }, [geo.data, geo.error, geo.isLoading]);

  return (
    <div className="container">
      <header>
        <h1>🌊 JalRakshak - Flood Prediction</h1>
        <form className="controls" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter any city in India..."
          />
          <button type="submit" disabled={loading || !searchQuery}>
            {loading ? 'Analyzing...' : 'Search'}
          </button>
          <button type="button" onClick={geo.getLocation} disabled={loading}>
            {geo.isLoading ? '...' : 'Use My Location'}
          </button>
        </form>
      </header>
      
      {error && <div className="error-box">Error: {error}</div>}

      <div className="main-prediction-full-width">
          <h2>Risk for {currentLocation}</h2>
          {loading && <div className="loader"></div>}
          {mainResult && (
            <>
              <div className="card" style={{ borderColor: colorMap[mainResult['Risk Level']] || '#ccc' }}>
                <div className="risk-level" style={{ color: colorMap[mainResult['Risk Level']] || '#333' }}>
                  {mainResult['Risk Level']}
                </div>
                <div className="details">
                  <div><strong>Predicted Date:</strong> {mainResult['Risk Date']}</div>
                  <div><strong>Confidence:</strong> {mainResult['Confidence']}</div>
                </div>
              </div>
              {detailedForecast.length > 0 && (
                <details className="details-expander" open>
                  <summary>Show Detailed Forecast Analysis</summary>
                  <ForecastChart data={detailedForecast} />
                  <h3>Daily Prediction Breakdown</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Daily Rain (mm)</th>
                        <th>Risk Level</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedForecast.map(day => (
                        <tr key={day.date} style={{ backgroundColor: colorMap[day.risk_level] || 'transparent' }}>
                          <td>{day.date}</td>
                          <td>{day.rainfall_mm.toFixed(2)}</td>
                          <td style={{color: textColorMap[day.risk_level] || 'black'}}>{day.risk_level}</td>
                          <td>{(day.confidence * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              )}
            </>
          )}
        </div>
    </div>
  );
}

export default App;