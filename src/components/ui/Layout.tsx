import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Target, 
  Workflow, 
  Calendar as CalendarIcon, 
  BookOpen, 
  BarChart3, 
  FileText, 
  Layers, 
  Settings,
  Bot
} from 'lucide-react';
import { useAutomationStore } from '../../store/automationStore';

const navigation = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Automations', href: '/automations', icon: Workflow },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Templates', href: '/templates', icon: Layers },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const { unreadCount } = useAutomationStore();
  
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-[var(--color-border)] bg-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight tracking-tight">AI VARSH</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Automation Studio</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {item.name === 'Inbox' && unreadCount > 0 && (
                <span className="ml-auto bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)] bg-gray-50/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-900">Demo Mode</span>
              <span className="text-[10px] text-gray-500">Gemini AI Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-[var(--color-border)] bg-white flex items-center justify-between px-6 z-10">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {/* Simple title for now, could be dynamic based on route */}
            Workspace
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full relative group cursor-help">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-xs font-medium text-amber-700">Simulation Mode</span>
              
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                This interactive environment simulates WhatsApp, CRM and calendar workflows. No external WhatsApp account is connected.
              </div>
            </div>
            
            <div className="w-px h-6 bg-gray-200"></div>
            <button className="text-gray-500 hover:text-gray-700">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <span className="text-xs font-medium text-gray-600">AI</span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[var(--color-background)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
