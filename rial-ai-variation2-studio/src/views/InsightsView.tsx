import React from 'react';
import { TrendingUp, Activity, Brain, Moon, Zap, ChevronRight, BarChart2, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from 'motion/react';

const data = [
  { name: "Mon", score: 65 },
  { name: "Tue", score: 72 },
  { name: "Wed", score: 68 },
  { name: "Thu", score: 85 },
  { name: "Fri", score: 82 },
  { name: "Sat", score: 90 },
  { name: "Sun", score: 88 },
];

interface InsightsViewProps {
  setCurrentView?: (view: string) => void;
}

export function InsightsView({ setCurrentView }: InsightsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header Stats */}
      <div className="px-6 pt-8 pb-8 max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden border border-white/10 group hover:border-[#ddff00]/30 transition-colors"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ddff00]/5 rounded-full blur-[80px] group-hover:bg-[#ddff00]/10 transition-colors duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ddff00]/5 rounded-full blur-[80px] group-hover:bg-[#ddff00]/10 transition-colors duration-700" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-white/40 text-[10px] font-mono font-black tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ddff00] animate-pulse shadow-[0_0_10px_#ddff00]"></span>
                  Weekly Average
                </p>
                <div className="flex items-baseline gap-4">
                  <h2 className="text-7xl font-display font-bold tracking-tighter text-white">82</h2>
                  <div className="flex items-center bg-[#ddff00]/10 px-3 py-1.5 rounded-xl border border-[#ddff00]/20">
                    <TrendingUp className="w-4 h-4 text-[#ddff00] mr-1.5" />
                    <span className="text-[#ddff00] text-xs font-mono font-black">+4%</span>
                  </div>
                </div>
              </div>
              <motion.button 
                whileHover={{ rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView?.('journal')}
                className="bg-black/40 backdrop-blur-md rounded-[24px] p-4 border border-white/10 shadow-2xl cursor-pointer"
              >
                <Activity className="w-10 h-10 text-[#ddff00]" />
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-8">
              {[
                { label: 'Sleep', value: '7h 42m', icon: Moon },
                { label: 'HRV', value: '64 ms', icon: Activity },
                { label: 'Strain', value: '14.2', icon: Zap }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-[24px] p-4 border border-white/5 group/stat hover:bg-white/10 transition-colors">
                  <p className="text-white/20 text-[10px] font-mono font-black uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className="font-display font-bold text-xl text-white group/stat-hover:text-[#ddff00] transition-colors">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Chart Section */}
        <div className="px-6 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <BarChart2 className="w-6 h-6 text-[#ddff00]" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white">Vitality Trend</h3>
            </div>
            <div className="relative">
              <select className="bg-white/5 text-[10px] font-mono font-black text-white/60 outline-none border border-white/10 rounded-xl px-4 py-2.5 cursor-pointer hover:border-white/20 transition-colors appearance-none uppercase tracking-widest pr-10">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-white/20 rotate-90" />
              </div>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 rounded-[40px] p-8 shadow-2xl border border-white/10 h-80 relative group hover:border-[#ddff00]/20 transition-colors overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#ddff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ddff00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ddff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff" opacity={0.05} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontWeight: 'bold' }} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontWeight: 'bold' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    backdropFilter: 'blur(12px)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '20px', 
                    color: '#fff', 
                    boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#ddff00', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '14px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}
                  cursor={{ stroke: '#ddff00', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#ddff00" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Correlations */}
        <div className="px-6 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
            <h3 className="text-2xl font-display font-bold text-white">Key Correlations</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'High Protein Breakfast', value: '+15% Focus Score', icon: Brain, color: 'emerald' },
              { title: 'Late Meals (After 8PM)', value: '-12% Recovery Score', icon: Moon, color: 'amber' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 5, scale: 1.01 }}
                className="bg-white/5 rounded-[32px] p-6 flex items-center gap-6 shadow-2xl border border-white/10 group hover:border-[#ddff00]/30 transition-colors cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-[#ddff00]/30 transition-colors`}>
                  <item.icon className={`w-7 h-7 ${item.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-white text-xl leading-tight mb-1.5">{item.title}</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-lg border ${item.color === 'emerald' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-amber-400/10 border-amber-400/20 text-amber-400'}`}>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest">{item.value}</span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-[#ddff00] transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="px-6">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-white/10 to-transparent rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10 group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ddff00]/10 rounded-full blur-[100px] transform translate-x-10 -translate-y-10 group-hover:bg-[#ddff00]/20 transition-colors duration-700" />
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="bg-[#ddff00]/20 p-3 rounded-2xl border border-[#ddff00]/30 shadow-[0_0_20px_rgba(221,255,0,0.3)]">
                <Zap className="w-6 h-6 text-[#ddff00]" />
              </div>
              <span className="font-mono font-black text-[10px] tracking-[0.3em] uppercase text-[#ddff00]">AI Insight Engine</span>
            </div>
            
            <p className="text-xl leading-relaxed mb-10 text-white/80 relative z-10 font-medium font-display">
              Your energy levels dip consistently around <span className="text-[#ddff00] font-bold">2:30 PM</span>. Try shifting your carb intake to lunch and adding a 10-minute walk post-meal.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#ddff00] text-black px-8 py-5 rounded-[24px] text-sm font-black w-full shadow-[0_0_30px_rgba(221,255,0,0.3)] transition-all border border-[#ddff00]/50 relative z-10 font-mono uppercase tracking-[0.2em]"
            >
              Adjust Meal Plan
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
