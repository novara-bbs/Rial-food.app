# ADR-013 — Filter system primitives (`ChipRow` + `SortControl`)

- Status: Accepted
- Date: 2026-04-25
- Supersedes: the ad-hoc `FilterRow` + inline `<select>` + inline chip patterns
- Related: ADR-001 (primitives mandatory), ADR-012 (typography primitives), R3 (Cocina collections registry)

## Context

An audit of the filter/facet/tab/search surfaces across the app (triggered by 2 screenshots from MyRecipes + Discover) exposed four structural problems that make filtering feel "lioso y feo":

1. **Duplicate axes across primitives.** `Cocina.tsx` rendered the same dimension (`verified / quick / highProtein`) twice — once as `CollectionsCarousel` tiles with counts, and again as `FilterRow pill` chips. User state diverges (clicking a tile filters via the R3 registry predicate; clicking the pill filters via an explicit `if` branch) and nobody knows which surface is "real".
2. **Primitive misuse.** `Community.tsx` used `FilterRow variant="pill"` to render FOR YOU / FOLLOWING / TRENDING — which is *source navigation*, not a facet. There's no underline indicator, no `role="tablist"`, and pills look visually identical to facet chips elsewhere.
3. **Inline reimplementation.** `FoodDictionary.tsx` hand-rolled two chip groups (category selector + allergen multi-select) with utility classes 95% identical to `FilterRow` — no primitive, silent drift, no way for a future refactor to hit them.
4. **Inline sort.** `Cocina.tsx` embedded a native `<select>` + `<ArrowUpDown>` icon in the same flex row as the search input, styled one-off. Every other screen that gains a sort affordance risks diverging.

Root cause: `FilterRow` was the only primitive in this layer, it was single-select only, and it didn't distinguish between *source / type / view* axes (where "Tabs" is the right mental model) and *faceted filtering* (where chips are). The app grew three other sublayers to fill the gaps.

Competitor benchmark (NYT Cooking, Food52, Bon Appétit, Notion, Linear):
- One visual primitive per semantic axis.
- Sort is a **separate control**, never a chip.
- Editorial collections live in a **rail** (horizontal cards), not a chip-row.
- Multi-select facets use **pill capsules with a visible active state** (sometimes "×" prefix when the state means "exclude").

## Decision

1. **Canonical filter primitives.** Introduce two primitives in `src/components/patterns/`:
   - **`ChipRow`** — replaces `FilterRow`. Single source of truth for chip-style filters.
     - `mode`: `single` (1-of-N optional) or `multi` (0-to-N).
     - `variant`: `pill` (rounded capsule), `icon` (icon-on-top tile for meal-type selectors), `emoji` (chip with emoji prefix — e.g. food-category selector).
     - `tone`: `default` (brand-primary active) or `danger` (error-tinted active with leading `×` — "excluded" semantics, e.g. allergens).
     - Emits `data-chip-row` + `data-variant` + `data-mode` + `data-tone` for test discovery.
   - **`SortControl`** — canonical ordering. Native `<select>` under brand chrome: `ArrowUpDown` icon + current option label + `ChevronDown`. Same height as `SearchInput` so both sit cleanly in one flex row.

2. **Axis → primitive map.** This is the "one axis = one primitive" rule:

   | Axis (what the user is choosing) | Primitive |
   |---|---|
   | Source / type / view (1-of-N required; navigation between content sets) | `TabNav` |
   | Single facet (1-of-N optional; reduces set) | `ChipRow mode="single"` |
   | Multiple facets (0-to-N; reduces set) | `ChipRow mode="multi"` |
   | Compact 1-of-N inside a card/dialog | `SegmentedTabs` |
   | Ordering (reorder set without reducing) | `SortControl` |
   | Free-text search | `SearchInput` |
   | Editorial collections with count | `CollectionsCarousel` (rail) |

3. **Dedup invariant.** No dimension appears on two primitives at once. If `verified / quick / highProtein` live in the R3 `COLLECTIONS` registry (surfaced via `CollectionsCarousel`), they do **not** also appear in a `ChipRow`. A screen that wants both discovery (curated rail) and free facet selection must pick one home for each dimension.

4. **`FilterRow` → shim.** `src/components/patterns/FilterRow.tsx` becomes a `@deprecated` re-export wrapper around `ChipRow` so the existing 6 call-sites don't break. No new code imports `FilterRow`. The shim is removed in a future sprint once all imports are migrated.

5. **`FeedTabs` deprecated.** Hardcoded-3-tabs feed component is unused after Community migrated to `TabNav`. JSDoc `@deprecated` header added; file kept until the next cleanup sprint.

