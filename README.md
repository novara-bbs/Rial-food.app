# RIAL — Nutrition Platform

> Real nutrition. Real recipes. Real community.

6-dimension nutrition app: **Tracking + Recipes + Real Feel (wellness diary) + Meal Planning + Social Community + Creator Marketplace**.

## Quick Start

```bash
# 1. Install
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your Gemini API key

# 3. Run
npm run dev
# Open http://localhost:3000
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | Type check (run before commits) |
| `npm run lint` | TypeScript lint |
| `npm run clean` | Remove dist/ |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6.2 |
| Styling | Tailwind CSS 4.1 (custom design tokens) |
| Charts | Recharts 3.8 |
| Icons | Lucide React |
| AI | Google Gemini API |
| Barcode | html5-qrcode + Open Food Facts API |
| i18n | Custom (ES/EN, auto-detect system language) |
| State | localStorage (Supabase-ready) |

## Project Structure

```
src/
├── App.tsx                  # Root: routing, global state, handlers
├── main.tsx                 # Entry point (providers)
├── types.ts                 # TypeScript interfaces
├── components/
│   ├── BottomNav.tsx        # Mobile bottom navigation (4 tabs + FAB)
│   ├── Sidebar.tsx          # Desktop sidebar navigation
│   ├── GlobalHeader.tsx     # Top header (settings, profile, notifications)
│   ├── CreateModal.tsx      # FAB action sheet (6 quick actions)
│   ├── Onboarding.tsx       # 5-step onboarding wizard
│   ├── RealFeelInline.tsx   # Post-meal wellness check-in (emoji + tags)
│   ├── BarcodeScanner.tsx   # Camera barcode + Open Food Facts lookup
│   └── EmptyState.tsx       # Reusable empty state component
├── screens/
│   ├── Home.tsx             # Hoy tab: macros, planned meals, insights
│   ├── Cocina.tsx           # Kitchen tab: [Recetas] [Plan] [Lista]
│   ├── Explore.tsx          # Explore tab: [Recetas] [Creadores] [Social]
│   ├── More.tsx             # More menu: diary, fasting, profile, settings
│   ├── RecipeDetail.tsx     # Full recipe view with food quality badge
│   ├── AddMeal.tsx          # Log food (search, barcode, photo AI)
│   ├── CreateRecipe.tsx     # 4-step recipe creator
│   ├── ImportRecipeURL.tsx  # Import from YouTube/IG/TikTok/blogs
│   ├── RealFeelDiary.tsx    # Real Score, Recharts chart, correlations
│   ├── FastingTimer.tsx     # Circular timer, protocols, history
│   ├── Creadores.tsx        # Creator profiles with verification
│   ├── Profile.tsx          # Gamification: level, badges, streak
│   ├── Settings.tsx         # Theme, language, biometrics, wearables
│   ├── AICoach.tsx          # Gemini-powered chat with user context
│   └── ...                  # Discovery, Community, Planner, ShoppingList, etc.
├── i18n/
│   ├── index.ts             # I18nProvider + useI18n hook
│   └── locales/
│       ├── es.ts            # Spanish (primary, ~300 keys)
│       └── en.ts            # English (~300 keys)
├── utils/
│   ├── nutrition.ts         # TDEE calculator, food quality rating
│   ├── gamification.ts      # Streaks, 14 badges, 6 levels, points
│   └── correlations.ts      # Pearson correlations, insight engine
├── hooks/
│   └── useLocalStorageState.ts
├── contexts/
│   └── ThemeContext.tsx      # 6 theme variants (dark/light x 3 colors)
└── data/
    └── ingredients.ts       # Ingredient nutritional dictionary
```

## Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **CLAUDE.md** | Root | Project rules for AI agents (loaded every session) |
| **AGENTS.md** | Root | Agent type guide + cost optimization |
| **CHANGELOG.md** | Root | Version history |
| Architecture | `docs/ARCHITECTURE.md` | System design, data models, decisions |
| Rules | `docs/RULES.md` | Business logic, formulas, feature flags |
| Contributing | `docs/CONTRIBUTING.md` | Dev workflow, checklists, patterns |
| Skills | `docs/SKILLS.md` | Claude skills, credit optimization, enterprise checklist |
| i18n Dictionary | `docs/i18n-dictionary.md` | Full ES/EN translation reference |

## Navigation Map

```
Hoy ────── Macros, Planned Today, Training Toggle, Insights, Real Feel
Cocina ─── [Recetas] Collections, Search, Create, Import URL
           [Plan]    Weekly calendar, drag meals, generate list
           [Lista]   Auto shopping list, categories, share
Explorar ─ [Recetas]   Public search, trending, filters
           [Creadores] Verified profiles, follow
           [Social]    Feed, posts, challenges
Mas ────── Diario Real Feel, Ayuno, Challenges, AI Coach, Perfil, Ajustes, RIAL+
```

## License

Private / Confidential — RIAL 2026
