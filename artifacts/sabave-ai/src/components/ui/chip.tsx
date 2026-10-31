import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChipProps = {
  children: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
};

export function Chip({ children, selected, onClick, onRemove }: ChipProps) {
  const className = cn(
    'inline-flex min-h-11 items-center gap-1 rounded-full border px-4 text-sm font-medium transition-colors duration-200',
    selected ? 'border-ds-primary bg-ds-primary/15 text-ds-ink' : 'border-ds-line bg-transparent text-ds-muted hover:text-ds-ink',
  );
  if (onRemove) {
    return (
      <span className={className}>
        {children}
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full"
          aria-label={`Remove ${children}`}
          onClick={onRemove}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </span>
    );
  }
  if (onClick) {
    return (
      <button type="button" className={className} aria-pressed={!!selected} onClick={onClick}>
        {children}
      </button>
    );
  }
  return <span className={className}>{children}</span>;
}
