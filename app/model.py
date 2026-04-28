import os
import pickle
import numpy as np
import tensorflow as tf
import logging

# Minimize TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_USE_LEGACY_KERAS'] = '1'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WavePredictionModel:
    def __init__(self):
        self.model = None
        self.feature_scaler = None
        self.target_scaler = None
        self.is_ready = False

    def load(self):
        """Lazy load the model and scalers to prevent startup crashes."""
        if self.is_ready:
            return True
            
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, 'models', 'wave_prediction_model.h5')
            f_scaler_path = os.path.join(base_dir, 'models', 'feature_scaler.pkl')
            t_scaler_path = os.path.join(base_dir, 'models', 'target_scaler.pkl')

            # Verification check for Git LFS pointers
            if os.path.exists(model_path) and os.path.getsize(model_path) < 1000:
                logger.error("Model file is an LFS pointer, not a binary.")
                return False

            logger.info("Loading TensorFlow model (Lazy Load)...")
            # Force Keras 2 engine via tf.keras with legacy flag
            self.model = tf.keras.models.load_model(model_path, compile=False)
            
            with open(f_scaler_path, 'rb') as f:
                self.feature_scaler = pickle.load(f)
            with open(t_scaler_path, 'rb') as f:
                self.target_scaler = pickle.load(f)
                
            self.is_ready = True
            logger.info("Model loaded successfully!")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            return False

    def predict(self, input_data):
        if not self.is_ready:
            if not self.load():
                raise RuntimeError("Model is not loaded and failed to initialize.")
        
        data = np.array(input_data)
        scaled_data = self.feature_scaler.transform(data)
        reshaped_data = scaled_data.reshape(1, 10, 4)
        
        prediction_scaled = self.model.predict(reshaped_data, verbose=0)
        prediction = self.target_scaler.inverse_transform(prediction_scaled)
        
        return float(prediction[0][0])

# Global instance (Doesn't load yet)
wave_predictor = WavePredictionModel()
