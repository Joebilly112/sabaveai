import { useEffect, type ReactNode } from 'react';
import { Footer } from '@/components/ui/footer';
import { Navbar } from '@/components/ui/navbar';

export function PublicLayout({ children, showNav = true }: { children: ReactNode; showNav?: boolean }) {
  useEffect(() => {
    document.documentElement.classList.add('theme-night');
    return () => document.documentElement.classList.remove('theme-night');
  }, []);

  return (
    <div className="theme-night flex min-h-dvh flex-col bg-ds-bg font-body text-ds-ink">
      <a href="#main" className="skip-link">Skip to content</a>
      {showNav ? <Navbar /> : null}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
