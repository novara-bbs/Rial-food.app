# Contributing to RIAL

## Development Workflow

### Before starting any task
1. Read `AGENTS.md` for the universal repo rules
2. Read `docs/ai/state.md` for the current release snapshot
3. Use the tool-specific adapter only if your IDE needs it, for example `CLAUDE.md` or `GEMINI.md`
4. Check `CHANGELOG.md` for recent changes
5. Run `npm run dev` when the task needs the dev server

### Making changes
1. **Read first**: Always read the files you'll modify before editing
2. **i18n**: Every user-visible string goes through `useI18n()` — add keys to both `es.ts` and `en.ts`
3. **Type check**: Run `npx tsc --noEmit` after each batch of changes
4. **Preview**: Check visual changes in the browser (port 3000)
5. **Small edits**: Prefer Edit tool over Write for existing files — only change what's needed

### Commit conventions
```
feat: Add barcode scanner with Open Food Facts API
fix: Correct streak calculation for grace days
i18n: Add missing English translations for Fasting screen
refactor: Extract meal logging into shared hook
```

## Architecture Decisions

### Why no React Router?
State-based routing keeps the bundle small and avoids unnecessary complexity for a prototype. The `navigateTo()` function in `App.tsx` handles all transitions with `previousScreen` for back navigation.

### Why localStorage instead of Supabase?
This is a prototype/MVP. The `useLocalStorageState` hook provides the same API as a future backend migration. When ready, swap the hook implementation — components don't change.

### Why custom i18n instead of react-i18next?
Lighter, type-safe, no configuration overhead. The `Translations` type ensures both locales have identical keys. Adding a language is one file + two lines.

### Why no state management library?
Props + a few contexts cover the needs. The app has ~15 state values total. If state grows beyond 25 values, extract into domain contexts (NutritionContext, RecipeContext, UserContext).

## Performance Tips for Agent Sessions

### Credit-efficient patterns
1. **Batch parallel reads**: Read 3-4 files in one message
2. **Use Grep/Glob over Bash**: Dedicated tools are faster and cheaper
3. **Type-check in batch**: Make 5-10 edits, then one `tsc --noEmit`
4. **Screenshot sparingly**: Only after significant UI changes
5. **Use Explore agents**: For multi-file searches, not manual Grep chains
6. **Plan before coding**: One Plan agent saves 10 retry edits

### Multi-task execution
```
Parallel (no dependencies):
- Create Screen A + Create Screen B + Create utility

Sequential (has dependencies):
- Create type definitions → Create component using types → Wire into App.tsx
```

### Common pitfalls
- Don't edit App.tsx and a screen simultaneously if they depend on the same routing or shared state changes
- Don't forget to add both ES and EN translations
- Don't use `replace_all: true` on common words like "const" or "return"
- Don't create files without adding them to the routing or import chain

## Adding a New Feature — Checklist

For new **screens**, follow [`docs/NEW-SCREEN-CHECKLIST.md`](./NEW-SCREEN-CHECKLIST.md) — it is mandatory and covers primitives, tokens, accessibility, i18n, and verification in one place.

For smaller feature additions (utility, handler, data):
- [ ] Define i18n keys (ES + EN) — confirm with `npm run check:i18n`
- [ ] Create types in `types.ts` if needed
- [ ] Create utility functions in `utils/` if needed
- [ ] Create component/screen in `components/` or `screens/`
- [ ] Wire into `App.tsx` (state, handler, routing)
- [ ] Update `BottomNav`/`Sidebar`/`More` if navigation changes
- [ ] Run `npm run release:preflight` before asking for review
- [ ] Visual test in browser
- [ ] Update `CHANGELOG.md`

**Design-system references:**
- [`docs/DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) — tokens, themes, do/don't
- [`docs/PRIMITIVES.md`](./PRIMITIVES.md) — canonical components with examples
- [`docs/adr/`](./adr/) — architectural decisions (ADR-001 through ADR-007)

## Adding a New Language — Checklist

- [ ] Create `src/i18n/locales/{code}.ts` (copy from `es.ts`)
- [ ] Translate all ~300 keys
- [ ] Add import + entry in `src/i18n/index.ts` locales map
- [ ] Extend `Locale` type union
- [ ] Add flag button in `Settings.tsx` language section
- [ ] Update `docs/i18n-dictionary.md`
- [ ] Test all screens in new language
