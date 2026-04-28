from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator
from typing import List
import os
from app.model import wave_predictor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="WaveCast Production API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get path to static directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

class PredictionRequest(BaseModel):
    data: List[List[float]]

    @field_validator('data')
    @classmethod
    def validate_data_shape(cls, v):
        if len(v) != 10:
            raise ValueError('Data must contain exactly 10 time steps.')
        for step in v:
            if len(step) != 4:
                raise ValueError('Each time step must contain exactly 4 features.')
        return v

@app.get("/")
async def root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/health")
async def health():
    """Health check returns model status without crashing."""
    status = "ready" if wave_predictor.is_ready else "loading/error"
    return {"status": "online", "model_state": status}

@app.post("/predict")
async def predict(request: PredictionRequest):
    try:
        # Prediction triggers the lazy load if needed
        prediction = wave_predictor.predict(request.data)
        return {"predicted_wave_height_meters": round(prediction, 2)}
    except Exception as e:
        # Return 503 Service Unavailable if the model isn't ready
        raise HTTPException(status_code=503, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
