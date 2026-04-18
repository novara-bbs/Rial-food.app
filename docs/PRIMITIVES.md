# RIAL Primitives Index

Canonical components. Reach for these **before** writing JSX from scratch.

> **Rule (ADR-001).** If a primitive covers your case, using raw divs instead is a PR blocker. ESLint rejects the known anti-patterns.

---

## 1. Table of primitives

| Primitive | File | When to use | When NOT |
|---|---|---|---|
| `PageShell` | `src/components/PageShell.tsx` | Outermost wrapper of every screen | Embedded list items; modal bodies |
| `PageHeader` | `src/components/patterns/PageHeader.tsx` | Screen title + back button + right action slot | Top-level nav (use `GlobalHeader`) |
| `SectionCard` | `src/components/SectionCard.tsx` | Any grouping with a title/icon/action | Interactive tiles (use `StatTile`); full-screen overlays |
| `StatTile` | `src/components/StatTile.tsx` | A metric (number + label + optional trend) | Form inputs; text blocks |
| `SegmentedTabs` | `src/components/SegmentedTabs.tsx` | 2–5 exclusive view toggles | >5 items (use `Tabs` from shadcn) |
| `EmptyState` | `src/components/EmptyState.tsx` | Zero-data screens with optional CTA | Loading states (use `Skeleton`) |
| `ConfirmDialog` | `src/components/ConfirmDialog.tsx` | Destructive confirmations | Content dialogs (use `Dialog`) |
| `Dialog` | `src/components/ui/dialog.tsx` (shadcn) | Modals with custom content | Quick confirmations (use `ConfirmDialog`) |
| `Sheet` | `src/components/ui/sheet.tsx` (shadcn, legacy) | Left/right/top drawers | Bottom sheets — use `BottomSheet` instead |
| `BottomSheet` | `src/components/ui/bottom-sheet.tsx` | Bottom-anchored secondary surfaces (pickers, edit detail, filter groups) | Full-screen flows (use `PageShell`); destructive confirms (use `ConfirmDialog`); tiny menus (use `DropdownMenu` pattern) |
| `Button` | `src/components/ui/button.tsx` (shadcn, skinned) | **Every clickable action** | Links (use `<a>`); custom icons inside tiles |
| `GlobalHeader` | `src/components/GlobalHeader.tsx` | App-wide header (search, notifications, profile) | Screen-level headers (use `PageHeader`) |
| `BottomNav` | `src/components/BottomNav.tsx` | Mobile primary nav | Tablet/desktop (hidden by `md:hidden`) |
| `Sparkline` | `src/components/Sparkline.tsx` | Inline 7-day trend under a metric | Full-size charts (use recharts directly) |
| `DayGridCalendar` | `src/components/DayGridCalendar.tsx` | Monthly timeline with day cells | Week views (use `Swimlane`) |

---

## 2. Minimal examples

### PageShell
```tsx
<PageShell maxWidth="narrow" spacing="lg">
  <PageHeader onBack={() => navigateBack()} title={t.progress.title} />
  {/* sections go here */}
</PageShell>
```

Defaults: `maxWidth="default"` (max-w-4xl), `spacing="lg"` (space-y-8), `px-6` horizontal padding.

### SectionCard
```tsx
<SectionCard
  icon={<Flame className="w-4 h-4 text-primary" />}
  title={t.wellness.streak}
  action={<span className="text-micro text-on-surface-variant">7 días</span>}
>
  <div className="h-2 bg-surface-container-highest rounded-full">
    <div className="h-full bg-primary rounded-full" style={{ width: '70%' }} />
  </div>
</SectionCard>
```

The header is optional — if no `title`/`icon`/`caption`/`action` is passed, only children render. Background, border, radius and padding are baked in.

### StatTile
```tsx
<StatTile
  label={t.progress.weightWeek}
  value="72.4"
  subtle="kg"
  trend="down"
  trendValue="-0.3 kg"
  onClick={() => navigateTo('progress')}
  ariaLabel={t.progress.openDetailsAria}
/>
```

When `onClick` is provided the tile renders as a `<button>` with hover + focus affordance. No `<div onClick>` — that is an anti-pattern.

### SegmentedTabs
```tsx
<SegmentedTabs
  options={[
    { id: 'body', label: t.progress.tabs.body, icon: <Weight className="w-3.5 h-3.5" /> },
    { id: 'nutrition', label: t.progress.tabs.nutrition },
  ]}
  value={tab}
  onChange={setTab}
  ariaLabel={t.progress.tabsAria}
/>
```

### Button
```tsx
<Button onClick={handleSave}>{t.common.save}</Button>
<Button variant="outline" size="sm">{t.common.cancel}</Button>
<Button variant="destructive" onClick={handleDelete}>{t.common.delete}</Button>
<Button variant="ghost" size="icon-sm"><Pencil className="w-4 h-4" /></Button>
```

**Sizes (ADR-003):** `default` = 44px, `sm` = 36px (documented density), `lg` = 48px, `icon` = 44×44, `icon-sm` = 36×36, `icon-lg` = 48×48.

### EmptyState
```tsx
<EmptyState
  icon="🍽️"
  title={t.kitchen.empty.title}
  description={t.kitchen.empty.description}
  ctaLabel={t.kitchen.empty.cta}
  onCta={() => onOpenCreate()}
/>
```

