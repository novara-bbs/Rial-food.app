# Testing patterns — RIAL cookbook

> Captured from Sprint 1 ([1.5.131-133]) when the 8 state hooks + 7 RecipeDetail components got their first contract-pinning tests.

This doc is the canonical reference for **how to write tests in RIAL**. New tests should follow these patterns; if they don't fit, update this doc.

Test runner: **Vitest 4 + React Testing Library 16 + jsdom**. All deps already in `package.json`.

---

## TL;DR — when to write what

| Code shape | Test type | Helper |
|------------|-----------|--------|
| Pure utility function | unit test | none — import + assert |
| Custom hook | hook test | `renderHook` from `@testing-library/react` |
| Presentational component | component test | `renderWithProviders` from `src/test/helpers/` |
| Screen / container | integration test | `renderWithProviders` + multiple providers |
| Convention enforcement | static-source test | `fs.readFileSync` + regex (see `src/test/conventions/`) |

File location: **co-locate** `*.test.ts(x)` next to the source file. Convention tests live under `src/test/conventions/`.

---

## 1. Hook tests (the Sprint 1 pattern)

State hooks under `src/contexts/state/` all share the same shape: `useLocalStorageState` + `useEffect(pushToCloud)` + handler factories. Tests should pin:
1. The hook's **return shape** (every key its consumers expect)
2. **Persistence** — setters write to localStorage; rehydration on remount works
3. **Sync wiring** — the right `pushToCloud` keys fire, the wrong ones don't
4. **Domain-specific behaviors** (migrations, dedupe, dual-store mutations)

