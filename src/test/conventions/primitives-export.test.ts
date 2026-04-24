/**
 * Primitive exports — ADR-001.
 *
 * Locks the shape of the canonical design-system primitives. If one of these
 * imports breaks (rename, default-export change, missing file), this test
 * fails loudly — giving a fast signal to update callers and docs.
 *
 * This is a convention test, not a runtime test. It only asserts that the
 * named primitives can be imported and are truthy.
 */
import { describe, it, expect } from 'vitest';

import PageShell from '@/components/PageShell';
import SectionCard from '@/components/SectionCard';
import StatTile from '@/components/StatTile';
import SegmentedTabs from '@/components/SegmentedTabs';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import GlobalHeader from '@/components/GlobalHeader';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/patterns/PageHeader';
import TabNav from '@/components/patterns/TabNav';
import ChipRow from '@/components/patterns/ChipRow';
import FilterRow from '@/components/patterns/FilterRow';
import SearchInput from '@/components/patterns/SearchInput';
import SortControl from '@/components/patterns/SortControl';
import Sparkline from '@/components/Sparkline';
import DayGridCalendar from '@/components/DayGridCalendar';
import OnboardingScaffold from '@/components/OnboardingScaffold';
import RadioCardGroup from '@/components/RadioCardGroup';
import SelectList from '@/components/SelectList';
import FamilyCard from '@/features/food/components/FamilyCard';
import VariantRow from '@/features/food/components/VariantRow';
import MacroDelta from '@/features/food/components/MacroDelta';
import TimeTileComposite from '@/features/recipes/components/TimeTileComposite';
import AuthorAttributionCard from '@/features/recipes/components/AuthorAttributionCard';
import StickyCookCTA from '@/features/recipes/components/StickyCookCTA';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import BottomSheet from '@/components/ui/bottom-sheet';

describe('Primitives — canonical exports (ADR-001)', () => {
  it('exports the screen shells', () => {
    expect(PageShell).toBeTruthy();
    expect(PageHeader).toBeTruthy();
  });

  it('exports the surface + metric primitives', () => {
    expect(SectionCard).toBeTruthy();
    expect(StatTile).toBeTruthy();
    expect(SegmentedTabs).toBeTruthy();
    expect(EmptyState).toBeTruthy();
  });

  it('exports the filter primitives (ADR-013)', () => {
    expect(TabNav).toBeTruthy();
    expect(ChipRow).toBeTruthy();
    expect(FilterRow).toBeTruthy(); // shim — kept until next cleanup sprint
    expect(SearchInput).toBeTruthy();
    expect(SortControl).toBeTruthy();
  });

  it('exports the nav + chrome primitives', () => {
    expect(GlobalHeader).toBeTruthy();
    expect(BottomNav).toBeTruthy();
  });

  it('exports the data-viz primitives', () => {
    expect(Sparkline).toBeTruthy();
    expect(DayGridCalendar).toBeTruthy();
  });

  it('exports the dialog primitives (shadcn + confirm)', () => {
    expect(ConfirmDialog).toBeTruthy();
    expect(Dialog).toBeTruthy();
    expect(DialogContent).toBeTruthy();
    expect(DialogHeader).toBeTruthy();
    expect(DialogTitle).toBeTruthy();
    expect(Sheet).toBeTruthy();
    expect(SheetContent).toBeTruthy();
    expect(BottomSheet).toBeTruthy();
  });

  it('exports the Button primitive (shadcn, skinned)', () => {
    expect(Button).toBeTruthy();
  });

  it('exports the onboarding primitives (PR 9, §4.11)', () => {
    expect(OnboardingScaffold).toBeTruthy();
    expect(RadioCardGroup).toBeTruthy();
    expect(SelectList).toBeTruthy();
  });

  it('exports the food-family primary-view primitives (P2)', () => {
    expect(FamilyCard).toBeTruthy();
    expect(VariantRow).toBeTruthy();
    expect(MacroDelta).toBeTruthy();
  });

  it('exports the recipe editorial primitives (R2.2)', () => {
    expect(TimeTileComposite).toBeTruthy();
    expect(AuthorAttributionCard).toBeTruthy();
    expect(StickyCookCTA).toBeTruthy();
  });
});
