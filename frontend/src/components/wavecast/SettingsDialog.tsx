import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Settings2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { checkHealth, getApiBase, setApiBase } from "./api";
import { toast } from "sonner";

export default function SettingsDialog({ onChange }: { onChange?: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "fail">("idle");

  useEffect(() => {
    if (open) setUrl(getApiBase());
  }, [open]);

  const test = async () => {
    if (!url) return;
    setStatus("checking");
    const r = await checkHealth(url);
    setStatus(r.ok ? "ok" : "fail");
  };

  const save = () => {
    setApiBase(url);
    onChange?.(url);
    toast.success("API URL saved");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="glass border-border/40">
          <Settings2 className="size-4 mr-2" /> API
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/40">
        <DialogHeader>
          <DialogTitle className="font-display text-gradient-cyan">Connect to your FastAPI</DialogTitle>
          <DialogDescription>
            Enter the base URL of your wave-height prediction API. We'll call <code>/health</code> and <code>/predict</code>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="api-url">Base URL</Label>
          <Input
            id="api-url"
            placeholder="https://your-api.example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="font-mono"
          />
          <Button variant="secondary" onClick={test} disabled={!url || status === "checking"} className="w-full">
            {status === "checking" && <Loader2 className="size-4 mr-2 animate-spin" />}
            {status === "ok" && <CheckCircle2 className="size-4 mr-2 text-accent" />}
            {status === "fail" && <XCircle className="size-4 mr-2 text-destructive" />}
            Test connection
          </Button>
          {status === "fail" && (
            <p className="text-xs text-destructive">
              Connection failed. Check CORS, HTTPS, and that <code>/health</code> is reachable.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={!url} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
