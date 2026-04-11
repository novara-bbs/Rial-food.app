import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, Plus, Minus, Package, Activity, ExternalLink, CheckCircle2, ChevronDown, ChevronUp, Scale, Flame, Droplets, Beef, Zap } from 'lucide-react';

export function RecipeView() {
  const [servings, setServings] = useState(4);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [showFullNutrition, setShowFullNutrition] = useState(false);

  const baseIngredients = [
    { name: "Wild Sockeye Salmon Fillet", metricAmount: 112.5, metricUnit: "g", imperialAmount: 4, imperialUnit: "oz" },
    { name: "Heirloom Carrots", metricAmount: 50, metricUnit: "g", imperialAmount: 1.8, imperialUnit: "oz" },
    { name: "Organic Extra Virgin Olive Oil", metricAmount: 15, metricUnit: "ml", imperialAmount: 1, imperialUnit: "tbsp" },
    { name: "Fresh Rosemary", metricAmount: 2.5, metricUnit: "g", imperialAmount: 0.5, imperialUnit: "tsp" }
  ];

  const formatIngredientAmount = (ingredient: typeof baseIngredients[0]) => {
    if (unitSystem === 'metric') {
      const total = ingredient.metricAmount * servings;
      return `${total >= 1000 && ingredient.metricUnit === 'g' ? (total/1000).toFixed(1) : total}${total >= 1000 && ingredient.metricUnit === 'g' ? 'kg' : ingredient.metricUnit}`;
    } else {
      const total = ingredient.imperialAmount * servings;
      return `${total % 1 !== 0 ? total.toFixed(1) : total} ${ingredient.imperialUnit}`;
    }
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-background-dark text-slate-100 min-h-screen">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-16 max-w-3xl mx-auto">
          <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold tracking-tight font-display text-white">Recipe Master</h1>
          <div className="flex gap-2">
            <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
              <Heart className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="relative w-full aspect-[4/5] md:aspect-video overflow-hidden md:rounded-3xl md:mt-4 md:mx-4 md:w-auto border border-white/5 shadow-2xl group">
          <img 
            alt="Artisan plated roasted salmon with seasonal vegetables" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=1200"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-background-dark uppercase tracking-widest border border-primary/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]">Artisan Selection</span>
              <span className="bg-surface-dark/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest border border-white/10">25 Mins</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight font-display tracking-tight">Wild-Caught Salmon & Harvest Roots</h2>
          </div>
        </div>

        {/* Scaling & Unit Controls */}
        <section className="px-4 mt-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-surface-dark p-5 rounded-3xl border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package className="w-12 h-12 text-primary" />
            </div>
            <div className="mb-4 relative z-10">
              <p className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest mb-1">Portions</p>
              <p className="text-sm font-medium text-slate-300">Adjust serving size</p>
            </div>
            <div className="flex items-center justify-between bg-background-dark rounded-2xl p-1.5 border border-white/10 relative z-10 w-fit">
              <button 
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="size-10 flex items-center justify-center rounded-xl hover:bg-surface-dark text-slate-300 hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-6 font-display font-bold text-xl text-white">{servings}</span>
              <button 
                onClick={() => setServings(servings + 1)}
                className="size-10 flex items-center justify-center rounded-xl bg-primary text-background-dark hover:scale-105 transition-transform shadow-[0_0_10px_rgba(20,184,166,0.2)]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-surface-dark p-5 rounded-3xl border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Scale className="w-12 h-12 text-primary" />
            </div>
            <div className="mb-4 relative z-10">
              <p className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest mb-1">Measurement</p>
              <p className="text-sm font-medium text-slate-300">Select unit system</p>
            </div>
            <div className="flex bg-background-dark rounded-2xl p-1.5 border border-white/10 relative z-10 w-full">
              <button 
                onClick={() => setUnitSystem('metric')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all ${unitSystem === 'metric' ? 'bg-primary text-background-dark shadow-[0_0_10px_rgba(20,184,166,0.2)]' : 'text-slate-400 hover:text-white hover:bg-surface-dark'}`}
              >
                Metric
              </button>
              <button 
                onClick={() => setUnitSystem('imperial')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all ${unitSystem === 'imperial' ? 'bg-primary text-background-dark shadow-[0_0_10px_rgba(20,184,166,0.2)]' : 'text-slate-400 hover:text-white hover:bg-surface-dark'}`}
              >
                Imperial
              </button>
            </div>
          </div>
        </section>

        {/* Ingredients List */}
        <section className="px-4 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <h3 className="text-xl font-bold font-display text-white">Technical Specs</h3>
          </div>
          <div className="space-y-3">
            {baseIngredients.map((ingredient, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-between shadow-lg group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-background-dark border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <CheckCircle2 className="text-primary w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{ingredient.name}</span>
                </div>
                <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                  {formatIngredientAmount(ingredient)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Comprehensive Nutrition Profile */}
        <section className="px-4 mt-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-display text-white">Nutrient Profile</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Per Serving</span>
          </div>

          {/* Primary Macros */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-surface-dark p-5 rounded-3xl border border-white/5 text-center shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Flame className="w-8 h-8 text-primary" />
              </div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">Calories</p>
              <p className="text-3xl font-bold font-display text-white">420</p>
              <p className="text-[10px] text-slate-400 mt-1">kcal</p>
            </div>
            <div className="bg-surface-dark p-5 rounded-3xl border border-white/5 text-center shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Beef className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">Protein</p>
              <p className="text-3xl font-bold font-display text-white">38<span className="text-emerald-500 text-lg">g</span></p>
              <div className="w-full h-1.5 bg-background-dark rounded-full mt-3 overflow-hidden border border-white/5">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="bg-surface-dark p-5 rounded-3xl border border-white/5 text-center shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">Carbs</p>
              <p className="text-3xl font-bold font-display text-white">24<span className="text-amber-500 text-lg">g</span></p>
              <div className="w-full h-1.5 bg-background-dark rounded-full mt-3 overflow-hidden border border-white/5">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="bg-surface-dark p-5 rounded-3xl border border-white/5 text-center shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">Fats</p>
              <p className="text-3xl font-bold font-display text-white">12<span className="text-blue-500 text-lg">g</span></p>
              <div className="w-full h-1.5 bg-background-dark rounded-full mt-3 overflow-hidden border border-white/5">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>

          {/* Expandable Detailed Nutrition */}
          <div className="bg-surface-dark rounded-3xl border border-white/5 shadow-lg overflow-hidden transition-all duration-300">
            <button 
              onClick={() => setShowFullNutrition(!showFullNutrition)}
              className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="font-bold font-display text-white">Detailed Micronutrients</span>
              <div className="size-8 rounded-full bg-background-dark border border-white/10 flex items-center justify-center text-slate-400">
                {showFullNutrition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            
            {showFullNutrition && (
              <div className="p-5 pt-0 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Vitamin D3</span>
                  <div className="flex items-center gap-4 flex-1 px-8">
                    <div className="h-2 flex-1 bg-background-dark rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-primary relative" style={{ width: '88%' }}>
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary w-12 text-right">88% DV</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Magnesium</span>
                  <div className="flex items-center gap-4 flex-1 px-8">
                    <div className="h-2 flex-1 bg-background-dark rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-primary" style={{ width: '62%' }}></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary w-12 text-right">62% DV</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Omega-3</span>
                  <div className="flex items-center gap-4 flex-1 px-8">
                    <div className="h-2 flex-1 bg-background-dark rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-background-dark bg-primary px-2 py-0.5 rounded uppercase tracking-widest w-16 text-center">Surplus</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Fiber</span>
                  <div className="flex items-center gap-4 flex-1 px-8">
                    <div className="h-2 flex-1 bg-background-dark rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-amber-500" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-500 w-12 text-right">45% DV</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Real Match Integration */}
        <section className="px-4 mt-8 mb-8">
          <div className="bg-gradient-to-br from-surface-dark to-background-dark rounded-3xl p-8 relative overflow-hidden border border-primary/20 shadow-2xl group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20 group-hover:bg-primary/20 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <h4 className="text-2xl font-bold font-display text-white tracking-tight">Real Match™</h4>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Bio-sync performance alignment</p>
                </div>
                <div className="size-20 rounded-full border-4 border-primary/30 flex items-center justify-center bg-background-dark/80 backdrop-blur-md shadow-[0_0_30px_rgba(20,184,166,0.2)] relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary/10" />
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="289" strokeDashoffset="17" className="text-primary" strokeLinecap="round" />
                  </svg>
                  <span className="text-2xl font-bold font-display text-white">94%</span>
                </div>
              </div>
              
              <button className="w-full py-4 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-bold flex items-center justify-center gap-2 border border-primary/30 text-primary shadow-lg">
                View Full Laboratory Profile
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
