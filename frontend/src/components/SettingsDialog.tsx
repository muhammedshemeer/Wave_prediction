import React, { useState } from "react";
import { Settings, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { checkHealth, setApiBase, getApiBase } from "../lib/api";
import { toast } from "sonner";

export const SettingsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState(getApiBase());
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleTest = async () => {
    setIsTesting(true);
    const ok = await checkHealth(url);
    setIsTesting(false);
    setStatus(ok ? "success" : "error");
    if (ok) {
      setApiBase(url);
      toast.success("Connection successful! API URL saved.");
    } else {
      toast.error("Connection failed. Please check the URL.");
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70"
      >
        <Settings size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-bold">API Settings</h2>
          <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">FastAPI Endpoint</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <button 
            onClick={handleTest}
            disabled={isTesting}
            className="w-full py-3 rounded-xl bg-primary text-background font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {isTesting ? <Loader2 size={18} className="animate-spin" /> : "Test & Save Connection"}
          </button>

          {status === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20">
              <CheckCircle2 size={14} /> Connected to WaveCast Service
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">
              <XCircle size={14} /> Could not reach service
            </div>
          )}
        </div>

        <p className="mt-6 text-[10px] text-white/30 text-center uppercase tracking-widest leading-relaxed">
          Ensure your FastAPI backend is running and CORS is allowed for this origin.
        </p>
      </div>
    </div>
  );
};
