import React from 'react';
import { Menu, User, Check, Snowflake, BarChart2, Calendar, BookOpen, ShoppingCart, Activity, ChevronRight, Filter, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface ShoppingListViewProps {
  setCurrentView?: (view: string) => void;
}

export function ShoppingListView({ setCurrentView }: ShoppingListViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black text-white selection:bg-[#ddff00] selection:text-black">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView?.('home')}
            className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-xl font-bold tracking-tight font-display text-white">Inventory Plan</h1>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <Filter className="w-6 h-6" />
          </motion.button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-8 space-y-12">
        {/* Summary Stats Dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ y: -2 }}
            className="flex flex-col gap-2 rounded-[32px] p-6 bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar className="w-16 h-16 text-[#ddff00]" />
            </div>
            <p className="text-[10px] text-white/50 font-mono font-black uppercase tracking-widest relative z-10">Current Cycle</p>
            <p className="text-2xl font-bold font-display text-white relative z-10">Week of Oct 14</p>
            <div className="mt-4 h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/10 relative z-10">
              <div className="h-full bg-[#ddff00] relative" style={{ width: '66%' }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="flex flex-col gap-2 rounded-[32px] p-6 bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-16 h-16 text-[#ddff00]" />
            </div>
            <p className="text-[10px] text-white/50 font-mono font-black uppercase tracking-widest relative z-10">Batch Sessions</p>
            <p className="text-2xl font-bold font-display text-white relative z-10">3 Planned</p>
            <div className="flex gap-2 mt-4 relative z-10">
              <div className="h-1.5 flex-1 rounded-full bg-[#ddff00] shadow-[0_0_10px_rgba(221,255,0,0.3)]"></div>
              <div className="h-1.5 flex-1 rounded-full bg-[#ddff00] shadow-[0_0_10px_rgba(221,255,0,0.3)]"></div>
              <div className="h-1.5 flex-1 rounded-full bg-black border border-white/10"></div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex flex-col gap-2 rounded-[32px] p-6 bg-[#ddff00] text-black shadow-[0_0_30px_rgba(221,255,0,0.2)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShoppingCart className="w-16 h-16 text-black" />
            </div>
            <p className="text-[10px] text-black/70 font-mono font-black uppercase tracking-widest relative z-10">Inventory Status</p>
            <p className="text-3xl font-bold font-display relative z-10 tracking-tight">42<span className="text-lg font-sans font-medium ml-1 tracking-normal">Items</span></p>
            <div className="mt-auto pt-4 flex items-center justify-between relative z-10">
              <span className="text-xs font-bold bg-black/10 px-3 py-1.5 rounded-lg">12 in pantry</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        </section>

        {/* Grocery Categories */}
        <div className="space-y-12">
          {/* Category: Produce */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ddff00]"></span>
                  Section 01
                </span>
                <h2 className="text-3xl font-bold font-display text-white tracking-tight">Produce</h2>
              </div>
              <span className="text-[10px] font-mono font-black text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">12 items</span>
            </div>
            
            <div className="relative h-48 rounded-[32px] overflow-hidden mb-6 group border border-white/10 shadow-2xl">
              <img 
                alt="Fresh green vegetables" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <span className="bg-[#ddff00]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-mono font-black text-black uppercase tracking-widest border border-[#ddff00]/50 shadow-[0_0_15px_rgba(221,255,0,0.3)]">High Precision</span>
                <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-mono font-black text-white uppercase tracking-widest border border-white/10">Freshness: 98%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Item */}
              <motion.div 
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-5 rounded-[24px] bg-white/5 border border-white/10 shadow-lg group hover:border-[#ddff00]/30 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg border-2 border-white/30 flex items-center justify-center group-hover:border-[#ddff00] transition-colors"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white/80 group-hover:text-white transition-colors font-display text-lg">Organic Spinach</h3>
                    <span className="text-xs font-mono font-black text-[#ddff00] bg-[#ddff00]/10 px-2 py-1 rounded-lg border border-[#ddff00]/20">500g</span>
                  </div>
                  <p className="text-xs text-white/50 font-mono">Used in <span className="text-white/80 font-bold">Sunday Prep Session</span></p>
                </div>
              </motion.div>
              {/* Item */}
              <motion.div 
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-5 rounded-[24px] bg-white/5 border border-white/10 shadow-lg group hover:border-[#ddff00]/30 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg border-2 border-white/30 flex items-center justify-center group-hover:border-[#ddff00] transition-colors"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white/80 group-hover:text-white transition-colors font-display text-lg">Bell Peppers (Mixed)</h3>
                    <span className="text-xs font-mono font-black text-[#ddff00] bg-[#ddff00]/10 px-2 py-1 rounded-lg border border-[#ddff00]/20">6 Units</span>
                  </div>
                  <p className="text-xs text-white/50 font-mono">Used in <span className="text-white/80 font-bold">Fajita Meal Plan</span></p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Category: Protein */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ddff00]"></span>
                  Section 02
                </span>
                <h2 className="text-3xl font-bold font-display text-white tracking-tight">Protein</h2>
              </div>
              <span className="text-[10px] font-mono font-black text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">4 items</span>
            </div>
            
            <div className="relative h-48 rounded-[32px] overflow-hidden mb-6 group border border-white/10 shadow-2xl">
              <img 
                alt="Raw chicken breast" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                src="https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <span className="bg-blue-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-mono font-black text-white uppercase tracking-widest border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
                  <Snowflake className="w-3 h-3" />
                  Cold Chain
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <motion.div 
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-5 rounded-[24px] bg-white/5 border border-[#ddff00]/30 shadow-[0_0_15px_rgba(221,255,0,0.05)] group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-[#ddff00] flex items-center justify-center shadow-[0_0_10px_rgba(221,255,0,0.3)]">
                  <Check className="w-4 h-4 text-black" strokeWidth={3} />
                </div>
                <div className="flex-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white/80 line-through font-display text-lg">Free-range Chicken Breast</h3>
                    <span className="text-xs font-mono font-black text-white/50 bg-black px-2 py-1 rounded-lg border border-white/10">2.4kg</span>
                  </div>
                  <p className="text-xs text-white/50 font-mono">Used in <span className="text-white/80 font-bold">Sunday Batch & Tuesday Prep</span></p>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Action Button - Smart Preview */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#ddff00] text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(221,255,0,0.3)] border border-[#ddff00]/50"
        >
          <BarChart2 className="w-5 h-5" />
          <span className="font-display text-lg">Smart Preview: Bulk Summary</span>
        </motion.button>
      </div>
    </div>
  );
}

