import os
import pickle
import numpy as np
import tensorflow as tf
import logging
import asyncio

# Minimize TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WavePredictionModel:
    def __init__(self):
        self.model = None
        self.feature_scaler = None
        self.target_scaler = None
        self.is_ready = False

    async def load_background(self):
        """Load the model in a separate thread so it doesn't block the API."""
        try:
            logger.info("Starting background model load (TF 2.12.0 mode)...")
            await asyncio.to_thread(self._sync_load)
            self.is_ready = True
            logger.info("✅ Model loaded successfully on native Keras 2 engine!")
            return True
        except Exception as e:
            logger.error(f"❌ Background load failed: {str(e)}")
            return False

    def _sync_load(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, 'models', 'wave_prediction_model.h5')
        f_scaler_path = os.path.join(base_dir, 'models', 'feature_scaler.pkl')
        t_scaler_path = os.path.join(base_dir, 'models', 'target_scaler.pkl')

        if os.path.exists(model_path) and os.path.getsize(model_path) < 1000:
            raise OSError("Model file is an LFS pointer, not a binary.")

        # In TF 2.12, this uses the original Keras 2 engine
        self.model = tf.keras.models.load_model(model_path, compile=False)
        
        with open(f_scaler_path, 'rb') as f:
            self.feature_scaler = pickle.load(f)
        with open(t_scaler_path, 'rb') as f:
            self.target_scaler = pickle.load(f)

    def predict(self, input_data):
        if not self.is_ready:
            raise RuntimeError("Model is still loading. Please wait.")
        
        data = np.array(input_data)
        scaled_data = self.feature_scaler.transform(data)
        reshaped_data = scaled_data.reshape(1, 10, 4)
        
        prediction_scaled = self.model.predict(reshaped_data, verbose=0)
        prediction = self.target_scaler.inverse_transform(prediction_scaled)
        
        return float(prediction[0][0])

wave_predictor = WavePredictionModel()
