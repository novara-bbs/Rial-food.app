import { useState } from 'react';
import { Smartphone, Sparkles, Bell, Users, Download, AlertTriangle, LogOut, UserX, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { logger } from '../../../../lib/logger';
import { useI18n } from '../../../../i18n';
import { useLocalStorageState } from '../../../../hooks/useLocalStorageState';
import { STORAGE_KEYS } from '../../../../lib/storage-keys';
import { getNutritionHistory, archiveHydrationConsumed } from '../../../../hooks/useDailyReset';
import { useAuth } from '../../../../contexts/AuthContext';
import { Heading, Text } from '@/components/ui/Typography';
import { signOut, getSupabaseClient } from '../../../../lib/supabase';
import { exportUserData } from '../../../../lib/sync';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../../config/env';

interface Props {
  showAIBot: boolean;
  setShowAIBot?: (v: boolean) => void;
}

export default function SettingsSystem({ showAIBot, setShowAIBot }: Props) {
  const { t } = useI18n();
  const { user, isSupabaseEnabled } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorageState(STORAGE_KEYS.NOTIFICATIONS_ENABLED, true);
  const [profilePublic, setProfilePublic] = useLocalStorageState(STORAGE_KEYS.PROFILE_PUBLIC, false);
  const [connectedDevices, setConnectedDevices] = useState({ whoop: true, oura: false, garmin: false });
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const toggleDevice = (device: keyof typeof connectedDevices) => {
    setConnectedDevices((prev) => ({ ...prev, [device]: !prev[device] }));
  };

  const exportCSV = () => {
    const history = getNutritionHistory();
    if (history.length === 0) {
      toast.info(t.settings.noDataToExport);
      return;
    }
    const header = 'date,calories,protein,carbs,fats,hydration,mealCount\n';
    const rows = history.map((h) => `${h.date},${h.macros.consumed.cal},${h.macros.consumed.pro},${h.macros.consumed.carbs},${h.macros.consumed.fats},${archiveHydrationConsumed(h)},${h.mealCount}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rial-nutrition-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.settings.exportSuccess);
  };

  const deleteAllData = () => {
    const keysToKeep = ['rial_lastActiveDate', 'rial_isFirstTime'];
    Object.keys(localStorage).filter((k) => !keysToKeep.includes(k)).forEach((k) => localStorage.removeItem(k));
    toast.success(t.settings.dataDeleted);
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (!user || !isSupabaseEnabled) return;
    setIsDeletingAccount(true);
    try {
      const sb = getSupabaseClient();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      };
      if (sb) {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }
      const res = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, { method: 'POST', headers });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      await signOut();
      toast.success(t.settings.deleteAccountSuccess);
      setShowDeleteAccountConfirm(false);
    } catch (err) {
      logger.error('Delete account error', { error: err instanceof Error ? err.message : String(err) });
      toast.error(t.settings.deleteAccountError);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const wearables = [
    { key: 'whoop' as const, label: 'Whoop', badge: { bg: 'bg-black', text: 'text-white', char: 'W' } },
    { key: 'oura' as const, label: 'Oura Ring', badge: { bg: 'bg-white', text: 'text-black', char: 'O' } },
    { key: 'garmin' as const, label: 'Garmin Connect', badge: { bg: 'bg-blue-500', text: 'text-white', char: 'G' } },
  ];

  return (
    <>
      {/* AI Coach Settings */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
          <Heading level="h3">{t.settings.aiAssistant}</Heading>
        </div>
        <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
          <div className="flex flex-col">
            <Heading level="h4">{t.settings.aiFloatingBtn}</Heading>
            <Text variant="micro" className="mt-1">
              {showAIBot ? t.settings.aiVisibleAll : t.settings.aiHidden}
            </Text>
          </div>
          <Switch checked={!!showAIBot} onCheckedChange={(v) => setShowAIBot && setShowAIBot(v)} />
        </div>
      </div>

      {/* Wearable Integrations */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <Smartphone className="w-6 h-6 text-primary" aria-hidden="true" />
          <Heading level="h3">{t.settings.connectedDevices}</Heading>
        </div>
        <div className="space-y-4">
          {wearables.map(({ key, label, badge }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${badge.bg} flex items-center justify-center ${badge.text} font-bold text-xs`} aria-hidden="true">{badge.char}</div>
                <div>
                  <Heading level="h4">{label}</Heading>
                  <Text variant="micro" className={connectedDevices[key] ? 'text-primary' : ''}>
                    {connectedDevices[key] ? t.settings.connected : t.settings.notConnected}
                  </Text>
                </div>
              </div>
              <Switch checked={connectedDevices[key]} onCheckedChange={() => toggleDevice(key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications & Privacy */}
      <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 p-5 space-y-4">
        <Heading level="h3" variant="overline">{t.settings.notificationsPrivacy}</Heading>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
            <span className="text-sm font-body text-on-surface">{t.settings.notifications}</span>
          </div>
          <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
            <span className="text-sm font-body text-on-surface">{t.settings.publicProfile}</span>
          </div>
          <Switch checked={profilePublic} onCheckedChange={setProfilePublic} />
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 p-5 space-y-4">
        <Heading level="h3" variant="overline">{t.settings.dataSection}</Heading>
        <Button
          variant="ghost"
          onClick={exportCSV}
          className="w-full py-3 bg-surface-container-highest rounded-sm text-tertiary hover:bg-primary/10 hover:text-primary gap-2"
        >
          <Download className="w-4 h-4" aria-hidden="true" /> {t.settings.exportCSV}
        </Button>
        <button type="button"
          onClick={async () => {
            try {
              const json = await exportUserData();
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `rial-data-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success(t.settings.exportSuccess);
            } catch (error) {
              logger.warn('SettingsSystem JSON export failed', { error: error instanceof Error ? error.message : String(error) });
              toast.error(t.settings.exportError);
            }
          }}
          className="w-full py-3 bg-surface-container-highest rounded-sm font-headline text-xs font-bold uppercase tracking-widest text-tertiary hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-2">
          <Cloud className="w-4 h-4" aria-hidden="true" /> {t.settings.exportJSON}
        </button>
        <Button variant="destructive" onClick={() => setShowDeleteAllConfirm(true)} className="w-full">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" /> {t.settings.deleteData}
        </Button>
      </div>

      {/* Account */}
      {isSupabaseEnabled && (
        <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 p-5 space-y-3">
          <Heading level="h3" variant="overline">{t.settings.account}</Heading>
          {user ? (
            <>
              <p className="font-body text-xs text-on-surface-variant">{user.email}</p>
              <Button variant="outline" className="w-full"
                onClick={async () => {
                  await signOut();
                  toast.success(t.settings.signedOut);
                }}>
                <LogOut className="w-4 h-4" aria-hidden="true" /> {t.settings.signOut}
              </Button>
              <Button variant="destructive" className="w-full"
                onClick={() => setShowDeleteAccountConfirm(true)} disabled={isDeletingAccount}>
                <UserX className="w-4 h-4" aria-hidden="true" />
                {isDeletingAccount ? t.settings.deleteAccountDeleting : t.settings.deleteAccount}
              </Button>
            </>
          ) : (
            <p className="font-body text-sm text-on-surface-variant">{t.settings.notSignedIn}</p>
          )}
        </div>
      )}

      <ConfirmDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}
        title={t.settings.deleteData} description={t.settings.deleteConfirm}
        variant="destructive" onConfirm={deleteAllData} />

      <ConfirmDialog open={showDeleteAccountConfirm} onOpenChange={setShowDeleteAccountConfirm}
        title={t.settings.deleteAccountConfirmTitle} description={t.settings.deleteAccountConfirmBody}
        variant="destructive" onConfirm={handleDeleteAccount} />
    </>
  );
}
