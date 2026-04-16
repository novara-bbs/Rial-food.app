# Design walkthrough — 2026-04-17

Per-screen audit of the running app against `docs/DESIGN-SYSTEM.md`, `docs/PRIMITIVES.md`, `docs/NEW-SCREEN-CHECKLIST.md`, and the 7 ADRs. This doc is a living log — findings are added tab by tab; each one notes severity, scope, and the executable fix.

Severity rubric:
- 🔴 **Blocker** — clips, overflows, crashes, accessibility failures, tap-target violations users hit on first load.
- 🟡 **Drift** — violates an ADR (duplicate primitive shape, arbitrary `text-[Npx]`, `dark:`) but renders.
- 🟢 **Polish** — normalization of spacing / token naming / alignment with no visual failure.

Every finding names the file + line, the token or primitive to reach for, and (when fixed here) a link to the diff.

---

## Home — "TU DÍA"

### H-01 🔴 "RESTANTE" label clips on narrow mobile
**Where:** `src/features/home/components/NutritionHero.tsx` L38–58 (equation row).
**Observation:** Four `flex-1` columns separated by three operator glyphs, each labelled with `tracking-widest` `uppercase` `text-[10px]`. On iPhone SE width (≤375 px) the fourth label `RESTANTE` (8 chars) overruns its column and truncates to `RESTANT`.
**Why it happened:** The equation gives equal horizontal budget to 4 labels of different lengths (5 / 8 / 9 / 8 chars), while operators are `text-lg` with no `shrink-0`, and the whole row is wrapped in `p-4` (16 px horizontal padding each side). On a 340-px content surface the fourth label gets ≈ 68 px and needs ≈ 72 px.
**Fix:** Redesign as a hero row — `RESTANTE` as the primary number (`text-display`, primary color) with `META / ALIMENTOS / EJERCICIO` collapsed into a right-aligned caption column. Also unlocks cleaner visual hierarchy (the number users actually read is `662`).
**Bonus:** Kills 2 inline SectionCard violations (ADR-001) + 5 `text-[10px]` violations (ADR-002) in the same file.

### H-02 🟡 NutritionHero duplicates SectionCard shape twice
**Where:** `src/features/home/components/NutritionHero.tsx` L38 (equation card) + L62 (simple mode progress) + L79 (detailed mode progress).
**Observation:** All three read `bg-surface-container-low border border-outline-variant/20 rounded-sm p-{N}`.
**Fix:** Replace with `<SectionCard padding="md|sm" spacing="md|lg">`. Baseline in `sectioncard-usage.test.ts` drops.

### H-03 🟡 `text-[10px]` drift in NutritionHero
**Where:** `NutritionHero.tsx` L40, L45, L50, L55, L68, L91.
**Fix:** Replace with `text-micro` (semantic 10 px from ADR-002 scale).

### H-04 🟢 `text-[9px]` still reachable in other home surfaces
**Where:** `src/features/home/components/ProgressPreviewCard.tsx` (5× `text-[10px]`, 1× `text-[9px]`); `WeeklyMiniDash.tsx`, `RealScoreBadge.tsx`, `TodaysMeals.tsx` — each with a handful of occurrences.
**Fix:** Replace with `text-micro`/`text-caption` tokens. Not fixed in this walkthrough — belongs to the Q16 codemod sprint. Present counts captured here so Q16 has a per-file worksheet.

### H-05 🟡 ProgressPreviewCard duplicates SectionCard shape + sub-HIG pills
**Where:** `src/features/home/components/ProgressPreviewCard.tsx` L104 (inline card), L156 (`py-1.5 px-3 rounded-full` ≈ 28 px tall).
**Fix:** Wrap root in `<SectionCard>`. Bump pill buttons to `min-h-11` (ADR-003). Deferred to Q16 migration.

### H-06 🔴 Streak button on Home is sub-HIG
**Where:** `src/features/home/screens/Home.tsx` L239 — `px-3 py-1.5` pill, ≈ 28 px tall, tappable.
**Fix:** `px-4 py-2.5` (or `h-11`) to reach 44 px per ADR-003. Not fixed in this pass — single-file fix, ok to batch with Q16.

