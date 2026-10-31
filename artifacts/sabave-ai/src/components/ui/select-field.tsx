import { ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { fieldClass } from '@/lib/ds';
import { cn } from '@/lib/utils';

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
  disabled?: boolean;
  name?: string;
};

export function SelectField({ id, label, value, onChange, options, hint, disabled, name }: SelectFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-ds-ink">{label}</Label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.value)}
          className={cn(fieldClass, 'appearance-none pr-11')}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ds-faint" aria-hidden />
      </div>
      {hint ? <p id={hintId} className="text-sm text-ds-faint">{hint}</p> : null}
    </div>
  );
}
