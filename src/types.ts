export type Industry = 
  | 'Healthcare'
  | 'Real Estate'
  | 'Education'
  | 'Manufacturing'
  | 'Retail & E-commerce'
  | 'Hospitality'
  | 'Restaurants'
  | 'Automotive'
  | 'Professional Services'
  | 'Logistics';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  initialMessage: string;
}

export interface IndustryConfig {
  id: Industry;
  businessName: string;
  description: string;
  botName: string;
  botPersonality: string;
  welcomeMessage: string;
  quickReplies: string[];
  scenarios: Scenario[];
  systemPrompt: string;
}

export type ConversationState = 
  | 'idle'
  | 'answering_faq'
  | 'collecting_lead'
  | 'collecting_booking_details'
  | 'selecting_date'
  | 'selecting_time'
  | 'booking_pending'
  | 'booking_confirmed'
  | 'sending_confirmation'
  | 'awaiting_human'
  | 'human_handoff'
  | 'completed';

export interface BookingData {
  date?: string;
  time?: string;
  name?: string;
  company?: string;
  email?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  action?: 'NONE' | 'SHOW_CALENDAR' | 'LEAD_CAPTURED' | 'HANDOFF' | 'SHOW_OPTIONS' | 'START_BOOKING';
  options?: string[];
  metadata?: any;
}

export interface AutomationLog {
  id: string;
  time: Date;
  message: string;
}
