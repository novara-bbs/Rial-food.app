import React from 'react';
import { Bell, Plus, Smile, Sun, Moon, Activity, Zap, TrendingUp, HeartPulse, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RialMasterViewProps {
  setCurrentView?: (view: string) => void;
}

export function RialMasterView({ setCurrentView }: RialMasterViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black text-white selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-[20px] bg-[#ddff00]/10 text-[#ddff00] border border-[#ddff00]/20 shadow-[0_0_20px_rgba(221,255,0,0.15)]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display leading-tight text-white tracking-tight">RIAL Master</h1>
            <p className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] mt-1">Pro Athlete Edition</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center size-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white relative"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-3 right-3 flex h-2.5 w-2.5 rounded-full bg-[#ddff00] shadow-[0_0_10px_rgba(221,255,0,0.8)]" />
          </motion.button>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative group cursor-pointer"
          >
            <div className="absolute -inset-1 bg-[#ddff00] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" 
              alt="Profile" 
              className="relative size-12 rounded-full border-2 border-[#ddff00]/50 object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-8 space-y-12">
        {/* Top Stats */}
        <section className="grid grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-red-500/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-12 h-12 text-red-500" />
            </div>
            <p className="text-[10px] text-white/40 font-mono font-black uppercase tracking-[0.2em] mb-3 relative z-10">Fatigue</p>
            <p className="text-3xl font-bold font-display text-white mb-2 relative z-10 tracking-tighter">Low</p>
            <p className="text-red-400 text-[10px] font-mono font-black uppercase tracking-widest relative z-10 bg-red-500/10 w-fit px-2.5 py-1 rounded-lg border border-red-500/20">-5% Vol.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-12 h-12 text-[#ddff00]" />
            </div>
            <p className="text-[10px] text-white/40 font-mono font-black uppercase tracking-[0.2em] mb-3 relative z-10">Recovery</p>
            <p className="text-3xl font-bold font-display text-white mb-2 relative z-10 tracking-tighter">92%</p>
            <p className="text-[#ddff00] text-[10px] font-mono font-black uppercase tracking-widest relative z-10 bg-[#ddff00]/10 w-fit px-2.5 py-1 rounded-lg border border-[#ddff00]/20">+12% HRV</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-[#ddff00] rounded-[32px] p-6 shadow-[0_0_30px_rgba(221,255,0,0.15)] relative overflow-hidden group text-black"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-12 h-12 text-black" />
            </div>
            <p className="text-[10px] text-black/60 font-mono font-black uppercase tracking-[0.2em] mb-3 relative z-10">CNS</p>
            <p className="text-3xl font-bold font-display text-black mb-2 relative z-10 tracking-tighter">Peak</p>
            <p className="text-black/80 text-[10px] font-mono font-black uppercase tracking-widest relative z-10 bg-black/5 w-fit px-2.5 py-1 rounded-lg border border-black/10">Optimal</p>
          </motion.div>
        </section>

        {/* HRV Chart */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-40 bg-[#ddff00]/5 rounded-full blur-[80px] -z-10 group-hover:bg-[#ddff00]/10 transition-colors duration-700" />
          
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <HeartPulse className="w-5 h-5 text-[#ddff00]" />
                <h3 className="text-[10px] text-white/40 font-mono font-black uppercase tracking-[0.2em]">Heart Rate Variability</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold font-display text-white tracking-tighter">74</span>
                <span className="text-sm font-mono font-black text-[#ddff00]">ms</span>
              </div>
            </div>
            <span className="bg-[#ddff00]/10 text-[#ddff00] text-[10px] font-mono font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-[#ddff00]/20">Last 7 Days</span>
          </div>
          
          {/* Simple SVG Chart Representation */}
          <div className="h-48 relative w-full flex items-end z-10">
            <svg viewBox="0 0 100 40" className="w-full h-full preserve-aspect-ratio-none" preserveAspectRatio="none">
              <path 
                d="M0,30 Q10,10 25,20 T50,35 T75,5 T90,35 L100,10" 
                fill="none" 
                stroke="#ddff00" 
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_15px_rgba(221,255,0,0.5)]"
              />
              <path 
                d="M0,30 Q10,10 25,20 T50,35 T75,5 T90,35 L100,10 L100,40 L0,40 Z" 
                fill="url(#accent-gradient)" 
                opacity="0.2"
              />
              <defs>
                <linearGradient id="accent-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ddff00" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ddff00" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-mono font-black text-white/30 tracking-[0.2em]">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span className="text-[#ddff00]">S</span>
            </div>
          </div>
        </motion.section>

        {/* Real Feel Log */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">Real Feel™ Log</h2>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-black text-[10px] font-mono font-black uppercase tracking-[0.2em] flex items-center gap-2 bg-[#ddff00] px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(221,255,0,0.3)]"
            >
              <Plus className="w-4 h-4" /> New Entry
            </motion.button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
            <motion.div 
              whileHover={{ y: -5 }}
              className="min-w-[160px] snap-start bg-white/5 backdrop-blur-md border border-[#ddff00]/30 rounded-[32px] p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/50 transition-colors cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#ddff00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Smile className="w-12 h-12 text-[#ddff00] mb-4 relative z-10 drop-shadow-[0_0_10px_rgba(221,255,0,0.5)]" />
              <p className="font-bold font-display text-white text-xl relative z-10">Strong</p>
              <p className="text-[10px] font-mono font-black text-[#ddff00]/70 uppercase tracking-[0.2em] mt-2 relative z-10">Readiness</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="min-w-[160px] snap-start bg-white/5 backdrop-blur-md border border-amber-500/30 rounded-[32px] p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group hover:border-amber-500/50 transition-colors cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sun className="w-12 h-12 text-amber-500 mb-4 relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <p className="font-bold font-display text-white text-xl relative z-10">Mid-Inflame</p>
              <p className="text-[10px] font-mono font-black text-amber-500/70 uppercase tracking-[0.2em] mt-2 relative z-10">Soreness</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="min-w-[160px] snap-start bg-white/5 backdrop-blur-md border border-blue-500/30 rounded-[32px] p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Moon className="w-12 h-12 text-blue-500 mb-4 relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <p className="font-bold font-display text-white text-xl relative z-10">Late</p>
              <p className="text-[10px] font-mono font-black text-blue-500/70 uppercase tracking-[0.2em] mt-2 relative z-10">Sleep</p>
            </motion.div>
          </div>
        </section>

        {/* Performance Fueling */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
            <h2 className="text-2xl font-bold font-display text-white tracking-tight">Performance Fueling</h2>
          </div>
          
          <div className="space-y-8">
            {/* Recipe 1 */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={() => setCurrentView?.('recipe')}
              className="bg-white/5 backdrop-blur-md rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group hover:border-[#ddff00]/30 transition-colors cursor-pointer"
            >
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800" 
                  alt="Salmon Bowl" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-6 right-6 bg-[#ddff00] text-black text-[10px] font-mono font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(221,255,0,0.4)]">
                  98% Match
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Pre-Workout Fuel
                  </p>
                  <h3 className="text-3xl font-bold font-display text-white group-hover:text-[#ddff00] transition-colors tracking-tight">Atlantic Salmon Power Bowl</h3>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-black/40 rounded-[20px] p-4 border border-white/5 text-center">
                    <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] mb-2">Prot</p>
                    <p className="font-bold font-display text-white text-2xl">42g</p>
                  </div>
                  <div className="bg-black/40 rounded-[20px] p-4 border border-white/5 text-center">
                    <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] mb-2">Carb</p>
                    <p className="font-bold font-display text-white text-2xl">65g</p>
                  </div>
                  <div className="bg-black/40 rounded-[20px] p-4 border border-white/5 text-center">
                    <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] mb-2">Fat</p>
                    <p className="font-bold font-display text-white text-2xl">18g</p>
                  </div>
                  <div className="bg-[#ddff00]/10 rounded-[20px] p-4 border border-[#ddff00]/20 text-center">
                    <p className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] mb-2">Cal</p>
                    <p className="font-bold font-display text-[#ddff00] text-2xl">590</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <span className="bg-white/5 text-white/80 text-[10px] font-mono font-black uppercase tracking-[0.2em] px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-[#ddff00]">⚡</span> B12 High
                  </span>
                  <span className="bg-white/5 text-white/80 text-[10px] font-mono font-black uppercase tracking-[0.2em] px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-[#ddff00]">💧</span> Omega 3
                  </span>
                  <span className="bg-white/5 text-white/80 text-[10px] font-mono font-black uppercase tracking-[0.2em] px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-[#ddff00]">🛡️</span> Anti-Inflam
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Recipe 2 */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={() => setCurrentView?.('recipe')}
              className="bg-white/5 backdrop-blur-md rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group hover:border-amber-500/30 transition-colors cursor-pointer"
            >
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" 
                  alt="Green Bowl" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-6 right-6 bg-amber-500 text-black text-[10px] font-mono font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  74% Match
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Micronutrient Boost
                  </p>
                  <h3 className="text-3xl font-bold font-display text-white group-hover:text-amber-500 transition-colors tracking-tight">Zen Greens & Seed Medley</h3>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-black/40 rounded-[20px] p-4 border border-white/5 text-center">
                    <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] mb-2">Prot</p>
                    <p className="font-bold font-display text-white text-2xl">12g</p>
                  </div>
                  <div className="bg-black/40 rounded-[20px] p-4 border border-white/5 text-center">
                    <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] mb-2">Carb</p>
                    <p className="font-bold font-display text-white text-2xl">22g</p>
                  </div>
                  <div className="bg-black/40 rounded-[20px] p-4 border border-white/5 text-center">
                    <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] mb-2">Fat</p>
                    <p className="font-bold font-display text-white text-2xl">14g</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-[20px] p-4 border border-amber-500/20 text-center">
                    <p className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Cal</p>
                    <p className="font-bold font-display text-amber-500 text-2xl">260</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <span className="bg-white/5 text-white/80 text-[10px] font-mono font-black uppercase tracking-[0.2em] px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-amber-500">🍃</span> High Fiber
                  </span>
                  <span className="bg-white/5 text-white/80 text-[10px] font-mono font-black uppercase tracking-[0.2em] px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-amber-500">🧪</span> Magnesium
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
