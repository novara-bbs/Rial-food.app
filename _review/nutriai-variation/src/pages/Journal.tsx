import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'motion/react';
import { Plus, Flame } from 'lucide-react';

export default function Journal() {
  const caloriesConsumed = 1070;
  const calorieGoal = 2500;
  const caloriesLeft = calorieGoal - caloriesConsumed;
  const percentage = (caloriesConsumed / calorieGoal) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-md mx-auto space-y-8 pb-24"
    >
      <header className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Today</p>
          <h1 className="text-3xl font-bold">Daily Log</h1>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
            <Flame size={20} />
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-300 font-bold">JD</span>
          </div>
        </div>
      </header>

      <section className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-6 border border-zinc-800/50 shadow-lg flex items-center gap-6">
        <div className="w-32 h-32 shrink-0 relative">
          <CircularProgressbar 
            value={percentage} 
            strokeWidth={8}
            styles={buildStyles({
              pathColor: '#34d399', // emerald-400
              trailColor: '#27272a', // zinc-800
              strokeLinecap: 'round',
            })}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{caloriesLeft}</span>
            <span className="text-[10px] uppercase font-bold text-zinc-500">kcal left</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 flex-1">
          <MacroBar label="Protein" current={65} target={150} color="bg-emerald-400" />
          <MacroBar label="Carbs" current={110} target={250} color="bg-blue-400" />
          <MacroBar label="Fats" current={42} target={70} color="bg-amber-400" />
        </div>
      </section>

      <div className="space-y-6">
        <MealSection 
          title="Breakfast" 
          totalCals={420} 
          items={[
            { name: "Poached Eggs & Sourdough", cals: 420, macros: "22g P • 35g C • 18g F" }
          ]} 
        />
        
        <MealSection 
          title="Lunch" 
          totalCals={650} 
          items={[
            { name: "Mediterranean Bowl", cals: 650, macros: "43g P • 75g C • 24g F" }
          ]} 
        />

        <MealSection 
          title="Dinner" 
          totalCals={0} 
          items={[]} 
        />

        <MealSection 
          title="Snacks" 
          totalCals={0} 
          items={[]} 
        />
      </div>
    </motion.div>
  );
}

function MealSection({ title, totalCals, items }: { title: string, totalCals: number, items: any[] }) {
  return (
    <section className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-6 border border-zinc-800/50 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="text-sm font-bold text-zinc-400">{totalCals} kcal</span>
      </div>
      
      {items.length > 0 ? (
        <div className="space-y-3 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 transition-colors hover:bg-zinc-900/50">
              <div>
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-[10px] text-zinc-500 font-bold mt-1 tracking-wide">{item.macros}</p>
              </div>
              <span className="text-sm font-black text-emerald-400">{item.cals}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-600 italic mb-4">No food logged yet.</p>
      )}

      <button className="w-full py-4 rounded-2xl border border-dashed border-zinc-700 text-zinc-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white transition-all active:scale-[0.98]">
        <Plus size={18} strokeWidth={2.5} /> Add Food
      </button>
    </section>
  );
}

function MacroBar({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
  const percent = Math.min(100, (current / target) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300">{current}g / {target}g</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
