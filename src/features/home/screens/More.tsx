import { BookOpen, Settings, User, Sparkles, ChevronRight, Timer, Trophy, Gem, Heart, Package, CalendarCheck, BadgeCheck, BarChart3, Apple, TrendingUp } from 'lucide-react';
import { useI18n } from '../../../i18n';

export default function More({ navigateTo }: { navigateTo: (screen: string) => void }) {
  const { t } = useI18n();

  const menuItems = [
    { id: 'progress', label: t.progress?.title || 'Tu Progreso', icon: TrendingUp, desc: t.progress?.desc || 'Peso, nutrición y rachas', screen: 'progress', color: 'text-primary' },
    { id: 'food-dictionary', label: t.foodDictionary.title, icon: Apple, desc: t.more.foodDictionaryDesc, screen: 'food-dictionary', color: 'text-primary' },
    { id: 'real-feel-diary', label: t.more.realFeelDiary, icon: Heart, desc: t.more.realFeelDesc, screen: 'real-feel-diary', color: 'text-brand-secondary' },
    { id: 'weekly-check-in', label: t.more.weeklyCheckIn, icon: CalendarCheck, desc: t.more.weeklyCheckInDesc, screen: 'weekly-check-in', color: 'text-brand-secondary' },
    { id: 'fasting', label: t.more.fasting, icon: Timer, desc: t.more.fastingDesc, screen: 'fasting-timer', color: 'text-brand-secondary' },
    { id: 'pantry', label: t.more.pantry, icon: Package, desc: t.more.pantryDesc, screen: 'pantry', color: 'text-primary' },
    { id: 'challenges', label: t.more.challenges, icon: Trophy, desc: t.more.challengesDesc, screen: 'challenges', color: 'text-tertiary' },
    { id: 'ai-coach', label: t.more.aiCoach, icon: Sparkles, desc: t.more.aiCoachDesc, screen: 'ai-coach', color: 'text-primary' },
    { id: 'profile', label: t.more.profile, icon: User, desc: t.more.profileDesc, screen: 'profile', color: 'text-on-surface-variant' },
    { id: 'settings', label: t.more.settings, icon: Settings, desc: t.more.settingsDesc, screen: 'settings', color: 'text-on-surface-variant' },
    { id: 'creator-verification', label: t.more.creatorVerification, icon: BadgeCheck, desc: t.more.creatorVerificationDesc, screen: 'creator-verification', color: 'text-tertiary' },
    { id: 'creator-dashboard', label: t.more.creatorDashboard, icon: BarChart3, desc: t.more.creatorDashboardDesc, screen: 'creator-dashboard', color: 'text-tertiary' },
    { id: 'rial-plus', label: t.more.rialPlus, icon: Gem, desc: t.more.rialPlusDesc, screen: 'rial-plus', color: 'text-primary' },
  ];

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8 pb-24">
      <section>
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary mb-8">{t.more.title}</h2>

        <div className="grid grid-cols-1 gap-3">
          {menuItems.map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => navigateTo(item.screen)}
              className="flex items-center p-5 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/50 transition-all group"
            >
              <div className={`p-3 bg-surface-container rounded-sm ${item.color} mr-4 group-hover:bg-primary group-hover:text-on-primary transition-colors`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-headline font-bold text-lg uppercase text-tertiary block">{item.label}</span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{item.desc}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
