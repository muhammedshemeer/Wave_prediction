import os
import numpy as np
import pickle
from sklearn.metrics import r2_score
import tensorflow as tf

# Paths
PROCESSED_DATA_DIR = "data/processed"
MODEL_PATH = "models/wave_prediction_model.h5"
SCALER_PATH = os.path.join(PROCESSED_DATA_DIR, 'target_scaler.pkl')

def verify_r2():
    print("Starting R² Verification...")
    
    # 1. Load data
    X = np.load(os.path.join(PROCESSED_DATA_DIR, 'X.npy'))
    y = np.load(os.path.join(PROCESSED_DATA_DIR, 'y.npy'))
    
    with open(SCALER_PATH, 'rb') as f:
        target_scaler = pickle.load(f)
        
    # 2. Split (matches wave_prediction.py logic)
    split_idx = int(len(X) * 0.8)
    X_test = X[split_idx:]
    y_test = y[split_idx:]
    
    # 3. Load model
    print("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    
    # 4. Predict
    print("Running predictions on test set...")
    y_pred_scaled = model.predict(X_test, verbose=0)
    
    # 5. Inverse transform
    y_pred = target_scaler.inverse_transform(y_pred_scaled)
    y_test_actual = target_scaler.inverse_transform(y_test.reshape(-1, 1))
    
    # 6. Calculate R2
    r2 = r2_score(y_test_actual, y_pred)
    
    print("-" * 30)
    print(f"VERIFICATION RESULT:")
    print(f"Calculated R² Score: {r2:.4f}")
    print("-" * 30)
    
    if round(r2, 2) == 0.96:
        print("Verification Successful! The model achieves R² = 0.96.")
    else:
        print(f"Note: Current R² is {r2:.4f}, which rounds to {round(r2, 2)}.")

if __name__ == "__main__":
    verify_r2()
