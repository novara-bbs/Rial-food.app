import { Flame, Calendar, XCircle } from 'lucide-react';
import SectionCard from '@/components/SectionCard';

const EMOJI_MAP = ['😴', '😕', '😐', '😊', '💪'];

interface DayData {
  date: string;
  cal: number;
  pro: number;
  mealCount: number;
  rfLevel?: number;
}

interface ConsistencyCalendarProps {
  todayStreak: number;
  bestStreak: number;
  loggedDates: Set<string>;
  rfDates: Set<string>;
  selectedDay: string | null;
  onSelectDay: (day: string | null) => void;
  selectedDayData: DayData | null;
  onNavigateAddMeal: () => void;
  locale: string;
  now: Date;
  todayDate: string;
  dayHeaders: string[];
  t: {
    consistency?: string;
    currentStreak?: string;
    bestStreak?: string;
    mealDot?: string;
    rfDot?: string;
    mealCount?: string;
  };
}

export default function ConsistencyCalendar({
  todayStreak, bestStreak, loggedDates, rfDates, selectedDay, onSelectDay,
  selectedDayData, onNavigateAddMeal, locale, now, todayDate, dayHeaders, t,
}: ConsistencyCalendarProps) {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const localeStr = locale === 'en' ? 'en-US' : 'es-ES';

  return (
    <SectionCard
      padding="lg"
      spacing="lg"
      title={t.consistency || 'Consistencia'}
      icon={<Flame className="w-4 h-4 text-brand-secondary" />}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container rounded-sm p-4 text-center">
          <span className="font-headline font-black text-headline text-primary">{todayStreak}</span>
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block mt-1">
            {t.currentStreak || 'Racha actual'}
          </span>
        </div>
        <div className="bg-surface-container rounded-sm p-4 text-center">
          <span className="font-headline font-black text-headline text-on-surface-variant">{bestStreak}</span>
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block mt-1">
            {t.bestStreak || 'Mejor racha'}
          </span>
        </div>
      </div>

      {/* Monthly calendar with dot indicators */}
      <div className="pt-3 border-t border-outline-variant/10">
        <div className="flex items-center justify-between mb-3">
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {now.toLocaleDateString(localeStr, { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-micro text-on-surface-variant">{t.mealDot || 'Comida'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-tertiary" />
              <span className="text-micro text-on-surface-variant">{t.rfDot || 'Real Feel'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {dayHeaders.map(d => (
            <span key={d} className="text-center text-micro font-bold text-on-surface-variant uppercase">{d}</span>
          ))}
          {Array.from({ length: (firstDayOfMonth + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayDate;
            const isLogged = loggedDates.has(dateStr);
            const hasRF = rfDates.has(dateStr);
            const isFuture = day > now.getDate();
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  if (isFuture) return;
                  if (isLogged || hasRF) {
                    onSelectDay(selectedDay === dateStr ? null : dateStr);
                  } else {
                    onNavigateAddMeal();
                  }
                }}
                disabled={isFuture}
                className={`aspect-square rounded-sm relative flex flex-col items-center justify-center ${
                  isFuture
                    ? 'bg-surface-container/30 text-on-surface-variant/20'
                    : selectedDay === dateStr
                      ? 'bg-primary/15 text-primary ring-1 ring-primary'
                      : 'bg-surface-container-highest/40 text-on-surface-variant/60 hover:bg-surface-container-highest/60'
                } ${isToday && selectedDay !== dateStr ? 'ring-1 ring-primary ring-offset-1 ring-offset-surface-container-low' : ''}`}
              >
                <span className="text-micro font-bold leading-none">{day}</span>
                {!isFuture && (isLogged || hasRF) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {isLogged && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    {hasRF && <div className="w-1.5 h-1.5 rounded-full bg-tertiary" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Day-detail card */}
        {selectedDayData && (
          <div className="mt-3 p-3 bg-surface-container rounded-sm border border-primary/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-headline text-micro font-semibold uppercase tracking-widest text-tertiary">
                {new Date(selectedDayData.date + 'T12:00:00').toLocaleDateString(localeStr, { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <button type="button" onClick={() => onSelectDay(null)} className="text-on-surface-variant hover:text-primary">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="font-headline font-black text-body-lg text-primary">{selectedDayData.cal}</span>
                <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">kcal</span>
              </div>
              <div className="text-center">
                <span className="font-headline font-black text-body-lg text-tertiary">{selectedDayData.pro}g</span>
                <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">prot</span>
              </div>
              <div className="text-center">
                <span className="font-headline font-black text-body-lg text-on-surface-variant">{selectedDayData.mealCount}</span>
                <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">{t.mealCount || 'comidas'}</span>
              </div>
              {selectedDayData.rfLevel && (
                <div className="text-center">
                  <span className="text-lg">{EMOJI_MAP[(selectedDayData.rfLevel || 3) - 1] || '😐'}</span>
                  <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">RF</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
