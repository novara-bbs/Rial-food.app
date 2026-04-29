# ADR-011 — NEUTRAL is the RIAL brand palette

- Status: Accepted
- Date: 2026-04-19
- Supersedes: —
- Related: ADR-005, ADR-010

## Context

RIAL ships 4 palettes × 2 modes (ADR-005): `volt` · `ocean` · `ember` · `neutral`. Since `[1.5.32]` (`18938a6`), `DEFAULT_STATE.palette = 'neutral'` in `ThemeContext.tsx` and both picker surfaces (Onboarding step 5 + SettingsAppearance) list NEUTRAL first. But the brand discourse kept drifting toward VOLT — the Lime 600 accent carried the promotional weight in swatches and in internal references ("lime 600 is the RIAL color"). This created a three-way gap:

1. **Technical default ≠ brand narrative.** A new user landing on NEUTRAL saw no indication that this is the RIAL palette; it felt like an absence, not a choice.
2. **Competitor research 2026 confirms warm-neutral + green accent as the dominant SaaS wellness pattern.** Vercel, Linear, Stripe, Notion all use monochromatic warm scales with a discrete accent. Bevel (the explicit inspiration per the Q15.5–Q17 playbook) does the same. Teal was considered but overlaps with OCEAN-sky; Emerald differentiates without losing the wellness aura.
3. **Palette polish debt.** NEUTRAL LIGHT had 4 cool-Zinc values inside an otherwise warm-Stone scale (`--on-surface-variant #404040`, `--primary-container #27272a`, `--on-primary-container #fafafa`, `--chart-text #71717a`). NEUTRAL DARK had a depth bug (`--surface-container-low` equal to `--surface`) and lacked `--surface-container-lowest` that the 3 other palettes all declared.

Owner decision (captured in the session `[1.5.53]` plan, confirmed via AskUserQuestion):
- NEUTRAL identity stays **monocromática pura**. `--primary: #09090b` LIGHT / `#fafafa` DARK — no promotion of Emerald to primary.
- Emerald 600 (LIGHT) / 500 (DARK) stays as `--brand-secondary` for chips, badges, data-viz. Zero tonal overlap with VOLT Lime / OCEAN Sky / EMBER Orange.
- The 3 other palettes are **personalidades alternativas**, not "marca" — equally supported, equally maintained.

## Decision

1. **Brand narrative.** NEUTRAL is RIAL's canonical brand palette. Marketing copy, docs, and the picker UI all describe it as the recommended palette. `t.settings.paletteNeutralDesc` rewritten to: `"Monocromática cálida con acento verde — la paleta canónica de RIAL."` / `"Warm monochromatic with green accent — the canonical RIAL palette."`

2. **"Recomendada" badge.** The picker tile for NEUTRAL in Onboarding step 5 + SettingsAppearance renders a small badge labeled `t.settings.paletteRecommended` (ES `"Recomendada"` / EN `"Recommended"`). No badge on VOLT/OCEAN/EMBER — the absence communicates alternative-personality status.

3. **Palette polish (temperature-match).** `.theme-neutral-light` gets 4 warm-Stone refinements:
   - `--on-surface-variant` Neutral 700 `#404040` → Stone 700 `#44403c` (AAA 8.9:1 on `#fafaf9`)
   - `--primary-container` Zinc 800 `#27272a` → Stone 800 `#292524`
   - `--on-primary-container` Neutral 50 `#fafafa` → Stone 50 `#fafaf9`
   - `--chart-text` Zinc 500 `#71717a` → Stone 500 `#78716c`

4. **Depth fix + new token in DARK.** `.theme-neutral-dark`:
   - `--surface-container-low` `#18181b` → `#1c1c1f` (+4 pts luminosity — fixes identical-to-surface bug)
   - `--surface-container-lowest: #0f0f11` (new — matches the 3 other DARK palettes)

5. **Zero technical migration.** `DEFAULT_STATE.palette = 'neutral'` was already the default since `[1.5.32]`. Users with another palette selected keep their choice. No forced migration. No data change.

6. **Guardrails.** `src/test/conventions/theme-palettes.test.ts` locks the 5 key NEUTRAL values (DARK `--surface-container-low #1c1c1f` + `--surface-container-lowest #0f0f11`, LIGHT `--chart-text #78716c` + `--brand-secondary #059669` + `--primary #09090b`) so any accidental regression fails CI.

## Consequences

