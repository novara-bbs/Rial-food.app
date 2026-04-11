import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TabNavProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

/** Underline tab bar — flex border-b with border-b-2 active indicator. */
export default function TabNav({ tabs, active, onChange, className }: TabNavProps) {
  return (
    <div className={cn('flex border-b border-outline-variant/20 px-6 pt-2 shrink-0', className)}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex-1 py-3 font-headline text-xs font-bold tracking-widest uppercase transition-colors border-b-2 flex items-center justify-center gap-2',
              isActive
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-tertiary',
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
