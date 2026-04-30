/**
 * NumberStepper — large-tap numeric input.
 *
 * Replaces raw `<input type="number">` in onboarding so:
 *  - the tap target meets ADR-003 (≥ 44×44 px on the +/– buttons).
 *  - the value can be clamped to a sensible range without bouncing the user.
 *  - the visual treatment matches the rest of the onboarding (token-pure).
 *
 * The center display is a real `<input inputMode="decimal">` so iOS / Android
 * raise a numeric keypad. Direct typing is allowed; on `blur` the value is
 * clamped + rounded to the nearest `step`. Pressing +/– snaps to the step
 * grid and respects the [min, max] bounds.
 */
import { Minus, Plus } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from 'react';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/Typography';

interface NumberStepperProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Suffix shown next to the value (e.g. "kg", "cm", "años"). */
  unit?: string;
  /** True when validator flagged this field — pulls border + adds aria-invalid. */
  invalid?: boolean;
  /** Inline error key, rendered next to the field. Already localized. */
  errorMessage?: string;
  /** Decimal places allowed (0 = integers). Default 0. */
  precision?: number;
  /**
   * Seed value used when the user presses +/– on a null field.
   * Falls back to `min` so the first interaction always produces a sane number
   * (avoids the `(min+max)/2` heuristic that gave 165 kg for weight).
   */
  defaultValue?: number;
  ariaDescribedBy?: string;
  className?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, precision: number): number {
  const f = 10 ** precision;
  return Math.round(value * f) / f;
}

export default function NumberStepper({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  invalid = false,
  errorMessage,
  precision = 0,
  defaultValue,
  ariaDescribedBy,
  className = '',
}: NumberStepperProps) {
  const labelId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const describedBy = [ariaDescribedBy, errorMessage ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  // Keep a local string mirror so the user can type freely without having
  // each keystroke bounce through clamp/round.
  const [draft, setDraft] = useState(() =>
    value === null ? '' : String(value),
  );

  // Re-sync if parent updates the value externally while the input is not
  // focused (e.g. reducer resets the field). useEffect avoids a state-setting
  // side-effect during render (flagged by React 19 strict-mode profiling).
  useEffect(() => {
    if (value !== null && document.activeElement !== inputRef.current) {
      setDraft(String(value));
    }
  }, [value]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDraft(raw);
      // Live-update the parent only when the input is currently a number;
      // empty string and partial inputs ("12.") wait until blur.
      const parsed = Number(raw);
      if (raw !== '' && Number.isFinite(parsed)) {
        onChange(round(clamp(parsed, min, max), precision));
      }
    },
    [onChange, min, max, precision],
  );

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '') return;
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) {
        setDraft(value === null ? '' : String(value));
        return;
      }
      const next = round(clamp(parsed, min, max), precision);
      onChange(next);
      setDraft(String(next));
    },
    [onChange, min, max, precision, value],
  );

  const adjust = useCallback(
    (delta: number) => {
      // When value is null (not yet set), seed from defaultValue or min.
      // Avoids the (min+max)/2 heuristic that yields absurd values like 165 kg.
      const base = value ?? defaultValue ?? min;
      const next = round(clamp(base + delta, min, max), precision);
      onChange(next);
      setDraft(String(next));
    },
    [value, defaultValue, onChange, min, max, precision],
  );

  return (
    <div className={['space-y-2', className].filter(Boolean).join(' ')}>
      <label
        id={labelId}
        className="block text-body-sm font-medium text-on-surface-variant"
      >
        {label}
      </label>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => adjust(-step)}
          aria-label={`${label} −`}
          disabled={value !== null && value <= min}
        >
          <Minus />
        </Button>

        <div
          className={[
            'flex-1 flex items-center justify-center gap-1.5 rounded-sm border px-3 h-11',
            invalid
              ? 'border-error bg-error/5'
              : 'border-outline-variant/30 bg-surface-container-low',
          ].join(' ')}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode={precision > 0 ? 'decimal' : 'numeric'}
            pattern={precision > 0 ? '[0-9]*[.,]?[0-9]*' : '[0-9]*'}
            value={draft}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-labelledby={labelId}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className="min-w-0 w-auto max-w-full bg-transparent text-center font-mono text-body-lg font-semibold tabular-nums text-on-surface outline-none placeholder:text-on-surface-variant/50"
            placeholder="—"
            size={4}
          />
          {unit && (
            <Text variant="body-sm" as="span" className="shrink-0 text-on-surface-variant">
              {unit}
            </Text>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => adjust(step)}
          aria-label={`${label} +`}
          disabled={value !== null && value >= max}
        >
          <Plus />
        </Button>
      </div>
      {errorMessage && (
        <Text variant="caption" id={errorId} className="text-error">
          {errorMessage}
        </Text>
      )}
    </div>
  );
}
