import React from 'react';
import { Calendar, TrendingUp, Plus, Coffee, Info, CheckCircle2, Activity, Zap, Droplets } from 'lucide-react';

export function JournalView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight font-display text-white">Today's Log</h1>
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Tuesday, Oct 24</p>
            </div>
          </div>
          <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-6">
        {/* Daily Stats Row */}
        <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-4">
          <div className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-3xl p-5 bg-surface-dark shadow-lg border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Coffee className="w-10 h-10 text-primary" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest relative z-10">Meals</p>
            <p className="text-3xl font-bold font-display text-white relative z-10">3</p>
          </div>
          <div className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-3xl p-5 bg-surface-dark shadow-lg border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-10 h-10 text-amber-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest relative z-10">Avg Energy</p>
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-amber-500 text-2xl">⚡</span>
              <p className="text-2xl font-bold font-display text-white">High</p>
            </div>
          </div>
          <div className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-3xl p-5 bg-surface-dark shadow-lg border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Droplets className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest relative z-10">Digestion</p>
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-emerald-500 text-2xl">😊</span>
              <p className="text-2xl font-bold font-display text-white">Good</p>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <h2 className="text-xl font-bold font-display text-white">Real Feel Timeline</h2>
          </div>
          
          <div className="relative space-y-10 before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-white/10 before:to-transparent">
            
            {/* Entry 1 */}
            <div className="relative flex items-start group">
              <div className="absolute left-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-background-dark border border-primary/50 z-10 shadow-[0_0_15px_rgba(20,184,166,0.2)] group-hover:scale-110 transition-transform">
                <Coffee className="text-primary w-5 h-5" />
              </div>
              <div className="ml-16 flex-1">
                <div className="flex flex-col gap-4 bg-surface-dark p-5 rounded-3xl shadow-lg border border-white/5 group-hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white font-display">Breakfast Bowl</h3>
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">8:15 AM</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-mono font-bold uppercase tracking-widest">Energy: High</span>
                    </div>
                  </div>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/5 relative group-hover:border-primary/20 transition-colors">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt="Oatmeal bowl with berries" 
                      src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">Feeling vibrant and ready for the day. Digestion feels light.</p>
                  <div className="flex gap-2 items-center bg-emerald-500/5 w-fit px-3 py-1.5 rounded-lg border border-emerald-500/10">
                    <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                    <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">Digestion: Perfect</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entry 2 */}
            <div className="relative flex items-start group">
              <div className="absolute left-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-background-dark border border-white/10 z-10 shadow-lg group-hover:border-white/30 transition-colors">
                <span className="text-slate-400 text-lg">🍽️</span>
              </div>
              <div className="ml-16 flex-1">
                <div className="flex flex-col gap-4 bg-surface-dark p-5 rounded-3xl shadow-lg border border-white/5 group-hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white font-display">Salmon & Greens</h3>
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">1:30 PM</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono font-bold uppercase tracking-widest">Energy: Stable</span>
                    </div>
                  </div>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/5 relative group-hover:border-white/10 transition-colors">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt="Salmon salad" 
                      src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">Great lunch, but felt a bit sleepy 30 mins after. Might need more complex carbs next time.</p>
                  <div className="flex gap-2 items-center bg-amber-500/5 w-fit px-3 py-1.5 rounded-lg border border-amber-500/10">
                    <Info className="text-amber-500 w-4 h-4" />
                    <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Digestion: Slower</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entry 3 */}
            <div className="relative flex items-start group">
              <div className="absolute left-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-background-dark border border-white/10 z-10 shadow-lg group-hover:border-white/30 transition-colors">
                <span className="text-slate-400 text-lg">🍫</span>
              </div>
              <div className="ml-16 flex-1">
                <div className="flex flex-col gap-4 bg-surface-dark p-5 rounded-3xl shadow-lg border border-white/5 group-hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white font-display">Dark Chocolate Square</h3>
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">4:00 PM</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-2.5 py-1 rounded-md bg-white/5 text-slate-400 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-widest">Energy: Neutral</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">Quick pick-me-up. Real feel is good, no bloating.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
