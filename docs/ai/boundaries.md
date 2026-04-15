# RIAL AI Boundaries

## Two different AI layers

### 1. Development AI
This layer helps build, review, refactor, document, and deploy the repository.

Examples:
- Codex
- ChatGPT coding sessions
- Claude Code
- Gemini CLI
- Cursor agents
- Windsurf Cascade
- Local models through Ollama or similar wrappers

These tools may use:
- `AGENTS.md`
- `docs/ai/`
- repo source code
- task handoffs
- release and deployment context

### 2. Product AI
This layer powers user-facing capabilities inside the RIAL app.

Examples:
- AI Coach
- recipe import
- photo recognition
- future receipt or ticket scanning
- future low-cost Pro-plan automation flows

These flows must use:
- app-specific prompts
- runtime auth and quotas
- server-side secrets
- cost-aware model selection
- user-safe storage and logging policies

## Hard boundaries
- Do not copy development-agent instructions into runtime prompts.
- Do not expose repo memory, handoffs, or internal workflows to end users.
- Do not treat product AI configuration as the same problem as multi-agent vibe-coding setup.
- Do not mix development secrets with runtime app secrets.

## Practical rule
If a document exists to help agents build the repo, it belongs in `docs/ai/`.
If a document exists to help the shipped app use AI, it belongs with the product feature implementation or product docs, not here.
