import { GoogleGenAI } from "@google/genai";
import { COMPANY_INFO, FLEET_DATA } from "../data/avalimoData";

function getRuntimeApiKey(): string | undefined {
  if (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) {
    return (window as any).GEMINI_API_KEY;
  }
  return process.env.GEMINI_API_KEY || process.env.API_KEY;
}

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = getRuntimeApiKey();
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `
You are "Avali", the elite luxury transportation concierge and reservation specialist for AvaLimo Houston (operating at avalimo.net and avalimohouston.com).
You represent Houston's top-rated luxury chauffeur service established in 2013, serving Greater Houston, George Bush Intercontinental (IAH), William P. Hobby (HOU), and the Port of Galveston.

Company Details:
- Brand Name: AvaLimo Houston / Ava Limo Luxury Transportation
- 24/7 Dispatch Phone: (832) 567-8050
- AI Concierge Line: (832) 917-6331
- Official Email: adam@avalimo.net
- Base Location: Missouri City, TX 77459
- Operating Since: 2013

Fleet & Sample Flat Rates:
1. Mercedes-Benz S-Class (3 pax, 3 bags): $85/hr, IAH-Downtown ~$125, Hobby-Downtown ~$110, IAH-Galveston ~$220
2. Cadillac Escalade ESV (6 pax, 6 bags): $115/hr, IAH-Downtown ~$165, Hobby-Downtown ~$145, IAH-Galveston ~$260
3. GMC Yukon XL / Chevy Suburban (7 pax, 6 bags): $105/hr, IAH-Downtown ~$155, Hobby-Downtown ~$135
4. Mercedes-Benz Sprinter Executive (14 pax): $165/hr, IAH-Downtown ~$260, IAH-Galveston ~$390
5. Lincoln MKT Stretch Limousine (10 pax): $150/hr, IAH-Downtown ~$240
6. Executive Mini Coach / Party Bus (24 pax): $220/hr

Key Guarantees:
- Flat-rate transparent pricing (ZERO surge)
- Real-time flight tracking for IAH & Hobby
- 45 min free domestic wait, 60 min international
- Complimentary meet & greet, Wi-Fi, bottled water
- Child car seats available
- Direct Galveston cruise transfers

Tone: Highly refined, warm, professional, concise. For quotes or bookings, give an estimate and direct the user to the booking form or call dispatch at (832) 567-8050.
`;

export const getConciergeResponse = async (
  userMessage: string,
  history: { role: string; text: string }[] = []
): Promise<string> => {
  try {
    const ai = getAiClient();
    if (!ai) {
      return `Welcome to AvaLimo Houston! You can reach our 24/7 dispatch at ${COMPANY_INFO.phone} or email ${COMPANY_INFO.email}.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history.slice(-6).map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return response.text || "I am at your service. For immediate reservations, call our 24/7 dispatch at (832) 567-8050.";
  } catch (error) {
    console.error("Error communicating with Avali AI:", error);
    return `Our 24/7 reservation team is standing by at ${COMPANY_INFO.phone} or ${COMPANY_INFO.email}.`;
  }
};

export function getVehicleById(id: string) {
  return FLEET_DATA.find(v => v.id === id) || FLEET_DATA[1];
}
