/**
 * Typed environment accessors.
 * All env vars are read once and exported as constants.
 */

const env = (import.meta as any).env ?? {};

export const GEMINI_API_KEY: string =
  env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';

export const IS_DEV: boolean = env.DEV === true;

export const IS_PROD: boolean = env.PROD === true;
