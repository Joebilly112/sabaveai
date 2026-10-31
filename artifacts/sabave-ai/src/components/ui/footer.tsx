import { Link } from 'wouter';
import { SabaveLogo } from '@/components/SabaveLogo';
import { footerLinks } from '@/lib/public-nav';

export function Footer() {
  return (
    <footer className="mt-auto bg-[#070E0C]">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <SabaveLogo height={28} />
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm py-1 text-sm text-[#B9C2BC] hover:text-[#F2EEE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9DCFB4]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-xs leading-5 text-[#7E8A84]">
          © 2026 sabave.ai · Synthetic demo · publishing is simulated
        </p>
      </div>
    </footer>
  );
}
