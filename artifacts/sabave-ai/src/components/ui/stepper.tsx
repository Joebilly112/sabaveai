import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepperProps = {
  steps: { id: string; label: string }[];
  current: number;
};

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex gap-4 overflow-x-auto pb-1" aria-label="Progress">
      {steps.map((step, index) => {
        const state = index < current ? 'complete' : index === current ? 'current' : 'upcoming';
        return (
          <li key={step.id} className="flex shrink-0 items-center gap-2" aria-current={state === 'current' ? 'step' : undefined}>
            <span
              className={cn(
                'grid size-8 place-items-center rounded-full border text-sm font-semibold',
                state === 'complete' && 'border-ds-button bg-ds-button text-ds-on-primary',
                state === 'current' && 'border-ds-primary text-ds-primary',
                state === 'upcoming' && 'border-ds-line text-ds-faint',
              )}
            >
              {state === 'complete' ? <Check className="size-4" aria-hidden /> : index + 1}
            </span>
            <span className={cn('text-sm font-medium', state === 'upcoming' ? 'text-ds-faint' : 'text-ds-ink')}>
              {state === 'complete' ? <span className="sr-only">Completed: </span> : null}
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
