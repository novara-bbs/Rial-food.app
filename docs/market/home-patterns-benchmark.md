# Home Patterns Benchmark — Cross-competitor synthesis

> **Purpose.** Unblock PR 8 (Home hero consolidation) with evidence across 5 competitor apps — not a Bevel-only opinion. Output of sprint S2.1 per the re-planned Bevel adoption roadmap (`.claude/plans/revisa-todas-las-capturas-ancient-micali.md`).
>
> **Scope.** Home / "today" surface only. Recipe-centric flows are out of scope (see `kitchen-stories-design-playbook.md` → S6). Onboarding is out of scope (see Bevel §4.11 → PR 9).
>
> **Method.** Synthesis across pre-existing per-competitor playbooks — not a new research pass. Inputs are:
> - `docs/market/bevel-design-playbook.md` (64 caps IMG_0951–1019)
> - `docs/market/yazio-design-playbook.md` (11 caps IMG_1096–1106)
> - `docs/market/lifesum-design-playbook.md` (39 caps IMG_1056–1095)
> - `docs/market/myfitnesspal-design-playbook.md` (14 caps IMG_1127–1140)
> - `docs/market/myrealfood-design-playbook.md` (19 caps IMG_1169–1188)
>
> **Author note.** The matrices below cluster *cross-competitor* — the per-app descriptive content stays in its playbook. This doc only answers: **what are the converging patterns, where does each diverge, and what shape should PR 8 take?**
>
> Created: 2026-04-19. Reviewer: owner must sign via "continua" or shape-override before PR 8 enters S4.

---

## 1. Methodology + scope

### 1.1 Competitors included

| Competitor | Why included | Home-relevant caps | Playbook status |
|---|---|---|---|
| **Bevel** | Apple-designed visual reference. Already shipped 5 PRs adopting its language. | IMG_0974 (3-ring Home), IMG_0976 (Home scroll — Nutrition + Monitor), IMG_0993/0994 (Constantes grid) | shipped (PR 1) |
| **Yazio** | Direct competitor EU/ES. Semi-ring-first approach to Home — inversion of jerarquía typical in MFP clones. | IMG_1099–1100 (Home hero + meal cards), IMG_1102–1103 (tracking surfaces), IMG_1105 (paywall anti-pattern) | committed in S2.0 |
| **Lifesum** | Premium editorial. Uses a "Life Score" rolled-up metric sidecar — unique pattern worth studying. | IMG_1056 (Home hero), IMG_1058 (macros stacked), IMG_1060–1063 (meal-slots, water, weight, activities) | committed in S2.0 |
| **MyFitnessPal** | Category incumbent. Data-table legacy. Paywall-heavy → anti-pattern cheat sheet. | IMG_1127–1128 (Home carousel), IMG_1130 (macros paywalled), IMG_1136–1140 (meal-slot headers) | committed in S2.0 |
| **MyRealFood** | Local ES competitor. Narrative-score Home (Real Score) — most divergent shape. | IMG_1169–1171 (Real Score Home), IMG_1173 (Retos), IMG_1177 (weekly planner) | committed in S2.0 |

### 1.2 Competitors excluded (and why)

| Competitor | Exclusion reason |
|---|---|
| **MacroFactor** | Algorithm-first app. Home is a forecast-of-the-week with predicted vs actual. Not a visual Home pattern library — ROI of writing a playbook for it (6h) below threshold for the Home shape decision. Mentioned laterally where relevant (adherence-weighted trend-line). |
| **Cronometer** | Micronutrient-heavy. Home is a macro+micro data table, not a "shape-of-the-day" surface. Out of RIAL's ICP axis (we're not a micronutrient app). |
| **Kitchen Stories** | Recipe-centric. Home is a recipe feed, not a tracking surface. Reclassified to S6 (recipe benchmark). |
| **Noom, Whoop, WeightWatchers** | Either onboarding-gated (Noom paywall questionnaire before Home), sensor-hardware-first (Whoop recovery hero is its entire value prop), or lifestyle-coaching-first (WW points system). Job mismatch vs RIAL's ICP. |
| **Paprika, Yummly, Samsung Food** | Recipe apps (S6 scope), not tracking. |

**Net sample:** 5 competitors covering the spectrum from minimal-narrative (MyRealFood) through data-heavy tracker (MFP) — sufficient convergence signal for Home shape.

### 1.3 Scope boundaries

