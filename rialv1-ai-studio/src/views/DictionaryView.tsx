import React from 'react';
import { ArrowLeft, Share2, Play, Activity, Smile } from 'lucide-react';

export function DictionaryView() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-primary/10">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold tracking-tight flex-1 text-center font-display uppercase">Ingredient Dictionary</h2>
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Share2 className="w-5 h-5" />
        </div>
      </header>

      <main className="flex-1">
        <div className="px-4 py-6">
          <div className="relative group overflow-hidden rounded-xl h-[450px] shadow-2xl">
            <img 
              alt="Close up of artisan sourdough bread crust texture" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&q=80&w=800"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase bg-primary text-black rounded-full">Fermentation</span>
              <h1 className="text-white text-5xl font-bold leading-tight tracking-tighter mb-2 font-display">Sourdough</h1>
              <p className="text-primary/80 text-sm font-medium tracking-[0.2em] uppercase">Triticum aestivum</p>
            </div>
          </div>
        </div>

        <section className="px-4 py-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h4 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4">Culinary History</h4>
            <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-light italic">
              "The soul of bread lies in its patience."
            </p>
            <p className="mt-6 text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              Dating back to 3700 BC in ancient Egypt, sourdough is the original leavened bread. Unlike modern commercial varieties, it relies on a symbiotic colony of wild yeast and lactobacilli, creating a complex ecosystem that transforms humble flour into a nutritional powerhouse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-primary/10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-primary w-6 h-6" />
                <h3 className="font-bold text-lg font-display">Bio-Active Properties</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">01.</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-100">Phytic Acid Reduction:</strong> The long fermentation process neutralizes phytates, significantly increasing mineral absorption.</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">02.</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-100">Prebiotic Fiber:</strong> Rich in resistant starch which acts as fuel for beneficial gut bacteria.</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">03.</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-100">Low Glycemic:</strong> Natural acids slow down the rate at which glucose is released into the bloodstream.</p>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Smile className="text-primary w-6 h-6" />
                <h3 className="font-bold text-lg font-display">'Real Feel' Benefits</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white dark:bg-background-dark rounded-lg shadow-sm">
                  <span className="text-primary text-2xl font-bold">85%</span>
                  <p className="text-[10px] uppercase tracking-wider mt-1">Easier Digestion</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-background-dark rounded-lg shadow-sm">
                  <span className="text-primary text-2xl font-bold">Sustained</span>
                  <p className="text-[10px] uppercase tracking-wider mt-1">Energy Release</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-background-dark rounded-lg shadow-sm">
                  <span className="text-primary text-2xl font-bold">Reduced</span>
                  <p className="text-[10px] uppercase tracking-wider mt-1">Bloating</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-background-dark rounded-lg shadow-sm">
                  <span className="text-primary text-2xl font-bold">Nutrient</span>
                  <p className="text-[10px] uppercase tracking-wider mt-1">Dense Bloom</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-video">
            <img 
              alt="Baker scoring sourdough dough before baking" 
              className="absolute inset-0 w-full h-full object-cover opacity-70"
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="size-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white hover:bg-white/30 transition-colors">
                <Play className="w-8 h-8 ml-1" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 text-white text-xs font-medium uppercase tracking-widest">Masterclass: The Art of the Starter</div>
          </div>
        </section>
      </main>
    </div>
  );
}
