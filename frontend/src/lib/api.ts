export const getApiBase = (): string => {
  return localStorage.getItem("wavecast_api_base") || "http://localhost:8000";
};

export const setApiBase = (base: string) => {
  localStorage.setItem("wavecast_api_base", base);
};

export interface PredictionData {
  data: number[][]; // 10x4 matrix
}

export const checkHealth = async (base: string): Promise<boolean> => {
  try {
    const res = await fetch(`${base}/health`);
    return res.ok;
  } catch (e) {
    return false;
  }
};

export const predictWaveHeight = async (base: string, payload: PredictionData): Promise<number> => {
  const res = await fetch(`${base}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Prediction failed");
  }

  const data = await res.json();
  
  // extractPrediction tolerates {prediction}, {wave_height}, {result}, or array.
  if (typeof data.prediction === "number") return data.prediction;
  if (typeof data.wave_height === "number") return data.wave_height;
  if (typeof data.result === "number") return data.result;
  if (Array.isArray(data) && typeof data[0] === "number") return data[0];
  if (typeof data === "number") return data;

  throw new Error("Unexpected response format");
};
