import { Play, Copy, ArrowRight, MessageSquare, Calendar, Target, HeadphonesIcon } from 'lucide-react';

const templates = [
  { 
    id: 1, 
    title: 'Customer Support', 
    description: 'Automatically route and answer common customer queries using your Knowledge Base.',
    icon: HeadphonesIcon,
    color: 'bg-blue-100 text-blue-600',
    tags: ['Support', 'FAQ']
  },
  { 
    id: 2, 
    title: 'Lead Generation', 
    description: 'Engage visitors, ask qualifying questions, and automatically score leads in the CRM.',
    icon: Target,
    color: 'bg-emerald-100 text-emerald-600',
    tags: ['Sales', 'CRM']
  },
  { 
    id: 3, 
    title: 'Appointment Booking', 
    description: 'Allow customers to view available slots and book meetings directly in chat.',
    icon: Calendar,
    color: 'bg-purple-100 text-purple-600',
    tags: ['Scheduling', 'Calendar']
  },
  { 
    id: 4, 
    title: 'Post-Demo Follow-Up', 
    description: 'Automatically send a summary and next steps after a meeting is completed.',
    icon: MessageSquare,
    color: 'bg-amber-100 text-amber-600',
    tags: ['Follow Up', 'Sales']
  },
];

export default function Templates() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Automation Templates</h1>
          <p className="text-gray-500 mt-1">Start quickly with pre-built, industry-tested workflow templates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.color}`}>
                <template.icon className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Preview"><Play className="w-4 h-4" /></button>
                <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Duplicate"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{template.title}</h3>
            <p className="text-gray-600 text-sm mb-6 flex-1">{template.description}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex gap-2">
                {template.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
              
              <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                Use Template <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
