import React from 'react';
import { Search, SlidersHorizontal, ChevronDown, Activity, Users, Recycle, Compass, Sparkles, Target } from 'lucide-react';

export function PlanDiscoveryView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-display">Discover Plans</h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">RIAL Community Feed</p>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 text-slate-300 hover:bg-white/10 transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
        
        {/* Categories */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto hide-scrollbar">
          <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary px-5 text-background-dark text-sm font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
            All Plans
          </button>
          <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark px-5 text-slate-300 text-sm font-medium border border-white/10 hover:border-white/20 transition-colors shadow-lg">
            Weight Loss
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
          <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark px-5 text-slate-300 text-sm font-medium border border-white/10 hover:border-white/20 transition-colors shadow-lg">
            Vegan
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
          <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark px-5 text-slate-300 text-sm font-medium border border-white/10 hover:border-white/20 transition-colors shadow-lg">
            Budget
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </header>

      {/* Main Feed */}
      <main className="p-4 space-y-6 max-w-3xl mx-auto mt-2">
        {/* Plan Card 1 */}
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-surface-dark shadow-xl hover:border-primary/30 transition-colors cursor-pointer">
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
            
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-primary/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-mono font-bold text-background-dark border border-primary/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <Sparkles className="w-3.5 h-3.5" />
                REAL MATCH: 94%
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-background-dark/80 backdrop-blur-md px-3 py-1.5 text-[10px] font-mono font-bold text-white border border-white/10">
                <Target className="w-3.5 h-3.5 text-primary" />
                88% SUCCESS
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-3xl font-bold text-white font-display leading-tight mb-2">4-Week Shred</h2>
              <div className="flex items-center gap-3">
                <span className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md border border-primary/20">High Intensity</span>
                <span className="text-slate-500 text-xs">|</span>
                <span className="text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest">28 Days Routine</span>
              </div>
            </div>
          </div>
          
          <div className="p-5 space-y-5">
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 relative overflow-hidden group/logic">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/logic:opacity-10 transition-opacity">
                <Recycle className="w-12 h-12 text-primary" />
              </div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Recycle className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Leftover Logic</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic relative z-10">
                "Turn Tuesday's roasted lemon chicken into Wednesday's Mediterranean pesto wraps."
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-surface-dark bg-slate-800 overflow-hidden">
                    <img src="https://i.pravatar.cc/100?img=1" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface-dark bg-slate-700 overflow-hidden">
                    <img src="https://i.pravatar.cc/100?img=2" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface-dark bg-slate-600 overflow-hidden">
                    <img src="https://i.pravatar.cc/100?img=3" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex w-10 h-10 items-center justify-center rounded-full border-2 border-surface-dark bg-primary/20 text-[10px] font-mono font-bold text-primary backdrop-blur-md">
                    +42
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Users</span>
              </div>
              
              <button className="h-12 rounded-xl bg-primary px-8 text-sm font-bold text-background-dark shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-105 active:scale-95 transition-all">
                Adopt Plan
              </button>
            </div>
          </div>
        </div>

        {/* Plan Card 2 */}
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-surface-dark shadow-xl hover:border-amber-500/30 transition-colors cursor-pointer opacity-80 hover:opacity-100">
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
            
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-mono font-bold text-background-dark border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Sparkles className="w-3.5 h-3.5" />
                REAL MATCH: 82%
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-3xl font-bold text-white font-display leading-tight mb-2">Family Prep Master</h2>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">Efficiency</span>
                <span className="text-slate-500 text-xs">|</span>
                <span className="text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest">14 Days Routine</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