### H-07 🟡 Guided Setup card + Hydration card + shopping-reminder button repeat inline SectionCard shape
**Where:** `src/features/home/screens/Home.tsx` L257 (Guided Setup with `border-primary/30`), L365 (Hydration), L455 (shopping reminder).
**Fix:** Use `<SectionCard>` with custom `className="border-primary/30"` where needed. Three replacements in one file.

---

## Cocina — Recetas

### C-01 🟡 Create/Import recipe buttons lack accessible names
**Where:** `src/features/recipes/screens/Cocina.tsx` L163–170.
**Observation:** Both header action buttons use only `title=""` for naming — screen readers skip `title` on icon-only buttons. No `aria-label`.
**Fix:** Add `aria-label={t.recipes.create}` and `aria-label={t.recipes.import}`. Confirm tap target ≥ 44×44 (currently `p-3` + `w-5 h-5` yields ≈ 44 px — borderline; promote to `w-11 h-11` explicitly).

### C-02 🟢 Recipe count label uses raw `text-xs` instead of token
**Where:** `src/features/recipes/screens/Cocina.tsx` L179.
**Observation:** `text-xs text-on-surface-variant font-label uppercase tracking-widest` — should collapse into a typography token.
**Fix:** Replace with `text-caption` per ADR-002 scale.

### C-03 🟡 CookTimer had 2 sub-HIG controls (FIXED in this pass)
**Where:** `src/features/recipes/components/CookTimer.tsx` L64–78.
**Fix applied:** `w-9 h-9` → `w-11 h-11` on play/pause and reset buttons. Diff committed within this walkthrough.

---

## Explorar — Discover + Social

### E-01 🟡 Discover feed cards duplicate SectionCard shape (×4 occurrences)
**Where:** `src/features/home/screens/Discover.tsx` L92 (creator card), L132 (challenge wrapper), L196 (feed post card).
**Observation:** `bg-surface-container-low border border-outline-variant/20 rounded-sm p-4` inlined on each — violates ADR-001.
**Fix:** Wrap each in `<SectionCard padding="md">`.

### E-02 🟡 Pervasive `text-[9px]` / `text-[10px]` across Discover + Community feed
**Where:** `Discover.tsx` L101, L105, L109, L142, L150, L163, L171, L203, L207–208, L236, L251 (~12 occurrences); `Community.tsx` L83, L89.
**Fix:** `text-[9px]` → `text-micro`; `text-[10px]` → `text-caption` (ADR-002).

### E-03 🟡 Follow pill buttons below HIG
**Where:** `Discover.tsx` L150, L171 — `px-3 py-1.5` pills ≈ 28 px tall.
**Fix:** `min-h-11` or `py-2.5` on the pill (ADR-003).

---

## Más — Settings + Profile + Subscription

### M-01 🟡 Profile achievements row + settings menu rows duplicate SectionCard shape (×2)
**Where:** `src/features/profile/screens/Profile.tsx` L119 (RealFeel entry CTA), L188 (menu rows).
**Fix:** Swap for `<SectionCard>`. Menu rows can become `<SectionCard padding="none">` wrapping a `<button>` stack.

### M-02 🔴 Profile badge copy uses `text-[7px]` (below the 10 px floor)
**Where:** `src/features/profile/screens/Profile.tsx` L155 (`text-[7px]`), plus L84, L87, L98, L108, L125, L139, L175 at `text-[9px]` / `text-[10px]` (×8 total).
**Observation:** `text-[7px]` is illegible on small devices and would fail WCAG minimum legibility guidance; a user would notice.
**Fix:** Promote `text-[7px]` to `text-micro` (10 px) at minimum, map the rest to `text-micro`/`text-caption`.

### M-03 🟢 Settings bottom links use `text-[10px]`
**Where:** `src/features/profile/screens/Settings.tsx` L124, L144, L159, L167, L172 (legal links, reset persona, version tag).
**Fix:** Replace with `text-micro` token.

---

## FAB → Food (AddMeal + related flows)

### F-01 🟡 AddMeal food row duplicates SectionCard shape in a hot render path
**Where:** `src/features/food/screens/AddMeal.tsx` L469 — card shape repeats per search result.
**Fix:** `<SectionCard padding="md">` or (if perf matters in long lists) a dedicated `<FoodRow>` primitive. ADR-001.

