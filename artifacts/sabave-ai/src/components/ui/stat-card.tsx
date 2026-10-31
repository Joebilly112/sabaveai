import type { ReactNode } from 'react';

type StatCardProps = {
  value: string;
  label: string;
  detail?: ReactNode;
};

export function StatCard({ value, label, detail }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-ds-line bg-ds-card p-6">
      <p className="font-display text-[28px] leading-tight font-semibold tracking-tight text-ds-ink">{value}</p>
      <p className="mt-3 text-sm leading-relaxed text-ds-muted">{label}</p>
      {detail ? <div className="mt-3 text-sm text-ds-faint">{detail}</div> : null}
    </article>
  );
}
