import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# --- Configuration ---
PROCESSED_DATA_FILE = '../processed_flood_data.csv'
MODEL_OUTPUT_FILE = '../models/flood_prediction_model.pkl'

# --- Model Training Logic ---

def train_model():
    """
    Loads processed data, trains a model, evaluates it, and saves it.
    """
    # 1. Load the processed data
    print("Loading processed data...")
    try:
        df = pd.read_csv(PROCESSED_DATA_FILE)
    except FileNotFoundError:
        print(f"Error: Processed data file not found at {PROCESSED_DATA_FILE}")
        return

    # 2. Prepare data for modeling
    print("Preparing data for modeling...")
    # Fill any potential missing values with 0
    df.fillna(0, inplace=True)
    
    # Define our features (X) and target (y)
    # We use the rainfall data and engineered features to predict 'is_flood'
    features = ['rainfall_mm', 'rainfall_3_day_sum', 'rainfall_7_day_sum']
    target = 'is_flood'
    
    X = df[features]
    y = df[target]

    # 3. Split data into training and testing sets
    # We'll use 80% for training and 20% for testing
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    # 'stratify=y' is important for imbalanced datasets. It ensures the train and 
    # test sets have the same proportion of flood/non-flood days.

    print(f"Training data shape: {X_train.shape}")
    print(f"Testing data shape: {X_test.shape}")

    # 4. Train the Random Forest Classifier
    print("Training the Random Forest model...")
    # `class_weight='balanced'` tells the model to pay more attention to the rare 'flood' class
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)

    # 5. Evaluate the model
    print("Evaluating the model...")
    predictions = model.predict(X_test)
    
    # Print a classification report, which gives us precision, recall, and f1-score
    # This is much more useful than simple accuracy for imbalanced data.
    report = classification_report(y_test, predictions)
    print("\n--- Classification Report ---")
    print(report)

    # 6. Save the trained model
    print(f"Saving the trained model to {MODEL_OUTPUT_FILE}...")
    joblib.dump(model, MODEL_OUTPUT_FILE)

    print("\nModel training complete! ✅")
    print(f"The model is saved and ready for real-time predictions.")

if __name__ == '__main__':
    train_model()