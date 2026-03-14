import React from 'react';
import { ArrowLeft, Share2, Play, Activity, Smile, ChevronRight, Zap, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface DictionaryViewProps {
  setCurrentView?: (view: string) => void;
}

export function DictionaryView({ setCurrentView }: DictionaryViewProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-black selection:bg-[#ddff00] selection:text-black overflow-x-hidden pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-black/40 backdrop-blur-xl p-6 justify-between border-b border-white/5">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentView?.('home')}
          className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <h2 className="text-white text-xl font-bold tracking-tight flex-1 text-center font-display">Ingredient Deep Dive</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <Share2 className="w-6 h-6" />
        </motion.button>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full">
        <div className="px-6 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group overflow-hidden rounded-[40px] aspect-[4/5] md:aspect-video border border-white/10 shadow-2xl"
          >
            <img 
              alt="Close up of artisan sourdough bread crust texture" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&q=80&w=1200"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10">
              <span className="inline-block px-4 py-2 mb-6 text-[10px] font-black font-mono tracking-[0.2em] uppercase bg-[#ddff00] text-black rounded-xl shadow-[0_0_20px_rgba(221,255,0,0.4)]">Fermentation</span>
              <h1 className="text-white text-5xl md:text-6xl font-bold leading-[1.1] tracking-tighter mb-4 font-display">Sourdough</h1>
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-[#ddff00]" />
                <p className="text-white/60 text-sm font-mono font-bold tracking-[0.2em] uppercase">Triticum aestivum</p>
              </div>
            </div>
          </motion.div>
        </div>

        <section className="px-6 py-8 space-y-16">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h4 className="text-[#ddff00] text-[10px] font-black font-mono tracking-[0.3em] uppercase mb-6">Culinary History</h4>
            <p className="text-white/80 text-xl leading-relaxed font-display italic">
              "The soul of bread lies in its patience."
            </p>
            <p className="mt-8 text-white/50 text-base leading-relaxed">
              Dating back to 3700 BC in ancient Egypt, sourdough is the original leavened bread. Unlike modern commercial varieties, it relies on a symbiotic colony of wild yeast and lactobacilli, creating a complex ecosystem that transforms humble flour into a nutritional powerhouse.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl group hover:border-[#ddff00]/30 transition-colors"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-[#ddff00]/50 transition-colors">
                  <Activity className="text-[#ddff00] w-6 h-6" />
                </div>
                <h3 className="font-bold text-2xl font-display text-white">Bio-Active Properties</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="text-[#ddff00] font-mono font-black text-sm mt-0.5">01.</span>
                  <p className="text-sm text-white/50 leading-relaxed"><strong className="text-white font-display text-base block mb-1">Phytic Acid Reduction</strong> The long fermentation process neutralizes phytates, significantly increasing mineral absorption.</p>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#ddff00] font-mono font-black text-sm mt-0.5">02.</span>
                  <p className="text-sm text-white/50 leading-relaxed"><strong className="text-white font-display text-base block mb-1">Prebiotic Fiber</strong> Rich in resistant starch which acts as fuel for beneficial gut bacteria.</p>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#ddff00] font-mono font-black text-sm mt-0.5">03.</span>
                  <p className="text-sm text-white/50 leading-relaxed"><strong className="text-white font-display text-base block mb-1">Low Glycemic</strong> Natural acids slow down the rate at which glucose is released into the bloodstream.</p>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-[#ddff00]/10 to-transparent p-8 rounded-[40px] border border-[#ddff00]/20 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ddff00]/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-[#ddff00]/20 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <Zap className="text-[#ddff00] w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-2xl font-display text-white">Real Feel™ Impact</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '85%', label: 'Easier Digestion' },
                    { value: 'Sustained', label: 'Energy Release' },
                    { value: 'Reduced', label: 'Bloating' },
                    { value: 'Nutrient', label: 'Dense Bloom' }
                  ].map((stat, i) => (
                    <div key={i} className="text-center p-6 bg-black/40 backdrop-blur-md rounded-[24px] border border-white/10 hover:border-[#ddff00]/30 transition-colors">
                      <span className="text-[#ddff00] text-2xl font-display font-bold block mb-2">{stat.value}</span>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-mono font-black text-white/60">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-[40px] bg-white/5 border border-white/10 aspect-video shadow-2xl group cursor-pointer"
          >
            <img 
              alt="Baker scoring sourdough dough before baking" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 text-white group-hover:bg-[#ddff00] group-hover:text-black group-hover:border-[#ddff00] transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(221,255,0,0.4)]">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </div>
            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
              <div>
                <div className="text-[#ddff00] text-[10px] font-black font-mono uppercase tracking-[0.3em] mb-2">Masterclass</div>
                <div className="text-white text-2xl font-bold font-display">The Art of the Starter</div>
              </div>
              <div className="size-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
