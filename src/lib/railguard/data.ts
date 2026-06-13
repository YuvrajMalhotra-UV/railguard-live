export type RiskLevel = "SAFE" | "WARNING" | "CRITICAL";

export interface Segment {
  id: string;
  from: string;
  to: string;
  coords: [[number, number], [number, number]];
  riskScore: number;
  trackAge: number;
  length: number;
  activeTrains: number;
  sensors: {
    railTemp: number;
    moisture: number;
    signalIntegrity: number;
    lastMaintenanceDays: number;
  };
}

export interface Alert {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  route: string;
  message: string;
  timestamp: string;
}

const CITY: Record<string, [number, number]> = {
  Delhi: [28.6139, 77.209],
  Agra: [27.1767, 78.0081],
  Jhansi: [25.4484, 78.5685],
  Bhopal: [23.2599, 77.4126],
  Nagpur: [21.1458, 79.0882],
  Lucknow: [26.8467, 80.9462],
  Varanasi: [25.3176, 82.9739],
  Patna: [25.5941, 85.1376],
  Kolkata: [22.5726, 88.3639],
  Chandigarh: [30.7333, 76.7794],
  Amritsar: [31.634, 74.8723],
  Gorakhpur: [26.7606, 83.3732],
};

function mk(
  id: string,
  from: string,
  to: string,
  riskScore: number,
  sensors: Segment["sensors"],
  meta: { trackAge: number; length: number; activeTrains: number },
): Segment {
  return {
    id,
    from,
    to,
    coords: [CITY[from], CITY[to]],
    riskScore,
    ...meta,
    sensors,
  };
}

export const INITIAL_SEGMENTS: Segment[] = [
  mk("del-agr", "Delhi", "Agra", 25, { railTemp: 38, moisture: 42, signalIntegrity: 96, lastMaintenanceDays: 12 }, { trackAge: 8, length: 233, activeTrains: 5 }),
  mk("agr-jhs", "Agra", "Jhansi", 45, { railTemp: 47, moisture: 55, signalIntegrity: 82, lastMaintenanceDays: 34 }, { trackAge: 14, length: 215, activeTrains: 3 }),
  mk("jhs-bpl", "Jhansi", "Bhopal", 62, { railTemp: 51, moisture: 61, signalIntegrity: 71, lastMaintenanceDays: 58 }, { trackAge: 18, length: 291, activeTrains: 4 }),
  mk("bpl-ngp", "Bhopal", "Nagpur", 18, { railTemp: 36, moisture: 38, signalIntegrity: 98, lastMaintenanceDays: 8 }, { trackAge: 6, length: 357, activeTrains: 6 }),
  mk("del-lko", "Delhi", "Lucknow", 78, { railTemp: 58, moisture: 81, signalIntegrity: 54, lastMaintenanceDays: 71 }, { trackAge: 22, length: 506, activeTrains: 3 }),
  mk("lko-bsb", "Lucknow", "Varanasi", 33, { railTemp: 41, moisture: 47, signalIntegrity: 91, lastMaintenanceDays: 19 }, { trackAge: 10, length: 286, activeTrains: 4 }),
  mk("bsb-pat", "Varanasi", "Patna", 55, { railTemp: 49, moisture: 58, signalIntegrity: 76, lastMaintenanceDays: 41 }, { trackAge: 15, length: 232, activeTrains: 3 }),
  mk("pat-kol", "Patna", "Kolkata", 81, { railTemp: 56, moisture: 79, signalIntegrity: 49, lastMaintenanceDays: 65 }, { trackAge: 24, length: 532, activeTrains: 4 }),
  mk("del-chd", "Delhi", "Chandigarh", 20, { railTemp: 35, moisture: 39, signalIntegrity: 97, lastMaintenanceDays: 9 }, { trackAge: 7, length: 244, activeTrains: 4 }),
  mk("chd-asr", "Chandigarh", "Amritsar", 41, { railTemp: 44, moisture: 51, signalIntegrity: 85, lastMaintenanceDays: 28 }, { trackAge: 12, length: 229, activeTrains: 2 }),
  mk("lko-grp", "Lucknow", "Gorakhpur", 67, { railTemp: 52, moisture: 66, signalIntegrity: 68, lastMaintenanceDays: 53 }, { trackAge: 17, length: 273, activeTrains: 3 }),
  mk("grp-bsb", "Gorakhpur", "Varanasi", 88, { railTemp: 61, moisture: 84, signalIntegrity: 41, lastMaintenanceDays: 82 }, { trackAge: 26, length: 195, activeTrains: 2 }),
];

export const INITIAL_ALERTS: Alert[] = [
  { id: "a1", severity: "CRITICAL", route: "Gorakhpur → Varanasi", message: "Track fracture detected at KM 312", timestamp: "1 min ago" },
  { id: "a2", severity: "CRITICAL", route: "Patna → Kolkata", message: "Signal failure reported — manual override active", timestamp: "3 min ago" },
  { id: "a3", severity: "CRITICAL", route: "Delhi → Lucknow", message: "Heavy rainfall — track expansion risk HIGH", timestamp: "7 min ago" },
  { id: "a4", severity: "WARNING", route: "Lucknow → Gorakhpur", message: "Maintenance overdue by 23 days", timestamp: "15 min ago" },
  { id: "a5", severity: "WARNING", route: "Agra → Jhansi", message: "Speed anomaly detected on Train 12307", timestamp: "28 min ago" },
  { id: "a6", severity: "INFO", route: "Jhansi → Bhopal", message: "Scheduled inspection due in 3 days", timestamp: "1 hr ago" },
];

export const ROTATING_ALERTS: Omit<Alert, "id" | "timestamp">[] = [
  { severity: "WARNING", route: "Bhopal → Nagpur", message: "Minor vibration spike on bridge crossing KM 142" },
  { severity: "INFO", route: "Delhi → Chandigarh", message: "Routine sensor calibration completed" },
  { severity: "CRITICAL", route: "Varanasi → Patna", message: "Sudden moisture surge — possible washout near KM 88" },
  { severity: "WARNING", route: "Chandigarh → Amritsar", message: "Catenary tension below threshold at segment 4" },
];

export function riskLevel(score: number): RiskLevel {
  if (score >= 70) return "CRITICAL";
  if (score >= 40) return "WARNING";
  return "SAFE";
}

export function riskColor(score: number): string {
  const lvl = riskLevel(score);
  if (lvl === "CRITICAL") return "#E8334A";
  if (lvl === "WARNING") return "#F5C842";
  return "#00C2A8";
}
