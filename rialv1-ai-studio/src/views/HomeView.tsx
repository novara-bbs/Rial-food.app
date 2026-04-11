import React from 'react';
import { Zap, Utensils, BarChart2, Check, ChevronRight, TrendingUp, Minus, BookOpen, ShoppingCart, Activity, Search, RefreshCw, Shield, Scan, Target, Compass, Refrigerator, Rocket, FlaskConical, User, Bell, HeartPulse } from "lucide-react";

interface HomeViewProps {
  setCurrentView?: (view: string) => void;
}

export function HomeView({ setCurrentView }: HomeViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display leading-tight text-white">RIAL</h1>
              <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Human-Centric Precision</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
            </button>
            <button 
              onClick={() => setCurrentView?.('profile')}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-emerald-400 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" 
                alt="Profile" 
                className="relative size-10 rounded-full border border-white/10 object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <section className="px-4 pt-6 pb-8">
          <div className="relative rounded-[32px] overflow-hidden bg-surface-dark border border-white/10 shadow-2xl group">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent" />
            
            <div className="relative p-8 pt-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                    <p className="text-primary font-mono text-[10px] font-bold tracking-widest uppercase">Morning Protocol</p>
                  </div>
                  <h2 className="text-4xl font-bold font-display mb-2 tracking-tight text-white">Good morning,<br />Alex Rivera</h2>
                  <p className="text-slate-300 text-sm max-w-[240px] leading-relaxed font-medium">Optimal window for high-intensity focus and metabolic priming.</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px] font-mono font-bold tracking-widest uppercase mb-2">Real Feel™</p>
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-6xl font-bold text-primary font-display tracking-tighter drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]">88</span>
                    <span className="text-primary/50 font-mono text-lg font-bold">/100</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-background-dark h-12 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Start Routine
                </button>
                <button className="flex-1 bg-white/10 backdrop-blur-md text-white h-12 rounded-2xl font-bold text-sm border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" />
                  Analyze
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="px-4 grid grid-cols-3 gap-4 mb-10">
          <div className="bg-surface-dark rounded-3xl p-5 border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors shadow-lg">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-10 h-10 text-primary" />
            </div>
            <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-2 relative z-10">Energy</p>
            <p className="text-2xl font-bold font-display text-white mb-1 relative z-10">High</p>
            <p className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1 relative z-10 bg-primary/10 w-fit px-2 py-0.5 rounded border border-primary/20">
              <TrendingUp className="w-3 h-3" /> +5%
            </p>
          </div>
          <div className="bg-surface-dark rounded-3xl p-5 border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors shadow-lg">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <HeartPulse className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-2 relative z-10">Recovery</p>
            <p className="text-2xl font-bold font-display text-white mb-1 relative z-10">92%</p>
            <p className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1 relative z-10 bg-emerald-500/10 w-fit px-2 py-0.5 rounded border border-emerald-500/20">
              <Check className="w-3 h-3" /> Peak
            </p>
          </div>
          <div className="bg-surface-dark rounded-3xl p-5 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-colors shadow-lg">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="w-10 h-10 text-amber-500" />
            </div>
            <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-2 relative z-10">Focus</p>
            <p className="text-2xl font-bold font-display text-white mb-1 relative z-10">Sharp</p>
            <p className="text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1 relative z-10 bg-amber-500/10 w-fit px-2 py-0.5 rounded border border-amber-500/20">
              <Minus className="w-3 h-3" /> Stable
            </p>
          </div>
        </section>

        {/* Newest Features Grid */}
        <section className="px-4 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <h3 className="text-xl font-bold font-display text-white">New Additions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setCurrentView?.('plandiscovery')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-primary/30 active:scale-[0.98] transition-all text-left group shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="bg-background-dark text-slate-300 size-12 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all relative z-10">
                <Compass className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <p className="font-bold text-white font-display text-lg group-hover:text-primary transition-colors">Plan Discovery</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Community Feed</p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView?.('kitcheninventory')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-primary/30 active:scale-[0.98] transition-all text-left group shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="bg-background-dark text-slate-300 size-12 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all relative z-10">
                <Refrigerator className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <p className="font-bold text-white font-display text-lg group-hover:text-primary transition-colors">Kitchen Inventory</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Smart Stock Levels</p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView?.('challengedetail')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-primary/30 active:scale-[0.98] transition-all text-left group shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="bg-background-dark text-slate-300 size-12 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all relative z-10">
                <Rocket className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <p className="font-bold text-white font-display text-lg group-hover:text-primary transition-colors">Challenge Detail</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">7-Day Sprint</p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView?.('biometriclab')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-primary/30 active:scale-[0.98] transition-all text-left group shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="bg-background-dark text-slate-300 size-12 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all relative z-10">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <p className="font-bold text-white font-display text-lg group-hover:text-primary transition-colors">Biometric Lab</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Advanced Comparison</p>
              </div>
            </button>
          </div>
        </section>

        {/* Core Modules */}
        <section className="px-4 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            <h3 className="text-xl font-bold font-display text-white">Core Modules</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setCurrentView?.('kitchen')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-indigo-500/30 active:scale-[0.98] transition-all text-left group shadow-lg"
            >
              <div className="bg-indigo-500/10 text-indigo-400 size-12 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white font-display text-lg group-hover:text-indigo-400 transition-colors">Kitchen Hub</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Community & Leftovers</p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView?.('healthintel')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-primary/30 active:scale-[0.98] transition-all text-left group shadow-lg"
            >
              <div className="bg-primary/10 text-primary size-12 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white font-display text-lg group-hover:text-primary transition-colors">RIAL Intel</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Bio-sync & Correlations</p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView?.('master')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-blue-500/30 active:scale-[0.98] transition-all text-left group shadow-lg"
            >
              <div className="bg-blue-500/10 text-blue-400 size-12 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white font-display text-lg group-hover:text-blue-400 transition-colors">RIAL Master</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Pro Athlete Edition</p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView?.('biometric')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-orange-500/30 active:scale-[0.98] transition-all text-left group shadow-lg"
            >
              <div className="bg-orange-500/10 text-orange-400 size-12 rounded-2xl flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white font-display text-lg group-hover:text-orange-400 transition-colors">Biometric Match</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Synergy calculation</p>
              </div>
            </button>
          </div>
        </section>

        {/* Utility Section */}
        <section className="px-4 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            <h3 className="text-xl font-bold font-display text-white">Utility</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setCurrentView?.('recipe')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-primary/30 active:scale-[0.98] transition-all text-left group shadow-lg"
            >
              <div className="bg-background-dark text-slate-300 size-12 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white font-display text-lg group-hover:text-primary transition-colors">Recipe Master</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Artisan selections</p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView?.('journal')}
              className="bg-surface-dark rounded-[24px] p-5 flex flex-col gap-4 border border-white/5 hover:border-primary/30 active:scale-[0.98] transition-all text-left group shadow-lg"
            >
              <div className="bg-background-dark text-slate-300 size-12 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white font-display text-lg group-hover:text-primary transition-colors">Today's Log</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Real feel timeline</p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView?.('shopping')}
              className="col-span-2 bg-primary text-background-dark rounded-[24px] p-6 flex items-center justify-between shadow-[0_0_25px_rgba(20,184,166,0.2)] active:scale-[0.98] transition-all hover:bg-primary/90 group"
            >
              <div className="flex items-center gap-5">
                <div className="bg-background-dark/10 p-3 rounded-2xl border border-background-dark/5">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-2xl font-display leading-tight">Smart Shopping</p>
                  <p className="text-background-dark/70 text-sm font-bold font-mono uppercase tracking-widest mt-1">16 items remaining</p>
                </div>
              </div>
              <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Daily Schedule */}
        <section className="px-4">
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <h3 className="text-xl font-bold font-display text-white">Daily Schedule</h3>
            </div>
            <button className="text-primary font-mono text-[10px] font-bold uppercase tracking-widest hover:text-primary/80 transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-surface-dark rounded-[24px] p-5 flex items-center gap-5 border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors cursor-pointer shadow-lg">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
              <div className="w-14 text-center shrink-0">
                <p className="font-mono font-bold text-white text-lg">08:00</p>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white font-display text-lg group-hover:text-primary transition-colors">Morning Supplements</p>
                <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Magnesium & Vitamin D</p>
              </div>
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                <Check className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-surface-dark/40 rounded-[24px] p-5 flex items-center gap-5 border border-white/5 opacity-60 hover:opacity-100 transition-all cursor-pointer">
              <div className="w-14 text-center shrink-0">
                <p className="font-mono font-bold text-slate-500 text-lg">12:30</p>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-400 font-display text-lg">High Protein Lunch</p>
                <p className="text-slate-600 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">Chicken & Quinoa Bowl</p>
              </div>
              <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-600 border border-white/5">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
