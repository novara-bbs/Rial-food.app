import React from 'react';
import { ArrowLeft, Share2, Zap, CheckCircle, Moon, BarChart2, Calendar, Bookmark, Activity } from 'lucide-react';

export function RealMatchResultView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#fdfbf7] dark:bg-[#1a1a1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fdfbf7]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <button className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-lg font-bold font-display text-slate-900 dark:text-white">Analysis Complete</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-slate-900 dark:text-white" />
        </button>
      </header>

      <div className="px-4 mt-8 flex flex-col items-center">
        {/* Diamond Score */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a36]/20 to-transparent transform rotate-45 rounded-3xl" />
          <div className="absolute inset-4 bg-white dark:bg-surface-dark transform rotate-45 rounded-2xl shadow-lg border border-[#ff5a36]/10" />
          
          <div className="relative z-10 text-center">
            <span className="text-5xl font-bold font-display text-[#ff5a36]">94%</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Match</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-3">It's a Real Match!</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            This profile aligns with 94% of your current biological requirements and goals.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 w-full mb-10">
          <div className="flex-1 bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#ff5a36]" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bio-Score</span>
            </div>
            <p className="text-3xl font-bold font-display text-slate-900 dark:text-white">A+</p>
          </div>
          
          <div className="flex-1 bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-[#ff5a36]" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidence</span>
            </div>
            <p className="text-3xl font-bold font-display text-slate-900 dark:text-white">98%</p>
          </div>
        </div>

        {/* Why it matches */}
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-[#ff5a36]" />
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Why it matches</h3>
          </div>

          {/* Reason 1 */}
          <div className="bg-[#fff5f2] dark:bg-[#ff5a36]/5 rounded-2xl p-5 border-l-4 border-[#ff5a36]">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ff5a36]/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-[#ff5a36]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Optimized Magnesium</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Directly addresses your reported afternoon energy dips and muscle recovery needs.
                </p>
              </div>
            </div>
          </div>

          {/* Reason 2 */}
          <div className="bg-[#fff5f2] dark:bg-[#ff5a36]/5 rounded-2xl p-5 border-l-4 border-[#ff5a36]">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ff5a36]/20 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-[#ff5a36]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Probiotic Synergy</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  High in L. acidophilus to balance your current digestion state and gut biome markers.
                </p>
              </div>
            </div>
          </div>

          {/* Reason 3 */}
          <div className="bg-slate-100 dark:bg-surface-dark rounded-2xl p-5 border-l-4 border-slate-300 dark:border-slate-700">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Circadian Support</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Contains specific amino acids that assist in natural melatonin production for tonight.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Recommendation */}
        <div className="w-full mt-10">
          <div className="relative rounded-3xl overflow-hidden h-48 shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" 
              alt="Quinoa Bowl" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-[10px] font-bold text-[#ff5a36] uppercase tracking-widest mb-1">Recipe Recommendation</p>
              <h3 className="text-xl font-bold font-display text-white leading-tight">Quinoa & Roasted Root Power Bowl</h3>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-6 space-y-3">
          <button className="w-full bg-[#ff5a36] text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-[#ff5a36]/20 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Plan for Batch Prep
          </button>
          <button className="w-full bg-slate-200 dark:bg-surface-dark text-slate-900 dark:text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2">
            <Bookmark className="w-5 h-5" />
            Add to Journal
          </button>
        </div>
      </div>
    </div>
  );
}
