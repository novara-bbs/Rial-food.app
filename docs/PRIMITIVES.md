# RIAL Primitives Index

Canonical components. Reach for these **before** writing JSX from scratch.

> **Rule (ADR-001).** If a primitive covers your case, using raw divs instead is a PR blocker. ESLint rejects the known anti-patterns.

---

## 1. Table of primitives

| Primitive | File | When to use | When NOT |
|---|---|---|---|
| `Heading` | `src/components/ui/Typography.tsx` | **Every** `<h1..h4>` in features/patterns — `level` = HTML tag, `variant` = `default` / `editorial` (serif hero) / `overline` (small-caps sub-header) | Auth/onboarding centered hero; editorial card chrome with bespoke responsive size (documented allowlist) |
| `Text` | `src/components/ui/Typography.tsx` | Token-sized paragraph or inline text — `variant` = `body-lg`/`body`/`body-sm`/`caption`/`label`/`micro`; `as` prop for span/div/small | Labels inside interactive tiles where the tile primitive owns typography |
| `PageShell` | `src/components/PageShell.tsx` | Outermost wrapper of every screen | Embedded list items; modal bodies |
| `PageHeader` | `src/components/patterns/PageHeader.tsx` | Screen title + back button + right action slot | Top-level nav (use `GlobalHeader`) |
| `SectionCard` | `src/components/SectionCard.tsx` | Any grouping with a title/icon/action | Interactive tiles (use `StatTile`); full-screen overlays |
| `StatTile` | `src/components/StatTile.tsx` | A metric (number + label + optional trend) | Form inputs; text blocks |
| `ConstantTile` | `src/components/ConstantTile.tsx` | Biometric tile w/ 6 canonical states (loading/empty-no-template/empty-no-data/value-stable/value-trending-up/value-trending-down) | Non-metric tiles (use `StatTile`); always-has-data metrics (use `StatTile`) |
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
| `OnboardingScaffold` | `src/components/OnboardingScaffold.tsx` | Per-step wrapper for the 6-step onboarding flow (title + optional subtitle + optional heroSlot + interactive body) | Full-screen modals outside the onboarding context (use `PageShell`) |
| `RadioCardGroup` | `src/components/RadioCardGroup.tsx` | Exclusive selector rendered as vertical stack of cards with WAI-ARIA radiogroup semantics (2–5 options) | Non-exclusive selection (use checkboxes); side-by-side pills (raw buttons); > 5 options (use `<select>` or `SelectList`) |
| `SelectList` | `src/components/SelectList.tsx` | Vertical card list where each item is a nav trigger with trailing chevron (no selection state) | Exclusive selection (use `RadioCardGroup`); menus or dropdowns (use `DropdownMenu`) |
| `TabNav` | `src/components/patterns/TabNav.tsx` | Source / type / view navigation — 1-of-N **required**, underline indicator, `role="tablist"` | Optional filtering (use `ChipRow single`); compact card-scoped toggles (use `SegmentedTabs`) |
| `ChipRow` | `src/components/patterns/ChipRow.tsx` | Faceted filtering — `mode="single"` (0-or-1 optional) / `mode="multi"` (0-to-N). Variants `pill` (canonical) / `emoji` (emoji-LEFT prefix) / ~~`icon`~~ (deprecated [1.5.97], do not use). Tone `default` / `danger` (excluded-state). Default layout: **single-row horizontal scroll carousel** (no wrap). `wrap` flag available for intentional multi-row contexts. Font: Bricolage Grotesque `font-semibold normal-case` ([1.5.98]). | Source navigation (use `TabNav`); sort (use `SortControl`); curated editorial collections (use `CollectionsCarousel`); applied-filter feedback (use `ActiveFilterStrip`) |
| `FilterRow` | `src/components/patterns/FilterRow.tsx` | **Deprecated shim** → delegates to `ChipRow`. Kept so existing imports don't break | New code — import `ChipRow` directly |
| `SearchInput` | `src/components/patterns/SearchInput.tsx` | Free-text filter at the top of a list | Facet filtering (use `ChipRow`); sort (use `SortControl`) |
| `SortControl` | `src/components/patterns/SortControl.tsx` | Ordering — reorder without reducing. Native `<select>` under brand chrome, height ≡ `SearchInput` so both align in one flex row | Reducing set (use `ChipRow`); one-shot actions (use `Button` + menu) |
| `FilterSheet` | `src/components/patterns/FilterSheet.tsx` | Advanced filter panel (ADR-014). 3+ facetas grouped into accordion sections inside a `BottomSheet size="focus"`. Buffered draft + Apply/Reset semantics | 0-2 facets (use inline `ChipRow`); ordering (use `SortControl`); modal forms (use `BottomSheet` directly) |
| `FilterButton` | `src/components/patterns/FilterButton.tsx` | Trigger for `FilterSheet`. Compact icon button with numeric badge when `activeCount > 0`. Height ≡ `SearchInput` for flex-row alignment | Plain action button (use `Button`); navigation (use `TabNav`) |
| `ActiveFilterStrip` | `src/components/patterns/ActiveFilterStrip.tsx` | Shows currently-applied facets as dismissible chips with optional Reset link (delivery-app convention — Uber Eats / Glovo). Tinted styling (`bg-primary/10`) distinguishes from solid-active ChipRow chips. Auto-hides when chips array is empty. | Selecting filters (use `ChipRow` or `FilterSheet`); display-only badges (use plain `<span>`) |
| `RecipeCard` | `src/components/patterns/RecipeCard.tsx` | Any recipe card in a swimlane, grid, hero spot, or related carousel. **Always prefer over inline recipe button/div.** Four `variant` values (see below). | PostCard social post embeds (keep as-is); mini row-pickers (48×48 thumbnails — pending `RecipeRow` primitive) |

