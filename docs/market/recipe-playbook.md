# Recipe Patterns Benchmark — Cross-competitor synthesis

> **Purpose.** Feed sprints R2–R7 of the recipe/cooking/diccionario roadmap (`.claude/plans/revisa-todas-las-capturas-ancient-micali.md`) with evidence across recipe-relevant competitors — not a Kitchen-Stories-only opinion. Output of sprint R1.4.
>
> **Scope.** Recipe surfaces only: recipe detail, step-by-step/cook mode, ingredient/diccionario UX, library (saved recipes), discovery (Cocina grid), and attribution. Home/Tracking hero is out of scope (see `home-patterns-benchmark.md` shipped in `608d78f`). Onboarding is out of scope (PR 9 territory).
>
> **Method.** Synthesis across pre-existing per-competitor playbooks — not a new research pass. Inputs:
> - `docs/market/kitchen-stories-design-playbook.md` (17 caps IMG_1141–1159) — **primary recipe reference (magazine editorial)**
> - `docs/market/nyt-cooking-design-playbook.md` (16 caps IMG_1160–1168 + 1233–1239) — **primary recipe reference (newspaper editorial)**
> - `docs/market/myrealfood-design-playbook.md` (19 caps IMG_1169–1188) — ES local competitor, lateral signal (community UGC + verified badge)
> - `docs/market/lifesum-design-playbook.md` (39 caps IMG_1056–1095) — lateral signal (diet-plan-as-lens + food rating)
> - `docs/market/yazio-design-playbook.md` (11 caps IMG_1096–1106) — lateral signal (recipes-by-kcal bucket + collection cards)
>
> **Exclusion — INDYA.** The 33-cap INDYA playbook (`indya-design-playbook.md` R1.2 output) documented INDYA as LOW recipe-relevance — coach-led nutrition plan, zero recipe library, no cook mode. Its patterns (paywall polish, meal-schedule, taxonomía trinaria prohibido/favorito) are orthogonal to R2–R7 and feed Q6/Q17/Q19 instead.
>
> **Author note.** Per-app descriptive content stays in each playbook. This doc only answers: **what are the converging recipe patterns, where does each diverge, and what shape should R2–R7 take?**
>
> Created: 2026-04-19 PM. Reviewer: owner must sign via "continua" or shape-override before R2 enters execution.

---

## 1. Methodology + scope

### 1.1 Competitors included

| Competitor | Why included | Recipe-relevant caps | Playbook status |
|---|---|---|---|
| **Kitchen Stories** | Magazine-editorial benchmark. Chef attribution + serif titles + sticky "Start cooking" pill + step photo bleed. | All 17 caps recipe-centric (Home feed, detail, cook-mode, reviews) | shipped (S2.0 `aebba2e`) + §9 applicability annex (R1.1) |
| **NYT Cooking** | Newspaper-editorial benchmark. Classical serif + author-as-hyperlink + Mark as Cooked + Private Notes + Recipe Box folders + Inspiration video-first tab. | All 16 caps recipe-centric (detail, search grid, Recipe Box, Inspiration) | shipped (R1.3) |
| **MyRealFood** | Local ES rival. Verified-recipes pill púrpura + heart-count overlay + pantry-aware discovery + community UGC at scale. | ~10 caps recipe-relevant out of 19 (IMG_1177 planner, 1180 Real Score, 1182–1184 discovery, 1187–1188 filters) | shipped (S2.0 `aebba2e`) |
| **Lifesum** | Diet-plan-as-lens. Recetas tab driven by active meal plan, slot-sectioning, trending carousel. Food-rating numeric score (1–10) on recipes. | ~8 caps recipe-relevant (IMG_1067, 1077, 1080–1090) | shipped (S2.0 `aebba2e`) |
| **Yazio** | Recetas-por-rango-calórico (unique bucket filter). Collection card 16:9 hero + count badge. | ~2 caps recipe-relevant (IMG_1103 categories, 1105 collection card) | shipped (S2.0 `aebba2e`) |

### 1.2 Competitors excluded (and why)

| Competitor | Exclusion reason |
|---|---|
| **INDYA** | LOW recipe-relevance documented in `indya-design-playbook.md`. Coach-led plan delivered by human nutritionist; no recipe library, no cook mode, no step-by-step. Patterns orthogonal (feed Q6/Q17/Q19 sprints). |
| **Bevel** | Zero recipes (wellness-first). Home + Constantes focus. |
| **MyFitnessPal** | Has recipes but purely as food-log entries, no editorial cook-mode. MFP patterns already benchmarked for Home/tracking, not recipes. Job mismatch. |
| **Whoop / Cronometer / MacroFactor** | Whoop is sensor-first, no recipes. Cronometer/MacroFactor are data-tables, not editorial. |
| **Noom / WW** | Lifestyle-coaching. Recipes exist but wrapped inside coaching content. Out of RIAL's ICP axis for R2–R7. |
| **Paprika / Yummly / Samsung Food** | Pure recipe managers without tracker integration. Paprika's paste-bulk ingredient parser is documented lateral in R7.1 plan. Not required for synthesis shape. |

**Net sample.** 5 recipe-relevant competitors covering the spectrum from pure-editorial (KS, NYT) through hybrid tracker+recipes (Lifesum, Yazio) to community UGC (MyRealFood). Sufficient convergence signal for R2–R7 shape decisions.

