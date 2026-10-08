import { GoogleGenAI } from '@google/genai';
import { getSystemPrompt } from './prompts';
import type { Industry, UseCase, Message } from '../types';

export async function* streamAIResponse(
  history: Message[],
  userMessage: string,
  useCase: UseCase,
  industry: Industry
) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const systemInstruction = getSystemPrompt(useCase, industry);
  
  if (!apiKey) {
    console.warn("No Gemini API Key found. Simulating stream.");
    const mockWords = "This is a simulated streaming response. Please add your Gemini API key to the .env file to enable live AI capabilities.".split(' ');
    for (const word of mockWords) {
      yield word + ' ';
      await new Promise(r => setTimeout(r, 50));
    }
    return;
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    
    // Only send the last 6 messages to keep the context extremely small and fast
    const recentHistory = history.slice(-6);
    
    let contents = recentHistory.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const responseStream = await client.models.generateContentStream({
      model: "gemini-3.8-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Lower temperature for faster, more predictable routing responses
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "I'm experiencing technical difficulties right now. Let me connect you with a human agent.";
  }
}