- Users in NEUTRAL (the majority after `[1.5.46]` rebalance) see subtly better hierarchy in both modes (warm-match in LIGHT, real depth lift in DARK). Zero action required from them.
- Users who picked VOLT/OCEAN/EMBER intentionally see no change in their theme — only in copy narrative (picker tile of the *other* palette they're not using gains a "Recomendada" badge they can ignore).
- Onboarding step 5 still shows 4 palette tiles; the badge is purely decorative, does not change the default-selection logic.
- Future palette work (if any) must preserve the 5 locked NEUTRAL tokens — or update the convention test + rewrite ADR-011 with the new decision.
- Zero bundle delta. Zero i18n re-key (1 new symmetric key, 1 rewritten value — 1576 → 1577). Zero routing, zero data schema.

## Notes

The "Recomendada" / "Recommended" badge is rendered as a pill using `--primary` as background + `--on-primary` (or palette swatch `bg`) as foreground — meaning it re-paints correctly across all 4 × 2 modes, including the 3 non-brand palettes where the badge appears on the NEUTRAL *tile* inside a picker whose container uses that palette's tokens. The pill is deliberately small (`text-micro tracking-widest uppercase`) so it reads as informative, not promotional.

This ADR does **not** re-open the question of whether the 4 palettes should consolidate into 1. Owner directive 2026-04-17 (captured in `docs/ai/state.md`): 4 paletas completas, no consolidamos. ADR-011 formalizes the *narrative hierarchy* within those 4, not the *count*.

## Addendum — `[1.5.154]` Sprint 40 (2026-04-29): tone refresh, Bevel × Whoop

The original `[1.5.53]` decision kept NEUTRAL light at `--background #fafaf9` (Stone 50, near-white) + `--surface-container-low #f1f0ec` as `--card`. In practice this read as **white background + gray cards** — the inverse of the Bevel pattern the brand aspires to. NEUTRAL dark used warm Zinc-derived tones (`--background #0a0a0b` + `--surface #18181b` Zinc 900), less differentiated from EMBER dark and softer than Whoop-style cool desaturated darks.

Owner direct feedback 2026-04-29: "el actual no me gusta — el light usa ahora blanco de fondo y gris en secciones y me gusta más al revés y otros tonos como Bevel; el dark me gustan más los tonos de Whoop (NO full black)".

**Decision** — refine the NEUTRAL palette tones in place (no new palette, no new ADR; this is the same brand decision tuned to match the original Bevel-inspiration aim more faithfully):

### NEUTRAL LIGHT (Bevel-style inversion)

| Token | Pre-S40 | S40 | Why |
|---|---|---|---|
| `--background` | `#fafaf9` | **`#eae7e0`** | Warm gray ~91% L. The page becomes a "lienzo gris" instead of an off-white sheet. |
| `--surface` | `#ffffff` | `#ffffff` | Cards stay white — Bevel-style lift on warm gray. |
| `--surface-container-lowest` | (not set) | **`#ffffff`** | Explicit, parity with dark. |
| `--surface-container-low` *(= `--card`)* | `#f1f0ec` | **`#f7f4ed`** | Off-white near surface. Shadcn cards stop reading as gray. |
| `--surface-container` *(= `--muted`)* | `#e5e4df` | **`#ece9e1`** | Matches the new bg. |
| `--surface-container-high` | `#d5d4cd` | **`#ddd9cf`** | |
| `--surface-container-highest` | `#a8a59d` | **`#b8b3a7`** | |
| `--outline` | `#d6d3cb` | **`#d5d1c5`** | |
| `--outline-variant` | `#e7e5dc` | **`#e2ded4`** | |
| `--chart-grid` | `#e7e5dc` | **`#e2ded4`** | Match outline-variant. |
| `--on-surface-variant` | `#44403c` | `#44403c` | Unchanged. **AAA contrast 7.66:1** over new `#eae7e0`. |

`--primary`, `--brand-secondary`, `--macro-*`, `--error` unchanged.

### NEUTRAL DARK (Whoop-style cool desaturated, NOT full black)

| Token | Pre-S40 | S40 | Why |
|---|---|---|---|
| `--background` | `#0a0a0b` (warm) | **`#0e1014`** | Cool dark with leve undertone azul (~225° hue, ~10% sat). NOT black. |
| `--surface` | `#18181b` (Zinc 900) | **`#1a1c20`** | Lifted card matching cool tone. |
| `--surface-container-lowest` | `#0f0f11` | **`#0a0c10`** | Sunken inputs, deeper than bg. |
| `--surface-container-low` *(= `--card`)* | `#1c1c1f` | **`#16181c`** | Shadcn cards (+4 pts vs surface). |
| `--surface-container` *(= `--muted`)* | `#27272a` | **`#212328`** | |
| `--surface-container-high` *(= `--accent`)* | `#3f3f46` | **`#2d2f34`** | Ladder comprimida — coherente con Whoop. |
| `--surface-container-highest` *(= `--secondary`)* | `#52525b` | **`#3a3d43`** | |
| `--outline` | `#3f3f46` | **`#2d2f34`** | |
| `--outline-variant` *(= `--border`)* | `#27272a` | **`#232529`** | |
| `--on-surface-variant` | `#a1a1aa` (warm) | **`#a8aaae`** (cool) | **AAA contrast 8.27:1** over new `#0e1014`. |
| `--chart-grid` | `#27272a` | **`#212328`** | |
| `--chart-text` | `#71717a` | **`#787a80`** | |
| `--primary-container` | `#27272a` | **`#212328`** | Match container scale. |

`--primary`, `--brand-secondary`, `--macro-*`, `--error` unchanged.

### Guardrail update

`src/test/conventions/theme-palettes.test.ts` locks were refreshed:
- DARK: `--background #0e1014`, `--surface-container-low #16181c`, `--surface-container-lowest #0a0c10`.
- LIGHT: `--background #eae7e0`, `--surface #ffffff` (added).
- Untouched: 4 palettes × 2 modes class set, `:root` aliases volt-dark, primary `#09090b`, brand-secondary `#059669`, chart-text `#78716c`.

### PWA chrome

`index.html` `<meta name="theme-color">` split into `prefers-color-scheme: light` (`#eae7e0`) + `dark` (`#0e1014`) media variants. Previous single hardcoded `#09090b` is replaced.

### Out of scope (deliberate, owner directive)

VOLT / OCEAN / EMBER palettes — untouched. Tokens de marca / acento / macro / error — untouched. The `docs/DESIGN-SYSTEM.md` § 7 legacy `theme-light` notes (pre-multi-palette) remain as-is, separate cleanup.