- **In scope:** above-the-fold hero + first screen of "Today" / "Hoy" dashboard. Drill-down patterns into sub-modules (Progress, Nutrition detail, etc.).
- **Out of scope:** onboarding flows (→ PR 9), creation flows (CreateMeal, CreateRecipe → stable in RIAL), Progress/Profile tabs (different sprints), recipe detail UI (→ S6), paywall UI (ADR-008 already shipped), theme system (PR 3 shipped).
- **No competitor-direct copy decisions here.** The deliverable is a clustering + recommendation. The actual code decisions happen in PR 8 (S4) after the gate check (§6.2).

---

## 2. Agnostic dimensions — the 7 questions per competitor

Before clustering (§3), each competitor's Home is characterized by the same 7 axes. The answers are the raw input to the convergence matrix — per-competitor detail lives in each playbook, so this section stays **compressed**.

| # | Dimension | What we're asking |
|---|---|---|
| Q1 | Hero element | What shape + metric dominates above the fold? |
| Q2 | Macros layout | Where do macros live relative to the hero? |
| Q3 | Meal-slot pattern | How are Breakfast/Lunch/Dinner/Snack rendered? |
| Q4 | Creation CTA | Where does the user tap to log a meal? |
| Q5 | Drill-down trigger | How does the user go from Home → detail? |
| Q6 | ICP-adaptive | Does the layout change by goal/persona? |
| Q7 | Empty-state | What does a new-user Home look like? |

Condensed answers (one row per competitor, per dimension):

### Q1 — Hero element

| Competitor | Shape | Primary metric | Position |
|---|---|---|---|
| Bevel | 3 rings horizontal (not a single hero) | Esfuerzo / Recuperación / Sueño (3 parallel scores) | Above fold, full-width |
| Yazio | Semi-ring 270° open at bottom (decorative track) | Number "2978 Restantes" 36 px bold (**hero is the number**, ring is backdrop) | Centered |
| Lifesum | Semi-donut gradient | "Consumido / Restante / Quemado" tri-label + ring progress | Centered hero card |
| MyFitnessPal | Donut outline thick (no progress fill at 0%) | "3030 Restantes" 32 px + caption explaining formula | Centered with 3-row legend right |
| MyRealFood | Card (no ring) | Real Score narrative ("¿qué nota tendrás?") + CTA "Completar test 💖" | Top card mint-green tinted |

### Q2 — Macros layout

| Competitor | Layout | Values |
|---|---|---|
| Bevel | N/A (no macros in Home first screen; Nutrition is a separate module card) | — |
| Yazio | 3-column row **below** hero — dot + thin bar + "0 / 363 g" per macro | Absolute remaining / target |
| Lifesum | 3 semi-donuts **stacked vertical** as separate module card | %DV + absolute |
| MyFitnessPal | 3-donut grid inside carousel — **paywalled** behind "Pásate a Premium" overlay (IMG_1130) | Obscured |
| MyRealFood | Not visible in Home — macros live inside meal-detail cards | — |

### Q3 — Meal-slot pattern

| Competitor | Render | CTA per slot |
|---|---|---|
| Bevel | N/A in Home hero (meal detail is a separate module; daily log is tab Diario IMG_0973) | — |
| Yazio | 4 horizontal cards (emoji + name + "0 / 893 kcal") | FAB `+` inline per card |
| Lifesum | 4 vertical cards stacked, "Recomendado 704–985 kcal" range (not total) | FAB `+` inline per card |
| MyFitnessPal | List sections with "Desayuno / AGREGAR ALIMENTO ⋯" header + stacked items | Link CTA per section header + global FAB |
| MyRealFood | Weekly planner (Plan tab, not Home) — horizontal-scroll meal cards 140×140 photo + skeleton macros | Central FAB emerald |

### Q4 — Creation CTA placement

| Competitor | Primary placement | Secondary |
|---|---|---|
| Bevel | Bottom-nav `+` (long-press reveals 3×3 action grid IMG_0997) | — |
| Yazio | FAB `+` inline per meal-slot (no global central) | "Más →" section header link |
| Lifesum | FAB `+` inline per meal-slot | BottomNav `+` central verde elevated |
| MyFitnessPal | Section-header "AGREGAR ALIMENTO" per meal-slot | Global barcode FAB + "Agregado rápido" FAB |
| MyRealFood | Central FAB `+` emerald (visible in Plan tab) | Implicit via "Retos del día" + Real Score CTA in Home |

