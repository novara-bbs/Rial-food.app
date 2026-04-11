import React from 'react';
import { ArrowLeft, Share2, Zap, CheckCircle, Moon, BarChart2, Calendar, Bookmark, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface RealMatchResultViewProps {
  setCurrentView?: (view: string) => void;
}

export function RealMatchResultView({ setCurrentView }: RealMatchResultViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between max-w-3xl mx-auto w-full">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentView?.('home')}
          className="size-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </motion.button>
        <h1 className="text-xl font-bold font-display text-white tracking-tight">Analysis Complete</h1>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="size-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <Share2 className="w-5 h-5 text-white" />
        </motion.button>
      </header>

      <main className="px-6 mt-12 flex flex-col items-center max-w-3xl mx-auto">
        {/* Diamond Score */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotate: 45 }}
          animate={{ scale: 1, opacity: 1, rotate: 45 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative w-48 h-48 flex items-center justify-center mb-12 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ddff00]/20 to-transparent rounded-[40px] blur-xl group-hover:blur-2xl transition-all duration-700" />
          <div className="absolute inset-4 bg-black/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-[#ddff00]/30 group-hover:border-[#ddff00]/50 transition-colors" />
          
          <div className="relative z-10 text-center -rotate-45">
            <span className="text-6xl font-bold font-display text-[#ddff00] tracking-tighter drop-shadow-[0_0_15px_rgba(221,255,0,0.5)]">94%</span>
            <p className="text-[10px] font-mono font-black text-white/50 uppercase tracking-[0.3em] mt-2">Match</p>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-display text-white mb-4 tracking-tighter">It's a Real Match!</h2>
          <p className="text-base text-white/60 max-w-sm mx-auto leading-relaxed font-medium">
            This profile aligns with <span className="text-[#ddff00] font-bold">94%</span> of your current biological requirements and goals.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 w-full mb-12"
        >
          <div className="flex-1 bg-white/5 rounded-[32px] p-6 shadow-2xl border border-white/10 hover:border-[#ddff00]/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#ddff00]/10 p-2 rounded-xl border border-[#ddff00]/20">
                <Zap className="w-5 h-5 text-[#ddff00]" />
              </div>
              <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em]">Bio-Score</span>
            </div>
            <p className="text-4xl font-bold font-display text-white group-hover:text-[#ddff00] transition-colors">A+</p>
          </div>
          
          <div className="flex-1 bg-white/5 rounded-[32px] p-6 shadow-2xl border border-white/10 hover:border-[#ddff00]/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#ddff00]/10 p-2 rounded-xl border border-[#ddff00]/20">
                <CheckCircle className="w-5 h-5 text-[#ddff00]" />
              </div>
              <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em]">Confidence</span>
            </div>
            <p className="text-4xl font-bold font-display text-white group-hover:text-[#ddff00] transition-colors">98%</p>
          </div>
        </motion.div>

        {/* Why it matches */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
            <h3 className="text-2xl font-bold font-display text-white">Why it matches</h3>
          </div>

          {/* Reason 1 */}
          <motion.div 
            whileHover={{ x: 5 }}
            className="bg-[#ddff00]/5 rounded-[32px] p-6 border border-[#ddff00]/20 shadow-[0_0_30px_rgba(221,255,0,0.05)]"
          >
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#ddff00]/10 flex items-center justify-center shrink-0 border border-[#ddff00]/20">
                <Zap className="w-6 h-6 text-[#ddff00]" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg mb-2 font-display">Optimized Magnesium</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Directly addresses your reported afternoon energy dips and muscle recovery needs.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Reason 2 */}
          <motion.div 
            whileHover={{ x: 5 }}
            className="bg-[#ddff00]/5 rounded-[32px] p-6 border border-[#ddff00]/20 shadow-[0_0_30px_rgba(221,255,0,0.05)]"
          >
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#ddff00]/10 flex items-center justify-center shrink-0 border border-[#ddff00]/20">
                <Activity className="w-6 h-6 text-[#ddff00]" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg mb-2 font-display">Probiotic Synergy</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  High in L. acidophilus to balance your current digestion state and gut biome markers.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Reason 3 */}
          <motion.div 
            whileHover={{ x: 5 }}
            className="bg-white/5 rounded-[32px] p-6 border border-white/10 shadow-2xl hover:border-white/20 transition-colors"
          >
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Moon className="w-6 h-6 text-white/60" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg mb-2 font-display">Circadian Support</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Contains specific amino acids that assist in natural melatonin production for tonight.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Recipe Recommendation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-12"
        >
          <div className="relative rounded-[40px] overflow-hidden h-64 shadow-2xl group border border-white/10 hover:border-[#ddff00]/30 transition-colors cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" 
              alt="Quinoa Bowl" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="inline-flex items-center gap-2 bg-[#ddff00]/20 px-3 py-1.5 rounded-xl border border-[#ddff00]/30 mb-3 backdrop-blur-md">
                <Zap className="w-3 h-3 text-[#ddff00]" />
                <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-widest">Recipe Recommendation</span>
              </div>
              <h3 className="text-2xl font-bold font-display text-white leading-tight group-hover:text-[#ddff00] transition-colors">Quinoa & Roasted Root Power Bowl</h3>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full mt-10 space-y-4"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#ddff00] text-black rounded-[24px] py-5 font-black text-sm shadow-[0_0_30px_rgba(221,255,0,0.3)] flex items-center justify-center gap-3 font-mono uppercase tracking-[0.2em] border border-[#ddff00]/50"
          >
            <Calendar className="w-5 h-5" />
            Plan for Batch Prep
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white/5 text-white rounded-[24px] py-5 font-black text-sm flex items-center justify-center gap-3 font-mono uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-colors shadow-xl"
          >
            <Bookmark className="w-5 h-5" />
            Add to Journal
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
