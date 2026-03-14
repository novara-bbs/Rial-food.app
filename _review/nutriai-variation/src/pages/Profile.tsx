import { useState } from 'react';
import { Settings, ChevronRight, Activity, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const [keto, setKeto] = useState(true);
  const [plantBased, setPlantBased] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-md mx-auto space-y-8"
    >
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <button className="w-12 h-12 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 shadow-lg">
          <Settings size={24} strokeWidth={2.5} />
        </button>
      </header>

      <section className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-6 border border-zinc-800/50 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-500 shadow-inner">
            JD
          </div>
          <div>
            <h2 className="text-xl font-bold">John Doe</h2>
            <p className="text-sm text-zinc-400">Premium Member</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Weight</p>
            <p className="text-lg font-black">82.4<span className="text-xs text-zinc-500 ml-1 font-bold">kg</span></p>
          </div>
          <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Body Fat</p>
            <p className="text-lg font-black">12.5<span className="text-xs text-zinc-500 ml-1 font-bold">%</span></p>
          </div>
          <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Muscle</p>
            <p className="text-lg font-black">41.2<span className="text-xs text-zinc-500 ml-1 font-bold">kg</span></p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2">Fasting Insights</h3>
        
        <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-2xl border border-zinc-800/50 flex items-center justify-between shadow-md hover:border-zinc-700/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold">16:8 Protocol</p>
              <p className="text-xs text-zinc-400">Current Fasting Window</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-600" />
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-2xl border border-zinc-800/50 flex items-center justify-between shadow-md hover:border-zinc-700/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold">Metabolic Flexibility</p>
              <p className="text-xs text-zinc-400">High Energy Correlation</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-600" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2">Dietary Preferences</h3>
        
        <div 
          onClick={() => setKeto(!keto)}
          className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-2xl border border-zinc-800/50 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 hover:border-zinc-700/50 transition-all shadow-md active:scale-[0.98]"
        >
          <div>
            <p className="font-bold">Ketogenic</p>
            <p className="text-xs text-zinc-400">Low carb, high fat</p>
          </div>
          <div className={`w-12 h-6 rounded-full relative transition-colors ${keto ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
            <motion.div 
              layout
              className={`absolute top-1 w-4 h-4 rounded-full ${keto ? 'bg-zinc-950 right-1' : 'bg-zinc-500 left-1'}`} 
            />
          </div>
        </div>

        <div 
          onClick={() => setPlantBased(!plantBased)}
          className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-2xl border border-zinc-800/50 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 hover:border-zinc-700/50 transition-all shadow-md active:scale-[0.98]"
        >
          <div>
            <p className="font-bold">Plant-Based</p>
            <p className="text-xs text-zinc-400">Vegan friendly</p>
          </div>
          <div className={`w-12 h-6 rounded-full relative transition-colors ${plantBased ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
            <motion.div 
              layout
              className={`absolute top-1 w-4 h-4 rounded-full ${plantBased ? 'bg-zinc-950 right-1' : 'bg-zinc-500 left-1'}`} 
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
}
