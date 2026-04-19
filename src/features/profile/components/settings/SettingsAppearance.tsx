import { Palette, Moon, Sun, Check, Globe, Scale, Monitor } from 'lucide-react';
import { useTheme, type Palette as PaletteId, type ColorMode } from '../../../../contexts/ThemeContext';
import { useI18n, type Locale } from '../../../../i18n';

interface Props {
  userProfile: any;
  setUserProfile: any;
}

interface PaletteSwatch {
  id: PaletteId;
  label: string;
  desc: string;
  dark: { primary: string; bg: string; surface: string; text: string; textMuted: string };
  light: { primary: string; bg: string; surface: string; text: string; textMuted: string };
}

export default function SettingsAppearance({ userProfile, setUserProfile }: Props) {
  const { palette, mode, resolvedMode, setPalette, setMode } = useTheme();
  const { t, locale, setLocale } = useI18n();

  const palettes: PaletteSwatch[] = [
    {
      id: 'neutral',
      label: t.settings.paletteNeutral,
      desc: t.settings.paletteNeutralDesc,
      dark: { primary: '#fafafa', bg: '#0a0a0b', surface: '#18181b', text: '#fafafa', textMuted: '#a1a1aa' },
      light: { primary: '#09090b', bg: '#fafaf9', surface: '#ffffff', text: '#09090b', textMuted: '#404040' },
    },
    {
      id: 'volt',
      label: t.settings.paletteVolt,
      desc: t.settings.paletteVoltDesc,
      dark: { primary: '#dcfd05', bg: '#09090b', surface: '#18181b', text: '#fafafa', textMuted: '#a1a1aa' },
      light: { primary: '#65a30d', bg: '#faf9f6', surface: '#ffffff', text: '#09090b', textMuted: '#4a4945' },
    },
    {
      id: 'ocean',
      label: t.settings.paletteOcean,
      desc: t.settings.paletteOceanDesc,
      dark: { primary: '#38bdf8', bg: '#020617', surface: '#0f172a', text: '#f8fafc', textMuted: '#94a3b8' },
      light: { primary: '#0284c7', bg: '#f8fafc', surface: '#ffffff', text: '#0f172a', textMuted: '#1e293b' },
    },
    {
      id: 'ember',
      label: t.settings.paletteEmber,
      desc: t.settings.paletteEmberDesc,
      dark: { primary: '#fdac6c', bg: '#0c0a09', surface: '#1c1917', text: '#fafaf9', textMuted: '#a8a29e' },
      light: { primary: '#ea580c', bg: '#fafaf9', surface: '#ffffff', text: '#1c1917', textMuted: '#292524' },
    },
  ];

  const modes: Array<{ id: ColorMode; label: string; icon: React.ReactNode }> = [
    { id: 'auto', label: t.settings.modeAuto, icon: <Monitor className="w-4 h-4" aria-hidden="true" /> },
    { id: 'light', label: t.settings.modeLight, icon: <Sun className="w-4 h-4" aria-hidden="true" /> },
    { id: 'dark', label: t.settings.modeDark, icon: <Moon className="w-4 h-4" aria-hidden="true" /> },
  ];

  return (
    <>
      {/* Appearance — palette + mode */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-primary" />
          <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.appearance}</h3>
        </div>

        {/* Palette */}
        <div className="mb-6">
          <span className="font-mono text-micro tracking-[0.3em] text-on-surface-variant uppercase block mb-3">
            {t.settings.palette}
          </span>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t.settings.palette}>
            {palettes.map((p) => {
              const selected = palette === p.id;
              const swatch = resolvedMode === 'dark' ? p.dark : p.light;
              return (
                <button
                  type="button"
                  key={p.id}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPalette(p.id)}
                  className={`relative rounded-sm overflow-hidden border transition-all text-left min-h-[120px] ${
                    selected
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-outline-variant/30 hover:border-outline-variant/60'
                  }`}
                  style={{ backgroundColor: swatch.bg }}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: swatch.primary }} />
                      <div className="h-1.5 rounded flex-1" style={{ backgroundColor: swatch.textMuted, opacity: 0.4 }} />
                    </div>
                    <div className="rounded p-2 mb-2" style={{ backgroundColor: swatch.surface }}>
                      <div className="h-1.5 rounded mb-1" style={{ backgroundColor: swatch.text, opacity: 0.85, width: '70%' }} />
                      <div className="h-1 rounded" style={{ backgroundColor: swatch.textMuted, opacity: 0.5, width: '90%' }} />
                    </div>
                    <div className="rounded px-2 py-1 text-center" style={{ backgroundColor: swatch.primary }}>
                      <div className="h-1.5 rounded mx-auto" style={{ backgroundColor: swatch.bg, width: '60%', opacity: 0.9 }} />
                    </div>
                  </div>
                  <div className="px-3 pb-3 flex items-center justify-between">
                    <span
                      className="font-headline font-bold text-label uppercase tracking-widest"
                      style={{ color: swatch.text }}
                    >
                      {p.label}
                    </span>
                    {selected && (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: swatch.primary }}
                      >
                        <Check className="w-2.5 h-2.5" style={{ color: swatch.bg }} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode */}
        <div>
          <span className="font-mono text-micro tracking-[0.3em] text-on-surface-variant uppercase block mb-3">
            {t.settings.appearance}
          </span>
          <div
            className="inline-flex w-full rounded-sm border border-outline-variant/30 p-1 bg-surface-container"
            role="radiogroup"
            aria-label={t.settings.appearance}
          >
            {modes.map((m) => {
              const selected = mode === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMode(m.id)}
                  className={`flex-1 min-h-11 flex items-center justify-center gap-2 rounded-sm font-headline font-bold text-label uppercase tracking-widest transition-all ${
                    selected
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:text-tertiary'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
          {mode === 'auto' && (
            <p className="text-micro font-body text-on-surface-variant mt-2">{t.settings.modeAutoHint}</p>
          )}
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
              <span className="text-micro font-label tracking-widest uppercase text-on-surface-variant mt-1">{sys.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
