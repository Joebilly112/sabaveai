import { Checkbox } from '@/components/ui/checkbox';

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function CheckboxField({ label, checked, onCheckedChange, disabled }: CheckboxFieldProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-snug text-ds-ink">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="size-5 rounded-[4px]"
      />
      <span>{label}</span>
    </label>
  );
}
