# ADR-014 — Advanced filter panel (`FilterSheet` + `FilterButton`) + Cocina/Explore asymmetry

- Status: Accepted
- Date: 2026-04-25
- Extends: ADR-013 (filter system primitives — `ChipRow` + `SortControl`)
- Related: ADR-009 (BottomSheet anatomy), ADR-001 (primitives mandatory), Q16 (deferred typed-tag codemod)

## Context

`[1.5.86]` (ADR-013) normalized the **technical** layer of filtering — `FilterRow` was retired in favor of `ChipRow`, native sort selects were replaced with `SortControl`, and the "1 axis = 1 primitive" invariant was locked into convention tests. The infrastructure became uniform.

The **UX** problem was not solved. Two screens kept hurting:

1. **`Cocina.tsx`** still stacked five filter surfaces vertically (`TabNav` → `Search`+`Sort` row → meal-slot ChipRow icon → `CollectionsCarousel` → source ChipRow pill). Even after dedup, the header dominated the screen vertically and the user reported "lioso, feo, saturado".
2. **`Discovery.tsx`** had the *opposite* problem: zero accionable facets. The user could not narrow by cuisine, diet, time, or difficulty — only by meal slot via an icon ChipRow + 5 hardcoded swimlanes (`forYou` / `quickMeals` / `highProtein` / `byTime` / `batch`). The whole catalog of recipes was effectively un-narrowable.

Competitor benchmark (NYT Cooking, Yummly, SideChef, Samsung Food, AllRecipes, Tasty, MyFitnessPal, Kitchen Stories): the consensus pattern present in ≥6 of 9 apps is a **two-tier filter system**:

| Tier | Always visible | Trigger |
|---|---|---|
| **Primary** | Search + (optional) 1-2 quick-preset chips + Sort | inline |
| **Secondary** | Cuisine, Diet, Time, Difficulty, ingredient include/exclude | "Filters" button → bottom-sheet with grouped sections + multi-select chips per section + Apply CTA |

Bottom-sheet beats side-drawer / centered-modal / mega-menu on mobile because (a) it preserves thumb-zone reach, (b) swipe-down dismiss preserves the page context behind, (c) it is already the blessed primitive in `docs/PRIMITIVES.md` § BottomSheet (line 188-201, "filter groups" listed as canonical use case), and (d) RIAL has zero existing drawer / modal infrastructure for filtering.

## Decision

### 1. Two new primitives in `src/components/patterns/`

- **`FilterSheet`** — wraps `BottomSheet size="focus" headerLayout="cancel-action"` with:
  - `sections: FilterSection[]` — each section has `id`, `title`, `mode` (`single` | `multi`), `options: ChipOption[]`, and optional `defaultExpanded`.
  - Sections render as `<details>` accordions; first section opens by default.
  - Each section body renders an internal `<ChipRow>` with the section's `mode`.
  - **Buffered draft state**: chip toggles update local draft; only `Apply` emits `onApply(draft)` to the parent. Cancel / X / swipe-down / backdrop discard the draft (via radix Dialog default).
  - Reset link in the body header clears the draft (does NOT auto-apply).
  - Footer: sticky primary `Apply` button.
  - Header `actionSlot`: numeric `activeCount` pill when > 0.
  - Carries `data-filter-sheet` for the convention test.

- **`FilterButton`** — compact trigger (icon `SlidersHorizontal`, height matches `SearchInput`) with a numeric badge in the top-right when `activeCount > 0`. Carries `data-filter-button`.

### 2. New utility `src/features/recipes/utils/facets.ts`

A heuristic derivation layer that bridges the un-typed `Recipe` model (free-form `tags: string[]` + legacy `tag: string` + `XXM` time strings) to the four primary facets:

- `Cuisine` (8 values incl. `'other'`).
- `DietaryTag` (7 values; vegan strictly implies vegetarian).
- `TimeBucket` (`under15` / `under30` / `under60` / `over60`).
- `Difficulty` (`easy` / `medium` / `hard`).

