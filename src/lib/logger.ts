/**
 * Structured logger with Sentry integration.
 * Thin wrapper — replaces raw console.* across the codebase.
 *
 * This is the single authorized console.* callsite: the whole point of this
 * module is to centralize output. Everything else routes through `logger.*`.
 */
/* eslint-disable no-console */
import * as Sentry from '@sentry/react';

type LogLevel = 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, meta?: LogMeta) {
  const entry = { level, message, timestamp: new Date().toISOString(), ...meta };

  // Console output
  switch (level) {
    case 'error': console.error(`[${message}]`, meta ?? ''); break;
    case 'warn':  console.warn(`[${message}]`, meta ?? ''); break;
    default:      console.log(`[${message}]`, meta ?? ''); break;
  }

  // Send errors and warnings to Sentry as breadcrumbs
  Sentry.addBreadcrumb({
    category: 'app',
    message,
    level: level === 'error' ? 'error' : level === 'warn' ? 'warning' : 'info',
    data: meta,
  });

  // Capture errors as Sentry events
  if (level === 'error') {
    Sentry.captureMessage(message, { level: 'error', extra: entry });
  }
}

export const logger = {
  info:  (message: string, meta?: LogMeta) => log('info', message, meta),
  warn:  (message: string, meta?: LogMeta) => log('warn', message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
};
