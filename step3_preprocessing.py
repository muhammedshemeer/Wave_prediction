import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import pickle

CLEAN_DATA_PATH = "data/cleaned_data.csv"
PROCESSED_DATA_DIR = "data/processed"
WINDOW_SIZE = 10

def create_sequences(data, target_col_idx, window_size):
    """
    Transforms the 2D tabular data into 3D sequences for CNN-LSTM.
    Input format: [samples, features]
    Output format: X = [samples, window_size, features], y = [samples, 1]
    """
    X = []
    y = []
    
    for i in range(len(data) - window_size):
        # The sequence of historical values
        X.append(data[i:(i + window_size), :])
        # The target value to predict (the wave_height at the NEXT time step)
        y.append(data[i + window_size, target_col_idx])
        
    return np.array(X), np.array(y)

def preprocess_data(window_size=WINDOW_SIZE):
    """
    Loads cleaned data, applies scaling, and structures it into 3D tensors.
    """
    print(f"Loading data from {CLEAN_DATA_PATH}...")
    if not os.path.exists(CLEAN_DATA_PATH):
        print(f"Error: {CLEAN_DATA_PATH} does not exist. Run step2_dataset.py first.")
        return
        
    df = pd.read_csv(CLEAN_DATA_PATH, index_col='datetime', parse_dates=True)
    df.sort_index(inplace=True)
    
    # Ensure columns order is consistent and wave_height is identifiable
    # Let's put wave_height first to easily locate its index
    cols = list(df.columns)
    cols.remove('wave_height')
    cols = ['wave_height'] + cols
    df = df[cols]
    
    target_idx = 0 # wave_height is at index 0
    
    print(f"Dataset columns: {df.columns.tolist()}")
    
    # Scale the data using MinMaxScaler (scales values between 0 and 1)
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(df)
    
    # We will need the scaler later to inverse transform the predictions (target column specifically).
    # Create a target scaler that only fits the wave_height so we can inverse_transform it easily later.
    target_scaler = MinMaxScaler()
    target_scaler.fit(df[['wave_height']])
    
    print(f"Creating sequences with window size {window_size}...")
    X, y = create_sequences(scaled_data, target_idx, window_size)
    
    print(f"X shape: {X.shape}") # [samples, time_steps, features]
    print(f"y shape: {y.shape}") # [samples]
    
    # Save the processed data
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    
    np.save(os.path.join(PROCESSED_DATA_DIR, 'X.npy'), X)
    np.save(os.path.join(PROCESSED_DATA_DIR, 'y.npy'), y)
    
    # Save scalers
    with open(os.path.join(PROCESSED_DATA_DIR, 'feature_scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
    with open(os.path.join(PROCESSED_DATA_DIR, 'target_scaler.pkl'), 'wb') as f:
        pickle.dump(target_scaler, f)
        
    print(f"Data preprocessed and saved to {PROCESSED_DATA_DIR}")

if __name__ == "__main__":
    preprocess_data()
