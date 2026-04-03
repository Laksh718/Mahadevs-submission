import pandas as pd
import xarray as xr
import numpy as np
import os

# --- Configuration ---
IMD_DATA_DIR = '../imd_data/'
FLOOD_DATES_FILE = '../flood_dates.csv'
OUTPUT_CSV_FILE = '../processed_flood_data.csv'

# --- Main Processing Logic ---

def process_data():
    """
    Main function to load, process, and combine rainfall and flood data.
    """
    # 1. Load the flood dates CSV file
    print("Loading flood dates...")
    try:
        flood_df = pd.read_csv(FLOOD_DATES_FILE, comment='#')
        flood_df['date'] = pd.to_datetime(flood_df['date'], format='%Y-%m-%d')
    except FileNotFoundError:
        print(f"Error: Flood dates file not found at {FLOOD_DATES_FILE}")
        return

    # Create a simple lookup for locations and their dates
    flood_events = flood_df.groupby('location')['date'].apply(list).to_dict()
    
    # Get lat/lon for each unique location
    location_coords = {
        'Idukki': {'lat': 9.85, 'lon': 76.97},
        'Wayanad': {'lat': 11.68, 'lon': 76.13},
        'Pathanamthitta': {'lat': 9.26, 'lon': 76.78},
        'Ernakulam': {'lat': 9.98, 'lon': 76.28},
        'Thrissur': {'lat': 10.52, 'lon': 76.21},
        'Alappuzha': {'lat': 9.50, 'lon': 76.33},
        'Kolhapur': {'lat': 16.70, 'lon': 74.24},
        'Sangli': {'lat': 16.85, 'lon': 74.58},
        'Belagavi': {'lat': 15.85, 'lon': 74.50},
        'Kodagu': {'lat': 12.42, 'lon': 75.73},
        'Goalpara': {'lat': 26.17, 'lon': 90.62},
        'Barpeta': {'lat': 26.32, 'lon': 91.00},
        'Morigaon': {'lat': 26.25, 'lon': 92.33},
        'Hyderabad': {'lat': 17.38, 'lon': 78.48},
        'Chamoli': {'lat': 30.40, 'lon': 79.56},
        'Raigad': {'lat': 18.52, 'lon': 73.18},
        'Chiplun': {'lat': 17.53, 'lon': 73.51},
        'Satara': {'lat': 17.68, 'lon': 74.00},
        'Silchar': {'lat': 24.82, 'lon': 92.79},
        'Hojai': {'lat': 26.00, 'lon': 92.85},
        'Nalbari': {'lat': 26.45, 'lon': 91.43},
        'Balrampur': {'lat': 27.43, 'lon': 82.18},
        'Kullu': {'lat': 31.96, 'lon': 77.11},
        'Mandi': {'lat': 31.71, 'lon': 76.92},
        'Delhi': {'lat': 28.70, 'lon': 77.10},
        'Chandigarh': {'lat': 30.73, 'lon': 76.77},
        'Chennai': {'lat': 13.08, 'lon': 80.27},
        'Thoothukudi': {'lat': 8.76, 'lon': 78.13},
        'Tirunelveli': {'lat': 8.71, 'lon': 77.75}
    }

    all_location_data = []

    # 2. Loop through all .nc files
    print("Processing IMD rainfall files...")
    for filename in sorted(os.listdir(IMD_DATA_DIR)):
        if filename.endswith('.nc'):
            filepath = os.path.join(IMD_DATA_DIR, filename)
            print(f"  - Reading {filename}...")
            
            ds = xr.open_dataset(filepath)
            
            # --- THIS SECTION IS CHANGED FOR ROBUSTNESS ---
            # Check which naming convention is used in the file
            if 'RAINFALL' in ds.variables:
                rain_var, lat_var, lon_var, time_var = 'RAINFALL', 'LATITUDE', 'LONGITUDE', 'TIME'
            elif 'rf' in ds.variables:
                rain_var, lat_var, lon_var, time_var = 'rf', 'lat', 'lon', 'time'
            else:
                print(f"    - WARNING: Could not find rainfall variable in {filename}. Skipping file.")
                ds.close()
                continue
            # --- END OF CHANGE ---

            for location, coords in location_coords.items():
                rainfall_data = ds[rain_var].sel(
                    {lat_var: coords['lat'], lon_var: coords['lon']}, 
                    method='nearest'
                )
                
                df = rainfall_data.to_dataframe().reset_index()
                df = df.rename(columns={time_var: 'date', rain_var: 'rainfall_mm'})
                df['location'] = location
                
                all_location_data.append(df)
            
            ds.close()

    # 3. Combine all data
    print("Combining all data...")
    if not all_location_data:
        print("Error: No data was processed. Check your IMD_DATA_DIR path.")
        return
        
    final_df = pd.concat(all_location_data, ignore_index=True)

    # 4. Engineer features
    print("Engineering features...")
    final_df = final_df.sort_values(by=['location', 'date']).reset_index(drop=True)
    
    final_df['rainfall_3_day_sum'] = final_df.groupby('location')['rainfall_mm'].transform(
        lambda x: x.rolling(window=3, min_periods=1).sum()
    )
    final_df['rainfall_7_day_sum'] = final_df.groupby('location')['rainfall_mm'].transform(
        lambda x: x.rolling(window=7, min_periods=1).sum()
    )

    # 5. Create the target label
    print("Creating flood labels...")
    flood_date_location_set = set()
    for loc, dates in flood_events.items():
        for d in dates:
            flood_date_location_set.add((pd.to_datetime(d), loc))
            
    final_df['is_flood'] = final_df.apply(
        lambda row: 1 if (row['date'], row['location']) in flood_date_location_set else 0,
        axis=1
    )
    
    # 6. Save the final processed data
    print(f"Saving processed data to {OUTPUT_CSV_FILE}...")
    final_df.to_csv(OUTPUT_CSV_FILE, index=False)
    
    print("\nProcessing Complete! ✅")
    print("\n--- Data Head ---")
    print(final_df.head())
    print("\n--- Data Tail ---")
    print(final_df.tail())
    print("\n--- Flood Event Counts ---")
    print(final_df['is_flood'].value_counts())

if __name__ == '__main__':
    process_data()