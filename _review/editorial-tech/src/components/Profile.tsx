import React, { useState } from 'react';
import { Download, Settings, Target, Activity, Leaf, Droplets, Flame, ChevronRight, User, Moon, Zap, Brain, Smile, Frown, Meh, Heart, Watch } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

export default function Profile() {
  const { mood, setMood, preferences, togglePreference } = useAppContext();
  const [goal, setGoal] = useState<'fat-loss' | 'maintenance' | 'muscle-gain'>('fat-loss');

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
      className="max-w-md mx-auto w-full flex flex-col bg-[#1a0f0a] min-h-screen pb-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <header className="p-6 pt-8 border-b border-[#ec5b13]/10 sticky top-0 bg-[#1a0f0a]/90 backdrop-blur-md z-40">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ec5b13] to-orange-600 p-0.5">
              <div className="w-full h-full bg-[#1a0f0a] rounded-full flex items-center justify-center border-2 border-[#1a0f0a] overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=5" alt="Mom" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                Sarah <span className="text-sm">♠️</span>
              </h1>
              <p className="text-xs text-[#ec5b13] font-bold uppercase tracking-widest">Woobook • Year 15</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Wearable Status */}
        <div className="bg-[#ec5b13]/10 border border-[#ec5b13]/30 rounded-xl p-3 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Watch className="w-6 h-6 text-[#ec5b13]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1a0f0a]"></span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">Woop Strap</p>
              <p className="text-[10px] text-[#ec5b13] font-medium">Connected • Syncing</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-slate-100">84%</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Recovery</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-8">
        {/* Mood & Wellbeing Tracker */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-[#ec5b13]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">Daily Wellbeing</h2>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 mb-4 font-medium">How are you feeling today?</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Great', icon: Smile, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
                { id: 'Okay', icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
                { id: 'Tired', icon: Frown, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    mood === m.id 
                      ? `${m.bg} ${m.border} ${m.color}` 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <m.icon className="w-6 h-6 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{m.id}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Personal Preferences */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[#ec5b13]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">Personal Preferences</h2>
          </div>
          <div className="space-y-2">
            {[
              { id: 'lipstick', label: 'Lipstick Routine', icon: '💄', desc: 'Remind me to apply before leaving' },
              { id: 'comfortable-clothing', label: 'Comfortable Clothing', icon: '👕', desc: 'Prioritize comfort over style today' },
              { id: 'intermittent-fasting', label: 'Intermittent Fasting', icon: '🌙', desc: '16:8 Fasting Window' }
            ].map(pref => (
              <div 
                key={pref.id}
                onClick={() => togglePreference(pref.id)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  preferences.has(pref.id)
                    ? 'bg-[#ec5b13]/5 border-[#ec5b13]/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-xl ${preferences.has(pref.id) ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                    {pref.icon}
                  </div>
                  <div>
                    <span className={`text-sm font-bold block ${preferences.has(pref.id) ? 'text-slate-200' : 'text-slate-400'}`}>{pref.label}</span>
                    <span className="text-[10px] text-slate-500">{pref.desc}</span>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors shrink-0 ${preferences.has(pref.id) ? 'bg-[#ec5b13]' : 'bg-slate-800'}`}>
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: preferences.has(pref.id) ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Correlation Analysis (Translated & Enhanced) */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-[#ec5b13]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">Nutritional Impact</h2>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Correlation Analysis</h3>
                <p className="text-[10px] text-slate-500 mt-1">Late Night Carbs vs. REM Sleep Quality</p>
              </div>
              <div className="text-right">
                <span className="text-[#ec5b13] text-xl font-black leading-none block">-14%</span>
                <span className="text-[9px] uppercase text-slate-500 font-bold tracking-widest">REM Variance</span>
              </div>
            </div>
            
            <div className="relative w-full aspect-[4/3] bg-[#1a0f0a] border border-slate-800 rounded-xl p-4 flex flex-col justify-end overflow-hidden mb-4">
              {/* SVG Chart */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Grid lines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                {/* Data lines */}
                <path d="M10,80 L25,45 L40,60 L55,20 L70,50 L85,15 L95,40" fill="none" stroke="#ec5b13" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M10,30 L25,40 L40,35 L55,70 L70,45 L85,80 L95,50" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="4 4" />
                
                {/* Data points */}
                <circle cx="10" cy="80" r="2" fill="#ec5b13" />
                <circle cx="25" cy="45" r="2" fill="#ec5b13" />
                <circle cx="40" cy="60" r="2" fill="#ec5b13" />
                <circle cx="55" cy="20" r="2" fill="#ec5b13" />
                <circle cx="70" cy="50" r="2" fill="#ec5b13" />
                <circle cx="85" cy="15" r="2" fill="#ec5b13" />
                
                <circle cx="10" cy="30" r="2" fill="#3b82f6" />
                <circle cx="25" cy="40" r="2" fill="#3b82f6" />
                <circle cx="40" cy="35" r="2" fill="#3b82f6" />
                <circle cx="55" cy="70" r="2" fill="#3b82f6" />
                <circle cx="70" cy="45" r="2" fill="#3b82f6" />
                <circle cx="85" cy="80" r="2" fill="#3b82f6" />
              </svg>
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-[#1a0f0a]/90 p-2.5 rounded-lg backdrop-blur-md border border-slate-800">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ec5b13]"></span> Carbs (g)</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> REM Quality (%)</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-[#ec5b13] font-bold uppercase tracking-widest mr-2">Insight:</span> 
              Consuming complex carbohydrates after 21:00 correlates with increased fragmentation during initial REM sleep phases.
            </p>
          </div>
        </motion.section>

        {/* Top Fuel for Focus */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ec5b13]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">Top Fuel for Focus</h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Based on logs</span>
          </div>
          
          <div className="space-y-3">
            <FuelCard icon="🥑" title="Healthy Fats" desc="Improved morning glucose stability" score={92} />
            <FuelCard icon="☕" title="Caffeine (Pre-12PM)" desc="Cortisol peak optimization" score={88} />
            <FuelCard icon="🫐" title="Anthocyanins" desc="Reduced visual fatigue" score={74} />
          </div>
        </motion.section>

        <motion.button 
          variants={itemVariants}
          className="w-full py-4 rounded-xl bg-[#ec5b13] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#ec5b13]/90 transition-all flex justify-center items-center gap-2 shadow-lg shadow-[#ec5b13]/20 active:scale-[0.98] mt-8"
        >
          <Download className="w-4 h-4" /> Generate Full Report
        </motion.button>
      </main>
    </motion.div>
  );
}

function FuelCard({ icon, title, desc, score }: { icon: string, title: string, desc: string, score: number }) {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-800 bg-slate-900/50 rounded-xl group hover:border-[#ec5b13]/50 transition-colors relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ec5b13] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex gap-4 items-center relative z-10">
        <div className="w-10 h-10 rounded-full bg-[#1a0f0a] border border-slate-700 flex items-center justify-center text-xl shadow-inner group-hover:border-[#ec5b13]/30 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-200 group-hover:text-[#ec5b13] transition-colors">{title}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="text-right relative z-10">
        <span className="text-xs font-black text-slate-200">{score}%</span>
        <div className="w-16 h-1.5 bg-slate-800 mt-1.5 rounded-full overflow-hidden">
          <div className="bg-[#ec5b13] h-full transition-all duration-1000" style={{ width: `${score}%` }}></div>
        </div>
      </div>
    </div>
  );
}
