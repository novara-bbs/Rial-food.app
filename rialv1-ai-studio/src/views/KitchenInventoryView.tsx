import React from 'react';
import { Refrigerator, Search, Bell, ShoppingCart, Droplets, Fish, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';

export function KitchenInventoryView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-16 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
              <Refrigerator className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight font-display text-white">Kitchen Hub</h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
              <Search className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-background-dark/80 backdrop-blur-md border-b border-white/5 sticky top-16 z-40">
        <div className="flex px-4 gap-6 overflow-x-auto no-scrollbar max-w-3xl mx-auto">
          <button className="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-4 px-2 transition-colors">
            <span className="text-xs font-mono font-bold uppercase tracking-widest">Fridge</span>
          </button>
          <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 hover:text-slate-300 pb-3 pt-4 px-2 transition-colors">
            <span className="text-xs font-mono font-bold uppercase tracking-widest">Pantry</span>
          </button>
          <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 hover:text-slate-300 pb-3 pt-4 px-2 transition-colors">
            <span className="text-xs font-mono font-bold uppercase tracking-widest">Freezer</span>
          </button>
          <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 hover:text-slate-300 pb-3 pt-4 px-2 transition-colors">
            <span className="text-xs font-mono font-bold uppercase tracking-widest">All</span>
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4 space-y-8 mt-4">
        {/* Critical Status Banner */}
        <div className="bg-gradient-to-r from-red-500/10 to-surface-dark border border-red-500/20 rounded-3xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-red-500/20 text-red-500 w-12 h-12 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold font-display text-white">4 items low in stock</p>
              <p className="text-xs text-slate-400 mt-0.5">Added to Smart Shopping List</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-red-400 text-xs font-mono font-bold uppercase tracking-widest px-3 py-2 hover:bg-red-500/10 rounded-xl transition-colors relative z-10 border border-transparent hover:border-red-500/20">
            View List
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Levels */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <h2 className="text-xl font-bold font-display text-white">Stock Levels</h2>
            </div>
            <button className="text-primary text-xs font-mono font-bold uppercase tracking-widest hover:text-primary/80 transition-colors">Manage</button>
          </div>
          
          <div className="space-y-4">
            {/* Milk */}
            <div className="flex items-center gap-4 p-5 bg-surface-dark rounded-3xl border border-white/5 shadow-lg group hover:border-red-500/30 transition-colors cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-2xl border border-blue-500/20 relative z-10">
                <Droplets className="w-7 h-7" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-white text-base font-bold font-display">Whole Milk</p>
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">25% Left</span>
                </div>
                <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden border border-white/5">
                  <div className="bg-red-500 h-full w-1/4 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center pl-4 border-l border-white/5 relative z-10">
                <ShoppingCart className="w-5 h-5 text-red-500 mb-1" />
                <span className="text-[9px] text-red-500 font-mono font-bold uppercase tracking-widest">Reorder</span>
              </div>
            </div>
            
            {/* Greek Yogurt */}
            <div className="flex items-center gap-4 p-5 bg-surface-dark rounded-3xl border border-white/5 shadow-lg group hover:border-emerald-500/30 transition-colors cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 bg-slate-800 text-slate-400 flex items-center justify-center rounded-2xl border border-white/10 relative z-10">
                <Fish className="w-7 h-7" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-white text-base font-bold font-display">Greek Yogurt</p>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">80% Left</span>
                </div>
                <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden border border-white/5">
                  <div className="bg-emerald-500 h-full w-4/5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center pl-4 border-l border-white/5 text-slate-500 relative z-10">
                <CheckCircle className="w-5 h-5 mb-1 text-emerald-500/50" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Stocked</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
