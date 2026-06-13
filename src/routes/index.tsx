import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { Navbar } from "@/components/railguard/Navbar";
import { StatsBar } from "@/components/railguard/StatsBar";
import { AlertFeed } from "@/components/railguard/AlertFeed";
import { SegmentDetails } from "@/components/railguard/SegmentDetails";
import { RoutesPanel } from "@/components/railguard/RoutesPanel";
import { SplashScreen } from "@/components/railguard/SplashScreen";
import { Layers } from "lucide-react";
import {
  INITIAL_SEGMENTS,
  INITIAL_ALERTS,
  ROTATING_ALERTS,
  riskLevel,
  type Alert,
  type Segment,
} from "@/lib/railguard/data";
import { toast } from "sonner";

const TrackMap = lazy(() =>
  import("@/components/railguard/TrackMap").then((m) => ({ default: m.TrackMap })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RailGuard — Northern Zone Live Monitor" },
      { name: "description", content: "Real-time railway track safety intelligence dashboard for Indian Railways." },
    ],
  }),
  component: Dashboard,
});

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

function Dashboard() {
  const [segments, setSegments] = useState<Segment[]>(INITIAL_SEGMENTS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [modal, setModal] = useState<null | { title: string; msg: string }>(null);
  const [mounted, setMounted] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [routesPanelOpen, setRoutesPanelOpen] = useState(false);
  const alertCounter = useRef(0);

  useEffect(() => setMounted(true), []);

  // Fluctuate sensor data every 10s
  useEffect(() => {
    const id = setInterval(() => {
      setSegments((prev) =>
        prev.map((s) => {
          const fluct = (base: number, range = 3) =>
            Math.max(0, Math.min(100, base + (Math.random() * range * 2 - range))).toFixed(0);
          return {
            ...s,
            sensors: {
              ...s.sensors,
              railTemp: Math.round(s.sensors.railTemp + (Math.random() * 2 - 1)),
              moisture: Number(fluct(s.sensors.moisture)),
              signalIntegrity: Number(fluct(s.sensors.signalIntegrity, 2)),
              lastMaintenanceDays: s.sensors.lastMaintenanceDays,
            },
          };
        }),
      );
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // Rotating alerts every 45s
  useEffect(() => {
    const id = setInterval(() => {
      const next = ROTATING_ALERTS[alertCounter.current % ROTATING_ALERTS.length];
      alertCounter.current += 1;
      const newAlert: Alert = {
        ...next,
        id: `auto-${Date.now()}`,
        timestamp: "just now",
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 20));
    }, 45000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    let critical = 0, warning = 0, safe = 0;
    for (const s of segments) {
      const lvl = riskLevel(s.riskScore);
      if (lvl === "CRITICAL") critical++;
      else if (lvl === "WARNING") warning++;
      else safe++;
    }
    return { critical, warning, safe };
  }, [segments]);

  const topStats = useMemo(
    () => [
      { icon: "🚂", label: "Trains Active", value: "847" },
      { icon: "⚠️", label: "Segments at Risk", value: String(stats.critical + stats.warning), accent: "#F5C842" },
      { icon: "🔴", label: "Critical Alerts", value: String(stats.critical), accent: "#E8334A" },
      { icon: "🔧", label: "Inspections Due", value: "12" },
      { icon: "✅", label: "Uptime", value: "99.7%", accent: "#00C2A8" },
    ],
    [stats],
  );

  const selectedSegment = useMemo(
    () => segments.find((s) => s.id === selectedId) ?? null,
    [segments, selectedId],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setShowAll(false);
  }, []);

  const handleSimulate = useCallback(() => {
    const targetId = "del-agr";
    // Step 1: shift to warning
    setSegments((prev) =>
      prev.map((s) => (s.id === targetId ? { ...s, riskScore: 55 } : s)),
    );
    setIncidentId(targetId);
    // Step 2: critical after 1s
    setTimeout(() => {
      setSegments((prev) =>
        prev.map((s) =>
          s.id === targetId
            ? {
                ...s,
                riskScore: 94,
                sensors: {
                  railTemp: 63,
                  moisture: 71,
                  signalIntegrity: 38,
                  lastMaintenanceDays: s.sensors.lastMaintenanceDays,
                },
              }
            : s,
        ),
      );
    }, 1200);

    // Alert
    const incidentAlert: Alert = {
      id: `incident-${Date.now()}`,
      severity: "CRITICAL",
      route: "Delhi → Agra",
      message: "Track vibration anomaly — possible obstruction at KM 87",
      timestamp: "just now",
    };
    setAlerts((prev) => [incidentAlert, ...prev].slice(0, 20));
    setSelectedId(targetId);
    setShowAll(false);

    // Flash + sound + modal
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    playBeep();
    setTimeout(() => {
      setModal({
        title: "🚨 INCIDENT DETECTED",
        msg: "Track vibration anomaly detected on Delhi → Agra at KM 87. Possible obstruction confirmed by adjacent sensors. Immediate action required.",
      });
    }, 800);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A1628] text-foreground overflow-hidden">
      <Navbar onSimulate={handleSimulate} />
      <StatsBar stats={topStats} />

      <div className="flex-1 grid grid-cols-[20%_55%_25%] min-h-0">
        <div className="min-h-0 min-w-0 overflow-hidden">
          <AlertFeed
            alerts={alerts}
            stats={stats}
            onEscalate={(a) => toast.success(`Escalated: ${a.route}`)}
          />
        </div>

        <div className="relative bg-[#0A1628] min-h-0 min-w-0">
          {mounted ? (
            <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Loading map…</div>}>
              <TrackMap
                segments={segments}
                selectedId={selectedId}
                onSelect={handleSelect}
                incidentId={incidentId}
                showAll={showAll}
              />
            </Suspense>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Initializing map…
            </div>
          )}

          {/* Top-right map controls */}
          <div className="absolute top-3 right-3 z-[400] flex gap-2">
            <button
              onClick={() => setRoutesPanelOpen((v) => !v)}
              className="flex items-center gap-1.5 bg-[#0d1d35]/95 backdrop-blur border border-[#1f3358] hover:border-[#00C2A8]/60 text-foreground text-[11px] font-medium px-3 py-1.5 rounded shadow-lg transition"
            >
              <Layers className="h-3.5 w-3.5 text-[#00C2A8]" />
              Routes
            </button>
            {!showAll && (
              <button
                onClick={() => { setShowAll(true); setSelectedId(null); }}
                className="bg-[#00C2A8] hover:bg-[#00d4b8] text-[#0A1628] text-[11px] font-semibold px-3 py-1.5 rounded shadow-lg transition"
              >
                Show All Routes
              </button>
            )}
          </div>

          <RoutesPanel
            open={routesPanelOpen}
            onClose={() => setRoutesPanelOpen(false)}
            segments={segments}
            selectedId={selectedId}
            showAll={showAll}
            onSelect={(id) => { setSelectedId(id); setShowAll(false); }}
            onShowAll={() => { setShowAll(true); setSelectedId(null); }}
          />


          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-10 bg-[#0d1d35]/90 backdrop-blur border border-[#1f3358] rounded-md px-3 py-2 text-[11px] space-y-1 shadow-lg">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
              Track Status
            </div>
            <div className="flex items-center gap-2"><span className="text-[#00C2A8] text-base leading-none">●</span> Safe</div>
            <div className="flex items-center gap-2"><span className="text-[#F5C842] text-base leading-none">●</span> Warning</div>
            <div className="flex items-center gap-2"><span className="text-[#E8334A] text-base leading-none">●</span> Critical</div>
          </div>
        </div>

        <div className="min-h-0 min-w-0 overflow-hidden">
          <SegmentDetails segment={selectedSegment} />
        </div>
      </div>

      {flash && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-[#E8334A] red-flash" />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#112244] border border-[#E8334A]/60 rounded-lg max-w-md w-[90%] p-6 shadow-[0_0_40px_-10px_#E8334A]">
            <h3 className="text-lg font-bold text-[#FF6479]">{modal.title}</h3>
            <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{modal.msg}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => { toast.success("Inspection team dispatched"); setModal(null); }}
                className="bg-[#E8334A] hover:bg-[#ff4a60] text-white text-xs font-semibold py-2.5 rounded transition"
              >
                Dispatch Inspection Team
              </button>
              <button
                onClick={() => { toast.success("Trains halted on segment"); setModal(null); }}
                className="bg-[#112244] hover:bg-[#15294f] border border-[#1f3358] text-foreground text-xs font-semibold py-2.5 rounded transition"
              >
                Halt Trains on Segment
              </button>
            </div>
            <button
              onClick={() => setModal(null)}
              className="mt-3 w-full text-[10px] text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
