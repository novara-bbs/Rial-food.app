import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Sparkles, Lock, Crown, Zap, Activity, Utensils, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionCard from '../../../components/SectionCard';
import ReactMarkdown from 'react-markdown';
import { useI18n } from '../../../i18n';
import { Heading } from '@/components/ui/Typography';
import { generateAIResponse, buildSystemPrompt, type MemoryContext } from '@/lib/gemini';
import { logger } from '../../../lib/logger';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { useAIMessageGate } from '../../../hooks/useProGate';

const MAX_STORED_MESSAGES = 50;

export default function AICoach({
  onBack,
  isPro,
  memoryContext
}: {
  onBack: () => void,
  isPro: boolean,
  memoryContext: MemoryContext
}) {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useLocalStorageState<{role: 'user' | 'model', text: string}[]>(
    'aiCoachMessages',
    [{ role: 'model', text: t.aiCoach.greeting }]
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { canSendMessage, recordMessage, remainingMessages } = useAIMessageGate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([{ role: 'model', text: t.aiCoach.greeting }]);
    setShowClearConfirm(false);
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend) return;

    if (!canSendMessage()) {
      setMessages((prev) =>[...prev, { role: 'model', text: t.aiCoach.dailyLimitReached }]);
      return;
    }

    recordMessage();
    setMessages((prev) =>[...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setIsLoading(true);

    try {
      const systemInstruction = buildSystemPrompt(memoryContext, locale);
      const text = await generateAIResponse(textToSend, systemInstruction);

      setMessages((prev) =>{
        const updated: { role: 'user' | 'model'; text: string }[] = [...prev, { role: 'model' as const, text: text || t.aiCoach.errorMessage }];
        return updated.length > MAX_STORED_MESSAGES ? updated.slice(-MAX_STORED_MESSAGES) : updated;
      });
    } catch (error) {
      logger.error('Error calling AI', { error: error instanceof Error ? error.message : String(error) });
      setMessages((prev) =>[...prev, { role: 'model' as const, text: t.aiCoach.errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: <Activity className="w-4 h-4" />, label: t.aiCoach.quickActions.analyzeMacros, prompt: t.aiCoach.quickActions.analyzeMacros },
    { icon: <Utensils className="w-4 h-4" />, label: t.aiCoach.quickActions.mealSuggestion, prompt: t.aiCoach.quickActions.mealSuggestion },
    { icon: <Zap className="w-4 h-4" />, label: t.aiCoach.quickActions.toleranceInsight, prompt: t.aiCoach.quickActions.toleranceInsight }
  ];

  if (!isPro) {
    return (
      <div className="px-6 max-w-4xl mx-auto space-y-8 h-full flex flex-col">
        <header className="flex items-center gap-4 mb-6 shrink-0 pt-6">
          <button type="button" 
            onClick={onBack}
            className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-tertiary hover:bg-surface-container-highest transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">{t.aiCoach.brand}</span>
            <Heading level="h2" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" /> {t.aiCoach.title}
            </Heading>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-on-surface-variant" />
          </div>
          <Heading level="h3">{t.aiCoach.proRequired}</Heading>
          <p className="text-on-surface-variant max-w-md">{t.aiCoach.proMessage}</p>
          <Button
            onClick={onBack}
            className="px-8 py-4 gap-2 text-title-sm"
          >
            <Crown className="w-5 h-5" /> {t.aiCoach.upgradePrompt}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col bg-surface">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-outline-variant/20 shrink-0 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <button type="button"
          onClick={onBack}
          className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-tertiary hover:bg-surface-container-highest transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">{t.aiCoach.proFeature}</span>
          <Heading level="h2" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> {t.aiCoach.title}
          </Heading>
        </div>
        {messages.length > 1 && (
          <div className="relative">
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-micro font-label text-on-surface-variant uppercase tracking-widest">{t.aiCoach.clearChatConfirm}</span>
                <button type="button" onClick={clearChat} className="px-2 py-1 bg-error/20 text-error rounded-sm text-micro font-bold uppercase">Sí</button>
                <button type="button" onClick={() => setShowClearConfirm(false)} className="px-2 py-1 bg-surface-container-highest text-on-surface-variant rounded-sm text-micro font-bold uppercase">No</button>
              </div>
            ) : (
              <button type="button"
                onClick={() => setShowClearConfirm(true)}
                className="w-9 h-9 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                aria-label={t.aiCoach.clearChat}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-surface-container-highest text-tertiary' : 'bg-primary/20 text-primary'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[85%] p-4 rounded-sm ${msg.role === 'user' ? 'bg-surface-container-highest text-tertiary rounded-tr-none' : 'bg-surface-container-low border border-outline-variant/20 text-on-surface-variant rounded-tl-none'}`}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              ) : (
                <div className="prose prose-sm prose-custom max-w-none prose-p:leading-relaxed prose-pre:bg-surface-container-highest prose-pre:border prose-pre:border-outline-variant/20">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <SectionCard padding="none" spacing="none" className="p-4 rounded-tl-none flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </SectionCard>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface border-t border-outline-variant/20 shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.length === 1 && !isLoading && (
            <div className="flex flex-wrap gap-2 pb-2">
              {quickActions.map((action, idx) => (
                <button type="button"
                  key={idx}
                  onClick={() => handleSend(action.prompt)}
                  className="inline-flex items-center gap-1.5 min-h-7 px-3 py-1 bg-surface-container-low border border-outline-variant/30 rounded-full text-micro font-medium normal-case tracking-normal text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
          {!isPro && (
            <p className="text-micro font-label text-on-surface-variant uppercase tracking-widest text-center">
              {remainingMessages() > 0
                ? `${remainingMessages()}/5 ${t.aiCoach.messagesRemaining}`
                : t.aiCoach.dailyLimitReached}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.aiCoach.placeholder}
              disabled={!canSendMessage()}
              className="flex-1 bg-surface-container-highest border border-outline-variant/30 py-3 px-4 text-sm font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50 disabled:opacity-50"
            />
            <button type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || !canSendMessage()}
              className="w-12 h-12 rounded-sm bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-primary/90 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
