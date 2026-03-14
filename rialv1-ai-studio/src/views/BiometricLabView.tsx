import React from 'react';
import { ArrowLeft, Share2, Upload, TrendingUp, BarChart2, Lightbulb, ChevronRight, Activity, Zap, Brain } from 'lucide-react';
import { motion } from 'motion/react';

export function BiometricLabView() {
  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header Section */}
      <div className="flex items-center p-6 sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex w-12 h-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </motion.button>
        <div className="flex-1 px-6">
          <h1 className="text-xl font-display font-bold leading-tight tracking-tight text-white">Biometric Lab</h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ddff00] animate-pulse" />
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em]">Neural Performance Analysis</p>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex w-12 h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Share2 className="w-5 h-5 text-white/70" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex w-12 h-12 items-center justify-center rounded-2xl bg-[#ddff00] shadow-[0_0_20px_rgba(221,255,0,0.3)]"
          >
            <Upload className="w-5 h-5 text-black" />
          </motion.button>
        </div>
      </div>

      {/* Comparison Tabs */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {[
            { label: 'Volumen Week', sub: 'Active Phase', active: true },
            { label: 'Definition Week', sub: 'Recovery Phase', active: false },
            { label: 'Baseline Avg', sub: 'Reference', active: false }
          ].map((tab, i) => (
            <motion.button 
              key={i}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-start justify-center pb-4 relative whitespace-nowrap group`}
            >
              <p className={`text-sm font-bold tracking-tight transition-colors ${tab.active ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                {tab.label}
              </p>
              <span className={`text-[10px] uppercase font-mono font-bold tracking-wider transition-colors ${tab.active ? 'text-[#ddff00]' : 'text-white/20'}`}>
                {tab.sub}
              </span>
              {tab.active && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[#ddff00] rounded-full shadow-[0_0_10px_rgba(221,255,0,0.5)]" 
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <main className="p-6 space-y-8">
        {/* Summary Dashboard Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ddff00]/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
          
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <h2 className="text-3xl font-display font-bold tracking-tight text-white mb-2">Real Feel vs Bio-Sync</h2>
              <p className="text-white/40 text-sm font-mono uppercase tracking-wider">Advanced neural-cardio correlation</p>
            </div>
            <div className="bg-[#ddff00]/10 text-[#ddff00] px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-[#ddff00]/20 uppercase">
              Stable
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/30">
                <Brain className="w-4 h-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Real Feel Index</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-display font-bold text-white tracking-tighter">88</span>
                <span className="text-white/20 text-xl font-mono">/100</span>
              </div>
              <div className="flex items-center gap-2 text-[#ddff00]">
                <div className="p-1 rounded-full bg-[#ddff00]/10">
                  <TrendingUp className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold tracking-tight">+12% vs last week</span>
              </div>
            </div>
            <div className="space-y-3 border-l border-white/5 pl-12">
              <div className="flex items-center gap-2 text-white/30">
                <Activity className="w-4 h-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Bio-Sync Eff.</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-display font-bold text-white tracking-tighter">92</span>
                <span className="text-[#ddff00] text-xl font-mono">%</span>
              </div>
              <div className="flex items-center gap-2 text-[#ddff00]">
                <div className="p-1 rounded-full bg-[#ddff00]/10">
                  <Zap className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold tracking-tight">+5% optimal</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio-Sync Efficiency Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <BarChart2 className="w-5 h-5 text-[#ddff00]" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">Sync Efficiency</h3>
            </div>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Live Telemetry</span>
          </div>

          <div className="space-y-8">
            {[
              { label: 'HRV Correlation', value: 94, color: '#ddff00' },
              { label: 'Sleep Architecture', value: 82, color: '#ddff00' },
              { label: 'Cortisol Sync', value: 68, color: '#ddff00' }
            ].map((metric, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">{metric.label}</span>
                  <span className="text-lg font-mono font-bold text-white">{metric.value}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className="h-full bg-[#ddff00] rounded-full shadow-[0_0_15px_rgba(221,255,0,0.3)]" 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Comparative Detail Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#ddff00] p-8 rounded-[40px] flex items-center gap-6 group cursor-pointer"
        >
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-black flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Lightbulb className="w-8 h-8 text-[#ddff00]" />
          </div>
          <div className="flex-1">
            <h4 className="text-black font-display font-bold text-xl mb-1">Lab Insight</h4>
            <p className="text-black/70 text-sm leading-relaxed font-medium">Your 'Volumen Week' shows a 15% higher neural resilience than previous baselines.</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:translate-x-2 transition-transform">
            <ChevronRight className="w-6 h-6 text-black" />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
