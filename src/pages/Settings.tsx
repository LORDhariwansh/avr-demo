import { Settings as SettingsIcon, Save, Bot, Key, Globe, Bell } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your AI workspace and integrations.</p>
        </div>
        
        <button className="px-6 py-2 bg-indigo-600 text-sm font-bold text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          {[
            { name: 'AI Configuration', icon: Bot, active: true },
            { name: 'API Keys', icon: Key, active: false },
            { name: 'Business Profile', icon: Globe, active: false },
            { name: 'Notifications', icon: Bell, active: false },
            { name: 'General', icon: SettingsIcon, active: false },
          ].map(item => (
            <button 
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                item.active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-bold text-gray-900">AI Configuration</h3>
              <p className="text-sm text-gray-500">Manage the core AI engine powering your automation.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">AI Provider</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option>Google Gemini AI</option>
                  <option>Custom Model</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Model Version</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option>Gemini 3.8 Flash (Recommended)</option>
                  <option>Gemini 3.5 Flash Lite</option>
                  <option>Gemini 3.1 Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">System Personality & Tone</label>
                <textarea 
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  defaultValue="You are the AI VARSH Automation Assistant. You are a highly professional, concise, and friendly AI handling customer inquiries."
                ></textarea>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div>
                  <h4 className="font-semibold text-emerald-900 text-sm">Connection Status</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">Gemini AI is connected and active in simulation mode.</p>
                </div>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
