import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

const volumeData = [
  { name: 'Mon', conversations: 340, resolved: 310 },
  { name: 'Tue', conversations: 420, resolved: 395 },
  { name: 'Wed', conversations: 380, resolved: 350 },
  { name: 'Thu', conversations: 450, resolved: 430 },
  { name: 'Fri', conversations: 480, resolved: 460 },
  { name: 'Sat', conversations: 220, resolved: 215 },
  { name: 'Sun', conversations: 190, resolved: 185 },
];

const intentData = [
  { name: 'Support', value: 45 },
  { name: 'Booking', value: 25 },
  { name: 'Pricing', value: 15 },
  { name: 'General', value: 10 },
  { name: 'Complaint', value: 5 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

export default function Analytics() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor AI performance, automation rates, and business ROI.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> Last 7 Days
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-sm font-medium text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Conversations', value: '2,481', trend: '+12.5%', isUp: true },
          { label: 'AI Resolution Rate', value: '92.4%', trend: '+2.1%', isUp: true },
          { label: 'Average Response Time', value: '1.4s', trend: '-0.3s', isUp: true },
          { label: 'Human Handoff Rate', value: '7.6%', trend: '-1.4%', isUp: true },
        ].map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-2">{metric.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-gray-900">{metric.value}</h3>
              <span className={`flex items-center text-sm font-medium ${metric.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${!metric.isUp && 'rotate-180'}`} />
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Conversation Volume vs Resolution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="conversations" stroke="#9CA3AF" fill="none" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke="#4F46E5" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intent Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Intent Distribution</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {intentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {intentData.map((intent, index) => (
              <div key={intent.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-gray-600">{intent.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{intent.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 text-white shadow-lg border border-indigo-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">Business ROI Simulation</h3>
            <p className="text-indigo-200 mb-6">Based on current demo data, here is the estimated business value AI VARSH automation provides.</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-indigo-300 text-sm mb-1">Human Time Saved</p>
                <p className="text-3xl font-bold text-emerald-400">38.3 hrs</p>
                <p className="text-xs text-indigo-200 mt-1">/ month</p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm mb-1">Estimated Cost Savings</p>
                <p className="text-3xl font-bold text-amber-400">₹11,490</p>
                <p className="text-xs text-indigo-200 mt-1">/ month (based on avg support cost)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl w-full md:w-80">
            <h4 className="font-semibold mb-4 text-indigo-100">Adjust Variables</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-indigo-200">Monthly Conversations</span>
                  <span>500</span>
                </div>
                <input type="range" className="w-full accent-indigo-400" min="100" max="5000" defaultValue="500" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-indigo-200">Avg Handling Time (min)</span>
                  <span>5</span>
                </div>
                <input type="range" className="w-full accent-indigo-400" min="1" max="15" defaultValue="5" />
              </div>
              <button className="w-full mt-2 py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                Recalculate ROI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
