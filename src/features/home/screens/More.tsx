import { Settings, Sparkles, ChevronRight, Timer, Trophy, Gem, Heart, Package, CalendarCheck, BadgeCheck, BarChart3, Apple, TrendingUp, Flame, type LucideIcon } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { Button } from '@/components/ui/button';
import { BUTTON_CARD_SURFACE_CLASSES } from '../../../components/ui/surface';
import { useI18n } from '../../../i18n';
import { calcStreaks } from '../../wellness/utils/streaks';
import { calculatePoints, getUserLevel, type UserStats } from '../../profile/utils/gamification';
import type { DailyArchive } from '../../../hooks/useDailyReset';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  screen: string;
}

interface MenuGroup {
  key: string;
  header: string;
  items: MenuItem[];
  visible: boolean;
}

interface MoreProps {
  navigateTo: (screen: string) => void;
  userProfile?: any;
  realFeelLogs?: any[];
  nutritionHistory?: DailyArchive[];
  dailyLogHasEntries?: boolean;
}

export default function More({ navigateTo, userProfile, realFeelLogs = [], nutritionHistory = [], dailyLogHasEntries = false }: MoreProps) {
  const { t } = useI18n();

  const streaks = calcStreaks({
    history: nutritionHistory as DailyArchive[],
    realFeelLogs,
    todayHasMeals: dailyLogHasEntries,
  });
  const streakDays = streaks.mealLog.current;

  const stats: UserStats = {
    recipesCreated: 0,
    recipesImported: 0,
    mealsLogged: 0,
    realFeelCount: realFeelLogs.length,
    postsPublished: 0,
    plansCreated: 0,
    shoppingListUsed: false,
    fastingsCompleted: 0,
    wearableConnected: false,
    trainingDayUsed: 0,
    challengesCompleted: 0,
    isVerifiedCreator: userProfile?.isVerifiedCreator ?? false,
    streakDays,
  };
  const level = getUserLevel(calculatePoints(stats));
  const levelLabel = (t.gamification.levels as Record<string, string>)[level.name] || level.name;

  const isDev = (import.meta as any).env?.DEV === true;
  const isCreator = (userProfile?.isVerifiedCreator ?? false) || isDev;

  const groups: MenuGroup[] = [
    {
      key: 'nutrition',
      header: t.more.groupNutrition,
      visible: true,
      items: [
        { id: 'food-dictionary', label: t.foodDictionary.title, icon: Apple, screen: 'food-dictionary' },
        { id: 'pantry', label: t.more.pantry, icon: Package, screen: 'pantry' },
        { id: 'ai-coach', label: t.more.aiCoach, icon: Sparkles, screen: 'ai-coach' },
      ],
    },
    {
      key: 'wellness',
      header: t.more.groupWellness,
      visible: true,
      items: [
        { id: 'progress', label: t.progress.title, icon: TrendingUp, screen: 'progress' },
        { id: 'real-feel-diary', label: t.more.realFeelDiary, icon: Heart, screen: 'real-feel-diary' },
        { id: 'weekly-check-in', label: t.more.reflectionHistory, icon: CalendarCheck, screen: 'weekly-check-in' },
        { id: 'fasting', label: t.more.fasting, icon: Timer, screen: 'fasting-timer' },
        { id: 'challenges', label: t.more.challenges, icon: Trophy, screen: 'challenges' },
      ],
    },
    {
      key: 'creator',
      header: t.more.groupCreator,
      visible: isCreator,
      items: [
        { id: 'creator-verification', label: t.more.creatorVerification, icon: BadgeCheck, screen: 'creator-verification' },
        { id: 'creator-dashboard', label: t.more.creatorDashboard, icon: BarChart3, screen: 'creator-dashboard' },
      ],
    },
    {
      key: 'account',
      header: t.more.groupAccount,
      visible: true,
      items: [
        { id: 'rial-plus', label: t.more.rialPlus, icon: Gem, screen: 'rial-plus' },
        { id: 'settings', label: t.more.settings, icon: Settings, screen: 'settings' },
      ],
    },
  ];

  return (
    <PageShell maxWidth="default" spacing="lg">
      <header className="flex items-center justify-between">
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary">
          {t.more.title}
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigateTo('settings')}
          aria-label={t.more.settingsAria}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Hero: Perfil */}
      <button
        type="button"
        onClick={() => navigateTo('profile')}
        aria-label={t.more.heroTapHint}
        className={`${BUTTON_CARD_SURFACE_CLASSES} p-5 w-full flex items-center gap-4 text-left hover:border-primary/40 transition-colors group`}
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center overflow-hidden shrink-0">
          {userProfile?.avatar ? (
            <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="font-headline text-title-sm font-black text-primary uppercase">
              {(userProfile?.name || 'U').charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline text-title-sm font-black text-tertiary uppercase tracking-tight truncate">
            {userProfile?.name || 'User'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-primary/10 text-primary text-micro px-2 py-0.5 rounded font-bold uppercase tracking-widest">
              {levelLabel}
            </span>
            {streakDays > 0 && (
              <span className="inline-flex items-center gap-1 text-micro text-on-surface-variant font-mono">
                <Flame className="w-3 h-3 text-brand-secondary" aria-hidden="true" />
                {streakDays}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-on-surface-variant/60 group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
      </button>

      {/* Groups */}
      <div className="space-y-6">
        {groups.filter(g => g.visible).map((group, idx) => (
          <section key={group.key} aria-labelledby={`more-group-${group.key}`}>
            <h3
              id={`more-group-${group.key}`}
              className={`font-label text-micro uppercase tracking-widest text-on-surface-variant px-1 mb-3 ${idx === 0 ? '' : 'mt-2'}`}
            >
              {group.header}
            </h3>
            <div className="space-y-2">
              {group.items.map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => navigateTo(item.screen)}
                  className={`${BUTTON_CARD_SURFACE_CLASSES} w-full flex items-center gap-3 p-4 text-left hover:border-primary/40 transition-colors group`}
                >
                  <item.icon className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
                  <span className="flex-1 font-headline text-body font-bold uppercase tracking-wider text-tertiary">
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant/60 group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
