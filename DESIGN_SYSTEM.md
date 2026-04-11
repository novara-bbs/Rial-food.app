# RIAL Design System

## Token Architecture

RIAL uses **Material Design 3 (MD3)** semantic tokens defined as CSS custom properties in `src/index.css`. All colors reference tokens — never hardcode hex values.

### Color Tokens

| Token | Role | Example usage |
|-------|------|---------------|
| `--primary` | Brand accent, active states, CTAs | `bg-primary text-on-primary` |
| `--primary-container` | Subtle primary background | `bg-primary-container` |
| `--tertiary` | High-contrast text (headings, titles) | `text-tertiary` |
| `--on-surface` | Body text on backgrounds | `text-on-surface` |
| `--on-surface-variant` | Secondary/muted text | `text-on-surface-variant` |
| `--surface` | Page background | `bg-surface` |
| `--surface-container-low` | Card backgrounds, inputs | `bg-surface-container-low` |
| `--surface-container-high` | Elevated surfaces, inactive filters | `bg-surface-container-high` |
| `--surface-container-highest` | Highest elevation, badges | `bg-surface-container-highest` |
| `--outline-variant` | Borders, dividers | `border-outline-variant/20` |
| `--error` | Destructive actions | `text-error` |
| `--brand-secondary` | Secondary accent (charts, highlights) | `text-brand-secondary` |
| `--macro-protein` | Protein macro color (`#f87171`) | `text-macro-protein` |
| `--macro-carbs` | Carbs macro color (`#fbbf24`) | `text-macro-carbs` |
| `--macro-fats` | Fat macro color (`#38bdf8`) | `text-macro-fats` |
| `--on-overlay` | Text on dark full-screen overlays (`#ffffff`) | `text-on-overlay` |
| `--on-overlay-muted` | Muted text on overlays (`rgba(255,255,255,0.4)`) | `text-on-overlay/40` |
| `--overlay-border` | Borders on overlays (`rgba(255,255,255,0.1)`) | `border-overlay-border` |

### shadcn Bridge

shadcn/ui components use their own token names. A bridge in `index.css` maps MD3 → shadcn:

```
--foreground    → var(--on-surface)
--card          → var(--surface-container-low)
--muted         → var(--surface-container)
--ring          → var(--primary)
--border        → var(--outline-variant)
```

**Rule**: Use MD3 tokens in custom components. shadcn tokens are only for shadcn primitives (`@/components/ui/*`).

## Themes

6 theme variants defined in `src/index.css`, toggled via CSS class on `<body>`:

| Theme | Class | Primary | Style |
|-------|-------|---------|-------|
| Volt Pro Dark | `:root` (default) | `#dcfd05` (volt green) | Dark technical |
| Volt Pro Light | `.theme-light` | `#65a30d` (lime) | Light technical |
| Blue Dark | `.theme-blue-dark` | `#60a5fa` (sky blue) | Dark calm |
| Blue Light | `.theme-blue-light` | `#2563eb` (royal blue) | Light calm |
| Orange Dark | `.theme-orange-dark` | `#fb923c` (orange) | Dark warm |
| Orange Light | `.theme-orange-light` | `#ea580c` (deep orange) | Light warm |

**Rule**: Never reference theme-specific colors. All components use semantic tokens that adapt automatically.

## Typography

### Font Families

| Class | Usage |
|-------|-------|
| `font-headline` | Headings, titles, section headers. Always `uppercase tracking-tight` or `tracking-widest`. |
| `font-label` | Micro labels, badges, metadata. Always `text-[9px]`–`text-xs`, `uppercase tracking-widest`. |
| `font-body` | Body text, descriptions. Normal case, `text-sm`. |
| `font-mono` | Monospace data, section subtitles. `text-[10px] tracking-[0.3em]`. |

### Typography Hierarchy

