import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, UtensilsCrossed, Clock, Volume2, VolumeX } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { Z_TW } from '../../../lib/z-index';
import CookTimer from './CookTimer';
import IngredientCheckoff, { type CheckoffIngredient } from './IngredientCheckoff';
import MediaLightbox from './MediaLightbox';
import featureFlags from '../../../lib/featureFlags';

interface NormalizedStep {
  text: string;
  photoUrl?: string;
  detectedMinutes?: number;
  ingredientIds?: string[];
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
  steps: string[] | { text: string; photoUrl?: string; timerMinutes?: number; ingredientIds?: string[] }[];
  title: string;
  ingredients?: CheckoffIngredient[];
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const [current, setCurrent] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [activeTimers, setActiveTimers] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const touchStartX = useRef<number>(0);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const voiceSupported = featureFlags.cookModeVoiceReadAloud && typeof window !== 'undefined' && 'speechSynthesis' in window;

  const normalized: NormalizedStep[] = steps.map(s =>
    typeof s === 'string'
      ? { text: s, detectedMinutes: detectTimerMinutes(s) }
      : { text: s.text, photoUrl: s.photoUrl, detectedMinutes: s.timerMinutes ?? detectTimerMinutes(s.text), ingredientIds: s.ingredientIds },
  );

  const step = normalized[current];
  const total = normalized.length;

  // Per-step ingredients: look up by id from the full ingredients list
  const stepIngredients: CheckoffIngredient[] = step.ingredientIds?.length
    ? step.ingredientIds
        .map(id => ingredients.find(ing => ing.id === id))
        .filter((ing): ing is CheckoffIngredient => ing !== undefined)
    : [];

  // WakeLock — keep screen on while cooking. Re-acquire on visibilitychange
  // because browsers silently release the lock when the tab goes background.
  useEffect(() => {
    let lock: any = null;
    let released = false;

    const acquire = () => {
      if (released) return;
      if (!('wakeLock' in navigator)) return;
      (navigator as any).wakeLock.request('screen').then((l: any) => {
        lock = l;
        l.addEventListener?.('release', () => { lock = null; });
      }).catch(() => { /* ignore — screen just won't stay on */ });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !lock) acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      lock?.release?.();
    };
  }, []);

  // Cancel speech when step changes. We intentionally only re-run on `current`
  // to avoid cancelling speech mid-step on unrelated re-renders.
  const currentRef = useRef(current);
  useEffect(() => {
    if (currentRef.current !== current) {
      currentRef.current = current;
      if (voiceSupported) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  }, [current, voiceSupported]);

  useEffect(() => {
    return () => {
      if (voiceSupported) window.speechSynthesis.cancel();
    };
  }, [voiceSupported]);

  // Autofocus the close button on mount so users can exit with Tab+Enter
  // immediately, and so screen readers announce "exit cook mode".
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const goNext = useCallback(() => setCurrent(c => Math.min(c + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  // Keyboard: Escape closes, arrows navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight') { goNext(); return; }
      if (e.key === 'ArrowLeft') { goPrev(); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goNext, goPrev]);

  const handleVoiceToggle = () => {
    if (!voiceSupported) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(step.text);
    utter.lang = locale === 'es' ? 'es-ES' : 'en-US';
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
  };

  // Empty-steps guard — avoid crashing on step.text when steps came empty.
  if (total === 0) {
    return (
      <div
        className={`fixed inset-0 ${Z_TW.FULLSCREEN} bg-neutral-950 flex flex-col items-center justify-center text-on-overlay p-8 text-center`}
        role="dialog"
        aria-modal="true"
      >
        <UtensilsCrossed className="w-10 h-10 text-on-overlay/40 mb-4" aria-hidden="true" />
        <p className="font-body text-base max-w-sm leading-relaxed">{t.recipeDetail.cookModeNoSteps}</p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          autoFocus
          className="mt-6 min-h-11 px-6 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {t.recipeDetail.cookModeClose}
        </button>
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { if (dx > 0) { goNext(); } else { goPrev(); } }
  };

  const voiceTt = t.cookMode;

  return (
    <>
    <div
      className={`fixed inset-0 ${Z_TW.FULLSCREEN} bg-neutral-950 flex flex-col text-on-overlay select-none`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-overlay-border">
        <div>
          <span className="font-label text-micro uppercase tracking-widest text-on-overlay/40 block truncate max-w-[200px]">{title}</span>
          <p className="font-headline text-sm font-bold text-on-overlay/70">
            {t.recipeDetail.cookModeStep
              .replace('{current}', String(current + 1))
              .replace('{total}', String(total))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice read-aloud button */}
          {voiceSupported && (
            <button type="button"
              onClick={handleVoiceToggle}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking
                  ? 'bg-primary/30 text-primary hover:bg-primary/40'
                  : 'bg-on-overlay/10 hover:bg-on-overlay/20'
              }`}
              aria-label={isSpeaking ? voiceTt.stopReading : voiceTt.readAloud}
            >
              {isSpeaking
                ? <VolumeX className="w-4 h-4 text-primary" />
                : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {/* Global ingredients overlay button */}
          {ingredients.length > 0 && (
            <button type="button"
              onClick={() => setShowIngredients(s => !s)}
              className="p-2 rounded-full bg-on-overlay/10 hover:bg-on-overlay/20 transition-colors"
              aria-label={t.recipeDetail.viewIngredients}
            >
              <UtensilsCrossed className="w-4 h-4" />
            </button>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-on-overlay/10 hover:bg-on-overlay/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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

        {/* Step photo — R5.2: clickable thumbnail → MediaLightbox */}
        {step.photoUrl && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="w-full max-w-sm rounded-sm overflow-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={voiceTt.viewStepPhoto}
          >
            <img
              src={step.photoUrl}
              alt={`Step ${current + 1}`}
              className="w-full object-cover max-h-48"
            />
          </button>
        )}

        <p className="text-xl md:text-2xl font-body leading-relaxed text-on-overlay max-w-lg">{step.text}</p>

        {/* R5.1: Per-step ingredient sub-list */}
        {stepIngredients.length > 0 && (
          <div className="w-full max-w-sm bg-on-overlay/5 border border-overlay-border rounded-sm px-4 py-3">
            <p className="text-xs font-label uppercase tracking-widest text-on-overlay/40 mb-2">
              {voiceTt.ingredientsForStep}
            </p>
            <IngredientCheckoff ingredients={stepIngredients} compact />
          </div>
        )}

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

      {/* Ingredients overlay — global fallback when no per-step ids */}
      {showIngredients && (
        <div
          className="absolute inset-0 bg-neutral-950/95 z-10 flex flex-col pt-16 px-6 pb-8"
          onClick={() => setShowIngredients(false)}
        >
          <h3 className="font-headline font-bold text-lg uppercase text-on-overlay mb-4">{t.recipeDetail.viewIngredients}</h3>
          <div className="flex-1 overflow-y-auto">
            <IngredientCheckoff ingredients={ingredients} />
          </div>
          <p className="text-on-overlay/50 text-xs mt-4 text-center">{t.recipeDetail.tapToClose}</p>
        </div>
      )}
    </div>

    {/* Step photo lightbox — R5.2 */}
    {step.photoUrl && (
      <MediaLightbox
        photos={[step.photoUrl]}
        startIndex={0}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        alt={`${title} — paso ${current + 1}`}
      />
    )}
    </>
  );
}
