import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function CookTimer({ minutes, onDone }: { minutes: number; onDone?: () => void }) {
  const totalSeconds = Math.max(1, Math.round(minutes * 60));
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const done = secondsLeft === 0;

  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  }, []);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      playBeep();
      onDone?.();
      return;
    }
    const id = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, secondsLeft, playBeep, onDone]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
          <circle
            cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="4"
            className={done ? 'text-brand-secondary' : 'text-primary'}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-mono text-lg font-bold ${done ? 'text-brand-secondary' : 'text-white'}`}>
            {done ? '✓' : `${mins}:${String(secs).padStart(2, '0')}`}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button"
          onClick={() => setRunning(r => !r)}
          disabled={done}
          aria-label={running ? 'Pausar' : 'Iniciar'}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-40"
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button type="button"
          onClick={() => { setSecondsLeft(totalSeconds); setRunning(false); }}
          aria-label="Reiniciar"
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
