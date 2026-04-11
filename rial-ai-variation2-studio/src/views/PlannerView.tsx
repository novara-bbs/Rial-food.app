import React from 'react';
import { ArrowLeft, CalendarPlus, Clock, Utensils, PlayCircle, Archive, RefreshCw, Flame, TrendingUp, Timer, Zap, Calendar, ChevronRight } from "lucide-react";
import { motion } from 'motion/react';

interface PlannerViewProps {
  setCurrentView?: (view: string) => void;
}

export function PlannerView({ setCurrentView }: PlannerViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 h-20 max-w-3xl mx-auto">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentView?.('home')}
            className="flex items-center justify-center size-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#ddff00]" />
            <h1 className="text-xl font-bold tracking-tight font-display text-white">Meal Prep Schedule</h1>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center size-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <CalendarPlus className="w-6 h-6" />
          </motion.button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-8 space-y-12">
        {/* Hero Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative rounded-[40px] overflow-hidden shadow-2xl bg-white/5 border border-white/10 group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            
            <div className="relative p-10">
              <div className="inline-flex items-center gap-3 bg-[#ddff00] text-black px-4 py-2 rounded-xl text-[10px] font-mono font-black tracking-[0.2em] mb-6 shadow-[0_0_20px_rgba(221,255,0,0.4)]">
                <Zap className="w-4 h-4 fill-current" />
                UPCOMING SESSION
              </div>
              
              <h2 className="text-4xl font-bold text-white font-display mb-6 tracking-tighter">
                Sunday Afternoon Batch
              </h2>
              
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                  <Clock className="w-5 h-5 text-[#ddff00]" />
                  <span className="text-sm font-display font-bold text-white/80">2.5 hours planned</span>
                </div>
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                  <Utensils className="w-5 h-5 text-[#ddff00]" />
                  <span className="text-sm font-display font-bold text-white/80">12 Meals Total</span>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#ddff00] text-black font-black py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(221,255,0,0.3)] border border-[#ddff00]/50 font-mono uppercase tracking-[0.2em]"
              >
                <PlayCircle className="w-6 h-6" />
                Start Prep Session
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Date Strip */}
        <section>
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            {[
              { day: 'MON', date: '14' },
              { day: 'TUE', date: '15' },
              { day: 'WED', date: '16' },
              { day: 'THU', date: '17', active: true },
              { day: 'FRI', date: '18' },
              { day: 'SAT', date: '19' },
              { day: 'SUN', date: '20' },
            ].map((d, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -2 }}
                className={`flex flex-col items-center pb-4 px-3 relative cursor-pointer transition-colors ${d.active ? 'text-white' : 'text-white/20 hover:text-white/60'}`}
              >
                <span className="text-[10px] font-mono font-black tracking-[0.2em] mb-2">{d.day}</span>
                <span className={`text-2xl font-display ${d.active ? 'font-bold' : 'font-medium'}`}>{d.date}</span>
                {d.active && (
                  <motion.div 
                    layoutId="activeDay"
                    className="absolute bottom-0 left-0 w-full h-1 bg-[#ddff00] rounded-t-full shadow-[0_0_15px_#ddff00]" 
                  />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Daily Plan */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold font-display text-white tracking-tighter">Thursday, Oct 17</h3>
            <div className="bg-[#ddff00]/10 px-4 py-2 rounded-xl border border-[#ddff00]/20">
              <span className="text-[10px] font-mono font-black text-[#ddff00] tracking-[0.2em] uppercase">3 Meals Planned</span>
            </div>
          </div>

          {/* Meal 1 */}
          <motion.div 
            whileHover={{ x: 5, scale: 1.01 }}
            className="bg-white/5 rounded-[32px] p-5 flex gap-6 border border-white/10 shadow-2xl group hover:border-[#ddff00]/30 transition-colors cursor-pointer"
          >
            <img src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=200&auto=format&fit=crop" alt="Oats" className="w-28 h-28 rounded-2xl object-cover border border-white/10 group-hover:border-[#ddff00]/50 transition-colors" />
            <div className="flex-1 py-1 flex flex-col justify-center">
              <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                Breakfast • 08:30 AM
              </p>
              <h4 className="font-display font-bold text-xl text-white leading-tight mb-4 group-hover:text-[#ddff00] transition-colors">Overnight Oats w/ Berries</h4>
              <div className="flex items-center gap-2 text-[#ddff00] text-[10px] font-mono font-black bg-[#ddff00]/10 w-fit px-3 py-1.5 rounded-xl border border-[#ddff00]/20 uppercase tracking-widest">
                <Archive className="w-4 h-4" />
                Prepped Session A
              </div>
            </div>
            <div className="flex items-center pr-2">
              <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-[#ddff00] transition-colors" />
            </div>
          </motion.div>

          {/* Meal 2 */}
          <motion.div 
            whileHover={{ x: 5, scale: 1.01 }}
            className="bg-white/5 rounded-[32px] p-5 flex gap-6 border border-[#ddff00]/30 shadow-[0_0_30px_rgba(221,255,0,0.1)] relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-[#ddff00] rounded-r-full shadow-[0_0_15px_#ddff00]" />
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop" alt="Bowl" className="w-28 h-28 rounded-2xl object-cover ml-3 border border-[#ddff00]/20" />
            <div className="flex-1 py-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
                  Lunch • 12:45 PM
                </p>
                <span className="bg-[#ddff00] text-black text-[9px] font-mono font-black px-2 py-1 rounded-lg uppercase tracking-widest">Leftover Logic</span>
              </div>
              <h4 className="font-display font-bold text-xl text-white leading-tight mb-2">Roasted Roots Harvest Bowl</h4>
              <p className="text-[10px] text-white/40 font-mono font-bold mb-4 uppercase tracking-widest">Base: Roasted Roots (Day 1 Batch)</p>
              <div className="flex items-center gap-2 text-white/60 text-[10px] font-mono font-black uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/10">
                <RefreshCw className="w-4 h-4 text-[#ddff00]" />
                Utilizing 1/3 of base
              </div>
            </div>
            <div className="flex items-center pr-2">
              <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-[#ddff00] transition-colors" />
            </div>
          </motion.div>

          {/* Meal 3 */}
          <motion.div 
            whileHover={{ x: 5, scale: 1.01 }}
            className="bg-white/5 rounded-[32px] p-5 flex gap-6 border border-white/10 shadow-2xl group hover:border-amber-500/30 transition-colors cursor-pointer"
          >
            <img src="https://images.unsplash.com/photo-1432139555190-58524dae6a5a?q=80&w=200&auto=format&fit=crop" alt="Chicken" className="w-28 h-28 rounded-2xl object-cover border border-white/10 group-hover:border-amber-500/50 transition-colors" />
            <div className="flex-1 py-1 flex flex-col justify-center">
              <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                Dinner • 07:15 PM
              </p>
              <h4 className="font-display font-bold text-xl text-white leading-tight mb-4 group-hover:text-amber-500 transition-colors">Lemon Asparagus Chicken</h4>
              <div className="flex items-center gap-2 text-amber-500 text-[10px] font-mono font-black bg-amber-500/10 w-fit px-3 py-1.5 rounded-xl border border-amber-500/20 uppercase tracking-widest">
                <Flame className="w-4 h-4" />
                Fresh Prep (15m)
              </div>
            </div>
            <div className="flex items-center pr-2">
              <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-[#ddff00] transition-colors" />
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-6 pb-12">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/5 rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-16 h-16 text-[#ddff00]" />
            </div>
            <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.3em] mb-4 relative z-10">Weekly Efficiency</p>
            <div className="flex items-end gap-2 mb-3 relative z-10">
              <span className="text-5xl font-display font-bold text-white tracking-tighter">84%</span>
            </div>
            <p className="text-xs font-medium text-white/40 relative z-10">Prepped vs. Fresh meals</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/5 rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Timer className="w-16 h-16 text-[#ddff00]" />
            </div>
            <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.3em] mb-4 relative z-10">Time Saved</p>
            <div className="flex items-end gap-2 mb-3 relative z-10">
              <span className="text-5xl font-display font-bold text-white tracking-tighter">4.2h</span>
            </div>
            <p className="text-xs font-medium text-white/40 relative z-10">Estimated this week</p>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
