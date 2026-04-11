import React from 'react';

export default function EmptyState({ icon, title, description, ctaLabel, onCta, children }: {
  icon: string;
  title?: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-5xl mb-4">{icon}</div>
      {title && <h3 className="font-headline font-bold text-lg uppercase text-tertiary tracking-tight mb-2">{title}</h3>}
      <p className="text-on-surface-variant font-body text-sm max-w-xs">{description}</p>
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="mt-6 px-8 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          {ctaLabel}
        </button>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
