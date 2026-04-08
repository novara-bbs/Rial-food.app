# RIAL App v1.5 — Claude Project Guide

## Project Overview
RIAL is a nutrition app combining 6 dimensions: tracking, recipes, wellness diary (Real Feel), meal planning, social community, and creator marketplace. React 19 + Vite + Tailwind CSS web app targeting mobile-first.

## Tech Stack
- **Framework**: React 19 + TypeScript 5.8
- **Build**: Vite 6.2
- **Styling**: Tailwind CSS 4.1 with custom CSS tokens (see `src/index.css`)
- **Charts**: Recharts 3.8
- **Icons**: Lucide React
- **AI**: Google Gemini API (`@google/genai`) for AI Coach
- **Barcode**: html5-qrcode + Open Food Facts API
- **Toasts**: Sonner
- **Animations**: Motion (Framer Motion)
- **i18n**: Custom context-based system (`src/i18n/`)
- **State**: localStorage via `useLocalStorageState` hook (no backend)

## Architecture

### Navigation (matches Product Spec v6)
```
Bottom Nav: Hoy | Cocina | + FAB | Explorar | Mas
Cocina sub-tabs: [Recetas] [Plan] [Lista]
Explorar sub-tabs: [Recetas] [Creadores] [Social]
Mas menu: Diario RF, Ayuno, Challenges, AI Coach, Perfil, Ajustes, RIAL+
```

### Routing
State-based navigation via `currentScreen` in `App.tsx`. No React Router.
```typescript
navigateTo(screen: string) // sets currentScreen + tracks previousScreen
```

### Key Directories
```
src/
├── App.tsx              # Root: state, routing, handlers
├── components/          # Shared: BottomNav, Sidebar, Onboarding, CreateModal,
│                        #   RealFeelInline, BarcodeScanner, EmptyState, GlobalHeader
├── screens/             # 19 active screens (Home, Cocina, Explore, More, etc.)
├── contexts/            # ThemeContext (6 themes)
├── hooks/               # useLocalStorageState
├── i18n/                # I18nProvider + locales/es.ts, locales/en.ts
├── utils/               # nutrition.ts, gamification.ts, correlations.ts
├── data/                # ingredients.ts (ingredient dictionary)
└── types.ts             # TypeScript interfaces

docs/                    # Extended documentation
├── ARCHITECTURE.md      # System design, data models, decisions
├── QUICKSTART.md        # Dev quickstart (2-min setup)
├── RULES.md             # Business logic, formulas, feature flags
├── CONTRIBUTING.md      # Workflow, checklists, patterns
├── SKILLS.md            # Claude skills, credit optimization
└── i18n-dictionary.md   # Full ES/EN translation reference
```

### Path Aliases (tsconfig + vite)
```
@/*           → src/*
@components/* → src/components/*
@screens/*    → src/screens/*
@utils/*      → src/utils/*
@hooks/*      → src/hooks/*
@i18n/*       → src/i18n/*
@data/*       → src/data/*
```
New code can use `import { useI18n } from '@i18n'` instead of relative paths.

### State Management
All persistent state lives in `App.tsx` via `useLocalStorageState`. Key state:
- `dailyMacros` (consumed + target)
- `savedRecipes`, `mealPlan`, `shoppingList`
- `realFeelLogs` (wellness diary entries)
- `communityPosts`, `toleranceLogs`
- `userProfile` (body data, goal, restrictions)
- `isPro`, `isFirstTime`

## Coding Rules

### MUST follow
1. **i18n**: ALL user-visible strings must use `t.section.key` from `useI18n()`. Never hardcode ES or EN strings.
2. **TypeScript**: `npx tsc --noEmit` must pass clean before any commit.
3. **Imports**: Use `@/` alias or relative paths. Import `useI18n` in every component with text.
4. **Styling**: Use existing Tailwind tokens (`bg-surface-container-low`, `text-tertiary`, `font-headline`, etc.). Never add raw hex colors.
5. **State**: Add new persistent state to `App.tsx` via `useLocalStorageState`. Pass as props or create a context if shared by 3+ screens.
6. **Navigation**: Add new screens to `renderScreen()` in `App.tsx`. Update BottomNav/Sidebar only if adding a new tab.

### MUST NOT do
1. Don't install React Router — we use state-based routing intentionally.
2. Don't create new CSS files — use Tailwind classes only.
3. Don't add backend/API code — this is a client-side prototype.
4. Don't modify `src/index.css` theme tokens without updating all 6 theme variants.
5. Don't use `any` types for new code — define proper interfaces in `types.ts`.
6. Don't add features beyond what's requested — no speculative abstractions.

### When adding a new screen
1. Create `src/screens/NewScreen.tsx`
2. Add i18n keys to both `es.ts` and `en.ts`
3. Add case to `renderScreen()` in `App.tsx`
4. Add navigation trigger (from Mas menu, FAB, or another screen)
5. Verify `npx tsc --noEmit` passes

