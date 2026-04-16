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
import Sparkline from '@/components/Sparkline';
import DayGridCalendar from '@/components/DayGridCalendar';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
  });

  it('exports the Button primitive (shadcn, skinned)', () => {
    expect(Button).toBeTruthy();
  });
});
