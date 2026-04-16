import { useRef, useState, useCallback } from 'react';
import { Bell, Settings, Search } from 'lucide-react';
import { useI18n } from '../i18n';
import DemoSeedCard from '../features/dev/components/DemoSeedCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface GlobalHeaderProps {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  userName?: string;
  isPro?: boolean;
  userAvatar?: string | null;
}

/**
 * Long-press (800ms) on the avatar opens a gated modal that reveals the
 * Demo Rial card even on prod builds. The 4-digit gate is hardcoded — it's
 * not a secret, just friction to avoid accidental activation.
 */
const DEMO_UNLOCK_CODE = '1537';
const LONG_PRESS_MS = 800;

export default function GlobalHeader({ onOpenSettings, onOpenProfile, onOpenNotifications, userName, isPro, userAvatar }: GlobalHeaderProps) {
  const { t } = useI18n();

  const [demoGateOpen, setDemoGateOpen] = useState(false);
  const [demoUnlocked, setDemoUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);
  const pressTimerRef = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);

  const startPress = useCallback(() => {
    longPressFiredRef.current = false;
    if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    pressTimerRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      setDemoGateOpen(true);
      setCodeInput('');
      setCodeError(false);
      setDemoUnlocked(false);
    }, LONG_PRESS_MS);
  }, []);

  const cancelPress = useCallback(() => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  const onAvatarClick = useCallback((e: React.MouseEvent) => {
    if (longPressFiredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onOpenProfile();
  }, [onOpenProfile]);

  const verifyCode = useCallback(() => {
    if (codeInput.trim() === DEMO_UNLOCK_CODE) {
      setDemoUnlocked(true);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  }, [codeInput]);

  const closeGate = useCallback(() => {
    setDemoGateOpen(false);
    setDemoUnlocked(false);
    setCodeInput('');
    setCodeError(false);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-outline-variant/10 bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-xs w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
            <input
              type="search"
              placeholder={t.header.searchPlaceholder}
              aria-label={t.header.searchPlaceholder}
              className="w-full bg-surface-container-highest/30 border border-outline-variant/20 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors relative"
            aria-label={t.settings.notifications}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
            aria-label={t.settings.title}
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="h-6 w-[1px] bg-outline-variant/20 mx-2" />

          <button
            type="button"
            onClick={onAvatarClick}
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onPointerCancel={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
            className="flex items-center gap-3 pl-2 group select-none"
            aria-label={t.profile.title}
          >
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-tertiary uppercase tracking-tight leading-none">{userName || 'User'}</p>
              <p className="text-[8px] font-mono text-primary uppercase tracking-widest mt-1">{isPro ? t.header.proMember : t.header.member}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 overflow-hidden group-hover:border-primary/50 transition-all flex items-center justify-center">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={t.profile.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="font-headline font-bold text-xs text-primary uppercase select-none">
                  {(userName ?? '?').slice(0, 2)}
                </span>
              )}
            </div>
          </button>
        </div>
      </header>

      <Dialog
        open={demoGateOpen}
        onOpenChange={(open) => { if (!open) closeGate(); }}
      >
        <DialogContent className="max-w-sm bg-surface-container border-outline-variant/20 rounded-sm space-y-4">
          <DialogHeader>
            <DialogTitle className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary text-left">
              {demoUnlocked ? t.globalHeader.demoGate.title : t.globalHeader.demoGate.codeLabel}
            </DialogTitle>
          </DialogHeader>

          {!demoUnlocked ? (
            <>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {t.globalHeader.demoGate.codePrompt}
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value.replace(/\D/g, ''));
                  setCodeError(false);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') verifyCode(); }}
                autoFocus
                aria-label={t.globalHeader.demoGate.codeLabel}
                className={`w-full bg-surface-container-highest border rounded-sm py-2 px-3 text-center font-mono text-lg tracking-widest focus:outline-none transition-colors ${
                  codeError ? 'border-error text-error' : 'border-outline-variant/30 focus:border-primary'
                }`}
                aria-invalid={codeError}
              />
              {codeError && (
                <p className="text-[10px] text-error">{t.globalHeader.demoGate.codeInvalid}</p>
              )}
              <button
                type="button"
                onClick={verifyCode}
                disabled={codeInput.length !== 4}
                className="w-full bg-primary text-on-primary py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {t.globalHeader.demoGate.unlock}
              </button>
            </>
          ) : (
            <DemoSeedCard forceVisible />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