### Q5 — Drill-down trigger

| Competitor | Pattern |
|---|---|
| Bevel | Tap ring → module detail; explicit "Ver detalles" pill on sub-modules (IMG_0976) |
| Yazio | Name-label with → arrow indicates tap-to-detail |
| Lifesum | "Detalles" green link right of hero |
| MyFitnessPal | "Detalles" nav link on hero; meal-section header + "AGREGAR ALIMENTO" inline |
| MyRealFood | Chevron-right on habit rows; Real Score "Completar test" CTA |

### Q6 — ICP-adaptive

| Competitor | Branches layout by goal/persona? | Evidence |
|---|---|---|
| Bevel | No (single layout) | All 64 caps show same 3-ring Home |
| Yazio | No | Single pattern observed across 11 caps |
| Lifesum | No — but **diet-plan acts as a global lens** (not ICP-adaptive; user-picked) | Single Home layout across 39 caps, diet-plan modifies color accent + recommendations |
| MyFitnessPal | No | Single pattern across 14 caps |
| MyRealFood | No | Single pattern across 19 caps |

**Cluster ratio: 0/5 competitors are ICP-adaptive on Home.** Single most important finding of this benchmark. See §4.3.

### Q7 — Empty-state treatment

| Competitor | Empty-state style |
|---|---|
| Bevel | Skeleton + info caption + no aggressive CTA (IMG_0977 "Registra 750 kcal…" as caption, not button) |
| Yazio | Not observed in caps |
| Lifesum | Not observed; default 0-state resolves via skeleton + "¿Qué tal tu día?" prompts |
| MyFitnessPal | Skeleton kcal bar + 0 in donut; no dedicated empty-state screen observed |
| MyRealFood | Planner skeleton (IMG_1177) shows meal-slot structure even empty |

**Not enough data to cluster.** RIAL should default to Bevel-style info-caption + skeleton (IMG_0977 pattern) until observed otherwise.

---

## 3. Cross-cluster matrix — the critical table

Scoring convention: `X/5` means "X of 5 competitors do this". `—` means "dimension not applicable or not observed". Bold = convergent (≥3/5).

### 3.1 Hero + macros + meal-slot + CTA

| Dimension | Bevel | Yazio | Lifesum | MFP | MyRealFood | Cluster ratio | Convergent? |
|---|---|---|---|---|---|---|---|
| **Hero shape — ring family** (full-ring / semi-ring / donut, i.e. any circular radial) | ✓ (3 rings) | ✓ (semi-ring 270°) | ✓ (semi-donut) | ✓ (donut outline) | ✗ (card) | **4/5** | **YES** |
| Hero shape — strict semi-ring only (270° arc) | ✗ | ✓ | ✓ | ✗ | ✗ | 2/5 | No |
| Hero shape — full 360° ring | ✓ (×3) | ✗ | ✗ | ✓ (donut = ring with hole) | ✗ | 2/5 | No |
| Hero shape — card (no ring) | ✗ | ✗ | ✗ | ✗ | ✓ | 1/5 | No (minority) |
| **Hero primary metric — "kcal remaining"** | ✗ | ✓ ("2978 Restantes") | ✓ ("Restante" + "Consumido" + "Quemado") | ✓ ("3030 Restantes") | ✗ | **3/5** | **YES** |
| Hero primary metric — narrative/score | ✓ (3 scores: Esfuerzo/Recuperación/Sueño) | ✗ | ~ (Life Score as secondary ring) | ✗ | ✓ (Real Score) | 2/5 | No |
| **Macros — separate module below hero** | — | ✓ (row) | ✓ (stacked donuts) | ✓ (donut grid paywalled) | ✗ | **3/5** (out of 4 applicable) | **YES** |
| Macros — 3-column row below hero | — | ✓ | ✗ | ✗ | — | 1/4 | No |
| Macros — 3-donut grid (stacked or 3-col) | — | ✗ | ✓ | ✓ | — | 2/4 | No (tied with row) |
| **Meal-slot — card format** (horizontal or vertical card per slot) | — | ✓ | ✓ | ~ (list header + items) | ✓ (weekly planner cards) | **3/4** → **4/4 if MFP list counted as card** | **YES** |
| Meal-slot — FAB inline per card | — | ✓ | ✓ | ✗ (link CTA) | ~ (Plan tab FAB central) | 2/4 | Weak |
| Meal-slot — global "+" button only | ✓ (bottom-nav `+`) | ✗ | ~ (nav + per-slot) | ~ (header link + global FAB) | ✓ (central FAB Plan tab) | 2/5 | No |
| **Drill-down — tap-caption + arrow** | ✓ ("Ver detalles" pill) | ✓ (name + →) | ✓ ("Detalles" link) | ✓ ("Detalles" link) | ✓ (chevron-right) | **5/5** | **YES (universal)** |
| ICP-adaptive layout | ✗ | ✗ | ✗ | ✗ | ✗ | **0/5** | **YES (universal absence)** |

