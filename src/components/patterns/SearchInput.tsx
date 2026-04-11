import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  size?: 'default' | 'sm';
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  onClear,
  size = 'default',
  className,
}: SearchInputProps) {
  const isSm = size === 'sm';
  const hasValue = value.length > 0;
  const showClear = onClear && hasValue;

  return (
    <div className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none',
          isSm ? 'left-3 w-4 h-4' : 'left-4 w-5 h-5',
        )}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full bg-surface-container-low border border-outline-variant/30 rounded-sm text-tertiary font-label tracking-widest uppercase placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors',
          isSm
            ? 'py-2 pl-10 pr-4 text-sm'
            : 'py-3 pl-12 text-sm',
          showClear ? 'pr-10' : 'pr-4',
        )}
      />
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors',
            isSm ? 'right-3' : 'right-3',
          )}
        >
          <X className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </button>
      )}
    </div>
  );
}
