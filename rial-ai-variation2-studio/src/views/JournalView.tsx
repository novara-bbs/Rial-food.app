import React from 'react';
import { Calendar, TrendingUp, Plus, Coffee, Info, CheckCircle2, Activity, Zap, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

interface JournalViewProps {
  setCurrentView?: (view: string) => void;
}

export function JournalView({ setCurrentView }: JournalViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black text-white selection:bg-[#ddff00] selection:text-black">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView?.('home')}
              className="flex items-center justify-center size-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#ddff00]/10 text-[#ddff00] border border-[#ddff00]/20 shadow-[0_0_15px_rgba(221,255,0,0.15)]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display text-white">Today's Log</h1>
              <p className="text-[10px] text-white/50 font-mono font-black uppercase tracking-widest mt-1">Tuesday, Oct 24</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView?.('insights')}
            className="flex items-center justify-center size-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <TrendingUp className="w-6 h-6" />
          </motion.button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-8 px-6">
        {/* Daily Stats Row */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
          <motion.div 
            whileHover={{ y: -2 }}
            className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-[32px] p-6 bg-white/5 shadow-2xl border border-white/10 relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Coffee className="w-12 h-12 text-[#ddff00]" />
            </div>
            <p className="text-[10px] text-white/50 font-mono font-black uppercase tracking-widest relative z-10">Meals</p>
            <p className="text-4xl font-bold font-display text-white relative z-10 tracking-tighter">3</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -2 }}
            className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-[32px] p-6 bg-white/5 shadow-2xl border border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-12 h-12 text-amber-500" />
            </div>
            <p className="text-[10px] text-white/50 font-mono font-black uppercase tracking-widest relative z-10">Avg Energy</p>
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-amber-500 text-2xl">⚡</span>
              <p className="text-3xl font-bold font-display text-white tracking-tighter">High</p>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -2 }}
            className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-[32px] p-6 bg-white/5 shadow-2xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Droplets className="w-12 h-12 text-emerald-500" />
            </div>
            <p className="text-[10px] text-white/50 font-mono font-black uppercase tracking-widest relative z-10">Digestion</p>
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-emerald-500 text-2xl">😊</span>
              <p className="text-3xl font-bold font-display text-white tracking-tighter">Good</p>
            </div>
          </motion.div>
        </div>

        {/* Timeline Section */}
        <div className="py-6">
          <div className="flex items-center gap-3 mb-10">
            <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
            <h2 className="text-2xl font-bold font-display text-white tracking-tight">Real Feel Timeline</h2>
          </div>
          
          <div className="relative space-y-12 before:absolute before:inset-0 before:ml-7 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#ddff00]/50 before:via-white/10 before:to-transparent">
            
            {/* Entry 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative flex items-start group"
            >
              <div className="absolute left-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-[#ddff00]/50 z-10 shadow-[0_0_20px_rgba(221,255,0,0.2)] group-hover:scale-110 transition-transform">
                <Coffee className="text-[#ddff00] w-6 h-6" />
              </div>
              <div className="ml-20 flex-1">
                <div className="flex flex-col gap-5 bg-white/5 p-6 rounded-[32px] shadow-2xl border border-white/10 group-hover:border-[#ddff00]/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-white font-display tracking-tight">Breakfast Bowl</h3>
                      <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest mt-1.5">8:15 AM</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-black uppercase tracking-widest">Energy: High</span>
                    </div>
                  </div>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 relative group-hover:border-[#ddff00]/20 transition-colors">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      alt="Oatmeal bowl with berries" 
                      src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-medium">Feeling vibrant and ready for the day. Digestion feels light.</p>
                  <div className="flex gap-2 items-center bg-emerald-500/10 w-fit px-4 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-400 w-4 h-4" />
                    <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">Digestion: Perfect</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Entry 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative flex items-start group"
            >
              <div className="absolute left-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-white/10 z-10 shadow-lg group-hover:border-white/30 transition-colors">
                <span className="text-white/60 text-xl">🍽️</span>
              </div>
              <div className="ml-20 flex-1">
                <div className="flex flex-col gap-5 bg-white/5 p-6 rounded-[32px] shadow-2xl border border-white/10 group-hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-white font-display tracking-tight">Salmon & Greens</h3>
                      <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest mt-1.5">1:30 PM</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-3 py-1.5 rounded-lg bg-[#ddff00]/10 text-[#ddff00] border border-[#ddff00]/20 text-[10px] font-mono font-black uppercase tracking-widest">Energy: Stable</span>
                    </div>
                  </div>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 relative group-hover:border-white/20 transition-colors">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      alt="Salmon salad" 
                      src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-medium">Great lunch, but felt a bit sleepy 30 mins after. Might need more complex carbs next time.</p>
                  <div className="flex gap-2 items-center bg-amber-500/10 w-fit px-4 py-2 rounded-xl border border-amber-500/20">
                    <Info className="text-amber-400 w-4 h-4" />
                    <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">Digestion: Slower</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Entry 3 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative flex items-start group"
            >
              <div className="absolute left-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-white/10 z-10 shadow-lg group-hover:border-white/30 transition-colors">
                <span className="text-white/60 text-xl">🍫</span>
              </div>
              <div className="ml-20 flex-1">
                <div className="flex flex-col gap-5 bg-white/5 p-6 rounded-[32px] shadow-2xl border border-white/10 group-hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-white font-display tracking-tight">Dark Chocolate Square</h3>
                      <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest mt-1.5">4:00 PM</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 border border-white/10 text-[10px] font-mono font-black uppercase tracking-widest">Energy: Neutral</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-medium">Quick pick-me-up. Real feel is good, no bloating.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
