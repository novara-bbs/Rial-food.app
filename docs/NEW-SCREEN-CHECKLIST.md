# New Screen Checklist

Mandatory before opening a PR that adds or substantially restructures a screen.

> **Context:** this file is the operational counterpart to `docs/DESIGN-SYSTEM.md` and `docs/PRIMITIVES.md`. Treat it as a gate, not a suggestion.

---

## 1. Scaffolding

- [ ] Screen file lives under `src/features/<domain>/screens/<ScreenName>.tsx`
- [ ] Outermost wrapper is `<PageShell>` with explicit `maxWidth` (never omitted on narrow screens)
- [ ] If the screen has a back action, top-of-shell is `<PageHeader onBack={...} title={...}>`
- [ ] Vertical rhythm comes from `PageShell`'s `spacing` prop — no ad-hoc `mt-*`/`mb-*` between sections

## 2. Primitives before divs

- [ ] Every grouped block with a title or icon → `<SectionCard>`. **No `bg-surface-container-low border ...` copies.**
- [ ] Every metric → `<StatTile>`. **No manual `text-xl font-black` tiles.**
- [ ] Every exclusive view toggle (2-5 options) → `<SegmentedTabs>`
- [ ] Every action → `<Button>`. Raw `<button className="...">` is only allowed for card-shaped clickables (and must include `focus-visible:ring-*` manually)
- [ ] Empty states → `<EmptyState>` with an icon, description, and CTA
- [ ] Destructive confirmations → `<ConfirmDialog variant="destructive">`. Never `confirm()`
- [ ] Every `<h1..h4>` → `<Heading level="hN" variant="default|editorial|overline">` (ADR-012). **No ad-hoc `font-headline text-2xl font-bold uppercase tracking-tighter text-tertiary` strings.** Raw `<hN>` only if the file is on `typographyMigrationAllowlist` in `eslint.config.mjs` and the bespoke voice is intentional (auth greeting, brand mark).
- [ ] Token-sized body / labels inside tiles or cards → `<Text variant="body|body-sm|caption|label|micro" as="...">` (ADR-012). Paragraphs flowing across a column can still use raw `<p className="text-body">` — the primitive earns its keep where the `{variant, as, className}` trio is easier to audit than three Tailwind utilities.

## 3. Tokens, not arbitrary values (ADR-002, ADR-007)

- [ ] Typography uses `text-{token}` from the scale (`text-micro`, `text-label`, `text-body`, …). **No `text-[Npx]`.**
- [ ] Radii use `rounded-{xs|sm|md|lg|xl|2xl}`. **No `rounded-[6px]`.**
- [ ] Elevation uses `shadow-elev-{0..3}` or tailwind defaults. **No custom `shadow-[...]`.**
- [ ] Colors use theme tokens (`text-primary`, `bg-surface-container-low`, `text-on-surface-variant`). **No `text-zinc-*`, no hex.**
- [ ] Fonts use token classes (`font-headline`, `font-body`, `font-label`). **No raw `font-family`.**

## 4. Accessibility & HIG (ADR-003)

- [ ] Interactive elements are ≥ 44×44 px (use `<Button size="default">` or `size="icon">`; for custom buttons, `w-11 h-11` minimum)
- [ ] Every `<button>` has an accessible name (visible text or `aria-label`)
- [ ] Custom clickables include `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background`
- [ ] Every `<input>` has a visible label or `aria-label`
- [ ] Navigation items set `aria-current="page"` when active

## 5. Internationalization (ADR-004)

- [ ] **Zero literal UI strings.** Every visible text comes from `t.section.key` via `useI18n()`
- [ ] Both `src/i18n/locales/es.ts` and `src/i18n/locales/en.ts` updated with the same keys
- [ ] `npm run check:i18n` passes locally before PR

## 6. State, handlers, sync

