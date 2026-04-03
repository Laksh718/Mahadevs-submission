import streamlit as st
import pandas as pd
import joblib
import requests
import os
from dotenv import load_dotenv
import math
from datetime import datetime

# --- INITIAL SETUP & CONFIGURATION ---

# Page Configuration
st.set_page_config(
    page_title="JalRakshak Test App",
    page_icon="🌊",
    layout="wide"
)

# Load environment variables from the .env file
load_dotenv()

# Load the trained machine learning model
@st.cache_resource
def load_model():
    model_path = "models/flood_prediction_model_smote.pkl"
    try:
        model = joblib.load(model_path)
        return model
    except FileNotFoundError:
        return None

model = load_model()
WINDY_API_KEY = os.getenv("WINDY_API")

# --- DATA: LOCATIONS AND STATE MAPPINGS ---

# Dictionary mapping location names to their coordinates
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

# --- HELPER FUNCTIONS ---

@st.cache_data(ttl=3600) # Cache API calls for 1 hour
def get_windy_forecast(lat, lon):
    # ... (omitted for brevity, this function is the same as before)
    api_url = "https://api.windy.com/api/point-forecast/v2"
    payload = {
        "lat": lat, "lon": lon, "model": "gfs",
        "parameters": ["precip"], "levels": ["surface"], "key": WINDY_API_KEY
    }
    try:
        response = requests.post(api_url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        return None

def process_forecast_for_prediction(api_data):
    # ... (omitted for brevity, this function is the same as before)
    timestamps = pd.to_datetime(api_data['ts'], unit='ms')
    precip_data = api_data.get('past3hprecip-surface', [0] * len(timestamps))
    hourly_df = pd.DataFrame({'date': timestamps, 'precip_mm': precip_data}).set_index('date')
    daily_df = hourly_df.resample('D').sum()
    daily_df['rainfall_mm'] = daily_df['precip_mm']
    daily_df['rainfall_3_day_sum'] = daily_df['rainfall_mm'].rolling(window=3, min_periods=1).sum()
    daily_df['rainfall_7_day_sum'] = daily_df['rainfall_mm'].rolling(window=7, min_periods=1).sum()
    return daily_df[['rainfall_mm', 'rainfall_3_day_sum', 'rainfall_7_day_sum']].dropna()

def get_risk_level(probability):
    # ... (omitted for brevity, this function is the same as before)
    prob_percent = probability * 100
    if prob_percent >= 90: return "High Risk"
    elif prob_percent >= 70: return "Medium Risk"
    elif prob_percent >= 40: return "Low Risk"
    else: return "No Significant Risk"

# --- MAIN APPLICATION LOGIC ---

# Sidebar for regional analysis
st.sidebar.title("Regional Risk Analysis")
sidebar_status = st.sidebar.empty()
sidebar_results = st.sidebar.empty()

# Main panel
st.title("🌊 JalRakshak - Flood Risk Test App")
location_list = list(LOCATION_COORDS.keys())
selected_location = st.selectbox("Select a location to analyze:", location_list, index=0, key="main_location")
main_status = st.empty()
main_results = st.empty()

# This block runs the full analysis when a location is selected
if selected_location and selected_location != 'Select a location':
    if not WINDY_API_KEY:
        st.error("WINDY_API key not found. Please check your .env file.")
        st.stop()
    if model is None:
        st.error("Model file not found.")
        st.stop()
        
    main_status.info(f"Analyzing forecast for **{selected_location}**...")
    
    # Identify nearby locations (other districts in the same state)
    selected_state = LOCATION_COORDS[selected_location]['state']
    nearby_locations = [loc for loc, data in LOCATION_COORDS.items() if data['state'] == selected_state and loc != selected_location]
    
    locations_to_process = {selected_location: LOCATION_COORDS[selected_location]}
    for loc in nearby_locations:
        locations_to_process[loc] = LOCATION_COORDS[loc]
        
    all_results = []

    # Process each location
    progress_bar = main_status.progress(0)
    for i, (location, coords) in enumerate(locations_to_process.items()):
        sidebar_status.write(f"Analyzing: `{location}`...")
        forecast_data = get_windy_forecast(coords['lat'], coords['lon'])
        
        if forecast_data:
            features_df = process_forecast_for_prediction(forecast_data)
            today = pd.to_datetime(datetime.utcnow()).normalize()
            analysis_df = features_df[features_df.index > today].copy()
            
            if not analysis_df.empty:
                probabilities = model.predict_proba(analysis_df)[:, 1]
                analysis_df['confidence'] = probabilities
                
                risk_days = analysis_df[analysis_df['confidence'] >= 0.40] # Risk is Low, Medium or High
                if not risk_days.empty:
                    first_risk_day = risk_days.iloc[0]
                    all_results.append({
                        "Location": location,
                        "Risk Level": get_risk_level(first_risk_day['confidence']),
                        "Risk Date": first_risk_day.name.strftime('%Y-%m-%d'),
                        "Confidence": f"{first_risk_day['confidence']*100:.1f}%"
                    })
                else:
                    all_results.append({"Location": location, "Risk Level": "No Significant Risk", "Risk Date": "-", "Confidence": "-"})
            else:
                all_results.append({"Location": location, "Risk Level": "No Future Data", "Risk Date": "-", "Confidence": "-"})
        else:
            all_results.append({"Location": location, "Risk Level": "API Error", "Risk Date": "-", "Confidence": "-"})
        
        progress_bar.progress((i + 1) / len(locations_to_process))

    # Clear status messages
    main_status.empty()
    sidebar_status.success("Analysis complete.")
    
    # Display results
    results_df = pd.DataFrame(all_results)
    
    # --- Display Main Result ---
    main_result = results_df[results_df['Location'] == selected_location].iloc[0]
    risk_level = main_result['Risk Level']
    
    color_map = {"High Risk": "red", "Medium Risk": "orange", "Low Risk": "yellow", "No Significant Risk": "green"}
    color = color_map.get(risk_level, "grey")

    main_results.markdown(f"<h3><span style='color:{color};'>●</span> Current Risk for {selected_location}: **{risk_level}**</h3>", unsafe_allow_html=True)
    if risk_level != "No Significant Risk":
        col1, col2 = main_results.columns(2)
        col1.metric("Predicted On", main_result['Risk Date'])
        col2.metric("AI Confidence", main_result['Confidence'])

    # --- Display Sidebar Results ---
    def style_risk(df):
        def get_color(level):
            return f"background-color: {color_map.get(level, '')}"
        return df.style.applymap(get_color, subset=['Risk Level'])
    
    sidebar_results.dataframe(style_risk(results_df), use_container_width=True)