import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, CheckCheck, User, CheckCircle2 } from 'lucide-react';
import type { UseCase, Industry, Message, AutomationLog } from '../types';
import { generateAIResponse } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulatorProps {
  useCase: UseCase;
  industry: Industry;
  onBack: () => void;
}

export default function Simulator({ useCase, industry, onBack }: SimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeNodes, setActiveNodes] = useState<string[]>(['AI Chatbot']);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation based on use case
  useEffect(() => {
    let initialUserMsg = "Hi, I have a question.";
    if (useCase === 'support') initialUserMsg = "Hi, I need help with your service.";
    if (useCase === 'booking') initialUserMsg = "Hi, I want to book an appointment.";
    if (useCase === 'lead') initialUserMsg = `Hi, I'm interested in your automation services for my ${industry.toLowerCase()} business.`;
    if (useCase === 'enquiry') initialUserMsg = "I want to know about your services.";
    if (useCase === 'handoff') initialUserMsg = "I need a customized integration with our ERP system.";
    if (useCase === 'sales') initialUserMsg = "I'm looking for an AI chatbot for my business.";
    if (useCase === 'followup') {
      // Pre-fill history to simulate followup
      setMessages([
        { id: '1', text: "I'm interested. I'll discuss this with my team.", sender: 'user', timestamp: new Date(Date.now() - 86400000) }
      ]);
      addLog("Customer stopped responding");
      setTimeout(() => {
        addLog("Automatic Follow-up Triggered");
        setActiveNodes(prev => [...new Set([...prev, 'Follow-up'])]);
        addMessage({
          text: `Hi 👋\n\nJust following up on our conversation about WhatsApp automation.\n\nWould you like to continue where we left off?`,
          sender: 'ai',
          action: 'SHOW_OPTIONS',
          options: ['Yes, Continue', 'Not Now']
        });
      }, 1500);
      return;
    }

    // Default start flow
    handleSend(initialUserMsg, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCase, industry]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, { id: Math.random().toString(), time: new Date(), message: msg }]);
  };

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: Math.random().toString(), timestamp: new Date() }]);
  };

  const handleSend = async (text: string, isInitial = false) => {
    if (!text.trim()) return;

    if (!isInitial) {
      addMessage({ text, sender: 'user' });
      addLog("Customer message received");
    } else {
      // Force user message without triggering another send
      addMessage({ text, sender: 'user' });
      addLog("Session started");
    }
    
    setInput('');
    setIsTyping(true);

    // Call Gemini
    const snapshot = [...messages, { id: 'temp', text, sender: 'user' as const, timestamp: new Date() }];
    const aiResp = await generateAIResponse(snapshot, text, useCase, industry);
    
    setIsTyping(false);
    addLog("Gemini understood intent & generated response");

    addMessage({
      text: aiResp.reply,
      sender: 'ai',
      action: aiResp.action !== 'NONE' ? aiResp.action : undefined,
      options: aiResp.options
    });

    // Update active nodes based on action
    if (aiResp.action === 'SHOW_CALENDAR') {
      addLog("Booking calendar displayed");
      setActiveNodes(prev => [...new Set([...prev, 'Booking'])]);
    }
    if (aiResp.action === 'LEAD_CAPTURED') {
      addLog("Lead information captured securely");
      setActiveNodes(prev => [...new Set([...prev, 'Lead Capture'])]);
    }
    if (aiResp.action === 'HANDOFF') {
      addLog("Complex query detected - routing to human");
      setTimeout(() => {
        addMessage({
          text: "Rahul — Automation Specialist\nOnline",
          sender: 'system',
          action: 'HANDOFF'
        });
        addMessage({
          text: "Hi, I'm Rahul from the AI VARSH team. I've received your requirement. Let me help you with this.",
          sender: 'ai'
        });
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAF9] font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Change Automation
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black text-gray-900 tracking-tight">AI VARSH Chat</h1>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Automation Active
          </div>
        </div>
        <div className="w-32 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
          {industry}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Column - Contact Info */}
        <div className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col p-6 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Customer Profile</div>
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Demo User</h2>
          <p className="text-sm text-gray-500 text-center font-medium mb-6">{industry} Industry</p>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500">Phone</span>
              <span className="font-semibold text-gray-900">+91 98765 43210</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-emerald-600">Online</span>
            </div>
          </div>
        </div>

        {/* Center Column - Chat Interface */}
        <div className="flex-1 flex flex-col relative bg-[#EFEAE2]">
          {/* WhatsApp style chat background pattern */}
          <div className="absolute inset-0 opacity-40 bg-[url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-solid-color-whatsapp-backgrounds-whatsapp-dark-whatsapp-patterns-whatsapp.jpg')] mix-blend-multiply pointer-events-none" style={{ backgroundSize: '400px' }}></div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative z-10 custom-scrollbar">
            <div className="flex justify-center mb-6">
              <span className="bg-white/80 backdrop-blur text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
                Today
              </span>
            </div>

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'} w-full`}
                >
                  {msg.sender === 'system' ? (
                    <div className="my-4 bg-indigo-50 text-indigo-700 text-xs font-bold px-4 py-2 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm relative ${
                      msg.sender === 'user' 
                        ? 'bg-[#E7F8DA] rounded-tr-none text-gray-900' 
                        : 'bg-white rounded-tl-none text-gray-900 border border-gray-100'
                    }`}>
                      <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                      
                      {/* Special Action UI Renderers inside AI messages */}
                      {msg.sender === 'ai' && msg.action === 'SHOW_CALENDAR' && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <div className="text-xs font-bold text-gray-500 mb-2">Available Slots (Today)</div>
                          <div className="grid grid-cols-2 gap-2">
                            {['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'].map(time => (
                              <button 
                                key={time} 
                                onClick={() => handleSend(`I choose ${time}`)}
                                className="bg-white text-indigo-600 text-sm font-semibold py-2 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors"
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.sender === 'ai' && msg.action === 'LEAD_CAPTURED' && (
                        <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-3">
                            <CheckCircle2 className="w-4 h-4" /> LEAD CAPTURED ✓
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between"><span className="text-indigo-900/60 font-semibold">Industry:</span><span className="font-bold text-indigo-900">{industry}</span></div>
                            <div className="flex justify-between"><span className="text-indigo-900/60 font-semibold">Priority:</span><span className="font-bold text-emerald-600">HOT</span></div>
                          </div>
                          <button 
                            onClick={() => handleSend("I want to book a consultation.")}
                            className="w-full mt-4 bg-indigo-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Book a Consultation
                          </button>
                        </div>
                      )}

                      {msg.sender === 'ai' && msg.options && msg.options.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {msg.options.map(opt => (
                            <button 
                              key={opt}
                              onClick={() => handleSend(opt)}
                              className="bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`text-[10px] text-gray-400 mt-1 flex justify-end items-center gap-1`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start w-full">
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-4 shadow-sm border border-gray-100 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-[#F0F2F5] px-4 py-3 flex items-center gap-3 z-10">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Type a message..."
              className="flex-1 bg-white rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            />
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {/* Right Column - Automation Status */}
        <div className="hidden md:flex w-80 bg-white border-l border-gray-200 flex-col shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)] z-1">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Automation State</h3>
            <div className="space-y-3">
              {['AI Chatbot', 'FAQ', 'Lead Capture', 'Booking', 'Follow-up'].map((node) => {
                const isActive = activeNodes.includes(node);
                return (
                  <div key={node} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white border-gray-100 text-gray-500'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-indigo-600 text-white' : 'border-2 border-gray-200'
                    }`}>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-semibold text-sm">{node}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Live Event Log</h3>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              <AnimatePresence>
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                  >
                    <div className="text-[10px] font-bold text-gray-400 shrink-0 mt-0.5">
                      {log.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-sm text-gray-700 font-medium leading-tight">
                      {log.message}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
