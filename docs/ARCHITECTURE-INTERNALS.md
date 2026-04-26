# RIAL Architecture Internals

> Quick links: [ARCHITECTURE.md](ARCHITECTURE.md) · [GLOSSARY.md](GLOSSARY.md) · [HOW-TO-ADD-FEATURE.md](HOW-TO-ADD-FEATURE.md) · [SUPABASE-LOCAL.md](SUPABASE-LOCAL.md)

This document explains **how the app works under the hood**: data flows, state model, handler contracts, sync mechanics, and navigation. Read it before touching `AppStateContext`, `sync.ts`, `AuthContext`, or any feature handler.

---

## 1. The Four-Context Spine

Every component tree sits inside four nested providers:

```
AuthProvider           → who is logged in; triggers cloud sync on sign-in
  └── I18nProvider     → locale + t.section.key translations
        └── NavigationProvider   → history stack (no React Router)
              └── AppStateProvider → 42 state vars + 21 handler factories
                    └── App.tsx  → switch(currentScreen) → one screen at a time
```

No global stores, no Redux, no Zustand. One context chain, predictable re-render surface.

---

## 2. Data Journey: What Happens When a User Acts

### Example: user taps "Log meal" in AddMeal.tsx

```
1. UI trigger        AddMeal.tsx calls handleLogMeal(meal) from context
2. Handler dispatch  AppStateContext exposes stable memoized ref (useMemo)
3. Factory runs      createHandleLogMeal(deps) in features/food/handlers/meal-handlers.ts
4. State updates     deps.setDailyMacros(...)  +  deps.setDailyLog(...)
5. Persistence       useLocalStorageState writes to localStorage synchronously
                       → keys: rial_dailyMacros, rial_dailyLog
6. Sync trigger      useEffect([dailyMacros]) fires → pushToCloud('dailyMacros', value)
7. Cloud write       Supabase upsert on user_data {user_id, key, value, updated_at}
                       → silent no-op if Supabase not configured OR user not signed in
8. Navigation        handler calls navigateTo('home') → history stack gets new frame
```

**Steps 1–5 are synchronous and instant.** Steps 6–7 are background async. The UI never waits for the cloud.

### Example: user signs in

```
signIn() → Supabase JWT issued
  → onAuthStateChange fires in AuthContext → authStatus becomes 'authed'
  → useEffect in AppStateContext detects first sign-in (via prevAuthStatusRef)
  → syncOnSignIn() → pullFromCloud() → SELECT * FROM user_data WHERE user_id = $1
  → applyRemoteData(remote) → for each key:
       localStorage.setItem('rial_' + key, JSON.stringify(value))
       + React state setter fires → UI re-renders with cloud data
```

### Example: user signs out

```
signOut() in AuthContext:
  1. client.auth.signOut() → invalidates Supabase JWT
  2. Iterate all localStorage keys → remove anything starting with rial_ or rial-
     except: rial-locale, rial_theme, rial_gdpr_consent_v1
  3. setUser(null) + setStatus('guest')
  → App re-renders as guest; localStorage is now clean for the next user
```

---

## 3. Handler Factory Contract

All business logic that modifies state lives in factory files under `features/*/handlers/`. Never write business logic inline in components or in AppStateContext.

```typescript
// features/food/handlers/meal-handlers.ts
export function createHandleLogMeal(deps: {
  setDailyMacros: Dispatch<SetStateAction<DailyMacros>>;
  setDailyLog:    Dispatch<SetStateAction<DailyLogEntry[]>>;
  navigateTo:     (screen: string) => void;
  t:              Translations;
}) {
  return (meal: Meal) => {
    deps.setDailyMacros(prev => ({
      ...prev,
      consumed: addMacros(prev.consumed, meal.macros),
    }));
    deps.setDailyLog(prev => [{ ...meal, loggedAt: nowISO() }, ...prev]);
    deps.navigateTo('home');
  };
}
```

```typescript
// AppStateContext.tsx
const handleLogMeal = useMemo(
  () => createHandleLogMeal({ setDailyMacros, setDailyLog, navigateTo, t }),
  [setDailyMacros, setDailyLog, navigateTo, t],
);
```

**Rules:**
- Factories receive ALL dependencies through the `deps` object — never import global state.
- Return a plain function (or `Promise<void>`). No hooks inside the factory.
- `useMemo` in AppStateContext gives stable refs to all consumers (prevents cascading re-renders).
- 5 simple utility callbacks (`toggleFavorite`, `markNotificationsRead`, etc.) use `useCallback` inline — acceptable for single-setter toggling, not business logic.