### F-02 🟡 AddMeal chips and helper text saturate `text-[8px]` / `text-[9px]` / `text-[10px]` (×12+)
**Where:** `AddMeal.tsx` L286–305, L378, L388, L409, L475, L480, L483, L491, L494, L534, L543.
**Observation:** OFF / DB origin badges at `text-[8px]` cross the illegibility line; macro meta rows and multi-add toggle all use arbitrary px.
**Fix:** Minimum `text-micro`; consolidate chip typography into a reusable `<Chip>` primitive.

### F-03 🔴 Favorite star + add button were sub-HIG (FIXED in this pass)
**Where:** `src/features/food/screens/AddMeal.tsx` L501–517.
**Fix applied:** Star `w-8 h-8` → `w-11 h-11`; `+` button `w-10 h-10` → `w-11 h-11`; `aria-label` on both buttons, `aria-hidden="true"` on icons.

### F-04 🟢 Onboarding preview + input panels repeat SectionCard shape (×3)
**Where:** `src/features/profile/components/Onboarding.tsx` L175–193, L231, L354 (plus `text-[9px]` on macro labels L239–247, L301, L330, L361).
**Fix:** Panels → `<SectionCard>`; consider an `<Input>` primitive for the repeated input wrapper.

---

## Wellness — RealFeel, Tolerance, Progress, Weekly, Fasting

### W-01 🔴 WeeklyCheckIn chevron nav was sub-HIG (FIXED in this pass)
**Where:** `src/features/wellness/screens/WeeklyCheckIn.tsx` L251, L261.
**Fix applied:** `w-9 h-9` → `w-11 h-11`; `aria-label={t.weekly.previousWeek|nextWeek}` added (new keys in `es.ts` + `en.ts`); `aria-hidden="true"` on icons.

### W-02 🟡 WeeklyCheckIn stat grid duplicates SectionCard shape (×7)
**Where:** `WeeklyCheckIn.tsx` L124, L129, L134, L143, L270, L274, L278 — densest offender in wellness.
**Fix:** The 3-up metric cells → `<StatTile>`; averages panel → `<SectionCard>`. ADR-001.

### W-03 🟡 WeeklyReview + FastingTimer + RealFeelDiary repeat SectionCard shape (×5)
**Where:** `WeeklyReview.tsx` L153, L180; `FastingTimer.tsx` L139, L144, L162; `RealFeelDiary.tsx` L112, L207.
**Fix:** Wrap in `<SectionCard>` / `<StatTile>`.

### W-04 🟡 Progress screen uses arbitrary px on every stat label (~11 occurrences)
**Where:** `Progress.tsx` L120, L198, L204, L210, L222, L225, L249, L321, L325, L363, L388.
**Fix:** Map to `text-micro` / `text-caption`. ADR-002.

### W-05 🟢 RealFeelDiary uses `text-[8px]` + possibly-clickable `w-8 h-8` feeling icon
**Where:** `RealFeelDiary.tsx` L150 (day labels), L182 (icon wrapper).
**Fix:** Promote labels to `text-micro`. Verify the feeling icon is not tappable; if it is, bump to `w-11 h-11`.

---

## Onboarding

### O-01 🟡 Theme swatches may cluster below 44×44 + `text-[9px]` on labels
**Where:** `src/features/profile/components/Onboarding.tsx` L301–330, L361.
**Observation:** Palette family labels and restriction chips at `text-[9px]`; swatch tap area uncertain.
**Fix:** Confirm swatch hit zone ≥ 44×44 (ADR-003); labels → `text-micro`; restriction chips → shared `<Chip>` primitive.

---

## Walkthrough close-out (2026-04-17)

Fixes landed in this pass (🔴 only):
- **H-01** NutritionHero equation overflow → hero redesign + 3× `<SectionCard>` migration + 6× `text-micro`.
- **C-03** CookTimer play/pause + reset → 44×44 tap targets.
- **F-03** AddMeal favorite star + add button → 44×44 tap targets + a11y labels.
- **W-01** WeeklyCheckIn chevron nav → 44×44 tap targets + a11y labels (+ 2 new i18n keys).

Deferred to Q16 codemod sprint (🟡/🟢): all SectionCard shape duplications and `text-[Npx]` drift listed above. CI guardrail (ESLint `no-restricted-syntax` + `sectioncard-usage.test.ts` baseline) prevents regression while Q16 drains the debt.
