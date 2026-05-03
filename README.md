# 🌊 Underwater Wave Prediction System

This project utilizes a CNN-LSTM deep learning model to predict underwater wave heights using meteorological data (Wind Speed, Pressure, and Temperature) from NOAA buoys.
<div align="center">

![Python](https://img.shields.io/badge/Python-3.10-blue?style=for-the-badge&logo=python)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?style=for-the-badge&logo=tensorflow)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=for-the-badge&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![R2 Score](https://img.shields.io/badge/R²%20Score-0.96-brightgreen?style=for-the-badge)

**A production-grade deep learning system that predicts underwater wave heights using a hybrid CNN-LSTM neural network, served via a REST API with a beautiful interactive dashboard.**

[Live Demo](#) · [API Docs](http://127.0.0.1:8000/docs) · [Report Bug](#) · [LinkedIn](https://linkedin.com/in/mohammed-shemeer-aiml)

</div>

![Dashboard Screenshot](assets/dashboard_screenshot.png)

---

## 📈 Graphical Representation 

| Actualvs Predicted | Model Learning Curve |
|-----------|-----------------|
| ![Dashboard](prediction_plot.png) | ![Result](learning_curve.png) |

---

## 🎯 What This Project Does

Most wave prediction tools require expensive hardware and complex setups. This system provides **real-time wave height predictions** through a simple web interface or REST API — useful for:

- 🚢 Ship navigation safety
- 🏄 Coastal activity planning  
- ⚡ Offshore energy operations
- 🔬 Oceanographic research

---

## 🧠 Model Architecture

```
Input (10 time steps × 4 features)
        ↓
   Conv1D (64 filters, kernel=2, ReLU)
        ↓
   MaxPooling1D (pool_size=2)
        ↓
   LSTM (50 units, tanh)
        ↓
   Dense (1 unit)
        ↓
Output: Predicted Wave Height (meters)
```

### Why CNN-LSTM?
- **CNN layers** capture local patterns across the time window
- **LSTM layers** capture long-term temporal dependencies
- Together they achieve **R² = 0.96** on test data

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| R² Score | **0.96** |
| RMSE | Low |
| MAE | Low |
| Training Data | NOAA NDBC Station 46059 (2018–2023) |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Deep Learning | TensorFlow / Keras |
| API Framework | FastAPI |
| Data Processing | NumPy, Pandas, Scikit-learn |
| Containerization | Docker |
| Frontend | HTML, CSS, JavaScript |
| Data Source | NOAA National Data Buoy Center |

---

## 📁 Project Structure

```
Wave_prediction/
├── app/
│   ├── main.py              # FastAPI endpoints
│   └── model.py             # Model loading & inference
├── models/
│   ├── wave_prediction_model.h5    # Trained CNN-LSTM model
│   ├── feature_scaler.pkl          # MinMaxScaler for features
│   └── target_scaler.pkl           # MinMaxScaler for target
├── data/
│   ├── raw/                 # Raw NOAA buoy data
│   └── processed/           # Preprocessed tensors
├── download_data.py         # NOAA data downloader
├── step2_dataset.py         # Dataset preparation
├── step3_preprocessing.py   # Feature engineering & scaling
├── wave_prediction.py       # Model training script
├── Dockerfile               # Container configuration
├── requirements.txt         # Dependencies
└── README.md
```

---

## 🚀 Quick Start

### Option 1 — Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/muhammedshemeer/Wave_prediction.git
cd Wave_prediction

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the API
python -m uvicorn app.main:app --reload

# 4. Open dashboard
# Visit http://127.0.0.1:8000
```

### Option 2 — Run with Docker

```bash
# 1. Build the image
docker build -t wave-prediction-app .

# 2. Run the container
docker run -p 8000:8000 wave-prediction-app

# 3. Open dashboard
# Visit http://127.0.0.1:8000
```

---

## 📡 API Reference

### GET `/`
Returns welcome message and dashboard UI.

### GET `/health`
```json
{ "status": "healthy", "model": "loaded" }
```

### POST `/predict`
Accepts 10 consecutive time steps of ocean sensor data.

**Request:**
```json
{
  "data": [
    [1.58, 6.1, 1014.1, 15.1],
    [1.58, 6.5, 1014.2, 15.1],
    [1.58, 6.7, 1014.3, 15.1],
    [1.58, 6.7, 1014.3, 15.1],
    [1.58, 6.8, 1014.4, 15.1],
    [1.56, 6.8, 1014.6, 15.1],
    [1.55, 6.9, 1014.6, 15.1],
    [1.53, 6.9, 1014.7, 15.1],
    [1.52, 7.0, 1014.8, 15.1],
    [1.51, 7.0, 1014.9, 15.1]
  ]
}
```
*Each row: [wave_height(m), wind_speed(m/s), pressure(hPa), temperature(°C)]*

**Response:**
```json
{
  "predicted_wave_height_meters": 1.51
}
```

---

## 📈 Input Features

| Feature | Unit | Description |
|---------|------|-------------|
| Wave Height | meters | Previous recorded significant wave height |
| Wind Speed | m/s | Wind speed over ocean surface |
| Air Pressure | hPa | Atmospheric pressure |
| Temperature | °C | Sea surface temperature |

> The model uses a **sliding window of 10 time steps** to capture temporal patterns before making a prediction.

---

## 🔄 How to Retrain

```bash
# Step 1: Download fresh NOAA data
python download_data.py

# Step 2: Build dataset
python step2_dataset.py

# Step 3: Preprocess & create sequences
python step3_preprocessing.py

# Step 4: Train model
python wave_prediction.py
```

---

## 🐳 Docker Details

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 👨‍💻 Author

**Mohammed Shemeer**  
B.Tech AI & ML | Dhanalakshmi Srinivasan University  
🔗 [LinkedIn](https://linkedin.com/in/mohammed-shemeer-aiml) · [GitHub](https://github.com/muhammedshemeer)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
⭐ Star this repo if you found it useful!
</div>
