import React from 'react';
import { Menu, User, Check, Snowflake, BarChart2, Calendar, BookOpen, ShoppingCart, Activity, ChevronRight, Filter } from 'lucide-react';

export function ShoppingListView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-16 max-w-3xl mx-auto">
          <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold tracking-tight font-display text-white">Inventory Plan</h1>
          <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-8">
        {/* Summary Stats Dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 rounded-3xl p-6 bg-surface-dark border border-white/5 shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar className="w-16 h-16 text-primary" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest relative z-10">Current Cycle</p>
            <p className="text-2xl font-bold font-display text-white relative z-10">Week of Oct 14</p>
            <div className="mt-4 h-1.5 w-full bg-background-dark rounded-full overflow-hidden border border-white/5 relative z-10">
              <div className="h-full bg-primary relative" style={{ width: '66%' }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 rounded-3xl p-6 bg-surface-dark border border-white/5 shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-16 h-16 text-primary" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest relative z-10">Batch Sessions</p>
            <p className="text-2xl font-bold font-display text-white relative z-10">3 Planned</p>
            <div className="flex gap-2 mt-4 relative z-10">
              <div className="h-1.5 flex-1 rounded-full bg-primary shadow-[0_0_10px_rgba(20,184,166,0.3)]"></div>
              <div className="h-1.5 flex-1 rounded-full bg-primary shadow-[0_0_10px_rgba(20,184,166,0.3)]"></div>
              <div className="h-1.5 flex-1 rounded-full bg-background-dark border border-white/10"></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 rounded-3xl p-6 bg-primary text-background-dark shadow-[0_0_30px_rgba(20,184,166,0.2)] relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShoppingCart className="w-16 h-16 text-background-dark" />
            </div>
            <p className="text-[10px] text-background-dark/70 font-mono font-bold uppercase tracking-widest relative z-10">Inventory Status</p>
            <p className="text-3xl font-bold font-display relative z-10">42<span className="text-lg font-sans font-medium ml-1">Items</span></p>
            <div className="mt-auto pt-4 flex items-center justify-between relative z-10">
              <span className="text-xs font-bold bg-background-dark/10 px-3 py-1.5 rounded-lg">12 in pantry</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </section>

        {/* Grocery Categories */}
        <div className="space-y-10">
          {/* Category: Produce */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Section 01
                </span>
                <h2 className="text-3xl font-bold font-display text-white tracking-tight">Produce</h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-surface-dark px-3 py-1.5 rounded-lg border border-white/5">12 items</span>
            </div>
            
            <div className="relative h-40 rounded-3xl overflow-hidden mb-6 group border border-white/5 shadow-2xl">
              <img 
                alt="Fresh green vegetables" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <span className="bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-background-dark uppercase tracking-widest border border-primary/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]">High Precision</span>
                <span className="bg-surface-dark/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest border border-white/10">Freshness: 98%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Item */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-white/5 shadow-lg group hover:border-primary/30 transition-colors cursor-pointer">
                <div className="w-6 h-6 rounded-lg border-2 border-slate-600 flex items-center justify-center group-hover:border-primary transition-colors"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">Organic Spinach</h3>
                    <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">500g</span>
                  </div>
                  <p className="text-xs text-slate-500">Used in <span className="text-slate-300 font-medium">Sunday Prep Session</span></p>
                </div>
              </div>
              {/* Item */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-white/5 shadow-lg group hover:border-primary/30 transition-colors cursor-pointer">
                <div className="w-6 h-6 rounded-lg border-2 border-slate-600 flex items-center justify-center group-hover:border-primary transition-colors"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">Bell Peppers (Mixed)</h3>
                    <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">6 Units</span>
                  </div>
                  <p className="text-xs text-slate-500">Used in <span className="text-slate-300 font-medium">Fajita Meal Plan</span></p>
                </div>
              </div>
            </div>
          </section>

          {/* Category: Protein */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Section 02
                </span>
                <h2 className="text-3xl font-bold font-display text-white tracking-tight">Protein</h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-surface-dark px-3 py-1.5 rounded-lg border border-white/5">4 items</span>
            </div>
            
            <div className="relative h-40 rounded-3xl overflow-hidden mb-6 group border border-white/5 shadow-2xl">
              <img 
                alt="Raw chicken breast" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                src="https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <span className="bg-blue-500/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-white uppercase tracking-widest border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
                  <Snowflake className="w-3 h-3" />
                  Cold Chain
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-primary/30 shadow-[0_0_15px_rgba(20,184,166,0.05)] group cursor-pointer">
                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                  <Check className="w-4 h-4 text-background-dark" strokeWidth={3} />
                </div>
                <div className="flex-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-200 line-through">Free-range Chicken Breast</h3>
                    <span className="text-sm font-mono font-bold text-slate-500 bg-background-dark px-2 py-1 rounded-md border border-white/5">2.4kg</span>
                  </div>
                  <p className="text-xs text-slate-500">Used in <span className="text-slate-400 font-medium">Sunday Batch & Tuesday Prep</span></p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Action Button - Smart Preview */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
        <button className="w-full bg-primary text-background-dark py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(20,184,166,0.3)] hover:scale-[1.02] transition-transform border border-primary/50">
          <BarChart2 className="w-5 h-5" />
          Smart Preview: Bulk Summary
        </button>
      </div>
    </div>
  );
}
