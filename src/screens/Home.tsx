import { Activity, Zap, Shield, Flame, Clock, Plus, ChevronRight, Sparkles, CheckCircle2, Calendar, Droplets, Coffee, Sun, Moon, Footprints, Target, HelpCircle, Timer, Scale, Dumbbell, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import RealFeelInline from '../components/RealFeelInline';
import { useI18n } from '../i18n';
import { calculateStreak } from '../utils/gamification';
import { getInsights } from '../utils/correlations';

export default function Home({
  onCheckIn,
  onAddMeal,
  onNavigateToPlan,
  onNavigateToExplore,
  checkInStatus,
  dailyMacros,
  userProfile,
  mealPlan,
  onNavigateToRecipe,
  onLogMealNow,
  hydration,
  setHydration,
  movement,
  setMovement,
  dailyGoal,
  setDailyGoal,
  realFeelLogs,
  onRealFeelLog
}: {
  onCheckIn: (status?: string) => void,
  onAddMeal: () => void,
  onNavigateToPlan: () => void,
  onNavigateToExplore: () => void,
  checkInStatus: any,
  dailyMacros: any,
  userProfile: any,
  mealPlan?: any,
  onNavigateToRecipe?: (recipe: any) => void,
  onLogMealNow?: (recipe: any, servings: number) => void,
  hydration: { consumed: number, target: number },
  setHydration: (h: any) => void,
  movement: { steps: number, target: number, activeMinutes: number, activeTarget: number },
  setMovement?: (m: any) => void,
  dailyGoal: string,
  setDailyGoal?: (g: string) => void,
  realFeelLogs?: any[],
  onRealFeelLog?: (entry: any) => void
}) {
  const { t } = useI18n();
  const [greeting, setGreeting] = useState(t.home.goodMorning);
  const [timeIcon, setTimeIcon] = useState(<Sun className="w-6 h-6 text-amber-400" />);
  const [isEditingHydration, setIsEditingHydration] = useState(false);
  const [isFasting, setIsFasting] = useState(true);
  const [isEditingMovement, setIsEditingMovement] = useState(false);
  const [isEditingDailyGoal, setIsEditingDailyGoal] = useState(false);
  const [dailyTip, setDailyTip] = useState('');
  const [showRealFeel, setShowRealFeel] = useState(false);
  const [isTrainingDay, setIsTrainingDay] = useState(false);
  const lastCalRef = useRef(dailyMacros.consumed.cal);

  // Calculate real streak from Real Feel logs
  const streakDays = calculateStreak((realFeelLogs || []).map((l: any) => l.date).filter(Boolean));

  // Trigger Real Feel 3 seconds after a meal is logged (calories increase)
  useEffect(() => {
    if (dailyMacros.consumed.cal > lastCalRef.current) {
      lastCalRef.current = dailyMacros.consumed.cal;
      const timer = setTimeout(() => setShowRealFeel(true), 3000);
      return () => clearTimeout(timer);
    }
    lastCalRef.current = dailyMacros.consumed.cal;
  }, [dailyMacros.consumed.cal]);
  
  const tips = [
    "Añadir cerezas ácidas a tu rutina nocturna puede mejorar la calidad del sueño.",
    "Beber un vaso de agua antes de cada comida ayuda a la digestión y la saciedad.",
    "Un paseo de 15 minutos después de comer puede reducir los picos de azúcar en sangre.",
    "Prioriza la proteína en el desayuno para mantener la energía durante el día.",
    "Dormir 7-8 horas es crucial para la recuperación muscular y la pérdida de grasa."
  ];

  // Calculate energy score based on macros and hydration
  const energyScore = Math.min(100, Math.round(
    ((dailyMacros.consumed.cal / dailyMacros.target.cal) * 40) + 
    ((hydration.consumed / hydration.target) * 30) +
    ((movement.steps / movement.target) * 30)
  ));
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) {
      setGreeting(t.home.goodAfternoon);
      setTimeIcon(<Sun className="w-6 h-6 text-amber-500" />);
    } else if (hour >= 17) {
      setGreeting(t.home.goodEvening);
      setTimeIcon(<Moon className="w-6 h-6 text-indigo-400" />);
    } else {
      setGreeting(t.home.goodMorning);
    }
    setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
  }, [t]);

  // Find next meal from plan
  const today = new Date().getDay();
  const adjustedDayIndex = today === 0 ? 6 : today - 1;
  const todaysMeals = mealPlan?.[adjustedDayIndex] || [];
  const nextMeal = todaysMeals.find((m: any) => {
    const [h, min] = m.time.split(':');
    const mealTime = new Date();
    mealTime.setHours(parseInt(h), parseInt(min));
    return mealTime > new Date();
  }) || todaysMeals[0];

  const macroProgress = {
    cal: Math.round((dailyMacros.consumed.cal / dailyMacros.target.cal) * 100),
    pro: Math.round((dailyMacros.consumed.pro / dailyMacros.target.pro) * 100),
    carbs: Math.round((dailyMacros.consumed.carbs / dailyMacros.target.carbs) * 100),
    fats: Math.round((dailyMacros.consumed.fats / dailyMacros.target.fats) * 100),
  };

  const handleAddWater = () => {
    setHydration((prev: any) => ({ ...prev, consumed: Math.min(prev.consumed + 1, prev.target + 5) }));
  };

  const isSimpleMode = userProfile?.mode === 'simple' || !userProfile?.mode;

  return (
    <div className="px-6 max-w-5xl mx-auto space-y-8 pb-32">
      {/* Welcome & Energy Score */}
      <section className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {timeIcon}
            <h1 className="font-headline text-3xl font-black text-tertiary uppercase tracking-tight leading-none">
              {greeting}, {userProfile.name?.split(' ')[0] || 'Amigo'}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full border border-orange-500/20 shadow-sm">
            <Flame className="w-4 h-4" />
            <span className="font-bold text-[10px] uppercase tracking-widest">{t.home.streak}: {streakDays} {t.home.days}</span>
          </div>
        </div>
        <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
          {t.onboarding.subtitle}
        </p>
      </section>

      {/* Daily Status Card */}
      {!isSimpleMode && (
        <section className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-on-primary text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{t.home.dailyProgress}</span>
              <span className="font-headline font-bold text-lg text-tertiary uppercase">
                {energyScore >= 80 ? t.home.onTrack : energyScore >= 50 ? t.home.inProgress : t.home.needsAttention}
              </span>
            </div>
            <p className="text-sm font-body text-on-surface-variant leading-relaxed max-w-md">
              {energyScore >= 80 
                ? 'Estás en buen estado hoy. Tus niveles de energía son estables. ¿Qué te parece una comida nutritiva para seguir adelante?' 
                : 'Aún tienes margen de mejora hoy. Intenta beber más agua o dar un pequeño paseo para aumentar tu energía.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" fill="transparent" stroke="var(--surface-container-highest)" strokeWidth="6" />
                <circle cx="40" cy="40" r="36" fill="transparent" stroke="var(--primary)" strokeWidth="6" strokeDasharray="226.2" strokeDashoffset={226.2 * (1 - (energyScore / 100))} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-headline font-black text-2xl text-tertiary">{energyScore}</span>
                <span className="text-xs font-bold uppercase tracking-tighter text-on-surface-variant">Puntos</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions & Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onAddMeal}
            className="bg-primary text-on-primary p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 group"
          >
            <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-headline font-bold text-xs uppercase tracking-widest">{t.fab.logMeal}</span>
          </button>
          <button
            onClick={() => onCheckIn()}
            className={`p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group border ${
              checkInStatus 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-surface-container-low border-outline-variant/20 hover:border-primary text-tertiary'
            }`}
          >
            <CheckCircle2 className={`w-6 h-6 ${checkInStatus ? 'text-primary' : 'text-primary'} group-hover:scale-110 transition-transform`} />
            <span className="font-headline font-bold text-xs uppercase tracking-widest">
              {checkInStatus ? t.home.registered : 'Check-in'}
            </span>
          </button>
        </div>

        {/* Hydration */}
        <div className="bg-surface-container-low border border-outline-variant/20 p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                <Droplets className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{t.home.water}</p>
                  <button 
                    onClick={() => setIsEditingHydration(!isEditingHydration)} 
                    className="text-[10px] text-secondary hover:underline font-bold uppercase tracking-widest"
                  >
                    {isEditingHydration ? 'Cerrar' : 'Editar'}
                  </button>
                </div>
                <p className="font-headline font-bold text-lg text-tertiary uppercase">{hydration.consumed} / {hydration.target} {t.home.cups}</p>
              </div>
            </div>
            <button 
              onClick={handleAddWater}
              className="w-10 h-10 bg-secondary text-on-secondary rounded-full flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-secondary/20 shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {isEditingHydration && (
            <div className="pt-4 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.home.dailyTarget} ({t.home.cups})</span>
                <span className="font-headline font-bold text-sm text-secondary">{hydration.target}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={hydration.target} 
                onChange={(e) => setHydration({ ...hydration, target: parseInt(e.target.value) })}
                className="w-full accent-secondary"
              />
            </div>
          )}
        </div>

        {/* Fasting */}
        <div className="bg-surface-container-low border border-outline-variant/20 p-5 rounded-2xl flex flex-col gap-4 justify-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center shrink-0">
                <Timer className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{t.fasting.title}</p>
                <p className="font-headline font-bold text-lg text-tertiary uppercase">
                  {isFasting ? '14h 20m' : 'Ventana Abierta'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsFasting(!isFasting)} 
              className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${isFasting ? 'bg-surface-container-highest text-tertiary hover:bg-surface-container-high' : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'}`}
            >
              {isFasting ? 'Terminar' : 'Iniciar'}
            </button>
          </div>
          {isFasting && (
            <div className="space-y-1.5 mt-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span>Progreso (Meta: 16h)</span>
                <span>89%</span>
              </div>
              <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="bg-surface-container-low border border-outline-variant/20 p-5 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{t.profile.bodyData}</p>
              <p className="font-headline font-bold text-lg text-tertiary uppercase">{userProfile.weight || 78} kg</p>
            </div>
          </div>
          <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline bg-emerald-500/10 px-3 py-1.5 rounded-full">
            Registrar
          </button>
        </div>
      </div>

      {/* Real Feel Inline Check-in */}
      {showRealFeel && onRealFeelLog && (
        <section>
          <RealFeelInline
            onSubmit={(entry) => {
              onRealFeelLog(entry);
              setShowRealFeel(false);
            }}
            onDismiss={() => setShowRealFeel(false)}
          />
        </section>
      )}

      {/* Dashboard Widgets Row */}
      {(() => {
        const logs = realFeelLogs || [];
        const recent7 = logs.slice(0, 7);
        const avgVitality = recent7.length > 0
          ? Math.round((recent7.reduce((s: number, l: any) => s + (l.level || 3), 0) / recent7.length) * 20)
          : 0;
        const prev7 = logs.slice(7, 14);
        const prevAvg = prev7.length > 0
          ? Math.round((prev7.reduce((s: number, l: any) => s + (l.level || 3), 0) / prev7.length) * 20)
          : 0;
        const vitalityTrend = recent7.length > 0 && prev7.length > 0
          ? avgVitality > prevAvg + 5 ? 'up' : avgVitality < prevAvg - 5 ? 'down' : 'flat'
          : 'flat';

        const planValues: any[] = mealPlan ? Object.values(mealPlan) : [];
        const totalPlannedWeek: number = planValues.reduce((sum: number, meals: any) => sum + (Array.isArray(meals) ? meals.length : 0), 0);
        const daysWithLogs = new Set(logs.map((l: any) => l.date ? new Date(l.date).toDateString() : null).filter(Boolean)).size;

        return (
          <section className="grid grid-cols-3 gap-3">
            {/* Real Score */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex flex-col gap-1">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Real Score</span>
              <div className="flex items-center gap-1">
                <span className="font-headline font-black text-xl text-primary">{avgVitality}</span>
                {vitalityTrend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
                {vitalityTrend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-error" />}
              </div>
              <span className="text-[9px] text-on-surface-variant">{recent7.length} registros</span>
            </div>
            {/* Plan */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex flex-col gap-1">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Plan</span>
              <span className="font-headline font-black text-xl text-secondary">{todaysMeals.length}</span>
              <span className="text-[9px] text-on-surface-variant">hoy • {totalPlannedWeek} sem</span>
            </div>
            {/* Consistency */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex flex-col gap-1">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Registros</span>
              <span className="font-headline font-black text-xl text-tertiary">{daysWithLogs}</span>
              <span className="text-[9px] text-on-surface-variant">días con datos</span>
            </div>
          </section>
        );
      })()}

      {/* Planificado Hoy — all planned meals with 1-tap log */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> {t.home.plannedToday}
          </h2>
          <button onClick={onNavigateToPlan} className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">{t.plan.title}</button>
        </div>

        {todaysMeals.length > 0 ? (
          <div className="space-y-2">
            {todaysMeals.map((meal: any, idx: number) => (
              <div key={meal.id || idx} className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-2xl flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest overflow-hidden shrink-0">
                  <img src={meal.img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80"} alt={meal.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">{meal.type || meal.time}</span>
                  </div>
                  <h3 className="font-headline text-sm font-bold text-tertiary uppercase truncate mt-0.5">{meal.title}</h3>
                  <span className="text-[10px] text-on-surface-variant font-mono">{meal.cal} {t.common.kcal}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onLogMealNow && onLogMealNow(meal, 1); }}
                  className="shrink-0 px-4 py-2 bg-primary text-on-primary rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  {t.home.logIt}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low border border-dashed border-outline-variant/40 p-10 rounded-2xl text-center">
            <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest">{t.empty.planEmpty}</p>
            <button onClick={onNavigateToPlan} className="mt-4 text-primary font-bold uppercase text-xs tracking-widest hover:underline">{t.plan.title}</button>
          </div>
        )}
      </section>

      {/* Training Day Toggle */}
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-5 h-5 text-primary" />
          <span className="font-headline text-sm font-bold uppercase text-tertiary tracking-wider">
            {isTrainingDay ? t.home.trainingDay : t.home.restDay}
          </span>
        </div>
        <button
          onClick={() => setIsTrainingDay(!isTrainingDay)}
          className={`relative w-14 h-7 rounded-full transition-colors ${isTrainingDay ? 'bg-primary' : 'bg-surface-container-highest'}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-on-primary shadow transition-transform ${isTrainingDay ? 'translate-x-7' : 'translate-x-0.5'}`} />
        </button>
      </section>

      {/* Activity & Goal */}
      {!isSimpleMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Movement */}
          <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Footprints className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-bold text-sm uppercase text-tertiary tracking-widest">{t.home.steps}</h3>
              </div>
              <button 
                onClick={() => setIsEditingMovement(!isEditingMovement)} 
                className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest"
              >
                {isEditingMovement ? 'Cerrar' : 'Editar'}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{movement.steps} / {movement.target} Pasos</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min((movement.steps / movement.target) * 100, 100)}%` }}></div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold text-tertiary">{movement.activeMinutes}m Activo</span>
              </div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Objetivo: {movement.activeTarget}m</span>
            </div>

            {isEditingMovement && (
              <div className="pt-4 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Añadir Pasos</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setMovement && setMovement({ ...movement, steps: movement.steps + 500 })} className="flex-1 bg-surface-container-highest py-1 rounded text-xs font-bold text-tertiary">+500</button>
                    <button onClick={() => setMovement && setMovement({ ...movement, steps: movement.steps + 1000 })} className="flex-1 bg-surface-container-highest py-1 rounded text-xs font-bold text-tertiary">+1000</button>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Añadir Minutos Activos</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setMovement && setMovement({ ...movement, activeMinutes: movement.activeMinutes + 10 })} className="flex-1 bg-surface-container-highest py-1 rounded text-xs font-bold text-tertiary">+10m</button>
                    <button onClick={() => setMovement && setMovement({ ...movement, activeMinutes: movement.activeMinutes + 30 })} className="flex-1 bg-surface-container-highest py-1 rounded text-xs font-bold text-tertiary">+30m</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Daily Goal */}
          <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{t.home.todayFocus}</p>
                  <p className="font-headline font-bold text-sm text-tertiary uppercase leading-tight mt-1">{dailyGoal}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditingDailyGoal(!isEditingDailyGoal)} 
                className="text-[10px] text-secondary hover:underline font-bold uppercase tracking-widest"
              >
                {isEditingDailyGoal ? 'Cerrar' : 'Editar'}
              </button>
            </div>

            {isEditingDailyGoal && (
              <div className="pt-4 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Actualizar Enfoque</span>
                <input 
                  type="text" 
                  value={dailyGoal} 
                  onChange={(e) => setDailyGoal && setDailyGoal(e.target.value)}
                  placeholder="Ej. Beber 2L de agua"
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg py-2 px-3 text-sm text-tertiary placeholder:text-on-surface-variant focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nutrition Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> {t.home.weekSummary}
            <span title="Los macronutrientes (proteínas, carbohidratos, grasas) son la base de tu energía diaria.">
              <HelpCircle className="w-4 h-4 text-on-surface-variant cursor-help" />
            </span>
          </h2>
        </div>

        {/* Calorie Math Breakdown */}
        <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
          <div className="text-center flex-1">
            <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t.home.target}</span>
            <span className="font-headline font-bold text-tertiary">{dailyMacros.target.cal}</span>
          </div>
          <span className="text-on-surface-variant font-bold text-lg">-</span>
          <div className="text-center flex-1">
            <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t.home.food}</span>
            <span className="font-headline font-bold text-tertiary">{dailyMacros.consumed.cal}</span>
          </div>
          <span className="text-on-surface-variant font-bold text-lg">+</span>
          <div className="text-center flex-1">
            <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t.home.exercise}</span>
            <span className="font-headline font-bold text-secondary">320</span>
          </div>
          <span className="text-on-surface-variant font-bold text-lg">=</span>
          <div className="text-center flex-1">
            <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t.home.remaining}</span>
            <span className="font-headline font-bold text-primary text-xl">{dailyMacros.target.cal - dailyMacros.consumed.cal + 320}</span>
          </div>
        </div>
        
        {isSimpleMode ? (
          <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-2xl space-y-6">
            {[
              { label: t.home.kcal, consumed: dailyMacros.consumed.cal, target: dailyMacros.target.cal, unit: 'kcal', val: macroProgress.cal, color: 'bg-primary' },
              { label: t.home.protein, consumed: dailyMacros.consumed.pro, target: dailyMacros.target.pro, unit: 'g', val: macroProgress.pro, color: 'bg-secondary' },
              { label: t.home.carbs, consumed: dailyMacros.consumed.carbs, target: dailyMacros.target.carbs, unit: 'g', val: macroProgress.carbs, color: 'bg-tertiary' },
              { label: t.home.fats, consumed: dailyMacros.consumed.fats, target: dailyMacros.target.fats, unit: 'g', val: macroProgress.fats, color: 'bg-error' },
            ].map((m) => (
              <div key={m.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{m.consumed} / {m.target}{m.unit}</span>
                    <span className="font-headline font-bold text-sm text-tertiary w-10 text-right">{m.val}%</span>
                  </div>
                </div>
                <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(m.val, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: t.home.kcal, consumed: dailyMacros.consumed.cal, target: dailyMacros.target.cal, unit: 'kcal', val: macroProgress.cal, color: 'text-primary', bg: 'bg-primary/10' },
              { label: t.home.protein, consumed: dailyMacros.consumed.pro, target: dailyMacros.target.pro, unit: 'g', val: macroProgress.pro, color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: t.home.carbs, consumed: dailyMacros.consumed.carbs, target: dailyMacros.target.carbs, unit: 'g', val: macroProgress.carbs, color: 'text-tertiary', bg: 'bg-tertiary/10' },
              { label: t.home.fats, consumed: dailyMacros.consumed.fats, target: dailyMacros.target.fats, unit: 'g', val: macroProgress.fats, color: 'text-error', bg: 'bg-error/10' },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 ${m.bg} rounded-full flex items-center justify-center relative`}>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="var(--surface-container-highest)" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset={175.9 * (1 - Math.min(m.val, 100) / 100)} strokeLinecap="round" className={m.color} />
                  </svg>
                  <span className={`absolute text-xs font-black ${m.color}`}>{m.val}%</span>
                </div>
                <div className="text-center mt-1">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block">{m.label}</span>
                  <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">{m.consumed} / {m.target}{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Smart Insights */}
      {(() => {
        const insights = getInsights({
          realFeelLogs: realFeelLogs || [],
          savedRecipes: [],
          mealPlan: mealPlan || {},
          dailyMacros,
          hydration,
          streakDays,
        });
        if (!insights.length) return null;
        return (
          <section className="space-y-3">
            <h2 className="font-headline text-sm font-bold tracking-widest uppercase text-tertiary flex items-center gap-2 px-1">
              <Sparkles className="w-4 h-4 text-primary" /> Insights
            </h2>
            {insights.slice(0, 3).map(ins => (
              <div key={ins.id} className={`p-4 rounded-2xl border flex items-start gap-3 ${
                ins.tone === 'warning' ? 'bg-red-500/5 border-red-500/20' :
                ins.tone === 'positive' ? 'bg-green-500/5 border-green-500/20' :
                'bg-surface-container-low border-outline-variant/20'
              }`}>
                <span className="text-xl shrink-0">{ins.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary">{ins.title}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{ins.detail}</p>
                </div>
              </div>
            ))}
          </section>
        );
      })()}

      {/* Daily Tip */}
      <section
        onClick={onNavigateToExplore}
        className="bg-primary text-on-primary p-6 rounded-2xl flex items-center gap-6 cursor-pointer hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
      >
        <div className="w-14 h-14 bg-on-primary/10 rounded-full flex items-center justify-center shrink-0">
          <Sparkles className="w-7 h-7 text-on-primary" />
        </div>
        <div>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-primary opacity-80 font-bold">{t.home.dailyTip}</p>
          <p className="font-headline font-bold text-xl uppercase leading-snug mt-1 text-on-primary">
            {dailyTip}
          </p>
        </div>
      </section>
    </div>
  );
}
