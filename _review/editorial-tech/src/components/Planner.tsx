import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Flame, Droplets, Target, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext, LoggedFood } from '../context/AppContext';

export default function Planner() {
  const [activeDay, setActiveDay] = useState(2); // Wednesday
  const { dailyLog, updateFoodStatus, setActiveTab } = useAppContext();

  const days = [
    { day: 'MON', date: '12' },
    { day: 'TUE', date: '13' },
    { day: 'WED', date: '14' },
    { day: 'THU', date: '15' },
    { day: 'FRI', date: '16' },
    { day: 'SAT', date: '17' },
    { day: 'SUN', date: '18' },
  ];

  const getMealItems = (mealType: string) => dailyLog.filter(item => item.mealType === mealType);

  const calculateTotals = () => {
    return dailyLog.reduce((acc, item) => {
      acc.cals += item.cals;
      acc.p += item.macros.p;
      acc.c += item.macros.c;
      acc.f += item.macros.f;
      return acc;
    }, { cals: 0, p: 0, c: 0, f: 0 });
  };

  const totals = calculateTotals();
  const targetCals = 2450;

  return (
    <div className="max-w-md mx-auto w-full flex flex-col">
      <header className="p-4 text-center space-y-2 border-b border-[#ec5b13]/10 bg-[#1a0f0a] sticky top-0 z-40">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-[#ec5b13]">Nutrition Log</h2>
        <h3 className="text-3xl font-black italic uppercase leading-none text-slate-100">Daily Tracker</h3>
        
        {/* Calendar Carousel */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <button className="text-[#ec5b13] hover:bg-[#ec5b13]/10 p-2 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <p className="text-sm font-bold tracking-widest uppercase text-slate-300">Oct 14, 2026</p>
            <button className="text-[#ec5b13] hover:bg-[#ec5b13]/10 p-2 rounded-full"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="flex justify-between overflow-x-auto pb-2">
            {days.map((d, i) => (
              <motion.div 
                whileTap={{ scale: 0.9 }}
                key={i} 
                onClick={() => setActiveDay(i)}
                className={`flex flex-col items-center gap-2 min-w-[3rem] cursor-pointer transition-all ${activeDay === i ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
              >
                <span className={`text-[10px] font-bold uppercase ${activeDay === i ? 'text-[#ec5b13]' : 'text-slate-500'}`}>{d.day}</span>
                <motion.div 
                  layoutId="activeDayIndicator"
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${activeDay === i ? 'bg-[#ec5b13] text-white shadow-lg shadow-[#ec5b13]/30' : 'bg-slate-800/50 text-slate-300'}`}
                >
                  {d.date}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-8">
        {/* Macro Tracking Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-end mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Energy Balance</h4>
            <span className="text-[10px] font-mono text-[#ec5b13] bg-[#ec5b13]/10 px-2 py-1 rounded border border-[#ec5b13]/20">DEFICIT MODE</span>
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-[#ec5b13]/10 rounded-2xl p-4 border border-[#ec5b13]/30 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#ec5b13]/20 to-transparent opacity-50"></div>
              <Flame className="w-5 h-5 text-[#ec5b13] mb-1 relative z-10" />
              <span className="text-3xl font-black text-white relative z-10 tracking-tighter">{totals.cals}</span>
              <span className="text-[10px] text-[#ec5b13] font-bold uppercase tracking-widest relative z-10">Kcal Eaten</span>
            </div>
            <div className="flex-1 bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center">
              <Target className="w-5 h-5 text-slate-500 mb-1" />
              <span className="text-3xl font-black text-slate-300 tracking-tighter">{Math.max(0, targetCals - totals.cals)}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Remaining</span>
            </div>
          </div>

          <div className="space-y-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
            <MacroBar label="Protein" current={totals.p} target={180} color="bg-[#ec5b13]" />
            <MacroBar label="Carbs" current={totals.c} target={220} color="bg-blue-500" />
            <MacroBar label="Fat" current={totals.f} target={65} color="bg-amber-500" />
          </div>
        </motion.section>

        {/* Diary Sections */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-100 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-[#ec5b13]" /> Food Diary
            </h2>
          </div>

          <AnimatePresence mode="popLayout">
            {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => {
              const items = getMealItems(mealType);
              const sectionCals = items.reduce((sum, item) => sum + item.cals, 0);
              return (
                <DiarySection key={mealType} title={mealType} totalCals={sectionCals} onAddFood={() => setActiveTab('recipes')}>
                  {items.map(item => (
                    <DiaryItem 
                      key={item.id}
                      item={item}
                      onToggle={() => updateFoodStatus(item.id, item.status === 'logged' ? 'planned' : 'logged')}
                    />
                  ))}
                </DiarySection>
              );
            })}
          </AnimatePresence>
        </motion.section>

        {/* Water Tracker */}
        <motion.section 
          className="bg-[#1a0f0a] border border-blue-900/30 rounded-2xl p-5 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Droplets className="w-32 h-32 text-blue-500" />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-1">Hydration</h4>
              <p className="text-2xl font-black text-slate-100 tracking-tighter">2.5 <span className="text-sm font-medium text-slate-400">/ 3.5 L</span></p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function MacroBar({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
  const percentage = Math.min(100, (current / target) * 100);
  return (
    <div>
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200">{current} <span className="text-slate-600">/ {target}g</span></span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color} rounded-full`} 
        />
      </div>
    </div>
  );
}

function DiarySection({ title, totalCals, onAddFood, children }: { title: string, totalCals: number, onAddFood: () => void, children?: React.ReactNode }) {
  const hasChildren = React.Children.count(children) > 0;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-3"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h3>
        <span className="text-xs font-mono font-bold text-[#ec5b13]">{totalCals} kcal</span>
      </div>
      
      <div className="space-y-2">
        {hasChildren ? children : (
          <div className="p-4 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-xs font-medium uppercase tracking-widest">
            No entries yet
          </div>
        )}
      </div>
      
      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={onAddFood}
        className="w-full py-3 rounded-xl border border-slate-800 bg-slate-900/30 text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-slate-200 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Food
      </motion.button>
    </motion.div>
  );
}

function DiaryItem({ item, onToggle }: { item: LoggedFood, onToggle: () => void }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${item.status === 'logged' ? 'bg-slate-900/80 border-slate-800' : 'bg-[#ec5b13]/5 border-[#ec5b13]/30'}`}
    >
      <button onClick={onToggle} className="shrink-0 text-[#ec5b13]">
        {item.status === 'logged' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 opacity-50" />}
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-100 truncate">{item.name}</h4>
        <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-mono font-bold text-slate-200">{item.cals}</p>
        <p className="text-[9px] font-mono text-slate-500">{item.macros.p}P / {item.macros.c}C / {item.macros.f}F</p>
      </div>
    </motion.div>
  );
}
