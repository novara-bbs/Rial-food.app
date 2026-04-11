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

| Class | Usage |
|-------|-------|
| `font-headline` | Headings, titles, section headers. Always `uppercase tracking-tight` or `tracking-widest`. |
| `font-label` | Micro labels, badges, metadata. Always `text-[9px]`–`text-xs`, `uppercase tracking-widest`. |
| `font-body` | Body text, descriptions. Normal case, `text-sm`. |
| `font-mono` | Monospace data, section subtitles. `text-[10px] tracking-[0.3em]`. |

## Shared Components (`src/components/patterns/`)

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
    └── PageHeader.tsx     ← Push-nav back + label + title
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

## Known Gaps (Out of Scope)

| Pattern | Location | Status |
|---------|----------|--------|
| Multi-select chips | DailyCheckIn symptoms | Inline — FilterRow is single-select |
| Toggle-deselect filter | FoodDictionary categories | Inline — needs `toggleable` prop |
| 2x2 status grid | DailyCheckIn status | Unique UI, not a filter pattern |
| Tab duality | TabNav vs shadcn Tabs | Both valid — different use cases |