### 3.2 Density + layout budget

| Dimension | Bevel | Yazio | Lifesum | MFP | MyRealFood | Cluster ratio |
|---|---|---|---|---|---|---|
| Tiles/widgets visible before scroll | 3 (rings) | ~8 (hero + 4 slots + water + weight + steps + mood) | ~10 (hero + 3 macros + 4 slots + water + weight + activities + notes) | ~6 (hero + stats grid + meal headers) | ~5 (Real Score + 3 Retos badges + 2 habits peek) | 5–10 tiles typical (**5/5 dense**, but wide range) |
| % vertical budget "today's data" vs "library / explore" | ~50% (3 rings hero) | ~30% hero + 70% tracking/slots | ~25% hero + 75% slots/trackers | ~40% hero+stats + 60% meal log | ~25% Real Score + 75% Retos + habits | "today" 60–75% of first screen: **4/5** |
| Bottom-nav visible | ✓ (5 tabs: Inicio/Diario/Fitness/Constantes/`+`) | ✓ (≥4 tabs) | ✓ (5 tabs + elevated `+`) | ✓ (5 tabs) | ✓ (5 tabs) | **5/5 bottom-nav universal** |

### 3.3 Anti-patterns catalog (guardrails for PR 8)

Each cell = "does this competitor exhibit this anti-pattern?" — extracted from each playbook's explicit callouts.

| Anti-pattern | Bevel | Yazio | Lifesum | MFP | MyRealFood | Incidence |
|---|---|---|---|---|---|---|
| **Countdown timer fake-urgency** (e.g., `00:57:36` in Home/paywall banner) | ✗ | ✓ ("00:57:36" promo pill IMG_1105) | ✗ | ✗ | ✓ (`12h 33m 20s` IMG_1182) | 2/5 |
| **"DESCUENTAZO" / urgency naming** | ✗ | ✓ | ✗ | ✗ | ✓ (IMG_1176) | 2/5 |
| **Paywall inside core tracking surface** | ✗ (paywall lives in separate pages IMG_0965/0966) | ~ (promo banner but macros free) | ✓ (ficha nutricional oscurecida with upgrade gate IMG_1089–1090) | ✓ **(macros hero cell paywalled IMG_1130, 3 of 4 carousel cards paywalled)** | ~ (Real Score free but Retos lock visible) | **4/5 partial-to-full** |
| **Persistent "Actualizar / Upgrade" header pill** | ✗ | ~ | ✓ ("ACTUALIZAR" pill orange) | ✓ ("Pásate a Premium" pill yellow) | ~ | 2/5 |
| **AdMob banner in Home** | ✗ | ✗ | ✗ | ✓ (IMG_1129 banner between modules) | ✗ | 1/5 (unique to MFP) |
| **Reverse-trial paywall (auto-renew after trial)** | ✗ | ✗ | ✓ ("Premium 7 days auto-renew") | ~ | ~ | 1/5 |
| **Crossed-out anchor price fake-discount** | ✗ | ✗ | ✗ | ✗ | ✓ (`~~59.99€~~`) | 1/5 |
| **Emoji 3D "stale iOS 6" aesthetic** | ✗ | ✗ | ✗ | ✗ | ✓ (onboarding) | 1/5 |
| **Dark-pattern content obscuring with unlock gate** | ✗ | ✗ | ✓ (IMG_1089–1090 ficha nutricional blurred) | ✓ (IMG_1130 macros blurred) | ✗ | 2/5 |
| **Coronas Premium `👑` in inputs** | ✗ | ✗ | ✗ | ✓ (Tiempo, %DV macro lock) | ✗ | 1/5 |

**Net catalogued:** 10 anti-patterns, 5 of which hit ≥2 competitors. PR 8 review must explicitly check against each (see §5 Guardrails).

### 3.4 Unique patterns worth studying (no cluster, single-source signals)