| Element | Classes | Usage |
|---------|---------|-------|
| Root screen title | `font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary` | Settings, More, FoodDictionary, Planner, Community, Discover |
| Root screen title (hero) | `font-headline text-3xl font-black tracking-tight uppercase text-tertiary` | Home greeting only |
| PageHeader title | `font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary` | All push-nav screens using PageHeader |
| Section header | `font-headline text-xl font-bold text-tertiary uppercase` | Settings sections, major groups |
| Subsection header | `font-headline text-lg font-bold uppercase text-tertiary tracking-tight` | Secondary headings |
| Mini header | `font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant` | Category labels, group dividers |
| Label/caption | `font-label text-[10px] tracking-widest uppercase text-on-surface-variant` | Form labels, meta info |
| Data emphasis | `font-headline font-black text-{size} text-{token}` | KPI numbers, stats, scores |

**Rule**: `font-black` (weight 900) is intentional for numeric data emphasis and the Home hero title. All other `font-headline` headings use `font-bold`.

## Shared Components (`src/components/patterns/`)

### SearchInput

Standardized search field with optional clear button. Single source of truth for all search bars.

```tsx
import SearchInput from '@/components/patterns/SearchInput';

// Default (full-width)
<SearchInput
  value={query}
  onChange={setQuery}
  placeholder="Buscar recetas..."
  onClear={() => setQuery('')}  // shows × when value non-empty
  className="..."               // optional — merges onto wrapper <div>
/>

// Compact (inside toolbars)
<SearchInput
  value={query}
  onChange={setQuery}
  placeholder="Buscar..."
  size="sm"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Controlled value |
| `onChange` | `(v: string) => void` | required | Change handler |
| `placeholder` | `string` | — | Placeholder text |
| `onClear` | `() => void` | — | If provided, shows × button when value non-empty |
| `size` | `'default' \| 'sm'` | `'default'` | `sm` = compact, used inside toolbars |
| `className` | `string` | — | Merged onto wrapper div |

**Standard styles**: `bg-surface-container-low border border-outline-variant/30 rounded-sm font-label tracking-widest uppercase placeholder:text-on-surface-variant/50 focus:border-primary`

**Consumers**: Discovery, FoodDictionary (with clear), AddMeal, Cocina, RecipeDetail (size sm), Discover

### RecipeCard

Single source of truth for all recipe card layouts.

**RecipeCardRecipe interface** (exported — pass a plain object matching these fields):

```ts
interface RecipeCardRecipe {
  id: string | number;
  title: string;
  img?: string;        // primary image URL
  image?: string;      // fallback image URL (alias)
  tag?: string;        // badge label e.g. "BATCH", "VEGANO"
  matchScore?: number; // 0–100 personalisation score
  time?: string;       // display string e.g. "30M"
  cal?: number;        // kcal
  pro?: number;        // protein grams
  publishedBy?: string; // creator ID (maps to CREATORS_MAP)
}
```

```tsx
import RecipeCard from '@/components/patterns/RecipeCard';

<RecipeCard
  recipe={recipe}
  variant="carousel"    // carousel | grid | hero (default: carousel)
  onPress={() => {}}
  onSave={(e) => {}}    // optional — carousel only
  onDelete={(e) => {}}  // optional — grid only
  onShare={(e) => {}}   // optional — carousel only
  isSaved={false}
  className="..."       // optional — merged via cn() for outer container
/>
```

| Variant | Dimensions | Use case |
|---------|-----------|----------|
| `carousel` | `w-52 h-72` fixed | Swimlane horizontal scroll |
| `grid` | `h-64 w-full` responsive | Recipe collection grids |
| `hero` | `aspect-video w-full` | Editorial pick / featured |

### Swimlane

Horizontal scroll section with uppercase header. Auto-hides when children array is empty.

```tsx
import Swimlane from '@/components/patterns/Swimlane';

<Swimlane
  title="Para Ti"
  className="..."   // optional — merged onto the outer <section> (default: mb-8)
>
  {recipes.map(r => <RecipeCard key={r.id} recipe={r} variant="carousel" />)}
</Swimlane>
```

### FilterRow

Horizontal scrollable filter row with two variants.

```tsx
import FilterRow from '@/components/patterns/FilterRow';

// Icon variant — meal type selectors
<FilterRow
  options={[{ id: 'all', label: 'Todo', icon: Sparkles }]}
  active={activeId}
  onChange={setActiveId}
  variant="icon"
  className="..."   // optional — merged onto the scroll container
/>

