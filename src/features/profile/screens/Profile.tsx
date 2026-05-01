import { LogOut, ChevronRight, Flame, Trophy, Star, Pencil } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import SectionCard from '../../../components/SectionCard';
import { Heading } from '@/components/ui/Typography';
import { BUTTON_CARD_SURFACE_CLASSES } from '../../../components/ui/surface';
import { useI18n } from '../../../i18n';
import { BADGES, LEVELS, calculatePoints, getUserLevel, getEarnedBadges, type UserStats } from '../utils/gamification';
import { calcStreaks } from '../../wellness/utils/streaks';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { UserProfile } from '../../../types/user';
import type { StoredRealFeelEntry } from '../../../types/wellness';
import type { Recipe } from '../../../types';
import type { CommunityPost } from '../../../types/social';
import PageHeader from '../../../components/patterns/PageHeader';
import { bodyWeightFromKg, getBodyWeightUnit, heightFromCm, getHeightUnit } from '../../food/utils/units';
import { useNavigation } from '../../../contexts/NavigationContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Profile({ userProfile, onBack, realFeelLogs = [], savedRecipes = [], communityPosts = [], nutritionHistory = [], dailyLogHasEntries = false }: {
  userProfile: UserProfile;
  onBack: () => void;
  realFeelLogs?: StoredRealFeelEntry[];
  savedRecipes?: Recipe[];
  communityPosts?: CommunityPost[];
  nutritionHistory?: DailyArchive[];
  dailyLogHasEntries?: boolean;
}) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();

  // Canonical streak — aligned with Home + Progress (Q14)
  const streaks = calcStreaks({
    history: nutritionHistory,
    realFeelLogs: realFeelLogs ?? [],
    todayHasMeals: dailyLogHasEntries,
  });
  const streakDays = streaks.mealLog.current;

  // Build user stats for gamification
  const stats: UserStats = {
    recipesCreated: savedRecipes.filter((r) => r.tag === 'myRecipe').length,
    recipesImported: savedRecipes.filter((r) => r.tag === 'imported').length,
    mealsLogged: 0, // would track from dailyMacros history
    realFeelCount: realFeelLogs.length,
    // Id-based ownership check. Name-based compare broke in EN locale and on
    // profile rename (see PostDetail.tsx for the same fix).
    postsPublished: communityPosts.filter((p) => p.author?.id === 'self').length,
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
          <Button variant="ghost" size="icon-sm" onClick={() => navigateTo('settings')} aria-label={t.profile.editProfile}>
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </Button>
        }
      />

      {/* Avatar + name */}
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center overflow-hidden">
          <span className="font-headline text-headline font-black text-primary uppercase">
            {(userProfile?.name || 'U').charAt(0)}
          </span>
          {userProfile?.avatar && (
            <img src={userProfile.avatar} alt="" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          )}
        </div>
        <div>
          <Heading level="h2" className="font-headline text-title font-black text-tertiary uppercase tracking-tight">{userProfile?.name || 'User'}</Heading>
          <div className="flex items-center gap-3 mt-1">
            <span className="bg-primary/10 text-primary text-micro px-2 py-0.5 rounded font-bold uppercase tracking-widest">
              {(t.gamification.levels as Record<string, string>)[level.name] || level.name}
            </span>
            <span className="text-micro text-on-surface-variant font-mono">{points} pts</span>
          </div>
        </div>
      </div>

      {/* Level progress */}
      <SectionCard
        icon={<Star className="w-4 h-4 text-primary" aria-hidden="true" />}
        title={`${t.gamification.level} ${level.level}`}
        action={
          nextLevel ? (
            <span className="text-micro text-on-surface-variant font-mono">
              {points}/{nextLevel.minPoints} pts
            </span>
          ) : undefined
        }
      >
        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(levelProgress, 100)}%` }} />
        </div>
        {nextLevel && (
          <p className="text-micro text-on-surface-variant uppercase tracking-widest">
            {(t.gamification.levels as Record<string, string>)[nextLevel.name]} — {nextLevel.minPoints - points} pts
          </p>
        )}
      </SectionCard>

      {/* Streak — deep-link to Progress */}
      <button
        type="button"
        onClick={() => navigateTo('progress')}
        aria-label={t.header.streakAria}
        className={`${BUTTON_CARD_SURFACE_CLASSES} p-5 flex items-center justify-between w-full text-left hover:border-brand-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors group`}
      >
        <div className="flex items-center gap-3">
          <Flame className="w-6 h-6 text-brand-secondary" aria-hidden="true" />
          <div>
            <span className="font-headline text-body-sm font-bold uppercase text-tertiary tracking-widest">{t.gamification.streak}</span>
            <p className="text-micro text-on-surface-variant">{t.profile.realFeelMeals}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-headline font-black text-brand-secondary">{stats.streakDays}</span>
          <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-brand-secondary transition-colors" aria-hidden="true" />
        </div>
      </button>

      {/* Badges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" aria-hidden="true" />
          <Heading level="h3" variant="overline">{t.gamification.badges}</Heading>
          <span className="text-micro text-on-surface-variant font-mono">{earned.length}/{BADGES.length}</span>
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
                <span className="text-title">{badge.emoji}</span>
                <span className="text-micro font-bold uppercase tracking-wider text-on-surface-variant text-center leading-tight">
                  {(t.gamification.badgeNames as Record<string, string>)[badge.name] || badge.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body data */}
      <SectionCard title={t.profile.bodyData}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {userProfile?.age && <div className="flex justify-between"><span className="text-on-surface-variant">{t.onboarding.body.age}</span><span className="font-bold text-tertiary">{userProfile.age}</span></div>}
          {userProfile?.height && <div className="flex justify-between"><span className="text-on-surface-variant">{t.onboarding.body.height}</span><span className="font-bold text-tertiary">{heightFromCm(userProfile.height, userProfile?.unitSystem ?? 'metric')} {getHeightUnit(userProfile?.unitSystem ?? 'metric')}</span></div>}
          {userProfile?.weight && <div className="flex justify-between"><span className="text-on-surface-variant">{t.onboarding.body.weight}</span><span className="font-bold text-tertiary">{bodyWeightFromKg(userProfile.weight, userProfile?.unitSystem ?? 'metric')} {getBodyWeightUnit(userProfile?.unitSystem ?? 'metric')}</span></div>}
          {userProfile?.goal && <div className="flex justify-between"><span className="text-on-surface-variant">{t.profile.goal}</span><span className="font-bold text-primary uppercase text-micro">{userProfile.goal}</span></div>}
        </div>
        {userProfile?.dietaryPreferences?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {userProfile.dietaryPreferences.map((p: string) => (
              <span key={p} className="text-micro font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">{p}</span>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Logout (confirm dialog) */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
            {t.profile.logout}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.profile.logoutConfirmTitle}</DialogTitle>
            <DialogDescription>{t.profile.logoutConfirmBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t.profile.logoutConfirmCancel}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
              {t.profile.logoutConfirmAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
