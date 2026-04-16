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
- [ ] If a new `rial_*` key is added, update the audit table in `docs/ai/state.md` § localStorage audit and decide on `SyncKey` inclusion

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
