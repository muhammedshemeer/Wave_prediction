export type FeatureRow = [number, number, number, number]; // [waveHeight, windSpeed, pressure, temperature]

export interface PredictRequest {
  data: FeatureRow[]; // shape (10, 4)
}

export interface PredictResponse {
  prediction?: number;
  wave_height?: number;
  value?: number;
  [k: string]: unknown;
}

const API_KEY = "wavecast.api_base_url";

export const getApiBase = () => localStorage.getItem(API_KEY) ?? "https://alert-emotion-production-ffa4.up.railway.app";
export const setApiBase = (url: string) => localStorage.setItem(API_KEY, url.replace(/\/+$/, ""));

const join = (base: string, path: string) => `${base.replace(/\/+$/, "")}${path}`;

export async function checkHealth(base: string): Promise<{ ok: boolean; detail?: unknown }> {
  try {
    const res = await fetch(join(base, "/health"), { method: "GET" });
    if (!res.ok) return { ok: false, detail: res.statusText };
    const json = await res.json().catch(() => ({}));
    return { ok: true, detail: json };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

export async function predict(base: string, payload: PredictRequest): Promise<PredictResponse> {
  const res = await fetch(join(base, "/predict"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as PredictResponse;
}

export function extractPrediction(res: PredictResponse): number | null {
  const candidates = [
    res.prediction, 
    res.wave_height, 
    res.value, 
    (res as any).predicted_wave_height_meters,
    (res as any).result, 
    (res as any).output
  ];
  for (const c of candidates) {
    if (typeof c === "number") return c;
    if (Array.isArray(c) && typeof c[0] === "number") return c[0] as number;
  }
  return null;
}