### ConfirmDialog
```tsx
<ConfirmDialog
  open={isOpen}
  onOpenChange={setOpen}
  title={t.recipes.delete.title}
  description={t.recipes.delete.description}
  confirmLabel={t.common.delete}
  variant="destructive"
  onConfirm={handleDelete}
/>
```

### Dialog (shadcn, for custom content)
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>{t.modals.editGoal.title}</DialogTitle>
    </DialogHeader>
    {/* body */}
  </DialogContent>
</Dialog>
```

### Sheet
```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="bottom" className="max-w-md">
    <SheetHeader>
      <SheetTitle>{t.filters.title}</SheetTitle>
    </SheetHeader>
    {/* filters */}
  </SheetContent>
</Sheet>
```

### BottomSheet (ADR-009, V1 compact + V2 focus)
```tsx
// V1 default — compact picker (pickers, toggle groups, short lists)
<BottomSheet
  open={open}
  onOpenChange={setOpen}
  title={t.filters.title}
  description={t.filters.subtitle}
  actionSlot={<Settings className="w-5 h-5 text-on-surface-variant" aria-hidden="true" />}
  footer={
    <Button className="w-full" onClick={handleApply}>{t.common.apply}</Button>
  }
>
  {/* scrollable body */}
</BottomSheet>

// V2 focus — cancel-action header (forms, searches, input-heavy)
<BottomSheet
  open={open}
  onOpenChange={setOpen}
  size="focus"
  headerLayout="cancel-action"
  title={t.foodSearch.title}
  actionSlot={
    <Button size="sm" onClick={handleNext} disabled={!selected}>{t.common.next}</Button>
  }
>
  {/* long scrollable list + keyboard emerges below */}
</BottomSheet>

// V2 focus — back-title-action header (navigation-stack / detail-edit)
<BottomSheet
  open={open}
  onOpenChange={setOpen}
  size="focus"
  headerLayout="back-title-action"
  hideHandle
  title={recipe.title}
  actionSlot={<StarFavToggle recipeId={recipe.id} />}
  footer={
    <div className="flex gap-3">
      <Button variant="destructive" className="flex-1" onClick={handleDelete}>{t.common.delete}</Button>
      <Button className="flex-1" onClick={handleSave}>{t.common.save}</Button>
    </div>
  }
>
  {/* edit form */}
</BottomSheet>
```

**V1 defaults** (`size="compact"`, `headerLayout="title-centered"`): `max-h-[88vh]` (status bar + dynamic island visible behind), `rounded-t-3xl`, handle pill on top, overlay `bg-black/25` (not 50%), sticky header with close X + centered title + optional `actionSlot`, scrollable body, optional `footer` with safe-area-inset padding.

**V2 size variants** (ADR-009 v2):

| Prop | `compact` (default) | `focus` |
|---|---|---|
| `max-h` | `88vh` (status bar + dynamic island visible) | `92vh` (only ~40 px status-bar band visible) |
| Bevel reference | IMG_0984, 0995, 0990 | IMG_0988, 1004, 1011, 1015, 1016, 1019 |
| Use for | pickers, toggle groups, short lists, confirm-action | forms multi-field, long search lists, keyboard-first input, detail-edit |

**V2 header layouts** (ADR-009 v2):

| `headerLayout` | Left | Right | Bevel reference |
|---|---|---|---|
| `title-centered` (default) | Close X | `actionSlot` | IMG_0984, 0995 |
| `cancel-action` | "Cancel" text button | `actionSlot` (typically primary text button) | IMG_1004, 1005, 0988 |
| `back-title-action` | Back chevron | `actionSlot` (star, share, etc.) | IMG_1015, 1016, 1019 |

Custom left-header content: pass `leftSlot` (overrides the default from `headerLayout`). Hide the swipe handle for keyboard-first (IMG_1011) or navigation-stack (IMG_1016) sheets: `hideHandle`. For **bottom** anchored sheets use `BottomSheet`; for left/right/top drawers keep the legacy shadcn `Sheet`.

---

## 3. Anti-patterns (ESLint-enforced)

These produce a lint error in CI:

```tsx
// ❌ Duplicating SectionCard shape
<div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
// ✅ Use <SectionCard>

// ❌ Arbitrary typography
<span className="text-[10px]">
// ✅ Use text-micro (and check docs/DESIGN-SYSTEM.md § 1.2)

// ❌ Sub-HIG tap target on a button
<button className="w-8 h-8"> ... </button>
// ✅ Use <Button size="icon-sm"> (36×36, documented density) or size="icon" (44×44)

// ❌ Hardcoded theme colors
<div className="bg-zinc-900 text-white">
// ✅ Use bg-surface-container-low text-on-surface (theme-aware)

// ❌ dark: prefix
<div className="bg-white dark:bg-black">
// ✅ Themes are class-based — see ADR-005
```

---

## 4. Adding a primitive

When you notice the same markup appearing 3+ times and no primitive fits:

1. Draft the component in `src/components/` (or `src/components/patterns/` if it is compositional).
2. Document its shape in the file header comment (see `SectionCard.tsx:1-7` for the canonical pattern).
3. Add a row to section 1 of this file + a minimal example in section 2.
4. If it captures a new rule, write an ADR in `docs/adr/`.
5. Add to `src/test/conventions/primitives-export.test.ts` so its export stays stable.
6. PR reviewed by design-system owner.

**Do not** add primitives under `src/features/<domain>/components/` — those are feature-local by design. Primitives live under `src/components/`.
