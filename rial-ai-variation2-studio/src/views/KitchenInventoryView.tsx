import React from 'react';
import { Refrigerator, Search, Bell, ShoppingCart, Droplets, Fish, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface KitchenInventoryViewProps {
  setCurrentView?: (view: string) => void;
}

export function KitchenInventoryView({ setCurrentView }: KitchenInventoryViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 h-20 max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView?.('home')}
              className="flex items-center justify-center size-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </motion.button>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#ddff00]/10 text-[#ddff00] border border-[#ddff00]/20 shadow-[0_0_15px_rgba(221,255,0,0.15)]">
              <Refrigerator className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-display text-white">Kitchen Hub</h1>
          </div>
          <div className="flex gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center size-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center size-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-white/5 sticky top-20 z-40">
        <div className="flex px-6 gap-8 overflow-x-auto no-scrollbar max-w-3xl mx-auto">
          {['Fridge', 'Pantry', 'Freezer', 'All'].map((tab, i) => (
            <button key={tab} className={`flex flex-col items-center justify-center border-b-2 pb-4 pt-5 px-2 transition-colors ${i === 0 ? 'border-[#ddff00] text-[#ddff00]' : 'border-transparent text-white/50 hover:text-white/80'}`}>
              <span className="text-xs font-mono font-bold uppercase tracking-widest">{tab}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-6 space-y-10 mt-6">
        {/* Critical Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500/10 to-white/5 border border-red-500/20 rounded-[32px] p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertCircle className="w-24 h-24 text-red-500" />
          </div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-red-500/20 text-red-500 w-14 h-14 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <p className="text-lg font-bold font-display text-white mb-1">4 items low in stock</p>
              <p className="text-xs text-white/50 font-mono uppercase tracking-widest">Added to Smart Shopping List</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView?.('shopping')}
            className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold uppercase tracking-widest px-4 py-3 hover:bg-red-500/10 rounded-xl transition-colors relative z-10 border border-transparent hover:border-red-500/20"
          >
            View List
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Stock Levels */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
              <h2 className="text-2xl font-bold font-display text-white">Stock Levels</h2>
            </div>
            <button className="text-[#ddff00] text-xs font-mono font-bold uppercase tracking-widest hover:text-[#ddff00]/80 transition-colors">Manage</button>
          </div>
          
          <div className="space-y-4">
            {/* Milk */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-5 p-6 bg-white/5 rounded-[32px] border border-white/5 shadow-2xl group hover:border-red-500/30 transition-colors cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-2xl border border-blue-500/20 relative z-10">
                <Droplets className="w-8 h-8" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-white text-lg font-bold font-display">Whole Milk</p>
                  <span className="text-[10px] font-mono font-black text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 uppercase tracking-widest">25% Left</span>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-red-500 h-full w-1/4 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center pl-6 border-l border-white/10 relative z-10">
                <ShoppingCart className="w-6 h-6 text-red-500 mb-2" />
                <span className="text-[10px] text-red-500 font-mono font-black uppercase tracking-widest">Reorder</span>
              </div>
            </motion.div>
            
            {/* Greek Yogurt */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-5 p-6 bg-white/5 rounded-[32px] border border-white/5 shadow-2xl group hover:border-emerald-500/30 transition-colors cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-white/5 text-white/50 flex items-center justify-center rounded-2xl border border-white/10 relative z-10">
                <Fish className="w-8 h-8" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-white text-lg font-bold font-display">Greek Yogurt</p>
                  <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest">80% Left</span>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-emerald-500 h-full w-4/5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center pl-6 border-l border-white/10 text-white/30 relative z-10">
                <CheckCircle className="w-6 h-6 mb-2 text-emerald-500/50" />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest">Stocked</span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
