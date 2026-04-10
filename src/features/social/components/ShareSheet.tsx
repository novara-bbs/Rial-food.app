import { Share2, Copy, Repeat2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';

interface ShareSheetProps {
  content: string;
  onRepost?: () => void;
  onClose: () => void;
}

export default function ShareSheet({ content, onRepost, onClose }: ShareSheetProps) {
  const { t } = useI18n();

  const copyText = () => {
    navigator.clipboard.writeText(content);
    toast.success(t.share?.copied || 'Copied');
    onClose();
  };

  const shareVia = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: content });
      } catch { /* user cancelled */ }
    } else {
      copyText();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div className="bg-surface-container-low border-t border-outline-variant/20 w-full max-w-md rounded-t-lg overflow-hidden animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/10">
          <h3 className="font-headline font-bold text-sm uppercase text-tertiary tracking-widest">{t.share?.title || 'Share'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {onRepost && (
            <button
              onClick={() => { onRepost(); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-sm hover:bg-surface-container-highest transition-colors text-left"
            >
              <Repeat2 className="w-5 h-5 text-primary" />
              <span className="font-label text-xs font-bold tracking-widest uppercase text-tertiary">{t.share?.repost || 'Repost'}</span>
            </button>
          )}
          <button
            onClick={copyText}
            className="w-full flex items-center gap-3 p-3 rounded-sm hover:bg-surface-container-highest transition-colors text-left"
          >
            <Copy className="w-5 h-5 text-on-surface-variant" />
            <span className="font-label text-xs font-bold tracking-widest uppercase text-tertiary">{t.share?.copyText || 'Copy text'}</span>
          </button>
          <button
            onClick={shareVia}
            className="w-full flex items-center gap-3 p-3 rounded-sm hover:bg-surface-container-highest transition-colors text-left"
          >
            <Share2 className="w-5 h-5 text-on-surface-variant" />
            <span className="font-label text-xs font-bold tracking-widest uppercase text-tertiary">{t.share?.shareVia || 'Share via...'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
