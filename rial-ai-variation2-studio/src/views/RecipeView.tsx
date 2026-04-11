import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, Plus, Minus, Package, Activity, ExternalLink, CheckCircle2, ChevronDown, ChevronUp, Scale, Flame, Droplets, Beef, Zap, Clock, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatIngredient, Ingredient, UnitSystem } from '../utils/conversions';

interface RecipeViewProps {
  setCurrentView?: (view: string) => void;
}

export function RecipeView({ setCurrentView }: RecipeViewProps) {
  const [servings, setServings] = useState(4);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [showFullNutrition, setShowFullNutrition] = useState(false);

  const baseIngredients: Ingredient[] = [
    { name: "Wild Sockeye Salmon Fillet", amount: 112.5, unit: "g" },
    { name: "Heirloom Carrots", amount: 50, unit: "g" },
    { name: "Organic Extra Virgin Olive Oil", amount: 15, unit: "ml" },
    { name: "Fresh Rosemary", amount: 2.5, unit: "g" }
  ];

  return (
    <div className="pb-32 bg-black selection:bg-[#ddff00] selection:text-black min-h-screen">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 p-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView?.('home')}
            className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-xl font-bold tracking-tight font-display text-white">Recipe Master</h1>
          <div className="flex gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <Heart className="w-6 h-6" />
            </motion.button>
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

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-[4/5] md:aspect-video overflow-hidden rounded-[40px] border border-white/10 shadow-2xl group"
        >
          <img 
            alt="Artisan plated roasted salmon with seasonal vegetables" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=1200"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-[#ddff00] px-5 py-2 rounded-xl text-[10px] font-mono font-black text-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(221,255,0,0.4)]">Artisan Selection</span>
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2 rounded-xl border border-white/10">
                <Clock className="w-4 h-4 text-[#ddff00]" />
                <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em]">25 Mins</span>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] font-display tracking-tighter">Wild-Caught Salmon & Harvest Roots</h2>
          </div>
        </motion.div>

        {/* Scaling & Unit Controls */}
        <section className="mt-12 flex flex-col sm:flex-row gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex-1 bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Utensils className="w-20 h-20 text-[#ddff00]" />
            </div>
            <div className="mb-8 relative z-10">
              <p className="text-[10px] text-white/40 uppercase font-mono font-black tracking-[0.3em] mb-3">Portions</p>
              <p className="text-base font-medium text-white/60">Adjust serving size</p>
            </div>
            <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-[24px] p-2.5 border border-white/10 relative z-10 w-fit">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="size-14 flex items-center justify-center rounded-2xl hover:bg-white/5 text-white/60 hover:text-white transition-colors"
              >
                <Minus className="w-6 h-6" />
              </motion.button>
              <span className="px-10 font-display font-bold text-4xl text-white tracking-tighter">{servings}</span>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setServings(servings + 1)}
                className="size-14 flex items-center justify-center rounded-2xl bg-[#ddff00] text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(221,255,0,0.3)]"
              >
                <Plus className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex-1 bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Scale className="w-20 h-20 text-[#ddff00]" />
            </div>
            <div className="mb-8 relative z-10">
              <p className="text-[10px] text-white/40 uppercase font-mono font-black tracking-[0.3em] mb-3">Measurement</p>
              <p className="text-base font-medium text-white/60">Select unit system</p>
            </div>
            <div className="flex bg-black/40 backdrop-blur-md rounded-[24px] p-2.5 border border-white/10 relative z-10 w-full">
              <button 
                onClick={() => setUnitSystem('metric')}
                className={`flex-1 py-5 rounded-2xl text-[10px] font-black font-mono tracking-[0.2em] uppercase transition-all ${unitSystem === 'metric' ? 'bg-[#ddff00] text-black shadow-[0_0_20px_rgba(221,255,0,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                Metric
              </button>
              <button 
                onClick={() => setUnitSystem('imperial')}
                className={`flex-1 py-5 rounded-2xl text-[10px] font-black font-mono tracking-[0.2em] uppercase transition-all ${unitSystem === 'imperial' ? 'bg-[#ddff00] text-black shadow-[0_0_20px_rgba(221,255,0,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                Imperial
              </button>
            </div>
          </motion.div>
        </section>

        {/* Ingredients List */}
        <section className="mt-16">
          <div className="flex items-center gap-4 mb-10">
            <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
            <h3 className="text-2xl font-display font-bold text-white">Technical Specs</h3>
          </div>
          <div className="space-y-6">
            {baseIngredients.map((ingredient, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-between shadow-2xl group hover:border-[#ddff00]/30 transition-colors"
              >
                <div className="flex items-center gap-8">
                  <div className="size-16 rounded-[24px] bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-[#ddff00]/50 transition-colors">
                    <CheckCircle2 className="text-[#ddff00] w-8 h-8 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xl font-display font-bold text-white/80 group-hover:text-white transition-colors">{ingredient.name}</span>
                </div>
                <div className="text-xs font-mono font-black text-[#ddff00] bg-[#ddff00]/10 px-5 py-2.5 rounded-xl border border-[#ddff00]/20 shadow-[0_0_15px_rgba(221,255,0,0.1)]">
                  {formatIngredient(ingredient, servings, unitSystem)}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Comprehensive Nutrition Profile */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-[#ddff00]/10 p-4 rounded-[24px] border border-[#ddff00]/20">
                <Activity className="w-7 h-7 text-[#ddff00]" />
              </div>
              <h3 className="text-3xl font-display font-bold text-white">Nutrient Profile</h3>
            </div>
            <span className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.3em]">Per Serving</span>
          </div>

          {/* Primary Macros */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Calories', value: '420', unit: 'kcal', icon: Flame, color: '#ddff00', progress: 0 },
              { label: 'Protein', value: '38', unit: 'g', icon: Beef, color: '#10b981', progress: 75 },
              { label: 'Carbs', value: '24', unit: 'g', icon: Activity, color: '#f59e0b', progress: 40 },
              { label: 'Fats', value: '12', unit: 'g', icon: Droplets, color: '#3b82f6', progress: 30 }
            ].map((macro, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center shadow-2xl relative overflow-hidden group hover:border-[#ddff00]/30 transition-colors"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <macro.icon className="w-12 h-12" style={{ color: macro.color }} />
                </div>
                <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mb-4">{macro.label}</p>
                <p className="text-5xl font-bold font-display text-white tracking-tighter">{macro.value}</p>
                <p className="text-[10px] font-mono font-black text-white/40 mt-2 uppercase tracking-widest">{macro.unit}</p>
                {macro.progress > 0 && (
                  <div className="w-full h-2 bg-black/40 rounded-full mt-6 overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${macro.progress}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full rounded-full" 
                      style={{ backgroundColor: macro.color }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Expandable Detailed Nutrition */}
          <motion.div 
            layout
            className="bg-white/5 rounded-[48px] border border-white/10 shadow-2xl overflow-hidden transition-all duration-500"
          >
            <button 
              onClick={() => setShowFullNutrition(!showFullNutrition)}
              className="w-full p-10 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="font-bold font-display text-3xl text-white tracking-tight">Detailed Micronutrients</span>
              <motion.div 
                animate={{ rotate: showFullNutrition ? 180 : 0 }}
                className="size-14 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/40"
              >
                <ChevronDown className="w-7 h-7" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {showFullNutrition && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-10 pt-0 border-t border-white/5 space-y-8"
                >
                  {[
                    { label: 'Vitamin D3', value: '88% DV', progress: 88, color: '#ddff00' },
                    { label: 'Magnesium', value: '62% DV', progress: 62, color: '#ddff00' },
                    { label: 'Omega-3', value: 'Surplus', progress: 100, color: '#ddff00', special: true },
                    { label: 'Fiber', value: '45% DV', progress: 45, color: '#f59e0b' }
                  ].map((micro, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-lg font-display font-bold text-white/60 w-40">{micro.label}</span>
                      <div className="flex items-center gap-8 flex-1">
                        <div className="h-3 flex-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${micro.progress}%` }}
                            className="h-full relative" 
                            style={{ backgroundColor: micro.color }}
                          >
                            {micro.special && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}
                          </motion.div>
                        </div>
                        <div className={`text-[10px] font-mono font-black px-4 py-1.5 rounded-xl border w-28 text-center uppercase tracking-widest ${micro.special ? 'bg-[#ddff00] text-black border-[#ddff00]/50' : 'text-[#ddff00] border-[#ddff00]/20 bg-[#ddff00]/5'}`}>
                          {micro.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Real Match Integration */}
        <section className="mt-16 mb-20">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-white/10 to-transparent rounded-[48px] p-12 relative overflow-hidden border border-[#ddff00]/20 shadow-2xl group"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ddff00]/10 rounded-full blur-[120px] transform translate-x-20 -translate-y-20 group-hover:bg-[#ddff00]/20 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Zap className="w-8 h-8 text-[#ddff00] shadow-[0_0_20px_#ddff00]" />
                    <h4 className="text-4xl font-bold font-display text-white tracking-tighter">Real Match™</h4>
                  </div>
                  <p className="text-white/40 text-base font-mono font-black uppercase tracking-[0.2em]">Bio-sync performance alignment</p>
                </div>
                <div className="size-32 rounded-full border-4 border-[#ddff00]/20 flex items-center justify-center bg-black/60 backdrop-blur-md shadow-[0_0_50px_rgba(221,255,0,0.2)] relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                    <motion.circle 
                      initial={{ strokeDashoffset: 289 }}
                      animate={{ strokeDashoffset: 17 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      cx="50" cy="50" r="46" fill="none" stroke="#ddff00" strokeWidth="8" strokeDasharray="289" strokeLinecap="round" 
                    />
                  </svg>
                  <span className="text-4xl font-bold font-display text-white">94%</span>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-6 rounded-[28px] bg-[#ddff00]/10 hover:bg-[#ddff00]/20 transition-colors text-[10px] font-black font-mono uppercase tracking-[0.3em] flex items-center justify-center gap-4 border border-[#ddff00]/30 text-[#ddff00] shadow-2xl"
              >
                View Full Laboratory Profile
                <ExternalLink className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