### When adding i18n strings
1. Add key to `src/i18n/locales/es.ts` (Spanish first — primary locale)
2. Add same key to `src/i18n/locales/en.ts` (English translation)
3. Use `const { t } = useI18n()` in component
4. Access via `t.section.key`

## Design System Tokens
The app uses CSS custom properties defined in `src/index.css` with 6 theme variants:
- `--color-primary`, `--color-on-primary`
- `--color-surface-container-low`, `--color-surface-container-highest`
- `--color-on-surface`, `--color-on-surface-variant`
- `--color-tertiary` (headings)
- `--color-outline-variant`

### Font classes
- `font-headline` — Uppercase bold headings (Outfit/Space Grotesk)
- `font-label` — Tiny uppercase tracking-widest labels
- `font-body` — Body text
- `font-mono` — Numbers, data, macros

### Common patterns
```tsx
// Card
<div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5">

// Section header
<h2 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">

// Label
<span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">

// Primary button
<button className="px-6 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">

// Tag/chip
<span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
```

## Key Features & Where They Live

| Feature | Files |
|---------|-------|
| Onboarding (5-step wizard) | `components/Onboarding.tsx`, `utils/nutrition.ts` |
| Real Feel inline | `components/RealFeelInline.tsx`, triggered in `screens/Home.tsx` |
| Real Feel diary + correlations | `screens/RealFeelDiary.tsx`, `utils/correlations.ts` |
| Food quality emoji | `utils/nutrition.ts` → `getFoodQuality()` |
| Barcode scanner | `components/BarcodeScanner.tsx` (html5-qrcode + Open Food Facts) |
| Fasting timer | `screens/FastingTimer.tsx` |
| Import URL | `screens/ImportRecipeURL.tsx` |
| Gamification | `utils/gamification.ts`, displayed in `screens/Profile.tsx` |
| Smart insights | `utils/correlations.ts` → `getInsights()`, rendered in `Home.tsx` |
| Creators | `screens/Creadores.tsx` |
| i18n | `i18n/index.ts`, `i18n/locales/es.ts`, `i18n/locales/en.ts` |

## Dev Commands
```bash
npm run dev          # Start Vite dev server on port 3000
npm run build        # Production build
npx tsc --noEmit     # Type check (run before commits)
npm run lint         # TypeScript lint
```

## Extended Documentation
| Doc | Path | Purpose |
|-----|------|---------|
| Architecture | `docs/ARCHITECTURE.md` | System design, data models, 9 decisions |
| Quickstart | `docs/QUICKSTART.md` | 2-min dev setup, test commands, troubleshooting |
| Rules | `docs/RULES.md` | Business logic, Free/Pro matrix, all formulas |
| Contributing | `docs/CONTRIBUTING.md` | Workflow, checklists, credit optimization |
| Skills | `docs/SKILLS.md` | Claude skills guide, enterprise readiness |
| i18n Dictionary | `docs/i18n-dictionary.md` | Full ES/EN reference (~300 keys) |

## External Reference Documents
- Product Spec: `~/Downloads/RIAL_Product_Spec_v6.md` (1,946 lines, 19 sections)
- Strategic Analysis: `~/Downloads/RIAL_Strategic_Analysis.md` (trends, DAFO, ICPs)
- v0-rialfood: `C:\Users\Vicente CM\Documents\projects\RIAL\v0-rialfood` (correlation engine, batch cooking source)

## Self-Improvement Protocol

### Skills available
- `/pre-task` — Run before starting work: loads context, checks health, plans approach
- `/learn` — Capture a single learning immediately (pattern, fix, shortcut, mistake)
- `/session-retro` — End-of-session retrospective: reviews work, captures all learnings

### Memory structure (accumulated knowledge)
```
memory/
├── MEMORY.md                   # Index (loaded every session)
├── project_rial_overview.md    # What RIAL is
├── project_rial_architecture.md # Tech decisions
├── user_vicente.md             # User preferences
├── feedback_workflow.md        # Sprint workflow prefs
├── reference_v0_rialfood.md    # External reference
├── code_patterns.md            # Reusable code patterns
├── tooling.md                  # Build, TypeScript, tool behaviors
└── efficiency.md               # Workflow optimizations
```

### When to write to memory
- **Immediately**: When a non-obvious fix is found (error + resolution)
- **Immediately**: When the user corrects your approach
- **End of sprint**: Patterns that worked well or failed
- **End of session**: Run `/session-retro` to capture everything

### Continuous improvement loop
```
Start session → /pre-task (load context)
  → Work in sprints → /learn (capture discoveries mid-work)
  → Complete task → /session-retro (capture all learnings)
  → Next session starts smarter (memory loaded automatically)
```
