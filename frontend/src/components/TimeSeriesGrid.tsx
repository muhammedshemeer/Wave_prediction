import React from "react";

interface TimeSeriesGridProps {
  data: number[][];
  onChange: (rowIndex: number, colIndex: number, value: string) => void;
  onSample: () => void;
  onReset: () => void;
}

export const TimeSeriesGrid = ({ data, onChange, onSample, onReset }: TimeSeriesGridProps) => {
  const labels = ["Wave (m)", "Wind (m/s)", "Pressure (hPa)", "Temp (°C)"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3 text-center px-2">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Step</div>
        {labels.map((l) => (
          <div key={l} className="text-[10px] font-bold text-primary/70 uppercase tracking-[0.2em]">{l}</div>
        ))}
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {data.map((row, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 items-center group">
            <div className="text-[10px] text-muted-foreground font-mono bg-white/5 rounded py-1.5 text-center border border-white/5">
              t-{9 - i}
            </div>
            {row.map((val, j) => (
              <input
                key={j}
                type="number"
                step="0.01"
                value={val === 0 ? "" : val}
                placeholder="0.00"
                onChange={(e) => onChange(i, j, e.target.value)}
                className="bg-white/[0.03] border border-white/10 rounded-md px-2 py-1.5 text-sm font-mono text-center focus:border-primary/40 focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-white/10"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          onClick={onSample}
          className="px-5 py-2 rounded-full border border-primary/30 text-primary text-[10px] font-bold hover:bg-primary/10 transition-all uppercase tracking-widest"
        >
          Sample Data
        </button>
        <button
          onClick={onReset}
          className="px-5 py-2 rounded-full border border-white/10 text-white/40 text-[10px] font-bold hover:bg-white/5 transition-all uppercase tracking-widest"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
