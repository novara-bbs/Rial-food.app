import React from 'react';
import { ArrowLeft, Share2, Zap, Droplets, Utensils, Activity, Target, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface HealthIntelligenceViewProps {
  setCurrentView?: (view: string) => void;
}

export function HealthIntelligenceView({ setCurrentView }: HealthIntelligenceViewProps) {
  return (
    <div className="pb-24 bg-black min-h-screen text-slate-100 selection:bg-[#ddff00] selection:text-black">
      <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center p-6 justify-between max-w-3xl mx-auto">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex w-12 h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h2 className="text-xl font-bold tracking-tight font-display text-white">Health Intelligence</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex w-12 h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6">
        <header className="py-12 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ddff00]/10 rounded-full blur-[100px] -z-10"></div>
          
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono font-black uppercase tracking-[0.2em] text-white/40 mb-8"
          >
            Vitality Score
          </motion.h3>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative inline-flex items-center justify-center"
          >
            <svg className="size-64 transform -rotate-90 drop-shadow-[0_0_20px_rgba(221,255,0,0.2)]">
              <circle className="text-white/5" cx="128" cy="128" fill="transparent" r="116" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-[#ddff00] transition-all duration-1000 ease-out" cx="128" cy="128" fill="transparent" r="116" stroke="currentColor" strokeDasharray="728.8" strokeDashoffset="116.6" strokeWidth="8" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-bold font-display text-white tracking-tighter">84</span>
              <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] mt-2 bg-[#ddff00]/10 px-3 py-1 rounded-md border border-[#ddff00]/20">Optimal</span>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-white/60 font-medium text-base leading-relaxed max-w-xs mx-auto"
          >
            Your micronutrient status is performing <span className="text-white font-bold">12% better</span> than last week.
          </motion.p>
        </header>

        <section className="space-y-4 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tighter font-display flex items-center gap-3 text-white">
              <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
              Bio-active Alerts
            </h2>
            <span className="text-[10px] font-mono font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md uppercase tracking-[0.2em]">3 New</span>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 p-6 rounded-[32px] shadow-2xl border border-white/10 flex gap-5 items-start group hover:border-amber-500/30 transition-colors"
          >
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-lg font-display tracking-tight">Magnesium levels low</h4>
              <p className="text-sm text-white/60 mt-2 leading-relaxed font-medium">Associated with recent fatigue reports. Try adding <span className="text-amber-400 font-bold">Spinach</span> or <span className="text-amber-400 font-bold">Pumpkin Seeds</span> to your dinner.</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 p-6 rounded-[32px] shadow-2xl border border-white/10 flex gap-5 items-start group hover:border-blue-500/30 transition-colors"
          >
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
              <Droplets className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-lg font-display tracking-tight">Hydration Variance</h4>
              <p className="text-sm text-white/60 mt-2 leading-relaxed font-medium">Correlation found: Low water intake is spiking your cortisol. Aim for <span className="text-blue-400 font-bold">400ml</span> in the next hour.</p>
            </div>
          </motion.div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tighter mb-6 font-display flex items-center gap-3 text-white">
            <span className="w-2 h-2 rounded-full bg-white/40"></span>
            Nutrient Correlation
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Vitamin D", value: "72%", color: "bg-[#ddff00]" },
              { label: "Iron Status", value: "91%", color: "bg-emerald-400" },
              { label: "Zinc", value: "45%", color: "bg-amber-400" },
              { label: "Omega 3", value: "88%", color: "bg-blue-400" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-xl hover:border-white/20 transition-colors"
              >
                <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em]">{stat.label}</span>
                <div className="text-3xl font-bold font-display mt-2 text-white tracking-tighter">{stat.value}</div>
                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`${stat.color} h-full transition-all duration-1000 relative`} style={{ width: stat.value }}>
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-12 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-[#ddff00]/20 to-[#ddff00]/5 border border-[#ddff00]/20 rounded-[40px] p-8 text-white overflow-hidden relative shadow-[0_0_40px_rgba(221,255,0,0.15)] group"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800')] opacity-10 bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#ddff00]" />
                <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em]">Smart Recommendation</span>
              </div>
              <h3 className="text-3xl font-bold font-display tracking-tighter mb-3">Grilled Salmon Salad</h3>
              <p className="text-white/80 text-base leading-relaxed mb-8 max-w-sm font-medium">
                Optimized with Walnut garnish to address your current Omega 3 and Magnesium needs.
              </p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView?.('recipe')}
                className="bg-[#ddff00] text-black px-8 h-14 rounded-2xl font-black text-sm shadow-[0_0_20px_rgba(221,255,0,0.4)] border border-[#ddff00]/50 flex items-center justify-center gap-3 w-full sm:w-auto uppercase tracking-widest font-mono"
              >
                <Utensils className="w-4 h-4" />
                Get Recipe
              </motion.button>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
