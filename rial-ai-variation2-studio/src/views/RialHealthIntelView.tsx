import React from 'react';
import { ArrowLeft, Share2, Smile, RefreshCw, Zap, Leaf } from 'lucide-react';
import { motion } from 'motion/react';

interface RialHealthIntelViewProps {
  setCurrentView?: (view: string) => void;
}

export function RialHealthIntelView({ setCurrentView }: RialHealthIntelViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black text-white selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between max-w-3xl mx-auto w-full">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="size-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </motion.button>
        <div className="text-center">
          <h1 className="text-xl font-bold font-display tracking-tight">RIAL Health Intel</h1>
          <p className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] mt-1">Bio-Sync Active</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="size-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <Share2 className="w-6 h-6 text-white" />
        </motion.button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-black/40 backdrop-blur-md px-6 max-w-3xl mx-auto sticky top-20 z-40">
        <button className="flex-1 py-5 text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors">Overview</button>
        <button className="flex-1 py-5 text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] border-b-2 border-[#ddff00] relative">
          Correlations
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#ddff00] shadow-[0_0_10px_#ddff00]" />
        </button>
        <button 
          onClick={() => setCurrentView?.('dictionary')}
          className="flex-1 py-5 text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors"
        >
          Dictionary
        </button>
      </div>

      <main className="px-6 mt-8 space-y-12 max-w-3xl mx-auto">
        {/* Score Cards */}
        <div className="flex flex-col sm:flex-row gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="flex-1 bg-white/5 backdrop-blur-md rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Smile className="w-20 h-20 text-white" />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <h3 className="text-[10px] font-mono font-black tracking-[0.2em] text-white/40 uppercase">Real Feel<br/>Score</h3>
              <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Smile className="w-5 h-5 text-white/60" />
              </div>
            </div>
            <div className="text-6xl font-bold font-display mb-4 tracking-tighter relative z-10">88<span className="text-2xl text-white/20">/100</span></div>
            <div className="text-[#ddff00] text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-2 relative z-10 bg-[#ddff00]/10 w-fit px-3 py-1.5 rounded-lg border border-[#ddff00]/20">
              <span className="text-lg leading-none">↗</span> +5% vs last week
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="flex-1 bg-[#ddff00] rounded-[40px] p-8 shadow-[0_0_40px_rgba(221,255,0,0.15)] text-black relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <RefreshCw className="w-20 h-20 text-black" />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <h3 className="text-[10px] font-mono font-black tracking-[0.2em] uppercase text-black/60">Bio-Sync<br/>Match</h3>
              <div className="size-10 rounded-full bg-black/10 border border-black/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-black" />
              </div>
            </div>
            <div className="text-6xl font-bold font-display mb-4 tracking-tighter relative z-10">92%</div>
            <div className="text-black/70 text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-2 relative z-10 bg-black/5 w-fit px-3 py-1.5 rounded-lg border border-black/10">
              <span className="text-lg leading-none">↗</span> +2% peak alignment
            </div>
          </motion.div>
        </div>

        {/* Long-term Correlations */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
              <h2 className="text-2xl font-bold font-display tracking-tight">Long-term Correlations</h2>
            </div>
            <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">Last 30 Days</span>
          </div>

          <div className="space-y-6">
            {/* Correlation 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 shadow-2xl border border-white/10 group hover:border-[#ddff00]/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold font-display tracking-tight text-white group-hover:text-[#ddff00] transition-colors">Caffeine vs. Deep Sleep</h3>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]">Critical</span>
              </div>
              <p className="text-sm text-white/50 mb-8 font-medium">Strong inverse correlation detected</p>
              
              <div className="flex items-end gap-3 h-32 mb-8">
                {[30, 45, 40, 80, 70, 85, 25].map((height, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: 0.3 + (i * 0.1) }}
                    className={`flex-1 rounded-t-xl ${height > 50 ? 'bg-[#ddff00] shadow-[0_0_15px_rgba(221,255,0,0.2)]' : 'bg-white/20'}`} 
                  />
                ))}
              </div>
              
              <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                <p className="text-sm text-white/70 leading-relaxed">
                  Intake after 2:00 PM reduces deep sleep recovery by <strong className="text-red-400 font-bold">18%</strong>.
                </p>
              </div>
            </motion.div>

            {/* Correlation 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 shadow-2xl border border-white/10 group hover:border-[#ddff00]/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold font-display tracking-tight text-white group-hover:text-[#ddff00] transition-colors">Protein Intake vs. Energy</h3>
                <span className="bg-[#ddff00]/20 text-[#ddff00] border border-[#ddff00]/30 text-[10px] font-mono font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(221,255,0,0.2)]">Optimal</span>
              </div>
              <p className="text-sm text-white/50 mb-8 font-medium">Positive linear growth</p>
              
              <div className="flex items-end gap-3 h-32 mb-8">
                {[20, 25, 35, 45, 60, 75, 90].map((height, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: 0.4 + (i * 0.1) }}
                    className={`flex-1 rounded-t-xl ${height > 40 ? 'bg-[#ddff00] shadow-[0_0_15px_rgba(221,255,0,0.2)]' : 'bg-white/20'}`} 
                  />
                ))}
              </div>
              
              <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                <p className="text-sm text-white/70 leading-relaxed">
                  Consistent protein loading correlates with <strong className="text-[#ddff00] font-bold">12% higher</strong> morning energy feel.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Performance Dictionary */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
            <h2 className="text-2xl font-bold font-display tracking-tight">Performance Dictionary</h2>
          </div>
          
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#ddff00]/5 backdrop-blur-md rounded-[32px] p-6 flex gap-6 border border-[#ddff00]/20 group hover:bg-[#ddff00]/10 transition-colors"
            >
              <div className="w-16 h-16 rounded-[24px] bg-[#ddff00] flex items-center justify-center shrink-0 text-black shadow-[0_0_20px_rgba(221,255,0,0.3)] group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-bold font-display text-white mb-2 tracking-tight">L-Theanine</h3>
                <p className="text-sm text-white/60 leading-relaxed font-medium">
                  Pair with caffeine to eliminate jitters and enhance cognitive focus during high-intensity sessions.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 flex gap-6 border border-white/10 group hover:border-[#ddff00]/30 transition-colors"
            >
              <div className="w-16 h-16 rounded-[24px] bg-black/40 border border-white/10 flex items-center justify-center shrink-0 text-white/60 group-hover:text-[#ddff00] group-hover:border-[#ddff00]/50 transition-colors">
                <Leaf className="w-8 h-8" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-bold font-display text-white mb-2 tracking-tight">Magnesium Glycinate</h3>
                <p className="text-sm text-white/60 leading-relaxed font-medium">
                  High bioavailability form for muscle relaxation and nervous system regulation post-workout.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
