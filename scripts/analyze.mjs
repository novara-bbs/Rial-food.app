#!/usr/bin/env node
/**
 * Cross-platform bundle analyzer launcher.
 *
 * The native `ANALYZE=1 vite build` syntax fails on Windows cmd.exe.
 * This wrapper sets the env var via Node's `process.env` before spawning
 * vite, so it works identically on Linux/macOS/Windows.
 *
 * Output:
 *   - dist/                   (production build, same as `npm run build`)
 *   - dist/stats.html         (rollup-plugin-visualizer report)
 *
 * Used by:
 *   - `npm run analyze`       (manual inspection)
 *   - `npm run release:preflight` (warn-only — produces stats.html for CI artifact)
 */
import { spawn } from 'node:child_process';

const proc = spawn('npx', ['vite', 'build'], {
  env: { ...process.env, ANALYZE: '1' },
  stdio: 'inherit',
  shell: true,
});

proc.on('exit', code => process.exit(code ?? 1));
proc.on('error', err => {
  console.error('[analyze] Failed to launch vite build:', err.message);
  process.exit(1);
});
