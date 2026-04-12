import { User, Mail, Shield, CreditCard, LogOut, ChevronRight, Flame, Trophy, Star, Pencil } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useI18n } from '../../../i18n';
import { BADGES, LEVELS, calculatePoints, getUserLevel, getEarnedBadges, getNextMilestone, calculateStreak, type UserStats } from '../utils/gamification';
import PageHeader from '../../../components/patterns/PageHeader';
import { bodyWeightFromKg, getBodyWeightUnit, heightFromCm, getHeightUnit } from '../../food/utils/units';
import { useNavigation } from '../../../contexts/NavigationContext';
import { Button } from '@/components/ui/button';

export default function Profile({ userProfile, onBack, realFeelLogs = [], savedRecipes = [], communityPosts = [] }: {
  userProfile: any;
  onBack: () => void;
  realFeelLogs?: any[];
  savedRecipes?: any[];
  communityPosts?: any[];
}) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();

  // Calculate real streak from realFeelLogs
  const streakDays = calculateStreak((realFeelLogs || []).map((l: any) => l.date).filter(Boolean));

  // Build user stats for gamification
  const stats: UserStats = {
    recipesCreated: savedRecipes.filter((r: any) => r.tag === 'MI RECETA').length,
    recipesImported: savedRecipes.filter((r: any) => r.tag === 'IMPORTADA').length,
    mealsLogged: 0, // would track from dailyMacros history
    realFeelCount: realFeelLogs.length,
    postsPublished: communityPosts.filter((p: any) => p.author?.name === 'Tú' || p.author?.name === 'You').length,
    plansCreated: 0,
    shoppingListUsed: false,
    fastingsCompleted: 0,
    wearableConnected: false,
    trainingDayUsed: 0,
    challengesCompleted: 0,
    isVerifiedCreator: false,
    streakDays,
  };

  const points = calculatePoints(stats);
  const level = getUserLevel(points);
  const earned = getEarnedBadges(stats);
  const nextLevelPoints = LEVELS[Math.min(level.level, LEVELS.length - 1)]?.minPoints || 0;
  const currentLevelIdx = LEVELS.findIndex(l => l.name === level.name);
  const nextLevel = LEVELS[currentLevelIdx + 1];
  const levelProgress = nextLevel ? ((points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100 : 100;

  return (
    <PageShell maxWidth="narrow" spacing="lg">
      <PageHeader
        onBack={onBack}
        label=""
        title={t.profile.title}
        rightAction={
          <Button variant="ghost" size="icon-sm" onClick={() => navigateTo('settings')} aria-label={t.profile.editProfile || 'Editar perfil'}>
            <Pencil className="w-4 h-4" />
          </Button>
        }
      />

      {/* Avatar + name */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center overflow-hidden">
          {userProfile?.avatar ? (
            <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="font-headline text-3xl font-black text-primary uppercase">
              {(userProfile?.name || 'U').charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h2 className="font-headline text-2xl font-black text-tertiary uppercase tracking-tight">{userProfile?.name || 'User'}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
              {(t.gamification.levels as Record<string, string>)[level.name] || level.name}
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono">{points} pts</span>
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <span className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary">
              {t.gamification.level} {level.level}
            </span>
          </div>
          {nextLevel && (
            <span className="text-[10px] text-on-surface-variant font-mono">
              {points}/{nextLevel.minPoints} pts
            </span>
          )}
        </div>
        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(levelProgress, 100)}%` }} />
        </div>
        {nextLevel && (
          <p className="text-[9px] text-on-surface-variant mt-2 uppercase tracking-widest">
            {(t.gamification.levels as Record<string, string>)[nextLevel.name]} — {nextLevel.minPoints - points} pts
          </p>
        )}
      </div>

      {/* Streak */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame className="w-6 h-6 text-brand-secondary" />
          <div>
            <span className="font-headline text-sm font-bold uppercase text-tertiary tracking-widest">{t.gamification.streak}</span>
            <p className="text-[10px] text-on-surface-variant">Real Feel + meals</p>
          </div>
        </div>
        <span className="font-mono text-3xl font-black text-brand-secondary">{stats.streakDays}</span>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">{t.gamification.badges}</h3>
          <span className="text-[10px] text-on-surface-variant font-mono">{earned.length}/{BADGES.length}</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {BADGES.map(badge => {
            const isEarned = earned.some(e => e.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-sm border transition-all ${
                  isEarned
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-outline-variant/10 bg-surface-container-low opacity-40'
                }`}
                title={(t.gamification.badgeNames as Record<string, string>)[badge.name] || badge.name}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <span className="text-[7px] font-bold uppercase tracking-wider text-on-surface-variant text-center leading-tight">
                  {(t.gamification.badgeNames as Record<string, string>)[badge.name] || badge.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body data */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
        <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-4">{t.profile.bodyData}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {userProfile?.age && <div className="flex justify-between"><span className="text-on-surface-variant">{t.onboarding.age}</span><span className="font-bold text-tertiary">{userProfile.age}</span></div>}
          {userProfile?.height && <div className="flex justify-between"><span className="text-on-surface-variant">{t.onboarding.height}</span><span className="font-bold text-tertiary">{heightFromCm(userProfile.height, userProfile?.unitSystem ?? 'metric')} {getHeightUnit(userProfile?.unitSystem ?? 'metric')}</span></div>}
          {userProfile?.weight && <div className="flex justify-between"><span className="text-on-surface-variant">{t.onboarding.weight}</span><span className="font-bold text-tertiary">{bodyWeightFromKg(userProfile.weight, userProfile?.unitSystem ?? 'metric')} {getBodyWeightUnit(userProfile?.unitSystem ?? 'metric')}</span></div>}
          {userProfile?.goal && <div className="flex justify-between"><span className="text-on-surface-variant">{t.profile.goal}</span><span className="font-bold text-primary uppercase text-xs">{userProfile.goal}</span></div>}
        </div>
        {userProfile?.dietaryPreferences?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {userProfile.dietaryPreferences.map((p: string) => (
              <span key={p} className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">{p}</span>
            ))}
          </div>
        )}
      </div>

      {/* Menu items */}
      <div className="space-y-3">
        {[
          { label: t.settings.notifications, icon: Mail, action: () => navigateTo('notifications') },
          { label: t.settings.privacy, icon: Shield, action: () => navigateTo('settings') },
          { label: t.settings.export, icon: CreditCard, action: () => navigateTo('settings') },
        ].map((item, idx) => (
          <button type="button" key={idx} onClick={item.action} className="w-full flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/20 rounded-sm hover:border-primary/50 transition-all group text-left">
            <div className="flex items-center gap-4">
              <item.icon className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant/50 group-hover:text-primary" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {t.profile.logout || 'Cerrar sesión'}
      </Button>
    </PageShell>
  );
}
