import { GoogleGenAI } from '@google/genai';
import { getSystemPrompt } from './prompts';
import type { Industry, UseCase, Message } from '../types';

export interface AIResponse {
  reply: string;
  action: 'NONE' | 'SHOW_CALENDAR' | 'SHOW_OPTIONS' | 'LEAD_CAPTURED' | 'HANDOFF';
  options?: string[];
}

export async function generateAIResponse(
  history: Message[],
  userMessage: string,
  useCase: UseCase,
  industry: Industry
): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const systemInstruction = getSystemPrompt(useCase, industry);
  
  if (!apiKey) {
    console.warn("No Gemini API Key found. Using mock response.");
    return mockResponse(userMessage, useCase);
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    
    // Convert history to prompt string (simplified for demo)
    const conversationContext = history.slice(-6).map(m => 
      `${m.sender === 'user' ? 'Customer' : 'AI'}: ${m.text}`
    ).join('\n');
    
    const prompt = `
Conversation History:
${conversationContext}

Customer: ${userMessage}
`;

    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
      system_instruction: systemInstruction,
    });

    const responseText = interaction.output_text || '{}';
    // Clean any markdown formatting Gemini might still add
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanedText) as AIResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reply: "I'm experiencing technical difficulties right now.",
      action: "HANDOFF"
    };
  }
}

function mockResponse(message: string, useCase: UseCase): AIResponse {
  // A simple mock for when API key is missing
  const lowerMsg = message.toLowerCase();
  
  if (useCase === 'booking' || lowerMsg.includes('book')) {
    return {
      reply: "Sure, let's get that scheduled for you. Please select a time.",
      action: "SHOW_CALENDAR"
    };
  }
  
  if (useCase === 'handoff' || lowerMsg.includes('erp') || lowerMsg.includes('complex')) {
    return {
      reply: "I can help with general information, but this requirement would be better handled by our technical specialists.",
      action: "HANDOFF"
    };
  }

  if (useCase === 'lead' && lowerMsg.includes('500')) {
    return {
      reply: "Thanks! Based on what you've shared, our team can help automate a significant part of this process.",
      action: "LEAD_CAPTURED"
    };
  }

  return {
    reply: "This is a simulated response. Please add a Gemini API key to .env for dynamic AI conversation.",
    action: "SHOW_OPTIONS",
    options: ["Try Booking", "Talk to Sales"]
  };
}