These are things only one competitor does that might be worth RIAL adopting independently of the PR 8 Home shape decision.

| Pattern | Source | Relevance for RIAL |
|---|---|---|
| **Life Score / Real Score — narrative rolled-up metric** | Lifesum IMG_1067 (Life Score 0–150), MyRealFood IMG_1169–1170 (Real Score) | Q21 candidate — differentiator vs MFP clones. Narrative beats raw numbers for non-tracker ICPs (Clara/Ana). Distinct from PR 8 shape. |
| **Running-sum formula caption** ("Restantes = Objetivo − Alimentos + Ejercicio") | MFP IMG_1127 | Education value — explicit equation removes memorization burden. Adapt to RIAL NutritionHero caption. |
| **Diet-plan as global lens** (Keto/Mediterráneo/etc. modify recommendations + accent color app-wide) | Lifesum IMG_1068–1074 | Q15 candidate — different from ICP-adaptive (user-picked, not goal-derived). Interesting orthogonal axis. |
| **Weekly meal planner on Home** (instead of daily log) | MyRealFood IMG_1177 | Inverts "log-today" paradigm — weekly plan is the Home, today's log is a sub-view. RIAL already has `Planner.tsx` as separate feature — not a PR 8 shape decision. |
| **Pantry-smart discovery** ("¿Qué tienes en la nevera?" chip row) | MyRealFood | Q6+ candidate — requires Pantry data integration. Outside PR 8 scope. |
| **Action grid 3×3 on long-press FAB** | Bevel IMG_0997 | Q15+ candidate — orthogonal to PR 8 (Home shape, not creation flow). |
| **Tab-bar "Diario" as historical log** | Bevel IMG_0973, MFP default "Todo" tab | RIAL's `RealFeelDiary` is closer — stays as full-screen route per ADR-009 V3 decision. |

---

## 4. Home playbook for RIAL — 3 options with pro/con

This is the synthesis output: given the matrix above, **what shape should PR 8 take?** Three options, recommendation at the end.

### 4.1 Option A — Semi-ring 270° hero + macros row below

**Shape.**
```
[Header: "Hoy, 19 de abril" + chip activo + chip clima]
[Hero: semi-ring 270° gris claro + number "1842 Restantes" 36 px bold centered]
[Macros row: 3-col · carbs / fats / proteins · dot + thin bar + "X / Yg"]
[Meal-slot cards ×4: horizontal, emoji + name + "X / Y kcal" + FAB inline]
[Secondary rail: water · weight · steps · mood prompt (scrollable)]
[Bottom-nav: existing]
```

**Evidence for this shape:**
- Ring family convergent at 4/5 (matrix §3.1, row 1).
- Semi-ring strict 2/5 (Yazio + Lifesum) — not majority but the most-visible subtype for RIAL's ICP overlap (Clara/Marcos with Yazio-user crossover probable).
- "kcal remaining" hero metric 3/5 (Yazio + Lifesum + MFP) — convergent.
- Macros below hero as a separate module 3/4 applicable (matrix §3.1, row 7).
- Meal-slot cards 4/4 applicable.
- FAB inline per slot 2/4 (Yazio + Lifesum) — weaker than expected, but the minimalist choice (no global central FAB + per-slot FAB) leans directly on competitors with aligned ICP.

**Pro:**
- Closest to Yazio + Lifesum which RIAL benchmarks the strongest against (direct EU competitors).
- Inverts jerarquía à la Yazio — "el hero es el número, el ring es backdrop" — which scales well to numbers without distracting ring fills.
- Bevel palette + shadow system (shipped PR 3) already supports this.
- Lowest risk of shape debate — two competitors already prove it reads to this ICP.

**Con:**
- MyRealFood deliberately rejects this approach (narrative card) — so RIAL adopting it leaves no diferentiation on axis "hero tone". Mitigation: adopt Real Score / Life Score as a **secondary** module (§4.4) without changing PR 8 hero.
- Semi-ring 270° open-at-bottom can look mock or decorative to users who expect full ring progress (MFP-trained eye).

**Feasibility.**
- `NutritionHero.tsx` already computes the numbers (`targetKcal` / `consumedKcal` / `remainingKcal`).
- `recharts` `RadialBar` with `startAngle={225} endAngle={-45}` renders 270° cleanly.
- Macros row = 3 `<StatTile>` primitives (already shipped) → reuse, not re-invent.
- Feature flag: `featureFlags.homeRingGrid` (already in plan) gates the swap.