### 1.3 Scope boundaries

- **In scope:** recipe detail anatomy, cook-mode flow, ingredient UX, times/portions, chef/author attribution, saved-recipes library, Cocina grid discovery, collections, empty states, verified-tier treatment.
- **Out of scope:** AI-generated recipes (future Q6+), shopping-list generation (exists), pantry-matcher (Q15+), video production (requires creators), paywall body UI (ADR-008 shipped), home hero (benchmark shipped).
- **No competitor-direct copy.** Deliverable is clustering + recommendation feeding the concrete R2–R7 write sets already sketched in the plan file.

---

## 2. Agnostic dimensions — the 7 questions per competitor

Each competitor's recipe surface characterised by the same 7 axes. Answers are the raw input for §3 convergence matrix; per-competitor detail lives in each playbook.

| # | Dimension | What we're asking |
|---|---|---|
| Q1 | Hero treatment | Does the recipe detail open with a photo-to-edge "bleed" or a carded photo? |
| Q2 | Step display | Are steps per-screen (cook-mode) with photos intercalated, or inline-list? |
| Q3 | Cook-mode CTA | Is there a dedicated "Start cooking" gate, and where does it sit? |
| Q4 | Ingredient UX | Per-step sub-list, overall list, or both? Check-off present? |
| Q5 | Times + portions | How are Prep/Cook/Rest + servings rendered — tiles, textual row, dropdown? |
| Q6 | Attribution | Who made this? Chef card, byline link, community handle, or silent? |
| Q7 | Empty-state in library | What does "no saved recipes yet" look like? Folder scaffolding, CTA, or both? |

Condensed answers (one row per competitor, per dimension).

### Q1 — Hero treatment

| Competitor | Shape | Dimensions | Chrome over photo |
|---|---|---|---|
| Kitchen Stories | **Photo-to-edge bleed** (no card, no gradient overlay) | ~450 px (~65% viewport) | Back-chevron circular white-halo + share/heart top-right pareados |
| NYT Cooking | Card ~280 px with small icon to escape-to-fullscreen | ~280 px | Back + share + bookmark + comments-count top icons |
| MyRealFood | Photo-bleed in recipe detail (implicit from recipe cards in IMG_1184/1187) | ~400 px | Heart-count overlay bottom-right pill |
| Lifesum | Hero photo full-width "por Lifesum" attribution below (IMG_1089) | ~300 px | Back + save top |
| Yazio | Recipe collection card 16:9 hero (IMG_1105) — collection-level, not detail | ~190 px @ 16:9 | Title overlay + count badge |

### Q2 — Step display

| Competitor | Pattern | Photo-per-step? | Numbered banners? |
|---|---|---|---|
| Kitchen Stories | Per-step **banner beige peach "Step N/M"** + ingredients sub-list + text + photo full-width | ✓ Yes (IMG_1148/1149/1150) | ✓ Yes `Step 1/3` banner |
| NYT Cooking | Section `PREPARATION` divider + `Step 1` bold sans-serif header + serif body | ✗ No photos per step | ✓ Yes `Step 1` / `Step 2` headings |
| MyRealFood | Not visible in captures (recipes open to external blog per IMG_1187?) | — | — |
| Lifesum | Recipe detail not audited deeply; sections present but no per-step photos observed | — | — |
| Yazio | Not audited (collection-level only) | — | — |

### Q3 — Cook-mode CTA

| Competitor | Placement | Style | Persistence |
|---|---|---|---|
| Kitchen Stories | **Sticky pill `Start cooking!` verde** full-width, bottom of viewport, floats over scroll | Green pill rounded-full | ✓ Persistent across detail scroll |
| NYT Cooking | **Inline outline CTA `Start Cooking`** inside `PREPARATION` section header | Outline cream full-width | ✗ Inline, scroll past it |
| MyRealFood | Not observed (recipes may open to external blog) | — | — |
| Lifesum | "EMPEZAR PLAN" pill translucent-white on diet plan detail (IMG_1077) — not per-recipe | — | — |
| Yazio | Not observed per-recipe | — | — |

### Q4 — Ingredient UX

| Competitor | List strategy | Check-off | Per-step sub-list |
|---|---|---|---|
| Kitchen Stories | Overall list on detail + **per-step mini-list** in cook-mode (emoji cart icon + inline) | Not observed | ✓ Yes (IMG_1148/1150) |
| NYT Cooking | Overall list on detail with Yield + `1x v` multiplier + `Add ingredients to Grocery List` CTA | Not observed in captures | ✗ No |
| MyRealFood | Not observed detailed | — | — |
| Lifesum | Recipe detail has editable portion selector + slot-picker (IMG_1089) | — | — |
| Yazio | Not audited recipe-detail level | — | — |

### Q5 — Times + portions

| Competitor | Times rendering | Portions control |
|---|---|---|
| Kitchen Stories | **3 time-tile circles** with mini-arc ring: `Preparation / Baking / Resting` (IMG_1147/1154) | Servings stepper `- 2 +` inline |
| NYT Cooking | **Textual meta row** `Time 20 min (Prep 5 min \| Cook 15 min) \| Rating 5 ★★★★★ (638) \| Comments 61` | Yield dropdown `1x v` |
| MyRealFood | Not audited times detail | — |
| Lifesum | Editable portion selector + slot-picker inline (IMG_1089) | Portion editable |
| Yazio | Collection tile shows `58 recetas` count at collection level | — |

