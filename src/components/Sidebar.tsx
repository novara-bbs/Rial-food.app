import { Home, UtensilsCrossed, Compass, MoreHorizontal, Plus } from 'lucide-react';
import { useI18n } from '../i18n';

export default function Sidebar({ currentScreen, setCurrentScreen, onOpenCreate }: { currentScreen: string, setCurrentScreen: (s: string) => void, onOpenCreate: () => void }) {
  const { t } = useI18n();

  const navItems = [
    { id: 'home', label: t.nav.today, icon: Home },
    { id: 'cocina', label: t.nav.kitchen, icon: UtensilsCrossed },
    { id: 'explore', label: t.nav.explore, icon: Compass },
    { id: 'more', label: t.nav.more, icon: MoreHorizontal },
  ];

  return (
    <aside className="hidden md:flex flex-col h-full py-8 space-y-6 bg-background w-64 border-r border-outline-variant/20 shrink-0 z-50">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-black text-primary tracking-tighter font-headline">RIAL</h1>
        <p className="text-xs tracking-[0.2em] text-on-surface-variant uppercase font-bold mt-1">{t.onboarding.subtitle}</p>
      </div>

      <div className="px-4 mb-4">
        <button
          onClick={onOpenCreate}
          className="w-full bg-primary text-on-primary py-3 rounded-sm font-headline font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
        >
          <Plus className="w-5 h-5" /> {t.nav.create}
        </button>
      </div>

      <nav className="flex-1 flex flex-col space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex items-center py-3 pl-6 pr-4 w-full text-left transition-all ${
                isActive
                  ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-high'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Icon className="w-5 h-5 mr-4" />
              <span className="font-medium uppercase tracking-wider text-sm font-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
