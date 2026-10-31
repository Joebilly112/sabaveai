import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fieldClass } from '@/lib/ds';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function PasswordInput({ id, label, hint, error, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-ds-ink">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(fieldClass, 'pr-12', className)}
          {...props}
        />
        <button
          type="button"
          className="absolute top-0 right-0 inline-flex size-11 items-center justify-center rounded-xl text-ds-muted hover:text-ds-ink"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {hint ? <p id={hintId} className="text-sm text-ds-faint">{hint}</p> : null}
      {error ? <p id={errorId} className="text-sm font-medium text-ds-danger" role="alert">{error}</p> : null}
    </div>
  );
}
