import { useState, useEffect } from 'react';
import { Play, Square, Clock, Trophy, Timer, CheckCircle2, StopCircle } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import PageHeader from '../../../components/patterns/PageHeader';

const PROTOCOLS = [
  { id: '16:8', label: '16:8', fastHours: 16, eatHours: 8 },
  { id: '18:6', label: '18:6', fastHours: 18, eatHours: 6 },
  { id: '20:4', label: '20:4', fastHours: 20, eatHours: 4 },
  { id: 'omad', label: 'OMAD', fastHours: 23, eatHours: 1 },
];

export default function FastingTimer({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const [protocol, setProtocol] = useLocalStorageState('fasting-protocol', PROTOCOLS[0]);
  const [fastingStart, setFastingStart] = useLocalStorageState<number | null>('fasting-start', null);
  const [fastingHistory, setFastingHistory] = useLocalStorageState<any[]>('fasting-history', []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!fastingStart) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [fastingStart]);

  const isFasting = fastingStart !== null;
  const elapsedMs = isFasting ? now - fastingStart : 0;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const targetMs = protocol.fastHours * 60 * 60 * 1000;
  const progress = Math.min(elapsedMs / targetMs, 1);
  const isComplete = progress >= 1;

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStart = () => setFastingStart(Date.now());

  const handleStop = () => {
    if (fastingStart) {
      setFastingHistory(prev => [{
        id: Date.now(),
        protocol: protocol.id,
        start: new Date(fastingStart).toISOString(),
        end: new Date().toISOString(),
        durationMs: Date.now() - fastingStart,
        completed: isComplete,
      }, ...prev]);
    }
    setFastingStart(null);
  };

  // SVG circular progress
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const completedCount = fastingHistory.filter(h => h.completed).length;

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-6 pb-24">
      <PageHeader onBack={onBack} label="" title={t.fasting.title} />

      {/* Protocol selector */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {PROTOCOLS.map(p => (
          <button
            key={p.id}
            onClick={() => !isFasting && setProtocol(p)}
            disabled={isFasting}
            className={`shrink-0 px-5 py-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
              protocol.id === p.id
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:border-primary/50 disabled:opacity-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center py-6">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 240 240" className="w-full h-full -rotate-90">
            <circle cx="120" cy="120" r={radius} fill="none" stroke="var(--color-outline-variant)" strokeWidth="8" opacity="0.2" />
            <circle
              cx="120" cy="120" r={radius} fill="none"
              stroke={isComplete ? 'var(--color-brand-secondary)' : 'var(--color-primary)'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isFasting ? (
              <>
                <span className="font-mono text-4xl font-black text-primary">{formatTime(elapsedMs)}</span>
                <span className="text-xs text-on-surface-variant mt-2 uppercase tracking-wider">
                  {isComplete ? '✓' : t.fasting.elapsed}
                </span>
                {!isComplete && (
                  <span className="text-xs text-on-surface-variant mt-1">
                    {t.fasting.remaining}: {formatTime(Math.max(targetMs - elapsedMs, 0))}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="font-mono text-3xl font-black text-on-surface-variant">{protocol.fastHours}h</span>
                <span className="text-xs text-on-surface-variant mt-1">{t.fasting.fasting}</span>
                <span className="text-xs text-primary mt-1">{protocol.eatHours}h {t.fasting.eating}</span>
              </>
            )}
          </div>
        </div>

        {/* Start / Stop button */}
        <button
          onClick={isFasting ? handleStop : handleStart}
          className={`mt-6 px-10 py-4 rounded-sm font-headline text-sm font-bold uppercase tracking-widest flex items-center gap-3 transition-all ${
            isFasting
              ? 'bg-error/10 text-error border border-error/30 hover:bg-error/20'
              : 'bg-primary text-on-primary hover:opacity-90'
          }`}
        >
          {isFasting ? <><Square className="w-5 h-5" /> {t.fasting.stop}</> : <><Play className="w-5 h-5" /> {t.fasting.start}</>}
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 text-center">
          <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
          <span className="font-mono text-2xl font-black text-tertiary">{completedCount}</span>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{t.fasting.completed}</p>
        </div>
        <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 text-center">
          <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
          <span className="font-mono text-2xl font-black text-tertiary">{protocol.id}</span>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{t.fasting.protocol}</p>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-3">{t.fasting.history}</h2>
        {fastingHistory.length === 0 ? (
          <div className="text-center py-8">
            <Timer className="w-8 h-8 text-on-surface-variant/40 mb-3" />
            <p className="text-on-surface-variant text-sm">{t.fasting.chooseProtocol}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fastingHistory.slice(0, 10).map((h: any) => (
              <div key={h.id} className="flex items-center gap-4 p-3 bg-surface-container-low border border-outline-variant/20 rounded-sm">
                {h.completed ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> : <StopCircle className="w-5 h-5 text-on-surface-variant/50 shrink-0" />}
                <div className="flex-1">
                  <span className="font-headline text-xs font-bold uppercase text-tertiary">{h.protocol}</span>
                  <p className="text-[10px] text-on-surface-variant">{formatTime(h.durationMs)}</p>
                </div>
                <span className="text-[10px] text-on-surface-variant">{new Date(h.start).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
