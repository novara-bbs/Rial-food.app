import React from 'react';
import { Settings, Share2, Edit2, TrendingUp, Heart, Users, BookOpen, Calendar, Award, Zap, Shield, Activity, ChevronRight, Bell, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileViewProps {
  setCurrentView?: (view: string) => void;
}

export function ProfileView({ setCurrentView }: ProfileViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 p-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView?.('settings')}
            className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <Settings className="w-6 h-6" />
          </motion.button>
          <h2 className="text-xl font-display font-bold tracking-tight text-white">Profile</h2>
          <div className="flex gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        {/* Profile Section */}
        <section className="flex flex-col items-center p-12 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-[#ddff00]/5 rounded-full blur-[100px] -z-10" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group cursor-pointer mb-8"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-[#ddff00] to-emerald-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative size-40 rounded-full p-1.5 bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-black shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" 
                  alt="Alex Rivera"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="absolute bottom-2 right-2 bg-[#ddff00] text-black p-2.5 rounded-full border-4 border-black shadow-[0_0_20px_rgba(221,255,0,0.5)]"
            >
              <Shield className="w-5 h-5" />
            </motion.div>
          </motion.div>
          
          <div className="text-center mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-display font-bold tracking-tight text-white mb-3"
            >
              Alex Rivera
            </motion.h1>
            <div className="inline-flex items-center gap-2 bg-[#ddff00]/10 px-4 py-2 rounded-xl border border-[#ddff00]/20 mb-4 shadow-[0_0_20px_rgba(221,255,0,0.1)]">
              <Zap className="w-4 h-4 text-[#ddff00]" />
              <span className="text-[#ddff00] font-mono text-[10px] font-black uppercase tracking-[0.2em]">Pro Member</span>
            </div>
            <p className="text-white/60 text-base font-medium">Human-Centric Precision Enthusiast</p>
            <p className="text-white/20 text-[10px] font-mono uppercase tracking-[0.3em] mt-3">Member since Jan 2022</p>
          </div>
          
          <div className="flex w-full max-w-md gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-3 rounded-[24px] h-16 bg-white/5 hover:bg-white/10 font-bold transition-all border border-white/10 text-white shadow-xl group"
            >
              <Edit2 className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              <span className="text-sm uppercase tracking-widest font-mono">Edit Profile</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-3 rounded-[24px] h-16 bg-[#ddff00] text-black font-bold shadow-[0_0_30px_rgba(221,255,0,0.3)] transition-all border border-[#ddff00]/50"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm uppercase tracking-widest font-mono">Share</span>
            </motion.button>
          </div>
        </section>

        {/* Personal Best Stats */}
        <section className="px-6 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
            <h3 className="text-2xl font-display font-bold text-white">Personal Best Stats</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Consistency', value: '98', unit: '%', icon: Activity },
              { label: 'Match Score', value: '842', unit: '', icon: TrendingUp },
              { label: 'Impact', value: '15k', unit: '', icon: Zap, highlight: true }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col gap-3 rounded-[32px] ${stat.highlight ? 'bg-[#ddff00]/10 border-[#ddff00]/20' : 'bg-white/5 border-white/10'} border p-6 items-center text-center shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/40 transition-colors`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  <stat.icon className={`w-12 h-12 ${stat.highlight ? 'text-[#ddff00]' : 'text-white'}`} />
                </div>
                <p className={`${stat.highlight ? 'text-[#ddff00]' : 'text-white'} font-display text-4xl font-bold leading-none relative z-10 tracking-tighter`}>
                  {stat.value}<span className="text-xl font-mono ml-0.5">{stat.unit}</span>
                </p>
                <p className={`${stat.highlight ? 'text-[#ddff00]/60' : 'text-white/30'} text-[10px] font-mono font-black uppercase tracking-[0.2em] mt-1 relative z-10`}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main Content Sections */}
        <div className="flex flex-col gap-12 px-6">
          {/* My Cookbook Summary */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <BookOpen className="w-5 h-5 text-[#ddff00]" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white">My Cookbook</h3>
              </div>
              <motion.button 
                whileHover={{ x: 5 }}
                className="text-[#ddff00] text-[10px] font-mono font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#ddff00]/80 transition-colors"
              >
                View All <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
              {[
                { title: 'Omega-3 Power Bowl', time: '2d ago', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400' },
                { title: 'Precision Detox Mix', time: '5d ago', img: 'https://images.unsplash.com/photo-1540420773420-3365772f3d19?auto=format&fit=crop&q=80&w=400' }
              ].map((recipe, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="min-w-[200px] flex flex-col gap-4 group cursor-pointer"
                >
                  <div className="aspect-square rounded-[40px] bg-white/5 overflow-hidden relative border border-white/10 shadow-2xl group-hover:border-[#ddff00]/30 transition-colors">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src={recipe.img} alt={recipe.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-full p-2.5 border border-white/10 hover:bg-white/20 transition-colors">
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="px-2">
                    <p className="text-base font-bold text-white font-display truncate group-hover:text-[#ddff00] transition-colors">{recipe.title}</p>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1.5">{recipe.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Active Plans */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <Calendar className="w-5 h-5 text-[#ddff00]" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white">Active Plans</h3>
            </div>
            
            <div className="space-y-6">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-6 p-8 rounded-[40px] bg-white/5 border border-white/10 shadow-2xl group hover:border-[#ddff00]/30 transition-colors cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#ddff00]/5 rounded-full blur-[60px] group-hover:bg-[#ddff00]/10 transition-colors" />
                
                <div className="size-16 rounded-[24px] bg-[#ddff00]/10 flex items-center justify-center text-[#ddff00] border border-[#ddff00]/20 shrink-0 relative z-10">
                  <Award className="w-8 h-8" />
                </div>
                
                <div className="flex-1 relative z-10">
                  <div className="flex justify-between items-end mb-4">
                    <p className="font-display font-bold text-white text-2xl group-hover:text-[#ddff00] transition-colors">Metabolic Precision 2.0</p>
                    <p className="text-[10px] font-mono font-black text-[#ddff00] uppercase tracking-[0.2em] bg-[#ddff00]/10 px-3 py-1.5 rounded-xl border border-[#ddff00]/20">Day 14/21</p>
                  </div>
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-[#ddff00]/40 to-[#ddff00] h-full rounded-full relative shadow-[0_0_20px_rgba(221,255,0,0.5)]"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
