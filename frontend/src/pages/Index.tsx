import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Waves, Zap, AlertCircle, Loader2, Wand2, ChevronDown, Wind, Gauge, Droplets } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import SettingsDialog from "../components/wavecast/SettingsDialog";
import TimeSeriesGrid, { sampleMatrix } from "../components/wavecast/TimeSeriesGrid";
import WaveOrb from "../components/wavecast/WaveOrb";
import { checkHealth, extractPrediction, getApiBase, predict, type FeatureRow } from "../components/wavecast/api";
import { toast } from "sonner";

const OceanScene = lazy(() => import("../components/wavecast/OceanScene"));

const Index = () => {
  const [apiBase, setApiBase] = useState(getApiBase());
  const [health, setHealth] = useState<"unknown" | "ok" | "down">("unknown");
  const [matrix, setMatrix] = useState<FeatureRow[]>(sampleMatrix());
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const analyzeRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiBase) return setHealth("unknown");
    checkHealth(apiBase).then((r) => setHealth(r.ok ? "ok" : "down"));
  }, [apiBase]);

  const amplitude = useMemo(() => {
    if (prediction == null) return 0.6;
    return Math.min(1.6, 0.4 + prediction * 0.25);
  }, [prediction]);

  const onPredict = async () => {
    if (!apiBase) {
      toast.error("Set your API URL first (top right → API).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await predict(apiBase, { data: matrix });
      const v = extractPrediction(res);
      if (v == null) throw new Error("Could not parse prediction from response.");
      setPrediction(v);
      toast.success(`Forecast ready: ${v.toFixed(3)} m`);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
    } catch (e) {
      setError((e as Error).message);
      toast.error("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      {/* 3D background */}
      <div className="fixed inset-0 -z-10">
        <Suspense fallback={<div className="absolute inset-0 bg-[var(--gradient-sky)]" />}>
          <OceanScene amplitude={amplitude} />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background/80 pointer-events-none" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl glass grid place-items-center glow-ring">
            <Waves className="size-5 text-primary" />
          </div>
          <div>
            <div className="font-display font-semibold tracking-tight">WaveCast</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">CNN-LSTM Ocean Forecast</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="glass border-border/40 gap-1.5">
            <span className={`size-1.5 rounded-full ${health === "ok" ? "bg-accent animate-pulse" : health === "down" ? "bg-destructive" : "bg-muted-foreground"}`} />
            {health === "ok" ? "API online" : health === "down" ? "API offline" : "API not set"}
          </Badge>
          <SettingsDialog onChange={setApiBase} />
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 min-h-[calc(100vh-88px)] flex items-center justify-center px-6 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className="max-w-4xl"
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.02] tracking-tight text-gradient-cyan">
            Wave Height Prediction
          </h1>
          <p className="mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced deep learning system utilizing CNN-LSTM networks to forecast oceanic conditions with precision.
          </p>
          <motion.button
            onClick={() => analyzeRef.current?.scrollIntoView({ behavior: "smooth" })}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-16 inline-flex items-center justify-center size-12 rounded-full glass border border-primary/30 text-primary hover:text-accent transition-colors"
            aria-label="Scroll to analyzer"
          >
            <ChevronDown className="size-6" />
          </motion.button>
        </motion.div>
      </section>

      {/* Analyzer */}
      <section ref={analyzeRef} className="relative z-10 px-6 md:px-10 py-20 max-w-6xl mx-auto">
        <h2 className="font-display text-4xl md:text-6xl font-semibold text-center text-gradient-cyan mb-12">
          Analyze Ocean Data
        </h2>

        <Card className="glass border-border/40 p-6 md:p-10">
          <TimeSeriesGrid matrix={matrix} onChange={setMatrix} />

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setMatrix(sampleMatrix())}
              className="rounded-full px-8 border-primary/50 text-primary hover:bg-primary/10"
            >
              <Wand2 className="size-4 mr-2" /> Fill Sample
            </Button>
            <Button
              size="lg"
              onClick={onPredict}
              disabled={loading}
              className="rounded-full px-10 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 glow-ring"
            >
              {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Zap className="size-4 mr-2" />}
              Predict Wave Height
            </Button>
          </div>

          {error && (
            <div className="mt-4 mx-auto max-w-md flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <AlertCircle className="size-4 mt-0.5 text-destructive shrink-0" />
              <span className="text-destructive">{error}</span>
            </div>
          )}
        </Card>

        {/* Result orb */}
        <div ref={resultRef} className="mt-20 flex flex-col items-center">
          <WaveOrb value={prediction} />
          <motion.div
            key={prediction ?? "none"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="font-display text-7xl md:text-8xl font-semibold text-gradient-cyan leading-none">
              {prediction != null ? prediction.toFixed(2) : "—"}
            </div>
            <div className="mt-2 text-muted-foreground tracking-widest uppercase text-sm">Meters</div>
          </motion.div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 px-6 md:px-10 pb-16 max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
        {[
          {
            icon: Droplets,
            title: "Wave Height",
            desc: "The previous recorded wave height. This provides the temporal context needed for the CNN-LSTM model to forecast the next step.",
          },
          {
            icon: Wind,
            title: "Wind Speed",
            desc: "The speed of wind over the ocean surface. Higher wind speeds typically lead to increased wave formation through energy transfer.",
          },
          {
            icon: Gauge,
            title: "Air Pressure",
            desc: "Atmospheric pressure influences the development of storms and wave swells. Rapid changes often indicate incoming weather systems.",
          },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="glass border-l-2 border-l-primary border-border/40 p-6 h-full">
              <div className="flex items-center gap-2 mb-3">
                <f.icon className="size-5 text-primary" />
                <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* How to use */}
      <section className="relative z-10 px-6 md:px-10 pb-24 max-w-6xl mx-auto">
        <Card className="glass border-l-2 border-l-accent border-border/40 p-6 md:p-8">
          <h3 className="font-display text-2xl font-semibold mb-4">How to Use</h3>
          <ol className="space-y-3 text-sm md:text-base text-muted-foreground">
            <li><span className="text-primary font-mono mr-2">1.</span>Provide a "sliding window" of 10 consecutive time steps of historical data.</li>
            <li><span className="text-primary font-mono mr-2">2.</span>Each step requires the <strong className="text-foreground">past wave height</strong>, wind speed, atmospheric pressure, and temperature.</li>
            <li><span className="text-primary font-mono mr-2">3.</span>Click 'Predict' to run the CNN-LSTM neural network and get the forecasted wave height.</li>
          </ol>
        </Card>
      </section>

      <footer className="relative z-10 px-6 md:px-10 py-8 text-xs md:text-sm text-muted-foreground text-center border-t border-border/30">
        © 2026 Wave Prediction System | Powered by FastAPI &amp; TensorFlow
      </footer>
    </div>
  );
};

export default Index;
