import React from 'react';
import { ArrowLeft, Share, Zap, CheckCircle, Users, Activity, Target } from 'lucide-react';
import { motion } from 'motion/react';

interface ChallengeDetailViewProps {
  setCurrentView?: (view: string) => void;
}

export function ChallengeDetailView({ setCurrentView }: ChallengeDetailViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Top Navigation */}
      <header className="flex items-center p-6 justify-between sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentView?.('home')}
          className="flex w-12 h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <h2 className="text-xl font-bold font-display text-white tracking-tight flex-1 text-center">Challenge Detail</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex w-12 h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
        >
          <Share className="w-5 h-5" />
        </motion.button>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[40px] overflow-hidden bg-white/5 border border-white/10 shadow-2xl group mb-8"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="relative p-10 pt-32 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-[#ddff00] px-4 py-2 rounded-xl w-fit border border-[#ddff00]/50 shadow-[0_0_20px_rgba(221,255,0,0.3)]">
              <Zap className="w-4 h-4 text-black" />
              <span className="text-black text-[10px] font-mono font-black uppercase tracking-widest">Active Sprint</span>
            </div>
            <h1 className="text-white tracking-tighter text-4xl md:text-5xl font-bold font-display leading-tight">7-Day Real Food Sprint</h1>
            <p className="text-white/60 text-base max-w-md leading-relaxed font-medium">Master your nutrition by eliminating processed ingredients and embracing nature's finest fuel.</p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-2 rounded-[32px] p-6 bg-white/5 border border-white/10 shadow-xl group hover:border-white/20 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-12 h-12 text-white" />
            </div>
            <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] relative z-10">Participants</p>
            <div className="flex items-baseline gap-2 mt-1 relative z-10">
              <p className="text-white font-display text-3xl font-bold tracking-tighter">1.2k</p>
              <span className="text-[#ddff00] text-[10px] font-mono font-black bg-[#ddff00]/10 px-2 py-0.5 rounded-md border border-[#ddff00]/20">+12%</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-2 rounded-[32px] p-6 bg-white/5 border border-white/10 shadow-xl group hover:border-white/20 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="w-12 h-12 text-white" />
            </div>
            <p className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em] relative z-10">Days Left</p>
            <p className="text-white font-display text-3xl font-bold tracking-tighter mt-1 relative z-10">4</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-2 rounded-[32px] p-6 bg-[#ddff00]/10 border border-[#ddff00]/20 shadow-[0_0_20px_rgba(221,255,0,0.1)] group hover:border-[#ddff00]/40 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-12 h-12 text-[#ddff00]" />
            </div>
            <p className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] relative z-10">Avg Match</p>
            <p className="text-[#ddff00] font-display text-3xl font-bold tracking-tighter mt-1 relative z-10">88%</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
            <h2 className="text-white text-2xl font-bold font-display tracking-tighter">Challenge Overview</h2>
          </div>
          
          <div className="bg-white/5 rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ddff00]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <p className="text-white/60 leading-relaxed mb-8 text-base font-medium relative z-10">
              Reset your metabolism and reclaim your energy. For the next 7 days, we commit to consuming only "Real Food" — items with single-ingredient labels or no labels at all. 
            </p>
            
            <div className="space-y-4 relative z-10">
              {[
                "Zero added sugars or sweeteners",
                "No refined vegetable oils",
                "Whole grains and root vegetables only"
              ].map((rule, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-[24px] bg-black/40 border border-white/5 hover:border-[#ddff00]/30 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-[#ddff00]/10 flex items-center justify-center border border-[#ddff00]/20 group-hover:bg-[#ddff00]/20 transition-colors shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#ddff00]" />
                  </div>
                  <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Floating Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#ddff00] text-black h-16 rounded-[24px] font-black flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(221,255,0,0.3)] border border-[#ddff00]/50 uppercase tracking-widest font-mono text-sm"
          >
            <Zap className="w-5 h-5" />
            Join Challenge
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
