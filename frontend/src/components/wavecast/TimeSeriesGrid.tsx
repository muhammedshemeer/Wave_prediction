import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Wand2, RotateCcw } from "lucide-react";
import type { FeatureRow } from "./api";

const FEATURES = [
  { key: "Wave (m)", min: 0, max: 8 },
  { key: "Wind (m/s)", min: 0, max: 25 },
  { key: "Pressure (hPa)", min: 980, max: 1030 },
  { key: "Temp (°C)", min: -2, max: 32 },
] as const;

export const emptyMatrix = (): FeatureRow[] =>
  Array.from({ length: 10 }, () => [0, 0, 1013, 20] as FeatureRow);

export const sampleMatrix = (): FeatureRow[] =>
  Array.from({ length: 10 }, (_, i) => {
    const t = i / 9;
    return [
      +(1.2 + Math.sin(t * Math.PI) * 1.6 + Math.random() * 0.2).toFixed(2),
      +(6 + Math.sin(t * Math.PI * 1.4) * 4 + Math.random() * 0.5).toFixed(2),
      +(1013 + Math.sin(t * Math.PI) * 6).toFixed(1),
      +(18 + Math.cos(t * Math.PI) * 4).toFixed(1),
    ] as FeatureRow;
  });

interface Props {
  matrix: FeatureRow[];
  onChange: (m: FeatureRow[]) => void;
}

export default function TimeSeriesGrid({ matrix, onChange }: Props) {
  const update = (row: number, col: number, value: string) => {
    const v = parseFloat(value);
    const next = matrix.map((r) => [...r] as FeatureRow);
    next[row][col] = isNaN(v) ? 0 : v;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg">Input window — 10 timesteps × 4 features</h3>
          <p className="text-xs text-muted-foreground">Earliest at top, latest at bottom.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onChange(sampleMatrix())} className="glass border-border/40">
            <Wand2 className="size-3.5 mr-1.5" /> Sample
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onChange(emptyMatrix())}>
            <RotateCcw className="size-3.5 mr-1.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/40 glass">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-secondary/40">
              <th className="px-3 py-2 text-left font-medium">t</th>
              {FEATURES.map((f) => (
                <th key={f.key} className="px-3 py-2 text-left font-medium">{f.key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rIdx) => (
              <tr key={rIdx} className="border-t border-border/30 hover:bg-secondary/30 transition-colors">
                <td className="px-3 py-1.5 text-muted-foreground font-mono text-xs">t-{9 - rIdx}</td>
                {row.map((val, cIdx) => (
                  <td key={cIdx} className="px-2 py-1.5">
                    <Input
                      type="number"
                      step="0.01"
                      value={val}
                      onChange={(e) => update(rIdx, cIdx, e.target.value)}
                      className="h-8 font-mono text-xs bg-input/60 border-border/30"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