// Pill variant — collection/category chips
<FilterRow
  options={[{ id: 'all', label: 'Todas', count: 13 }]}
  active={activeId}
  onChange={setActiveId}
  variant="pill"
  className="..."   // optional — merged onto the scroll container
/>
```

| Variant | Shape | Active | Inactive |
|---------|-------|--------|----------|
| `icon` | `rounded-sm` flex-col icon+label | `bg-primary text-on-primary` | `bg-surface-container-high` |
| `pill` | `rounded-full` horizontal chip | `bg-primary text-on-primary` | `bg-surface-container-low border` |

**Note**: All buttons have `type="button"` for form safety. FilterRow is single-select only. For toggle-deselect (click active to clear), use inline implementation.

### TabNav

Underline tab bar with optional icon support.

```tsx
import TabNav from '@/components/patterns/TabNav';

<TabNav
  tabs={[
    { id: 'recipes', label: 'Recetas', icon: BookOpen },
    { id: 'plan', label: 'Plan' },
  ]}
  active={activeTab}
  onChange={setActiveTab}
  className="..."   // optional — merged onto the border-b container
/>
```

Active: `text-primary border-primary`. Inactive: `text-on-surface-variant border-transparent`.

**When to use TabNav vs shadcn Tabs**: TabNav for simple view switching (no content panels). shadcn `Tabs` when you need `TabsContent` wrappers for animation/lazy rendering.

### PageHeader

Standard back-navigation header for all push-nav screens. Standardizes back button style, RIAL label, and title.

```tsx
import PageHeader from '@/components/patterns/PageHeader';

// With label (default "RIAL")
<PageHeader onBack={onBack} title="Pantry" />

// Custom label
<PageHeader onBack={onBack} label={t.checkIn.title} title={t.checkIn.morningReport} />

// No label
<PageHeader onBack={onBack} label="" title={t.profile.title} />

// With right action
<PageHeader
  onBack={onBack}
  title="Notifications"
  rightAction={<button>Mark all read</button>}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onBack` | `() => void` | required | Back button handler |
| `label` | `string` | `"RIAL"` | Small label above title. Empty string = no label |
| `title` | `string` | required | Page title |
| `rightAction` | `ReactNode` | — | Optional right-side slot (buttons, badges) |

**When NOT to use PageHeader**: Hero layouts with full-bleed images (RecipeDetail), sticky chat headers (AICoach pro), conditional back buttons (ShoppingList inside tabs), hero pricing (RialPlus non-pro).

### EmptyState

Centered empty state with emoji icon, optional title, description, optional CTA, and optional children for custom actions.

```tsx
import EmptyState from '@/components/EmptyState';

// Simple
<EmptyState icon="🔍" title="Sin resultados" description="Prueba con otro término" />

// With single CTA
<EmptyState icon="📖" description="Tu recetario está vacío" ctaLabel="Crear" onCta={onCreate} />

// With multiple CTAs (children)
<EmptyState icon="📦" title="Lista vacía" description="Planifica tus comidas">
  <div className="flex gap-3">
    <button className="...">Ir al plan</button>
    <button className="...">Añadir item</button>
  </div>
</EmptyState>
```

## Button Convention

Always use `<Button>` from `@/components/ui/button` for user actions. Reserve `<button>` for interactive controls that don't fit any variant (icon toggles, filter chips, custom affordances).

| Variant | When to use |
|---------|-------------|
| `default` | Primary action, CTAs |
| `destructive` | Delete, logout, irreversible actions |
| `outline` | Secondary action, cancel |
| `brand` | Secondary brand color (Cocina, recipe CTAs) |
| `ghost` | Subtle inline actions |

**Rules**:
- All `<button>` elements **must** have `type="button"` to prevent accidental form submission.
- Icon-only buttons **must** have `aria-label` describing the action.
- Use `rounded-sm` (base provides it). Never override with `rounded-md` or `rounded-lg`.
- Use size props (`xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`) instead of padding overrides.

## Form Input Convention

All form inputs follow this pattern:

```
Label:  font-label text-[10px] tracking-widest uppercase text-on-surface-variant block mb-2
Input:  bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3
        text-on-surface text-sm focus:outline-none focus:border-primary
