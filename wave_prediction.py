import os
import numpy as np
import matplotlib.pyplot as plt
import pickle
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, LSTM, Dense
from tensorflow.keras.optimizers import Adam

PROCESSED_DATA_DIR = "data/processed"

def load_data():
    """Loads preprocessed 3D tensors and scalers."""
    print("Loading preprocessed data...")
    X_path = os.path.join(PROCESSED_DATA_DIR, 'X.npy')
    y_path = os.path.join(PROCESSED_DATA_DIR, 'y.npy')
    scaler_path = os.path.join(PROCESSED_DATA_DIR, 'target_scaler.pkl')
    
    if not (os.path.exists(X_path) and os.path.exists(y_path) and os.path.exists(scaler_path)):
        print(f"Error: Processed data not found in {PROCESSED_DATA_DIR}. Run step3_preprocessing.py first.")
        return None, None, None
        
    X = np.load(X_path)
    y = np.load(y_path)
    
    with open(scaler_path, 'rb') as f:
        target_scaler = pickle.load(f)
        
    return X, y, target_scaler

def build_model(input_shape):
    """
    Builds the CNN-LSTM hybrid architecture as specified:
    - Conv1D (64 filters, kernel size 2)
    - MaxPooling1D (pool size 2)
    - LSTM (50 units)
    - Dense (1 unit for output)
    """
    model = Sequential([
        Conv1D(filters=64, kernel_size=2, activation='relu', input_shape=input_shape),
        MaxPooling1D(pool_size=2),
        LSTM(50, activation='tanh'),
        Dense(1)
    ])
    
    optimizer = Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer, loss='mse')
    
    return model

def plot_learning_curve(history):
    """Generates the Learning Curve plot to monitor training vs validation loss."""
    plt.figure(figsize=(10, 6))
    plt.plot(history.history['loss'], label='Training Loss (MSE)')
    plt.plot(history.history['val_loss'], label='Validation Loss (MSE)')
    plt.title('Model Learning Curve')
    plt.xlabel('Epochs')
    plt.ylabel('Loss (MSE)')
    plt.legend()
    plt.grid(True)
    plt.savefig('learning_curve.png')
    print("Saved learning_curve.png")
    plt.close()

def plot_predictions(y_true, y_pred, num_samples=200):
    """Generates a plot comparing actual vs predicted wave heights for a subset of test data."""
    plt.figure(figsize=(12, 6))
    # Plot a subset so we can see the lines clearly
    plt.plot(y_true[:num_samples], label='Actual Wave Height', color='blue', alpha=0.7)
    plt.plot(y_pred[:num_samples], label='Predicted Wave Height', color='red', alpha=0.7)
    plt.title('Wave Height Prediction: Actual vs Predicted')
    plt.xlabel('Time Steps')
    plt.ylabel('Wave Height (m)')
    plt.legend()
    plt.grid(True)
    plt.savefig('prediction_plot.png')
    print("Saved prediction_plot.png")
    plt.close()

def main():
    # 1. Load data
    X, y, target_scaler = load_data()
    if X is None:
        return
        
    print(f"Loaded X with shape: {X.shape}")
    print(f"Loaded y with shape: {y.shape}")
    
    # 2. Train-test split (80/20)
    # Using simple split to maintain temporal ordering context in the sets
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    print(f"Training shapes - X: {X_train.shape}, y: {y_train.shape}")
    print(f"Testing shapes - X: {X_test.shape}, y: {y_test.shape}")
    
    # 3. Build model
    # input_shape is (time_steps, features)
    input_shape = (X_train.shape[1], X_train.shape[2]) 
    model = build_model(input_shape)
    model.summary()
    
    # 4. Train model
    print("Training model...")
    # Using 10 epochs as a default, adjust if necessary
    history = model.fit(
        X_train, y_train,
        epochs=15,
        batch_size=64,
        validation_split=0.1, 
        verbose=1
    )
    
    plot_learning_curve(history)
    
    # 5. Predictions & Evaluation
    print("Evaluating model...")
    y_pred_scaled = model.predict(X_test)
    
    # Inverse transform to get actual wave height values in meters
    # Reshape predictions and actuals to 2D for inverse_transform
    y_pred = target_scaler.inverse_transform(y_pred_scaled)
    y_test_actual = target_scaler.inverse_transform(y_test.reshape(-1, 1))
    
    # Calculate metrics
    rmse = np.sqrt(mean_squared_error(y_test_actual, y_pred))
    mae = mean_absolute_error(y_test_actual, y_pred)
    r2 = r2_score(y_test_actual, y_pred)
    
    print("-" * 30)
    print("Model Performance Metrics:")
    print(f"RMSE: {rmse:.4f} m")
    print(f"MAE:  {mae:.4f} m")
    print(f"R²:   {r2:.4f}")
    print("-" * 30)
    
    plot_predictions(y_test_actual, y_pred)
    
    # Optionally save the model
    model.save('wave_prediction_model.h5')
    print("Model saved to wave_prediction_model.h5")

if __name__ == "__main__":
    main()
