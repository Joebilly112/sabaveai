import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fieldClass } from '@/lib/ds';
import { cn } from '@/lib/utils';

type TextFieldProps = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ id, label, hint, error, className, ...props }: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-ds-ink">{label}</Label>
      <Input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(fieldClass, className)}
        {...props}
      />
      {hint ? <p id={hintId} className="text-sm text-ds-faint">{hint}</p> : null}
      {error ? <p id={errorId} className="text-sm font-medium text-ds-danger" role="alert">{error}</p> : null}
    </div>
  );
}
