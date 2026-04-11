import React from 'react';
import { Search, SlidersHorizontal, ChevronDown, Activity, Users, Recycle, Compass, Sparkles, Target, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function PlanDiscoveryView({ setCurrentView }: { setCurrentView?: (view: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center p-6 justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView?.('home')}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </motion.button>
            <div className="bg-[#ddff00]/10 p-3 rounded-2xl border border-[#ddff00]/20 shadow-[0_0_20px_rgba(221,255,0,0.1)]">
              <Compass className="w-6 h-6 text-[#ddff00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter text-white font-display">Discover Plans</h1>
              <p className="text-[10px] text-white/40 font-mono font-black uppercase tracking-[0.2em] mt-1">RIAL Community Feed</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <SlidersHorizontal className="w-6 h-6" />
          </motion.button>
        </div>
        
        {/* Categories */}
        <div className="flex gap-4 px-6 pb-6 overflow-x-auto hide-scrollbar max-w-3xl mx-auto">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-2xl bg-[#ddff00] px-6 text-black text-sm font-black shadow-[0_0_20px_rgba(221,255,0,0.3)] font-mono uppercase tracking-widest"
          >
            All Plans
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-2xl bg-white/5 px-6 text-white text-sm font-bold border border-white/10 hover:border-white/20 transition-colors shadow-xl"
          >
            Weight Loss
            <ChevronDown className="w-4 h-4 text-white/40" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-2xl bg-white/5 px-6 text-white text-sm font-bold border border-white/10 hover:border-white/20 transition-colors shadow-xl"
          >
            Vegan
            <ChevronDown className="w-4 h-4 text-white/40" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-2xl bg-white/5 px-6 text-white text-sm font-bold border border-white/10 hover:border-white/20 transition-colors shadow-xl"
          >
            Budget
            <ChevronDown className="w-4 h-4 text-white/40" />
          </motion.button>
        </div>
      </header>

      {/* Main Feed */}
      <main className="p-6 space-y-10 max-w-3xl mx-auto mt-4">
        {/* Plan Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative flex flex-col overflow-hidden rounded-[40px] border border-white/5 bg-white/5 shadow-2xl hover:border-[#ddff00]/30 transition-all cursor-pointer"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute top-6 left-6 flex gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-[#ddff00] px-4 py-2 text-[10px] font-mono font-black text-black border border-[#ddff00]/50 shadow-[0_0_20px_rgba(221,255,0,0.4)] uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                REAL MATCH: 94%
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md px-4 py-2 text-[10px] font-mono font-black text-white border border-white/10 uppercase tracking-widest">
                <Target className="w-4 h-4 text-[#ddff00]" />
                88% SUCCESS
              </div>
            </div>
            
            <div className="absolute bottom-6 left-8 right-8">
              <h2 className="text-4xl font-bold text-white font-display leading-tight mb-3 tracking-tighter">4-Week Shred</h2>
              <div className="flex items-center gap-4">
                <span className="text-[#ddff00] text-[10px] font-mono font-black uppercase tracking-[0.2em] bg-[#ddff00]/10 px-3 py-1.5 rounded-xl border border-[#ddff00]/20">High Intensity</span>
                <span className="text-white/20 text-xs">|</span>
                <span className="text-white/60 text-[10px] font-mono font-black uppercase tracking-[0.2em]">28 Days Routine</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 relative overflow-hidden group/logic">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/logic:opacity-10 transition-opacity">
                <Recycle className="w-16 h-16 text-[#ddff00]" />
              </div>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <Recycle className="w-5 h-5 text-[#ddff00]" />
                <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em]">Leftover Logic</span>
              </div>
              <p className="text-base text-white/80 leading-relaxed italic relative z-10 font-medium">
                "Turn Tuesday's roasted lemon chicken into Wednesday's Mediterranean pesto wraps."
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-white/10 overflow-hidden shadow-xl">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="flex w-12 h-12 items-center justify-center rounded-full border-4 border-black bg-[#ddff00]/20 text-[10px] font-mono font-black text-[#ddff00] backdrop-blur-md">
                    +42
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em]">Active Users</span>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-14 rounded-2xl bg-[#ddff00] px-10 text-sm font-black text-black shadow-[0_0_30px_rgba(221,255,0,0.3)] font-mono uppercase tracking-widest"
              >
                Adopt Plan
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Plan Card 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative flex flex-col overflow-hidden rounded-[40px] border border-white/5 bg-white/5 shadow-2xl hover:border-amber-500/30 transition-all cursor-pointer opacity-80 hover:opacity-100"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute top-6 left-6 flex gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-[10px] font-mono font-black text-black border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.4)] uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                REAL MATCH: 82%
              </div>
            </div>
            
            <div className="absolute bottom-6 left-8 right-8">
              <h2 className="text-4xl font-bold text-white font-display leading-tight mb-3 tracking-tighter">Family Prep Master</h2>
              <div className="flex items-center gap-4">
                <span className="text-amber-400 text-[10px] font-mono font-black uppercase tracking-[0.2em] bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">Efficiency</span>
                <span className="text-white/20 text-xs">|</span>
                <span className="text-white/60 text-[10px] font-mono font-black uppercase tracking-[0.2em]">14 Days Routine</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}