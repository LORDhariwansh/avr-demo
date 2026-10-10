import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, CheckCheck, CheckCircle2, Calendar as CalendarIcon, FileText, Mail } from 'lucide-react';
import type { Industry, Message, AutomationLog, BookingData, ConversationState } from '../types';
import { generateAIResponse } from '../services/gemini';
import { createCalendarEvent, sendEmail } from '../services/google';
import { generateBookingPDF } from '../services/pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { industriesConfig } from '../industries';

interface SimulatorProps {
  industry: Industry;
  scenarioId: string;
  onBack: () => void;
  onIndustryChange: (ind: Industry) => void;
}

const industriesList: Industry[] = [
  'Healthcare', 'Real Estate', 'Education', 'Manufacturing', 
  'Retail & E-commerce', 'Hospitality', 'Restaurants', 
  'Automotive', 'Professional Services', 'Logistics'
];

export default function Simulator({ industry, scenarioId, onBack, onIndustryChange }: SimulatorProps) {
  const config = industriesConfig[industry];
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeNodes, setActiveNodes] = useState<string[]>(['AI Chatbot']);
  
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [conversationState, setConversationState] = useState<ConversationState>('idle');

  const [googleConnected, setGoogleConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation based on industry and scenario
  useEffect(() => {
    // Reset state on industry/scenario change
    setMessages([]);
    setLogs([]);
    setBookingData({});
    setConversationState('idle');
    setActiveNodes(['AI Chatbot']);

    const scenario = config.scenarios.find(s => s.id === scenarioId) || config.scenarios[0];
    
    // Add welcome message from bot
    addMessage({
      text: config.welcomeMessage,
      sender: 'ai',
      options: config.quickReplies
    });

    // Automatically send the scenario's initial message after a short delay
    if (scenario) {
      setTimeout(() => {
        handleSend(scenario.initialMessage, true);
      }, 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industry, scenarioId]);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, { id: Math.random().toString(), time: new Date(), message: msg }]);
  };

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: Math.random().toString(), timestamp: new Date() }]);
  };

  const executeAction = async (action: string) => {
    if (action === 'SHOW_CALENDAR') {
      setActiveNodes(prev => [...new Set([...prev, 'Calendar App'])]);
      addLog("System: Triggered calendar widget via webhook");
      setConversationState('selecting_date');
    }
    else if (action === 'LEAD_CAPTURED') {
      setActiveNodes(prev => [...new Set([...prev, 'CRM System'])]);
      addLog("Integration: Pushed new lead data to CRM");
    }
    else if (action === 'HANDOFF') {
      setActiveNodes(prev => [...new Set([...prev, 'Human Agent'])]);
      addLog("Routing: Transferred chat session to Human Agent Support Queue");
    }
    else if (action === 'START_BOOKING') {
       executeAction('SHOW_CALENDAR');
    }
  };

  const handleSend = async (text: string, isScenarioInit = false, isQuickReply = false) => {
    if (!text.trim()) return;
    
    addMessage({ text, sender: 'user' });
    
    setInput('');
    setIsTyping(true);
    addLog(`Received user message: "${text}"`);
    setActiveNodes(['AI Chatbot']);
    
    const lowerText = text.trim().toLowerCase();
    const ackWords = ["okay", "ok", "thanks", "thank you", "great", "perfect", "got it", "cool", "done", "understood"];
    
    if (!isScenarioInit && ackWords.includes(lowerText)) {
      setIsTyping(false);
      let replyText = "You're welcome! Let me know if you need anything else.";
      if (conversationState === 'booking_confirmed') {
        replyText = "You're all set! Your booking details are available above. Let me know if you'd like help with anything else.";
      } else if (conversationState === 'selecting_date' || conversationState === 'selecting_time' || conversationState === 'collecting_lead' || conversationState === 'collecting_booking_details') {
        replyText = "Could you please provide the requested information to proceed?";
      }

      addMessage({ text: replyText, sender: 'ai' });
      addLog("System: Handled acknowledgement locally based on state.");
      return;
    }

    // Check for industry-specific FAQ match before invoking Gemini ONLY for quick replies
    if (isQuickReply) {
      const industryFaqs = config.faqs || {};
      const matchedKey = Object.keys(industryFaqs).find(key => lowerText.includes(key.toLowerCase()));
      
      if (matchedKey) {
        if (import.meta.env.DEV) {
           console.group("Diagnostics");
           console.log(`Request ID: ${Math.random().toString(36).substring(7)}`);
           console.log(`Industry ID: ${config.id}`);
           console.log(`Automation ID: Demo`);
           console.log(`Message type: ${text ? 'typed message' : 'quick-reply button'}`);
           console.log(`Knowledge match found: true (${matchedKey})`);
           console.log(`Gemini request attempted: skipped`);
           console.log(`Selected action: NONE`);
           console.log(`Final response intent: FAQ_ANSWER`);
           console.groupEnd();
        }
        const answer = industryFaqs[matchedKey];
        setIsTyping(false);
        addMessage({ text: answer, sender: 'ai' });
        addLog(`System: Served FAQ locally for "${matchedKey}".`);
        return;
      }
    }

    // Capture current messages snapshot for the AI (including the one just added)
    const snapshot = [...messages, { id: Math.random().toString(), timestamp: new Date(), text, sender: 'user' as const }];

    try {
      const responseData = await generateAIResponse(snapshot, config, conversationState, bookingData);
      
      setIsTyping(false);

      if (import.meta.env.DEV) {
         console.group("Diagnostics");
         console.log(`Request ID: ${Math.random().toString(36).substring(7)}`);
         console.log(`Industry ID: ${config.id}`);
         console.log(`Automation ID: Demo`);
         console.log(`Message type: ${text ? 'typed message' : 'quick-reply button'}`);
         console.log(`Knowledge match found: false`);
         console.log(`Gemini request attempted: true`);
         console.log(`Response parsing success: ${responseData.intent !== 'ERROR'}`);
         console.log(`Selected action: ${responseData.action}`);
         console.log(`Final response intent: ${responseData.intent}`);
         console.groupEnd();
      }

      // Extract entities to bookingData
      if (responseData.entities) {
         setBookingData((prev: BookingData) => ({ ...prev, ...responseData.entities }));
      }

      // Email validation
      if (responseData.entities && responseData.entities.email) {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(responseData.entities.email)) {
            // Revert state change and ask again
            addMessage({ text: "That doesn't look like a valid email address. Could you please share your email, for example name@example.com?", sender: 'ai' });
            return;
         }
      }

      setConversationState(responseData.nextState);
      
      const action = responseData.action !== 'NONE' ? responseData.action : undefined;
      const options = responseData.suggestedReplies && responseData.suggestedReplies.length > 0 
        ? responseData.suggestedReplies 
        : (action === 'SHOW_OPTIONS' ? config.quickReplies.slice(0, 3) : undefined);
      
      addMessage({ 
        text: responseData.reply, 
        sender: 'ai', 
        action: action as any,
        options: options
      });

      addLog(`AI Intent Parsed: ${responseData.intent}`);
      if (action) {
         addLog(`AI triggered action: ${action}`);
         executeAction(action);
      }
    } catch (e) {
      setIsTyping(false);
      
      if (import.meta.env.DEV) {
         console.group("Diagnostics (Error)");
         console.log(`Industry ID: ${config.id}`);
         console.log(`Gemini HTTP/API error or parsing failure:`, e);
         console.groupEnd();
      }

      console.error(e);
      addMessage({ text: "I'm having trouble generating a response right now. Your existing booking details are preserved. Would you like to try again?", sender: 'system' });
    }
  };

  const handleBookingSubmit = async () => {
    if (conversationState !== 'booking_pending') return;
    
    addLog("Booking complete. Generating PDF invoice...");
    setActiveNodes(prev => [...new Set([...prev, 'PDF Generator'])]);
    
    try {
      const doc = await generateBookingPDF({
        customerName: bookingData.name || 'Customer',
        companyName: bookingData.company || 'N/A',
        email: bookingData.email || 'customer@example.com',
        date: bookingData.date || 'TBD',
        time: bookingData.time || 'TBD',
        reference: 'REF-' + Math.floor(Math.random() * 10000)
      });
      const pdfUrl = doc.output('bloburl').toString();

      addMessage({
        text: "Booking confirmed! Here is your confirmation document.",
        sender: 'ai',
        metadata: { file: pdfUrl, fileName: 'Booking_Confirmation.pdf' }
      });
      addLog("PDF generated successfully.");

      setConversationState('booking_confirmed');

      if (googleConnected) {
        setActiveNodes(prev => [...new Set([...prev, 'Google Calendar', 'Gmail'])]);
        addLog("Syncing with Google Calendar...");
        const calResult = await createCalendarEvent('simulated-token', {
          title: 'Meeting with ' + bookingData.name,
          date: bookingData.date!,
          time: bookingData.time!
        });
        
        if (calResult) {
          addLog("Calendar event created successfully.");
        }
        
        addLog("Sending confirmation email...");
        if (!bookingData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) {
          addLog("Error: Invalid email address. Email not sent.");
        } else {
          await sendEmail('simulated-token', bookingData.email, 'Booking Confirmation', 'Your booking is confirmed.', pdfUrl);
          addLog("Email sent successfully.");
        }
        addLog("Google Workspace sync complete.");
      } else {
        addLog("Your demo booking has been recorded in the simulator. Calendar and email actions are simulated.");
        addMessage({
          text: "Your demo booking has been recorded in the simulator. Calendar and email actions are simulated.",
          sender: 'system'
        });
      }
    } catch (e) {
      addLog("Failed to generate PDF or complete booking external actions.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAF9] font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Scenarios
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black text-gray-900 tracking-tight">{config.businessName}</h1>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {config.botName} Online
          </div>
        </div>
        <div>
          <select 
            value={industry} 
            onChange={(e) => onIndustryChange(e.target.value as Industry)}
            className="text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {industriesList.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Center Chat */}
        <div className="flex-1 flex flex-col relative bg-[#EFEAE2] border-r border-gray-200">
          <div className="absolute inset-0 opacity-40 bg-[url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-solid-color-whatsapp-backgrounds-whatsapp-dark-whatsapp-patterns-whatsapp.jpg')] mix-blend-multiply pointer-events-none" style={{ backgroundSize: '400px' }}></div>
          
          <div className="flex-1 overflow-y-auto p-4 z-10 space-y-4">
            {/* Date Badge */}
            <div className="flex justify-center mb-6 mt-2">
              <span className="bg-white/80 backdrop-blur-sm text-gray-600 text-xs font-semibold px-3 py-1 rounded-lg shadow-sm">
                Today
              </span>
            </div>

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm relative ${
                    msg.sender === 'user' 
                      ? 'bg-[#E7FFDB] text-gray-900 rounded-tr-none' 
                      : msg.sender === 'system'
                        ? 'bg-amber-100 text-amber-900 mx-auto text-center font-mono text-xs'
                        : 'bg-white text-gray-900 rounded-tl-none'
                  }`}>
                    
                    {msg.sender === 'ai' && (
                      <div className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider uppercase">
                        {config.botName}
                      </div>
                    )}
                    
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                    
                    {/* Attachments */}
                    {msg.metadata?.file && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">{msg.metadata.fileName}</div>
                          <div className="text-xs text-gray-500">PDF Document</div>
                        </div>
                      </div>
                    )}

                    {/* Quick Replies Options within AI Message */}
                    {msg.options && (
                      <div className="mt-3 flex flex-col gap-2">
                        {msg.options.map(opt => (
                          <button 
                            key={opt}
                            onClick={() => handleSend(opt, false, true)}
                            className="bg-indigo-50 border border-indigo-100 text-indigo-700 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-indigo-600 hover:text-white transition-all text-left shadow-sm hover:shadow-md"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.sender === 'user' ? 'text-gray-500 justify-end' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-[#F0F2F5] z-10">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Type a message..."
                className="flex-1 py-3 px-4 rounded-full border-none focus:ring-0 shadow-sm text-gray-900 bg-white"
                disabled={isTyping}
              />
              <button 
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 shadow-sm transition-colors"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Workflow Logic */}
        <div className="w-80 bg-white flex flex-col shadow-xl z-20">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-black text-gray-900 mb-1 text-lg">Active Workflow</h3>
            <p className="text-xs text-gray-500 font-medium">Real-time automation path</p>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {['WhatsApp API', 'AI Chatbot', 'CRM System', 'Calendar App', 'PDF Generator', 'Human Agent'].map((node, i) => {
              const isActive = activeNodes.includes(node);
              return (
                <div key={node} className="relative">
                  {i !== 0 && (
                    <div className={`absolute -top-4 left-5 w-0.5 h-4 ${isActive ? 'bg-indigo-500' : 'bg-gray-100'}`}></div>
                  )}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isActive 
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                      : 'border-gray-100 opacity-50'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isActive ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                    </div>
                    <span className={`font-bold text-sm ${isActive ? 'text-indigo-900' : 'text-gray-500'}`}>{node}</span>
                  </div>
                </div>
              );
            })}

            {/* Interactive Custom Actions (e.g. Booking steps) */}
            {conversationState !== 'idle' && (
              <div className="mt-8 p-5 bg-gray-900 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-amber-400" />
                  Integration Required
                </h4>
                
                {conversationState === 'selecting_date' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">Select Date:</p>
                    <input type="date" className="w-full bg-gray-800 border-gray-700 rounded-lg text-sm p-2 text-white" 
                      onChange={(e) => { setBookingData((prev: BookingData) => ({ ...prev, date: e.target.value })); setConversationState('selecting_time'); }} />
                  </div>
                )}
                {conversationState === 'selecting_time' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">Select Time:</p>
                    <select className="w-full bg-gray-800 border-gray-700 rounded-lg text-sm p-2 text-white" 
                      onChange={(e) => { setBookingData((prev: BookingData) => ({ ...prev, time: e.target.value })); setConversationState('collecting_lead'); }}>
                      <option value="">Choose...</option>
                      <option>10:00 AM</option>
                      <option>02:00 PM</option>
                    </select>
                  </div>
                )}
                {conversationState === 'collecting_lead' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">Full Name:</p>
                    <input type="text" className="w-full bg-gray-800 border-gray-700 rounded-lg text-sm p-2 text-white" 
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter') {
                          setBookingData((prev: BookingData) => ({ ...prev, name: e.currentTarget.value }));
                          setConversationState('booking_pending');
                        }
                      }} />
                  </div>
                )}
                
                {conversationState === 'booking_pending' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-400/10 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Data Captured
                    </div>
                    <button onClick={handleBookingSubmit} className="w-full py-2 bg-white text-gray-900 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
                      Process Automation
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Google Services Connector Toggle */}
            <div className="mt-4 p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between cursor-pointer" onClick={() => setGoogleConnected(!googleConnected)}>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
                   <Mail className="w-4 h-4 text-blue-600" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-gray-900">Google Workspace</p>
                   <p className="text-[10px] text-gray-500">Calendar & Gmail</p>
                 </div>
               </div>
               <div className={`w-10 h-5 rounded-full p-1 transition-colors ${googleConnected ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                 <div className={`w-3 h-3 bg-white rounded-full transition-transform ${googleConnected ? 'translate-x-5' : 'translate-x-0'}`}></div>
               </div>
            </div>
          </div>

          <div className="h-48 border-t border-gray-100 bg-gray-50 p-4 overflow-y-auto flex flex-col-reverse">
            <div className="space-y-1">
              {logs.map(log => (
                <div key={log.id} className="text-[10px] font-mono text-gray-500 flex gap-2">
                  <span className="text-gray-400">{log.time.toLocaleTimeString([], { hour12: false })}</span>
                  <span className={log.message.includes('Error') ? 'text-red-500' : ''}>{log.message}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="text-[10px] font-mono text-gray-400 italic">Waiting for events...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

