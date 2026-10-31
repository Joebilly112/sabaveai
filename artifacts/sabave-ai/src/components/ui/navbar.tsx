import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { buttonVariants } from '@/components/ui/button';
import { primaryNav } from '@/lib/public-nav';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={cn('nav-bar', scrolled && 'is-scrolled')}>
      <div className="mx-auto grid min-h-16 max-w-[1120px] grid-cols-[1fr_auto] items-center gap-3 px-4 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link href="/" className="flex min-h-11 w-fit items-center gap-2 rounded-xl pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-primary" data-testid="nav-logo">
          <span aria-hidden className="grid size-9 -rotate-3 place-items-center rounded-xl rounded-br-sm bg-ds-primary font-display text-[15px] font-bold text-ds-logo-ink">s</span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-ds-ink">sabave.ai</span>
            <span className="mt-1 text-[11px] text-ds-faint">an Orbyte module</span>
          </span>
        </Link>
        <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ds-muted transition-colors duration-200 hover:text-ds-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-primary',
                  active && 'text-ds-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-end gap-2 lg:col-start-3">
          <Link href="/login" className={cn(buttonVariants({ variant: 'quiet', size: 'touch' }), 'max-sm:hidden')} data-testid="nav-login">
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: 'brand', size: 'touch' }), 'max-sm:hidden')} data-testid="nav-start">
            Start free
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-ds-line text-ds-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-primary lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ds-line px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-[1120px] flex-col">
            {primaryNav.map((item) => {
              const active = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-xl px-2 text-base font-medium text-ds-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-primary',
                    active && 'bg-ds-card',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/login" className={cn(buttonVariants({ variant: 'quiet', size: 'touch' }), 'mt-2 sm:hidden')}>Log in</Link>
            <Link href="/signup" className={cn(buttonVariants({ variant: 'brand', size: 'touch' }), 'mt-2 sm:hidden')}>Start free</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
