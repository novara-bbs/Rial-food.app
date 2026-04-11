import React from 'react';
import { ArrowLeft, Info, Search, Activity, Database, RefreshCw, Dna } from 'lucide-react';
import { motion } from 'motion/react';

interface RealMatchScanViewProps {
  setCurrentView?: (view: string) => void;
}

export function RealMatchScanView({ setCurrentView }: RealMatchScanViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black text-white selection:bg-[#ddff00] selection:text-black">
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
        <div className="text-center">
          <h1 className="text-xl font-bold font-display tracking-tight">Real Match</h1>
          <p className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] mt-1">System Active</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="size-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <Info className="w-6 h-6 text-white" />
        </motion.button>
      </header>

      <main className="px-6 mt-8 max-w-3xl mx-auto">
        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em]">Step 1: The Scan</span>
            <span className="text-xs font-medium text-white/50">84% Complete</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '84%' }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-[#ddff00] rounded-full shadow-[0_0_15px_#ddff00]" 
            />
          </div>
        </motion.div>

        {/* Scanner UI */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[40px] overflow-hidden border border-[#ddff00]/30 shadow-[0_0_40px_rgba(221,255,0,0.15)] group"
        >
          {/* Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none z-10 mix-blend-overlay"
            style={{
              backgroundImage: 'linear-gradient(#ddff00 1px, transparent 1px), linear-gradient(90deg, #ddff00 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />
          
          {/* Scanning Line Animation */}
          <motion.div 
            animate={{ y: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1 bg-[#ddff00] shadow-[0_0_20px_#ddff00] z-20" 
          />
          
          {/* Corner Markers */}
          <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-[#ddff00] z-20 opacity-80" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-[#ddff00] z-20 opacity-80" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-[#ddff00] z-20 opacity-80" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-[#ddff00] z-20 opacity-80" />

          {/* Image */}
          <div className="relative aspect-[3/4]">
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" 
              alt="Scanning Food" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>

          {/* Floating Data Points */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-1/3 left-8 bg-black/60 backdrop-blur-md border border-[#ddff00]/50 rounded-xl px-4 py-2 flex items-center gap-3 z-20 shadow-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-[#ddff00] animate-pulse shadow-[0_0_10px_#ddff00]" />
            <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em]">Protein Detect: High</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-1/3 right-8 bg-black/60 backdrop-blur-md border border-[#ddff00]/50 rounded-xl px-4 py-2 flex items-center gap-3 z-20 shadow-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-[#ddff00] animate-pulse shadow-[0_0_10px_#ddff00]" />
            <span className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em]">Fiber: 12g (Est)</span>
          </motion.div>
        </motion.div>

        {/* Status Text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <h2 className="text-3xl font-bold font-display mb-4 tracking-tighter">Analyzing Biometric Alignment...</h2>
          <p className="text-base text-white/60 max-w-sm mx-auto leading-relaxed font-medium">
            Scanning Recipe Nutrients and synchronizing with your current metabolic window.
          </p>
        </motion.div>

        {/* Bottom Icons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center items-center gap-8 mt-16"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] bg-[#ddff00]/10 border border-[#ddff00]/30 flex items-center justify-center text-[#ddff00] shadow-[0_0_20px_rgba(221,255,0,0.1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[#ddff00]/20 animate-pulse" />
              <Activity className="w-8 h-8 relative z-10" />
            </div>
            <span className="text-[10px] font-mono font-black text-white/50 uppercase tracking-[0.2em]">Lab Sync</span>
          </div>
          
          <div className="w-12 h-[1px] bg-white/10" />
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] bg-[#ddff00]/10 border border-[#ddff00]/30 flex items-center justify-center text-[#ddff00] shadow-[0_0_20px_rgba(221,255,0,0.1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[#ddff00]/20 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <Database className="w-8 h-8 relative z-10" />
            </div>
            <span className="text-[10px] font-mono font-black text-white/50 uppercase tracking-[0.2em]">Nutrients</span>
          </div>
          
          <div className="w-12 h-[1px] bg-white/10" />
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] bg-[#ddff00]/10 border border-[#ddff00]/30 flex items-center justify-center text-[#ddff00] shadow-[0_0_20px_rgba(221,255,0,0.1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[#ddff00]/20 animate-pulse" style={{ animationDelay: '0.4s' }} />
              <Dna className="w-8 h-8 relative z-10" />
            </div>
            <span className="text-[10px] font-mono font-black text-white/50 uppercase tracking-[0.2em]">Match</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
