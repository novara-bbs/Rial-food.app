import React from 'react';
import { ArrowLeft, Activity, Database, RefreshCw, FileText, Award, Brain, Zap, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface BiometricMatchViewProps {
  setCurrentView?: (view: string) => void;
}

export function BiometricMatchView({ setCurrentView }: BiometricMatchViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 p-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView?.('home')}
            className="flex w-12 h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-xl font-bold font-display text-white tracking-tight">Biometric Match</h1>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex w-12 h-12 items-center justify-center rounded-2xl bg-[#ddff00]/10 border border-[#ddff00]/20 text-[#ddff00] shadow-[0_0_15px_rgba(221,255,0,0.15)]"
          >
            <Activity className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-12 flex flex-col items-center">
        {/* Circular Progress */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-72 h-72 flex items-center justify-center mb-12"
        >
          <div className="absolute inset-0 bg-[#ddff00]/5 rounded-full blur-3xl" />
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_20px_rgba(221,255,0,0.2)]">
            <circle 
              className="text-white/5" 
              cx="144" cy="144" r="120" 
              fill="transparent" stroke="currentColor" strokeWidth="16" 
            />
            <motion.circle 
              initial={{ strokeDashoffset: 754 }}
              animate={{ strokeDashoffset: 264 }} // 65% of 754
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-[#ddff00]" 
              cx="144" cy="144" r="120" 
              fill="transparent" stroke="currentColor" strokeWidth="16" 
              strokeDasharray="754" 
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-center z-10 flex flex-col items-center">
            <span className="text-7xl font-bold font-display text-white tracking-tighter drop-shadow-lg">65<span className="text-4xl text-[#ddff00]">%</span></span>
            <p className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.3em] mt-2">Synergy</p>
          </div>

          {/* Floating Badges */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute top-4 -right-4 bg-black/80 backdrop-blur-md border border-[#ddff00]/30 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-[0_0_20px_rgba(221,255,0,0.15)]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#ddff00]/10 flex items-center justify-center text-[#ddff00]">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Energy +12%</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-4 -left-4 bg-black/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Vitals Stable</span>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold font-display text-white mb-4 tracking-tight">Comparing to your Real Feel...</h2>
          <p className="text-base text-white/60 max-w-md mx-auto leading-relaxed font-medium">
            Analyzing 12 data points from your last 48 hours of nutritional logs and biometric feedback.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="w-full space-y-4">
          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#ddff00]/5 rounded-[32px] p-6 border border-[#ddff00]/20 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ddff00]/10 blur-3xl rounded-full" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ddff00]/10 flex items-center justify-center text-[#ddff00] border border-[#ddff00]/20">
                  <Database className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg text-white font-display">Extracting Recipe DNA</span>
              </div>
              <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] bg-[#ddff00]/10 px-3 py-1 rounded-lg border border-[#ddff00]/20">Complete</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative z-10">
              <div className="h-full bg-[#ddff00] w-full shadow-[0_0_10px_#ddff00]" />
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#ddff00]/5 rounded-[32px] p-6 border border-[#ddff00]/20 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ddff00]/10 blur-3xl rounded-full" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ddff00]/10 flex items-center justify-center text-[#ddff00] border border-[#ddff00]/20">
                  <RefreshCw className="w-6 h-6 animate-spin-slow" />
                </div>
                <span className="font-bold text-lg text-white font-display">Calculating Synergy</span>
              </div>
              <span className="text-[10px] font-mono font-black text-white/60 uppercase tracking-[0.2em]">65%</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 2, delay: 0.5 }}
                className="h-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]" 
              />
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 rounded-[32px] p-6 border border-white/10 flex items-center justify-between shadow-xl hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-lg text-white font-display tracking-tight">Digestive Compatibility</p>
                <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] mt-1">Low inflammation risk</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
              <Check className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 rounded-[32px] p-6 border border-white/10 flex items-center justify-between shadow-xl hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#ddff00]/10 flex items-center justify-center text-[#ddff00] border border-[#ddff00]/20">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-lg text-white font-display tracking-tight">Macro Alignment</p>
                <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] mt-1">Matching protein goals</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#ddff00]/20 flex items-center justify-center text-[#ddff00] border border-[#ddff00]/30">
              <span className="text-xs font-bold tracking-widest leading-none mb-1 animate-pulse">...</span>
            </div>
          </motion.div>

          {/* Step 5 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 rounded-[32px] p-6 border border-white/5 flex items-center justify-between shadow-xl opacity-50"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-lg text-white/60 font-display tracking-tight">Cognitive Impact</p>
                <p className="text-[10px] font-mono font-black text-white/30 uppercase tracking-[0.2em] mt-1">Glucose stability forecast</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white/10" />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
