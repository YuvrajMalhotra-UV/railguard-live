import { useEffect, useState } from "react";
import logoAsset from "@/assets/railguard-logo.png.asset.json";

const RAIL = ["R", "A", "I", "L"];
const GUARD = ["G", "U", "A", "R", "D"];
const LETTER_DELAYS = [1000, 1220, 1440, 1660, 1880, 2100, 2320, 2540, 2760];
const TAGLINE = "GUARDING INDIAN RAIL NETWORK";

const BOOT_STEPS = [
  { t: 3800, msg: "INITIALIZING TRACK SENSORS...", to: 20 },
  { t: 4100, msg: "LOADING NORTHERN ZONE DATA...", to: 45 },
  { t: 4400, msg: "CONNECTING AI RISK ENGINE...", to: 70 },
  { t: 4700, msg: "CALIBRATING SIGNAL MONITORS...", to: 90 },
  { t: 5000, msg: "ALL SYSTEMS OPERATIONAL", to: 100 },
];

export function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [tagChars, setTagChars] = useState(0);
  const [bootStep, setBootStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [redFlash, setRedFlash] = useState(false);
  const [showEnter, setShowEnter] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Tagline typeout
  useEffect(() => {
    const start = 3200;
    const timers: number[] = [];
    for (let i = 1; i <= TAGLINE.length; i++) {
      timers.push(window.setTimeout(() => setTagChars(i), start + i * 35));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  // Hide cursor after last letter
  useEffect(() => {
    const id = window.setTimeout(() => setCursorVisible(false), 2760 + 400);
    return () => clearTimeout(id);
  }, []);

  // Boot sequence
  useEffect(() => {
    const timers: number[] = [];
    BOOT_STEPS.forEach((s, i) => {
      timers.push(window.setTimeout(() => setBootStep(i), s.t));
    });
    // progress animates smoothly
    let raf = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      let target = 0;
      for (const s of BOOT_STEPS) if (elapsed >= s.t) target = s.to;
      setProgress((p) => p + (target - p) * 0.08);
      if (elapsed < 6000) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    timers.push(
      window.setTimeout(() => {
        setRedFlash(true);
        setShowFinal(true);
        window.setTimeout(() => setRedFlash(false), 300);
      }, 5500),
    );
    timers.push(window.setTimeout(() => setShowEnter(true), 6000));
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleEnter = () => {
    setLeaving(true);
    window.setTimeout(onEnter, 600);
  };

  return (
    <div
      className="fixed inset-0 bg-[#0A1628] overflow-hidden"
      style={{
        zIndex: 9999,
        transform: leaving ? "translateY(-100vh)" : "translateY(0)",
        transition: "transform 0.6s ease-in",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => {
          const left = (i * 53) % 100;
          const dur = 6 + ((i * 7) % 8);
          const delay = (i * 0.4) % 6;
          const op = 0.3 + ((i * 13) % 60) / 100;
          return (
            <span
              key={i}
              className="splash-particle"
              style={{
                left: `${left}%`,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
                opacity: op,
              }}
            />
          );
        })}
      </div>

      {/* Red flash */}
      {redFlash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "#E8334A", opacity: 0.15 }}
        />
      )}

      <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
        {/* Shield */}
        <div className="relative" style={{ width: 220, height: 220 }}>
          <div
            className="absolute inset-0 splash-shield-glow rounded-full"
            style={{ boxShadow: "0 0 60px 10px rgba(0,194,168,0.0)" }}
          />
          <img
            src={logoAsset.url}
            alt="RailGuard"
            className="splash-shield relative w-full h-full object-contain"
            style={{ filter: "drop-shadow(0 0 30px rgba(0,194,168,0.25))" }}
          />
          {/* Scan line */}
          <div className="splash-scanline absolute left-0 right-0 h-[2px] bg-[#00C2A8]" style={{ boxShadow: "0 0 12px #00C2A8" }} />
          {/* Targeting circle (SVG) */}
          {showFinal && (
            <svg
              className="absolute inset-0 pointer-events-none"
              viewBox="0 0 220 220"
              style={{ overflow: "visible" }}
            >
              <circle
                cx="110"
                cy="110"
                r="125"
                fill="none"
                stroke="#00C2A8"
                strokeWidth="2"
                strokeDasharray="785"
                strokeDashoffset="785"
                style={{ animation: "splashDrawCircle 0.8s ease-out forwards" }}
              />
              <path
                d="M 85 115 L 105 135 L 145 90"
                fill="none"
                stroke="#00C2A8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="100"
                strokeDashoffset="100"
                style={{ animation: "splashDrawCheck 0.4s ease-out 0.8s forwards" }}
              />
            </svg>
          )}
          {/* Alert dot */}
          <span className="splash-alert-dot absolute" style={{ top: 18, right: 24 }} />
        </div>

        {/* RAILGUARD letters */}
        <div className="mt-8 flex items-end" style={{ height: 90 }}>
          {[...RAIL, ...GUARD].map((ch, idx) => {
            const isRail = idx < 4;
            return (
              <span
                key={idx}
                className="splash-letter"
                style={{
                  color: isRail ? "#00C2A8" : "#FFFFFF",
                  animationDelay: `${LETTER_DELAYS[idx]}ms`,
                  fontFamily: "'Arial Black', Arial, sans-serif",
                  fontSize: 72,
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  lineHeight: 1,
                  opacity: 0,
                  display: "inline-block",
                }}
              >
                {ch}
              </span>
            );
          })}
          {cursorVisible && (
            <span
              style={{
                display: "inline-block",
                width: 3,
                height: 72,
                background: "#00C2A8",
                marginLeft: 4,
                animation: "splashBlink 0.6s steps(2) infinite",
              }}
            />
          )}
        </div>

        {/* Tagline */}
        <div className="mt-6 relative">
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: 13,
              letterSpacing: "6px",
              color: "#8DA0BB",
              minHeight: 16,
            }}
          >
            {TAGLINE.split("").map((c, i) => (
              <span
                key={i}
                style={{
                  opacity: i < tagChars ? 1 : 0,
                  transition: "opacity 0.2s ease-out",
                }}
              >
                {c}
              </span>
            ))}
          </div>
          {tagChars >= TAGLINE.length && (
            <div
              className="splash-underline absolute left-0 right-0"
              style={{
                bottom: -6,
                height: 2,
                background: "#00C2A8",
                opacity: 0.4,
              }}
            />
          )}
        </div>

        {/* Boot panel */}
        <div
          className="mt-10 rounded-lg"
          style={{
            width: 360,
            background: "#112244",
            padding: 20,
            border: "1px solid rgba(31,51,88,0.6)",
            opacity: bootStep >= 0 ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        >
          <div
            style={{
              height: 4,
              background: "#0A1628",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#00C2A8",
                borderRadius: 999,
                boxShadow: "0 0 8px #00C2A8",
                transition: "width 0.15s linear",
              }}
            />
          </div>

          <div
            className="mt-4"
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              letterSpacing: "2px",
              color: showFinal ? "#00C2A8" : "#8DA0BB",
              minHeight: 18,
            }}
          >
            {showFinal ? (
              <span>
                <span style={{ color: "#00C2A8" }}>{"> "}</span>
                RAILGUARD ACTIVE — NORTHERN ZONE SECURED
              </span>
            ) : bootStep >= 0 ? (
              <span
                key={bootStep}
                className="splash-status"
                style={{
                  color: bootStep === BOOT_STEPS.length - 1 ? "#00C2A8" : "#8DA0BB",
                }}
              >
                <span style={{ color: "#00C2A8" }}>{"> "}</span>
                {BOOT_STEPS[bootStep].msg}
              </span>
            ) : (
              <span style={{ opacity: 0 }}>—</span>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const active = bootStep >= i;
              const justActivated = bootStep === i;
              return (
                <span
                  key={i}
                  className={justActivated ? "splash-dot-flash" : ""}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: active ? "#00C2A8" : "#1E3A5F",
                    boxShadow: active ? "0 0 6px #00C2A8" : "none",
                    transition: "background 0.3s ease-out",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          disabled={!showEnter}
          className="splash-enter-btn mt-8"
          style={{
            opacity: showEnter ? 1 : 0,
            pointerEvents: showEnter ? "auto" : "none",
            background: "#00C2A8",
            color: "#0A1628",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "3px",
            borderRadius: 6,
            padding: "14px 32px",
            transition: "opacity 0.5s ease-out, background 0.2s, transform 0.2s",
          }}
        >
          ENTER DASHBOARD →
        </button>
      </div>

      <style>{`
        @keyframes splashShieldIn {
          0% { opacity: 0; transform: scale(0) rotate(-15deg); }
          70% { opacity: 1; transform: scale(1.1) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
        .splash-shield {
          animation: splashShieldIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes splashShieldGlow {
          0% { box-shadow: 0 0 0px 0 rgba(0,194,168,0); }
          50% { box-shadow: 0 0 80px 12px rgba(0,194,168,0.45); }
          100% { box-shadow: 0 0 0px 0 rgba(0,194,168,0); }
        }
        .splash-shield-glow {
          animation: splashShieldGlow 1.2s ease-out 0.4s both;
        }
        @keyframes splashScan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .splash-scanline {
          animation: splashScan 0.6s ease-in-out 0.4s both;
        }
        @keyframes splashAlertDot {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .splash-alert-dot {
          width: 10px; height: 10px; border-radius: 999px;
          background: #E8334A;
          box-shadow: 0 0 12px #E8334A;
          opacity: 0;
          animation: splashAlertDot 1.4s ease-in-out 1.9s infinite;
        }
        @keyframes splashLetterIn {
          0% { opacity: 0; transform: translateY(40px) scale(0.7); }
          70% { opacity: 1; transform: translateY(-8px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .splash-letter {
          animation: splashLetterIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes splashBlink { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes splashUnderline {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
        .splash-underline { animation: splashUnderline 0.5s ease-out both; }
        @keyframes splashStatusIn {
          0% { opacity: 0; transform: translateY(4px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .splash-status { animation: splashStatusIn 0.3s ease-out both; display: inline-block; }
        @keyframes splashDotFlash {
          0% { background: #E8334A !important; box-shadow: 0 0 10px #E8334A; }
          100% { background: #00C2A8; box-shadow: 0 0 6px #00C2A8; }
        }
        .splash-dot-flash { animation: splashDotFlash 0.4s ease-out both; }
        @keyframes splashDrawCircle { to { stroke-dashoffset: 0; } }
        @keyframes splashDrawCheck { to { stroke-dashoffset: 0; } }
        @keyframes splashParticle {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        .splash-particle {
          position: absolute;
          bottom: -10px;
          width: 2px; height: 2px;
          background: #00C2A8;
          border-radius: 999px;
          box-shadow: 0 0 4px #00C2A8;
          animation: splashParticle linear infinite;
        }
        .splash-enter-btn:hover:not(:disabled) {
          background: #009E88 !important;
          transform: scale(1.03);
        }
      `}</style>
    </div>
  );
}