**`RecipeCard` anatomy** — all variants use the same Kitchen-Stories pattern: image-zone with overlays + solid `bg-surface` info-block below. **No gradient/blur over the food photography.** Footprint is stable regardless of title length thanks to `line-clamp-2` + fixed info-block height.

```
┌─ image zone (aspect-ratio fixed) ──┐
│  [TimeBadge] [♥][⋮]                │ ← top overlays (compact pills, time + actions)
│  [Tag]                              │
│  [Match%]                           │
│            ░░░░░░                   │ ← clean food photo, no gradient
│         ░░░░ photo ░░░░             │
│            ░░░░░░                   │
├─ info-block (bg-surface, h-fixed) ─┤
│  TITLE LINE-CLAMP-2                 │ ← font-black, text-tertiary
│  @creator                           │ ← optional byline
│  ⏱ kcal      [pro pill]             │ ← inline macros, no chip bg
└─────────────────────────────────────┘
```

| variant | Card size | Image zone | Info-block | Context | Shows |
|---|---|---|---|---|---|
| `hero` | full width (image aspect-video + info h-28) | `aspect-video` | `h-28`, `p-4` | 1 editorial pick per screen (Discovery "best match") | TimeBadge + tag + BEST MATCH%, title XL, kcal + PRO |
| `carousel` | `w-52 h-64` (208×256, info ~39%) | `aspect-[4/3]` (~156px) | `h-[100px]`, `p-3` | Horizontal swimlanes (Discovery FOR YOU, Quick meals; CreatorProfile) | TimeBadge + tag + match top-left, share + save top-right, title, @creator/forkedFrom, kcal + PRO |
| `grid` | `h-64 w-full` (info ~39%) | `aspect-[4/3]` | `h-[100px]`, `p-3` | 2/3/4-col grid (Cocina main grid) | TimeBadge + tag + match top-left, delete top-right, title, @creator/forkedFrom, kcal + PRO |
| `compact` | `w-40 h-56` (info ~29%) | `aspect-square` | `h-16`, `p-2.5` | Related / "more like this" carousels (RelatedRecipesCarousel) | TimeBadge top-left, title — no actions, no author, no macros |

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

### ConstantTile
```tsx
// Value with trend
<ConstantTile
  icon={Scale}
  label="PESO"
  state="value-trending-down"
  value="72.4"
  unit="kg"
  trendValue="-0.3 kg"
/>

// Empty, user doesn't track this dimension yet
<ConstantTile icon={Ruler} label="CINTURA" state="empty-no-template" />

// Has data, no trend yet (only 1 sample)
<ConstantTile icon={Percent} label="GRASA" state="empty-no-data" />
```

