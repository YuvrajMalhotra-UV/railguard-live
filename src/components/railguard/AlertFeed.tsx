import { ChevronRight } from "lucide-react";
import type { Alert } from "@/lib/railguard/data";
import { cn } from "@/lib/utils";

interface Props {
  alerts: Alert[];
  stats: { critical: number; warning: number; safe: number };
  onEscalate: (alert: Alert) => void;
}

const sevStyles: Record<Alert["severity"], string> = {
  CRITICAL: "bg-[#E8334A]/15 text-[#FF6479] border-[#E8334A]/40",
  WARNING: "bg-[#F5C842]/15 text-[#F5C842] border-[#F5C842]/40",
  INFO: "bg-[#00C2A8]/15 text-[#00C2A8] border-[#00C2A8]/40",
};

export function AlertFeed({ alerts, stats, onEscalate }: Props) {
  return (
    <div className="flex h-full flex-col bg-[#0d1d35] border-r border-[#1f3358]">
      <div className="px-4 py-3 border-b border-[#1f3358]">
        <h2 className="text-sm font-semibold tracking-wide text-foreground flex items-center gap-2">
          <span className="text-[#F5C842]">⚡</span> Live Alerts
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">Real-time event stream</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {alerts.map((a, i) => (
          <div
            key={a.id}
            className={cn(
              "rounded-md border bg-[#112244]/80 p-3 transition hover:bg-[#15294f]",
              i === 0 && a.timestamp === "just now" && "animate-slide-down",
              i === 0 && "animate-slide-down",
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded border",
                  sevStyles[a.severity],
                )}
              >
                {a.severity}
              </span>
              <span className="text-[10px] text-muted-foreground">{a.timestamp}</span>
            </div>
            <div className="mt-2 text-xs font-medium text-foreground">{a.route}</div>
            <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
              {a.message}
            </div>
            <button
              onClick={() => onEscalate(a)}
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[#00C2A8] hover:text-[#5ee5d0] transition"
            >
              Escalate <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-[#1f3358] px-4 py-3 flex items-center justify-between text-[11px] font-medium">
        <span className="flex items-center gap-1"><span className="text-[#E8334A]">●</span> {stats.critical} Critical</span>
        <span className="flex items-center gap-1"><span className="text-[#F5C842]">●</span> {stats.warning} Warning</span>
        <span className="flex items-center gap-1"><span className="text-[#00C2A8]">●</span> {stats.safe} Safe</span>
      </div>
    </div>
  );
}
