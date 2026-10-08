import { Search, Plus, BookOpen, Edit2, Trash2 } from 'lucide-react';

const faqs = [
  { id: 1, question: "How does WhatsApp automation work?", category: "Automation", answer: "Customer messages are analyzed by AI, classified according to intent, answered automatically and routed into business workflows when required." },
  { id: 2, question: "Can I connect my CRM?", category: "Integration", answer: "Yes, AI VARSH integrates with Salesforce, HubSpot, Zoho, and custom CRMs via our webhook architecture." },
  { id: 3, question: "What languages are supported?", category: "AI", answer: "The AI supports over 40 languages including English, Hindi, Hinglish, Spanish, and Arabic natively." },
  { id: 4, question: "How is pricing calculated?", category: "Pricing", answer: "Pricing is based on message volume and the number of active automation workflows. Please contact sales for a custom quote." },
];

export default function KnowledgeBase() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Knowledge Base</h1>
          <p className="text-gray-500 mt-1">Train the AI with your business FAQs and information.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-indigo-600 text-sm font-medium text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search FAQs..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
        />
      </div>

      <div className="space-y-4 overflow-y-auto custom-scrollbar pb-8">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-sm group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md mb-4 ml-11">
              {faq.category}
            </span>
            
            <div className="ml-11 text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
