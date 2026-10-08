import { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Phone, Video, Send, Bot, User, Check, FileText, Calendar, HandIcon } from 'lucide-react';
import { useAutomationStore } from '../store/automationStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAIResponse, type AIResponse } from '../services/gemini';

export default function Inbox() {
  const { 
    conversations, 
    contacts, 
    addMessage, 
    markRead, 
    updateContact, 
    createLead, 
    updateLeadScore,
    bookAppointment
  } = useAutomationStore();
  
  const [activeContactId, setActiveContactId] = useState<string>('c1');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAiProcess, setActiveAiProcess] = useState<AIResponse | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations[activeContactId];
  const activeContact = contacts[activeContactId];
  
  // Calculate lead score safely
  const leads = useAutomationStore(state => state.leads);
  const leadId = Object.keys(leads).find(id => leads[id].contactId === activeContactId);
  const leadScore = leadId ? leads[leadId].score : 50;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activeContactId) {
      markRead(activeContactId);
      setActiveAiProcess(null);
      setShowBooking(false);
    }
  }, [activeConversation?.messages.length, activeContactId, markRead]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userText = inputText;
    setInputText('');
    
    // Add user message
    addMessage(activeContactId, {
      contactId: activeContactId,
      text: userText,
      sender: 'user',
      status: 'sent'
    });
    
    setIsTyping(true);
    
    // Format history for Gemini
    const history = activeConversation?.messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text
    })) || [];
    
    try {
      const response = await generateAIResponse(userText, history);
      setIsTyping(false);
      setActiveAiProcess(response);
      
      // Update CRM state based on AI response
      if (response.entities) {
        updateContact(activeContactId, {
          ...(response.entities.name && { name: response.entities.name }),
          ...(response.entities.company && { company: response.entities.company }),
          ...(response.entities.industry && { industry: response.entities.industry }),
        });
      }
      
      if (response.leadScoreModifier) {
        updateLeadScore(activeContactId, Math.min(100, leadScore + response.leadScoreModifier));
      }

      if (response.intent === 'LEAD' && !leadId) {
        createLead({
          contactId: activeContactId,
          score: 60,
          status: 'WARM',
          stage: 'NEW',
          source: 'AI VARSH Chat',
          requirement: response.entities?.requirement
        });
      }
      
      // Add AI response message
      addMessage(activeContactId, {
        contactId: activeContactId,
        text: response.reply,
        sender: 'ai',
        status: 'delivered'
      });
      
      // Trigger actions
      if (response.action === 'START_BOOKING') {
        setTimeout(() => setShowBooking(true), 1000);
      }
      
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      addMessage(activeContactId, {
        contactId: activeContactId,
        text: "I'm currently experiencing technical difficulties. Let me connect you with a human agent.",
        sender: 'ai',
        status: 'delivered'
      });
    }
  };

  const handleBook = () => {
    bookAppointment({
      contactId: activeContactId,
      topic: 'AI VARSH Demo',
      date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
      time: '14:00'
    });
    setShowBooking(false);
    
    addMessage(activeContactId, {
      contactId: activeContactId,
      text: "✓ Your AI VARSH demo is confirmed for tomorrow at 2:00 PM. We'll see you then!",
      sender: 'ai',
      status: 'delivered'
    });
    updateLeadScore(activeContactId, 95); // High score for booking
  };

  return (
    <div className="flex h-full bg-white relative">
      {/* Sidebar: Conversation List */}
      <div className="w-80 border-r border-[var(--color-border)] flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {Object.values(conversations).map((convo) => {
            const contact = contacts[convo.contactId];
            const lastMsg = convo.messages[convo.messages.length - 1];
            const isActive = activeContactId === convo.contactId;
            
            return (
              <div 
                key={convo.contactId}
                onClick={() => setActiveContactId(convo.contactId)}
                className={`p-4 border-b border-[var(--color-border)] cursor-pointer transition-colors relative overflow-hidden
                  ${isActive ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}
                `}
              >
                {isActive && (
                  <motion.div layoutId="activeIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                )}
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-semibold text-sm ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>
                    {contact?.name || 'Unknown'}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {format(new Date(lastMsg?.timestamp || Date.now()), 'HH:mm')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate pr-4">
                    {lastMsg?.text || 'No messages yet'}
                  </p>
                  {convo.unreadCount > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeContactId ? (
        <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
          {/* Chat Header */}
          <div className="h-16 px-6 bg-white border-b border-[var(--color-border)] flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {activeContact?.avatar || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 leading-tight">{activeContact?.name || 'Unknown'}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{activeContact?.company}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    AI Assistant Active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-gray-400">
              <button className="hover:text-indigo-600 transition-colors"><Video className="w-5 h-5" /></button>
              <button className="hover:text-indigo-600 transition-colors"><Phone className="w-5 h-5" /></button>
              <div className="w-px h-6 bg-gray-200"></div>
              <button className="hover:text-gray-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {activeConversation?.messages.map((msg) => {
                const isAI = msg.sender === 'ai';
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex gap-3 max-w-[70%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
                      {isAI && (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-1">
                        <div 
                          className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                            isAI 
                              ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm' 
                              : 'bg-indigo-600 text-white rounded-tr-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              
              {showBooking && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm w-80">
                    <h4 className="font-bold text-gray-900 mb-2">Schedule a Demo</h4>
                    <p className="text-sm text-gray-500 mb-4">Select a convenient time for our automation experts to show you the platform.</p>
                    <button 
                      onClick={handleBook}
                      className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Confirm Tomorrow at 2:00 PM
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-6 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
            {['Explore Services', 'Pricing', 'Book a Demo'].map((reply) => (
              <button
                key={reply}
                onClick={() => setInputText(reply)}
                className="whitespace-nowrap px-4 py-1.5 bg-white border border-indigo-100 hover:border-indigo-300 text-indigo-600 hover:bg-indigo-50 rounded-full text-xs font-medium transition-colors shadow-sm"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent py-3 px-2 text-sm focus:outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Right Panel: AI Processing & Context */}
      <div className="w-80 border-l border-[var(--color-border)] bg-white flex flex-col overflow-y-auto">
        <div className="p-5 border-b border-[var(--color-border)] bg-gray-900 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              AI PROCESSING
            </h3>
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-500/30">
              LIVE
            </span>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Message received', active: isTyping || !!activeAiProcess },
              { label: `Intent identified: ${activeAiProcess?.intent || '...'}`, active: !!activeAiProcess },
              { label: 'Context analyzed', active: !!activeAiProcess },
              { label: `Action selected: ${activeAiProcess?.action || '...'}`, active: !!activeAiProcess },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-3 text-xs ${step.active ? 'opacity-100' : 'opacity-30'}`}>
                {step.active ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-600" />
                )}
                <span className={step.active ? 'text-gray-200' : 'text-gray-500'}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">AI Confidence</div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-emerald-400 leading-none">
                {activeAiProcess?.confidence || '--'}%
              </span>
              <span className="text-xs text-gray-300 mb-0.5">
                {activeAiProcess?.confidence ? (activeAiProcess.confidence > 80 ? 'High confidence' : 'Medium confidence') : 'Waiting...'}
              </span>
            </div>
            {activeAiProcess?.confidence && activeAiProcess.confidence < 70 && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                <HandIcon className="w-3 h-3" /> Human assistance recommended
              </div>
            )}
          </div>
        </div>

        {activeContact && (
          <div className="p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Lead Profile</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-bold">
                  {leadScore > 80 ? '🔥 HOT LEAD' : leadScore > 50 ? '🌟 WARM LEAD' : '❄️ COLD LEAD'}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Lead Score</div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-1 overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${leadScore}%` }}
                    className="bg-gradient-to-r from-amber-400 to-rose-500 h-2 rounded-full absolute left-0 top-0"
                  />
                </div>
                <div className="text-right text-xs font-bold text-gray-700">{leadScore}/100</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs">Industry</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{activeContact.industry || 'Unknown'}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-xs">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeAiProcess?.tags?.map((tag) => (
                      <span key={tag} className="text-[9px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    )) || <span className="text-xs text-gray-400">None yet</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
