import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from imblearn.over_sampling import SMOTE  # Import SMOTE
import joblib

# --- Configuration ---
PROCESSED_DATA_FILE = '../processed_flood_data.csv'
MODEL_OUTPUT_FILE = '../models/flood_prediction_model_smote.pkl' # New model file

# --- Model Training Logic ---

def train_model_with_smote():
    """
    Loads data, applies SMOTE to balance it, trains, evaluates, and saves a model.
    """
    # 1. Load the processed data
    print("Loading processed data...")
    df = pd.read_csv(PROCESSED_DATA_FILE)
    df.fillna(0, inplace=True)

    # 2. Prepare data for modeling
    print("Preparing data for modeling...")
    features = ['rainfall_mm', 'rainfall_3_day_sum', 'rainfall_7_day_sum']
    target = 'is_flood'
    X = df[features]
    y = df[target]

    # 3. Split data into training and testing sets (as before)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # --- NEW STEP: APPLY SMOTE ---
    print("Applying SMOTE to balance the training data...")
    smote = SMOTE(random_state=42)
    # IMPORTANT: Only apply SMOTE to the training data, never the test data!
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

    print(f"Original training data shape: {X_train.shape}")
    print(f"Resampled training data shape: {X_train_resampled.shape}")
    print("Class distribution after SMOTE:")
    print(pd.Series(y_train_resampled).value_counts())
    # --- END OF NEW STEP ---

    # 4. Train the Random Forest Classifier on the RESAMPLED data
    print("\nTraining the Random Forest model on balanced data...")
    # We remove class_weight='balanced' because SMOTE has already done the balancing
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_resampled, y_train_resampled)

    # 5. Evaluate the model on the original, untouched test data
    print("Evaluating the model...")
    predictions = model.predict(X_test)
    
    report = classification_report(y_test, predictions)
    print("\n--- Classification Report (with SMOTE) ---")
    print(report)

    # 6. Save the new, better model
    print(f"Saving the trained model to {MODEL_OUTPUT_FILE}...")
    joblib.dump(model, MODEL_OUTPUT_FILE)

    print("\nModel training with SMOTE complete! ✅")

if __name__ == '__main__':
    train_model_with_smote()