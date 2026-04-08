import { ArrowLeft, Camera, Send, Image as ImageIcon, Activity, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../i18n';

export default function CreatePost({ onBack, onCreatePost }: { onBack: () => void, onCreatePost?: (content: string, performance?: any) => void }) {
  const { t } = useI18n();
  const [content, setContent] = useState('');
  const [attachPerformance, setAttachPerformance] = useState(false);
  const userPerformance = { recovery: 82, strain: 14.5 };

  return (
    <div className="px-6 max-w-2xl mx-auto space-y-6 pb-24">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-tertiary hover:bg-surface-container-highest transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">{t.createPost.community}</span>
            <h2 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">{t.createPost.title}</h2>
          </div>
        </div>
        <button
          onClick={() => onCreatePost?.(content, attachPerformance ? userPerformance : undefined)}
          disabled={!content.trim()}
          className="bg-primary text-on-primary px-4 py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> {t.common.publish}
        </button>
      </header>

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.createPost.placeholder}
          className="w-full bg-transparent p-6 font-body text-lg text-tertiary focus:outline-none placeholder:text-outline-variant min-h-[200px] resize-none"
        />

        {attachPerformance && (
          <div className="px-6 pb-6">
            <div className="bg-background rounded-sm border border-primary/30 p-4 grid grid-cols-2 gap-4 relative">
              <button onClick={() => setAttachPerformance(false)} className="absolute -top-2 -right-2 w-6 h-6 bg-error text-on-error rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">X</button>
              <div className="flex flex-col items-center justify-center text-center p-2">
                <Activity className="w-5 h-5 text-primary mb-1" />
                <span className="font-headline text-xl font-bold text-tertiary">{userPerformance.recovery}%</span>
                <span className="font-label text-[10px] tracking-widest text-primary uppercase">{t.community.recovery}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2 border-l border-outline-variant/20">
                <TrendingUp className="w-5 h-5 text-brand-secondary mb-1" />
                <span className="font-headline text-xl font-bold text-tertiary">{userPerformance.strain}</span>
                <span className="font-label text-[10px] tracking-widest text-brand-secondary uppercase">{t.community.strain}</span>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-outline-variant/10 p-4 bg-surface-container-highest flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors" aria-label="Camera">
            <Camera className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-brand-secondary hover:bg-brand-secondary/10 transition-colors" aria-label="Image">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setAttachPerformance(!attachPerformance)}
            aria-label={t.createPost.includePerformance}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${attachPerformance ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-primary/10'}`}
          >
            <Activity className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <span className="font-label text-xs font-bold tracking-widest text-outline-variant uppercase">{content.length} / 500</span>
        </div>
      </div>
    </div>
  );
}