### Q6 — Attribution

| Competitor | Pattern | Linkable? |
|---|---|---|
| Kitchen Stories | **Chef card**: avatar 48px + name bold + cargo ("Social Media Manager at Kitchen Stories") + personal-intro paragraph with `Read more` | ✓ Implicit (chef has profile presumably) |
| NYT Cooking | **Byline inline underlined** `By Andy Baraghani` bold + credits line under hero photo ("David Malosh for The NYT. Food Stylist: ...") | ✓ Yes, author link |
| MyRealFood | Community handle @username on UGC cards + heart-count overlay (IMG_1184/1187) | ✓ Yes, social handle |
| Lifesum | "por Lifesum" neutral label (brand-as-author) | ✗ No user/chef link |
| Yazio | Not observed at recipe level | — |

### Q7 — Empty-state in library

| Competitor | Empty-state style |
|---|---|
| Kitchen Stories | Not observed; "My Recipes" bottom-nav tab likely has empty state — not audited |
| NYT Cooking | **Recipe Box folders scaffolding** (IMG_1164): `Favorites` + `Want To Cook` cards with outline icons + `No recipes yet` subcopy, `+ New` folder CTA |
| MyRealFood | Not observed library empty |
| Lifesum | Not observed directly |
| Yazio | Favoritas empty state caps present but not deep-read (IMG_1099 Mis favoritas) |

**Cluster insight (Q7):** NYT is the **only** competitor with folder-as-scaffolding empty state — others leave library bare. RIAL's R3 (Cocina collections) should adopt curated-first (§3.4 below) rather than folder-scaffolding.

---

## 3. Cross-cluster matrix — the critical table

Scoring convention: `X/5` means "X of 5 competitors do this". `—` means "not applicable or not observed". Bold = convergent (≥3/5 with applicability).

### 3.1 Recipe detail shape

| Dimension | KS | NYT | MRF | Lifesum | Yazio | Cluster | Convergent? |
|---|---|---|---|---|---|---|---|
| **Photo-bleed hero (no card, edge-to-edge)** | ✓ | ✗ (card) | ✓ | ✓ | — | **3/4** | **YES (applicable subset)** |
| Serif title (magazine or newspaper) | ✓ (magazine) | ✓ (newspaper) | ✗ | ✗ | ✗ | 2/5 | No |
| **Chef/author attribution present** (any shape) | ✓ (card) | ✓ (byline link) | ✓ (@handle) | ~ (brand) | ✗ | **3/4** | **YES (applicable)** |
| Sticky "Start cooking" CTA over scroll | ✓ | ✗ | — | — | — | 1/1 | N/A (KS unique among applicable) |
| Social-proof count (likes or ratings or comments) prominent | ✓ (65.8K / ★ + reviews) | ✓ (★ + comments inline meta) | ✓ (heart-count overlay) | ~ (score 1–10) | ✗ | **3/4** | **YES** |
| Mark as Cooked boolean + `Rate` inline footer | ✗ | ✓ | ✗ | ✗ | ✗ | 1/5 | No (NYT unique) |
| Private Notes textarea per-recipe | ✗ | ✓ | ✗ | ✗ | ✗ | 1/5 | No (NYT unique) |

### 3.2 Step/cook-mode shape

| Dimension | KS | NYT | MRF | Lifesum | Yazio | Cluster | Convergent? |
|---|---|---|---|---|---|---|---|
| **Step banner/header explicit** (`Step N/M` or `Step 1`) | ✓ | ✓ | — | — | — | **2/2** | **YES (of applicable)** |
| Photo per step intercalated in scroll | ✓ | ✗ | — | — | — | 1/2 | No (KS unique) |
| Per-step ingredient sub-list (not global) | ✓ | ✗ | — | — | — | 1/2 | No (KS unique) |
| Ingredient check-off (transient tick during cooking) | not observed | not observed | — | — | — | 0/2 | No (gap across benchmark) |
| Mise-en-place pre-cook screen | not observed | not observed | — | — | — | 0 | No (RIAL novel) |

### 3.3 Times + portions + ingredients

| Dimension | KS | NYT | MRF | Lifesum | Yazio | Cluster | Convergent? |
|---|---|---|---|---|---|---|---|
| 3-time-tile visual (Prep/Cook/Rest with arc) | ✓ | ✗ | — | — | — | 1/2 | No (KS unique visual; NYT goes textual) |
| Textual time row `Time (Prep \| Cook)` | ✗ | ✓ | — | — | — | 1/2 | No |
| Servings stepper `- N +` | ✓ | ✗ | — | ✓ | — | 2/3 | Tied |
| Yield dropdown `1x v` | ✗ | ✓ | — | — | — | 1/3 | No |
| `Add ingredients to Grocery List` CTA prominent | ~ (implicit via app) | ✓ | — | — | — | 1/2 | Weak |

### 3.4 Library/discovery shape

