import requests
import json
import pandas as pd
import os
from dotenv import load_dotenv
import math

# --- Load Environment Variables ---
load_dotenv('../.env')

# --- Configuration ---
WINDY_API_KEY = os.getenv("WINDY_API") 
LATITUDE = 13.0827
LONGITUDE = 80.2707
API_URL = "https://api.windy.com/api/point-forecast/v2"

def get_weather_forecast(api_key, lat, lon):
    """
    Fetches a 10-day weather forecast from the Windy API for a given location.
    """
    print(f"Fetching weather forecast for Latitude: {lat}, Longitude: {lon}...")
    
    payload = {
        "lat": lat,
        "lon": lon,
        "model": "gfs",
        "parameters": ["temp", "rh", "pressure", "wind", "precip"],
        "levels": ["surface"],
        "key": api_key
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        
        data = response.json()
        print("Successfully received data from Windy API.")
        
        num_timestamps = len(data['ts'])
        
        # Combine U and V wind components into a single speed value
        wind_u = data.get('wind_u-surface', [0] * num_timestamps)
        wind_v = data.get('wind_v-surface', [0] * num_timestamps)
        wind_speed = [math.sqrt(u**2 + v**2) for u, v in zip(wind_u, wind_v)]

        # Convert temperature from Kelvin to Celsius
        temp_kelvin = data.get('temp-surface', [273.15] * num_timestamps)
        temp_celsius = [k - 273.15 for k in temp_kelvin]
        
        df = pd.DataFrame({
            'Timestamp': pd.to_datetime(data.get('ts'), unit='ms'),
            'Temperature (C)': temp_celsius,
            'Humidity (%)': data.get('rh-surface', [0] * num_timestamps),
            'Pressure (hPa)': data.get('pressure-surface', [0] * num_timestamps),
            'Precipitation (mm/3hr)': data.get('past3hprecip-surface', [0] * num_timestamps),
            'Wind Speed (m/s)': wind_speed,
        })
        
        return df

    except Exception as err:
        print(f"An unexpected error occurred: {err}")
        # For debugging, print the raw response if something goes wrong
        if 'response' in locals():
            print("--- RAW API RESPONSE ---")
            print(response.text)
            
    return None

if __name__ == '__main__':
    if WINDY_API_KEY is None:
        print("Error: WINDY_API key not found.")
    else:
        forecast_df = get_weather_forecast(WINDY_API_KEY, LATITUDE, LONGITUDE)
        
        if forecast_df is not None:
            print("\n--- Weather Forecast for Chennai ---")
            print(forecast_df.head(10).round(2)) # Round values for cleaner output