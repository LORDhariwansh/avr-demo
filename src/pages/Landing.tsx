import { Calendar, Target, MessageSquare, HeadphonesIcon, Workflow, HandIcon, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import type { UseCase, Industry } from '../types';

interface LandingProps {
  onSelect: (useCase: UseCase, industry: Industry) => void;
  selectedIndustry: Industry;
  setIndustry: (ind: Industry) => void;
}

const industries: Industry[] = ['Manufacturing', 'Real Estate', 'Healthcare', 'Education', 'Retail', 'Services'];

const automations = [
  { id: 'support' as UseCase, title: 'AI Customer Support Bot', desc: 'Automatically answer customer questions 24/7.', icon: HeadphonesIcon },
  { id: 'faq' as UseCase, title: 'FAQ Automation Bot', desc: 'Instantly answer frequently asked customer questions.', icon: MessageSquare },
  { id: 'booking' as UseCase, title: 'Appointment Booking Bot', desc: 'Let customers book appointments directly through WhatsApp.', icon: Calendar },
  { id: 'lead' as UseCase, title: 'Lead Generation Bot', desc: 'Convert WhatsApp conversations into qualified leads.', icon: Target },
  { id: 'enquiry' as UseCase, title: 'Order / Enquiry Bot', desc: 'Automatically collect customer requirements and enquiries.', icon: Workflow },
  { id: 'handoff' as UseCase, title: 'Human Handoff Bot', desc: 'Automatically transfer complex conversations to your team.', icon: HandIcon },
  { id: 'followup' as UseCase, title: 'Follow-Up Automation', desc: 'Automatically follow up with customers who don\'t respond.', icon: ArrowRight },
  { id: 'sales' as UseCase, title: 'AI Sales Assistant', desc: 'Answer product questions and help customers make decisions.', icon: UserCheck },
];

export default function Landing({ onSelect, selectedIndustry, setIndustry }: LandingProps) {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-gray-900 pb-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto pt-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-gray-900">
          AI VARSH
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 tracking-tight mb-6">
          WhatsApp Automation <br className="md:hidden" />
          <span className="text-indigo-600">That Works While You Sleep.</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg mb-10">
          See how businesses can automate customer conversations, enquiries, bookings and follow-ups. Choose an automation to experience it in real-time.
        </p>

        {/* Industry Switcher */}
        <div className="flex flex-col items-center mb-16">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Choose Industry Context</p>
          <div className="flex flex-wrap justify-center gap-2">
            {industries.map(ind => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedIndustry === ind 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {automations.map((auto) => (
            <div 
              key={auto.id} 
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group cursor-pointer"
              onClick={() => onSelect(auto.id, selectedIndustry)}
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <auto.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{auto.title}</h3>
              <p className="text-gray-500 text-sm flex-1 mb-6">{auto.desc}</p>
              <button className="w-full py-3 bg-gray-50 text-indigo-600 font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                Try Demo
              </button>
            </div>
          ))}
        </div>

        {/* Full Journey Option */}
        <div className="mt-16 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Want to see everything together?</p>
          <button 
            onClick={() => onSelect('full', selectedIndustry)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-900/30"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            Run Full Customer Journey
          </button>
        </div>

        <div className="mt-20 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            Simulation Mode — No WhatsApp API required
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
            Powered by Google Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}