---

## 4. State Model

### Layer ownership

| Layer | What it stores | Written by | Lifecycle |
|-------|---------------|------------|-----------|
| Component `useState` | Form values, modal flags, tab selection | Component only | Ephemeral |
| AppStateContext | All product data | Handler factories + setters | In-memory, re-rendered |
| localStorage (`rial_*`) | Persistent mirror of AppStateContext | `useLocalStorageState` hook | Survives reload |
| Supabase `user_data` | Cloud mirror for signed-in users | `pushToCloud()` | Follows account |

### The 42 state variables (by domain)

| Domain | Variables |
|--------|-----------|
| Profile | `userProfile`, `isPro`, `isFirstTime`, `showAIBot`, `miseEnPlaceEnabled` |
| Daily vitals | `dailyMacros`, `hydration`, `movement`, `dailyGoal`, `dailyLog` |
| Food | `userFoods`, `userVariants`, `userVariantBarcodes`, `foodHistory`, `favoriteIds` |
| Recipes | `savedRecipes`, `mealPlan`, `shoppingList` |
| Wellness | `weightHistory`, `nutritionHistory`, `realFeelLogs`, `toleranceLogs`, `checkInStatus` |
| Social graph | `followedCreators`, `likedPosts`, `savedPosts`, `joinedChallenges`, `challengeJoinDates`, `challengeProgress` |
| Social content | `communityPosts`, `communityStories`, `notifications` |
| UI transients | `selectedRecipe`, `selectedCreatorId`, `selectedPostId`, `selectedChallengeId`, `selectedStoryAuthorId`, `targetPlanDay`, `openScannerOnAddMeal` |

### localStorage key convention

`useLocalStorageState('userProfile', defaultValue)` → stored as `rial_userProfile`.

Prefix is always `rial_`. UI preferences use the same prefix: `rial_theme`, `rial_gdpr_consent_v1`. Language preference uses a hyphen: `rial-locale`.

---

## 5. Sync Architecture

### Write flow (offline-first)

```
User action → state setter → localStorage (sync, instant) → React re-render
                                                 ↓ async (background)
                                     useEffect([stateVar]) fires
                                     pushToCloud(key, value)
                                     → Supabase upsert on user_data
                                     → no-op if Supabase unconfigured or user offline
```

`pushToCloud` never throws to the caller. Network failures are logged as warnings. There is **no retry queue** for failed pushes (V2 item).

### Which keys sync to Supabase (post-[1.5.113])

**Wired (25 keys):** `userProfile`, `dailyMacros`, `savedRecipes`, `mealPlan`, `shoppingList`, `realFeelLogs`, `toleranceLogs`, `weightHistory`, `nutritionHistory`, `isPro`, `dailyLog`, `foodHistory`, `favoriteIds`, `hydration`, `movement`, `dailyGoal`, `isFirstTime`, `userFoods`, `userVariants`, `userVariantBarcodes`, `likedPosts`, `savedPosts`, `followedCreators`, `joinedChallenges`, `challengeJoinDates`, `challengeJoinDates`, `challengeProgress`.

**Intentionally NOT synced:**
- `communityPosts`, `communityStories`, `notifications` — backend-sourced demo data, not user-owned
- `showAIBot`, `rial_theme` — UI preferences that should not follow the account
- `fasting-protocol`, `fasting-history`, `weeklyCheckIns`, `pantryItems` — declared in SyncKey type, wiring deferred to V2

### Merge strategy (current)

"Remote wins" on first sign-in per session. No per-key timestamp comparison. If the user edited data offline before signing in, the remote copy overwrites local edits. Full LWW merge requires storing `updated_at` locally — V2 item.

### Special case: recipe photos

`savedRecipes` skips `pushToCloud` when any recipe contains a `data:image/*` base64 photo (guard against Supabase 1 MB row-size limit). Recipes are stored locally but not synced until Q6-B (Supabase Storage migration) ships.

---

## 6. Navigation Model

No React Router. Pure state-based history stack.

```typescript
// NavigationContext state (simplified)
history: Array<{
  screen: string;               // 'home' | 'recipe-detail' | 'add-meal' | ...
  screenData?: Record<string, unknown>; // { recipeId: '...' } etc.
  scrollYToRestore?: number;    // captured on push, restored on pop
}>
```

