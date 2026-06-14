import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
const logoUrl = "/railguard-logo.png";

interface Props {
  onSimulate: () => void;
}

export function Navbar({ onSimulate }: Props) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString("en-IN", { hour12: false }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 px-5 flex items-center justify-between bg-[#0a1628] border-b border-[#1f3358] z-20 relative">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md overflow-hidden flex items-center justify-center shadow-[0_0_20px_-4px_#00C2A8]">
          <img src={logoAsset.url} alt="RailGuard" className="h-full w-full object-contain" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-foreground leading-none">
            RailGuard
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Northern Zone — Live Monitor
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#00C2A8] opacity-75 pulse-dot" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C2A8]" />
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-[#00C2A8]">
            LIVE
          </span>
        </div>

        <div className="text-xs font-mono text-foreground tabular-nums">
          {now} <span className="text-muted-foreground">IST</span>
        </div>

        <button
          onClick={onSimulate}
          className="flex items-center gap-1.5 bg-[#E8334A] hover:bg-[#ff4a60] text-white text-xs font-semibold px-3.5 py-2 rounded shadow-[0_0_16px_-4px_#E8334A] transition"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Simulate Incident
        </button>
      </div>
    </header>
  );
}
