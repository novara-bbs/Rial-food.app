import { useState } from 'react';
import { ChevronLeft, ChevronRight, Timer, Activity, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Planner() {
  const [meals, setMeals] = useState([
    {
      id: 1,
      day: 'Mon',
      date: '23',
      type: 'Dinner',
      title: 'Lemon Herb Salmon',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
      tag: 'LEFTOVER',
      tagColor: 'bg-emerald-500 text-zinc-950',
      typeColor: 'text-emerald-400',
      completed: false
    },
    {
      id: 2,
      day: 'Tue',
      date: '24',
      type: 'Lunch',
      title: 'Mediterranean Buddha Bowl',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
      tag: null,
      typeColor: 'text-blue-400',
      completed: true
    }
  ]);

  const toggleMeal = (id: number) => {
    setMeals(meals.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-md mx-auto space-y-8"
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RIAL <span className="text-emerald-400">PLANNER</span></h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Editorial Tech Edition</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-sm p-1.5 rounded-2xl border border-zinc-800/50 flex">
          <button className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">Individual</button>
          <button className="px-4 py-2 text-xs font-bold bg-zinc-800 rounded-xl text-emerald-400 shadow-md">Family</button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Current Schedule</p>
            <h2 className="text-2xl font-bold">Oct 23 – 29</h2>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"><ChevronLeft size={20}/></button>
            <button className="w-10 h-10 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-5 border border-zinc-800/50 shadow-lg flex items-center gap-4">
            <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-2xl">
              <Timer size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Time Saved</p>
              <p className="text-xl font-black">4.5 hrs</p>
            </div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-5 border border-zinc-800/50 shadow-lg flex items-center gap-4">
            <div className="bg-blue-500/20 text-blue-400 p-3 rounded-2xl">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Balance Score</p>
              <p className="text-xl font-black">92%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[27px] before:w-px before:bg-zinc-800">
        
        {meals.map((meal) => (
          <div key={meal.id} className="relative flex gap-4">
            <div className="w-14 shrink-0 flex flex-col items-center bg-zinc-950 py-2 z-10">
              <span className="text-[10px] font-bold uppercase text-zinc-500">{meal.day}</span>
              <span className="text-xl font-bold">{meal.date}</span>
            </div>
            <div 
              onClick={() => toggleMeal(meal.id)}
              className={`flex-1 rounded-3xl overflow-hidden border transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                meal.completed ? 'bg-zinc-900/30 border-emerald-500/30' : 'bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 hover:border-zinc-700/50'
              }`}
            >
              <div className="h-24 overflow-hidden relative">
                <img 
                  src={meal.image} 
                  alt="Meal" 
                  className={`w-full h-full object-cover transition-all ${meal.completed ? 'opacity-40 grayscale' : ''}`} 
                  referrerPolicy="no-referrer" 
                />
                {meal.tag && !meal.completed && (
                  <div className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-1 rounded ${meal.tagColor}`}>
                    {meal.tag}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {meal.completed ? (
                    <CheckCircle2 className="text-emerald-500 bg-zinc-950 rounded-full" size={24} />
                  ) : (
                    <Circle className="text-white/70 drop-shadow-md" size={24} />
                  )}
                </div>
              </div>
              <div className="p-3">
                <p className={`text-[9px] font-bold uppercase mb-1 ${meal.completed ? 'text-zinc-500' : meal.typeColor}`}>
                  {meal.type}
                </p>
                <h4 className={`font-bold text-sm leading-tight ${meal.completed ? 'text-zinc-500 line-through' : ''}`}>
                  {meal.title}
                </h4>
              </div>
            </div>
          </div>
        ))}

      </div>
    </motion.div>
  );
}
