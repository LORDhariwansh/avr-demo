import { GoogleGenAI } from '@google/genai';

// Initialize the client. In a real app, this should be done on the backend.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const client = new GoogleGenAI({ apiKey });

export interface AIResponse {
  reply: string;
  intent: string;
  confidence: number;
  action: string;
  leadScoreModifier?: number;
  tags?: string[];
  entities?: {
    name?: string;
    company?: string;
    industry?: string;
    requirement?: string;
  };
}

const systemInstruction = `You are the AI VARSH Automation Assistant. 
You are a highly professional, concise, and friendly AI handling customer inquiries for AI VARSH, an automation studio providing AI chatbots, WhatsApp automation, and workflow solutions.

Your goal is to answer questions, detect intent, and generate structured output.
Do NOT invent pricing. Offer a consultation if asked about price.
Be natural but business-aware. 

You MUST return your response as a valid JSON object matching this structure:
{
  "reply": "Your conversational response to the user",
  "intent": "One of: GENERAL, SERVICES, FAQ, PRICING, LEAD, BOOKING, SUPPORT, FOLLOW_UP, HUMAN_HANDOFF, COMPLAINT, UNKNOWN",
  "confidence": <number between 0 and 100>,
  "action": "One of: NONE, SHOW_SERVICES, SHOW_FAQ, COLLECT_LEAD, START_BOOKING, CREATE_LEAD, SEND_CONFIRMATION, HANDOFF_HUMAN",
  "leadScoreModifier": <optional number to add/subtract from lead score based on interest>,
  "tags": ["array", "of", "relevant", "tags"],
  "entities": {
    "name": "extracted name if any",
    "company": "extracted company if any",
    "industry": "extracted industry if any",
    "requirement": "extracted requirement if any"
  }
}

Important: ONLY return the raw JSON object. Do not wrap it in markdown block quotes.`;

export async function generateAIResponse(
  message: string, 
  history: {role: string, text: string}[] = []
): Promise<AIResponse> {
  // If no API key is provided, use a smart simulation fallback for the demo
  if (!apiKey) {
    console.warn('No Gemini API key found. Using simulated responses.');
    return simulateResponse(message);
  }

  try {
    // Format history for the new interactions API format
    // For simplicity in this demo, we'll just include it in the prompt if we don't have previous_interaction_id
    const historyText = history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    
    const prompt = `
Conversation History:
${historyText}

USER: ${message}

Analyze the user's message and respond with the required JSON structure.
`;

    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
      system_instruction: systemInstruction,
    });

    const responseText = interaction.output_text || '{}';
    // Clean up potential markdown formatting
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText) as AIResponse;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return simulateResponse(message);
  }
}

// Fallback logic for when there's no API key or an error occurs
function simulateResponse(message: string): AIResponse {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('demo') || lowerMsg.includes('book')) {
    return {
      reply: "I'd be happy to schedule a demo for you! Let's get that booked right away.",
      intent: "BOOKING",
      confidence: 96,
      action: "START_BOOKING",
      leadScoreModifier: 20,
      tags: ["Demo Request", "High Intent"]
    };
  }
  
  if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
    return {
      reply: "Our pricing varies based on your specific requirements and the scale of automation needed. I recommend a brief consultation so we can provide an accurate quote. Would you like to schedule one?",
      intent: "PRICING",
      confidence: 85,
      action: "SHOW_SERVICES",
      tags: ["Pricing Inquiry"]
    };
  }

  if (lowerMsg.includes('support') || lowerMsg.includes('help') || lowerMsg.includes('not working')) {
    return {
      reply: "I'm sorry you're experiencing issues. Let me connect you with our technical support team who can help resolve this immediately.",
      intent: "SUPPORT",
      confidence: 92,
      action: "HANDOFF_HUMAN",
      tags: ["Support Ticket"]
    };
  }
  
  return {
    reply: "That sounds interesting. AI VARSH can certainly help optimize those processes with our intelligent automation platform. Could you tell me a bit more about your current workflow?",
    intent: "LEAD",
    confidence: 78,
    action: "COLLECT_LEAD",
    leadScoreModifier: 5,
    tags: ["General Inquiry"]
  };
}
