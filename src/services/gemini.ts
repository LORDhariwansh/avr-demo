import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { IndustryConfig, Message, ConversationState, BookingData } from '../types';

export async function generateAIResponse(
  history: Message[],
  config: IndustryConfig,
  conversationState: ConversationState,
  bookingData: BookingData
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
      requiresHuman: false,
      nextState: conversationState
    };
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    // Keep context small but sufficient for recent turns.
    // The history already includes the user's latest message as the last item.
    const recentHistory = history.slice(-6);
    
    let contents = recentHistory.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        reply: { type: Type.STRING, description: "The customer-facing message" },
        intent: { type: Type.STRING, description: "Customer's intent (e.g. ACKNOWLEDGEMENT, QUESTION, BOOKING, etc)" },
        industry: { type: Type.STRING, description: "The industry string" },
        action: { type: Type.STRING, description: "Action to trigger", enum: ["NONE", "SHOW_CALENDAR", "SHOW_OPTIONS", "LEAD_CAPTURED", "HANDOFF", "START_BOOKING"] },
        entities: { type: Type.OBJECT, description: "Extracted entities like name, date, etc." },
        suggestedReplies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested quick replies for the user" },
        requiresHuman: { type: Type.BOOLEAN, description: "True if handoff to human is explicitly needed. Do NOT set to true for simple acknowledgements." },
        nextState: { type: Type.STRING, description: "The next conversation state", enum: ['idle', 'answering_faq', 'collecting_lead', 'collecting_booking_details', 'selecting_date', 'selecting_time', 'booking_pending', 'booking_confirmed', 'sending_confirmation', 'awaiting_human', 'human_handoff', 'completed'] }
      },
      required: ["reply", "intent", "industry", "action", "suggestedReplies", "requiresHuman", "nextState"]
    };

    const stateContext = `
CURRENT CONVERSATION STATE: ${conversationState}
COLLECTED BOOKING DATA: ${JSON.stringify(bookingData)}

CRITICAL INSTRUCTIONS FOR ACKNOWLEDGEMENTS:
If the user's message is an acknowledgement (e.g. "okay", "thanks", "done", "got it"):
- DO NOT treat this as an error, request for human handoff, or an invalid field.
- If the state is booking_confirmed, simply reply with a friendly acknowledgement like "You're welcome! Let me know if you need anything else."
- DO NOT restart the workflow or trigger handoff just because the user said "okay".
- DO NOT change the state away from booking_confirmed unless they ask to reschedule.

CRITICAL INSTRUCTIONS FOR BOOKING AND RESCHEDULING:
- If the user wants to change an existing booking (e.g., "Tomorrow instead", "Can I change it?"), initiate the rescheduling flow by triggering the SHOW_CALENDAR action.
- If the user asks "Send it to my email" or "I didn't receive it", check the current state and respond accordingly, assuming they refer to the booking confirmation.
- NEVER claim to have successfully generated a PDF, sent an email, or created a calendar event. You merely trigger the START_BOOKING or SHOW_CALENDAR action, and the UI handles the integrations and success messages. Do not invent successful action results.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.1-flash",
      contents: contents,
      config: {
        systemInstruction: config.systemPrompt + "\n" + stateContext,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    // Extract generated JSON from the Gemini SDK response.
    const resultText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (resultText) {
      try {
        const parsed = JSON.parse(resultText);
        return parsed;
      } catch (e) {
        console.error("Failed to parse Gemini JSON response:", e);
        // fall through to error handling below
      }
    }
    
    // If no response text, return graceful fallback preserving state
    const fallbackReply = {
      reply: "I'm having trouble generating a response right now. Your existing booking details are preserved. Would you like to try again?",
      intent: "ERROR",
      industry: config.id,
      action: "NONE",
      entities: {},
      suggestedReplies: config.quickReplies.slice(0, 3),
      requiresHuman: false,
      nextState: conversationState
    };
    return fallbackReply;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return generic error fallback without handoff
    return {
      reply: "I'm having trouble generating a response right now. Your existing booking details are preserved. Would you like to try again?",
      intent: "ERROR",
      industry: config.id,
      action: "NONE",
      entities: {},
      suggestedReplies: config.quickReplies.slice(0, 3),
      requiresHuman: false,
      nextState: conversationState
    };
  }
}