6 canonical states (ADR-009 V2 §4.10):

| State | Hero line | Sub line | Color |
|---|---|---|---|
| `loading` | pulse skeleton | pulse skeleton | — |
| `empty-no-template` | "No hay datos" | "Sin rango" | muted |
| `empty-no-data` | "No hay datos" | "Sin tendencias" | muted |
| `value-stable` | number + unit | "Estable" + `—` icon | `text-on-surface-variant` |
| `value-trending-up` | number + unit | trendValue + `↑` icon | `text-brand-secondary` |
| `value-trending-down` | number + unit | trendValue + `↓` icon | `text-primary` |

Defaults can be overridden via the `copy` prop (`{ noData, noRange, noTrends, stable }`). Emits `data-state={state}` for testing. Interactive when `onClick` is provided (renders as `<button>` with focus ring).

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

### OnboardingScaffold (PR 9, playbook §4.11)
```tsx
// Default variant — hero-less step with subtitle
<OnboardingScaffold
  title={t.onboarding.step1.title}
  subtitle={t.onboarding.step1.subtitle}
>
  <RadioCardGroup options={goalOptions} value={data.goal} onChange={setGoal} />
</OnboardingScaffold>

// Centered variant — ready/celebration steps
<OnboardingScaffold
  variant="centered"
  heroSlot={<PartyPopper className="w-14 h-14 text-primary mx-auto" />}
  title={t.onboarding.ready.title}
  subtitle={t.onboarding.ready.subtitle}
>
  <SectionCard className="w-full">{/* summary */}</SectionCard>
</OnboardingScaffold>
```

Emits `data-variant={variant}` for introspection. Title renders as `<h3>` to preserve the legacy step-title level. No footer slot — each step provides its own inline hints as children (keeps zero-UX-change promise).

### RadioCardGroup (PR 9, playbook §4.11)
```tsx
<RadioCardGroup<OnboardingData['activity']>
  options={[
    { id: 'sedentary', label: t.onboarding.activity.sedentary },
    { id: 'light', label: t.onboarding.activity.light },
    { id: 'moderate', label: t.onboarding.activity.moderate },
    { id: 'active', label: t.onboarding.activity.active },
  ]}
  value={data.activity}
  onChange={(id) => setData((d) => ({ ...d, activity: id }))}
  ariaLabel={t.onboarding.activity.aria}
/>

// With icons + descriptions
<RadioCardGroup
  options={[
    { id: 'muscle', label: 'Ganar músculo', icon: Dumbbell, iconClassName: 'text-blue-400' },
    { id: 'loss', label: 'Perder grasa', icon: Flame, iconClassName: 'text-orange-400' },
  ]}
  value={goal}
  onChange={setGoal}
/>
```

Semantics: outer `<div role="radiogroup">` + each card `<button role="radio" aria-checked>`. Active state uses theme tokens (`border-primary bg-primary/10 ring-1 ring-primary/40`) — no hex, no `dark:`. Trailing `<Check />` on the selected card. Emits `data-selected={selected}` per card. HIG-sized tap area via `p-4`.

### RecipeCard

All four variants share the same Kitchen-Stories pattern: **image-zone with overlays + solid `bg-surface` info-block below** (no gradient/blur over the photo). Title is `font-black` + `line-clamp-2` for stable footprint regardless of title length. Image aspect-ratios are fixed per variant: 4:3 (carousel/grid), aspect-video (hero), square (compact).

```tsx
// Horizontal swimlane
<RecipeCard
  recipe={recipe}
  variant="carousel"
  onPress={() => navigate(recipe)}
  onSave={(e) => { e.stopPropagation(); toggleSave(recipe.id); }}
  onShare={(e) => { e.stopPropagation(); share(recipe); }}
  isSaved={savedIds.has(recipe.id)}
/>

// Responsive grid (Cocina)
<RecipeCard
  recipe={recipe}
  variant="grid"
  onPress={() => navigate(recipe)}
  onDelete={(e) => { e.stopPropagation(); confirmDelete(recipe.id); }}
/>

// Editorial hero (1 per screen)
<RecipeCard recipe={bestMatch} variant="hero" onPress={() => navigate(bestMatch)} />

// Related / "more like this" carousel — no actions, no macros, no author
<RecipeCard
  recipe={{ id: r.id, title: r.title, img: r.image ?? r.img, time: formatTime(r) }}
  variant="compact"
  onPress={() => navigate(r)}
/>
```