### 4.2 Option B — Full-ring 360° hero + stacked macros donuts (MFP-trained)

**Shape.**
```
[Header: same as Option A]
[Hero: full ring 360° + "Restantes 1842" centered + 3-row legend right ("Objetivo / Alimentos / Ejercicio")]
[Macros module: 3 donuts stacked vertical (carbs / fats / proteins) with %DV + absolute]
[Meal-slot list sections: header + "AGREGAR ALIMENTO" per slot]
[Secondary rail: same as A]
```

**Evidence for this shape:**
- Full-ring (donut with thick outline) 2/5 (Bevel 3-ring, MFP donut = full-ring topology).
- "kcal remaining" hero 3/5.
- 3-donut macros module 2/4 (Lifesum + MFP).
- Section-header meal-slot 2/5 (MFP + partially Bevel Diario IMG_0973).

**Pro:**
- Familiar to MFP-trained users (the largest installed base). Feels "normal" to category veterans.
- Full-ring fills = more visual "progress bar" satisfaction than semi-ring.
- Legend-right pattern (Obj / Food / Exercise) educates the running-sum formula inline.

**Con:**
- Heavier visual density — 360° ring + 3-donut macros + list sections stacks more chrome.
- Copies MFP more than Yazio/Lifesum — brand position conflict (RIAL explicitly distances from "MFP clone"). See `rial-positioning.md`.
- Leaves MyRealFood narrative-card approach completely unanswered.

**Feasibility.**
- Similar to A — `recharts` `RadialBar` at 360° is actually simpler than 270°.
- 3-donut macros = 3 × small RadialBar → heavier bundle (~3 KB extra vs single ring + row).

### 4.3 Option C — Narrative-card hero (Real Score style)

**Shape.**
```
[Header: same]
[Hero card mint-green: "Real Score (RIAL Score) + subtitle + CTA 'Completar hoy'"]
[Retos del día: 3 habit badges (hydration / activity / log-closure)]
[Meal-slot cards below the fold]
```

**Evidence:**
- Hero card (no ring) 1/5 (MyRealFood only).
- Narrative/score 2/5 (Bevel 3-score + Real Score).

**Pro:**
- Maximally differentiated vs MFP/Yazio clones. Brand positioning win.
- Narrative hook invites engagement (non-tracker ICPs — Clara, Ana).

**Con:**
- **Only 1/5 competitors do this** — high single-point-of-reference risk.
- Requires a "RIAL Score" algorithm that doesn't exist yet (Q21 future). PR 8 can't ship without the score. Blocker.
- Loses the glanceable "calories left today" which is the #1 daily user need.

**Feasibility.**
- Not feasible in PR 8 scope — requires Q21 RIAL Score algorithm as dependency.

### 4.4 Recommendation: **Option A + partial C hybrid** (semi-ring hero + narrative secondary)

**PR 8 ships Option A shape.** Rationale:
1. **Convergence wins.** 4/5 ring family is the strongest signal in the matrix. Opt-out of rings (Option C alone) is a single-vendor bet.
2. **ICP overlap.** Yazio + Lifesum are the two apps the Clara/Marcos ICP is most likely to be migrating from. Mirroring their shape reduces learning-curve friction.
3. **Feasibility.** All primitives exist (`NutritionHero`, `StatTile`, `<BottomSheet>`, Bevel theme). No algorithmic dependency.

**Parallel track (NOT in PR 8):** Open a Q21 feature ticket to design the "RIAL Score" narrative metric as a **secondary module** slotted under the semi-ring hero (below macros, above meal-slots). This preserves the differentiation vector without blocking PR 8 on algorithm design.

**Macros layout decision within Option A:**
- **Pick 3-col row (Yazio pattern)** over 3-donut stack (Lifesum + MFP pattern).
- Reason: vertical density — Lifesum/MFP stacked donuts eat ~320 px of vertical space; Yazio row eats ~80 px. RIAL's Home already has water + weight + steps modules fighting for above-fold real estate. Row wins on budget.
- Values: absolute remaining (`X / Y g`) not %DV (which is paywalled in MFP anyway). Absolute reads faster for daily decision.

**ICP-adaptive decision: NO.**
- 0/5 competitors do this. Adopting it in PR 8 would be "invent without precedent + invasive refactor of the most-visited screen" — high risk, unproven pattern.
- Persona-switch lives in **Q15** as its own sprint. PR 8 ships a universal shape; Q15 layers in persona-conditional widgets (e.g., Marcos sees training-load, Clara sees mood-check prompt).

