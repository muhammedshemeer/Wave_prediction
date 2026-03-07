# 🌊 Underwater Wave Prediction (CNN-LSTM)

A robust Deep Learning pipeline that predicts underwater wave heights (`wave_height`) using historical oceanographic and meteorological buoy data from the NOAA National Data Buoy Center (NDBC).

The model leverages a hybrid **CNN-LSTM** architecture capable of capturing both local variations inside sliding time windows and long-term temporal dependencies across sequential weather data.

![Prediction Plot](prediction_plot.png)

## 📊 Features & Data
*   **Source:** NOAA NDBC Station `46059` historical data (2018–2023).
*   **Inputs:** Wind Speed (`WSPD`), Sea Level Pressure (`PRES`), Sea Surface Temperature (`WTMP`).
*   **Target:** Significant Wave Height (`WVHT`).
*   **Architecture:** `Conv1D` -> `MaxPooling1D` -> `LSTM` -> `Dense`.

## ⚙️ Installation & Setup
These instructions will help you run the project on your local machine.

### Prerequisites
*   Python 3.10+
*   Git

### 1. Clone the repository
```bash
git clone https://github.com/muhammedshemeer/Wave_prediction.git
cd Wave_prediction
```

### 2. Create a Virtual Environment (Recommended)
**Windows (PowerShell):**
```powershell
python -m venv venv
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\venv\Scripts\Activate
```
**Mac / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🚀 Running the Pipeline

The project is structured into four sequentially chained Python scripts. Run them in order:

### Step 1: Download the Data
Fetches compressed historical text data arrays direct from NOAA NDBC servers and extracts them sequentially into `data/raw/`.
```bash
python download_data.py
```

### Step 2: Clean and Parse the Text Data
Parses the tabular data using Pandas, handling custom Missing Values formats (`99.0`, `999.0`), structuring the datetime indices, and outputs a single clean DataFrame to `data/cleaned_data.csv`.
```bash
python step2_dataset.py
```

### Step 3: Sequence Preprocessing
Normalizes the features via `MinMaxScaler` and generates 3D sliding window tensors (`[samples, time_steps, features]`) using a `WINDOW_SIZE=10`.
```bash
python step3_preprocessing.py
```

### Step 4: Train and Evaluate the Hybrid Model
Compiles the CNN-LSTM and trains over 15 epochs. Outputs validation loss, RMSE, MAE, R² metrics to terminal, and generates `learning_curve.png` and `prediction_plot.png`.
```bash
python wave_prediction.py
```

## 📈 Model Performance
Based on evaluation against the unseen validation set sequence:
*   **RMSE:** `0.0531 m`
*   **MAE:** `0.0329 m`
*   **R² Score:** `0.9985`

## 🛠 Tech Stack
*   **TensorFlow / Keras:** Neural Network Modeling
*   **Pandas & NumPy:** Data Manipulation
*   **Scikit-Learn:** Preprocessing & Metrics
*   **Matplotlib:** Target Visualizations
