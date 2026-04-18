import { useState } from 'react';
import { Users, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PageShell from '../../../components/PageShell';
import SegmentedTabs from '../../../components/SegmentedTabs';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import type { Ingredient } from '../../../types';
import SettingsProfile from '../components/settings/SettingsProfile';
import SettingsNutrition from '../components/settings/SettingsNutrition';
import SettingsAppearance from '../components/settings/SettingsAppearance';
import SettingsSystem from '../components/settings/SettingsSystem';
import DemoSeedCard from '../../dev/components/DemoSeedCard';
import SectionCard from '../../../components/SectionCard';

type SettingsTab = 'profile' | 'nutrition' | 'appearance' | 'system';

const PERSONA_OPTIONS = [
  { id: 'clara-cut' as const, key: 'demoClara' as const },
  { id: 'marcos-muscle' as const, key: 'demoMarcos' as const },
  { id: 'ana-health' as const, key: 'demoAna' as const },
] as const;

export default function Settings({
  dailyMacros,
  setDailyMacros,
  isPro,
  setIsPro,
  showAIBot,
  setShowAIBot,
  userProfile,
  setUserProfile,
  dictionary = [],
  hydration,
  setHydration,
  movement,
  setMovement,
}: {
  dailyMacros?: any;
  setDailyMacros?: any;
  isPro?: boolean;
  setIsPro?: any;
  showAIBot?: boolean;
  setShowAIBot?: any;
  userProfile?: any;
  setUserProfile?: any;
  dictionary?: Ingredient[];
  hydration?: { consumed: number; target: number };
  setHydration?: (fn: any) => void;
  movement?: { steps: number; target: number; activeMinutes: number; activeTarget: number };
  setMovement?: (fn: any) => void;
}) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const isDev = (import.meta as any).env?.DEV === true;

  const tabs = [
    { id: 'profile' as const, label: t.settings.tabProfile },
    { id: 'nutrition' as const, label: t.settings.tabNutrition },
    { id: 'appearance' as const, label: t.settings.tabAppearance },
    { id: 'system' as const, label: t.settings.tabSystem },
  ];

  const handleLoadPersona = async (id: 'clara-cut' | 'marcos-muscle' | 'ana-health') => {
    if (loadingPersona) return;
    setLoadingPersona(id);
    try {
      const { loadDemoPersona } = await import('../handlers/demo-persona-handlers');
      toast.success(t.settings.demoLoaded);
      await loadDemoPersona(id);
    } catch {
      toast.error('Error loading persona');
      setLoadingPersona(null);
    }
  };

  const handleClearPersona = async () => {
    if (loadingPersona) return;
    setLoadingPersona('clear');
    const { clearDemoData } = await import('../handlers/demo-persona-handlers');
    toast.success(t.settings.demoCleared);
    clearDemoData();
  };

  return (
    <PageShell maxWidth="default" spacing="lg">
      <section className="space-y-6">
        <span className="font-label text-xs tracking-[0.2em] text-primary uppercase mb-1 block">{t.settings.title}</span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary mb-6">{t.settings.title}</h2>

        <SegmentedTabs
          options={tabs}
          value={activeTab}
          onChange={setActiveTab}
          size="sm"
          ariaLabel={t.settings.tabsAria}
        />

        {activeTab === 'profile' && (
          <SettingsProfile
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setDailyMacros={setDailyMacros}
            isPro={!!isPro}
            setIsPro={setIsPro}
          />
        )}

        {activeTab === 'nutrition' && (
          <SettingsNutrition
            dailyMacros={dailyMacros}
            setDailyMacros={setDailyMacros}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            dictionary={dictionary}
            hydration={hydration}
            setHydration={setHydration}
            movement={movement}
            setMovement={setMovement}
          />
        )}

        {activeTab === 'appearance' && (
          <SettingsAppearance
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        )}

        {activeTab === 'system' && (
          <>
            <SettingsSystem
              showAIBot={!!showAIBot}
              setShowAIBot={setShowAIBot}
            />

            {/* Dev-only demo seed utility — hidden on prod builds (reveal via long-press avatar). */}
            <DemoSeedCard />

            {/* Q14 — Multi-ICP persona selector */}
            {isDev && (
              <SectionCard
                icon={<Users className="w-4 h-4 text-brand-secondary" aria-hidden="true" />}
                title={t.settings.developer}
              >
                <p className="text-micro text-on-surface-variant mb-3">{t.settings.loadDemoPersona}</p>
                <div className="space-y-2">
                  {PERSONA_OPTIONS.map(({ id, key }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleLoadPersona(id)}
                      disabled={!!loadingPersona}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-container-highest border border-outline-variant/20 rounded-sm text-left hover:border-primary/50 transition-colors disabled:opacity-50"
                    >
                      <span className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary">
                        {t.settings[key]}
                      </span>
                      {loadingPersona === id && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearPersona}
                    disabled={!!loadingPersona}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-error text-micro font-bold uppercase tracking-widest hover:bg-error/5 rounded-sm transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                    {t.settings.clearDemoData}
                  </button>
                </div>
              </SectionCard>
            )}
          </>
        )}
      </section>

      {/* Legal footer */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-outline-variant/10">
        <button
          type="button"
          onClick={() => navigateTo('privacy-policy')}
          className="font-label text-micro uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors"
        >
          {t.legal.privacyLink}
        </button>
        <span className="text-outline-variant/40">·</span>
        <button
          type="button"
          onClick={() => navigateTo('terms-of-service')}
          className="font-label text-micro uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors"
        >
          {t.legal.termsLink}
        </button>
        <span className="text-outline-variant/40">·</span>
        <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant/40">v1.5.0</span>
      </div>
    </PageShell>
  );
}
