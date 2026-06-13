import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  route: z.string(),
  riskScore: z.number(),
  railTemp: z.number(),
  moisture: z.number(),
  signalIntegrity: z.number(),
  lastMaintenanceDays: z.number(),
  analysis: z.string().nullable().optional(),
});

function statusIcon(level: "safe" | "warning" | "critical") {
  return level === "critical" ? "🔴" : level === "warning" ? "⚠️" : "✅";
}

export const sendStationMasterAlert = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Missing RESEND_API_KEY");

    const recipient = "yuvrajmalhotra124@gmail.com";
    const now = new Date().toUTCString();

    const tempStatus = data.railTemp >= 55 ? "critical" : data.railTemp >= 45 ? "warning" : "safe";
    const moistStatus = data.moisture >= 75 ? "critical" : data.moisture >= 55 ? "warning" : "safe";
    const sigStatus = data.signalIntegrity < 60 ? "critical" : data.signalIntegrity < 85 ? "warning" : "safe";
    const maintStatus = data.lastMaintenanceDays >= 60 ? "critical" : data.lastMaintenanceDays >= 30 ? "warning" : "safe";

    const riskColor =
      data.riskScore >= 80 ? "#E8334A" : data.riskScore >= 50 ? "#F5C842" : "#00C2A8";
    const riskLevel =
      data.riskScore >= 80 ? "CRITICAL" : data.riskScore >= 50 ? "WARNING" : "SAFE";

    const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0A1628;font-family:Inter,Arial,sans-serif;color:#E6EDF5;">
  <div style="max-width:640px;margin:0 auto;background:#0A1628;padding:24px;">
    <div style="font-size:22px;font-weight:800;letter-spacing:1px;color:#00C2A8;">🛡️ RailGuard</div>
    <div style="font-size:11px;color:#7d8ba3;margin-top:2px;">Indian Railways Safety Intelligence</div>

    <div style="margin-top:20px;background:#E8334A;color:#fff;padding:16px;border-radius:8px;font-size:18px;font-weight:800;text-align:center;letter-spacing:1px;">
      ⚠️ CRITICAL TRACK ALERT
    </div>

    <h1 style="margin:24px 0 4px;font-size:28px;color:#fff;">${data.route}</h1>
    <div style="font-size:13px;color:#7d8ba3;">Generated ${now}</div>

    <div style="margin-top:20px;background:#112244;border:1px solid #1f3358;border-radius:8px;padding:20px;text-align:center;">
      <div style="font-size:11px;color:#7d8ba3;letter-spacing:2px;">RISK SCORE</div>
      <div style="font-size:54px;font-weight:800;color:${riskColor};line-height:1;margin:6px 0;">${data.riskScore}</div>
      <div style="font-size:12px;font-weight:700;color:${riskColor};letter-spacing:1px;">${riskLevel}</div>
    </div>

    <h2 style="margin:24px 0 8px;font-size:14px;color:#fff;text-transform:uppercase;letter-spacing:1.5px;">Sensor Readings</h2>
    <table style="width:100%;border-collapse:collapse;background:#112244;border:1px solid #1f3358;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #1f3358;color:#9eb0c8;">Rail Temperature</td><td style="padding:12px 16px;border-bottom:1px solid #1f3358;text-align:right;font-weight:600;color:#fff;">${data.railTemp}°C ${statusIcon(tempStatus)}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #1f3358;color:#9eb0c8;">Moisture Level</td><td style="padding:12px 16px;border-bottom:1px solid #1f3358;text-align:right;font-weight:600;color:#fff;">${data.moisture}% ${statusIcon(moistStatus)}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #1f3358;color:#9eb0c8;">Signal Integrity</td><td style="padding:12px 16px;border-bottom:1px solid #1f3358;text-align:right;font-weight:600;color:#fff;">${data.signalIntegrity}% ${statusIcon(sigStatus)}</td></tr>
      <tr><td style="padding:12px 16px;color:#9eb0c8;">Last Maintenance</td><td style="padding:12px 16px;text-align:right;font-weight:600;color:#fff;">${data.lastMaintenanceDays} days ago ${statusIcon(maintStatus)}</td></tr>
    </table>

    ${data.analysis ? `
    <h2 style="margin:24px 0 8px;font-size:14px;color:#fff;text-transform:uppercase;letter-spacing:1.5px;">🤖 AI Risk Analysis</h2>
    <div style="background:rgba(0,194,168,0.08);border:1px solid rgba(0,194,168,0.35);border-radius:8px;padding:16px;font-size:14px;line-height:1.6;color:#d4e2f2;font-style:italic;">${data.analysis}</div>
    ` : ""}

    <h2 style="margin:24px 0 8px;font-size:14px;color:#fff;text-transform:uppercase;letter-spacing:1.5px;">Recommended Actions</h2>
    <ul style="background:#112244;border:1px solid #1f3358;border-radius:8px;padding:16px 16px 16px 36px;margin:0;color:#d4e2f2;font-size:14px;line-height:1.8;">
      <li>Dispatch inspection team to affected segment immediately</li>
      <li>Consider halting trains on this segment until clearance</li>
    </ul>

    <div style="margin-top:28px;padding-top:16px;border-top:1px solid #1f3358;font-size:11px;color:#7d8ba3;text-align:center;line-height:1.6;">
      This is an automated alert from <strong style="color:#00C2A8;">RailGuard</strong> — Indian Railways Safety Intelligence System<br/>
      Generated: ${now}
    </div>
  </div>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from: "RailGuard Alerts <onboarding@resend.dev>",
        to: [recipient],
        subject: `🚨 RailGuard Alert — ${data.route} Requires Immediate Inspection`,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend ${res.status}: ${text}`);
    }

    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id, recipient };
  });
