import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Sparkles, Loader2, MousePointerClick, ClipboardList, Megaphone } from "lucide-react";
import type { Segment } from "@/lib/railguard/data";
import { riskColor, riskLevel } from "@/lib/railguard/data";
import { generateRiskAnalysis } from "@/lib/railguard/analysis.functions";
import { sendStationMasterAlert } from "@/lib/railguard/alert.functions";
import { cn } from "@/lib/utils";

interface Props {
  segment: Segment | null;
}

function SensorCard({
  icon,
  label,
  value,
  status,
}: {
  icon: string;
  label: string;
  value: string;
  status: "safe" | "warning" | "critical";
}) {
  const styles = {
    safe: "bg-[#00C2A8]/10 border-[#00C2A8]/30",
    warning: "bg-[#F5C842]/10 border-[#F5C842]/30",
    critical: "bg-[#E8334A]/10 border-[#E8334A]/40",
  }[status];
  const statusText = {
    safe: "text-[#00C2A8]",
    warning: "text-[#F5C842]",
    critical: "text-[#FF6479]",
  }[status];
  return (
    <div className={cn("rounded-md border p-3", styles)}>
      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
        <span>{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
      <div className={cn("text-[10px] font-bold uppercase tracking-wide", statusText)}>
        {status}
      </div>
    </div>
  );
}

export function SegmentDetails({ segment }: Props) {
  const runAnalysis = useServerFn(generateRiskAnalysis);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!segment) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#0d1d35] border-l border-[#1f3358] px-6 text-center">
        <MousePointerClick className="h-10 w-10 text-[#1f3358] mb-3" />
        <p className="text-xs text-muted-foreground">
          Click any track segment on the map to view details
        </p>
      </div>
    );
  }

  const lvl = riskLevel(segment.riskScore);
  const color = riskColor(segment.riskScore);

  const tempStatus = segment.sensors.railTemp >= 55 ? "critical" : segment.sensors.railTemp >= 45 ? "warning" : "safe";
  const moistStatus = segment.sensors.moisture >= 75 ? "critical" : segment.sensors.moisture >= 55 ? "warning" : "safe";
  const sigStatus = segment.sensors.signalIntegrity < 60 ? "critical" : segment.sensors.signalIntegrity < 85 ? "warning" : "safe";
  const maintStatus = segment.sensors.lastMaintenanceDays >= 60 ? "critical" : segment.sensors.lastMaintenanceDays >= 30 ? "warning" : "safe";

  const handleGenerate = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await runAnalysis({
        data: {
          route: `${segment.from} → ${segment.to}`,
          riskScore: segment.riskScore,
          railTemp: segment.sensors.railTemp,
          moisture: segment.sensors.moisture,
          signalIntegrity: segment.sensors.signalIntegrity,
          lastMaintenanceDays: segment.sensors.lastMaintenanceDays,
        },
      });
      setAnalysis(res.analysis);
    } catch (e) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const data = [
    { name: "score", value: segment.riskScore },
    { name: "rest", value: 100 - segment.riskScore },
  ];

  return (
    <div className="flex h-full flex-col bg-[#0d1d35] border-l border-[#1f3358] overflow-y-auto">
      <div className="px-4 py-4 border-b border-[#1f3358]">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Segment</div>
        <h2 className="text-lg font-semibold text-foreground mt-0.5">
          {segment.from} → {segment.to}
        </h2>

        <div className="mt-3 flex items-center gap-4">
          <div className="relative h-24 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={32}
                  outerRadius={44}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={color} />
                  <Cell fill="#1a2d52" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-bold" style={{ color }}>
                {segment.riskScore}
              </div>
              <div className="text-[9px] text-muted-foreground">RISK</div>
            </div>
          </div>
          <div>
            <span
              className="inline-block px-2.5 py-1 rounded text-[10px] font-bold border"
              style={{ color, borderColor: `${color}55`, background: `${color}15` }}
            >
              {lvl}
            </span>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Northern Railway Zone
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Sensor Readings
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <SensorCard icon="🌡️" label="Rail Temp" value={`${segment.sensors.railTemp}°C`} status={tempStatus} />
            <SensorCard icon="💧" label="Moisture" value={`${segment.sensors.moisture}%`} status={moistStatus} />
            <SensorCard icon="⚡" label="Signal Integrity" value={`${segment.sensors.signalIntegrity}%`} status={sigStatus} />
            <SensorCard icon="🔧" label="Last Maint." value={`${segment.sensors.lastMaintenanceDays}d ago`} status={maintStatus} />
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Track Info
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#112244]/70 rounded p-2.5">
              <div className="text-muted-foreground">Track Age</div>
              <div className="text-foreground font-medium mt-0.5">{segment.trackAge} years</div>
            </div>
            <div className="bg-[#112244]/70 rounded p-2.5">
              <div className="text-muted-foreground">Total Length</div>
              <div className="text-foreground font-medium mt-0.5">{segment.length} km</div>
            </div>
            <div className="bg-[#112244]/70 rounded p-2.5">
              <div className="text-muted-foreground">Active Trains</div>
              <div className="text-foreground font-medium mt-0.5">{segment.activeTrains} trains</div>
            </div>
            <div className="bg-[#112244]/70 rounded p-2.5">
              <div className="text-muted-foreground">Zone</div>
              <div className="text-foreground font-medium mt-0.5">Northern</div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[#00C2A8]/40 bg-[#00C2A8]/5 p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#00C2A8]" />
              AI Risk Analysis
            </h3>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00C2A8]/15 text-[#00C2A8] font-medium">
              Powered by AI
            </span>
          </div>

          {!analysis && !loading && (
            <button
              onClick={handleGenerate}
              className="mt-3 w-full bg-[#00C2A8] hover:bg-[#00d4b8] text-[#0A1628] text-xs font-semibold py-2 rounded transition"
            >
              Generate Analysis
            </button>
          )}

          {loading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-[#00C2A8]" />
              Analyzing segment risk profile…
            </div>
          )}

          {analysis && (
            <>
              <p className="mt-3 text-[12px] leading-relaxed text-foreground/90">
                {analysis}
              </p>
              <button
                onClick={handleGenerate}
                className="mt-3 text-[10px] text-[#00C2A8] hover:underline"
              >
                Regenerate
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => toast.success("Alert sent successfully")}
            className="flex items-center justify-center gap-1.5 bg-[#112244] hover:bg-[#15294f] border border-[#1f3358] text-foreground text-[11px] font-medium py-2.5 rounded transition"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Flag for Inspection
          </button>
          <button
            onClick={() => toast.success("Alert sent successfully")}
            className="flex items-center justify-center gap-1.5 bg-[#112244] hover:bg-[#15294f] border border-[#1f3358] text-foreground text-[11px] font-medium py-2.5 rounded transition"
          >
            <Megaphone className="h-3.5 w-3.5" />
            Alert Station Master
          </button>
        </div>
      </div>
    </div>
  );
}
