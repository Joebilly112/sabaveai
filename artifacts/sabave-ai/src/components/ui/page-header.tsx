import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-sm font-semibold tracking-[0.14em] text-ds-primary uppercase">{eyebrow}</p> : null}
        <h1 className={`font-display text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] text-ds-ink md:text-[56px] ${eyebrow ? 'mt-3' : ''}`}>{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-base leading-relaxed text-ds-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
