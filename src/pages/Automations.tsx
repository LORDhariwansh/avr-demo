import { Play, Plus, Search, Settings, Filter, ArrowRight } from 'lucide-react';

const workflows = [
  { id: 1, name: 'Lead Qualification', status: 'Active', trigger: 'New Message', steps: 4 },
  { id: 2, name: 'Demo Booking', status: 'Active', trigger: 'Intent: BOOKING', steps: 5 },
  { id: 3, name: 'Support Escalation', status: 'Active', trigger: 'Intent: SUPPORT', steps: 3 },
  { id: 4, name: 'Post-Demo Follow-up', status: 'Paused', trigger: 'Meeting Completed', steps: 2 },
];

export default function Automations() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[var(--color-border)] bg-white flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Automation Builder</h1>
          <p className="text-gray-500 mt-1">Design conversational workflows and business logic.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 flex items-center gap-2">
            <Play className="w-4 h-4" /> Run Test
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-sm font-medium text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Create Workflow
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Workflows list */}
        <div className="w-80 border-r border-[var(--color-border)] bg-white flex flex-col">
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search workflows..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {workflows.map(wf => (
              <div key={wf.id} className={`p-4 border-b border-[var(--color-border)] cursor-pointer hover:bg-gray-50 ${wf.id === 2 ? 'bg-indigo-50/50' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-semibold text-sm ${wf.id === 2 ? 'text-indigo-900' : 'text-gray-900'}`}>{wf.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    wf.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {wf.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>Trigger: {wf.trigger}</span>
                  <span>•</span>
                  <span>{wf.steps} steps</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Area: Builder Canvas */}
        <div className="flex-1 bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-50 relative overflow-hidden flex flex-col">
          <div className="absolute top-4 right-4 bg-white border border-[var(--color-border)] rounded-lg shadow-sm p-2 flex gap-2 z-10">
            <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Filter className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Settings className="w-4 h-4" /></button>
          </div>
          
          <div className="flex-1 relative p-12 overflow-auto custom-scrollbar">
            {/* Simple visual representation of nodes for Demo Booking */}
            <div className="flex flex-col items-center max-w-lg mx-auto space-y-6">
              
              <div className="w-64 bg-white border-2 border-indigo-200 rounded-xl p-4 shadow-sm relative text-center">
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Trigger</div>
                <h3 className="font-semibold text-gray-900">New Message</h3>
              </div>
              
              <div className="h-6 w-0.5 bg-gray-300"></div>
              
              <div className="w-64 bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AI Node</div>
                <h3 className="font-semibold text-gray-900">Gemini AI Analysis</h3>
                <div className="text-xs text-gray-400 mt-2">Detect Intent & Extract Entities</div>
              </div>

              <div className="h-6 w-0.5 bg-gray-300"></div>
              
              <div className="w-72 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm relative text-center">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Condition</div>
                <h3 className="font-semibold text-gray-900">Intent = BOOKING?</h3>
              </div>

              <div className="flex gap-16 relative">
                <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gray-300"></div>
                <div className="absolute top-0 left-1/4 w-0.5 h-6 bg-gray-300"></div>
                <div className="absolute top-0 right-1/4 w-0.5 h-6 bg-gray-300"></div>
              </div>

              <div className="w-full flex justify-between mt-6 max-w-[600px]">
                <div className="flex flex-col items-center space-y-6 w-64">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">YES</span>
                  <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <h3 className="font-semibold text-gray-900 mb-1">Open Booking UI</h3>
                    <p className="text-xs text-gray-500">Show available slots</p>
                  </div>
                  <div className="h-6 w-0.5 bg-gray-300"></div>
                  <div className="w-full bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm text-center">
                    <h3 className="font-semibold text-indigo-900 mb-1">Create Appointment</h3>
                    <p className="text-xs text-indigo-700/70">Update Calendar & CRM</p>
                  </div>
                  <div className="h-6 w-0.5 bg-gray-300"></div>
                  <div className="w-full bg-gray-900 text-white rounded-xl p-4 shadow-sm text-center">
                    <h3 className="font-semibold mb-1">Send Confirmation</h3>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-6 w-64">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">NO</span>
                  <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <h3 className="font-semibold text-gray-900 mb-1">Route to intent</h3>
                    <p className="text-xs text-gray-500">Continue evaluation</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
