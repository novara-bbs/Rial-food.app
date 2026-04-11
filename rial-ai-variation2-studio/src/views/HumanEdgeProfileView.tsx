import React from 'react';
import { ArrowLeft, MoreVertical, Edit2, ShieldCheck, Smartphone, Chrome, Watch, ChevronRight, Lock, Eye, Fingerprint, Trash2, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface HumanEdgeProfileViewProps {
  setCurrentView?: (view: string) => void;
}

export function HumanEdgeProfileView({ setCurrentView }: HumanEdgeProfileViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header Section */}
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
          <h2 className="text-xl font-display font-bold tracking-tight text-white">Human Edge Profile</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex w-12 h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <MoreVertical className="w-6 h-6" />
          </motion.button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-10">
        {/* Profile Overview Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-8 p-10 rounded-[40px] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#ddff00]/5 blur-[60px] -z-10" />
          
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#ddff00] to-emerald-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-square rounded-full min-h-40 w-40 ring-4 ring-white/5 border-4 border-black overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" 
                alt="Alex Thorne"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-2 right-2 bg-[#ddff00] text-black rounded-full p-3 flex items-center justify-center ring-4 ring-black shadow-lg"
            >
              <Edit2 className="w-5 h-5 font-bold" />
            </motion.button>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2">Alex Thorne</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ddff00] animate-pulse" />
              <p className="text-white/40 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Pro Tier Member • Bio-Sync Active</p>
            </div>
          </div>
          
          <div className="flex w-full gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 items-center justify-center rounded-[24px] h-14 px-6 bg-white/5 border border-white/10 text-white text-sm font-bold transition-all hover:bg-white/10 uppercase tracking-widest font-mono"
            >
              Account Details
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 items-center justify-center rounded-[24px] h-14 px-6 bg-[#ddff00] text-black text-sm font-bold transition-all shadow-[0_0_20px_rgba(221,255,0,0.3)] uppercase tracking-widest font-mono"
            >
              Share Bio-ID
            </motion.button>
          </div>
        </motion.section>

        {/* Bio-Metric Indicators */}
        <section className="grid grid-cols-2 gap-4">
          {[
            { label: 'Bio-Age', value: '28.4', diff: '-0.2', trend: 'down' },
            { label: 'Sync Score', value: '94%', diff: '+2%', trend: 'up' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-2 rounded-[32px] p-8 bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <p className="text-white/30 text-[10px] font-mono font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-display font-bold text-white">{stat.value}</span>
                <span className={`text-xs font-mono font-bold ${stat.trend === 'up' ? 'text-emerald-400' : 'text-[#ddff00]'}`}>
                  {stat.diff}
                </span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Subscription Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold text-white">Subscription Plan</h3>
            <span className="px-3 py-1 bg-[#ddff00]/10 text-[#ddff00] text-[10px] font-black uppercase rounded-lg border border-[#ddff00]/20 tracking-widest">Active</span>
          </div>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="p-8 rounded-[40px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-white relative overflow-hidden shadow-2xl group"
          >
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#ddff00]/10 rounded-full blur-[80px] group-hover:bg-[#ddff00]/20 transition-colors" />
            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[#ddff00] font-display font-bold text-2xl tracking-tight">Human Edge Pro</p>
                <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Next billing cycle: Oct 12, 2024</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ddff00]/10 flex items-center justify-center border border-[#ddff00]/20">
                <ShieldCheck className="w-7 h-7 text-[#ddff00]" />
              </div>
            </div>
            <div className="mt-10 flex items-center justify-between relative z-10">
              <p className="text-4xl font-display font-bold">$19.99<span className="text-white/20 text-base font-mono font-normal ml-1">/mo</span></p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-mono font-black uppercase tracking-widest transition-colors border border-white/10"
              >
                Manage Plan
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* Privacy Settings */}
        <section className="space-y-6">
          <h3 className="text-2xl font-display font-bold text-white">Privacy & Security</h3>
          <div className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 overflow-hidden divide-y divide-white/5">
            {[
              { icon: Lock, label: 'Anonymous Bio-Data Sharing', active: false },
              { icon: Eye, label: 'Public Profile Bio-Score', active: true },
              { icon: Fingerprint, label: 'Two-Factor Authentication', status: 'Enabled' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#ddff00]/30 transition-colors">
                    <item.icon className="w-5 h-5 text-white/40 group-hover:text-[#ddff00] transition-colors" />
                  </div>
                  <span className="font-medium text-white/80 group-hover:text-white transition-colors">{item.label}</span>
                </div>
                {item.status ? (
                  <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-lg border border-emerald-400/20">{item.status}</span>
                ) : (
                  <motion.div 
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-[#ddff00]' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: item.active ? 24 : 2 }}
                      className={`absolute top-1 w-4 h-4 rounded-full shadow-lg ${item.active ? 'bg-black' : 'bg-white/40'}`} 
                    />
                  </motion.div>
                )}
              </div>
            ))}
            <div className="p-6">
              <motion.button 
                whileHover={{ x: 5 }}
                className="text-red-400 text-xs font-mono font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:text-red-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center border border-red-400/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                Delete All Bio-History
              </motion.button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
