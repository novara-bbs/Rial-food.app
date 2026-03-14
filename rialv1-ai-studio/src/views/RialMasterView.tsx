import React from 'react';
import { Bell, Plus, Smile, Sun, Moon, Activity, Zap, TrendingUp, HeartPulse, ChevronRight } from 'lucide-react';

export function RialMasterView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display leading-tight text-white">RIAL Master</h1>
              <p className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">Pro Athlete Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </button>
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" 
                alt="Profile" 
                className="relative size-10 rounded-full border border-white/10 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-8">
        {/* Top Stats */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-surface-dark rounded-3xl p-5 border border-white/5 shadow-lg relative overflow-hidden group hover:border-red-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest mb-2 relative z-10">Fatigue</p>
            <p className="text-2xl font-bold font-display text-white mb-1 relative z-10">Low</p>
            <p className="text-red-400 text-[10px] font-mono font-bold uppercase tracking-widest relative z-10 bg-red-500/10 w-fit px-2 py-0.5 rounded border border-red-500/20">-5% Vol.</p>
          </div>
          <div className="bg-surface-dark rounded-3xl p-5 border border-white/5 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest mb-2 relative z-10">Recovery</p>
            <p className="text-2xl font-bold font-display text-white mb-1 relative z-10">92%</p>
            <p className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest relative z-10 bg-emerald-500/10 w-fit px-2 py-0.5 rounded border border-emerald-500/20">+12% HRV</p>
          </div>
          <div className="bg-surface-dark rounded-3xl p-5 border border-white/5 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-10 h-10 text-blue-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest mb-2 relative z-10">CNS</p>
            <p className="text-2xl font-bold font-display text-white mb-1 relative z-10">Peak</p>
            <p className="text-blue-400 text-[10px] font-mono font-bold uppercase tracking-widest relative z-10 bg-blue-500/10 w-fit px-2 py-0.5 rounded border border-blue-500/20">Optimal</p>
          </div>
        </section>

        {/* HRV Chart */}
        <section className="bg-surface-dark rounded-3xl p-6 border border-white/5 shadow-lg relative overflow-hidden group hover:border-blue-500/20 transition-colors">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-32 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HeartPulse className="w-4 h-4 text-blue-400" />
                <h3 className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">Heart Rate Variability</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold font-display text-white">74</span>
                <span className="text-sm font-mono text-blue-400">ms</span>
              </div>
            </div>
            <span className="bg-blue-500/10 text-blue-400 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-blue-500/20">Last 7 Days</span>
          </div>
          
          {/* Simple SVG Chart Representation */}
          <div className="h-40 relative w-full flex items-end z-10">
            <svg viewBox="0 0 100 40" className="w-full h-full preserve-aspect-ratio-none" preserveAspectRatio="none">
              <path 
                d="M0,30 Q10,10 25,20 T50,35 T75,5 T90,35 L100,10" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />
              <path 
                d="M0,30 Q10,10 25,20 T50,35 T75,5 T90,35 L100,10 L100,40 L0,40 Z" 
                fill="url(#blue-gradient)" 
                opacity="0.3"
              />
              <defs>
                <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-mono font-bold text-slate-500 tracking-widest">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span className="text-blue-400">S</span>
            </div>
          </div>
        </section>

        {/* Real Feel Log */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <h2 className="text-xl font-bold font-display text-white">Real Feel™ Log</h2>
            </div>
            <button className="text-blue-400 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
              <Plus className="w-3.5 h-3.5" /> New Entry
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            <div className="min-w-[140px] bg-surface-dark border border-emerald-500/20 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Smile className="w-10 h-10 text-emerald-500 mb-3 relative z-10" />
              <p className="font-bold font-display text-white text-lg relative z-10">Strong</p>
              <p className="text-[9px] font-mono font-bold text-emerald-500/70 uppercase tracking-widest mt-1 relative z-10">Readiness</p>
            </div>
            <div className="min-w-[140px] bg-surface-dark border border-amber-500/20 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sun className="w-10 h-10 text-amber-500 mb-3 relative z-10" />
              <p className="font-bold font-display text-white text-lg relative z-10">Mid-Inflame</p>
              <p className="text-[9px] font-mono font-bold text-amber-500/70 uppercase tracking-widest mt-1 relative z-10">Soreness</p>
            </div>
            <div className="min-w-[140px] bg-surface-dark border border-blue-500/20 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Moon className="w-10 h-10 text-blue-500 mb-3 relative z-10" />
              <p className="font-bold font-display text-white text-lg relative z-10">Late</p>
              <p className="text-[9px] font-mono font-bold text-blue-500/70 uppercase tracking-widest mt-1 relative z-10">Sleep</p>
            </div>
          </div>
        </section>

        {/* Performance Fueling */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <h2 className="text-xl font-bold font-display text-white">Performance Fueling</h2>
          </div>
          
          <div className="space-y-6">
            {/* Recipe 1 */}
            <div className="bg-surface-dark rounded-3xl overflow-hidden border border-white/5 shadow-lg group hover:border-blue-500/30 transition-colors cursor-pointer">
              <div className="relative h-56">
                <img 
                  src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800" 
                  alt="Salmon Bowl" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-blue-500/90 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  98% Match
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" /> Pre-Workout Fuel
                  </p>
                  <h3 className="text-2xl font-bold font-display text-white group-hover:text-blue-400 transition-colors">Atlantic Salmon Power Bowl</h3>
                </div>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-4 gap-4 mb-5">
                  <div className="bg-background-dark rounded-2xl p-3 border border-white/5 text-center">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Prot</p>
                    <p className="font-bold font-display text-white text-lg">42g</p>
                  </div>
                  <div className="bg-background-dark rounded-2xl p-3 border border-white/5 text-center">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Carb</p>
                    <p className="font-bold font-display text-white text-lg">65g</p>
                  </div>
                  <div className="bg-background-dark rounded-2xl p-3 border border-white/5 text-center">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Fat</p>
                    <p className="font-bold font-display text-white text-lg">18g</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-2xl p-3 border border-blue-500/20 text-center">
                    <p className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">Cal</p>
                    <p className="font-bold font-display text-blue-400 text-lg">590</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/5 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md border border-white/10 flex items-center gap-1.5">
                    <span className="text-blue-400">⚡</span> B12 High
                  </span>
                  <span className="bg-white/5 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md border border-white/10 flex items-center gap-1.5">
                    <span className="text-blue-400">💧</span> Omega 3
                  </span>
                  <span className="bg-white/5 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md border border-white/10 flex items-center gap-1.5">
                    <span className="text-blue-400">🛡️</span> Anti-Inflam
                  </span>
                </div>
              </div>
            </div>

            {/* Recipe 2 */}
            <div className="bg-surface-dark rounded-3xl overflow-hidden border border-white/5 shadow-lg group hover:border-amber-500/30 transition-colors cursor-pointer">
              <div className="relative h-56">
                <img 
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" 
                  alt="Green Bowl" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  74% Match
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Micronutrient Boost
                  </p>
                  <h3 className="text-2xl font-bold font-display text-white group-hover:text-amber-500 transition-colors">Zen Greens & Seed Medley</h3>
                </div>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-4 gap-4 mb-5">
                  <div className="bg-background-dark rounded-2xl p-3 border border-white/5 text-center">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Prot</p>
                    <p className="font-bold font-display text-white text-lg">12g</p>
                  </div>
                  <div className="bg-background-dark rounded-2xl p-3 border border-white/5 text-center">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Carb</p>
                    <p className="font-bold font-display text-white text-lg">22g</p>
                  </div>
                  <div className="bg-background-dark rounded-2xl p-3 border border-white/5 text-center">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Fat</p>
                    <p className="font-bold font-display text-white text-lg">14g</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-2xl p-3 border border-blue-500/20 text-center">
                    <p className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">Cal</p>
                    <p className="font-bold font-display text-blue-400 text-lg">260</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/5 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md border border-white/10 flex items-center gap-1.5">
                    <span className="text-amber-500">🍃</span> High Fiber
                  </span>
                  <span className="bg-white/5 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md border border-white/10 flex items-center gap-1.5">
                    <span className="text-amber-500">🧪</span> Magnesium
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
