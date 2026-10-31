import { cn } from '@/lib/utils';

const levels = {
  good: { label: 'Good', dot: 'bg-sev-good' },
  moderate: { label: 'Moderate', dot: 'bg-sev-moderate' },
  unhealthy: { label: 'Unhealthy', dot: 'bg-sev-unhealthy' },
  'very-unhealthy': { label: 'Very Unhealthy', dot: 'bg-sev-very' },
} as const;

export type SeverityLevel = keyof typeof levels;

export function SeverityPill({ level, className }: { level: SeverityLevel; className?: string }) {
  const item = levels[level];
  return (
    <span className={cn('inline-flex min-h-8 items-center gap-2 text-sm font-medium text-ds-ink', className)}>
      <span className={cn('size-2.5 shrink-0 rounded-full', item.dot)} aria-hidden />
      {item.label}
    </span>
  );
}
