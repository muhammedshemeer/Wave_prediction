import os
import pickle
import numpy as np
import tf_keras as keras

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

class WavePredictionModel:
    def __init__(self, model_path, feature_scaler_path, target_scaler_path):
        # Using tf_keras directly to guarantee Keras 2 engine
        self.model = keras.models.load_model(model_path, compile=False)
        
        with open(feature_scaler_path, 'rb') as f:
            self.feature_scaler = pickle.load(f)
            
        with open(target_scaler_path, 'rb') as f:
            self.target_scaler = pickle.load(f)

    def predict(self, input_data):
        """
        input_data: list of 10 time steps, each [wind_speed, pressure, temperature]
        """
        # Convert to numpy array
        data = np.array(input_data)
        
        # Scale the input features
        # Note: Scaler expects 2D array for fit/transform, but our input is (10, 3)
        # We transform all 10 steps at once
        scaled_data = self.feature_scaler.transform(data)
        
        # Reshape for CNN-LSTM: (samples, time_steps, features)
        # Here samples=1, time_steps=10, features=4
        reshaped_data = scaled_data.reshape(1, 10, 4)
        
        # Predict
        prediction_scaled = self.model.predict(reshaped_data, verbose=0)
        
        # Inverse transform the prediction
        # Target scaler was fit on wave_height only (1D)
        prediction = self.target_scaler.inverse_transform(prediction_scaled)
        
        return float(prediction[0][0])

# Initialize the model instance
# Paths relative to the root of the project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'wave_prediction_model.h5')
FEATURE_SCALER_PATH = os.path.join(BASE_DIR, 'models', 'feature_scaler.pkl')
TARGET_SCALER_PATH = os.path.join(BASE_DIR, 'models', 'target_scaler.pkl')

wave_model = WavePredictionModel(MODEL_PATH, FEATURE_SCALER_PATH, TARGET_SCALER_PATH)
