import React from 'react';
import { ArrowLeft, MoreVertical, Edit2, ShieldCheck, Smartphone, Chrome, Watch, ChevronRight, Lock, Eye, Fingerprint, Trash2 } from 'lucide-react';

export function HumanEdgeProfileView() {
  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-[#f8f8f5] dark:bg-[#20230f]">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-[#f8f8f5]/80 dark:bg-[#20230f]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <div className="text-slate-900 dark:text-slate-100 flex w-10 h-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Human Edge Profile</h2>
          <div className="flex w-10 h-10 items-center justify-end">
            <button className="text-slate-900 dark:text-slate-100 hover:text-[#ddff00] transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        {/* Profile Overview Card */}
        <section className="flex flex-col items-center gap-6 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="relative">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 ring-4 ring-[#ddff00]/20" 
                 style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200")' }} />
            <div className="absolute bottom-1 right-1 bg-[#ddff00] text-slate-900 rounded-full p-1.5 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
              <Edit2 className="w-4 h-4 font-bold" />
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Alex Thorne</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Pro Tier Member • Bio-Sync Active</p>
          </div>
          <div className="flex w-full gap-3">
            <button className="flex-1 cursor-pointer items-center justify-center rounded-xl h-11 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
              Account Details
            </button>
            <button className="flex-1 cursor-pointer items-center justify-center rounded-xl h-11 px-4 bg-[#ddff00] text-[#20230f] text-sm font-bold transition-all hover:opacity-90">
              Share Bio-ID
            </button>
          </div>
        </section>

        {/* Bio-Metric Indicators */}
        <section className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-xl p-5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Bio-Age</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">28.4</span>
              <span className="text-red-500 text-sm font-bold">-0.2</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 rounded-xl p-5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Sync Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">94%</span>
              <span className="text-emerald-500 text-sm font-bold">+2%</span>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Subscription Plan</h3>
            <span className="px-2 py-1 bg-[#ddff00]/20 text-[#a3c400] text-[10px] font-black uppercase rounded tracking-wider">Active</span>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#ddff00]/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[#ddff00] font-bold text-xl">Human Edge Pro</p>
                <p className="text-slate-400 text-sm">Next billing cycle: Oct 12, 2024</p>
              </div>
              <ShieldCheck className="w-6 h-6 text-[#ddff00]" />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-2xl font-bold">$19.99<span className="text-slate-400 text-sm font-normal">/mo</span></p>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">Manage Plan</button>
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Privacy & Security</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 divide-y dark:divide-slate-800">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-900 dark:text-white">Anonymous Bio-Data Sharing</span>
              </div>
              <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white dark:bg-slate-400 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-900 dark:text-white">Public Profile Bio-Score</span>
              </div>
              <div className="w-8 h-4 bg-[#ddff00] rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-slate-900 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</span>
              </div>
              <span className="text-xs font-bold text-emerald-500">Enabled</span>
            </div>
            <div className="p-4">
              <button className="text-red-500 text-sm font-bold flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete All Bio-History
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
