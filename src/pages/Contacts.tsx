import { Search, Plus, Filter, MoreHorizontal, Mail, Phone, ExternalLink } from 'lucide-react';
import { useAutomationStore } from '../store/automationStore';

export default function Contacts() {
  const { contacts } = useAutomationStore();

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contacts</h1>
          <p className="text-gray-500 mt-1">View and manage your CRM contacts.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-sm font-medium text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Industry</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.values(contacts).map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {contact.avatar || contact.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-900">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{contact.company}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.industry || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <button className="hover:text-indigo-600" title={contact.phone}><Phone className="w-4 h-4" /></button>
                      <button className="hover:text-indigo-600"><Mail className="w-4 h-4" /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-emerald-100">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-gray-400">
                      <button className="p-1.5 hover:bg-gray-100 hover:text-indigo-600 rounded transition-colors"><ExternalLink className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
