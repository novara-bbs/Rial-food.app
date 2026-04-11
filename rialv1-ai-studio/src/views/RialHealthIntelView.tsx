import React from 'react';
import { ArrowLeft, Share2, Smile, RefreshCw, Zap, Leaf } from 'lucide-react';

export function RialHealthIntelView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-slate-50 dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <button className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-slate-200" />
        </button>
        <h1 className="text-lg font-bold font-display">RIAL Health Intel</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-slate-800 dark:text-slate-200" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark px-4">
        <button className="flex-1 py-4 text-sm font-medium text-slate-500">Overview</button>
        <button className="flex-1 py-4 text-sm font-bold text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white">Correlations</button>
        <button className="flex-1 py-4 text-sm font-medium text-slate-500">Dictionary</button>
      </div>

      <div className="px-4 mt-6 space-y-8">
        {/* Score Cards */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white dark:bg-surface-dark rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase">Real Feel<br/>Score</h3>
              <Smile className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-4xl font-bold font-display mb-2">88<span className="text-xl text-slate-400">/100</span></div>
            <div className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <span className="text-lg leading-none">↗</span> +5% vs last week
            </div>
          </div>
          
          <div className="flex-1 bg-[#d4ff00] rounded-3xl p-5 shadow-sm text-black">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs font-bold tracking-widest uppercase">Bio-Sync<br/>Match</h3>
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="text-4xl font-bold font-display mb-2">92%</div>
            <div className="text-black/70 text-xs font-bold flex items-center gap-1">
              <span className="text-lg leading-none">↗</span> +2% peak alignment
            </div>
          </div>
        </div>

        {/* Long-term Correlations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display">Long-term Correlations</h2>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last 30 Days</span>
          </div>

          <div className="space-y-4">
            {/* Correlation 1 */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white">Caffeine vs. Deep Sleep</h3>
                <span className="bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Critical</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Strong inverse correlation detected</p>
              
              <div className="flex items-end gap-2 h-24 mb-6">
                <div className="flex-1 bg-[#eaff70] rounded-t-sm h-[30%]" />
                <div className="flex-1 bg-[#eaff70] rounded-t-sm h-[45%]" />
                <div className="flex-1 bg-[#eaff70] rounded-t-sm h-[40%]" />
                <div className="flex-1 bg-[#d4ff00] rounded-t-sm h-[80%]" />
                <div className="flex-1 bg-[#d4ff00] rounded-t-sm h-[70%]" />
                <div className="flex-1 bg-[#d4ff00] rounded-t-sm h-[85%]" />
                <div className="flex-1 bg-[#eaff70] rounded-t-sm h-[25%]" />
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Intake after 2:00 PM reduces deep sleep recovery by <strong className="text-red-500">18%</strong>.
              </p>
            </div>

            {/* Correlation 2 */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white">Protein Intake vs. Energy</h3>
                <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Optimal</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Positive linear growth</p>
              
              <div className="flex items-end gap-2 h-24 mb-6">
                <div className="flex-1 bg-[#eaff70] rounded-t-sm h-[20%]" />
                <div className="flex-1 bg-[#eaff70] rounded-t-sm h-[25%]" />
                <div className="flex-1 bg-[#eaff70] rounded-t-sm h-[35%]" />
                <div className="flex-1 bg-[#d4ff00] rounded-t-sm h-[45%]" />
                <div className="flex-1 bg-[#d4ff00] rounded-t-sm h-[60%]" />
                <div className="flex-1 bg-[#d4ff00] rounded-t-sm h-[75%]" />
                <div className="flex-1 bg-[#d4ff00] rounded-t-sm h-[90%]" />
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Consistent protein loading correlates with <strong className="text-emerald-500">12% higher</strong> morning energy feel.
              </p>
            </div>
          </div>
        </section>

        {/* Performance Dictionary */}
        <section>
          <h2 className="text-xl font-bold font-display mb-4">Performance Dictionary</h2>
          
          <div className="space-y-4">
            <div className="bg-[#fcffdb] dark:bg-[#fcffdb]/10 rounded-3xl p-5 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#d4ff00] flex items-center justify-center shrink-0 text-black">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">L-Theanine</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pair with caffeine to eliminate jitters and enhance cognitive focus during high-intensity sessions.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-5 flex gap-4 border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Magnesium Glycinate</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  High bioavailability form for muscle relaxation and nervous system regulation post-workout.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
