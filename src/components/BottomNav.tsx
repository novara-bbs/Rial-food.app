import { Home, UtensilsCrossed, Plus, Compass, MoreHorizontal } from 'lucide-react';
import { useI18n } from '../i18n';

export default function BottomNav({ currentScreen, setCurrentScreen, onOpenCreate }: { currentScreen: string, setCurrentScreen: (s: string) => void, onOpenCreate: () => void }) {
  const { t } = useI18n();

  const navItems = [
    { id: 'home', label: t.nav.today, icon: Home },
    { id: 'cocina', label: t.nav.kitchen, icon: UtensilsCrossed },
    { id: 'create', label: t.nav.create, icon: Plus, isAction: true },
    { id: 'explore', label: t.nav.explore, icon: Compass },
    { id: 'more', label: t.nav.more, icon: MoreHorizontal },
  ];

  return (
    <nav aria-label={t.nav.mainNav} className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-2 pb-safe-nav pt-2 bg-background/95 backdrop-blur-xl border-t border-outline-variant/15">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        if (item.isAction) {
          return (
            <button
              type="button"
              key={item.id}
              onClick={onOpenCreate}
              className="flex flex-col items-center justify-center w-16 -mt-6 mb-2 focus-visible:outline-none focus-visible:[&>div]:ring-2 focus-visible:[&>div]:ring-primary/60 focus-visible:[&>div]:ring-offset-2 focus-visible:[&>div]:ring-offset-background"
              aria-label={t.nav.create}
            >
              <div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-elev-3 shadow-primary/20 hover:scale-105 transition-transform">
                <Icon className="w-7 h-7" aria-hidden="true" />
              </div>
            </button>
          );
        }

        return (
          <button
            type="button"
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center w-16 py-2 transition-all rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              isActive ? 'text-primary scale-110' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-primary/20' : ''}`} aria-hidden="true" />
            <span className="font-label text-micro font-bold tracking-[0.1em] uppercase">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
