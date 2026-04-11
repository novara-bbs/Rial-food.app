import { ArrowLeft, CalendarPlus, Clock, Utensils, PlayCircle, Archive, RefreshCw, Flame, TrendingUp, Timer, Zap, Calendar } from "lucide-react";

export function PlannerView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-16 max-w-3xl mx-auto">
          <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold tracking-tight font-display text-white">Meal Prep Schedule</h1>
          </div>
          <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
            <CalendarPlus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-8">
        {/* Hero Card */}
        <section>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-surface-dark border border-white/5 group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
            
            <div className="relative p-8">
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md text-primary px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-widest mb-4 border border-primary/30 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                <Zap className="w-3.5 h-3.5 fill-current" />
                UPCOMING SESSION
              </div>
              
              <h2 className="text-3xl font-bold text-white font-display mb-4 tracking-tight">
                Sunday Afternoon Batch
              </h2>
              
              <div className="flex items-center gap-6 mb-8 text-slate-300 text-sm font-medium">
                <div className="flex items-center gap-2 bg-surface-dark/50 px-3 py-1.5 rounded-lg border border-white/5">
                  <Clock className="w-4 h-4 text-primary" />
                  2.5 hours planned
                </div>
                <div className="flex items-center gap-2 bg-surface-dark/50 px-3 py-1.5 rounded-lg border border-white/5">
                  <Utensils className="w-4 h-4 text-primary" />
                  12 Meals Total
                </div>
              </div>
              
              <button className="w-full bg-primary text-background-dark font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_10px_30px_rgba(20,184,166,0.3)] border border-primary/50">
                <PlayCircle className="w-5 h-5" />
                Start Prep Session
              </button>
            </div>
          </div>
        </section>

        {/* Date Strip */}
        <section>
          <div className="flex justify-between items-end border-b border-white/5 pb-2">
            {[
              { day: 'MON', date: '14' },
              { day: 'TUE', date: '15' },
              { day: 'WED', date: '16' },
              { day: 'THU', date: '17', active: true },
              { day: 'FRI', date: '18' },
              { day: 'SAT', date: '19' },
              { day: 'SUN', date: '20' },
            ].map((d, i) => (
              <div key={i} className={`flex flex-col items-center pb-3 px-2 relative cursor-pointer transition-colors ${d.active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                <span className="text-[10px] font-mono font-bold tracking-widest mb-1">{d.day}</span>
                <span className={`text-xl font-display ${d.active ? 'font-bold' : 'font-medium'}`}>{d.date}</span>
                {d.active && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Daily Plan */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold font-display text-white">Thursday, Oct 17</h3>
            <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 tracking-widest uppercase">3 Meals Planned</span>
          </div>

          {/* Meal 1 */}
          <div className="bg-surface-dark rounded-3xl p-4 flex gap-5 border border-white/5 shadow-lg group hover:border-primary/30 transition-colors cursor-pointer">
            <img src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=200&auto=format&fit=crop" alt="Oats" className="w-24 h-24 rounded-2xl object-cover border border-white/10 group-hover:border-primary/50 transition-colors" />
            <div className="flex-1 py-1 flex flex-col justify-center">
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                Breakfast • 08:30 AM
              </p>
              <h4 className="font-bold text-lg text-white leading-tight mb-3 group-hover:text-primary transition-colors">Overnight Oats w/ Berries</h4>
              <div className="flex items-center gap-2 text-primary text-xs font-mono font-bold bg-primary/10 w-fit px-2.5 py-1 rounded-md border border-primary/20">
                <Archive className="w-3.5 h-3.5" />
                Prepped Session A
              </div>
            </div>
          </div>

          {/* Meal 2 */}
          <div className="bg-surface-dark rounded-3xl p-4 flex gap-5 border border-primary/30 shadow-[0_0_20px_rgba(20,184,166,0.05)] relative overflow-hidden group cursor-pointer">
            <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop" alt="Bowl" className="w-24 h-24 rounded-2xl object-cover ml-3 border border-primary/20" />
            <div className="flex-1 py-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary"></span>
                  Lunch • 12:45 PM
                </p>
                <span className="bg-primary/20 text-primary text-[9px] font-mono font-bold px-2 py-1 rounded-md uppercase tracking-widest border border-primary/30">Leftover Logic</span>
              </div>
              <h4 className="font-bold text-lg text-white leading-tight mb-1">Roasted Roots Harvest Bowl</h4>
              <p className="text-[10px] text-slate-400 font-mono mb-3">Base: Roasted Roots (Day 1 Batch)</p>
              <div className="flex items-center gap-2 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest bg-white/5 w-fit px-2.5 py-1 rounded-md border border-white/10">
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                Utilizing 1/3 of base
              </div>
            </div>
          </div>

          {/* Meal 3 */}
          <div className="bg-surface-dark rounded-3xl p-4 flex gap-5 border border-white/5 shadow-lg group hover:border-amber-500/30 transition-colors cursor-pointer">
            <img src="https://images.unsplash.com/photo-1432139555190-58524dae6a5a?q=80&w=200&auto=format&fit=crop" alt="Chicken" className="w-24 h-24 rounded-2xl object-cover border border-white/10 group-hover:border-amber-500/50 transition-colors" />
            <div className="flex-1 py-1 flex flex-col justify-center">
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                Dinner • 07:15 PM
              </p>
              <h4 className="font-bold text-lg text-white leading-tight mb-3 group-hover:text-amber-500 transition-colors">Lemon Asparagus Chicken</h4>
              <div className="flex items-center gap-2 text-amber-500 text-xs font-mono font-bold bg-amber-500/10 w-fit px-2.5 py-1 rounded-md border border-amber-500/20">
                <Flame className="w-3.5 h-3.5" />
                Fresh Prep (15m)
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-dark rounded-3xl p-6 border border-white/5 shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-12 h-12 text-primary" />
            </div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3 relative z-10">Weekly Efficiency</p>
            <div className="flex items-end gap-2 mb-2 relative z-10">
              <span className="text-4xl font-display font-bold text-white">84%</span>
            </div>
            <p className="text-xs text-slate-400 relative z-10">Prepped vs. Fresh meals</p>
          </div>
          <div className="bg-surface-dark rounded-3xl p-6 border border-white/5 shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Timer className="w-12 h-12 text-primary" />
            </div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3 relative z-10">Time Saved</p>
            <div className="flex items-end gap-2 mb-2 relative z-10">
              <span className="text-4xl font-display font-bold text-white">4.2h</span>
            </div>
            <p className="text-xs text-slate-400 relative z-10">Estimated this week</p>
          </div>
        </section>
      </main>
    </div>
  );
}
