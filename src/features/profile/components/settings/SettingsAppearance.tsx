import { Palette, Moon, Sun, Check, Globe, Scale } from 'lucide-react';
import { useTheme, type Theme } from '../../../../contexts/ThemeContext';
import { useI18n, type Locale } from '../../../../i18n';

interface Props {
  userProfile: any;
  setUserProfile: any;
}

export default function SettingsAppearance({ userProfile, setUserProfile }: Props) {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();

  const themes = [
    { id: 'dark', family: 'VOLT', mode: 'dark', modeLabel: t.settings.themeNight, primary: '#dcfd05', bg: '#09090b', surface: '#18181b', text: '#ffffff', textMuted: '#a1a1aa' },
    { id: 'light', family: 'VOLT', mode: 'light', modeLabel: t.settings.themeDay, primary: '#09090b', bg: '#ffffff', surface: '#f4f4f5', text: '#09090b', textMuted: '#71717a' },
    { id: 'blue-dark', family: 'OCEAN', mode: 'dark', modeLabel: t.settings.themeNight, primary: '#38bdf8', bg: '#020617', surface: '#0f172a', text: '#f0f9ff', textMuted: '#94a3b8' },
    { id: 'blue-light', family: 'OCEAN', mode: 'light', modeLabel: t.settings.themeDay, primary: '#0284c7', bg: '#f8fafc', surface: '#f1f5f9', text: '#0f172a', textMuted: '#64748b' },
    { id: 'orange-dark', family: 'EMBER', mode: 'dark', modeLabel: t.settings.themeNight, primary: '#fdac6c', bg: '#0c0a09', surface: '#1c1917', text: '#ffffff', textMuted: '#a8a29e' },
    { id: 'orange-light', family: 'EMBER', mode: 'light', modeLabel: t.settings.themeDay, primary: '#ea580c', bg: '#fafaf9', surface: '#f5f5f4', text: '#292524', textMuted: '#78716c' },
  ];

  return (
    <>
      {/* Appearance */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-primary" />
          <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.appearance}</h3>
        </div>
        <div className="space-y-4">
          {(['VOLT', 'OCEAN', 'EMBER'] as const).map((family) => {
            const pair = themes.filter((th) => th.family === family);
            return (
              <div key={family}>
                <span className="font-mono text-[9px] tracking-[0.3em] text-on-surface-variant uppercase block mb-2">{family}</span>
                <div className="grid grid-cols-2 gap-3">
                  {pair.map((th) => (
                    <button type="button" key={th.id}
                      onClick={() => setTheme(th.id as Theme)}
                      className={`relative rounded-sm overflow-hidden border transition-all text-left ${
                        theme === th.id ? 'border-primary ring-1 ring-primary' : 'border-outline-variant/30 hover:border-outline-variant/60'
                      }`}
                      style={{ backgroundColor: th.bg }}>
                      <div className="p-2.5">
                        <div className="flex items-center gap-1 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: th.primary }} />
                          <div className="h-1.5 rounded flex-1" style={{ backgroundColor: th.textMuted, opacity: 0.4 }} />
                        </div>
                        <div className="rounded p-1.5 mb-1.5" style={{ backgroundColor: th.surface }}>
                          <div className="h-1.5 rounded mb-1" style={{ backgroundColor: th.text, opacity: 0.8, width: '70%' }} />
                          <div className="h-1 rounded" style={{ backgroundColor: th.textMuted, opacity: 0.5, width: '90%' }} />
                        </div>
                        <div className="rounded px-2 py-1 text-center" style={{ backgroundColor: th.primary }}>
                          <div className="h-1.5 rounded mx-auto" style={{ backgroundColor: th.bg, width: '60%', opacity: 0.9 }} />
                        </div>
                      </div>
                      <div className="px-2.5 pb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {th.mode === 'light' ? <Sun className="w-3 h-3" style={{ color: th.textMuted }} /> : <Moon className="w-3 h-3" style={{ color: th.textMuted }} />}
                          <span className="font-headline font-bold text-[9px] uppercase tracking-widest" style={{ color: th.text }}>{th.modeLabel}</span>
                        </div>
                        {theme === th.id && (
                          <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: th.primary }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.bg }} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-primary" />
          <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.language}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {([
            { id: 'es' as Locale, label: 'Español', flag: '🇪🇸' },
            { id: 'en' as Locale, label: 'English', flag: '🇬🇧' },
          ]).map((lang) => (
            <button type="button" key={lang.id}
              onClick={() => setLocale(lang.id)}
              className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all ${
                locale === lang.id ? 'border-primary bg-primary/10' : 'border-outline-variant/30 hover:border-outline-variant'
              }`}>
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-headline font-bold text-sm text-tertiary uppercase">{lang.label}</span>
              {locale === lang.id && <Check className="w-5 h-5 text-primary ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Unit System */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.unitSystem}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{t.settings.unitSystemDesc}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {([
            { id: 'metric' as const, label: t.settings.metric, desc: t.settings.metricDesc },
            { id: 'imperial' as const, label: t.settings.imperial, desc: t.settings.imperialDesc },
          ]).map((sys) => (
            <button type="button" key={sys.id}
              onClick={() => setUserProfile && setUserProfile((prev: any) => ({ ...prev, unitSystem: sys.id }))}
              className={`flex flex-col items-start p-4 rounded-sm border-2 transition-all ${
                (userProfile?.unitSystem ?? 'metric') === sys.id ? 'border-primary bg-primary/10' : 'border-outline-variant/30 hover:border-outline-variant'
              }`}>
              <div className="flex items-center justify-between w-full">
                <span className="font-headline font-bold text-sm text-tertiary uppercase">{sys.label}</span>
                {(userProfile?.unitSystem ?? 'metric') === sys.id && <Check className="w-5 h-5 text-primary" />}
              </div>
              <span className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant mt-1">{sys.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
