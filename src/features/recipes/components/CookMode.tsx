import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, UtensilsCrossed, Clock } from 'lucide-react';
import { useI18n } from '../../../i18n';
import CookTimer from './CookTimer';

interface NormalizedStep {
  text: string;
  photoUrl?: string;
  detectedMinutes?: number;
}

const TIME_REGEX = /(\d+(?:\.\d+)?)\s*(minutos?|minutes?|mins?|segundos?|seconds?|secs?|horas?|hours?|hrs?)/gi;

function detectTimerMinutes(text: string): number | undefined {
  TIME_REGEX.lastIndex = 0;
  const match = TIME_REGEX.exec(text);
  if (!match) return undefined;
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('seg') || unit.startsWith('sec')) return value / 60;
  if (unit.startsWith('hor') || unit.startsWith('hr')) return value * 60;
  return value; // minutes
}

export default function CookMode({
  steps,
  title,
  ingredients = [],
  onClose,
}: {
  steps: string[] | { text: string; photoUrl?: string; timerMinutes?: number }[];
  title: string;
  ingredients?: { name: string; amount: number; unit: string }[];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [activeTimers, setActiveTimers] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number>(0);

  const normalized: NormalizedStep[] = steps.map(s =>
    typeof s === 'string'
      ? { text: s, detectedMinutes: detectTimerMinutes(s) }
      : { text: s.text, photoUrl: s.photoUrl, detectedMinutes: s.timerMinutes ?? detectTimerMinutes(s.text) },
  );

  const step = normalized[current];
  const total = normalized.length;

  // WakeLock — keep screen on while cooking
  useEffect(() => {
    let lock: any = null;
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').then((l: any) => { lock = l; }).catch(() => {});
    }
    return () => { lock?.release?.(); };
  }, []);

  const goNext = useCallback(() => setCurrent(c => Math.min(c + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) dx > 0 ? goNext() : goPrev();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col text-on-overlay select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-overlay-border">
        <div>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-overlay/40 block truncate max-w-[200px]">{title}</span>
          <p className="font-headline text-sm font-bold text-on-overlay/70">
            {t.recipeDetail.cookModeStep
              .replace('{current}', String(current + 1))
              .replace('{total}', String(total))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {ingredients.length > 0 && (
            <button type="button"
              onClick={() => setShowIngredients(s => !s)}
              className="p-2 rounded-full bg-on-overlay/10 hover:bg-on-overlay/20 transition-colors"
              aria-label={t.recipeDetail.viewIngredients}
            >
              <UtensilsCrossed className="w-4 h-4" />
            </button>
          )}
          <button type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-on-overlay/10 hover:bg-on-overlay/20 transition-colors"
            aria-label={t.recipeDetail.exitCookMode}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step indicator dots */}
      <div className="flex gap-1.5 justify-center py-4">
        {normalized.map((_, i) => (
          <button type="button"
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-200 ${i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-on-overlay/20 hover:bg-on-overlay/40'}`}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6 overflow-y-auto">
        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
          <span className="font-headline font-bold text-primary text-lg">{current + 1}</span>
        </div>

        {step.photoUrl && (
          <img src={step.photoUrl} alt={`Step ${current + 1}`} className="w-full max-w-sm rounded-sm object-cover max-h-48" />
        )}

        <p className="text-xl md:text-2xl font-body leading-relaxed text-on-overlay max-w-lg">{step.text}</p>

        {step.detectedMinutes && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 text-primary/70 text-xs font-label uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              {step.detectedMinutes < 1
                ? `${Math.round(step.detectedMinutes * 60)}s`
                : `${step.detectedMinutes} min`}
            </div>
            {activeTimers[current] ? (
              <CookTimer
                minutes={step.detectedMinutes}
                onDone={() => setActiveTimers(prev => ({ ...prev, [current]: false }))}
              />
            ) : (
              <button type="button"
                onClick={() => setActiveTimers(prev => ({ ...prev, [current]: true }))}
                className="px-5 py-2 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                {t.recipeDetail.startTimer}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 pb-8 pt-4 border-t border-overlay-border">
        <button type="button"
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-1 px-5 py-3 bg-on-overlay/10 rounded-sm text-on-overlay font-headline text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-on-overlay/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.common.back}
        </button>

        <span className="text-on-overlay/50 font-mono text-sm">{current + 1}/{total}</span>

        {current < total - 1 ? (
          <button type="button"
            onClick={goNext}
            className="flex items-center gap-1 px-5 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors"
          >
            {t.common.next}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-5 py-3 bg-green-600 text-white rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors"
          >
            {t.recipeDetail.exitCookMode}
          </button>
        )}
      </div>

      {/* Ingredients overlay */}
      {showIngredients && (
        <div
          className="absolute inset-0 bg-neutral-950/95 z-10 flex flex-col pt-16 px-6 pb-8"
          onClick={() => setShowIngredients(false)}
        >
          <h3 className="font-headline font-bold text-lg uppercase text-on-overlay mb-4">{t.recipeDetail.viewIngredients}</h3>
          <div className="space-y-2 overflow-y-auto flex-1">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-overlay-border text-sm">
                <span className="text-on-overlay">{ing.name}</span>
                {ing.amount > 0 && (
                  <span className="text-on-overlay/50 font-mono">{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-on-overlay/50 text-xs mt-4 text-center">{t.recipeDetail.tapToClose}</p>
        </div>
      )}
    </div>
  );
}