---

## 5. Anti-patterns — guardrails for PR 8 review

Review checklist for PR 8 self-review + reviewer pass. Each item in §3.3 that ≥2 competitors exhibit is blocking for RIAL:

1. **No countdown timers in Home or in any paywall RIAL surfaces.** ADR-008 already rules this out; PR 8 must not introduce promo banners with `MM:SS` labels. If a time-pressure element is genuinely needed (e.g., "rachas en 3 días → pierdes"), use a progress bar + date range, not a live countdown clock.
2. **No paywalled core-data in Home.** Macros, hero kcal, meal-slots, and basic water/weight modules are free forever. If Pro gating is needed in Home, it's a **separate module** with a lock-pill (like Bevel IMG_0982) — never a blurred overlay over existing data (anti-pattern: MFP IMG_1130, Lifesum IMG_1089–1090).
3. **No persistent "upgrade" header pill.** The RIAL header has brand + streak + notifications — no always-on upgrade CTA. Pro discovery lives inside paywall-entry surfaces (Settings → RIAL+, AI Coach, etc.).
4. **No AdMob / third-party ads in Home or any tracking surface.** Single-tier premium model (ADR-008). Never recover monetization via ad networks.
5. **No dark-pattern content-obscuring.** If a data view requires Pro, render it as a call-to-action card ("Desbloquea Factores de calidad →") not a blurred-overlay-over-fake-content.
6. **No "DESCUENTAZO 🎉" urgency copy.** Paywall copy remains calm + informative (see ADR-008 tone).
7. **No crossed-out anchor prices.** Trial messaging uses Bevel's "Hoy / Día 12 / Día 14" timeline (ADR-008). No `~~59.99€~~ → 29.99€` framing.
8. **No `👑` crown icons on inputs.** Premium features show up as separate cards or lock-pills, never as icons polluting a free input's label.
9. **No emoji 3D 'stale iOS 6' illustrations.** Iconography uses `lucide-react` (already the convention).
10. **No reverse-trial (auto-renew without opt-in).** ADR-008 specifies explicit opt-in before trial starts.

---

## 6. Decision matrix feeding PR 8

### 6.1 Write set (concrete, derived from §4.4 recommendation)

| File | Change | Depends on |
|---|---|---|
| `src/lib/featureFlags.ts` | Add `homeRingGrid: boolean` (default `false`) | — |
| `src/features/home/components/NutritionHero.tsx` | Rewrite: semi-ring 270° via `recharts` `RadialBar` + number hero 36px bold + 3-col macros row below | `src/lib/featureFlags.ts`, `src/components/StatTile.tsx` |
| `src/features/home/screens/Home.tsx` | Under flag: new hero mounts before meal-slot rail; without flag: current `NutritionHero` + `ProgressPreviewCard` preserved | `NutritionHero.tsx` |
| `src/features/wellness/components/ProgressPreviewCard.tsx` | Respect flag (hide when `homeRingGrid=true` — moves to Progress tab only) | flag |
| `src/test/conventions/home-hero.test.ts` (new) | Lock: flag default false, flag off = current shape (no regression), flag on = new hero renders semi-ring + 3-col macros | flag + new hero |
| `src/i18n/locales/es.ts` + `en.ts` | +5–10 keys (`hero.remaining`, `hero.consumed`, `hero.target`, `hero.exercise`, macros row labels if not covered) | — |
| `CHANGELOG.md` | Entry `[1.5.43]` or next available | — |
| `docs/ai/state.md` | PR 8 snapshot + baseline update (tests count, i18n count, bundle delta) | — |

### 6.2 Gate-lifting criterion — does PR 8 enter S4?

Per plan file §S2.2, PR 8 enters S4 only if **all 3 conditions hold**:

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | **Convergence threshold** — ≥3 of 5 competitors cluster in the same hero-shape family | **✓ MET** | 4/5 ring family (Bevel + Yazio + Lifesum + MFP). MyRealFood is the outlier. Matrix §3.1 row 1. |
| 2 | **Macros layout decided** — ≤2 candidates with pro/con explicit + ADR-009-V3 compatible | **✓ MET** | Reduced to (a) 3-col row Yazio and (b) 3-donut stack Lifesum/MFP. Recommendation §4.4 picks (a). Both pass ADR-009 (no sheet involvement). |
| 3 | **Anti-patterns catalogued** — ≥3 concrete guardrails | **✓ MET** | 10 anti-patterns in §3.3, 5 of which hit ≥2 competitors. Guardrails list in §5. |

