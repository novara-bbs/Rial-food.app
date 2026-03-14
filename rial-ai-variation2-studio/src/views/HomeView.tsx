import React from 'react';
import { Zap, Utensils, BarChart2, Check, ChevronRight, TrendingUp, Minus, BookOpen, ShoppingCart, Activity, Search, RefreshCw, Shield, Scan, Target, Compass, Refrigerator, Rocket, FlaskConical, User, Bell, HeartPulse } from "lucide-react";
import { motion } from 'motion/react';

interface HomeViewProps {
  setCurrentView?: (view: string) => void;
}

export function HomeView({ setCurrentView }: HomeViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 p-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="flex size-12 items-center justify-center rounded-2xl bg-[#ddff00]/10 text-[#ddff00] border border-[#ddff00]/20 shadow-[0_0_20px_rgba(221,255,0,0.1)]"
            >
              <Zap className="w-6 h-6" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-white leading-none">RIAL</h1>
              <p className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] mt-1">Human-Centric Precision</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white relative"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-3 right-3 flex h-2.5 w-2.5 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView?.('profile')}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ddff00] to-emerald-400 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" 
                alt="Profile" 
                className="relative size-12 rounded-full border-2 border-black object-cover shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="relative rounded-[40px] overflow-hidden bg-white/5 border border-white/10 shadow-2xl group">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="relative p-10 pt-16">
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#ddff00] animate-pulse shadow-[0_0_10px_#ddff00]" />
                    <p className="text-[#ddff00] font-mono text-[10px] font-black tracking-[0.2em] uppercase">Morning Protocol</p>
                  </div>
                  <h2 className="text-4xl font-bold font-display tracking-tight text-white leading-[1.1]">Good morning,<br />Alex Rivera</h2>
                  <p className="text-white/60 text-base max-w-[280px] leading-relaxed font-medium">Optimal window for high-intensity focus and metabolic priming.</p>
                </div>
                <div className="text-right">
                  <p className="text-white/20 text-[10px] font-mono font-black tracking-[0.3em] uppercase mb-3">Real Feel™</p>
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-7xl font-bold text-[#ddff00] font-display tracking-tighter drop-shadow-[0_0_20px_rgba(221,255,0,0.3)]">88</span>
                    <span className="text-white/20 font-mono text-xl font-bold">/100</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView?.('planner')}
                  className="flex-1 bg-[#ddff00] text-black h-16 rounded-[24px] font-black text-sm shadow-[0_0_30px_rgba(221,255,0,0.2)] transition-all flex items-center justify-center gap-3 uppercase tracking-widest font-mono"
                >
                  <Rocket className="w-5 h-5" />
                  Start Routine
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView?.('insights')}
                  className="flex-1 bg-white/5 backdrop-blur-md text-white h-16 rounded-[24px] font-black text-sm border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest font-mono"
                >
                  <Activity className="w-5 h-5 text-white/40" />
                  Analyze
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Row */}
        <section className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Energy', value: 'High', trend: '+5%', icon: Zap, color: '#ddff00' },
            { label: 'Recovery', value: '92%', trend: 'Peak', icon: HeartPulse, color: '#10b981' },
            { label: 'Focus', value: 'Sharp', trend: 'Stable', icon: Target, color: '#f59e0b' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 rounded-[32px] p-6 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-colors shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-12 h-12" style={{ color: stat.color }} />
              </div>
              <p className="text-white/30 text-[10px] font-mono font-black uppercase tracking-[0.2em] mb-3 relative z-10">{stat.label}</p>
              <p className="text-2xl font-bold font-display text-white mb-2 relative z-10">{stat.value}</p>
              <div 
                className="text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-1 relative z-10 w-fit px-2.5 py-1 rounded-lg border"
                style={{ color: stat.color, backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20` }}
              >
                {stat.trend === 'Peak' ? <Check className="w-3.5 h-3.5" /> : stat.trend === 'Stable' ? <Minus className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {stat.trend}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Newest Features Grid */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
            <h3 className="text-2xl font-display font-bold text-white">New Additions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'plandiscovery', title: 'Plan Discovery', sub: 'Community Feed', icon: Compass },
              { id: 'kitcheninventory', title: 'Kitchen Inventory', sub: 'Smart Stock Levels', icon: Refrigerator },
              { id: 'challengedetail', title: 'Challenge Detail', sub: '7-Day Sprint', icon: Rocket },
              { id: 'biometriclab', title: 'Biometric Lab', sub: 'Advanced Comparison', icon: FlaskConical }
            ].map((item, i) => (
              <motion.button 
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView?.(item.id)}
                className="bg-white/5 rounded-[32px] p-6 flex flex-col gap-5 border border-white/10 hover:bg-white/10 transition-all text-left group shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ddff00]/5 rounded-full blur-3xl group-hover:bg-[#ddff00]/10 transition-colors" />
                <div className="bg-black text-white/40 size-14 rounded-2xl flex items-center justify-center border border-white/10 group-hover:text-[#ddff00] group-hover:border-[#ddff00]/30 transition-all relative z-10">
                  <item.icon className="w-7 h-7" />
                </div>
                <div className="relative z-10">
                  <p className="font-bold text-white font-display text-xl group-hover:text-[#ddff00] transition-colors">{item.title}</p>
                  <p className="text-white/30 text-[10px] font-mono font-black uppercase tracking-[0.2em] mt-2">{item.sub}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Core Modules */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-2 h-2 rounded-full bg-white/20"></span>
            <h3 className="text-2xl font-display font-bold text-white">Core Modules</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'kitchen', title: 'Kitchen Hub', sub: 'Community & Leftovers', icon: Search, color: '#6366f1' },
              { id: 'healthintel', title: 'RIAL Intel', sub: 'Bio-sync & Correlations', icon: RefreshCw, color: '#ddff00' },
              { id: 'master', title: 'RIAL Master', sub: 'Pro Athlete Edition', icon: Shield, color: '#3b82f6' },
              { id: 'biometric', title: 'Biometric Match', sub: 'Synergy calculation', icon: Activity, color: '#f97316' }
            ].map((item, i) => (
              <motion.button 
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView?.(item.id)}
                className="bg-white/5 rounded-[32px] p-6 flex flex-col gap-5 border border-white/10 hover:bg-white/10 transition-all text-left group shadow-2xl"
              >
                <div 
                  className="size-14 rounded-2xl flex items-center justify-center border transition-all"
                  style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}20`, color: item.color }}
                >
                  <item.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-white font-display text-xl group-hover:text-white transition-colors">{item.title}</p>
                  <p className="text-white/30 text-[10px] font-mono font-black uppercase tracking-[0.2em] mt-2">{item.sub}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Utility Section */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-2 h-2 rounded-full bg-white/20"></span>
            <h3 className="text-2xl font-display font-bold text-white">Utility</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'recipe', title: 'Recipe Master', sub: 'Artisan selections', icon: Utensils },
              { id: 'journal', title: 'Today\'s Log', sub: 'Real feel timeline', icon: TrendingUp }
            ].map((item, i) => (
              <motion.button 
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView?.(item.id)}
                className="bg-white/5 rounded-[32px] p-6 flex flex-col gap-5 border border-white/10 hover:bg-white/10 transition-all text-left group shadow-2xl"
              >
                <div className="bg-black text-white/40 size-14 rounded-2xl flex items-center justify-center border border-white/10 group-hover:text-[#ddff00] group-hover:border-[#ddff00]/30 transition-all">
                  <item.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-white font-display text-xl group-hover:text-[#ddff00] transition-colors">{item.title}</p>
                  <p className="text-white/30 text-[10px] font-mono font-black uppercase tracking-[0.2em] mt-2">{item.sub}</p>
                </div>
              </motion.button>
            ))}

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setCurrentView?.('shopping')}
              className="col-span-2 bg-[#ddff00] text-black rounded-[40px] p-8 flex items-center justify-between shadow-[0_0_40px_rgba(221,255,0,0.2)] transition-all group border border-[#ddff00]/50"
            >
              <div className="flex items-center gap-6">
                <div className="bg-black/10 p-4 rounded-[24px] border border-black/5">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-3xl font-display leading-tight tracking-tight">Smart Shopping</p>
                  <p className="text-black/50 text-xs font-black font-mono uppercase tracking-[0.2em] mt-1.5">16 items remaining</p>
                </div>
              </div>
              <ChevronRight className="w-10 h-10 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </div>
        </section>

        {/* Daily Schedule */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-white/20"></span>
              <h3 className="text-2xl font-display font-bold text-white">Daily Schedule</h3>
            </div>
            <button className="text-[#ddff00] font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#ddff00]/80 transition-colors">View All</button>
          </div>
          
          <div className="space-y-6">
            <motion.div 
              whileHover={{ x: 5 }}
              className="bg-white/5 rounded-[40px] p-8 flex items-center gap-8 border border-white/10 relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors cursor-pointer shadow-2xl"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ddff00]" />
              <div className="w-20 text-center shrink-0">
                <p className="font-mono font-black text-white text-2xl tracking-tighter">08:00</p>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white font-display text-2xl group-hover:text-[#ddff00] transition-colors">Morning Supplements</p>
                <p className="text-white/30 text-[10px] font-mono font-black uppercase tracking-[0.2em] mt-2">Magnesium & Vitamin D</p>
              </div>
              <div className="size-14 rounded-full bg-[#ddff00]/10 flex items-center justify-center text-[#ddff00] border border-[#ddff00]/20 shadow-[0_0_20px_rgba(221,255,0,0.1)]">
                <Check className="w-7 h-7" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 5 }}
              className="bg-white/5 rounded-[40px] p-8 flex items-center gap-8 border border-white/5 opacity-40 hover:opacity-100 transition-all cursor-pointer group"
            >
              <div className="w-20 text-center shrink-0">
                <p className="font-mono font-black text-white/40 text-2xl tracking-tighter group-hover:text-white transition-colors">12:30</p>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white/40 font-display text-2xl group-hover:text-white transition-colors">High Protein Lunch</p>
                <p className="text-white/20 text-[10px] font-mono font-black uppercase tracking-[0.2em] mt-2 group-hover:text-white/40 transition-colors">Chicken & Quinoa Bowl</p>
              </div>
              <div className="size-14 rounded-full bg-white/5 flex items-center justify-center text-white/20 border border-white/5 group-hover:text-white/40 transition-colors">
                <ChevronRight className="w-7 h-7" />
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
