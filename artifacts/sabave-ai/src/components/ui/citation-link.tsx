import { Link } from 'wouter';

type CitationLinkProps = {
  href: string;
  n: number;
  source: string;
};

export function CitationLink({ href, n, source }: CitationLinkProps) {
  const className = 'ml-0.5 align-super text-[11px] font-semibold text-ds-accent no-underline hover:underline';
  const inner = (
    <>
      <sup>{n}</sup>
      <span className="sr-only">, source: {source}</span>
    </>
  );
  if (href.startsWith('/')) return <Link href={href} className={className}>{inner}</Link>;
  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {inner}
    </a>
  );
}
