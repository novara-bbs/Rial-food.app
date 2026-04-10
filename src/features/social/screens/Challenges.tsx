import { ArrowLeft, Activity, Check, Clock, Trophy, Flame } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';

const CHALLENGES = [
  { id: 'green-7', titleKey: 'greenChallenge', icon: '🥬', days: 7, participants: 1240, color: 'primary' },
  { id: 'hydration-3l', titleKey: 'hydrationChallenge', icon: '💧', days: 14, participants: 850, color: 'brand-secondary' },
  { id: 'protein-week', titleKey: 'proteinChallenge', icon: '💪', days: 7, participants: 620, color: 'primary' },
  { id: 'no-sugar-5', titleKey: 'noSugarChallenge', icon: '🚫', days: 5, participants: 430, color: 'brand-secondary' },
];

export default function Challenges({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const { setSelectedChallengeId } = useAppState();
  const [joinedChallenges, setJoinedChallenges] = useLocalStorageState<string[]>('joinedChallenges', []);
  const [joinDates, setJoinDates] = useLocalStorageState<Record<string, string>>('challengeJoinDates', {});

  const toggleChallenge = (id: string) => {
    setJoinedChallenges((prev: string[]) => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      }
      setJoinDates((d: Record<string, string>) => ({ ...d, [id]: new Date().toISOString() }));
      return [...prev, id];
    });
  };

  const getDaysInChallenge = (id: string, totalDays: number): number => {
    const joinDate = joinDates[id];
    if (!joinDate) return 0;
    const days = Math.floor((Date.now() - new Date(joinDate).getTime()) / 86_400_000) + 1;
    return Math.min(days, totalDays);
  };

  return (
    <div className="px-6 max-w-2xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">RIAL</span>
          <h1 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">{t.challenges.title}</h1>
        </div>
      </div>

      {/* Joined challenges */}
      {joinedChallenges.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> {t.challenges.yourChallenges}
          </h3>
          {CHALLENGES.filter(c => joinedChallenges.includes(c.id)).map(challenge => {
            const daysIn = getDaysInChallenge(challenge.id, challenge.days);
            const progress = (daysIn / challenge.days) * 100;
            return (
              <div key={challenge.id} onClick={() => { setSelectedChallengeId(challenge.id); navigateTo('challenge-detail'); }} className="bg-surface-container-low border border-primary/30 rounded-sm p-5 space-y-3 cursor-pointer hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{challenge.icon}</span>
                    <div>
                      <h4 className="font-headline font-bold text-sm uppercase text-tertiary">
                        {t.challenges[challenge.titleKey as keyof typeof t.challenges] || challenge.titleKey}
                      </h4>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                        {t.challenges.dayProgress.replace('{current}', String(daysIn)).replace('{total}', String(challenge.days))}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleChallenge(challenge.id); }}
                    className="px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest bg-surface-container-highest text-on-surface-variant hover:text-error transition-colors"
                  >
                    {t.challenges.leave}
                  </button>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Available challenges */}
      <section className="space-y-3">
        <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary flex items-center gap-2">
          <Activity className="w-4 h-4 text-on-surface-variant" /> {t.challenges.available}
        </h3>
        {CHALLENGES.map(challenge => {
          const isJoined = joinedChallenges.includes(challenge.id);
          return (
            <div key={challenge.id} onClick={() => { setSelectedChallengeId(challenge.id); navigateTo('challenge-detail'); }} className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 cursor-pointer hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div>
                    <h4 className="font-headline font-bold text-sm uppercase text-tertiary">
                      {t.challenges[challenge.titleKey as keyof typeof t.challenges] || challenge.titleKey}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-[9px] text-on-surface-variant uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {challenge.days} {t.challenges.days}</span>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {challenge.participants}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleChallenge(challenge.id); }}
                  className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1 ${
                    isJoined
                      ? 'bg-primary text-on-primary'
                      : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-on-primary'
                  }`}
                >
                  {isJoined ? <><Check className="w-3 h-3" /> {t.challenges.joined}</> : t.challenges.join}
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
