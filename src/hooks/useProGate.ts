import { useAppState } from '../contexts/AppStateContext';
import { useNavigation } from '../contexts/NavigationContext';
import { toast } from 'sonner';
import { useI18n } from '../i18n';

const FREE_AI_MESSAGES_PER_DAY = 5;
const LS_KEY = 'rial_aiMessageCount';

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

export function useProGate() {
  const { isPro } = useAppState();
  const { navigateTo } = useNavigation();
  const { t } = useI18n();

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
