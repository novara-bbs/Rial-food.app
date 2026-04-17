import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { logger } from '../lib/logger';

export function useLocalStorageState<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      logger.warn('useLocalStorageState.read failed', { key, error });
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      logger.warn('useLocalStorageState.write failed', { key, error });
    }
  }, [key, state]);

  return [state, setState];
}
