# RIAL App — Changelog

## [1.5.0] — 2026-04-08

### Infrastructure
- **i18n system**: ES/EN with auto system-language detection, instant runtime switching
- **Extracted `useLocalStorageState` hook** to `src/hooks/useLocalStorageState.ts`
- **Nutrition utilities** (`src/utils/nutrition.ts`): Mifflin-St Jeor TDEE, macro splits by goal, food quality rating
- **Gamification utilities** (`src/utils/gamification.ts`): streak calculation, 14 badges, 6 levels, points system
- **Correlation engine** (`src/utils/correlations.ts`): Pearson coefficient, tag-wellbeing correlations, time patterns, trend detection, smart insights

### Navigation Restructure (spec v6 aligned)
- Bottom nav: **Hoy | Cocina | + FAB | Explorar | Mas**
- **Cocina** with sub-tabs: [Recetas] [Plan] [Lista] + collections filter + recipe counter (X/30)
- **Explorar** with sub-tabs: [Recetas] [Creadores] [Social]
- **Mas** menu: Diario Real Feel, Ayuno, Challenges, AI Coach, Perfil, Ajustes, RIAL+

### New Screens (8)
- `Cocina.tsx` — Unified recipes/plan/list with collections
- `Creadores.tsx` — Creator profiles with verified badges, followers
- `RealFeelDiary.tsx` — Real Score 0-100, Recharts area chart, correlations, timeline
- `FastingTimer.tsx` — SVG circular timer, 4 protocols (16:8/18:6/20:4/OMAD), history
- `ImportRecipeURL.tsx` — URL input, AI extraction simulation, ingredient review (check/warning)

### New Components (4)
- `RealFeelInline.tsx` — Post-meal 5-emoji check-in with tags, auto-dismiss 60s
- `BarcodeScanner.tsx` — html5-qrcode camera + Open Food Facts API + manual fallback
- `EmptyState.tsx` — Reusable empty state component
- Language switcher in Settings (ES/EN with flags)

### Enhanced Screens
- **Home**: i18n, real streak from data, Planificado Hoy with 1-tap log, Training Day toggle, Real Feel inline trigger, Smart Insight cards (protein, hydration, variety, streak)
- **Profile**: Level system, 14 badges grid, streak counter, body data, points progress bar
- **Settings**: Language switcher (ES/EN), i18n labels
- **Onboarding**: 5-step wizard (Goal -> Body data -> TDEE calculation -> Restrictions -> Ready)
- **CreateModal (FAB)**: 6 actions (Registrar, Crear Receta, Importar URL, Tolerancia, Publicar, Barcode)
- **RecipeDetail**: Food quality badge (green/yellow/red with emoji)
- **AddMeal**: Real barcode scanner, food quality emoji, i18n

### Dependencies Added
- `html5-qrcode` — Barcode/QR scanning via device camera

### Files Summary
- **19 new files** created
- **15 existing files** modified
- **2 locale files** (ES + EN, ~300 keys each)
- **3 utility modules** (nutrition, gamification, correlations)
