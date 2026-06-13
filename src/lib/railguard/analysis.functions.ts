import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const Input = z.object({
  route: z.string(),
  riskScore: z.number(),
  railTemp: z.number(),
  moisture: z.number(),
  signalIntegrity: z.number(),
  lastMaintenanceDays: z.number(),
});

export const generateRiskAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are a railway safety analyst for Indian Railways. Analyze this track segment and respond in EXACTLY 3-4 concise sentences. No headers, no bullet points, no markdown — plain prose only.

Segment: ${data.route}
Risk Score: ${data.riskScore}/100
Rail Temperature: ${data.railTemp}°C
Moisture Level: ${data.moisture}%
Signal Integrity: ${data.signalIntegrity}%
Last Maintenance: ${data.lastMaintenanceDays} days ago

Explain why this segment carries its current risk level and recommend the single most important action the operations team should take now.`;

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt,
    });

    return { analysis: text };
  });
