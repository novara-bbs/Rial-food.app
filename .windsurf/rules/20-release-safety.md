---
trigger: glob
globs:
  - vercel.json
  - .env.example
  - .vercel/**
  - .github/workflows/**
  - package.json
  - src/config/env.ts
  - supabase/**
---

- The active release target is `rial-food/main`.
- Do not push release work to `origin` unless the user explicitly asks.
- The active Vercel project is `rial.app.v1.5` with project id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`.
- Keep repo config free of committed secrets; runtime Gemini production flows should use the Supabase proxy and server-side `GEMINI_API_KEY`.
- When deploy-sensitive files change, verify env expectations and update `CHANGELOG.md` if behavior or release posture changes.
