import { X, List } from "lucide-react";
import type { Segment } from "@/lib/railguard/data";
import { riskColor, riskLevel } from "@/lib/railguard/data";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  segments: Segment[];
  selectedId: string | null;
  showAll: boolean;
  onSelect: (id: string) => void;
  onShowAll: () => void;
}

export function RoutesPanel({
  open,
  onClose,
  segments,
  selectedId,
  showAll,
  onSelect,
  onShowAll,
}: Props) {
  if (!open) return null;
  return (
    <div className="absolute top-3 left-3 z-[400] w-72 max-h-[calc(100%-1.5rem)] flex flex-col bg-[#0d1d35]/95 backdrop-blur border border-[#1f3358] rounded-md shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f3358]">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <List className="h-3.5 w-3.5 text-[#00C2A8]" />
          All Routes ({segments.length})
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition"
          aria-label="Close routes panel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        onClick={onShowAll}
        className={cn(
          "mx-3 mt-3 mb-1 text-[11px] font-semibold py-1.5 rounded border transition",
          showAll
            ? "bg-[#00C2A8] text-[#0A1628] border-[#00C2A8]"
            : "bg-transparent text-[#00C2A8] border-[#00C2A8]/50 hover:bg-[#00C2A8]/10",
        )}
      >
        {showAll ? "✓ Showing All Routes" : "Show All Routes on Map"}
      </button>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {segments.map((s) => {
          const color = riskColor(s.riskScore);
          const lvl = riskLevel(s.riskScore);
          const active = s.id === selectedId && !showAll;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                "w-full text-left rounded px-2.5 py-2 border transition flex items-center justify-between gap-2",
                active
                  ? "bg-[#112244] border-[#00C2A8]/60"
                  : "bg-[#112244]/50 border-transparent hover:bg-[#112244] hover:border-[#1f3358]",
              )}
            >
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-foreground truncate">
                  {s.from} → {s.to}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {s.length} km · {s.activeTrains} trains
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ color, background: `${color}22` }}
                >
                  {lvl}
                </span>
                <span className="text-[10px] mt-0.5" style={{ color }}>
                  {s.riskScore}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