### Standard mock setup

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../lib/sync', () => ({ pushToCloud: vi.fn() }));
vi.mock('../../lib/seedVersion', () => ({
  shouldReseed: vi.fn(() => false),
  setStoredSeedVersion: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// ALSO mock heavy lazy data files when the hook imports them dynamically:
vi.mock('../../features/food/data/ingredients', () => ({ INGREDIENT_DICTIONARY: [] }));

import { useMyHookState } from './useMyHookState';
import { pushToCloud } from '../../lib/sync';

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});
```

### Why these mocks?
- **`pushToCloud`** — without the mock, every test would attempt a network call that fails silently (no Supabase config). The mock lets you assert which keys actually sync.
- **`shouldReseed`** — returning `false` skips the dynamic `import()` of seed data files (which Vitest can't resolve in unit tests).
- **`sonner`** — the `toast` import is global; mocking gives clean per-test assertions on user feedback.
- **Lazy data files** — the real `INGREDIENT_DICTIONARY` is 90+ KB; mocking saves test time.

### Asserting the return shape

```ts
it('exposes the documented N return-keys', () => {
  const { result } = renderHook(() => useMyHookState({ t: tStub }));
  expect(typeof result.current.someValue).toBe('boolean');
  expect(typeof result.current.someSetter).toBe('function');
  expect(Array.isArray(result.current.someList)).toBe(true);
});
```

### Asserting sync wiring

```ts
it('syncs all 6 user-owned keys on mount', () => {
  renderHook(() => useFoodState({ t: tStub }));
  const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
  expect(calls).toContain('userFoods');
  expect(calls).toContain('userVariants');
  // ...
});

it('does NOT sync community content (backend-sourced)', () => {
  renderHook(() => useSocialState(makeDeps()));
  const calls = (pushToCloud as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
  expect(calls).not.toContain('communityPosts');
});
```

### Asserting persistence

```ts
it('setIsPro updates localStorage under the right key', () => {
  const { result } = renderHook(() => useProfileState());
  act(() => result.current.setIsPro(true));
  expect(window.localStorage.getItem('isPro')).toBe('true');
});

it('rehydrates from localStorage on mount', () => {
  window.localStorage.setItem('isPro', 'true'); // seed BEFORE renderHook
  const { result } = renderHook(() => useProfileState());
  expect(result.current.isPro).toBe(true);
});
```

### Asserting migrations

For idempotent in-memory migrations (R8.3, Q19, P4.4), seed legacy shape in localStorage and verify the post-render state is normalized:

```ts
it('normalises legacy mealType into suitableFor on mount', () => {
  window.localStorage.setItem('savedRecipes', JSON.stringify([
    { id: 'r-1', title: 'Tortilla', mealType: 'breakfast' },
  ]));
  const { result } = renderHook(() => useRecipeState(deps));
  // Migration runs in useEffect; renderHook waits for effects to flush.
  expect(result.current.savedRecipes[0].mealType).toBeUndefined();
  expect(result.current.savedRecipes[0].suitableFor).toBeDefined();
});
```

### Examples from Sprint 1

| Hook | File | Tests |
|------|------|-------|
| useUITransientState | `src/contexts/state/useUITransientState.test.ts` | 8 |
| useProfileState | `src/contexts/state/useProfileState.test.ts` | 14 |
| useVitalsState | `src/contexts/state/useVitalsState.test.ts` | 12 |
| usePlannerState | `src/contexts/state/usePlannerState.test.ts` | 6 |
| useFoodState | `src/contexts/state/useFoodState.test.ts` | 10 |
| useRecipeState | `src/contexts/state/useRecipeState.test.ts` | 12 |
| useWellnessState | `src/contexts/state/useWellnessState.test.ts` | 8 |
| useSocialState | `src/contexts/state/useSocialState.test.ts` | 9 |

---

## 2. Component tests (the Sprint 1 pattern)

Presentational components (`src/features/*/components/`) need an `I18nProvider` wrapper because `useI18n()` is called everywhere. Some also need `Tabs` (when they render `<TabsContent>`).

### Use `renderWithProviders`

```ts
import { renderWithProviders } from '@/test/helpers/renderWithProviders';

renderWithProviders(<MyComponent ... />);
// or — for a TabsContent child:
renderWithProviders(<MyTabContent ... />, { inTabs: { defaultValue: 'overview' } });
// or — to assert the Spanish copy:
renderWithProviders(<MyComponent ... />, { locale: 'es' });
```

The helper:
- Pins `locale='en'` by default (jsdom's `navigator.language` is unreliable across hosts → assertions become flaky)
- Optionally wraps in `<Tabs>` for `<TabsContent>` children
- Provides `<I18nProvider>` automatically

### Locale-stable assertions

When the displayed text comes from `t.section.key`, EITHER pin the locale AND use the exact string, OR use a regex matching both locales:

```ts
// Approach A — pin locale and use exact string (default in renderWithProviders)
expect(screen.getByText('Cook mode')).toBeTruthy();

// Approach B — locale-agnostic regex (handy for tests that intentionally run in both)
expect(screen.getByText(/cook mode|modo cocina/i)).toBeTruthy();
```

For aria-labels:

```ts
const button = screen.getByLabelText(/decrease|reducir/i);
```

### Asserting callbacks

```ts
it('clicking "Mark as Cooked" fires handleMarkAsCooked', async () => {
  const handleMarkAsCooked = vi.fn();
  renderWithProviders(<RecipeOverviewTab {...props} handleMarkAsCooked={handleMarkAsCooked} />);
  const button = screen.getByText(/mark as cooked|marcar como cocinada/i).closest('button');
  await userEvent.click(button!);
  expect(handleMarkAsCooked).toHaveBeenCalledWith(expectedRecipe);
});
```

### Examples from Sprint 1

All under `src/features/recipes/components/detail/`:
- `RecipeStepsTab.test.tsx` (6) — list rendering + Cook Mode CTA
- `RecipeServingsControls.test.tsx` (9) — counter bounds + family chips
- `RecipeHero.test.tsx` (10) — title + verified-mode + bookmark gating
- `RecipeNutritionTab.test.tsx` (7) — macros table + scale + section gating
- `RecipeIngredientsTab.test.tsx` (8) — list + extras flow + brand-swap gating
- `RecipeOverviewTab.test.tsx` (8) — CTAs + Versionar Pro gating
- `RecipeDetailModals.test.tsx` (7) — per-modal show-flag + confirm wiring

---

## 3. Convention tests (static source assertions)

Some invariants can't be validated at runtime — they're enforced by reading the source file as text and asserting structure:

- "Every primitive is exported as default"
- "OnboardingScaffold renders an `<h3>` title"
- "RecipeCard uses `<SectionCard>` not raw markup"

Pattern lives in `src/test/conventions/`. Use `fs.readFileSync` + regex / `toContain`. **Do NOT** introspect via TypeScript types or import the file as a module — these tests are intentionally text-based so they catch drift even when types still happen to match.

---

## 4. What NOT to test

- Implementation details (which `useState` hook a component uses internally)
- Pure rendering output (snapshot tests are out — they test the markup, not the contract)
- Library code (radix, lucide-react, sonner) — assume their tests cover them
- Translations — `npm run check:i18n` validates symmetry; tests verify the keys are wired, not what they say
- Time-dependent behavior without `vi.useFakeTimers()` — flaky on slow CI

---

## 5. Running tests

```bash
npm run test                         # full suite (vitest run)
npm run test:watch                   # watch mode
npx vitest run src/contexts/state/   # one folder
npx vitest run path/to/file.test.ts  # one file
```

Coverage:
```bash
npx vitest run --coverage            # text + html report under coverage/
```

CI threshold: 30% (`vitest.config.ts`). Target: 60% by end of 2026 (per ROADMAP-2026).

---

## 6. When you add a new hook or component

Checklist (copy into your PR description):
- [ ] Test file co-located next to source (`MyHook.test.ts` next to `MyHook.ts`)
- [ ] Mock setup matches the patterns above (sync, seedVersion, sonner, lazy data)
- [ ] At least one test pins the **return shape** (hook) or **prop contract** (component)
- [ ] At least one test covers the **happy path** of the main behavior
- [ ] At least one test covers a **gating condition** (when does the feature hide / show)
- [ ] `npm run test` passes locally
- [ ] PR description states the test count

---

## 7. References

- ADR-015 — domain state + screen decomposition (the Sprint 1 source code)
- ROADMAP-2026 — Sprint 1 = "polish + safety nets" (this doc is the polish)
- `src/test/helpers/renderWithProviders.tsx` — the shared helper
- `src/hooks/useOnlineStatus.test.ts` — the original hook-test reference (older)
