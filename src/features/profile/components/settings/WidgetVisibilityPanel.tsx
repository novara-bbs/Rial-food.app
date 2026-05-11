/**
 * WidgetVisibilityPanel — Sprint E [1.5.219] Phase 5.
 *
 * Collapsible panel for per-section detail tier configuration. Renders a
 * 3-tier selector (simple / standard / advanced) for each app section.
 *
 * Design principles (ADR-001 / token-pure):
 * - Uses SectionCard as the outer container (no ad-hoc shadow/border).
 * - All spacing, colours, and typography via design tokens.
 * - Actions delegate to `preferencesActions` from `useAppState()` —
 *   zero local state for the tier values themselves.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionCard from '../../../../components/SectionCard';
import { Text } from '@/components/ui/Typography';
import { useI18n } from '../../../../i18n';
import { useAppState } from '../../../../contexts/AppStateContext';
import { SECTIONS, DETAIL_TIERS } from '../../../../types/preferences';
import { getTierForSection } from '../../../../lib/widget-visibility';
import type { Section, DetailTier } from '../../../../types/preferences';

// ─── Component ────────────────────────────────────────────────────────────────

export default function WidgetVisibilityPanel() {
  const { t } = useI18n();
  const { preferences, preferencesActions } = useAppState();
  const [expanded, setExpanded] = useState(false);

  const handleSetAll = (tier: DetailTier) => {
    for (const section of SECTIONS) {
      preferencesActions.setTier(section, tier);
    }
  };

  const handleReset = () => {
    preferencesActions.resetPreferences();
  };

  return (
    <SectionCard
      title={t.preferences.panelToggle}
      action={
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-label={t.preferences.panelToggle}
          className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      }
    >
      {!expanded ? (
        <Text variant="body-sm" className="text-on-surface-variant">
          {t.preferences.sectionDesc}
        </Text>
      ) : (
        <div className="space-y-4">
          <Text variant="body-sm" className="text-on-surface-variant">
            {t.preferences.sectionDesc}
          </Text>

          {/* Apply-to-all row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Text variant="body-sm" className="text-on-surface-variant shrink-0">
              {t.preferences.applyToAll}:
            </Text>
            {DETAIL_TIERS.map(tier => (
              <Button
                key={tier}
                variant="outline"
                size="sm"
                onClick={() => handleSetAll(tier)}
              >
                {t.preferences.tiers[tier]}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="ml-auto text-on-surface-variant"
            >
              {t.preferences.reset}
            </Button>
          </div>

          {/* Per-section rows */}
          <div className="divide-y divide-outline-variant/10 -mx-4 px-4">
            {(SECTIONS as readonly Section[]).map(section => {
              const currentTier = getTierForSection(preferences, section);
              const label = t.preferences.sections[section];
              return (
                <div
                  key={section}
                  className="flex items-center justify-between py-3 gap-3"
                  data-testid={`tier-row-${section}`}
                >
                  <Text variant="body-sm" as="span" className="font-medium text-on-surface shrink">
                    {label}
                  </Text>
                  <div
                    role="group"
                    aria-label={label}
                    className="flex bg-surface-container-low rounded-full p-0.5 border border-outline-variant/20 shrink-0"
                  >
                    {DETAIL_TIERS.map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => preferencesActions.setTier(section, tier)}
                        aria-pressed={currentTier === tier}
                        className={`inline-flex items-center min-h-7 px-3 py-1 rounded-full text-micro font-medium transition-all ${
                          currentTier === tier
                            ? 'bg-primary text-on-primary shadow-elev-1'
                            : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        {t.preferences.tiers[tier]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