Plus the predicate `matchesFilters(recipe, values, opts?)` and counter `countActive(values)`. Each `derive*` is keyword-based, accent-insensitive, with `'other'` / `[]` fallbacks. Recipes that fall to `'other'` remain selectable as an escape valve.

When the deferred Q16 codemod ships and adds typed `cuisine` + `dietaryTags` to `Recipe`, the `derive*` implementations swap to read typed fields directly; the predicate API stays stable.

### 3. Asymmetric usage Cocina vs Explore

| Pantalla | Visible chips | FilterSheet sections | Branch on filter |
|---|---|---|---|
| **Cocina** | `TabNav` + meal-slot `ChipRow icon` (kept) + `CollectionsCarousel` (idle) | Source / Diet / Time / Difficulty (4) | None — same grid always; carousel hides when filters active |
| **Explore (Discovery)** | None (asymmetry confirmed with user) | Cuisine / Diet / Time / Difficulty / MealSlot (5) | When `countActive > 0` → flat sorted grid replaces all swimlanes (Yummly pattern) |

Why asymmetric: Cocina is the user's own ~30 recipes — vocabulario cerrado, the user knows them, meal slot + collections carry semantic value visible. Explore is the ~50+ catalog — vocabulario amplio, hiding everything behind one button avoids prejudging the user's discovery intent.

### 4. Heuristic over codemod (now)

Two paths were considered:

- **(A)** Ship `FilterSheet` with heuristic `derive*` over existing fields → ship the entire UX in `[1.5.93]`.
- **(B)** Sprint Q16 first (typed `cuisine` + `dietaryTags` enums on `Recipe`, codemod over 50+ seeds, migrate 40+ call-sites that read `r.tag`) → defer FilterSheet 1+ sprint.

Choice: **(A)**. The user explicitly approved heuristic-now in plan-mode questioning. Q16 remains a separate deferred sprint — when it ships, swap the implementations of `derive*` to read typed fields. Public API and tests stay stable.

## Decision tree (extends ADR-013)

```
                 How many facet axes?
                       │
       ┌───────────────┼───────────────┐
       0-2            3+ (or wide vocabulary)
       │               │
   ChipRow inline    FilterSheet behind FilterButton
                       │
              + persist values in localStorage
              + branch UI when countActive > 0
              + optional asymmetric chip preserved on
                "owned content" surfaces (Cocina pattern)
```

## Why not …

- **Side drawer**: thumb-zone-hostile on mobile, no precedent in RIAL.
- **Full-screen modal**: hides page context entirely; user loses where they were.
- **Mega-menu (desktop pattern)**: doesn't translate to mobile-first; would need a second mobile implementation anyway.
- **Inline accordion expanding the page**: pushes content down indefinitely, terrible on long facet lists, no commit/cancel semantic.
- **Native iOS / Android picker via SortControl-style absolute select**: works for a single axis (sort), breaks down for grouped multi-section facets.

## Invariants (locked into `src/test/conventions/filter-sheet.test.ts`)

- **Invariant E**: at most one `<FilterSheet>` mounted per screen (cheap text scan over `*.tsx` under `src/features/*/screens/`).
- **Invariant F**: any screen importing `FilterSheet` must also import `FilterButton` (no sheet without a visible trigger).

## Consequences

- 2 new components, ~200 LoC combined. Bundle delta in `[1.5.93]` preflight: ≤ +3 KB gzip.
- Cocina header drops from 5 to 4 surfaces (1 conditional). Source axis lives behind the button with a numeric badge.
- Discovery gains a sort affordance for the first time. When filters apply, swimlanes collapse into a single grid.
- Heuristic facets ship today; Q16 codemod no longer blocks the UX.
- Future sprint (`[1.5.95+]`): when telemetry suggests, surface 1-2 quick-preset chips inline on Discovery (e.g. "Under 30 min", "High protein") as a Tier-1 shortcut. Phase deferred until usage data.
