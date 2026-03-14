import React from 'react';
import { ArrowLeft, Activity, Database, RefreshCw, FileText, Award, Brain } from 'lucide-react';

export function BiometricMatchView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#fdfbf7] dark:bg-[#1a1a1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fdfbf7]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <button className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-[#ff5a36]" />
        </button>
        <h1 className="text-lg font-bold font-display text-slate-900 dark:text-white">Biometric Match</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-[#ff5a36]" />
        </button>
      </header>

      <div className="px-4 mt-8 flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle 
              className="text-[#ff5a36]/10" 
              cx="128" cy="128" r="110" 
              fill="transparent" stroke="currentColor" strokeWidth="16" 
            />
            <circle 
              className="text-[#ff5a36] transition-all duration-1000 ease-out" 
              cx="128" cy="128" r="110" 
              fill="transparent" stroke="currentColor" strokeWidth="16" 
              strokeDasharray="691" strokeDashoffset="241" 
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-center z-10">
            <span className="text-6xl font-bold font-display text-[#ff5a36]">65%</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Synergy</p>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-4 right-0 bg-[#fff5f2] dark:bg-[#ff5a36]/10 border border-[#ff5a36]/20 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-[#ff5a36]/20 flex items-center justify-center text-[#ff5a36]">
              <Zap className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Energy +12%</span>
          </div>
          
          <div className="absolute bottom-4 left-0 bg-[#fff5f2] dark:bg-[#ff5a36]/10 border border-[#ff5a36]/20 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-[#ff5a36]/20 flex items-center justify-center text-[#ff5a36]">
              <Activity className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Vitals Stable</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mt-12 mb-8">
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-3">Comparing to your Real Feel...</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            Analyzing 12 data points from your last 48 hours of nutritional logs and biometric feedback.
          </p>
        </div>

        {/* Steps */}
        <div className="w-full space-y-4">
          {/* Step 1 */}
          <div className="bg-[#fff5f2] dark:bg-[#ff5a36]/5 rounded-2xl p-4 border border-[#ff5a36]/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-[#ff5a36]" />
                <span className="font-bold text-slate-900 dark:text-white">Extracting Recipe DNA</span>
              </div>
              <span className="text-xs font-bold text-[#ff5a36] uppercase tracking-wider">Complete</span>
            </div>
            <div className="h-1.5 w-full bg-[#ff5a36]/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#ff5a36] w-full" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#fff5f2] dark:bg-[#ff5a36]/5 rounded-2xl p-4 border border-[#ff5a36]/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-[#ff5a36] animate-spin-slow" />
                <span className="font-bold text-slate-900 dark:text-white">Calculating Synergy</span>
              </div>
              <span className="text-xs font-bold text-slate-500">65%</span>
            </div>
            <div className="h-1.5 w-full bg-[#ff5a36]/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#ff5a36] w-[65%] transition-all duration-1000" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ff5a36]/10 flex items-center justify-center text-[#ff5a36]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Digestive Compatibility</p>
                <p className="text-xs text-slate-500 mt-0.5">Low inflammation risk</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ff5a36]/10 flex items-center justify-center text-[#ff5a36]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Macro Alignment</p>
                <p className="text-xs text-slate-500 mt-0.5">Matching protein goals</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#ff5a36] flex items-center justify-center text-white">
              <span className="text-xs font-bold tracking-widest leading-none mb-1">...</span>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ff5a36]/10 flex items-center justify-center text-[#ff5a36]">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Cognitive Impact</p>
                <p className="text-xs text-slate-500 mt-0.5">Glucose stability forecast</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import Zap for the floating badge
import { Zap } from 'lucide-react';
