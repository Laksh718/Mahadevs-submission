# JalRakshak: A Flood Early Warning System 🌊

JalRakshak is a machine learning project aimed at predicting flood susceptibility in various regions across India. It uses historical meteorological data from the India Meteorological Department (IMD) and a curated list of past flood events to train a model that can identify high-risk rainfall patterns.

---

## Features

-   **Data Processing:** Ingests and processes gridded NetCDF (`.nc`) rainfall data from IMD.
-   **Feature Engineering:** Creates time-based features like 3-day and 7-day cumulative rainfall to capture storm duration and intensity.
-   **Imbalanced Data Handling:** Uses the SMOTE (Synthetic Minority Over-sampling TEchnique) to effectively train a model on the rare flood events.
-   **Model Training:** Trains a Random Forest Classifier to predict the likelihood of a flood.
-   **Modular Scripts:** Separates data processing and model training into clean, easy-to-understand Python scripts.

---

## Project Structure
pre-alert-model/
│
├── imd_data/
│   ├── RF25_ind2018_rfp25.nc
│   └── ... (and other .nc files)
│
├── models/
│   └── flood_prediction_model_smote.pkl
│
├── scripts/
│   ├── 1_data_processing.py
│   ├── 2_model_training.py
│   └── 3_model_training_smote.py
│
├── venv/
│
├── .gitignore
├── flood_dates.csv
├── processed_flood_data.csv
└── README.md


---

## Setup and Installation

1.  **Clone the repository (or set up your folder):**
    ```bash
    git clone <your-repo-url>
    cd pre-alert-model
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the required packages:**
    ```bash
    pip install -r requirements.txt
    ```

---

## Data Collection

1.  **IMD Rainfall Data:** Download the high-resolution daily gridded rainfall data (`.nc` files) from the [IMD Pune Data Portal](https://www.imdpune.gov.in/lrfindex.php). Place all the downloaded `.nc` files inside the `imd_data/` folder.

2.  **Flood Event Data:** Create a `flood_dates.csv` file in the root directory. This file must contain a list of historical flood events with the following columns: `date,location,state`.

---

## How to Run

Execute the scripts from the `scripts/` directory in the following order:

1.  **Process the Raw Data:** This script reads the `.nc` and `.csv` files, processes them, and creates a clean dataset.
    ```bash
    python 1_data_processing.py
    ```

2.  **Train the Model:** This script takes the processed data, balances it using SMOTE, and trains the Random Forest model.
    ```bash
    python 3_model_training_smote.py
    ```
The final, trained model will be saved in the `models/` directory.

---

## Future Work

-   Integrate the [Windy API](https://api.windy.com/) to fetch real-time forecast data (humidity, pressure, wind speed) for live predictions.
-   Incorporate hydrological data (river discharge levels) from the [India-WRIS](https://indiawris.gov.in/wris/#/waterData) portal to dramatically improve model precision.
-   Deploy the trained model using a web framework (like Flask or FastAPI) to serve predictions via an API or a simple web interface.

