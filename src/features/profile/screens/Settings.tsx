import PageShell from '../../../components/PageShell';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import type { Ingredient } from '../../../types';
import SettingsProfile from '../components/settings/SettingsProfile';
import SettingsNutrition from '../components/settings/SettingsNutrition';
import SettingsAppearance from '../components/settings/SettingsAppearance';
import SettingsSystem from '../components/settings/SettingsSystem';

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
}) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();

  return (
    <PageShell maxWidth="default" spacing="lg">
      <section className="space-y-6">
        <span className="font-label text-xs tracking-[0.2em] text-primary uppercase mb-1 block">{t.settings.title}</span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary mb-6">{t.settings.title}</h2>

        <SettingsProfile
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          setDailyMacros={setDailyMacros}
          isPro={!!isPro}
          setIsPro={setIsPro}
        />

        <SettingsNutrition
          dailyMacros={dailyMacros}
          setDailyMacros={setDailyMacros}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          dictionary={dictionary}
        />

        <SettingsAppearance
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />

        <SettingsSystem
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          showAIBot={!!showAIBot}
          setShowAIBot={setShowAIBot}
        />
      </section>

      {/* Legal footer */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-outline-variant/10">
        <button
          type="button"
          onClick={() => navigateTo('privacy-policy')}
          className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors"
        >
          {t.legal.privacyLink}
        </button>
        <span className="text-outline-variant/40">·</span>
        <button
          type="button"
          onClick={() => navigateTo('terms-of-service')}
          className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors"
        >
          {t.legal.termsLink}
        </button>
        <span className="text-outline-variant/40">·</span>
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40">v1.5.0</span>
      </div>
    </PageShell>
  );
}
