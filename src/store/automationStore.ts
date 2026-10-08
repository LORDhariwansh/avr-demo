import { create } from 'zustand';

interface Contact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  industry?: string;
  avatar?: string;
}

interface Message {
  id: string;
  contactId: string;
  text: string;
  sender: 'user' | 'ai' | 'human';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  isTyping?: boolean;
}

interface Conversation {
  contactId: string;
  messages: Message[];
  unreadCount: number;
  lastInteraction: string;
  status: 'active' | 'resolved' | 'handoff';
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  tags: string[];
}

interface Lead {
  id: string;
  contactId: string;
  score: number;
  status: 'HOT' | 'WARM' | 'COLD';
  stage: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DEMO BOOKED' | 'PROPOSAL' | 'WON';
  requirement?: string;
  source: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  contactId: string;
  topic: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled';
}

interface AutomationState {
  contacts: Record<string, Contact>;
  conversations: Record<string, Conversation>;
  leads: Record<string, Lead>;
  appointments: Record<string, Appointment>;
  unreadCount: number;
  
  // Actions
  addMessage: (contactId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  createLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLeadScore: (contactId: string, score: number) => void;
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  markRead: (contactId: string) => void;
}

const mockContacts = {
  'c1': { id: 'c1', name: 'Rahul Sharma', company: 'ABC Industries', phone: '+91 98765 43210', industry: 'Manufacturing', avatar: 'RS' },
  'c2': { id: 'c2', name: 'Priya Mehta', company: 'Nova Technologies', phone: '+91 98765 43211', industry: 'IT Services', avatar: 'PM' },
  'c3': { id: 'c3', name: 'Amit Verma', company: 'TechCore Solutions', phone: '+91 98765 43212', industry: 'Software', avatar: 'AV' },
};

const mockConversations = {
  'c1': {
    contactId: 'c1',
    messages: [
      { id: 'm1', contactId: 'c1', text: 'Hi, I run a manufacturing company and want to automate customer enquiries.', sender: 'user', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'read' },
      { id: 'm2', contactId: 'c1', text: 'Hello Rahul! I can certainly help with that. AI VARSH provides tailored AI and WhatsApp automation solutions that perfectly fit manufacturing businesses.', sender: 'ai', timestamp: new Date(Date.now() - 3590000).toISOString(), status: 'read' },
      { id: 'm3', contactId: 'c1', text: 'Can I book a demo?', sender: 'user', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'read' }
    ],
    unreadCount: 1,
    lastInteraction: new Date(Date.now() - 60000).toISOString(),
    status: 'active',
    sentiment: 'positive',
    tags: ['Manufacturing', 'Demo Request']
  },
  'c2': {
    contactId: 'c2',
    messages: [
      { id: 'm4', contactId: 'c2', text: 'How does pricing work?', sender: 'user', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'read' }
    ],
    unreadCount: 1,
    lastInteraction: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    sentiment: 'neutral',
    tags: ['Pricing']
  }
};

export const useAutomationStore = create<AutomationState>((set) => ({
  contacts: mockContacts,
  // @ts-ignore
  conversations: mockConversations,
  leads: {},
  appointments: {},
  unreadCount: 2,
  
  addMessage: (contactId, msg) => set((state) => {
    const convo = state.conversations[contactId] || {
      contactId,
      messages: [],
      unreadCount: 0,
      lastInteraction: new Date().toISOString(),
      status: 'active',
      sentiment: 'neutral',
      tags: []
    };
    
    const newMessage: Message = {
      ...msg,
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    return {
      conversations: {
        ...state.conversations,
        [contactId]: {
          ...convo,
          messages: [...convo.messages, newMessage],
          unreadCount: msg.sender === 'user' ? convo.unreadCount + 1 : convo.unreadCount,
          lastInteraction: newMessage.timestamp
        }
      },
      unreadCount: msg.sender === 'user' ? state.unreadCount + 1 : state.unreadCount
    };
  }),
  
  updateContact: (contactId, updates) => set((state) => ({
    contacts: {
      ...state.contacts,
      [contactId]: { ...state.contacts[contactId], ...updates }
    }
  })),
  
  createLead: (lead) => set((state) => {
    const id = `l_${Date.now()}`;
    return {
      leads: {
        ...state.leads,
        [id]: { ...lead, id, createdAt: new Date().toISOString() }
      }
    };
  }),
  
  updateLeadScore: (contactId, score) => set((state) => {
    const leadId = Object.keys(state.leads).find(id => state.leads[id].contactId === contactId);
    if (!leadId) return state;
    
    const status = score >= 80 ? 'HOT' : score >= 50 ? 'WARM' : 'COLD';
    return {
      leads: {
        ...state.leads,
        [leadId]: { ...state.leads[leadId], score, status }
      }
    };
  }),
  
  bookAppointment: (appointment) => set((state) => {
    const id = `apt_${Date.now()}`;
    return {
      appointments: {
        ...state.appointments,
        [id]: { ...appointment, id, status: 'confirmed' }
      }
    };
  }),
  
  markRead: (contactId) => set((state) => {
    const convo = state.conversations[contactId];
    if (!convo || convo.unreadCount === 0) return state;
    
    return {
      conversations: {
        ...state.conversations,
        [contactId]: { ...convo, unreadCount: 0 }
      },
      unreadCount: state.unreadCount - convo.unreadCount
    };
  })
}));
