# RIAL — Agent Definitions

## When to use which agent

### Explore (subagent_type: Explore)
Use for: Finding files, understanding code structure, searching for patterns.
- "Where is the barcode scanner code?"
- "How does the meal plan state work?"
- "What screens use useI18n?"

### Plan (subagent_type: Plan)
Use for: Designing implementation approach before writing code.
- New feature architecture
- Multi-file refactors
- Deciding between approaches

### feature-dev:code-explorer
Use for: Deep analysis of execution paths across multiple files.
- Tracing how a meal gets logged end-to-end
- Understanding the Real Feel data flow

### feature-dev:code-reviewer
Use for: Reviewing changes before commit.
- Check for bugs, security issues
- Verify i18n completeness
- Verify TypeScript strictness

### code-simplifier
Use for: Refactoring after feature is working.
- Reducing complexity in Home.tsx (580+ lines)
- Extracting repeated patterns into shared components

## Parallel Agent Strategy
Launch multiple agents when tasks are independent:
```
Agent 1: Explore — find all hardcoded Spanish strings
Agent 2: Explore — check which screens lack empty states
Agent 3: Explore — audit type safety in utils/
```

## Cost-Efficient Patterns
1. **Use Explore for search, not Bash** — Explore agents use Glob/Grep efficiently
2. **Batch independent file reads** — Read 3-4 files in parallel
3. **Use Plan agents once, then execute** — Don't re-plan mid-implementation
4. **TypeScript check is cheap** — Run `npx tsc --noEmit` after every batch of changes
5. **Preview sparingly** — Only screenshot when UI changes are significant
6. **Inline edits over full rewrites** — Use Edit tool, not Write, for existing files

## Task Decomposition Template
For any feature request:
1. **Explore** (1 agent): Understand current state + find reusable code
2. **Plan** (mental or agent): Identify files to create/modify
3. **Execute**: Create files in parallel, edit sequentially
4. **Verify**: `tsc --noEmit` + preview if UI change
5. **Document**: Update CHANGELOG.md + i18n files