| Dimension | KS | NYT | MRF | Lifesum | Yazio | Cluster |
|---|---|---|---|---|---|---|
| **Grid 2-col of recipe cards in collection view** | ✓ (IMG_1159) | ~ (Recipe Box cards) | ✓ (IMG_1183) | ✓ (IMG_1084/1085) | ~ (grid 3×2 IMG_1103) | **4/5** |
| Visual category tiles (photo + label overlay) at top-level | ~ (Editor's Choice tabs) | ✓ (IMG_1162 3×3 tiles) | ✓ (IMG_1183 tiles) | ✗ (section headers) | ✓ (IMG_1103) | **3/5** |
| **"Verified"/curated badge differentiation** | ~ (editorial-vs-Community) | ✗ | ✓ (pill púrpura) | ~ (STANDARD OF LIFESUM chip) | ✗ | **2–3/5** |
| Active filter chip with removable `x` | ✗ | ~ (Cooked pill) | ✓ | ✓ (IMG_1085) | ~ | **3/5** |
| Active diet/plan-as-lens filter | ✗ | ✗ | ✗ | ✓ (unique — diet plan lens) | ✗ | 1/5 |
| Recetas-by-kcal-bucket filter | ✗ | ✗ | ✗ | ✗ | ✓ | 1/5 |
| Related-recipes carousel at detail bottom | ✓ | ✓ | — | — | — | **2/2** |

### 3.5 Anti-patterns catalog (guardrails for R2–R7)

| Anti-pattern | KS | NYT | MRF | Lifesum | Yazio | Incidence |
|---|---|---|---|---|---|---|
| **Paywall over-already-visible-nutrition (blur overlay)** | ✗ | ✗ | ✗ | ✓ (IMG_1089–1090 ficha nutricional blurred) | ✗ | 1/5 |
| **Persistent gate strip "Subscribe" header** | ✗ | ✓ (IMG_1165–1168 cream strip) | ✗ | ~ (chip `ACTUALIZAR`) | ✗ | 1–2/5 |
| **Dismissible top banner "Try 7 days free"** | ✓ (IMG_1141 beige dismissible) | ✗ | ✗ | ✗ | ✗ | 1/5 |
| **Paywalled entire ficha nutricional** (not just Pro features) | ✗ | ✗ | ✗ | ✓ | ✗ | 1/5 |
| **External-blog redirect** (not in-app recipe) | ✗ | ✗ | ~ (IMG_1187 hints at external content?) | ✗ | ✗ | 1/5 |
| **Video autoplay without CC/audio mute control** | ✗ | ✓ in Inspiration tab? (CC + audio controls present — NOT anti-pattern) | ✗ | ✗ | ✗ | 0/5 |
| **"Start Cooking" CTA buried** (no sticky, scroll past it) | ✗ | ✓ (inline only) | — | — | — | 1/2 applicable |
| **Hard subscription gate (non-dismissible) on recipe detail** | ✗ | ✓ | ✗ | ✗ | ✗ | 1/5 |
| **Countdown timer urgency in recipe/paywall** | ✗ | ✗ | ✓ (MRF IMG_1182 `12h 33m`) | ✗ | ✓ (`00:57:36` IMG_1105) | 2/5 |
| **DESCUENTAZO/fake-discount copy** | ✗ | ✗ | ✓ | ✗ | ✓ | 2/5 |

**Net catalogued.** 10 anti-patterns, 3 with ≥2-competitor incidence (blurred paywall + countdown urgency + descuentazo). RIAL's ADR-008 already rules these out at the pricing level — R2–R7 reviews must cross-check against §5 guardrails below.

### 3.6 Unique single-source patterns worth studying

These are patterns only one competitor exhibits but worth picking up independently of convergence.

| Pattern | Source | Relevance for RIAL / target sprint |
|---|---|---|
| **Sticky "Start cooking!" pill full-width** | KS IMG_1147/1148/1149 | **R2** — shipped doctrine per `kitchen-stories-design-playbook.md` §9.3 |
| **3 time-tile circles with arc ring (Prep/Cook/Rest)** | KS IMG_1147/1154 | **R2** — `TimeTileComposite.tsx` primitive per plan |
| **Per-step ingredient sub-list** | KS IMG_1148/1150 | **R5** — `recipe.steps[i].ingredientIds?: string[]` optional extension |
| **Step banner beige peach `Step N/M`** | KS IMG_1148 | **R5** — `CookMode.tsx` step-indicator color + typography |
| **Mark as Cooked boolean footer** | NYT IMG_1168 | **R2** — `recipe.cookedAt?: string[]` cheap data win |
| **Private Notes textarea per-recipe** | NYT IMG_1168 | **R7** — `recipe.personalNote?: string` |
| **Author byline as hyperlink** (not decoration) | NYT IMG_1165/1237 | **R2** — `AuthorAttributionCard` variant `inline` |
| **Credits line under hero photo** | NYT IMG_1237 | **Skip V1** — requires `photoCredit` / `foodStylist` fields |
| **Search grid 2×N visual tiles with hero-recipe photo background** | NYT IMG_1162 | **R3** — `collections.ts` gains `heroRecipeId` field |
| **Inspiration video-first tab** (curated editorial, not UGC TikTok) | NYT IMG_1163/1236/1239 | **Skip V1** — requires creator production (Q21+) |
| **Recipe Box folders-as-files** | NYT IMG_1164 | **Skip V1** — Q20+ user-defined collections |
| **Heart-count overlay pill on community cards** | MRF IMG_1184/1187 | **R3** (optional) — `RecipeCard` with `favoritesCount` when `origin === 'community'` |
| **Verified pill púrpura for nutritionist-curated** | MRF IMG_1184/1188 | **R2** — `recipe.verified: 'rial' \| 'creator' \| null` with differential chip |
| **Pantry-aware "¿Qué tienes en la nevera?" chip row** | MRF IMG_1182 | Q15+ Pantry integration — **NOT R2–R7** |
| **Diet-plan-as-lens** (active plan modifies Recetas tab filter + recommendations) | Lifesum IMG_1084 | Q15+ — ICP/diet axis, orthogonal |
| **Food rating numeric 1–10 on recipe card** | Lifesum IMG_1067 | Q21+ — requires Real Score algorithm |
| **Bottom paywall banner (no content obscure)** | Lifesum IMG_1088 | Consistent with ADR-008 — RIAL can adopt |
| **Recetas-por-rango-calórico grid 3×2** | Yazio IMG_1103 | **R3** (optional) — `collections.ts` auto-generated bucket collection |
| **Recipe collection card 16:9 hero + count badge** | Yazio IMG_1105 | **R3** — collection carousel/grid card shape |

---

## 4. Recipe playbook for RIAL — 3 options with pro/con

Given the matrix, **what shape should R2 (verified tier + RecipeDetail polish) take?** Three options, recommendation at end.

### 4.1 Option A — Tiered editorial (recommended)

**Shape.** `recipe.verified !== null` receives editorial treatment (photo-bleed hero + serif title via `--font-serif` Fraunces + chef card + sticky "Start cooking!" + 3-time-tile composite + Mark as Cooked). User-saved recipes keep current layout (carded hero + Inter title + savedAt date + existing time pill row). Both layouts live in the same primitive file, branched by `recipe.verified !== null && flag`.

**Evidence:**
- Photo-bleed hero 3/4 applicable (§3.1 row 1).
- Chef/author attribution 3/4 applicable (§3.1 row 3).
- Social-proof count 3/4 applicable (§3.1 row 5).
- Serif title 2/5 — not majority, but the only two **recipe-editorial** benchmarks (KS magazine, NYT newspaper) converge on serif as the shape-differentiator.
- Sticky CTA 1/2 (KS unique among sticky-vs-inline) — stronger action-coupling than NYT inline.

**Pro:**
- Matches the owner directive ("treatment tiered — verified gets editorial, user-saved stays clean").
- Lowers risk: user-saved layout (majority of N) untouched. Flag default false keeps regression zero.
- All patterns have ≥1 established precedent; no invented UX.
- Feature-flag `verifiedRecipePolish` gates rollout, one-commit rollback path.

**Con:**
- Requires two branches in `RecipeDetail.tsx` — cognitive cost for maintainers.
- Introduces `--font-serif` = ~100 KB WOFF2 (Fraunces variable) — bundle impact.
- "Two RIAL distintos" perception risk: verified recipe looks premium, user-saved looks downgraded. Mitigated by §9.5 layout-parity rule in KS playbook (grid card layout stays uniform; only detail view diverges).

**Feasibility.**
- All primitives reusable or composable (`HeroGallery` gains `bleed` variant, `SectionCard`, `StatTile`/`ConstantTile` doctrine for time tiles).
- New primitives: `TimeTileComposite` + `AuthorAttributionCard` + sticky-CTA pattern (not yet extracted — could live as inline pattern in `RecipeDetail.tsx`).
- Seed work: mark 8–10 official RIAL recipes as `verified: 'rial'`.

### 4.2 Option B — Universal editorial (copy KS to all recipes)

**Shape.** All recipes get photo-bleed + serif title + chef card + sticky CTA + 3-time-tile regardless of `verified` status. Single layout, no tier.

**Evidence:**
- KS itself does this — all recipes in their catalog get the same editorial treatment.
- Simplest mental model.

**Pro:**
- One layout, one primitive, zero branching. Easier to maintain.
- "RIAL recipes all feel premium" — brand message.
- No "two RIAL distintos" risk.

**Con:**
- **User-saved recipes lack chef data, photo-pro, ratings** — the editorial frame looks empty or fake for them.
- Forces every created/imported recipe to have a credible author — breaks the "my quick recipe" ergonomics.
- Serif on a user-typed 3-step dinner recipe looks pretentious — tone mismatch.
- Doesn't match owner directive (R1 explicit: treatment tiered).

**Feasibility.** Trivially feasible but tone-mismatch regression is the blocker. **Rejected** per owner directive.

### 4.3 Option C — Per-screen treatment (spread polish across surfaces without `verified` data-model change)

**Shape.** Skip `Recipe.verified` field entirely. Apply KS/NYT patterns selectively: Mark as Cooked on all recipes, sticky CTA on all, time-tile on all. No chef card, no serif, no photo-bleed. Keep user-saved layout as-is minus the tile upgrades.

**Evidence:**
- Cherry-picks universal patterns (sticky CTA + time-tile + Mark as Cooked) across the benchmark.
- No data-model change; zero migration risk.

**Pro:**
- Minimal data-model friction.
- Still ships the strongest action-level upgrade (sticky CTA improves cook-start UX regardless of tier).

**Con:**
- Leaves the editorial differentiation unclaimed — RIAL recipe detail visually indistinguishable from a MFP clone.
- Misses the "verified tier" product story that R3 (Cocina "Verificadas" chip) assumes.
- Blocks R3 filter "Verificadas" from shipping meaningfully.

**Feasibility.** Feasible but underwhelming. **Rejected** — R3 chip needs R2 data-model foundation.

### 4.4 Recommendation: **Option A (tiered editorial, flag-gated)**

**R2 ships Option A.** Rationale:
1. **Owner directive alignment** — "treatment tiered" explicit in R1 brief.
2. **Evidence convergence** — photo-bleed 3/4, attribution 3/4, social-proof 3/4 all applicable-subset convergent.
3. **Risk profile** — flag default `false` + one-commit rollback + layout-parity rule protects against "two RIAL" perception.
4. **Build sequence** — R2 foundation unlocks R3 chip, R5 per-step ingredients, R7 creator-as-verified path. Skipping verified tier (Option C) blocks 3 downstream sprints.

**Decisions within Option A:**
- **Serif choice: Fraunces** (variable font, ~100 KB WOFF2, softness axis covers both magazine and newspaper tones). Fallback Source Serif 4 if bundle becomes critical.
- **Time-tile shape: 3-tile with arc-ring** (KS pattern, not NYT textual row). Arc-ring scales visually with `<StatTile>`/`<ConstantTile>` doctrine already shipped.
- **Attribution shape: `AuthorAttributionCard` with `variant` prop**:
  - `'card'` — chef avatar + name + cargo + personal intro (KS pattern, verified-only).
  - `'inline'` — byline underlined-optional (NYT pattern, verified-only alternative).
  - `'savedDate'` — "Guardada el DD/MM" (user-saved default).
  - `'creator'` — @handle + `Follow` link (R7 creator verified path).
- **Mark as Cooked: universal** (not verified-only) — `recipe.cookedAt?: string[]` cheap data win. Ships in R2 regardless of flag.
- **Sticky CTA: verified-only** initially. Re-evaluate post-R2 whether to universalize.

**What R2 explicitly does NOT do:**
- **Rating UGC** — defer to Q20+. Mark as Cooked ships as boolean-only.
- **Private Notes textarea** — defer to R7 (contiguous with CreateRecipe flow).
- **Photo credits / food stylist line** — defer (no data source).
- **Video Inspiration tab** — defer Q21+ (requires creator production).
- **Folder-based library** — R3 ships curated collections only; user-defined folders defer to Q20+.
- **Heart-count overlay on community cards** — defer until UGC source is wired (Q21+).
- **Pantry-aware discovery** — Q15+ (Pantry integration).

---

## 5. Anti-patterns — guardrails for R2–R7 review

Review checklist for each sprint review pass:

1. **No blurred-overlay paywall over visible data.** Ficha nutricional never obscured with "Upgrade to see" blur. Lifesum IMG_1089 pattern is banned (consistent with ADR-008).
2. **No non-dismissible hard gate strip** on recipe detail. NYT-style cream strip is acceptable **if** dismissible with localStorage persistence.
3. **No external-blog redirects.** All recipes render in-app (even imported ones preserve their parsed content).
4. **No countdown timers / DESCUENTAZO copy.** ADR-008 governs; R2/R7 must not introduce.
5. **No crown `👑` icons on verified labels.** Verified pill uses ✓ + color differentiation (púrpura or `--brand-secondary`), never emoji premium markers.
6. **Step banner color must reuse tokens.** No literal `#fdf2e9` peach — use `bg-surface-container-low` + existing token (ADR-002).
7. **Serif token `--font-serif` must have `font-display: swap`.** No blocking load.
8. **`TimeTileComposite` must not break layout-parity rule** (KS §9.5) — when rendered on verified recipe in Cocina grid card context (not detail), must visually match user-saved card footprint.
9. **Mark as Cooked must not require rating** in R2 (defer rating UGC to Q20+).
10. **No auto-publish of user-created recipes.** `verified: 'creator'` requires `userProfile.isVerifiedCreator === true` flag (R7).
11. **Photo-bleed hero must preserve back-chevron + actions top** in circular-halo-on-photo treatment (KS pattern) with `min-h-11 min-w-11` HIG + `aria-label`.
12. **Serif scoped to titles only.** No `--font-serif` on body text, step text, ingredient list, or CookMode step content. Inter remains the app-wide body.

---

## 6. Write set + gate check feeding R2–R7

### 6.1 Sprint-by-sprint mapping (derived from §4.4 recommendation)

| Sprint | Patterns adopted | Files primarios | Data model |
|---|---|---|---|
| **R2** (verified tier + RecipeDetail polish) | Photo-bleed hero (verified), serif title (Fraunces), chef/author card, sticky "Start cooking!" (verified), 3-time-tile composite, Mark as Cooked (universal), verified chip in Cocina | `src/types/recipe.ts` (+`verified`, `+cookedAt`), `src/features/recipes/screens/RecipeDetail.tsx`, `src/features/recipes/components/TimeTileComposite.tsx` **new**, `src/features/recipes/components/AuthorAttributionCard.tsx` **new**, `src/features/recipes/screens/Cocina.tsx` (+ chip), `src/lib/featureFlags.ts` (+`verifiedRecipePolish`), `src/features/food/data/seed-recipes.ts` (mark 8–10 as `verified: 'rial'`), `src/index.css` (+`--font-serif` Fraunces), convention test `recipe-verified.test.ts` **new**, i18n +7 keys × 2 | `Recipe.verified?: 'rial' \| 'creator' \| null`, `Recipe.cookedAt?: string[]` |
| **R3** (Cocina polish + collections) | Grid 2×N visual tiles with hero-recipe photo per collection (NYT IMG_1162 pattern), related-recipes carousel (convergent §3.4 bottom row), active-filter removable chips, verified filter chip, empty-state with CTA | `src/features/recipes/data/collections.ts` **new** (6–8 curated with `heroRecipeId`), `src/features/recipes/screens/Cocina.tsx` (carousel + empty states + sort dropdown), convention test `cocina-collections.test.ts` **new**, i18n +12 | No new types — reuses `Recipe` via predicate |
| **R4** (Diccionario quick wins) ~~OFF-enrichment display~~ **CERRADO — absorbed by Food Families P0–P16** (`[1.5.54]`–`[1.5.74]`): P5 OFF integration completa + NutriScore + brand + image; P8–P10 FoodDetail enriquecido + glossario; P11–P13 ContextualScoreChip multi-goal; P14 brand variants retail España; P16 seed-variant inline log. Único residual opt-in = filter chips macros-range en FoodDictionary. | ~~`src/types/food.ts`~~ — N/A | ~~`Ingredient.scores?`~~ — shipped en P-series |
| **R5** (CookMode deeper) | Per-step ingredient sub-list (KS unique), ingredient check-off (novel — gap across benchmark), mise-en-place pre-cook screen (novel), step-banner `Step N/M` typography (KS pattern) | `src/types/recipe.ts` (+`step.ingredientIds?`), `src/features/recipes/components/CookMode.tsx` (per-step + check-off + banner), `src/features/recipes/components/MiseEnPlaceScreen.tsx` **new**, `src/contexts/AppStateContext.tsx` (+`settings.miseEnPlacePreCook`), convention test `cookmode-ingredient-checkoff.test.ts` **new**, i18n +8 | `recipe.steps[i].ingredientIds?: string[]`, `settings.miseEnPlacePreCook: boolean` |
| **R6** (Diccionario deeper) ~~Swap/alternatives engine + history~~ **CERRADO — absorbed by Food Families P-series**: P4 recipe variant pin + display (swap semántico cuando user confirma); P5–P10 FoodDetail sustitutos + usos culinarios + glossario; P11 "Qué me falta hoy" contextual scoring (proxy de swap basado en faltante). Residual `IngredientHistory.tsx` defer a R6-lite post-R7 si owner lo pide. | ~~`ingredient-swap.ts`~~ — N/A | No new types |
| **R7** (CreateRecipe + Import polish) | Paste-bulk parser (Paprika lateral), drag-drop reorder (Paprika lateral), Private Notes textarea (NYT unique), creator-as-verified (brings R2 full-circle) | `src/features/recipes/utils/ingredient-parser.ts` **new**, `src/features/recipes/screens/CreateRecipe.tsx` (paste-bulk + drag-drop + verified checkbox + Private Notes), `src/types/profile.ts` (+`isVerifiedCreator`), i18n +6, convention test `ingredient-parser.test.ts` **new** | `userProfile.isVerifiedCreator?: boolean`, `recipe.personalNote?: string` |

### 6.2 Gate check R1 → R2 — does R2 enter execution?

Per plan §R1 gate, R2 enters only if **all 4 conditions hold**:

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | **INDYA playbook shipped** with clear recipe-relevance classification | **✓ MET** | `indya-design-playbook.md` R1.2 output — LOW recipe-relevance, 3 orthogonal patterns documented for Q6/Q17/Q19 |
| 2 | **NYT Cooking playbook shipped** with anatomy + decision matrix | **✓ MET** | `nyt-cooking-design-playbook.md` R1.3 output — 25-pattern Copy/Adapt/Skip matrix + Fraunces font recommendation + Mark as Cooked cheap-data-win doctrine |
| 3 | **KS re-audit §9 applicability annex shipped** with tiered-treatment matrix | **✓ MET** | `kitchen-stories-design-playbook.md` §9 R1.1 output — Universal/Verified tier split across 17 patterns + §9.5 layout-parity rule |
| 4 | **Recipe playbook synthesis shipped** with cross-competitor matrix + gate check + write set | **✓ MET (this doc)** | §3 cross-cluster matrix (7 dimensions × 5 competitors), §4.4 Option A recommendation, §6.1 per-sprint write set, §5 guardrails |

**Gate status: GREEN** — R2 can enter execution after owner "continua" sign-off on this synthesis doc + R1 atomic commit merged.

### 6.3 Rollback path for R2

If verified-tier causes regression post-R2 merge:
- Feature flag `verifiedRecipePolish=false` reverts all verified recipes to user-saved layout. Zero-cost.
- `Recipe.verified` field remains in the type system (forward-compat) — no schema revert.
- `Recipe.cookedAt` stays (independent, universal feature).
- `--font-serif` stays loaded (orphan until flag re-enabled) — can be stripped from `index.css` in a second commit if bundle impact unacceptable.
- Convention test asserts **both** layouts render, so `flag=false` path can't silently break.

### 6.4 What R2–R7 does NOT do (out of scope)

- **User-defined folder library** — NYT Recipe Box unique pattern. Q20+ scope.
- **Video Inspiration tab** — NYT unique, requires creator production. Q21+.
- **Rating UGC** — Q20+.
- **Pantry-aware discovery chip row** — MRF unique, Q15+ Pantry integration.
- **Diet-plan-as-lens active filter** — Lifesum unique, Q15+ ICP/diet axis.
- **Food rating numeric 1–10 algorithm** — Lifesum unique, Q21+ Real Score dependency.
- **Recetas-by-kcal-bucket auto-generated collection** — Yazio unique, R3 optional deferred.
- **Heart-count overlay on UGC cards** — MRF pattern, Q21+ UGC source wiring.
- **Photo credits / food stylist line** — NYT unique, no RIAL data source.
- **Comment translation toggle** — KS unique, Q20+ Gemini translate.

---

## 7. Open questions (for owner sign-off)

These remain after synthesis. Defaults listed; owner override via "continua con [alt]" or explicit directive.

1. **Serif family — Fraunces (variable, ~100 KB) vs Source Serif 4 (2 files, ~70 KB)?**
   - Default (§4.4): Fraunces. One file covers weights + italic + softness axis.
   - Alt: Source Serif 4 if bundle becomes critical.
   - Decision gate: preflight `npm run size:check` budget headroom at R2 merge (~90 KB headroom today on main ≤ 900 KB raw; Fraunces fits).

2. **Sticky "Start cooking!" CTA — verified-only in R2 or universal?**
   - Default: verified-only (4.4).
   - Alt: universal — action-level UX improvement applies regardless of tier, arguably should ship to all.
   - Decision gate: A/B telemetry post-R2 if Q6 Supabase analytics live. Ship verified-only first, re-evaluate.

3. **AuthorAttributionCard variant for user-saved recipes — "savedDate" label or "Tu receta" tag?**
   - Default: "Guardada el DD/MM" neutral.
   - Alt: "Tu receta" positive-ownership tag.
   - Plan file Q4 also flags this — pending owner decision.

4. **Mark as Cooked universality — ship in R2 or defer?**
   - Default: universal in R2 (cheap data, orthogonal to verified tier).
   - Alt: defer to R3 with "Ya cocinadas" chip — simpler R2 write set.

5. **R3 collection card — horizontal carousel (plan default) vs grid 2×N visual tiles (NYT IMG_1162)?**
   - Default (plan): horizontal carousel.
   - Alt (NYT signal): grid 2×N with hero-recipe photo background per tile.
   - Decision: grid wins on visual richness but carousel preserves scroll budget. **Recommend grid for R3** aligned with NYT signal; revisit in R3 plan review.

6. **Verified chip color token — `--brand-secondary` or dedicated `--verified` token?**
   - Default: `--brand-secondary` (no new token).
   - Alt: dedicated `--verified` token per paleta (future proof but ADR risk).
   - Decision: start with `--brand-secondary`; if paleta readability fails, introduce token in follow-up.

7. **Seed `verified: 'rial'` count — 8, 10, or more?**
   - Default (plan): 8–10 heroes.
   - Alt: owner selects explicit subset of 46 seed recipes.
   - Decision gate: owner passes list or defers to R2 implementer judgment (pick most-visual seed entries with best photos).

---

## 8. References

- **Kitchen Stories playbook**: `docs/market/kitchen-stories-design-playbook.md` (§9 RIAL applicability annex — R1.1 output)
- **NYT Cooking playbook**: `docs/market/nyt-cooking-design-playbook.md` (R1.3 output)
- **INDYA playbook**: `docs/market/indya-design-playbook.md` (R1.2 output, LOW recipe-relevance)
- **MyRealFood playbook**: `docs/market/myrealfood-design-playbook.md`
- **Lifesum playbook**: `docs/market/lifesum-design-playbook.md`
- **Yazio playbook**: `docs/market/yazio-design-playbook.md`
- **Home patterns benchmark** (sibling synthesis): `docs/market/home-patterns-benchmark.md` (shipped `608d78f`)
- **ADR-008 Pricing model**: `docs/adr/ADR-008-pricing-model.md`
- **Plan file**: `.claude/plans/revisa-todas-las-capturas-ancient-micali.md` §R1–R7
- **Competitors index**: `docs/market/competitors-index.md`

---

**Deliverable status (R1.4).**
- §1–3: descriptive (matrices + clustering across 5 recipe-relevant competitors).
- §4–5: synthesis + guardrails.
- §6: concrete R2–R7 write set + gate check (**GREEN** for R2 entry).
- §7: open questions for owner.
- §8: references.

**Next action.** R1.5 updates `competitors-index.md` adding INDYA + NYT Cooking rows. After R1.5 lands, R1 ships as a single atomic docs commit (`docs(market): add INDYA + NYT Cooking playbooks + recipe-patterns benchmark synthesis`). Owner "continua" required before push to `rial-food/main` and before R2 enters execution.
