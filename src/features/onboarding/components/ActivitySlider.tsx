/**
 * ActivitySlider — INDYA-style drag selector for daily activity level.
 *
 * Replaces the static RadioCardGroup in ActivityStep with a continuous
 * slider that shows the label + description dynamically as the user drags.
 * Four positions map 1:1 to the ActivityLevel union in nutrition.ts.
 *
 * Accessibility:
 *   - The native <input type="range"> carries keyboard (arrow keys) and
 *     screen-reader semantics automatically.
 *   - `aria-valuetext` announces the label string (not just the numeric index).
 *   - The example text is linked via `aria-describedby`.
 */
import { useId } from 'react';

import { Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

import { ACTIVITY_LEVELS } from '../state/taxonomies';

import type { ActivityLevel } from '../../food/utils/nutrition';

function valueToActivity(v: number): ActivityLevel {
  return ACTIVITY_LEVELS[Math.max(0, Math.min(3, Math.round(v)))] ?? 'sedentary';
}

function activityToValue(a: ActivityLevel | ''): number {
  if (a === '') return 1; // default visual position: "light"
  const idx = ACTIVITY_LEVELS.indexOf(a as ActivityLevel);
  return idx >= 0 ? idx : 1;
}

interface ActivitySliderProps {
  value: ActivityLevel | '';
  onChange: (level: ActivityLevel) => void;
  ariaLabel: string;
}

export default function ActivitySlider({ value, onChange, ariaLabel }: ActivitySliderProps) {
  const { t } = useI18n();
  const copy = t.onboarding.activity.options;
  const descId = useId();

  const numValue = activityToValue(value);
  const currentLevel = valueToActivity(numValue);
  const currentCopy = copy[currentLevel];

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const level = valueToActivity(Number(e.target.value));
    onChange(level);
  }

  return (
    <div className="w-full space-y-5">
      {/* Dynamic label area — changes as the user drags. No min-height: lets
          longer examples wrap freely without clipping on narrow viewports. */}
      <div className="text-center flex flex-col items-center gap-1 px-2 transition-all duration-200">
        <Text variant="body-lg" className="font-semibold text-on-surface">
          {currentCopy.label}
        </Text>
        <Text variant="body-sm" className="text-on-surface-variant">
          {currentCopy.desc}
        </Text>
        <Text
          id={descId}
          variant="caption"
          className="text-on-surface-variant/70 italic mt-0.5 text-balance"
        >
          {currentCopy.example}
        </Text>
      </div>

      {/* Slider track */}
      <div className="px-2">
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={numValue}
          onChange={handleChange}
          aria-label={ariaLabel}
          aria-valuetext={currentCopy.label}
          aria-describedby={descId}
          className={[
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            'bg-outline-variant/30',
            // Thumb — Tailwind JIT can't generate range-specific pseudo styles;
            // the accent-primary token drives the browser-native thumb color.
            'accent-[var(--color-primary)]',
            // Focus-visible ring via outline (browser handles the rest).
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-primary focus-visible:ring-offset-2',
          ].join(' ')}
        />

        {/* Tick labels */}
        <div className="flex justify-between mt-2 px-px" aria-hidden="true">
          {ACTIVITY_LEVELS.map(level => (
            <button
              key={level}
              type="button"
              tabIndex={-1}
              onClick={() => onChange(level)}
              className={[
                'flex flex-col items-center gap-0.5 w-1/4 text-center transition-colors duration-150',
                level === currentLevel ? 'text-primary' : 'text-on-surface-variant/50',
              ].join(' ')}
            >
              {/* Tick mark */}
              <span
                className={[
                  'block w-px h-2 rounded-full mx-auto',
                  level === currentLevel ? 'bg-primary' : 'bg-outline-variant/40',
                ].join(' ')}
              />
              <Text variant="caption" as="span" className="leading-tight font-medium">
                {copy[level].label}
              </Text>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
