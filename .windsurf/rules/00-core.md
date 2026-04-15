---
trigger: always_on
---

- Treat `AGENTS.md` as the universal entrypoint for this repository.
- Treat `docs/ai/` as the shared, versioned memory and deep context layer.
- Do not use `.claude/worktrees/sleepy-knuth` as the release baseline unless the user explicitly asks.
- Keep secrets out of tracked config and prefer server-side secrets for runtime AI.
- For app UI text, maintain i18n discipline across both `es.ts` and `en.ts`.
- For meaningful repo changes, sync docs that actually changed instead of creating parallel rule drift.
