import { GoogleGenAI, Type } from "@google/genai";
import { Booking, HistoricPattern } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function predictCancellation(booking: Partial<Booking>, guestHistory: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this hotel booking and guest history to predict the probability of cancellation (0 to 1).
        Booking: ${JSON.stringify(booking)}
        History: ${JSON.stringify(guestHistory)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            probability: { type: Type.NUMBER, description: "Cancellation probability from 0 to 1" },
            reason: { type: Type.STRING, description: "Brief explanation of the probability" }
          },
          required: ["probability", "reason"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return { probability: 0.1, reason: "Error in AI prediction, using baseline." };
  }
}

export async function identifyDemandPatterns(historicBookings: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze these historic hotel bookings and return demand patterns by month.
        Bookings: ${JSON.stringify(historicBookings.slice(0, 100))}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              month: { type: Type.STRING },
              bookings: { type: Type.NUMBER },
              occupancy: { type: Type.NUMBER },
              cancelRate: { type: Type.NUMBER }
            },
            required: ["month", "bookings", "occupancy", "cancelRate"]
          }
        }
      }
    });

    return JSON.parse(response.text) as HistoricPattern[];
  } catch (error) {
    console.error("AI Demand Analysis Error:", error);
    return [];
  }
}
