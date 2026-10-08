import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, Users, Calendar as CalendarIcon, TrendingUp, HandIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

const stats = [
  { name: 'Messages Handled', value: 2481, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'AI Resolution Rate', value: 92.4, suffix: '%', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { name: 'Qualified Leads', value: 184, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { name: 'Appointments', value: 47, icon: CalendarIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
  { name: 'Conversion Rate', value: 18.7, suffix: '%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
  { name: 'Human Handoffs', value: 23, icon: HandIcon, color: 'text-rose-600', bg: 'bg-rose-100' },
];

function CountUp({ end, suffix = '', decimals = 0 }: { end: number, suffix?: string, decimals?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return <span>{count.toFixed(decimals)}{suffix}</span>;
}

const nodes = [
  { id: 'msg', label: 'Customer Message', x: 50, y: 50 },
  { id: 'ai', label: 'Gemini AI', x: 250, y: 50 },
  { id: 'intent', label: 'Intent Detection', x: 450, y: 50 },
  { id: 'kb', label: 'Knowledge Base', x: 650, y: -20 },
  { id: 'lead', label: 'Lead Qualification', x: 650, y: 50 },
  { id: 'book', label: 'Booking', x: 650, y: 120 },
  { id: 'crm', label: 'CRM / Actions', x: 850, y: 50 },
];

export default function Overview() {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % nodes.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Automation Overview</h1>
        <p className="text-gray-500 mt-1">See how AI handles customer conversations and business workflows.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={stat.name} 
            className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                <CountUp end={stat.value} suffix={stat.suffix} decimals={stat.suffix ? 1 : 0} />
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
        <h3 className="text-lg font-bold text-gray-900 mb-8">Live Automation Status</h3>
        
        <div className="relative h-64 overflow-hidden rounded-xl bg-gray-50/50 border border-gray-100">
          <div className="absolute inset-0 flex items-center overflow-x-auto px-12 custom-scrollbar">
            <div className="relative flex items-center min-w-[900px] h-full py-12">
              {/* Connecting Lines */}
              <div className="absolute top-1/2 left-16 right-[200px] h-0.5 bg-gray-200 -translate-y-1/2"></div>
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <motion.path 
                  d="M 550 128 L 650 64" 
                  stroke="#E5E7EB" strokeWidth="2" fill="none"
                />
                <motion.path 
                  d="M 550 128 L 650 192" 
                  stroke="#E5E7EB" strokeWidth="2" fill="none"
                />
                <motion.path 
                  d="M 750 64 L 850 128" 
                  stroke="#E5E7EB" strokeWidth="2" fill="none"
                />
                <motion.path 
                  d="M 750 192 L 850 128" 
                  stroke="#E5E7EB" strokeWidth="2" fill="none"
                />
              </svg>

              {/* Animated Particle */}
              <motion.div 
                className="absolute w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] z-10"
                animate={{
                  x: [50, 250, 450, 650, 850],
                  y: [122, 122, 122, 122, 122]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {nodes.map((node, i) => (
                <div 
                  key={node.id} 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3"
                  style={{ left: node.x, top: node.y === 50 ? '50%' : node.y === -20 ? '25%' : '75%' }}
                >
                  <motion.div 
                    animate={{
                      scale: activeNode === i ? 1.2 : 1,
                      boxShadow: activeNode === i ? '0 0 0 4px rgba(99, 102, 241, 0.2)' : 'none'
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm z-20 ${
                      activeNode === i ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-500'
                    } transition-colors duration-300`}
                  >
                    {i + 1}
                  </motion.div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${activeNode === i ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {node.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
