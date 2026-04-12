/**
 * useProGate — checks the user's subscription status.
 *
 * Source of truth:
 *  - Native (iOS/Android): RevenueCat entitlement "pro"
 *  - Web (PWA/browser):    localStorage isPro flag (set by mock or future web checkout)
 *
 * Cached entitlement: if offline for up to 7 days, trust the last known RC value.
 */
import { useAppState } from '../contexts/AppStateContext';
import { useNavigation } from '../contexts/NavigationContext';
import { toast } from 'sonner';
import { useI18n } from '../i18n';
import { useEffect } from 'react';
import { checkProEntitlement } from '../lib/purchases';
import { isNative } from '../lib/platform';

const FREE_AI_MESSAGES_PER_DAY = 5;
const LS_KEY = 'rial_aiMessageCount';
const RC_CACHE_KEY = 'rial_rcProCache';
const RC_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getAIMessageCount(): number {
  try {
    const data = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return data.date === getTodayKey() ? data.count : 0;
  } catch {
    return 0;
  }
}

function incrementAIMessageCount(): void {
  const today = getTodayKey();
  const data = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  if (data.date !== today) {
    localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count: 1 }));
  } else {
    localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count: (data.count || 0) + 1 }));
  }
}

/** Read cached RevenueCat result (valid for 7 days) */
function getCachedRCPro(): boolean | null {
  try {
    const raw = localStorage.getItem(RC_CACHE_KEY);
    if (!raw) return null;
    const { isPro, timestamp } = JSON.parse(raw) as { isPro: boolean; timestamp: number };
    if (Date.now() - timestamp > RC_CACHE_TTL_MS) return null;
    return isPro;
  } catch {
    return null;
  }
}

function setCachedRCPro(isPro: boolean): void {
  localStorage.setItem(RC_CACHE_KEY, JSON.stringify({ isPro, timestamp: Date.now() }));
}

export function useProGate() {
  const { isPro, setIsPro } = useAppState();
  const { navigateTo } = useNavigation();
  const { t } = useI18n();

  // On native: verify entitlement with RevenueCat on mount (with 7-day offline cache)
  useEffect(() => {
    if (!isNative) return;
    const cached = getCachedRCPro();
    checkProEntitlement()
      .then(rcIsPro => {
        setCachedRCPro(rcIsPro);
        if (rcIsPro !== isPro) setIsPro(rcIsPro);
      })
      .catch(() => {
        // Offline — trust cached value if available
        if (cached !== null && cached !== isPro) setIsPro(cached);
      });
  }, []); // eslint-disable-line

  const showGate = () => {
    toast(t.rialPlus.upgrade, { action: { label: 'RIAL+', onClick: () => navigateTo('rial-plus') } });
    navigateTo('rial-plus');
  };

  return { isPro, showGate };
}

export function useAIMessageGate() {
  const { isPro } = useAppState();

  const canSendMessage = (): boolean => {
    if (isPro) return true;
    return getAIMessageCount() < FREE_AI_MESSAGES_PER_DAY;
  };

  const recordMessage = (): void => {
    if (!isPro) incrementAIMessageCount();
  };

  const remainingMessages = (): number => {
    if (isPro) return Infinity;
    return Math.max(0, FREE_AI_MESSAGES_PER_DAY - getAIMessageCount());
  };

  return { canSendMessage, recordMessage, remainingMessages };
}