- [ ] Any new persisted state goes through `useLocalStorageState` via `AppStateContext`
- [ ] New handlers follow the factory pattern in `src/features/*/handlers/` and are wired in `AppStateContext`
- [ ] **No inline `useLocalStorageState` in screens or components.** Shared keys go through a factory handler so cross-screen updates stay reactive. (Explora tab audit 2026-04-18 retired 4 inline call sites; don't reintroduce them.)
- [ ] If a new `rial_*` key is added, update the audit table in `docs/ai/state.md` § localStorage audit and decide on `SyncKey` inclusion

## 6b. Card-level navigation without nested buttons

- [ ] If a card is fully clickable *and* contains inner interactive elements (CTA, like button, delete), use the **stretched-link pattern**: an absolute-inset `<button>` behind a `pointer-events-none` content wrapper, and inner CTAs as `relative z-10 pointer-events-auto` buttons. See `src/features/social/components/PostCard.tsx` for the canonical usage.
- [ ] Never nest `<button>` inside `<button>` — screen readers and WCAG 1.3.1 fail on it.

## 6c. Popup / modal / sheet — decide tipología primero (ADR-009 V3)

Antes de implementar, aplica los 5 criterios en orden. El primer match determina la tipología:

- [ ] **C1.** Tab de bottom-nav / pantalla raíz → **Route + `<PageShell>`** (Hoy, Cocina, Explora, Progress, Profile, More).
- [ ] **C2.** UX inmersiva sin contexto detrás (WakeLock, auto-advance, pinch-zoom, camera) → **Full-screen `fixed inset-0`** (CookMode, StoryViewer, MediaLightbox, BarcodeScanner camera).
- [ ] **C3.** Confirmación corta con 2 CTAs → **`<ConfirmDialog>` centered** (destructive confirms, "Are you sure?").
- [ ] **C4.** Flow first-run sin app state detrás → **Full-screen overlay** (solo Onboarding wizard).
- [ ] **C5.** Form con > 3 secciones semánticas → **Route full-screen** (CreateRecipe, CreatePost, CreateStory, AddMeal).
- [ ] Si ninguno matchea → **usar `<BottomSheet>`**.

Si es `<BottomSheet>`, aplicar también:

- [ ] `size`: `compact` (88vh, "elegir algo") o `focus` (92vh, "trabajar en algo")
- [ ] `headerLayout`: `title-centered` (pick-and-close), `cancel-action` (form con descarte explícito), o `back-title-action` (navigation-stack)
- [ ] `hideHandle` solo si keyboard-first o navigation-stack
- [ ] Status bar + dynamic island visibles detrás — nunca usar `h-screen` / `max-h-screen`
- [ ] Contenido scrollable dentro del sheet; el sheet no crece
- [ ] NO usar `<Sheet side="bottom">` raw — siempre `<BottomSheet>`

**Referencia completa**: `docs/market/bevel-design-playbook.md` §4.4.b (matriz de surfaces existentes) + §4.4.c (framework detallado). ADR-009 V3 para la versión resumida que aplica el reviewer.

## 6d. Filter surfaces — one axis = one primitive (ADR-013)

Si la pantalla expone cualquier superficie de filtrado / ordering / navegación por sets, **decide la tipología por eje antes de escribir JSX**. Un eje = un primitive.

- [ ] **Source / type / view** (1-of-N *obligatorio*; navegar entre sets de contenido) → `<TabNav>` (underline, `role="tablist"`)
- [ ] **Faceta opcional** (1-of-N que puede estar deseleccionado; reduce el set) → `<ChipRow mode="single">`
- [ ] **Facetas múltiples** (0-a-N; reducen el set) → `<ChipRow mode="multi">`. Si la semántica es "excluir" (alérgenos, tags bloqueados), añadir `tone="danger"`
- [ ] **1-of-N compacto dentro de card o dialog** → `<SegmentedTabs>`
- [ ] **Ordering** (reordenar sin reducir) → `<SortControl>`. **Prohibido** `<select>` nativo con `font-headline` / `font-label` en `features/**/screens` — el convention test falla
- [ ] **Búsqueda libre** → `<SearchInput>`
- [ ] **Colecciones editoriales curadas con count** → `<CollectionsCarousel>`. Rail editorial, no una fila de chips
- [ ] **Dedup**: ninguna dimensión aparece en dos primitives a la vez. Si `verified`/`quick`/`highProtein` están en el R3 `COLLECTIONS` registry (via `CollectionsCarousel`), **no** se duplican en `ChipRow`
- [ ] **No chip inline**: un `<button>` con `shrink-0` + `rounded-*` + `uppercase` + `tracking-widest` + `font-(headline|label)` dentro de `src/features/**` debe ir por `ChipRow` / `SegmentedTabs` / `TabNav`. El convention test `filter-system.test.ts` lo detecta
- [ ] **`FilterRow` está deprecated** (shim que delega a `ChipRow`). Los imports nuevos usan `ChipRow` directamente

**Referencia completa**: ADR-013 (`docs/adr/ADR-013-filter-system.md`) + `docs/PRIMITIVES.md` § Filter primitives.

## 7. Theme parity

- [ ] Smoke-test in the 6 themes: `theme-volt-dark` (default), `theme-light`, `theme-blue-dark`, `theme-blue-light`, `theme-orange-dark`, `theme-orange-light`
- [ ] No Tailwind `dark:` prefix anywhere (it breaks 5 of 6 themes — see ADR-005)

## 8. Verification

Run locally before asking for review:

```bash
npm run check:i18n          # ES/EN key symmetry
npm run release:preflight   # tsc + lint + test + build + size
```

- [ ] All green
- [ ] `CHANGELOG.md` updated if user-visible or architectural
- [ ] `docs/ai/state.md` updated if the sprint snapshot moves forward

---

**If any box stays unchecked, stop and re-read `docs/DESIGN-SYSTEM.md` + `docs/PRIMITIVES.md` before shipping.**