Select: Same as input + uppercase text-xs (for enumerated options)
Range:  bg-surface-container-highest h-2 rounded-full appearance-none accent-primary
```

**Rule**: Use `bg-surface-container-low` for all form inputs. `bg-surface-container-highest` is reserved for elevated UI (badges, inactive chips) — never for inputs.

## Style Rules

| Rule | Do | Don't |
|------|-----|-------|
| Border radius | `rounded-sm` (cards, buttons, inputs) | `rounded-lg`, `rounded-xl` |
| Pills/chips | `rounded-full` | `rounded-sm` for pills |
| Opacity borders | `border-outline-variant/20` | `border-gray-700` |
| Hover states | `hover:bg-primary/20` or `hover:opacity-90` | `hover:bg-gray-800` |
| Uppercase | Headlines + labels always uppercase | Body text uppercase |
| Tracking | `tracking-tight` (headlines), `tracking-widest` (labels) | Default tracking on styled text |

## Component Hierarchy

```
src/components/
├── ui/                    ← shadcn primitives (DO NOT modify)
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── tabs.tsx
│   └── ...
├── EmptyState.tsx         ← Shared empty state
└── patterns/              ← Domain-specific shared components
    ├── RecipeCard.tsx     ← 3 variants: carousel, grid, hero
    ├── Swimlane.tsx       ← Horizontal scroll + header
    ├── FilterRow.tsx      ← 2 variants: icon, pill
    ├── TabNav.tsx         ← Underline tab bar
    ├── PageHeader.tsx     ← Push-nav back + label + title
    └── SearchInput.tsx    ← Unified search bar (default + sm)
```

## Page Wrapper Convention

All screens use a consistent wrapper pattern. The `max-w` value depends on content type:

```tsx
<div className="px-6 max-w-{size} mx-auto space-y-6 pb-24">
```

| Content type | `max-w` | Examples |
|-------------|---------|----------|
| Feature/form screens | `max-w-4xl` | DailyCheckIn, AddMeal, Pantry, CreateRecipe |
| Social/reading screens | `max-w-2xl` | CreatorProfile, Notifications, CreatePost |
| Grid/gallery screens | `max-w-5xl` | Cocina recipes tab, Home |
| Full-width | none | Discovery (swimlanes edge-to-edge) |

**Rules**:
- Bottom padding: always `pb-24` (clears bottom nav)
- Horizontal padding: always `px-6`
- Centering: always `mx-auto`
- Spacing: `space-y-6` default, `space-y-8` for breathing room in form screens

## Known Exceptions (Intentional Deviations)

These patterns intentionally deviate from conventions — do not "fix" them:

| Pattern | Location | Reason |
|---------|----------|--------|
| `bg-neutral-950` + `text-on-overlay` | CookMode.tsx | Fixed-black overlay — semantic bg doesn't theme-switch here by design |
| `bg-black` | StoryViewer.tsx | Full-screen story viewer — always dark regardless of theme |
| `COLORS` array hex values | CreateStory.tsx | Story background palette — decorative, not theme tokens |
| `bg-black` / `bg-white` wearable icons | Settings.tsx wearables section | Brand logos (Whoop=black, Oura=white) — must preserve brand identity |
| `bg-blue-500` Garmin icon | Settings.tsx | Garmin brand color |
| `bg-green-600` finish button | CookMode.tsx | Success state — fixed semantic meaning |
| `text-white` in `destructive` Button | button.tsx | On `bg-destructive` (solid red) — white text is correct regardless of theme |
| `font-black` on KPI numbers | Progress, WeeklyCheckIn, FastingTimer | Data emphasis — intentional 900 weight |
| `font-black` on Home greeting | Home.tsx | Hero landing screen — strongest visual weight |
| Inline search (food dislikes) | Settings.tsx | Has `@` prefix layout — cannot use SearchInput |
| Multi-select chips | DailyCheckIn symptoms | Inline — FilterRow is single-select |
| Toggle-deselect filter | FoodDictionary categories | Inline — toggles to null on re-click |
| 2x2 status grid | DailyCheckIn status | Unique UI, not a filter pattern |
| Tab duality | TabNav vs shadcn Tabs | Both valid — different use cases |