**Gate status: GREEN.** PR 8 can enter S4 as single-shot (no 8a/8b split needed).

### 6.3 Rollback path

If post-merge the new hero causes user confusion or regression:
- Feature flag `homeRingGrid=false` reverts to current shape. Zero-cost rollback.
- No data-model change. No persistence migration. No i18n key removal (keys stay for future re-enable).
- Convention test asserts **both** shapes render, so `flag=false` path can't silently break.

### 6.4 What PR 8 does NOT do

Explicitly out of scope — these are parallel tracks or later PRs:
- **ICP-adaptive layout.** Q15 sprint. §4.3 established the precedent (0/5).
- **RIAL Score narrative hero.** Q21 feature ticket. §4.4 keeps Option C as secondary module only.
- **Long-press FAB action grid.** Q15+ (Bevel IMG_0997 pattern). Creation CTA for PR 8 = existing FAB.
- **Diet-plan-as-lens.** Q15 orthogonal. Lifesum pattern not in PR 8.
- **Pantry-smart discovery.** Q6+ requires Pantry data integration.
- **Weekly meal planner on Home.** MyRealFood unique pattern. RIAL keeps Planner as separate feature.
- **Real-time synced streak ring.** Depends on Q6 Supabase. Not PR 8.
- **Share-card / export-to-social.** Q15+ `<ShareCard>` primitive (Bevel IMG_0975/0999).

---

## 7. Open questions (for owner sign-off)

These remain after synthesis. Defaults listed; owner override via "continua con [alt]" or explicit directive.

1. **Hero ring shape — semi-ring 270° vs full-ring 360°?**
   - Default (§4.4): semi-ring 270° (Yazio/Lifesum pattern). Lower visual density, ICP overlap stronger.
   - Alt: full-ring 360° (Bevel/MFP pattern). Heavier ring, more "progress bar" satisfaction.
   - Decision gate: if owner has strong preference, revisit §6.1 write set.

2. **Macros row values — absolute vs %DV?**
   - Default: absolute remaining (`X / Y g`) — reads faster.
   - Alt: %DV + absolute dual (Lifesum pattern) — more info density.

3. **Macros layout — 3-col row vs 3-donut stack?**
   - Default: 3-col row (vertical budget win, §4.4).
   - Alt: 3-donut stack (Lifesum visual polish, but +240 px vertical cost).

4. **Bottom rail modules (water/weight/steps/mood) — preserve current or redesign?**
   - Default: preserve (out of PR 8 scope — existing modules not being touched).
   - Alt: consolidate to a 2×N tile grid (Bevel IMG_0976 pattern) — defer to Q15.

5. **Real Score secondary module — include in PR 8 as placeholder or defer?**
   - Default: defer entirely (not in write set). Open Q21 ticket.
   - Alt: include as "coming soon" disabled card — but introduces dead UI; not recommended.

---

## 8. References

- Bevel playbook: `docs/market/bevel-design-playbook.md` §4.3 (info design), §4.4 (sheet anatomy), §4.10 (ConstantTile)
- Yazio playbook: `docs/market/yazio-design-playbook.md`
- Lifesum playbook: `docs/market/lifesum-design-playbook.md`
- MyFitnessPal playbook: `docs/market/myfitnesspal-design-playbook.md`
- MyRealFood playbook: `docs/market/myrealfood-design-playbook.md`
- ADR-008 Pricing model: `docs/adr/ADR-008-pricing-model.md`
- ADR-009 BottomSheet anatomy (+ V2 + V3): `docs/adr/ADR-009-bottom-sheet-anatomy.md`
- RIAL positioning: `docs/market/rial-positioning.md`
- Feature matrix: `docs/market/feature-matrix.md`
- Plan file: `.claude/plans/revisa-todas-las-capturas-ancient-micali.md` §S2

---

**Deliverable status (S2.1).**
- §1–3: descriptive (matrices + clustering).
- §4–5: synthesis + guardrails.
- §6: concrete write set + gate check (**GREEN**).
- §7: open questions for owner.
- §8: references.

**Next action.** S2.2 gate-check is complete in §6.2 → PR 8 enters S4 as single-shot. Owner "continua" required before arranque.
