import React from 'react';
import { ArrowLeft, Share, Zap, CheckCircle, Users, Activity, Target } from 'lucide-react';

export function ChallengeDetailView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Top Navigation */}
      <div className="flex items-center p-4 pb-2 justify-between sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="text-slate-300 hover:text-white flex w-12 h-12 shrink-0 items-center justify-center cursor-pointer bg-surface-dark rounded-full border border-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <h2 className="text-white text-lg font-bold font-display leading-tight tracking-tight flex-1 text-center">Challenge Detail</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex items-center justify-center rounded-full w-12 h-12 bg-surface-dark text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="px-4 py-4">
          <div className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-surface-dark rounded-3xl min-h-[400px] relative group border border-white/5 shadow-2xl" 
               style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800")' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent group-hover:scale-105 transition-transform duration-1000" />
            <div className="flex flex-col p-8 gap-3 relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit border border-primary/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <Zap className="w-3.5 h-3.5 text-background-dark" />
                <span className="text-background-dark text-[10px] font-mono font-bold uppercase tracking-widest">Active Sprint</span>
              </div>
              <h1 className="text-white tracking-tight text-4xl md:text-5xl font-bold font-display leading-tight mt-2">7-Day Real Food Sprint</h1>
              <p className="text-slate-300 text-sm md:text-base max-w-md leading-relaxed mt-2">Master your nutrition by eliminating processed ingredients and embracing nature's finest fuel.</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex min-w-[100px] flex-1 flex-col gap-2 rounded-3xl p-5 bg-surface-dark border border-white/5 shadow-lg group hover:border-white/10 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Participants</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-white font-display text-3xl font-bold leading-none">1.2k</p>
              <span className="text-primary text-[10px] font-mono font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 mb-1">+12%</span>
            </div>
          </div>
          <div className="flex min-w-[100px] flex-1 flex-col gap-2 rounded-3xl p-5 bg-surface-dark border border-white/5 shadow-lg group hover:border-white/10 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Days Left</p>
            <p className="text-white font-display text-3xl font-bold leading-none mt-1">4</p>
          </div>
          <div className="flex min-w-[100px] flex-1 flex-col gap-2 rounded-3xl p-5 bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.1)] group hover:border-primary/40 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-12 h-12 text-primary" />
            </div>
            <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Avg Match</p>
            <p className="text-primary font-display text-3xl font-bold leading-none mt-1">88%</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col px-4 gap-6 mt-4">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <h2 className="text-white text-2xl font-bold font-display leading-tight tracking-tight">Challenge Overview</h2>
            </div>
            <div className="bg-surface-dark rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl">
              <p className="text-slate-300 leading-relaxed mb-8 text-sm md:text-base">
                Reset your metabolism and reclaim your energy. For the next 7 days, we commit to consuming only "Real Food" — items with single-ingredient labels or no labels at all. 
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-background-dark/50 border border-white/5">
                  <div className="mt-0.5">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 leading-relaxed">Zero added sugars or sweeteners</span>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-background-dark/50 border border-white/5">
                  <div className="mt-0.5">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 leading-relaxed">No refined vegetable oils</span>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-background-dark/50 border border-white/5">
                  <div className="mt-0.5">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 leading-relaxed">Whole grains and root vegetables only</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
          <button className="w-full bg-primary text-background-dark py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-primary/50">
            <Zap className="w-5 h-5" />
            <span className="font-display tracking-wide">Join Challenge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
