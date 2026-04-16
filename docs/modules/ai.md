# Module: AI

> AI Coach chat interface and Gemini integration for contextual nutrition guidance.

## Why it exists

The AI Coach provides personalized nutrition advice by understanding the user's current state (daily macros, goals, tolerance logs, Real Feel trends). It transforms RIAL from a passive tracker into an active advisor. The module also powers AI-assisted recipe import (ingredient parsing from URLs).

## Screens

| Screen | File | Nav route | Purpose |
|--------|------|-----------|---------|
| AICoach | `screens/AICoach.tsx` | `ai-coach` | Chat interface with system prompt, quick actions, message history |

## Lib

| Export | File | Purpose |
|--------|------|---------|
| `getGeminiClient` | `lib/gemini.ts` | Singleton Gemini 2.0 Flash API client |
| `generateGeminiViaProxy` | `lib/gemini.ts` | Route requests through Supabase Edge Function (production) |
| `buildSystemPrompt` | `lib/gemini.ts` | Contextualize with user profile, daily macros, goals, locale |

## Data flow

- AI Coach reads from AppStateContext: `userProfile`, `dailyMacros`, `nutritionHistory`, `realFeelLogs`, `savedRecipes`.
- `buildSystemPrompt()` compiles user context into Gemini system prompt.
- Messages persisted to localStorage (`aiChatHistory`).
- Quick actions: analyze macros, meal suggestion, tolerance insight.
- Daily message limit enforced by `useProGate` (free users: limited, Pro: unlimited).

## API routing

| Environment | Route | Secret |
|-------------|-------|--------|
| Local dev | Direct Gemini API | `VITE_GEMINI_API_KEY` (client-side) |
| Production | Supabase Edge Function `gemini-proxy` | `GEMINI_API_KEY` (server-side) |

## Cross-dependencies

### Imports from other modules
- `contexts/AppStateContext.tsx` — user profile, macros, history
- `hooks/useProGate.ts` — message gating
- `lib/supabase.ts` — proxy routing

### Exports to other modules
- Gemini client used by `features/recipes/` for URL import ingredient parsing
- `buildSystemPrompt` pattern reused for recipe intelligence prompts

## Known issues

- Chat history stored in localStorage (no size limit enforcement)
- No streaming response support (full response waits)
- Vision support exists but is not surfaced in UI quick actions
- System prompt can become large with extensive history

## Improvement opportunities

- Streaming responses for better UX
- Multi-modal: photo-based food recognition from camera
- Conversation summarization to keep system prompt compact
- Proactive insights (push notifications based on trends)
- Cost-aware model selection (use smaller models for simple queries)