**Light/dark contrast (verified)**: title `text-tertiary` over info-block `bg-surface` → 20.4:1 AAA in light, 17.8:1 AAA in dark. The solid info-block guarantees contrast by system, not dependent on photo colors.

**When NOT to use RecipeCard:** PostCard social embeds (keep hybrid as-is); 48×48 row-picker thumbnails (pending `RecipeRow` primitive).

### SelectList (PR 9, playbook §4.11)
```tsx
<SelectList<'apple-watch' | 'garmin' | 'helio' | 'apple-health' | 'oura' | 'none'>
  items={[
    { id: 'apple-watch', label: 'Apple Watch', icon: Watch },
    { id: 'garmin', label: 'Garmin', icon: Watch },
    { id: 'helio', label: 'Helio Strap', icon: Activity, desc: 'Recomendada' },
    { id: 'apple-health', label: 'Salud de Apple', icon: Heart },
    { id: 'oura', label: 'Oura', icon: Circle },
    { id: 'none', label: 'No tengo', icon: X },
  ]}
  onSelect={(id) => handleDeviceChoice(id)}
  ariaLabel="Elige tu dispositivo ponible"
/>
```

Differs from `RadioCardGroup`: **no selection state** — each card is a one-shot navigation trigger. Trailing `ChevronRight` on every card signals nav. `min-h-14` per item preserves HIG tap area. NOT a radiogroup — do not use when only one item can be "active" at a time.

### Filter primitives (ADR-013)

#### Canonical chip style ([1.5.98])

Single source of truth for every filter chip in the app — enforced via `ChipRow`,
`ActiveFilterStrip`, and the no-inline-reimplementation guard (Invariant A):

| State | Classes |
|---|---|
| Base shape | `shrink-0 px-3 py-1.5 rounded-full text-micro font-headline font-semibold normal-case tracking-normal` |
| Active (solid) | `bg-primary text-on-primary` |
| Inactive | `bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:border-primary/50` |
| Applied-filter strip (tinted) | `bg-primary/10 text-primary border border-primary/25` — lives in `ActiveFilterStrip` |

**Typography rationale** ([1.5.98]): switched from `font-label` (JetBrains Mono, monospace)
to `font-headline` (Bricolage Grotesque, brand variable sans-serif). Removed `uppercase
tracking-widest font-bold` → `font-semibold normal-case tracking-normal`. Size stays
`text-micro` (RIAL semantic token). The old style made chips look visually heavy even at
10px (monospace all-caps with max tracking). The new style looks dramatically smaller and
cleaner — delivery-app convention (Uber Eats / Glovo / Just Eat) and enterprise-ready.

**Padding rationale** ([1.5.109]): reduced from `px-4 py-2` → `px-3 py-1.5`. With
`text-micro` (10px), `py-2` (8px each side) gave a 3:1 height-to-font ratio — balloon
effect. `py-1.5` (6px) restores a natural 2:1 proportion. Touch targets are provided
by the parent scroll row hit area, not the pill visual size.

**Layout**: default is **single-row horizontal scroll carousel** (`overflow-x-auto
hide-scrollbar`). Use `wrap` prop only for intentional multi-row contexts (e.g.
applied-filter strips where showing all selections matters). Do not use `wrap` for
navigation/filter rows — the carousel UX is cleaner on mobile.

"One axis = one primitive." Pick the primitive from the axis the user is choosing on:

| Axis | Primitive | Notes |
|---|---|---|
| Source / type / view (1-of-N required) | `TabNav` | Underline, `role="tablist"`, navigation feel |
| Single facet (1-of-N optional) | `ChipRow mode="single"` | Chips toggle off to `null` |
| Multiple facets (0-to-N) | `ChipRow mode="multi"` | `active: string[]`, no null |
| Compact 1-of-N inside a card/dialog | `SegmentedTabs` | Pill container, ≤5 options |
| Ordering (reorder, not reduce) | `SortControl` | Native `<select>` + brand chrome |
| Free-text search | `SearchInput` | Always the top row |
| Curated editorial collections with count | `CollectionsCarousel` | Single-row scrollable emoji-pill carousel (wraps `ChipRow emoji` since [1.5.97], `wrap` removed [1.5.98] for horizontal carousel UX) |

