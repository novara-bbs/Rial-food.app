import { Check, Trophy, Calendar, LogOut } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import PageHeader from '../../../components/patterns/PageHeader';

interface ChallengeProgress {
  challengeId: string;
  joinDate: string;
  checkIns: { date: string; note?: string }[];
}

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'ChefMarta', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', streak: 7 },
  { rank: 2, name: 'FitCarlos', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', streak: 6 },
  { rank: 3, name: 'VeganLucia', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', streak: 5 },
  { rank: 4, name: 'NutriAlex', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', streak: 4 },
  { rank: 5, name: 'Marcus V.', avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=100&q=80', streak: 3 },
];

const CHALLENGE_DATA: Record<string, { titleKey: string; descKey: string; icon: string; days: number; color: string; category: string; participants: number }> = {
  'green-7': { titleKey: 'greenChallenge', descKey: 'descGreen7', icon: '🥦', days: 7, color: 'primary', category: 'nutrition', participants: 1240 },
  'hydration-3l': { titleKey: 'hydrationChallenge', descKey: 'descHydration', icon: '💧', days: 14, color: 'brand-secondary', category: 'hydration', participants: 850 },
  'protein-week': { titleKey: 'proteinChallenge', descKey: 'descProtein', icon: '💪', days: 7, color: 'primary', category: 'nutrition', participants: 620 },
  'no-sugar-5': { titleKey: 'noSugarChallenge', descKey: 'descNoSugar', icon: '🚫', days: 5, color: 'brand-secondary', category: 'nutrition', participants: 430 },
};

export default function ChallengeDetail({ onBack, challengeId }: { onBack: () => void; challengeId: string }) {
  const { t } = useI18n();
  const ct = t.challenges as Record<string, string>;
  const challenge = CHALLENGE_DATA[challengeId] || CHALLENGE_DATA['green-7'];
  const [joinedChallenges, setJoinedChallenges] = useLocalStorageState<string[]>('joinedChallenges', []);
  const [challengeProgress, setChallengeProgress] = useLocalStorageState<Record<string, ChallengeProgress>>('challengeProgress', {});

  const isJoined = joinedChallenges.includes(challengeId);
  const progress = challengeProgress[challengeId];
  const today = new Date().toISOString().split('T')[0];
  const checkedInToday = progress?.checkIns.some(c => c.date === today);

  const calendarDays = useMemo(() => {
    if (!progress) return [];
    const start = new Date(progress.joinDate);
    return Array.from({ length: challenge.days }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isChecked = progress.checkIns.some(c => c.date === dateStr);
      const isToday = dateStr === today;
      const isFuture = d > new Date();
      return { date: dateStr, day: i + 1, isChecked, isToday, isFuture };
    });
  }, [progress, challengeId, today]);

  const streak = useMemo(() => {
    if (!progress) return 0;
    let count = 0;
    const sorted = [...progress.checkIns].sort((a, b) => b.date.localeCompare(a.date));
    for (const c of sorted) {
      const d = new Date(c.date);
      const expected = new Date();
      expected.setDate(expected.getDate() - count);
      if (d.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) count++;
      else break;
    }
    return count;
  }, [progress]);

  const handleCheckIn = () => {
    setChallengeProgress((prev: Record<string, ChallengeProgress>) => {
      const existing = prev[challengeId] || { challengeId, joinDate: today, checkIns: [] };
      return { ...prev, [challengeId]: { ...existing, checkIns: [...existing.checkIns, { date: today }] } };
    });
    toast.success(ct.checkedIn || 'Checked in!');
  };

  const handleJoin = () => {
    setJoinedChallenges((prev: string[]) => [...prev, challengeId]);
    setChallengeProgress((prev: Record<string, ChallengeProgress>) => ({
      ...prev,
      [challengeId]: { challengeId, joinDate: today, checkIns: [] },
    }));
  };

  const handleLeave = () => {
    setJoinedChallenges((prev: string[]) => prev.filter(c => c !== challengeId));
    setChallengeProgress((prev: Record<string, ChallengeProgress>) => {
      const next = { ...prev };
      delete next[challengeId];
      return next;
    });
  };

  return (
    <PageShell maxWidth="narrow" spacing="md">
      <PageHeader onBack={onBack} title={ct.detail || 'Challenge'} />

      {/* Hero */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 text-center">
        <span className="text-5xl">{challenge.icon}</span>
        <h2 className="font-headline font-bold text-xl uppercase text-tertiary mt-3">{ct[challenge.titleKey] || challengeId}</h2>
        <p className="text-xs text-on-surface-variant mt-2">{ct[challenge.descKey] || ''}</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-on-surface-variant">
          <span className="font-label tracking-widest uppercase">{challenge.days} {ct.days || 'days'}</span>
          <span className="font-label tracking-widest uppercase">{challenge.participants} {ct.participants || 'participants'}</span>
        </div>
      </div>

      {/* Join / Check-in action */}
      {!isJoined ? (
        <button type="button" onClick={handleJoin} className="w-full py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
          {ct.join || 'Join'}
        </button>
      ) : (
        <button type="button"
          onClick={handleCheckIn}
          disabled={checkedInToday}
          className={`w-full py-3 rounded-sm font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
            checkedInToday
              ? 'bg-surface-container-highest text-on-surface-variant cursor-default'
              : 'bg-primary text-on-primary hover:opacity-90'
          }`}
        >
          {checkedInToday ? <><Check className="w-4 h-4" /> {ct.checkedIn || 'Checked in today'}</> : <><Calendar className="w-4 h-4" /> {ct.checkIn || 'Check in today'}</>}
        </button>
      )}

      {/* Progress calendar */}
      {isJoined && calendarDays.length > 0 && (
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
          <h3 className="font-headline font-bold text-xs uppercase text-tertiary tracking-widest mb-4">{ct.calendar || 'Your progress'}</h3>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(d => (
              <div
                key={d.date}
                className={`aspect-square rounded-sm flex items-center justify-center text-[11px] font-bold transition-colors ${
                  d.isChecked ? 'bg-primary text-on-primary' :
                  d.isToday ? 'border-2 border-primary text-primary' :
                  d.isFuture ? 'bg-surface-container-highest/50 text-on-surface-variant/30' :
                  'bg-surface-container-highest text-on-surface-variant/50'
                }`}
              >
                {d.isChecked ? <Check className="w-3.5 h-3.5" /> : d.day}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="font-label text-xs tracking-widest text-tertiary uppercase">{ct.streak?.replace('{count}', String(streak)) || `${streak} day streak`}</span>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
        <h3 className="font-headline font-bold text-xs uppercase text-tertiary tracking-widest mb-4">{ct.leaderboard || 'Leaderboard'}</h3>
        <div className="space-y-2">
          {MOCK_LEADERBOARD.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-3 p-2">
              <span className={`font-headline font-black text-lg w-8 text-center ${entry.rank <= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
              </span>
              <img src={entry.avatar} alt={entry.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
              <span className="font-headline font-bold text-xs uppercase text-tertiary flex-1">{entry.name}</span>
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">{entry.streak}d</span>
            </div>
          ))}
          {isJoined && (
            <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-sm border border-primary/20">
              <span className="font-headline font-black text-lg w-8 text-center text-on-surface-variant">#{MOCK_LEADERBOARD.length + 1}</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">TÚ</div>
              <span className="font-headline font-bold text-xs uppercase text-primary flex-1">{ct.you || 'You'}</span>
              <span className="font-label text-[10px] tracking-widest text-primary uppercase">{streak}d</span>
            </div>
          )}
        </div>
      </div>

      {/* Leave button */}
      {isJoined && (
        <button type="button"
          onClick={handleLeave}
          className="w-full py-2.5 bg-surface-container-highest text-on-surface-variant rounded-sm font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:text-error hover:border-error/50 border border-outline-variant/30 transition-colors"
        >
          <LogOut className="w-4 h-4" /> {ct.leave || 'Leave challenge'}
        </button>
      )}
    </PageShell>
  );
}
