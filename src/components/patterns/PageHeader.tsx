import { ArrowLeft } from 'lucide-react';

import { Heading } from '@/components/ui/Typography';
import { APP_NAME } from '@/config/brand';

export default function PageHeader({ onBack, label = APP_NAME, title, rightAction }: {
  onBack: () => void;
  label?: string;
  title: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <header className={`flex items-center ${rightAction ? 'justify-between' : 'gap-4'}`}>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          {label && <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">{label}</span>}
          <Heading level="h2">{title}</Heading>
        </div>
      </div>
      {rightAction}
    </header>
  );
}
