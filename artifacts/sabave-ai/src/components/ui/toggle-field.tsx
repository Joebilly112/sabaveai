import { cn } from '@/lib/utils';

type ToggleFieldProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
};

export function ToggleField({ label, checked, onCheckedChange, hint, disabled }: ToggleFieldProps) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ds-ink">{label}</div>
        {hint ? <p className="mt-1 text-sm text-ds-faint">{hint}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-11 w-16 shrink-0 items-center rounded-full px-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:opacity-60',
          checked ? 'bg-ds-button' : 'bg-ds-line',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'size-7 rounded-full bg-ds-on-primary shadow-sm transition-transform duration-200',
            checked ? 'translate-x-7' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}
