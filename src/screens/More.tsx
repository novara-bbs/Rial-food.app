import { BookOpen, Settings, User, Sparkles, ChevronRight, Timer, Trophy, Gem, Heart, Package, CalendarCheck } from 'lucide-react';
import { useI18n } from '../i18n';

export default function More({ navigateTo }: { navigateTo: (screen: string) => void }) {
  const { t } = useI18n();

  const menuItems = [
    { id: 'real-feel-diary', label: t.more.realFeelDiary, icon: Heart, desc: t.more.realFeelDesc, screen: 'real-feel-diary' },
    { id: 'weekly-check-in', label: 'Reflexión Semanal', icon: CalendarCheck, desc: 'Analiza y mejora cada semana', screen: 'weekly-check-in' },
    { id: 'fasting', label: t.more.fasting, icon: Timer, desc: t.more.fastingDesc, screen: 'fasting-timer' },
    { id: 'pantry', label: 'Mi Despensa', icon: Package, desc: 'Ingredientes que tienes en casa', screen: 'pantry' },
    { id: 'challenges', label: t.more.challenges, icon: Trophy, desc: t.more.challengesDesc, screen: 'more' },
    { id: 'ai-coach', label: t.more.aiCoach, icon: Sparkles, desc: t.more.aiCoachDesc, screen: 'ai-coach' },
    { id: 'profile', label: t.more.profile, icon: User, desc: t.more.profileDesc, screen: 'profile' },
    { id: 'settings', label: t.more.settings, icon: Settings, desc: t.more.settingsDesc, screen: 'settings' },
    { id: 'rial-plus', label: t.more.rialPlus, icon: Gem, desc: t.more.rialPlusDesc, screen: 'rial-plus' },
  ];

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8 pb-24">
      <section>
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary mb-8">{t.more.title}</h2>

        <div className="grid grid-cols-1 gap-3">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.screen)}
              className="flex items-center p-5 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/50 transition-all group"
            >
              <div className="p-3 bg-surface-container-highest rounded-sm text-primary mr-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
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
