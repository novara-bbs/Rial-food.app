# ADR-016 — Safe-area inset contract for notch / Dynamic Island / home indicator

**Status**: Accepted — `[1.5.x]`
**Date**: 2026-04-27
**Builds on**: ADR-001 (SectionCard), ADR-012 (typography primitives), ADR-015 (domain state + screen decomposition)

## Context

RIAL is a mobile-first PWA wrapped with Capacitor for iOS + Android. Until now, safe-area handling was inconsistent:

- `src/index.css` only exposed `pb-safe` and `pb-safe-nav` (bottom only). Top inset (notch / Dynamic Island) was unaddressed.
- `<GlobalHeader>` was `h-16 sticky top-0` — on iPhone 12+ the avatar/streak collided with the Dynamic Island.
- `<PageShell>` (33 of 41 screens use it) had no safe-area awareness at all.
- The 8 fullscreen routes (`auth/*`, `AICoach`, `StoryViewer`, `Explore`, `Planner`, `RecipeDetail`) handled insets ad-hoc or not at all.
- Capacitor's `StatusBar.overlaysWebView` was undeclared → behavior depended on platform defaults, hidden source of cross-platform regressions.

Each new screen risked re-inventing inset handling. Each iOS update (Dynamic Island in iPhone 14 Pro, larger notches on Pro Max) compounds the cost of fixing screens individually.

## Decision

A single inset contract owned by **three** files:

### 1. `src/index.css` — utility primitives

```css
@utility pt-safe { padding-top: env(safe-area-inset-top, 0px); }
@utility pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
@utility pl-safe { padding-left: env(safe-area-inset-left, 0px); }
@utility pr-safe { padding-right: env(safe-area-inset-right, 0px); }
@utility pb-safe-nav { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 0.5rem); }
```

**Screens never read `env(safe-area-inset-*)` directly.** They always use the utility. Changing the inset rule globally is one edit in this file.

### 2. `<PageShell safeArea>` prop

```tsx
<PageShell safeArea="top">    // fullscreen routes without GlobalHeader
<PageShell safeArea="bottom"> // edge-to-edge content (no BottomNav)
<PageShell safeArea="both">   // rare; modals usually own their scaffold
<PageShell safeArea="none">   // default — chrome owns the insets externally
```

**Default `'none'`** preserves prior behavior for the 33 screens already mounted under `<GlobalHeader>` + `<BottomNav>` (which own the insets). Migration is opt-in per fullscreen route.

### 3. `<GlobalHeader>` — `pt-safe` + arithmetic height

```tsx
<header className="pt-safe ... h-[calc(env(safe-area-inset-top,0px)+4rem)]">
```

The `pt-safe` reserves the inset; the `calc()` height keeps **64px (4rem) of visible header content** above the inset. This is the only place we mix `env()` into Tailwind arbitrary values — every other consumer uses the utility.

### 4. `capacitor.config.ts` — `overlaysWebView` explicit

```ts
StatusBar: {
  overlaysWebView: false,  // webview does NOT extend under status bar
  ...
}
```

Decision: stay non-overlay (StatusBar reserves its own native height). To switch to edge-to-edge later, set `true` AND verify every top-level scaffold uses `pt-safe`.

### 5. `index.html` — `viewport-fit=cover`

Already set. Required for `env(safe-area-inset-*)` to resolve to non-zero on iOS Safari + Capacitor WKWebView. Locked by convention test.

## Consequences

**Positive**:
- One CSS file owns the entire inset rule. Future tweak (e.g. switching to `max(env(...), 1rem)` for older iOS fallbacks) is one edit, propagates everywhere.
- `<PageShell safeArea>` is the explicit, type-safe API for fullscreen routes. No more reading `env()` in JSX.
- `<GlobalHeader>` now correctly clears Dynamic Island on iPhone 14 Pro / 15 Pro.
- Capacitor behavior is unambiguous across iOS / Android.
- Convention test (`src/test/conventions/safe-area.test.ts`) locks the contract — accidental drift fails CI.

**Negative / trade-offs**:
- The `h-[calc(env(...)+4rem)]` arbitrary value in `GlobalHeader` is the one place we still inline an env(). Documented justification: only way to combine variable inset + fixed visible height in one Tailwind class. Convention test asserts the exact expression to prevent hand-editing.
- The 8 fullscreen screens (auth, AICoach, etc.) still need to opt into `<PageShell safeArea="top">` or wrap their root with `pt-safe`. **Not done in this ADR** — incremental migration in subsequent sprints to avoid mass changes.

**Migration**:
- ✅ All 33 screens with `<GlobalHeader>` + `<BottomNav>`: no change needed (chrome handles insets).
- ⏳ 8 fullscreen screens: opt-in via `safeArea` prop or `pt-safe` wrapper, sprint by sprint.

## Verification

- `npm run test -- safe-area.test.ts` — convention asserts utilities, prop, header, capacitor config, viewport-fit.
- Chrome DevTools → "iPhone 14 Pro" preview → Home, Cocina, Hoy, Mi Cuenta, Settings — header content sits below Dynamic Island.
- (When Capacitor build available) `npx cap run ios` on physical iPhone with notch.

## References

- WebKit `env(safe-area-inset-*)` spec: https://www.w3.org/TR/css-env-1/
- Apple HIG — Layout: safe areas — https://developer.apple.com/design/human-interface-guidelines/layout
- Capacitor StatusBar plugin docs: https://capacitorjs.com/docs/apis/status-bar
