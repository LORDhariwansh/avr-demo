import { useState } from 'react';
import { FileText, Download, Share2, Printer, RefreshCw } from 'lucide-react';
import { useAutomationStore } from '../store/automationStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reports() {
  const { conversations, leads, appointments } = useAutomationStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const totalConvos = Object.keys(conversations).length;
  const resolvedAI = Object.values(conversations).filter(c => c.status === 'resolved' || c.status === 'active').length;
  const totalLeads = Object.keys(leads).length;
  const totalBookings = Object.keys(appointments).length;
  const automationRate = totalConvos ? Math.round((resolvedAI / totalConvos) * 100) : 0;
  const timeSaved = (resolvedAI * 5) / 60; // 5 mins per conversation

  const handleGenerate = () => {
    setIsGenerating(true);
    setShowReport(false);
    setTimeout(() => {
      setIsGenerating(false);
      setShowReport(true);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Business Reports</h1>
          <p className="text-gray-500 mt-1">Generate performance reports based on your current demo state.</p>
        </div>
        
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-2.5 bg-indigo-600 text-sm font-bold text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Generate Report
        </button>
      </div>

      <div className="flex-1 bg-gray-50 rounded-2xl border border-[var(--color-border)] p-8 flex items-start justify-center overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {!showReport && !isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="text-center mt-20"
            >
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Report Generated</h3>
              <p className="text-gray-500 max-w-md mx-auto">Click the button above to generate a comprehensive report of your current automation statistics and ROI.</p>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="text-center mt-20"
            >
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-lg font-bold text-gray-900">Compiling Data...</h3>
              <p className="text-sm text-gray-500 mt-2">Analyzing conversations, intents, and outcomes.</p>
            </motion.div>
          )}

          {showReport && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 w-full max-w-3xl"
            >
              <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI VARSH AUTOMATION REPORT</h2>
                  <p className="text-gray-500 mt-1">Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Printer className="w-5 h-5" /></button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Share2 className="w-5 h-5" /></button>
                  <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Download className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Executive Summary</h3>
                  <p className="text-gray-700 leading-relaxed">
                    During this session, AI VARSH successfully managed customer communications with a <span className="font-bold text-indigo-700">{automationRate}% automation rate</span>. 
                    The system successfully captured <span className="font-bold text-indigo-700">{totalLeads} qualified leads</span> and scheduled <span className="font-bold text-indigo-700">{totalBookings} appointments</span> without human intervention, saving an estimated {timeSaved.toFixed(1)} hours of manual handling time.
                  </p>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Total Conversations</p>
                      <p className="text-2xl font-bold text-gray-900">{totalConvos + 2479} <span className="text-xs font-normal text-gray-400">(demo simulated)</span></p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">AI Resolved</p>
                      <p className="text-2xl font-bold text-emerald-600">{resolvedAI + 2290}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Leads Generated</p>
                      <p className="text-2xl font-bold text-gray-900">{totalLeads + 184}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Appointments Booked</p>
                      <p className="text-2xl font-bold text-gray-900">{totalBookings + 47}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Operational Impact</h3>
                  <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-indigo-900">Estimated Human Time Saved</span>
                      <span className="text-xl font-bold text-indigo-700">38.4 Hours</span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2 mb-4">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <p className="text-sm text-indigo-800">
                      By automating {automationRate || 92}% of inquiries, your team can focus entirely on closing qualified deals and handling complex support issues.
                    </p>
                  </div>
                </section>
              </div>
              
              <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
                Generated by AI VARSH Automation Studio Demo Environment
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
