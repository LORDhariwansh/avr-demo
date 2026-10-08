import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, CheckCheck, CheckCircle2, Calendar as CalendarIcon, FileText, Mail } from 'lucide-react';
import type { UseCase, Industry, Message, AutomationLog } from '../types';
import { streamAIResponse } from '../services/gemini';
import { createCalendarEvent, sendEmail } from '../services/google';
import { generateBookingPDF } from '../services/pdf';
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
  
  // Streaming state
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Booking Flow State
  const [bookingState, setBookingState] = useState<{
    date?: string;
    time?: string;
    name?: string;
    company?: string;
    email?: string;
    step: 'none' | 'date' | 'time' | 'name' | 'company' | 'email' | 'done';
  }>({ step: 'none' });

  // Integration State
  const [googleConnected, setGoogleConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initialUserMsg = "Hi, I have a question.";
    if (useCase === 'support') initialUserMsg = "Hi, I need help with your service.";
    if (useCase === 'booking') initialUserMsg = "Hi, I want to book a demo.";
    if (useCase === 'lead') initialUserMsg = `Hi, I'm interested in your automation services.`;
    if (useCase === 'enquiry') initialUserMsg = "I need 500 units.";
    if (useCase === 'handoff') initialUserMsg = "I need a customized integration with our ERP system.";
    if (useCase === 'sales') initialUserMsg = "How much does your WhatsApp automation cost?";
    
    if (useCase === 'followup') {
      setMessages([{ id: '1', text: "I'm interested. I'll discuss this with my team.", sender: 'user', timestamp: new Date(Date.now() - 86400000) }]);
      addLog("Customer stopped responding. (Paused)");
      setTimeout(() => {
        addLog("24 hours later: Automatic Follow-up Triggered");
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

    handleSend(initialUserMsg, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCase, industry]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingText]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, { id: Math.random().toString(), time: new Date(), message: msg }]);
  };

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: Math.random().toString(), timestamp: new Date() }]);
  };

  // -------------------------------------------------------------
  // FAST LOCAL ROUTING (Avoids Gemini for obvious intents)
  // -------------------------------------------------------------
  const localRouter = (text: string): { action: any, reply: string, options?: string[] } | null => {
    const t = text.toLowerCase();
    
    if (t.match(/\b(book|appointment|schedule|demo)\b/) && bookingState.step === 'none') {
      return { action: 'SHOW_CALENDAR', reply: "Absolutely! I'd be happy to help you schedule a demo. Please choose a convenient date below." };
    }
    if (t.match(/\b(price|cost|pricing)\b/)) {
      return { 
        action: 'SHOW_OPTIONS', 
        reply: "Pricing depends on the workflow, integrations, and number of conversations. I can help you understand your requirement and arrange a consultation.", 
        options: ['Understand My Requirement', 'Book Demo', 'Talk to Sales'] 
      };
    }
    if (t.match(/\b(human|agent|person|team)\b/)) {
      return { action: 'HANDOFF', reply: "I'm connecting you with a team member who can help with this." };
    }
    if (t.match(/\b(services|what do you do)\b/)) {
      return { action: 'SHOW_OPTIONS', reply: "AI VARSH provides AI Automation, WhatsApp Chatbots, Website Development, and AI Video Analytics.", options: ['AI Automation', 'AI Chatbots', 'Book Demo']};
    }
    return null;
  };

  const handleSend = async (text: string, isInitial = false) => {
    if (!text.trim()) return;

    if (!isInitial) {
      addMessage({ text, sender: 'user' });
      addLog("Customer message received");
    } else {
      addMessage({ text, sender: 'user' });
      addLog("Session started");
    }
    
    setInput('');
    
    // Check if we are inside a booking flow
    if (bookingState.step !== 'none' && bookingState.step !== 'done') {
      handleBookingFlow(text);
      return;
    }

    setIsTyping(true);
    
    // 1. FAST LOCAL ROUTING
    const quickRoute = localRouter(text);
    if (quickRoute) {
      setTimeout(() => {
        setIsTyping(false);
        addMessage({ text: quickRoute.reply, sender: 'ai', action: quickRoute.action, options: quickRoute.options });
        executeAction(quickRoute.action);
      }, 400); // Super fast artificial delay
      return;
    }

    // 2. GEMINI STREAMING (Fallback for natural language)
    setIsTyping(false);
    setIsStreaming(true);
    setStreamingText('');

    const snapshot = [...messages, { id: 'temp', text, sender: 'user' as const, timestamp: new Date() }];
    
    try {
      let fullResponse = '';
      for await (const chunk of streamAIResponse(snapshot, text, useCase, industry)) {
        fullResponse += chunk;
        setStreamingText(fullResponse);
      }
      
      setIsStreaming(false);
      setStreamingText('');
      
      // Basic action parsing from Gemini's plain text response if we wanted to enforce it, 
      // but we will rely mostly on Local Routing for actions. 
      // If Gemini replies with "Let's book", we can catch it.
      let action: any = undefined;
      if (fullResponse.toLowerCase().includes('book a consultation')) action = 'SHOW_CALENDAR';

      addMessage({ text: fullResponse.trim(), sender: 'ai', action });
      if (action) executeAction(action);
      
      addLog("Gemini stream completed");
    } catch (e) {
      setIsStreaming(false);
      setStreamingText('');
      addMessage({ text: "I'm experiencing some technical difficulties. Let me connect you with a human.", sender: 'ai', action: 'HANDOFF' });
      executeAction('HANDOFF');
    }
  };

  const executeAction = (action: string) => {
    if (action === 'SHOW_CALENDAR') {
      addLog("Booking calendar displayed");
      setActiveNodes(prev => [...new Set([...prev, 'Booking'])]);
      setBookingState({ step: 'date' });
    }
    if (action === 'LEAD_CAPTURED') {
      addLog("Lead information captured securely");
      setActiveNodes(prev => [...new Set([...prev, 'Lead Capture'])]);
    }
    if (action === 'HANDOFF') {
      addLog("Complex query detected - routing to human");
      setTimeout(() => {
        addMessage({ text: "Rahul — AI VARSH Specialist\n● Online", sender: 'system', action: 'HANDOFF' });
        addMessage({ text: "Hi, I'm Rahul from the AI VARSH team. I've received your requirement. Let me help you.", sender: 'ai' });
      }, 1500);
    }
  };

  // -------------------------------------------------------------
  // BUSINESS AUTOMATION FLOW (Booking)
  // -------------------------------------------------------------
  const handleBookingFlow = async (text: string) => {
    if (bookingState.step === 'name') {
      setBookingState(prev => ({ ...prev, name: text, step: 'company' }));
      setTimeout(() => addMessage({ text: `Thanks ${text}. What's your company name?`, sender: 'ai' }), 400);
      addLog("Collected customer name");
    } 
    else if (bookingState.step === 'company') {
      setBookingState(prev => ({ ...prev, company: text, step: 'email' }));
      setTimeout(() => addMessage({ text: `Great. What's the best email to send the confirmation to?`, sender: 'ai' }), 400);
      addLog("Collected company name");
    }
    else if (bookingState.step === 'email') {
      const email = text.trim();
      setBookingState(prev => ({ ...prev, email: email, step: 'done' }));
      addLog("Collected email address");
      
      // Execute Final Automations
      setIsTyping(true);
      
      const details = {
        customerName: bookingState.name || 'Demo User',
        companyName: bookingState.company || 'Demo Corp',
        email: email,
        date: bookingState.date || '15 October 2026',
        time: bookingState.time || '2:00 PM',
        reference: `AV-2026-${Math.floor(Math.random()*10000)}`
      };

      // 1. Calendar Event
      addLog("Executing Google Calendar API...");
      await createCalendarEvent(googleConnected ? 'real-token' : 'simulated-token', {
        title: `AI VARSH Demo — ${details.companyName}`,
        date: details.date,
        time: details.time,
        email: details.email,
        description: "Customer booked through WhatsApp Demo"
      });
      addLog("✓ Calendar event created");
      setActiveNodes(prev => [...new Set([...prev, 'Calendar Event Created'])]);

      // 2. Generate PDF
      addLog("Generating Proforma Invoice PDF...");
      const pdf = generateBookingPDF(details);
      // For demo, we just get datauristring
      const pdfBase64 = pdf.output('datauristring');
      addLog("✓ PDF generated");
      setActiveNodes(prev => [...new Set([...prev, 'PDF Generated'])]);

      // 3. Send Email
      addLog("Executing Gmail API...");
      const emailBody = `Hello ${details.customerName},\n\nYour AI VARSH demonstration has been scheduled.\nDate: ${details.date}\nTime: ${details.time}\n\nRegards,\nAI VARSH`;
      await sendEmail(googleConnected ? 'real-token' : 'simulated-token', details.email, `AI VARSH Demo Confirmation — ${details.reference}`, emailBody, pdfBase64);
      addLog(`✓ Email sent to ${details.email}`);
      setActiveNodes(prev => [...new Set([...prev, 'Email Sent', 'Automation Completed'])]);

      setIsTyping(false);

      // Final Chat Confirmation
      addMessage({ 
        text: `Perfect. Your demo is confirmed! ✅\n\nI've added it to your calendar and sent a confirmation email with the booking PDF to ${email}.`, 
        sender: 'ai',
        action: 'LEAD_CAPTURED',
        metadata: details
      });
    }
  };

  const handleDateSelect = (date: string) => {
    setBookingState(prev => ({ ...prev, date, step: 'time' }));
    addLog(`Date selected: ${date}`);
    addMessage({ text: `Date: ${date}`, sender: 'user' });
    setTimeout(() => {
      addMessage({ text: "Great. Please select an available time.", sender: 'ai', action: 'SHOW_OPTIONS', options: ['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'] });
    }, 400);
  };

  const handleTimeSelect = (time: string) => {
    // We catch this via normal handleSend if options are clicked, so we override it here.
    setBookingState(prev => ({ ...prev, time, step: 'name' }));
    addLog(`Time selected: ${time}`);
    setTimeout(() => {
      addMessage({ text: "Perfect. May I have your name?", sender: 'ai' });
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAF9] font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Change Automation
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black text-gray-900 tracking-tight">AI VARSH Chat</h1>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
            WhatsApp Automation Simulation
          </div>
        </div>
        <div className="w-32 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">{industry}</div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Center Chat */}
        <div className="flex-1 flex flex-col relative bg-[#EFEAE2] border-r border-gray-200">
          <div className="absolute inset-0 opacity-40 bg-[url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-solid-color-whatsapp-backgrounds-whatsapp-dark-whatsapp-patterns-whatsapp.jpg')] mix-blend-multiply pointer-events-none" style={{ backgroundSize: '400px' }}></div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative z-10 custom-scrollbar">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'} w-full`}>
                  {msg.sender === 'system' ? (
                    <div className="my-4 bg-indigo-50 text-indigo-700 text-xs font-bold px-4 py-2 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-2 whitespace-pre-line text-center">
                      <CheckCircle2 className="w-4 h-4" /> {msg.text}
                    </div>
                  ) : (
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm relative ${msg.sender === 'user' ? 'bg-[#E7F8DA] rounded-tr-none text-gray-900' : 'bg-white rounded-tl-none text-gray-900 border border-gray-100'}`}>
                      <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                      
                      {msg.sender === 'ai' && msg.action === 'SHOW_CALENDAR' && bookingState.step === 'date' && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5"/> Select Date</div>
                          <div className="grid grid-cols-3 gap-2">
                            {['15 Oct', '16 Oct', '17 Oct', '18 Oct'].map(date => (
                              <button key={date} onClick={() => handleDateSelect(date)} className="bg-white text-indigo-600 text-sm font-semibold py-2 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors">
                                {date}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.sender === 'ai' && msg.options && msg.options.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {msg.options.map(opt => (
                            <button key={opt} onClick={() => bookingState.step === 'time' ? handleTimeSelect(opt) : handleSend(opt)} className="bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors">
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Final Automation Summary Card */}
                      {msg.sender === 'ai' && msg.metadata && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                           <div className="font-bold text-indigo-900 border-b border-gray-200 pb-2 mb-3 text-sm">✓ APPOINTMENT CONFIRMED</div>
                           <div className="text-xs space-y-1 text-gray-600 mb-4">
                             <div><strong>Company:</strong> {msg.metadata.companyName}</div>
                             <div><strong>Contact:</strong> {msg.metadata.customerName}</div>
                             <div><strong>Date:</strong> {msg.metadata.date} at {msg.metadata.time}</div>
                             <div><strong>Email:</strong> {msg.metadata.email}</div>
                             <div><strong>Ref:</strong> {msg.metadata.reference}</div>
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                             <button className="flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 py-1.5 rounded-lg text-xs font-bold"><CalendarIcon className="w-3.5 h-3.5"/> Calendar</button>
                             <button className="flex items-center justify-center gap-1.5 bg-rose-50 text-rose-700 py-1.5 rounded-lg text-xs font-bold"><FileText className="w-3.5 h-3.5"/> PDF Invoice</button>
                           </div>
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

              {/* Streaming Message Bubble */}
              {isStreaming && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start w-full">
                  <div className="max-w-[85%] md:max-w-[70%] bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 text-gray-900">
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {streamingText}
                      <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {isTyping && !isStreaming && (
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
              disabled={!input.trim() || isTyping || isStreaming}
              className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {/* Right Column - Status & Integrations */}
        <div className="hidden lg:flex w-80 bg-white flex-col z-1">
          {/* Integrations */}
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Integrations</h3>
            <div className="space-y-2">
              <button onClick={() => setGoogleConnected(!googleConnected)} className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-sm font-semibold transition-colors ${googleConnected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4"/> Google Calendar</div>
                <div className={`w-2 h-2 rounded-full ${googleConnected ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
              </button>
              <button onClick={() => setGoogleConnected(!googleConnected)} className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-sm font-semibold transition-colors ${googleConnected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4"/> Gmail</div>
                <div className={`w-2 h-2 rounded-full ${googleConnected ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
              </button>
              {!googleConnected && <p className="text-[10px] text-gray-400 mt-1 leading-tight">Currently in simulation mode. Connect to perform real API actions.</p>}
            </div>
          </div>

          {/* Automation Checklist */}
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Automation Status</h3>
            <div className="space-y-2">
              {['AI Chatbot', 'FAQ', 'Booking', 'Calendar Event Created', 'PDF Generated', 'Email Sent', 'Automation Completed'].map((node) => {
                const isActive = activeNodes.includes(node);
                if (!isActive && node !== 'Booking' && node !== 'AI Chatbot' && bookingState.step === 'none') return null; // Hide future steps until needed
                return (
                  <div key={node} className={`flex items-center gap-2.5 py-1 transition-all ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                    {isActive ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0"></div>}
                    <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{node}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Log */}
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Live Event Log</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              <AnimatePresence>
                {logs.map((log) => (
                  <motion.div key={log.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                    <div className="text-[10px] font-bold text-gray-400 shrink-0 mt-0.5">{log.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    <div className="text-xs text-gray-700 font-medium leading-tight">{log.message}</div>
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
