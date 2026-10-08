import { Bot, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface IntroProps {
  onLaunch: () => void;
}

export default function Intro({ onLaunch }: IntroProps) {
  return (
    <div className="fixed inset-0 bg-[#FAFAF9] flex flex-col items-center justify-center p-6 z-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl text-center flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-200">
          <Bot className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-4 leading-tight">
          AI VARSH
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 tracking-tight mb-8">
          WhatsApp Automation,<br/>
          Powered by AI.
        </h2>

        <div className="flex flex-wrap justify-center gap-3 mb-12 text-sm font-semibold text-gray-500">
          <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500"/> Automate conversations</span>
          <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500"/> Qualify leads</span>
          <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500"/> Book meetings</span>
          <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500"/> Support customers</span>
          <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500"/> Generate insights</span>
        </div>

        <button 
          onClick={onLaunch}
          className="group relative px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 hover:shadow-gray-900/30 flex items-center gap-3"
        >
          Launch Interactive Demo
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-16 flex flex-col items-center gap-2">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            Powered by Gemini AI
          </p>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            Simulation Mode — No WhatsApp API required
          </div>
        </div>
      </motion.div>
    </div>
  );
}
