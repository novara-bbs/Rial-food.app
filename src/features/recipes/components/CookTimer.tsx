import { useState, useEffect, useRef, useReducer, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useI18n } from '../../../i18n';

/**
 * Drift-free countdown: instead of decrementing a counter on an interval
 * (which skews when the tab is throttled or the event loop is busy), we
 * store an absolute `endTime` epoch ms when Play is pressed and derive
 * `secondsLeft` from `Date.now()` on every tick. The tick is just a render
 * trigger — it doesn't carry state. This stays accurate across tab
 * backgrounding, heavy main-thread work, and device sleep/wake.
 */
export default function CookTimer({ minutes, onDone }: { minutes: number; onDone?: () => void }) {
  const { t } = useI18n();
  const totalSeconds = Math.max(1, Math.round(minutes * 60));

  // endTime = null means paused/idle. pausedMsLeft carries the remaining
  // time across pause cycles so resume preserves progress.
  const [endTime, setEndTime] = useState<number | null>(null);
  const [pausedMsLeft, setPausedMsLeft] = useState<number>(totalSeconds * 1000);
  // Render trigger only — the reducer is intentionally stateless; we never read
  // the value, we just need a way to force a re-render so Date.now() gets
  // re-evaluated on the next render pass.
  const [, forceTick] = useReducer((c: number) => c + 1, 0);
  const doneFiredRef = useRef(false);

  const running = endTime !== null;
  const msLeft = running ? Math.max(0, endTime - Date.now()) : pausedMsLeft;
  const secondsLeft = Math.ceil(msLeft / 1000);
  const done = msLeft === 0 && (running || pausedMsLeft === 0);

  const playBeep = useCallback(() => {
    try {
      const AudioCtor: typeof AudioContext | undefined =
        (window as any).AudioContext ?? (window as any).webkitAudioContext;
      if (!AudioCtor) return;
      const ctx = new AudioCtor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch { /* audio not available in this environment */ }
  }, []);

  // Tick loop while running — re-reads Date.now() so we can't drift.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => forceTick(), 250);
    return () => window.clearInterval(id);
  }, [running]);

  // Fire onDone exactly once when we cross zero.
  useEffect(() => {
    if (!done || doneFiredRef.current) return;
    doneFiredRef.current = true;
    setEndTime(null);
    setPausedMsLeft(0);
    playBeep();
    onDone?.();
  }, [done, playBeep, onDone]);

  // Reset done-guard if user resets / changes duration.
  useEffect(() => {
    if (pausedMsLeft > 0) doneFiredRef.current = false;
  }, [pausedMsLeft]);

  const toggleRun = () => {
    if (running) {
      // pause — freeze remaining into pausedMsLeft
      setPausedMsLeft(Math.max(0, (endTime ?? 0) - Date.now()));
      setEndTime(null);
    } else {
      if (done) return;
      setEndTime(Date.now() + pausedMsLeft);
    }
  };

  const reset = () => {
    setEndTime(null);
    setPausedMsLeft(totalSeconds * 1000);
    doneFiredRef.current = false;
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = 1 - msLeft / (totalSeconds * 1000);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88" aria-hidden="true">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-on-overlay/10" />
          <circle
            cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="4"
            className={done ? 'text-brand-secondary' : 'text-primary'}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 250ms linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-mono text-lg font-bold ${done ? 'text-brand-secondary' : 'text-on-overlay'}`}
            aria-live="polite"
          >
            {done ? '✓' : `${mins}:${String(secs).padStart(2, '0')}`}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={toggleRun}
          disabled={done}
          aria-label={running ? t.recipeDetail.timerPause : t.recipeDetail.timerStart}
          className="w-11 h-11 rounded-full bg-on-overlay/10 flex items-center justify-center text-on-overlay hover:bg-on-overlay/20 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label={t.recipeDetail.timerReset}
          className="w-11 h-11 rounded-full bg-on-overlay/10 flex items-center justify-center text-on-overlay hover:bg-on-overlay/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
