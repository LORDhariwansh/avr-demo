import { MessageSquare } from 'lucide-react';
import type { Industry } from '../types';
import { industriesConfig } from '../industries';

interface LandingProps {
  onSelect: (industry: Industry, scenarioId: string) => void;
  selectedIndustry: Industry;
  setIndustry: (ind: Industry) => void;
}

const industries: Industry[] = [
  'Healthcare', 'Real Estate', 'Education', 'Manufacturing', 
  'Retail & E-commerce', 'Hospitality', 'Restaurants', 
  'Automotive', 'Professional Services', 'Logistics'
];

export default function Landing({ onSelect, selectedIndustry, setIndustry }: LandingProps) {
  const currentConfig = industriesConfig[selectedIndustry];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-gray-900 pb-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto pt-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-gray-900">
          AI VARSH
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 tracking-tight mb-6">
          Industry-Specific WhatsApp Automation <br className="md:hidden" />
          <span className="text-indigo-600">That Works While You Sleep.</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg mb-10">
          Select your industry to see how the chatbot adapts its personality, knowledge, and automation logic.
        </p>

        {/* Industry Switcher */}
        <div className="flex flex-col items-center mb-16">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Choose Industry Context</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
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
        
        {/* Industry Info */}
        <div className="mb-10 p-6 bg-indigo-50 rounded-2xl max-w-2xl mx-auto border border-indigo-100">
          <h3 className="text-2xl font-bold text-indigo-900 mb-2">{currentConfig.businessName}</h3>
          <p className="text-indigo-700">{currentConfig.description}</p>
          <p className="text-indigo-600 text-sm mt-2 font-medium">Bot Personality: {currentConfig.botPersonality}</p>
        </div>
      </div>

      {/* Grid for Scenarios */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentConfig.scenarios.map((scenario) => (
            <div 
              key={scenario.id} 
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group cursor-pointer"
              onClick={() => onSelect(selectedIndustry, scenario.id)}
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{scenario.title}</h3>
              <p className="text-gray-500 text-sm flex-1 mb-6">{scenario.description}</p>
              <button className="w-full py-3 bg-gray-50 text-indigo-600 font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                Run Scenario
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            Simulation Mode - No WhatsApp API required
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
            Powered by Google Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}
