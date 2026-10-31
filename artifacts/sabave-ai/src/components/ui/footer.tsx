import { Link } from 'wouter';
import { footerColumns } from '@/lib/public-nav';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ds-line bg-ds-surface">
      <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="font-display text-sm font-semibold tracking-wide text-ds-ink">{column.title}</h2>
            <ul className="mt-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center rounded-lg text-sm text-ds-muted hover:text-ds-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-ds-line">
        <p className="mx-auto max-w-[1120px] px-4 py-6 text-sm leading-relaxed text-ds-faint lg:px-8">
          © 2026 sabave.ai · An Orbyte module · Built for SDC Hackathon 2026 · Synthetic demo data · Publishing to Facebook/Instagram is simulated
        </p>
      </div>
    </footer>
  );
}
