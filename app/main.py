from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator
from typing import List
import os
import asyncio
from app.model import wave_predictor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="WaveCast Instant-Start API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to trigger background loading
@app.on_event("startup")
async def startup_event():
    # Start the background task without waiting (non-blocking)
    asyncio.create_task(wave_predictor.load_background())

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
        return v

@app.get("/")
async def root():
    # This will respond INSTANTLY, passing the Railway health check
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/health")
async def health():
    return {
        "status": "online", 
        "model_loaded": wave_predictor.is_ready
    }

@app.post("/predict")
async def predict(request: PredictionRequest):
    if not wave_predictor.is_ready:
        raise HTTPException(status_code=503, detail="Model is still warming up in the background. Please try again in 10-20 seconds.")
    
    try:
        prediction = wave_predictor.predict(request.data)
        return {"predicted_wave_height_meters": round(prediction, 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Important: Always bind to 0.0.0.0 and use $PORT for cloud deployment
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
