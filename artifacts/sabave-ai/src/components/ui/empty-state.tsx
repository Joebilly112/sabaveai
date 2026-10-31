import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ds-line bg-ds-card px-6 py-12 text-center">
      {icon ? <div className="mb-4 text-ds-primary" aria-hidden>{icon}</div> : null}
      <h2 className="font-display text-xl font-semibold text-ds-ink">{title}</h2>
      {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-ds-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
