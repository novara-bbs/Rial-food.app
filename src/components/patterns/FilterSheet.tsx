import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import BottomSheet from '@/components/ui/bottom-sheet';
import ChipRow, { type ChipOption } from './ChipRow';
import { useI18n } from '../../i18n';
import { cn } from '@/lib/utils';
import type { FilterValues } from '../../features/recipes/utils/facets';

/**
 * FilterSheet — canonical "advanced filter panel" primitive (ADR-014).
 *
 * Wraps `<BottomSheet size="focus" headerLayout="cancel-action">` with:
 *   - A list of accordion sections (`<details>` native, instant collapse).
 *   - Per-section `<ChipRow>` rendered with the section's `mode`.
 *   - Buffered draft state — chip toggles update local draft, only `Apply`
 *     emits `onApply(draft)` to the parent. Cancel / X / swipe-down /
 *     backdrop discard the draft (radix Dialog default).
 *   - Reset link in the header clears the draft (does NOT auto-apply —
 *     user must click Apply to commit the cleared state).
 *
 * Designed for screens with 3+ facets (per ADR-014 decision tree). For
 * 0-2 facets, prefer inline `<ChipRow>` + `<SortControl>` (status quo).
 */

export interface FilterSection {
  /** Stable id, also used as the `FilterValues` key. */
  id: string;
  /** Pre-resolved i18n title (caller decides locale). */
  title: string;
  options: ChipOption[];
  mode: 'single' | 'multi';
  /** First-paint expansion. Default false except first section if none specified. */
  defaultExpanded?: boolean;
}

export interface FilterSheetProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  sections: FilterSection[];
  /** Controlled committed values from the parent. The sheet syncs its draft
   *  from this every time `open` flips to true. */
  values: FilterValues;
  /** Fired on Apply with the current draft. Parent updates state + sheet closes. */
  onApply: (next: FilterValues) => void;
  /** Optional analytics callback fired when user clicks Reset. Sheet stays open;
   *  draft is cleared so the user can review before pressing Apply. */
  onReset?: () => void;
  /** Title shown in the sticky header. Defaults to `t.filters.title`. */
  title?: string;
  /** Apply button label. Defaults to `t.filters.apply`. */
  applyLabel?: string;
  /** Reset link label. Defaults to `t.filters.reset`. */
  resetLabel?: string;
  /** Active count shown as pill in the header `actionSlot`. Hidden when 0. */
  activeCount?: number;
}

function getSectionCount(value: FilterValues[string]): number {
  if (Array.isArray(value)) return value.length;
  if (value === null || value === undefined || value === '' || value === 'all') return 0;
  return 1;
}

export default function FilterSheet({
  open,
  onOpenChange,
  sections,
  values,
  onApply,
  onReset,
  title,
  applyLabel,
  resetLabel,
  activeCount = 0,
}: FilterSheetProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<FilterValues>(values);

  // Sync draft from committed values every time the sheet opens. Closing
  // the sheet without pressing Apply discards in-flight edits naturally
  // because the next open will re-seed from `values`.
  useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  const setSectionValue = (id: string, next: FilterValues[string]) => {
    setDraft(prev => ({ ...prev, [id]: next }));
  };

  const handleReset = () => {
    setDraft({});
    onReset?.();
  };

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  const resolvedTitle = title ?? t.filters.title;
  const resolvedApply = applyLabel ?? t.filters.apply;
  const resolvedReset = resetLabel ?? t.filters.reset;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      size="focus"
      headerLayout="cancel-action"
      title={resolvedTitle}
      actionSlot={
        activeCount > 0 ? (
          <span
            data-filter-active-pill
            className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-primary text-on-primary font-headline text-micro font-bold"
            aria-label={`${activeCount} ${resolvedTitle}`}
          >
            {activeCount}
          </span>
        ) : undefined
      }
      footer={
        <button
          type="button"
          onClick={handleApply}
          className="w-full min-h-12 rounded-sm bg-primary text-on-primary font-headline text-body-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          {resolvedApply}
        </button>
      }
    >
      <div data-filter-sheet className="space-y-2 pb-2">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="font-label text-micro font-bold uppercase tracking-widest text-primary hover:underline px-2 py-1 -mr-2"
          >
            {resolvedReset}
          </button>
        </div>

        {sections.map((section, idx) => {
          const sectionValue = draft[section.id] ?? (section.mode === 'multi' ? [] : null);
          const sectionCount = getSectionCount(sectionValue);
          // First section opens by default unless caller overrides explicitly.
          const isFirst = idx === 0;
          const expanded = section.defaultExpanded ?? isFirst;

          return (
            <details
              key={section.id}
              open={expanded}
              data-filter-section={section.id}
              className="group rounded-sm border border-outline-variant/20 bg-surface-container-low overflow-hidden"
            >
              <summary
                className={cn(
                  'flex items-center justify-between px-4 py-3 cursor-pointer select-none',
                  'hover:bg-surface-container transition-colors',
                  // Hide native disclosure marker (Safari + Firefox).
                  '[&::-webkit-details-marker]:hidden [&::marker]:hidden',
                )}
              >
                <span className="flex items-center gap-2 font-headline text-body-sm font-bold uppercase tracking-tight text-tertiary">
                  {section.title}
                  {sectionCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary/15 text-primary font-label text-micro font-bold">
                      {sectionCount}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className="w-4 h-4 text-on-surface-variant transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>

              <div className="px-4 pb-4 pt-1">
                {section.mode === 'multi' ? (
                  <ChipRow
                    mode="multi"
                    options={section.options}
                    active={(Array.isArray(sectionValue) ? sectionValue : []) as string[]}
                    onChange={next => setSectionValue(section.id, next)}
                    ariaLabel={section.title}
                  />
                ) : (
                  <ChipRow
                    mode="single"
                    options={section.options}
                    active={(typeof sectionValue === 'string' ? sectionValue : null) as string | null}
                    onChange={next => setSectionValue(section.id, next)}
                    ariaLabel={section.title}
                  />
                )}
              </div>
            </details>
          );
        })}
      </div>
    </BottomSheet>
  );
}