6. **Enforcement**:
   - Convention test `src/test/conventions/filter-system.test.ts` (invariants A + B below).
   - Convention test `src/test/conventions/primitives-export.test.ts` locks the canonical exports.
   - Docs surface the decision tree (`docs/PRIMITIVES.md`, `docs/DESIGN-SYSTEM.md`, `docs/NEW-SCREEN-CHECKLIST.md`).

### Invariants enforced by `filter-system.test.ts`

- **Invariant A — no inline chip reimplementation**: a `<button>` in `src/features/**` whose className contains the triad `rounded-*` + `uppercase` + `tracking-widest` in combination with `font-headline` or `font-label` must come through `ChipRow` / `SegmentedTabs` / `TabNav`. Drift detector for the FoodDictionary / Community pattern.
- **Invariant B — no inline sort**: a native `<select>` in `src/features/**/screens/*.tsx` whose className contains `font-label` or `font-headline` (i.e. branded sort controls) must route through `SortControl`.

Allowlist files (documented exceptions) ship in the test itself, one line per entry, with a comment explaining why.

## Do / Don't

**Do**

```tsx
// Source navigation → TabNav (underline, role="tablist")
<TabNav tabs={[{id:'forYou',...},{id:'following',...}]} active={mode} onChange={setMode} />

// Facet (optional 1-of-N) → ChipRow single
<ChipRow mode="single" variant="pill" options={sources} active={activeSource}
  onChange={(id) => setActiveSource(id ?? 'all')} ariaLabel="Source" />

// Multi-select facet → ChipRow multi
<ChipRow mode="multi" variant="pill" options={allergens} active={excluded}
  onChange={setExcluded} tone="danger" ariaLabel="Allergens" />

// Sort → SortControl
<SortControl options={sortOptions} active={sortMode} onChange={setSortMode}
  ariaLabel="Order by" />
```

**Don't**

```tsx
// ✗ Using ChipRow pill as tabs
<ChipRow mode="single" variant="pill" options={[{id:'forYou'},...]} />

// ✗ Inline <select> with brand font classes
<select className="font-label uppercase tracking-widest …">…</select>

// ✗ Same dimension on two primitives
<CollectionsCarousel collections={[{id:'quick'}]} />
<ChipRow options={[{id:'quick'}, …]} />

// ✗ Inline chip with the canonical chip styles
<button className="rounded-full px-3 py-1.5 font-headline font-semibold normal-case tracking-normal …">
```

## Consequences

**Positive**

- One mental model per axis. A screen author answers "is this choice source, facet, sort or search?" and the primitive is determined.
- CMS-style contract extends to the filter layer: a visual update to chip styling is a single-file edit in `ChipRow.tsx`.
- Multi-select is first-class — no more hand-rolled `Set<T>` + button patterns.
- Cocina goes from 6 stacked surfaces to 4 clear ones; the 3 duplicated dimensions collapse into the carousel alone.
- Convention tests catch regressions without a reviewer having to remember the rule.

**Negative / mitigations**

- The shim keeps `FilterRow` alive for one more sprint. Mitigated: `@deprecated` JSDoc + convention tests already route new work to `ChipRow`.
- `variant="emoji"` and `tone="danger"` are narrow initial callers (FoodDictionary alone). Kept because the *shape* is recurrent (emoji-prefixed chips appear in any taxonomy picker; "excluded" state will reappear for dietary flags, blocked creators, hidden tags).

## Migration record (`[1.5.86]`)

| File | Change |
|---|---|
| `components/patterns/ChipRow.tsx` | **new** — primitive |
| `components/patterns/SortControl.tsx` | **new** — primitive |
| `components/patterns/FilterRow.tsx` | shim → delegates to `ChipRow` |
| `features/social/components/FeedTabs.tsx` | `@deprecated` JSDoc |
| `features/home/screens/Discovery.tsx` | `FilterRow icon` → `ChipRow` |
| `features/food/screens/AddMeal.tsx` | `FilterRow pill` → `ChipRow` |
| `features/planner/screens/ShoppingList.tsx` | `FilterRow pill` → `ChipRow` |
| `features/food/screens/FoodDictionary.tsx` | 2 inline blocks → `ChipRow emoji` / `ChipRow multi tone="danger"` |
| `features/social/screens/Community.tsx` | `FilterRow pill` → `TabNav` |
| `features/recipes/screens/Cocina.tsx` | dedup collections (3 axes removed from chip-row); inline `<select>` → `SortControl` |
| `src/test/conventions/filter-system.test.ts` | **new** — invariants A + B |
| `src/test/conventions/primitives-export.test.ts` | + `ChipRow`, `SortControl`, `TabNav`, `SearchInput`, `FilterRow` |
