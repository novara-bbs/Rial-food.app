# Using Claude Code Skills Efficiently with RIAL

## Available Skills (invoke with /)

### /commit
Auto-generates a commit message from staged changes. Use after completing a sprint.

### /simplify  
Reviews recently changed code for reuse, quality, and efficiency. Run after each sprint to clean up.

### /review-pr or code-review:code-review
Reviews code for bugs, logic errors, security. Use before merging.

### /frontend-design
Creates production-grade UI components. Use when adding new screens with high design quality.

### /feature-dev
Guided feature development. Use for complex multi-file features that need architecture planning.

### /claude-md-management:revise-claude-md
Updates CLAUDE.md with learnings from the session. Run at end of major sessions.

### /schedule
Create recurring tasks (e.g., weekly type-check, daily build test).

## Credit Optimization Strategies

### 1. Batch operations
Instead of editing files one by one:
```
BAD:  Edit file A -> verify -> Edit file B -> verify -> Edit file C -> verify
GOOD: Edit file A + Edit file B + Edit file C (parallel) -> verify once
```

### 2. Use the right tool
| Task | Best tool | Avoid |
|------|-----------|-------|
| Find a file | Glob | Bash(find) |
| Search in files | Grep | Bash(grep) |
| Read a file | Read | Bash(cat) |
| Edit a file | Edit | Write (full rewrite) |
| Create new file | Write | Bash(echo >) |
| Run commands | Bash | N/A |

### 3. Parallel agents for research
```
Good: Launch 2 Explore agents in parallel to search different areas
Bad: Sequential Grep calls trying different patterns
```

### 4. Preview server management
- Start preview once with `preview_start`, reuse the serverId
- Screenshot only when needed (UI changes)
- Use `preview_eval` for quick DOM checks instead of screenshots
- Use `preview_inspect` for CSS verification instead of screenshots

### 5. Context management
- Keep CLAUDE.md under 200 lines — it's loaded every conversation
- Use memory files for long-term knowledge
- Use TodoWrite for session-local tracking
- Don't repeat context that's in CLAUDE.md

## Multi-language Development Workflow

### Adding a new feature with i18n
1. Define the feature's text strings
2. Add ES keys to `src/i18n/locales/es.ts` FIRST (primary)
3. Add EN keys to `src/i18n/locales/en.ts`
4. Build the component using `const { t } = useI18n()`
5. Test in ES, switch to EN to verify, switch back

### Adding a new language
Time estimate: ~2 hours for full translation of ~300 keys
1. Copy `es.ts` as template
2. Translate all values
3. Register in `i18n/index.ts`
4. Add UI toggle in Settings
5. Test all 22 screens

### Current locales
- `es` — Spanish (complete, 300+ keys)
- `en` — English (complete, 300+ keys)
- Future: `pt` (Portuguese), `fr` (French), `de` (German)

## Enterprise Readiness Checklist

### Done
- [x] TypeScript strict mode
- [x] i18n system with auto-detection
- [x] Themeable (6 themes, dark/light)
- [x] Responsive (mobile-first + desktop sidebar)
- [x] Accessibility (ARIA labels on tabs, semantic HTML)
- [x] State persistence (localStorage, migration-ready)
- [x] Modular architecture (screens/components/utils/hooks separation)

### Next steps for enterprise
- [ ] Backend (Supabase PostgreSQL + RLS)
- [ ] Authentication (Supabase Auth or Auth0)
- [ ] API layer (tRPC or REST)
- [ ] Testing (Vitest + Testing Library)
- [ ] CI/CD (GitHub Actions)
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog or Mixpanel)
- [ ] PWA manifest + service worker
- [ ] Performance budgets (Lighthouse CI)
- [ ] Accessibility audit (axe-core)
