import React from 'react';
import { ArrowLeft, Info, Search, Activity, Database, RefreshCw, Dna } from 'lucide-react';

export function RealMatchScanView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#0a0f1a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-white/5">
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold font-display">Real Match</h1>
          <p className="text-[10px] font-bold text-[#00e5ff] uppercase tracking-widest">System Active</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <Info className="w-5 h-5 text-slate-300" />
        </button>
      </header>

      <div className="px-4 mt-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-[#00e5ff] uppercase tracking-widest">Step 1: The Scan</span>
            <span className="text-xs text-slate-400">84% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#00e5ff] w-[84%] transition-all duration-1000" />
          </div>
        </div>

        {/* Scanner UI */}
        <div className="relative rounded-3xl overflow-hidden border border-[#00e5ff]/30 shadow-[0_0_30px_rgba(0,229,255,0.1)]">
          {/* Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none z-10"
            style={{
              backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00e5ff] shadow-[0_0_15px_#00e5ff] z-20 animate-[scan_3s_ease-in-out_infinite]" />
          
          {/* Corner Markers */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#00e5ff] z-20" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#00e5ff] z-20" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#00e5ff] z-20" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#00e5ff] z-20" />

          {/* Image */}
          <div className="relative aspect-[3/4]">
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" 
              alt="Scanning Food" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />
          </div>

          {/* Floating Data Points */}
          <div className="absolute top-1/3 left-8 bg-[#0a0f1a]/80 backdrop-blur-md border border-[#00e5ff]/50 rounded-lg px-3 py-1.5 flex items-center gap-2 z-20">
            <div className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
            <span className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-wider">Protein Detect: High</span>
          </div>
          
          <div className="absolute bottom-1/3 right-8 bg-[#0a0f1a]/80 backdrop-blur-md border border-[#00e5ff]/50 rounded-lg px-3 py-1.5 flex items-center gap-2 z-20">
            <div className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
            <span className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-wider">Fiber: 12g (Est)</span>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mt-10">
          <h2 className="text-2xl font-bold font-display mb-4">Analyzing Biometric Alignment...</h2>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Scanning Recipe Nutrients and synchronizing with your current metabolic window.
          </p>
        </div>

        {/* Bottom Icons */}
        <div className="flex justify-center items-center gap-8 mt-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lab Sync</span>
          </div>
          
          <div className="w-8 h-[1px] bg-white/10" />
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
              <Database className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nutrients</span>
          </div>
          
          <div className="w-8 h-[1px] bg-white/10" />
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
              <Dna className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match</span>
          </div>
        </div>
      </div>
    </div>
  );
}