```tsx
// TabNav — source nav (forYou / following / trending)
<TabNav
  tabs={[
    { id: 'forYou',    label: t.community.forYou,    icon: Sparkles },
    { id: 'following', label: t.community.following, icon: Users },
    { id: 'trending',  label: t.community.trending,  icon: TrendingUp },
  ]}
  active={mode}
  onChange={(id) => setMode(id as typeof mode)}
  ariaLabel={t.community.sourceAria}
/>

// ChipRow single — optional facet (all/mine/imported/cooked)
<ChipRow
  mode="single"
  variant="pill"
  options={sourceChips}
  active={activeSource}
  onChange={(id) => setActiveSource(id ?? 'all')}
  ariaLabel={t.cocina.sourceAria}
/>

// ChipRow pill — meal-type selector, single-row horizontal carousel.
// [1.5.95]: migrated from deprecated `variant="icon"` (icon-above-text tiles).
// [1.5.98]: `wrap` removed — single-row carousel (Uber Eats / Glovo convention).
<ChipRow
  mode="single"
  variant="pill"
  options={mealCategories}
  active={activeMeal}
  onChange={setActiveMeal}
  ariaLabel={t.cocina.mealAria}
/>

// ChipRow emoji — taxonomy picker (food categories)
<ChipRow
  mode="single"
  variant="emoji"
  options={categoryOptions}
  active={activeCategory}
  onChange={setActiveCategory}
  ariaLabel={t.foodDictionary.categoryAria}
/>

// ChipRow multi tone="danger" — excluded-state (allergens)
<ChipRow
  mode="multi"
  variant="pill"
  tone="danger"
  options={allergenOptions}
  active={Array.from(excluded)}
  onChange={(next) => setExcluded(new Set(next))}
  ariaLabel={t.foodDictionary.allergenAria}
/>

// SortControl — ordering, same height as SearchInput
<SortControl
  options={[
    { id: 'recent',     label: t.cocina.sort.recent },
    { id: 'az',         label: t.cocina.sort.az },
    { id: 'time-short', label: t.cocina.sort.timeShort },
  ]}
  active={sortMode}
  onChange={setSortMode}
  ariaLabel={t.cocina.sortAria}
/>
```

**Invariants (CI-enforced, see `src/test/conventions/filter-system.test.ts`):**

- **No inline chip reimplementation.** A `<button>` in `src/features/**` that carries the canonical chip shape (`shrink-0` + `rounded-full` + `font-headline` + `font-semibold`) must come through `ChipRow` / `SegmentedTabs` / `TabNav`. Convention test (Invariant A) guards the legacy `uppercase tracking-widest` pattern; any new chip-shaped button must also route through the primitive.
- **No branded inline `<select>`.** A native `<select>` in `src/features/**/screens/*` with `font-(headline|label)` must route through `SortControl`.
- **Dedup invariant.** No dimension appears on two primitives at once. If it's in the R3 `COLLECTIONS` registry (surfaced via `CollectionsCarousel`), it does **not** also appear in `ChipRow`.

### Advanced filter primitives (ADR-014)

When a screen has **3+ facetas** or wide vocabulary (cuisine + diet + time + difficulty), inline `ChipRow` stacking saturates the header. Use `FilterSheet` behind a `FilterButton`:

| Pattern | Primitive | Notes |
|---|---|---|
| 1-2 inline chips | `ChipRow` (status quo) | Cocina meal-slot carousel row |
| 3+ grouped facetas | `FilterSheet` + `FilterButton` | Source/Diet/Time/Difficulty |
| Heuristic facet derivation | `src/features/recipes/utils/facets.ts` | `deriveCuisine` / `deriveDietaryTags` / `deriveTimeBucket` / `deriveDifficulty` + `matchesFilters(recipe, values)` + `countActive(values)` |

