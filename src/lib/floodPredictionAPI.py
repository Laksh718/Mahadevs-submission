import os
import joblib
import pandas as pd
import requests
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- INITIAL SETUP ---
load_dotenv()
app = FastAPI(title="JanRakshak Flood Prediction API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
class RegionalRequest(BaseModel):
    location: str

class CoordsRequest(BaseModel):
    lat: float
    lon: float

# --- HELPER FUNCTIONS ---
def get_windy_forecast(lat, lon):
    api_url = "https://api.windy.com/api/point-forecast/v2"
    payload = {"lat": lat, "lon": lon, "model": "gfs", "parameters": ["precip"], "levels": ["surface"], "key": WINDY_API_KEY}
    response = requests.post(api_url, json=payload)
    response.raise_for_status()
    return response.json()

def get_risk_level(probability: float):
    prob_percent = probability * 100
    if prob_percent >= 90: return "High Risk"
    elif prob_percent >= 70: return "Medium Risk"
    elif prob_percent >= 40: return "Low Risk"
    else: return "No Significant Risk"

def process_and_predict(forecast_data):
    timestamps = pd.to_datetime(forecast_data['ts'], unit='ms')
    precip_data = forecast_data.get('past3hprecip-surface', [])
    
    if not precip_data: return None, []

    hourly_df = pd.DataFrame({'date': timestamps, 'precip_mm': precip_data}).set_index('date')
    daily_df = hourly_df.resample('D').sum()
    daily_df['rainfall_mm'] = daily_df['precip_mm']
    daily_df['rainfall_3_day_sum'] = daily_df['rainfall_mm'].rolling(window=3, min_periods=1).sum()
    daily_df['rainfall_7_day_sum'] = daily_df['rainfall_mm'].rolling(window=7, min_periods=1).sum()

    today = pd.to_datetime(datetime.utcnow()).normalize()
    analysis_df = daily_df[daily_df.index > today].copy()
    
    if analysis_df.empty: return None, []

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
        main_prediction = {"Risk Level": first_risk['risk_level'], "Risk Date": first_risk['date'], "Confidence": f"{first_risk['confidence']*100:.1f}%"}
    else:
        main_prediction = {"Risk Level": "No Significant Risk", "Risk Date": "-", "Confidence": "-"}
        
    return main_prediction, detailed_forecast

# --- API ENDPOINTS ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the JanRakshak API"}

LOCATION_COORDS = {
    'Chennai': {'lat': 13.08, 'lon': 80.27, 'state': 'Tamil Nadu'},
    'Hyderabad': {'lat': 17.38, 'lon': 78.48, 'state': 'Telangana'},
    'Kolhapur': {'lat': 16.70, 'lon': 74.24, 'state': 'Maharashtra'},
    'Sangli': {'lat': 16.85, 'lon': 74.58, 'state': 'Maharashtra'},
    'Satara': {'lat': 17.68, 'lon': 74.00, 'state': 'Maharashtra'},
    'Wayanad': {'lat': 11.68, 'lon': 76.13, 'state': 'Kerala'},
    'Idukki': {'lat': 9.85, 'lon': 76.97, 'state': 'Kerala'},
    'Ludhiana': {'lat': 30.90, 'lon': 75.85, 'state': 'Punjab'},
    'Firozpur': {'lat': 30.92, 'lon': 74.60, 'state': 'Punjab'},
    'Kolkata': {'lat': 22.57, 'lon': 88.36, 'state': 'West Bengal'},
}

@app.post("/predict_regional")
def predict_regional_risk(request: RegionalRequest):
    selected_location = request.location
    if selected_location not in LOCATION_COORDS:
        raise HTTPException(status_code=404, detail=f"Location '{selected_location}' not supported.")

    selected_state = LOCATION_COORDS[selected_location]['state']
    locations_to_process = {loc: data for loc, data in LOCATION_COORDS.items() if data['state'] == selected_state}
    
    all_results = []
    detailed_forecast_for_main_location = []

    for location, coords in locations_to_process.items():
        try:
            forecast_data = get_windy_forecast(coords['lat'], coords['lon'])
            main_pred, detailed_forecast = process_and_predict(forecast_data)
            
            summary = {"Location": location, **main_pred} if main_pred else {"Location": location, "Risk Level": "Error"}
            all_results.append(summary)
            
            if location == selected_location:
                detailed_forecast_for_main_location = detailed_forecast
        except Exception:
            all_results.append({"Location": location, "Risk Level": "API/Processing Error", "Risk Date": "-", "Confidence": "-"})
            
    main_result = next((res for res in all_results if res["Location"] == selected_location), None)
    regional_results = [res for res in all_results if res["Location"] != selected_location]
    
    return {
        "main_prediction": main_result, 
        "regional_analysis": regional_results,
        "detailed_forecast": detailed_forecast_for_main_location
    }

@app.post("/predict_by_coords")
def predict_risk_by_coords(request: CoordsRequest):
    try:
        forecast_data = get_windy_forecast(request.lat, request.lon)
        main_prediction, detailed_forecast = process_and_predict(forecast_data)
        
        if main_prediction is None:
             return {"main_prediction": {"Risk Level": "No Future Data"}, "detailed_forecast": []}

        return {"main_prediction": main_prediction, "detailed_forecast": detailed_forecast}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error from Windy API: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")