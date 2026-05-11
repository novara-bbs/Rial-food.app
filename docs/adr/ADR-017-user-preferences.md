# ADR-017 — User Preferences Architecture

**Status**: Accepted  
**Sprint**: E [1.5.217–1.5.219]  
**Supersedes**: implicit binary `UserProfile.mode` pattern  
**Related**: ADR-015 (domain state), ADR-016 (safe area)

---

## Context

### Problem

`UserProfile.mode: 'simple' | 'advanced'` was a single binary switch that
controlled the entire UI complexity level. This approach had three failure modes:

1. **Doesn't scale to N tiers**: adding a third tier required touching ~9 call sites.
2. **Doesn't scale to N sections**: "simple home" vs "simple progress" couldn't differ.
3. **Doesn't scale to N health sources**: each new integration (Apple Health, Whoop, glucose monitor) required if/else guards scattered across feature files.

By Sprint E, this had accumulated 9 consumers of `userProfile.mode`, with the
number growing each sprint. The cost of a correct migration was lowest before
adding more.

### Frente 4 context

Sprint E also closed all 4 Frente 4 hardening invariants (4a–4d) before
introducing new schema, so the new files were born under CI guardrails rather
than having to be retrofitted later.

---

## Decision

Replace `UserProfile.mode` with a three-layer preferences schema:

### 1. Section tiers (`UserPreferences.sectionTiers`)

Each screen section has an independent `DetailTier`:
```typescript
export type DetailTier = 'simple' | 'standard' | 'advanced';
export type Section =
  | 'home.energy' | 'home.macros' | 'home.activity' | 'home.hydration'
  | 'home.wellness' | 'home.meals' | 'nutrition.detail' | 'progress.charts';
```

Sections not listed fall back to `DEFAULT_TIER = 'standard'`.

### 2. Widget visibility matrix (`WIDGET_MATRIX`)

A compile-time-checked `Record<Section, Record<DetailTier, WidgetId[]>>` maps
tiers to the widgets that render at each level. Adding a widget = one entry in
the matrix. The matrix is the single source of truth.

### 3. Per-widget overrides (`UserPreferences.widgetOverrides`)

`visible: false` suppresses a tier-default widget. `visible: true` force-shows
a widget that the tier would normally exclude, subject to health-source requirements.

### 4. Health provider pattern (`src/lib/health/`)

A `HealthProvider` interface isolates all native plugin calls behind a common
API. Feature code never imports plugin packages — only the registry.

```
src/lib/health/
  types.ts          ← HealthProvider interface, HealthMetrics
  registry.ts       ← getActiveProviders, getProviderById, getAvailablePermissions
  providers/
    manual.ts       ← always available, reads from UserProfile localStorage
    apple-health.ts ← stub, delegates to @perfood/capacitor-healthkit (not yet installed)
    google-fit.ts   ← stub, delegates to capacitor-health-connect (not yet installed)
```

---

## Tier naming rationale

Three values confirmed with the product owner:
- `'simple'` — minimal info (matches legacy `mode: 'simple'` for continuity)
- `'standard'` — balanced view; the home dashboard as it looked ~3 weeks before Sprint E
- `'advanced'` — maximum detail (matches legacy `mode: 'advanced'` for continuity)

The legacy values are intentionally preserved so the migration is lossless.

---

## Migration strategy

Migration runs once on first app hydration after update, idempotently:

| Legacy value | Result |
|---|---|
| `mode = 'simple'` | All sections → `'simple'` |
| `mode = 'advanced'` | All sections → `'advanced'` |
| `mode = undefined` + existing profile | All sections → `'simple'` (preserves UX) |
| `mode = undefined` + fresh install | `sectionTiers = {}` (DEFAULT_TIER `'standard'` applies) |

The stamp `migratedFromLegacyMode: true` prevents re-running the migration.
`UserProfile.mode` is kept for one release cycle as the migration source, then
removed.

---

## Deprecation timeline

| Sprint | Action |
|---|---|
| E [1.5.218] | `UserProfile.mode` marked `@deprecated`. Migration bridge wired. |
| E [1.5.219] | Phase 4: `Home.tsx` + `HomeQuickStats.tsx` migrated. |
| F | `NutritionHero.tsx` + `NutritionHeroRing.tsx` migrated. |
| G | `demo-seed.ts` migrated. `UserProfile.mode` field removed. |

The `preferences-deprecation` convention test tracks remaining reads and fails
CI if new ones appear. The allowlist shrinks by at least 1 entry per sprint.

---

## Visibility resolver API

```typescript
// Section tier
getTierForSection(prefs, 'home.activity')  // → 'standard'

// Visible widgets for a section
getVisibleWidgets('home.activity', prefs)  // → ['steps-card', 'exercise-card', ...]

// Health-source gating
getAvailablePermissions(prefs)             // → Set<HealthPermission>

// Registry
getPlatformProviders()                     // available on this device
getActiveProviders(prefs)                  // enabled in user prefs
```

---

## Storage and sync

- **Key**: `STORAGE_KEYS.PREFERENCES = 'rial_preferences'`
- **SyncKey**: `'preferences'` (cross-device sync when Supabase is active)
- **Format**: `UserPreferences` JSON, versioned (`version: 1`)

Schema upgrades: bump `version`, add a migration case in `usePreferencesState.ts`.

---

## Convention tests added

| Test | What it enforces |
|---|---|
| `preferences-deprecation.test.ts` | No new reads of `userProfile?.mode` outside allowlist |
| `health-provider-isolation.test.ts` | Native health plugin imports only in `providers/` |
| `widget-visibility-source.test.ts` | No new raw `'simple'`/`'advanced'` string values outside allowlist |

---

## Consequences

**Good:**
- Adding a new tier → 1 entry in `DetailTier` + matrix rows.
- Adding a new section → 1 entry in `Section` + matrix entry.
- Adding a new health source → 1 provider file + 1 registry line.
- Adding a health-gated widget → 1 entry in `WIDGET_REQUIREMENTS`.
- All changes are compile-time checked (exhaustive record types).

**Neutral:**
- 7 legacy consumers still use `mode: 'simple' | 'advanced'` props. They continue
  working during the deprecation window via `isSimpleMode` derived from preferences.
- The health provider stubs return empty data until real plugins are installed.

**Trade-off:**
- Settings UI now shows a 3-tier global selector + per-section collapsible panel.
  This is more powerful but also more complex than the old 2-button toggle.
  Mitigation: the global selector applies all sections at once (one tap for most users);
  the per-section panel is collapsed by default.
