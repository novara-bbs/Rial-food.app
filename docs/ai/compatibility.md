# RIAL Tool Compatibility

## Canonical layers
1. `AGENTS.md` is the universal root entrypoint.
2. `docs/ai/` is the shared source of truth for deep context.
3. Tool-specific adapters stay thin and should not fork the project rules.

## Current adapter matrix

| Tool | Primary entrypoint | Extra config in repo | Notes |
| --- | --- | --- | --- |
| Codex / ChatGPT Codex | `AGENTS.md` | None required | Reads shared docs directly |
| Claude Code | `CLAUDE.md` | `.claude/skills/` | `CLAUDE.md` imports shared repo context |
| Gemini CLI | `GEMINI.md` | `.gemini/settings.json` | Uses root context files plus markdown imports |
| Cursor | `AGENTS.md` | `.cursor/rules/*.mdc` | Use rules for cross-cutting concerns and lighter token loading |
| Windsurf | `AGENTS.md` | `.windsurf/rules/*.md` | `AGENTS.md` works natively and rules add targeted control |
| Ollama / local wrappers | `AGENTS.md` | None required | Manual workflows should follow the shared docs |

## Optional tools not configured yet
- GitHub Copilot
- Continue
- Cline
- Roo
- Amazon Q

These are documented as optional consumers of the shared docs.
Do not add heavy repo-specific config for them until there is real usage.

## Portability rules
- Keep `AGENTS.md` plain markdown.
- Keep `docs/ai/` free of IDE-specific syntax except where an adapter explicitly imports it.
- Keep rules short so IDEs do not pay a token cost on every prompt.
- Prefer one shared idea written once over parallel copies in multiple tool files.
