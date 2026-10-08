export type Industry = 
  | 'Manufacturing' 
  | 'Real Estate' 
  | 'Healthcare' 
  | 'Education' 
  | 'Retail' 
  | 'Services';

export type UseCase = 
  | 'support'
  | 'faq'
  | 'booking'
  | 'lead'
  | 'enquiry'
  | 'handoff'
  | 'followup'
  | 'sales'
  | 'full';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  action?: 'SHOW_CALENDAR' | 'LEAD_CAPTURED' | 'HANDOFF' | 'SHOW_OPTIONS';
  options?: string[];
  metadata?: any;
}

export interface AutomationLog {
  id: string;
  time: Date;
  message: string;
}
