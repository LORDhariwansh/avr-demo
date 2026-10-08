import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, ArrowRight, Phone, Mail } from 'lucide-react';
import { useAutomationStore } from '../store/automationStore';
import { motion } from 'framer-motion';

const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'DEMO BOOKED', 'PROPOSAL', 'WON'];

export default function Leads() {
  const { leads, contacts } = useAutomationStore();
  const [searchQuery, setSearchQuery] = useState('');

  const getLeadsByStage = (stage: string) => {
    return Object.values(leads).filter(lead => lead.stage === stage);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lead Pipeline</h1>
          <p className="text-gray-500 mt-1">Manage and track leads qualified automatically by AI.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-sm font-medium text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage);
          
          return (
            <div key={stage} className="flex-shrink-0 w-80 flex flex-col bg-gray-50/50 rounded-2xl border border-gray-200/60 p-4">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{stage}</h3>
                <span className="bg-gray-200/70 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {stageLeads.map((lead) => {
                  const contact = contacts[lead.contactId];
                  return (
                    <motion.div 
                      layoutId={lead.id}
                      key={lead.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mb-2
                            ${lead.status === 'HOT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                              lead.status === 'WARM' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                              'bg-blue-50 text-blue-600 border-blue-100'}
                          `}>
                            {lead.status}
                          </div>
                          <h4 className="font-semibold text-gray-900 leading-tight">{contact?.name || 'Unknown'}</h4>
                          <p className="text-xs text-gray-500">{contact?.company}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {lead.requirement && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg mb-3 line-clamp-2">
                          "{lead.requirement}"
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <button className="hover:text-indigo-600"><Phone className="w-3.5 h-3.5" /></button>
                          <button className="hover:text-indigo-600"><Mail className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="flex items-center gap-1 font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
                          Score: {lead.score} <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {stageLeads.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400 font-medium">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
