import { Bell, Settings, User, Search } from 'lucide-react';
import { useI18n } from '../i18n';

interface GlobalHeaderProps {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  userName?: string;
  isPro?: boolean;
}

export default function GlobalHeader({ onOpenSettings, onOpenProfile, onOpenNotifications, userName, isPro }: GlobalHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="h-16 border-b border-outline-variant/10 bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-xs w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
          <input
            type="text"
            placeholder={t.header.searchPlaceholder}
            className="w-full bg-surface-container-highest/30 border border-outline-variant/20 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNotifications}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors relative"
          aria-label={t.settings.notifications}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors"
          aria-label={t.settings.title}
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-6 w-[1px] bg-outline-variant/20 mx-2" />

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-3 pl-2 group"
          aria-label={t.profile.title}
        >
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-tertiary uppercase tracking-tight leading-none">{userName || 'User'}</p>
            <p className="text-[8px] font-mono text-primary uppercase tracking-widest mt-1">{isPro ? t.header.proMember : t.header.member}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 overflow-hidden group-hover:border-primary/50 transition-all">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt={t.profile.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </button>
      </div>
    </header>
  );
}
