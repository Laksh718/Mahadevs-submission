import os
import joblib
import pandas as pd
import requests
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
import time

# --- INITIAL SETUP ---
load_dotenv()
app = FastAPI(title="JalRakshak Flood Prediction API", version="1.0.0")

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with your specific Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOAD MODEL & CONFIG ---
try:
    model = joblib.load("models/flood_prediction_model_smote.pkl")
except FileNotFoundError:
    raise RuntimeError("Model file not found.")

WINDY_API_KEY = os.getenv("WINDY_API")
if not WINDY_API_KEY:
    raise RuntimeError("WINDY_API key not found in .env file.")

# --- DATA MODELS FOR REQUESTS ---
class PredictionRequest(BaseModel):
    lat: float
    lon: float

# --- HELPER FUNCTIONS ---
@lru_cache(maxsize=128)
def get_windy_forecast(lat: float, lon: float, timestamp: int):
    api_url = "https://api.windy.com/api/point-forecast/v2"
    payload = {
        "lat": lat, 
        "lon": lon, 
        "model": "gfs", 
        "parameters": ["precip"], 
        "levels": ["surface"], 
        "key": WINDY_API_KEY
    }
    response = requests.post(api_url, json=payload, timeout=10)
    response.raise_for_status()
    return response.json()

def get_risk_level(probability: float):
    prob_percent = probability * 100
    if prob_percent >= 90: return "High Risk"
    elif prob_percent >= 70: return "Medium Risk"
    elif prob_percent >= 40: return "Low Risk"
    else: return "No Significant Risk"

# --- NEW GEOCODING ENDPOINT (PROXY FOR NOMINATIM) ---
@app.get("/geocode")
def geocode_location(q: str = Query(..., description="Search query for location")):
    """
    Proxy endpoint for Nominatim geocoding to avoid CORS issues.
    Usage: /geocode?q=Kattankulathur,%20India
    """
    try:
        nominatim_url = "https://nominatim.openstreetmap.org/search"
        headers = {
            "User-Agent": "JalRakshak-FloodPrediction/1.0"  # Nominatim requires a User-Agent
        }
        params = {
            "q": q,
            "format": "json",
            "limit": 10
        }
        
        response = requests.get(nominatim_url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        return response.json()
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Geocoding API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

# --- REVERSE GEOCODING ENDPOINT ---
@app.get("/reverse-geocode")
def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    """
    Reverse geocoding: Get location name from coordinates.
    Usage: /reverse-geocode?lat=12.8231&lon=80.0447
    """
    try:
        nominatim_url = "https://nominatim.openstreetmap.org/reverse"
        headers = {
            "User-Agent": "JalRakshak-FloodPrediction/1.0"
        }
        params = {
            "lat": lat,
            "lon": lon,
            "format": "json"
        }
        
        response = requests.get(nominatim_url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        return response.json()
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Reverse geocoding error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

# --- FLOOD PREDICTION ENDPOINT ---
@app.post("/predict")
def predict_risk_by_coords(request: PredictionRequest):
    try:
        cache_timestamp = int(time.time() / 600)
        forecast_data = get_windy_forecast(lat=request.lat, lon=request.lon, timestamp=cache_timestamp)
        
        timestamps = pd.to_datetime(forecast_data['ts'], unit='ms')
        precip_data = forecast_data.get('past3hprecip-surface', [])
        
        if not precip_data:
            return {"main_prediction": {"Risk Level": "No Precip Data"}, "detailed_forecast": []}
        
        hourly_df = pd.DataFrame({'date': timestamps, 'precip_mm': precip_data}).set_index('date')
        daily_df = hourly_df.resample('D').sum()
        daily_df['rainfall_mm'] = daily_df['precip_mm']
        daily_df['rainfall_3_day_sum'] = daily_df['rainfall_mm'].rolling(window=3, min_periods=1).sum()
        daily_df['rainfall_7_day_sum'] = daily_df['rainfall_mm'].rolling(window=7, min_periods=1).sum()

        today = pd.to_datetime(datetime.utcnow()).normalize()
        analysis_df = daily_df[daily_df.index > today].copy()
        
        if analysis_df.empty:
            return {"main_prediction": {"Risk Level": "No Future Data"}, "detailed_forecast": []}

        feature_cols = ['rainfall_mm', 'rainfall_3_day_sum', 'rainfall_7_day_sum']
        probabilities = model.predict_proba(analysis_df[feature_cols])[:, 1]
        analysis_df['confidence'] = probabilities
        analysis_df['risk_level'] = analysis_df['confidence'].apply(get_risk_level)
        
        analysis_df.reset_index(inplace=True)
        analysis_df['date'] = analysis_df['date'].dt.strftime('%Y-%m-%d')
        cols_to_return = ['date', 'rainfall_mm', 'confidence', 'risk_level']
        detailed_forecast = analysis_df[cols_to_return].round(4).to_dict(orient='records')
        
        risk_days = analysis_df[analysis_df['risk_level'] != "No Significant Risk"]
        main_prediction = {}
        if not risk_days.empty:
            first_risk = risk_days.iloc[0]
            main_prediction = {
                "Risk Level": first_risk['risk_level'], 
                "Risk Date": first_risk['date'], 
                "Confidence": f"{first_risk['confidence']*100:.1f}%"
            }
        else:
            main_prediction = {
                "Risk Level": "No Significant Risk", 
                "Risk Date": "-", 
                "Confidence": "-"
            }
            
        return {"main_prediction": main_prediction, "detailed_forecast": detailed_forecast}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error from Windy API: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

# --- HEALTH CHECK ENDPOINT ---
@app.get("/")
def read_root():
    return {
        "message": "Welcome to the JalRakshak API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict",
            "geocode": "/geocode?q=location",
            "reverse_geocode": "/reverse-geocode?lat=xx&lon=yy"
        }
    }

# --- HEALTH CHECK FOR DEPLOYMENT ---
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}