```tsx
// FilterSheet — Cocina (4 sections, Source default expanded)
import FilterSheet, { type FilterSection } from '@/components/patterns/FilterSheet';
import FilterButton from '@/components/patterns/FilterButton';
import { matchesFilters, countActive, DIETARY_TAGS, TIME_BUCKETS, DIFFICULTIES, type FilterValues } from '@/features/recipes/utils/facets';

const [filterValues, setFilterValues] = useLocalStorageState<FilterValues>('cocinaFilters', {});
const [filterOpen, setFilterOpen] = useState(false);
const activeFilterCount = useMemo(() => countActive(filterValues), [filterValues]);

const sections: FilterSection[] = [
  { id: 'source',     title: t.filters.sections.source,     mode: 'single', defaultExpanded: true,
    options: [{ id: 'all', label: t.filters.source.all }, /* … */] },
  { id: 'diet',       title: t.filters.sections.diet,       mode: 'multi',
    options: DIETARY_TAGS.map(d => ({ id: d, label: t.filters.diet[d] })) },
  { id: 'time',       title: t.filters.sections.time,       mode: 'single',
    options: TIME_BUCKETS.map(tb => ({ id: tb, label: t.filters.time[tb] })) },
  { id: 'difficulty', title: t.filters.sections.difficulty, mode: 'single',
    options: DIFFICULTIES.map(d => ({ id: d, label: t.filters.difficulty[d] })) },
];

<div className="flex gap-2 items-stretch">
  <SearchInput value={q} onChange={setQ} className="flex-1" />
  <FilterButton onClick={() => setFilterOpen(true)} activeCount={activeFilterCount} />
  <SortControl options={sortOpts} active={sort} onChange={setSort} />
</div>

<FilterSheet
  open={filterOpen}
  onOpenChange={setFilterOpen}
  sections={sections}
  values={filterValues}
  onApply={setFilterValues}
  activeCount={activeFilterCount}
/>

// Apply in the recipe pipeline:
const filtered = recipes.filter(r => matchesFilters(r, filterValues, {
  sourceContext: { isMine, isImported, isCooked: r.cookedAt?.length > 0 },
}));

// ActiveFilterStrip — applied-filter feedback below the search row
// (delivery-app convention). Each chip dismisses its own filter; Reset
// clears all. Auto-hides when chips array is empty — caller need not gate.
import ActiveFilterStrip, { type ActiveFilterChip } from '@/components/patterns/ActiveFilterStrip';

const activeFilterChips: ActiveFilterChip[] = useMemo(() => [
  ...(filterValues.diet ?? []).map(d => ({ key: `diet:${d}`, label: t.filters.diet[d], emoji: '🌱' })),
  ...(filterValues.time ? [{ key: `time:${filterValues.time}`, label: t.filters.time[filterValues.time], emoji: '⏱️' }] : []),
  // …other facets
], [filterValues, t]);

<ActiveFilterStrip
  chips={activeFilterChips}
  onDismiss={(key) => removeFromFilterValues(key)}
  onReset={() => setFilterValues({})}
/>
```

**Cocina vs Discovery asymmetry (ADR-014 § 3):**

- **Cocina** (mis recetas, vocabulario cerrado) keeps meal-slot `ChipRow pill` carousel + `CollectionsCarousel` (`ChipRow emoji` carousel since [1.5.98]) visible. Source / Diet / Time / Difficulty live behind the FilterButton with feedback via `ActiveFilterStrip`.
- **Discovery** (catálogo, vocabulario amplio) hides EVERY facet behind the FilterButton — no chips visible. Cuisine / Diet / Time / Difficulty / MealSlot. When `countActive > 0`, the swimlanes collapse into a single sorted grid (Yummly pattern).

**Invariants (CI-enforced, see `src/test/conventions/filter-sheet.test.ts`):**

- **Invariant E** — at most one `<FilterSheet>` per screen.
- **Invariant F** — every screen importing `FilterSheet` must also import `FilterButton`.
- **Invariant G** — every screen importing `FilterSheet` must also import `ActiveFilterStrip` (every advanced-filter flow needs visible feedback of what's applied; [1.5.97]).

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
