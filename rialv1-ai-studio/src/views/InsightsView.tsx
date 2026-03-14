import { TrendingUp, Activity, Brain, Moon, Zap, ChevronRight, BarChart2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", score: 65 },
  { name: "Tue", score: 72 },
  { name: "Wed", score: 68 },
  { name: "Thu", score: 85 },
  { name: "Fri", score: 82 },
  { name: "Sat", score: 90 },
  { name: "Sun", score: 88 },
];

export function InsightsView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="px-4 pt-6 pb-6 max-w-3xl mx-auto">
        <div className="bg-surface-dark text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/5 group hover:border-primary/30 transition-colors">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-slate-400 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Weekly Average
                </p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-6xl font-bold font-display tracking-tighter">82</h2>
                  <span className="text-primary text-sm font-mono font-bold flex items-center bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                    <TrendingUp className="w-4 h-4 mr-1" /> +4%
                  </span>
                </div>
              </div>
              <div className="bg-background-dark/50 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg">
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div className="bg-background-dark/30 rounded-2xl p-3 border border-white/5">
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">Sleep</p>
                <p className="font-bold font-display text-lg text-white">7h 42m</p>
              </div>
              <div className="bg-background-dark/30 rounded-2xl p-3 border border-white/5">
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">HRV</p>
                <p className="font-bold font-display text-lg text-white">64 ms</p>
              </div>
              <div className="bg-background-dark/30 rounded-2xl p-3 border border-white/5">
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">Strain</p>
                <p className="font-bold font-display text-lg text-white">14.2</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Chart Section */}
        <div className="px-4 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                <BarChart2 className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-display text-white">Vitality Trend</h3>
            </div>
            <select className="bg-surface-dark text-xs font-mono font-bold text-slate-300 outline-none border border-white/10 rounded-lg px-3 py-2 cursor-pointer hover:border-white/20 transition-colors appearance-none">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          
          <div className="bg-surface-dark rounded-3xl p-5 shadow-xl border border-white/5 h-72 relative group hover:border-primary/20 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: 'var(--theme-primary)', fontWeight: 'bold', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--theme-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlations */}
        <div className="px-4 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <h3 className="text-xl font-bold font-display text-white">Key Correlations</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-surface-dark rounded-2xl p-4 flex items-center gap-4 shadow-lg border border-white/5 group hover:border-emerald-500/30 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white font-display text-lg leading-tight mb-1">High Protein Breakfast</p>
                <p className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit border border-emerald-500/20">+15% Focus Score</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 transition-colors group-hover:translate-x-1" />
            </div>

            <div className="bg-surface-dark rounded-2xl p-4 flex items-center gap-4 shadow-lg border border-white/5 group hover:border-amber-500/30 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Moon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white font-display text-lg leading-tight mb-1">Late Meals (After 8PM)</p>
                <p className="text-amber-500 text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md w-fit border border-amber-500/20">-12% Recovery Score</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-500 transition-colors group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="px-4">
          <div className="bg-gradient-to-br from-surface-dark to-background-dark rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-primary/20 group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:bg-primary/20 transition-colors duration-700" />
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="bg-primary/20 p-2 rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="font-mono font-bold text-[10px] tracking-widest uppercase text-primary">AI Insight</span>
            </div>
            
            <p className="text-base leading-relaxed mb-6 text-slate-300 relative z-10 font-medium">
              Your energy levels dip consistently around 2:30 PM. Try shifting your carb intake to lunch and adding a 10-minute walk post-meal.
            </p>
            
            <button className="bg-primary text-background-dark px-6 py-4 rounded-2xl text-sm font-bold w-full shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-primary/50 relative z-10 font-display tracking-wide">
              Adjust Meal Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
