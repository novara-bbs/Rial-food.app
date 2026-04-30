/**
 * HealthSyncCard — inline toggle to connect Apple Health / Health Connect
 * within the BodyStep (INDYA pattern: IMG_1205/1206).
 *
 * Shows only when useHealthData().available is true (native build with the
 * health plugin installed, or dev mock ?onb-health-mock=on). Hidden on web/PWA.
 *
 * Tapping the toggle → enable() → pre-fills weight, height, age, sex in the
 * reducer draft. The user can still override the values manually after sync.
 * Tapping the (i) info button → opens a BottomSheet with a plain-language
 * privacy explanation.
 */
import { Info } from 'lucide-react';
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';

import SectionCard from '@/components/SectionCard';
import BottomSheet from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

interface HealthSyncCardProps {
  enabled: boolean;
  loading: boolean;
  onEnable: () => void;
  onDisable: () => void;
}

/** Detect platform label for copy interpolation. */
function getServiceName(appleLabel: string, androidLabel: string): string {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform() === 'ios' ? appleLabel : androidLabel;
  }
  // Dev mock — default to Apple label for visual parity.
  return appleLabel;
}

export default function HealthSyncCard({
  enabled,
  loading,
  onEnable,
  onDisable,
}: HealthSyncCardProps) {
  const { t } = useI18n();
  const copy = t.onboarding.body.healthSync;
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const service = getServiceName(copy.appleLabel, copy.androidLabel);
  const hint = enabled
    ? copy.onConfirmation.replace('{service}', service)
    : copy.offHint;

  function handleToggle() {
    if (enabled) {
      onDisable();
    } else {
      onEnable();
    }
  }

  return (
    <>
      <SectionCard padding="md" spacing="none">
        <div className="flex items-center gap-3">
          {/* Service label + hint */}
          <div className="flex-1 min-w-0">
            <Text variant="body-sm" className="font-medium text-on-surface truncate">
              {service}
            </Text>
            <Text variant="caption" className="text-on-surface-variant line-clamp-1">
              {hint}
            </Text>
          </div>

          {/* Info button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-on-surface-variant"
            onClick={() => setPrivacyOpen(true)}
            aria-label={copy.privacyTitle}
          >
            <Info className="size-4" aria-hidden="true" />
          </Button>

          {/* Toggle switch — implemented as an accessible button with
              role="switch" since the project doesn't have a Switch primitive. */}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={service}
            disabled={loading}
            onClick={handleToggle}
            className={[
              'relative shrink-0 h-6 w-11 rounded-full transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              enabled ? 'bg-primary' : 'bg-outline-variant/40',
              loading ? 'opacity-50 cursor-wait' : 'cursor-pointer',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-elev-1 transition-transform duration-200',
                enabled ? 'translate-x-5' : 'translate-x-0',
              ].join(' ')}
              aria-hidden="true"
            />
          </button>
        </div>
      </SectionCard>

      {/* Privacy explanation sheet */}
      <BottomSheet
        open={privacyOpen}
        onOpenChange={setPrivacyOpen}
        title={copy.privacyTitle}
        size="compact"
        footer={
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => setPrivacyOpen(false)}
          >
            {copy.privacyAction}
          </Button>
        }
      >
        <div className="px-4 py-4">
          {copy.privacyBody.split('\n').map((line, i) => (
            <Text
              key={i}
              variant="body-sm"
              className={line === '' ? 'block h-3' : 'block'}
            >
              {line}
            </Text>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
