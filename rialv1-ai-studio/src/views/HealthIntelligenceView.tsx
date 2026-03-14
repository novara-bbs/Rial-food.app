import React from 'react';
import { ArrowLeft, Share2, Zap, Droplets, Utensils, Activity, Target, Shield } from 'lucide-react';

export function HealthIntelligenceView() {
  return (
    <div className="pb-24 bg-background-dark min-h-screen text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <nav className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto">
          <button className="flex size-10 items-center justify-center rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h2 className="text-lg font-bold tracking-tight font-display text-white">Health Intelligence</h2>
          <button className="flex size-10 items-center justify-center rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors">
            <Share2 className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4">
        <header className="py-8 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10"></div>
          
          <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-6">Vitality Score</h3>
          
          <div className="relative inline-flex items-center justify-center">
            <svg className="size-56 transform -rotate-90 drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <circle className="text-white/5" cx="112" cy="112" fill="transparent" r="100" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-primary transition-all duration-1000 ease-out" cx="112" cy="112" fill="transparent" r="100" stroke="currentColor" strokeDasharray="628.3" strokeDashoffset="100.5" strokeWidth="8" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold font-display text-white tracking-tighter">84</span>
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mt-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Optimal</span>
            </div>
          </div>
          
          <p className="mt-8 text-slate-400 font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
            Your micronutrient status is performing <span className="text-white font-bold">12% better</span> than last week.
          </p>
        </header>

        <section className="space-y-4 mt-4">
          <div className="flex items-center justify-between px-1 mb-6">
            <h2 className="text-lg font-bold tracking-tight font-display flex items-center gap-2 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Bio-active Alerts
            </h2>
            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md uppercase tracking-wider">3 New</span>
          </div>
          
          <div className="bg-surface-dark p-5 rounded-2xl shadow-lg border border-white/5 flex gap-4 items-start group hover:border-amber-500/30 transition-colors">
            <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white font-display tracking-tight">Magnesium levels low</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Associated with recent fatigue reports. Try adding <span className="text-amber-400 font-medium">Spinach</span> or <span className="text-amber-400 font-medium">Pumpkin Seeds</span> to your dinner.</p>
            </div>
          </div>
          
          <div className="bg-surface-dark p-5 rounded-2xl shadow-lg border border-white/5 flex gap-4 items-start group hover:border-blue-500/30 transition-colors">
            <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white font-display tracking-tight">Hydration Variance</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Correlation found: Low water intake is spiking your cortisol. Aim for <span className="text-blue-400 font-medium">400ml</span> in the next hour.</p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight px-1 mb-6 font-display flex items-center gap-2 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            Nutrient Correlation
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 shadow-lg hover:border-white/10 transition-colors">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Vitamin D</span>
              <div className="text-2xl font-bold font-display mt-1 text-white">72%</div>
              <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[72%] transition-all duration-1000 relative">
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 shadow-lg hover:border-white/10 transition-colors">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Iron Status</span>
              <div className="text-2xl font-bold font-display mt-1 text-white">91%</div>
              <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[91%] transition-all duration-1000 relative">
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 shadow-lg hover:border-white/10 transition-colors">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Zinc</span>
              <div className="text-2xl font-bold font-display mt-1 text-white">45%</div>
              <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[45%] transition-all duration-1000 relative">
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 shadow-lg hover:border-white/10 transition-colors">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Omega 3</span>
              <div className="text-2xl font-bold font-display mt-1 text-white">88%</div>
              <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[88%] transition-all duration-1000 relative">
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 mb-8">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-3xl p-6 text-white overflow-hidden relative shadow-[0_0_30px_rgba(20,184,166,0.15)] group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800')] opacity-10 bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Smart Recommendation</span>
              </div>
              <h3 className="text-2xl font-bold font-display tracking-tight mb-2">Grilled Salmon Salad</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-[250px]">
                Optimized with Walnut garnish to address your current Omega 3 and Magnesium needs.
              </p>
              <button className="bg-primary text-background-dark px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Get Recipe
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
