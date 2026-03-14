import React from 'react';
import { TrendingDown, TrendingUp, Activity, Camera, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="max-w-md mx-auto w-full flex flex-col pb-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="sticky top-0 z-40 flex items-center bg-[#1a0f0a]/80 backdrop-blur-md p-4 border-b border-[#ec5b13]/20 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#ec5b13] rounded-lg p-2 flex items-center justify-center text-white">
            <span className="text-xl leading-none">♠️</span>
          </div>
          <div>
            <h2 className="text-slate-100 text-lg font-black leading-tight tracking-tight uppercase">Woobook</h2>
            <p className="text-xs text-[#ec5b13] font-bold tracking-widest">YEAR 15 • ACTIVE</p>
          </div>
        </div>
        <div className="size-10 rounded-full bg-[#ec5b13]/20 border border-[#ec5b13]/40 flex items-center justify-center overflow-hidden">
          <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </header>

      <div className="p-4 space-y-8">
        {/* Hero Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-[#ec5b13]/5 border border-[#ec5b13]/20">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Weight</p>
            <p className="text-slate-100 tracking-tight text-3xl font-extrabold">75.4 <span className="text-sm font-medium">kg</span></p>
            <p className="text-red-500 text-sm font-bold flex items-center gap-1">
              <TrendingDown className="w-4 h-4" /> -0.5kg
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-[#ec5b13]/5 border border-[#ec5b13]/20">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Body Fat</p>
            <p className="text-slate-100 tracking-tight text-3xl font-extrabold">14.2 <span className="text-sm font-medium">%</span></p>
            <p className="text-red-500 text-sm font-bold flex items-center gap-1">
              <TrendingDown className="w-4 h-4" /> -0.2%
            </p>
          </div>
        </motion.div>

        {/* Phase Performance Chart */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-100 text-xl font-extrabold tracking-tight uppercase">Phase Performance</h2>
            <span className="text-xs bg-[#ec5b13]/20 text-[#ec5b13] px-2 py-1 rounded font-bold uppercase tracking-widest">Active: Cut</span>
          </div>
          <div className="bg-[#ec5b13]/5 border border-[#ec5b13]/10 rounded-xl p-6">
            <div className="flex flex-col gap-1 mb-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Progress Overview</p>
              <div className="flex items-baseline gap-2">
                <p className="text-slate-100 tracking-tight text-2xl font-bold">Six Month Delta</p>
                <p className="text-red-500 text-lg font-bold">-4.2%</p>
              </div>
            </div>
            <div className="relative h-[150px] w-full">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 478 150">
                <path d="M0 109C18.15 109 18.15 21 36.3 21C54.46 21 54.46 41 72.61 41C90.76 41 90.76 93 108.92 93C127.07 93 127.07 33 145.23 33C163.38 33 163.38 101 181.53 101C199.69 101 199.69 61 217.84 61C236 61 236 45 254.15 45C272.3 45 272.3 121 290.46 121C308.61 121 308.61 149 326.76 149C344.92 149 344.92 1 363.07 1C381.23 1 381.23 81 399.38 81C417.53 81 417.53 129 435.69 129C453.84 129 453.84 25 472 25V149H0V109Z" fill="url(#chart-grad)"></path>
                <path d="M0 109C18.15 109 18.15 21 36.3 21C54.46 21 54.46 41 72.61 41C90.76 41 90.76 93 108.92 93C127.07 93 127.07 33 145.23 33C163.38 33 163.38 101 181.53 101C199.69 101 199.69 61 217.84 61C236 61 236 45 254.15 45C272.3 45 272.3 121 290.46 121C308.61 121 308.61 149 326.76 149C344.92 149 344.92 1 363.07 1C381.23 1 381.23 81 399.38 81C417.53 81 417.53 129 435.69 129C453.84 129 453.84 25 472 25" stroke="#ec5b13" strokeLinecap="round" strokeWidth="3"></path>
                <defs>
                  <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ec5b13" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#ec5b13" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex justify-between mt-4">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
                <p key={m} className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">{m}</p>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Progress Gallery */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-100 text-xl font-extrabold tracking-tight uppercase">Progress Gallery</h2>
            <button className="text-[#ec5b13] text-sm font-bold flex items-center gap-1">
              VIEW ALL <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <div className="min-w-[140px] flex-shrink-0 group relative overflow-hidden rounded-xl bg-[#ec5b13]/10 border border-[#ec5b13]/20">
              <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300&h=400" alt="Today" className="w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-white text-[10px] font-bold uppercase tracking-widest">Today</p>
                <p className="text-[#ec5b13] text-xs font-bold">14.2% BF</p>
              </div>
            </div>
            <div className="min-w-[140px] flex-shrink-0 group relative overflow-hidden rounded-xl bg-[#ec5b13]/10 border border-[#ec5b13]/20">
              <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300&h=400" alt="30 Days Ago" className="w-full h-[200px] object-cover opacity-80 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-white text-[10px] font-bold uppercase tracking-widest">30 Days Ago</p>
                <p className="text-slate-300 text-xs font-medium">14.8% BF</p>
              </div>
            </div>
            <button className="min-w-[140px] flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-[#ec5b13]/30 rounded-xl bg-transparent text-[#ec5b13]/50 hover:bg-[#ec5b13]/10 transition-colors">
              <Camera className="w-8 h-8 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Add Entry</p>
            </button>
          </div>
        </motion.section>

        {/* Daily Sync */}
        <motion.section variants={itemVariants}>
            <h2 className="text-slate-100 text-xl font-extrabold tracking-tight uppercase mb-4">Daily Sync</h2>
            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0 w-12">
                        <div className="size-10 rounded-full bg-[#ec5b13]/20 flex items-center justify-center text-[#ec5b13]">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div className="w-0.5 h-full bg-[#ec5b13]/20 my-2"></div>
                    </div>
                    <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-slate-100 font-bold">Strength Session (Push)</h3>
                                <p className="text-slate-400 text-xs">10:00 AM • 75 mins</p>
                            </div>
                            <span className="text-[#ec5b13] text-xs font-bold">640 kcal burnt</span>
                        </div>
                        <div className="bg-[#ec5b13]/5 border border-[#ec5b13]/30 rounded-xl p-4">
                            <ul className="text-sm space-y-2 text-slate-300">
                                <li className="flex justify-between border-b border-[#ec5b13]/10 pb-2">
                                    <span>Bench Press</span>
                                    <span className="font-bold">4 x 8 @ 185lbs</span>
                                </li>
                                <li className="flex justify-between pt-1">
                                    <span>Overhead Press</span>
                                    <span className="font-bold">3 x 10 @ 95lbs</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
