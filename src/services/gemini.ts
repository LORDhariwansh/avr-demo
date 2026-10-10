import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { IndustryConfig, Message } from '../types';

export async function generateAIResponse(
  history: Message[],
  userMessage: string,
  config: IndustryConfig
) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("No Gemini API Key found. Simulating response.");
    await new Promise(r => setTimeout(r, 1000));
    return {
      reply: "This is a simulated response. Please add your Gemini API key to the .env file.",
      intent: "UNKNOWN",
      industry: config.id,
      action: "NONE",
      entities: {},
      suggestedReplies: config.quickReplies.slice(0, 3),
      requiresHuman: false
    };
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const recentHistory = history.slice(-6);
    
    let contents = recentHistory.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        reply: { type: Type.STRING, description: "The customer-facing message" },
        intent: { type: Type.STRING, description: "Customer's intent" },
        industry: { type: Type.STRING, description: "The industry string" },
        action: { type: Type.STRING, description: "Action to trigger", enum: ["NONE", "SHOW_CALENDAR", "SHOW_OPTIONS", "LEAD_CAPTURED", "HANDOFF", "START_BOOKING"] },
        entities: { type: Type.OBJECT, description: "Extracted entities like name, date, etc." },
        suggestedReplies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested quick replies for the user" },
        requiresHuman: { type: Type.BOOLEAN, description: "True if handoff to human is needed" }
      },
      required: ["reply", "intent", "industry", "action", "suggestedReplies", "requiresHuman"]
    };

    const response = await client.models.generateContent({
      model: "gemini-3.1-flash",
      contents: contents,
      config: {
        systemInstruction: config.systemPrompt,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText);
      return parsed;
    }
    
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reply: "I'm experiencing technical difficulties right now. Let me connect you with a human agent.",
      intent: "ERROR",
      industry: config.id,
      action: "HANDOFF",
      entities: {},
      suggestedReplies: [],
      requiresHuman: true
    };
  }
}