### Navigation primitives

| Function | Behavior |
|----------|----------|
| `navigateTo(screen, data?)` | Push frame. Captures `window.scrollY` before push. |
| `goBack()` | Pop frame. Applies `scrollYToRestore` in `useLayoutEffect` before paint. |
| `navigateToRecipe(recipe)` | Sets `selectedRecipe` + navigates to `'recipe-detail'`. |

### Screen registry

All 41 screens are `React.lazy()`'d in `src/config/routes.ts`. `App.tsx` renders the active screen via one `switch(currentScreen)` block (lines 154–191). No dynamic route registration.

### Auth + onboarding rendering

Auth screens (Login/Signup/ForgotPassword) and onboarding are rendered **outside** the main switch:
- **Auth**: parallel `authScreen` state shown when `authStatus === 'authed'` and user is setting up account
- **Onboarding**: modal overlay (`isOpen={isFirstTime}`) rendered over the main screen; sets `isFirstTime = false` on completion

---

## 7. Seeding Strategy

Demo data is lazy-loaded on first mount via `shouldReseed()` in `src/lib/seedVersion.ts`.

| Strategy | Use case | Example |
|----------|----------|---------|
| `preserve-user` | Mixed user + demo content | `savedRecipes` — keeps user's own, replaces seed items |
| `preserve-if-nonempty` | User's personal records | `weightHistory`, `toleranceLogs` — skip if user has data |
| `replace` | Demo-only content | `communityPosts`, `communityStories` — always overwrite |

**To push new seed content to existing users:** bump the version in `SEED_VERSIONS` in `src/lib/seedVersion.ts` for the relevant key. Users on the old version re-hydrate on next open.

---

## 8. AI Layer: Dev vs. Product Boundary

| Layer | What | File |
|-------|------|------|
| AI Coach | Chat with Gemini for nutrition | `src/features/ai/screens/AICoach.tsx` |
| Photo recognition | Food photo → macros | `src/features/food/api/photo-recognition.ts` |
| Recipe import | URL + text → recipe | `src/features/recipes/screens/ImportRecipeURL.tsx` |
| Gemini client | Shared API wrapper | `src/lib/gemini.ts` |
| Supabase proxy | Production secret isolation | `supabase/functions/gemini-proxy/` |

**Local dev:** `VITE_GEMINI_API_KEY` used directly in the browser.
**Production:** all Gemini calls route through `supabase/functions/gemini-proxy` — key never ships to the browser.

Development-agent prompts (`docs/ai/`) must NEVER appear in product AI prompts, and vice versa.

---

## 9. Pre-Supabase Integration Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Supabase migration applied | ⏳ Owner action | Run `supabase db push` (creates `profiles` + `user_data` + RLS) |
| Vercel env vars set | ⏳ Owner action | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in Vercel project |
| Sign-out clears localStorage | ✅ `[1.5.113]` | All `rial_*` keys cleared except locale/theme/consent |
| All user-owned SyncKeys wired | ✅ `[1.5.113]` | 25 keys wired; remaining are backend-sourced or V2 |
| Recipe photos → Supabase Storage | ⏳ Q6-B sprint | data-URL guard active; affected recipes skip sync |
| Merge conflict strategy (LWW) | ⏳ V2 | Current: remote wins on sign-in (no timestamp comparison) |
| Offline sync queue | ⏳ V2 | Current: failed pushes silently dropped |

---

## 10. Code Quality Invariants

- **No barrel files** except `src/types/index.ts`.
- **No inline `<h1>–<h4>`** outside allowlist — use `<Heading level="h1..h4">` (ADR-012).
- **No filter UI invented inline** — use `ChipRow`, `FilterSheet`, `TabNav`, `SortControl` (ADR-013/014).
- **No `text-[Npx]` or `dark:` classes** — use design tokens only (ADR-001/002/005).
- **Handler factories** — new business logic always lives in `features/*/handlers/`, wired via `useMemo` in AppStateContext.
- **i18n discipline** — every user-visible string goes through `t.section.key`; add to both `es.ts` and `en.ts` symmetrically; verify with `npm run check:i18n`.

For the new-screen checklist: `docs/NEW-SCREEN-CHECKLIST.md`.
For design-system primitives: `docs/PRIMITIVES.md`.
