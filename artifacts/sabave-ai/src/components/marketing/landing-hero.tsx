import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { MalaysiaGlobe } from '@/components/marketing/malaysia-globe';
import { shopCities } from '@/lib/shop-cities';
import { useWorkspace } from '@/lib/workspace';

export function LandingHero() {
  const { setRole, setBusinessId } = useWorkspace();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  function openDemo() {
    setRole('staff');
    setBusinessId('b1');
    navigate('/app');
  }

  return (
    <section className="relative flex min-h-dvh flex-col overflow-visible bg-[#070E0C] px-5 pt-6 pb-6 sm:px-8 lg:px-12 lg:pt-7 lg:pb-8">
      <header className="flex items-start justify-between gap-4">
        <Link href="/" className="rounded-xl pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-primary">
          <span className="block font-display text-[22px] leading-none font-semibold tracking-tight text-ds-ink sm:text-[26px]">sabave.ai</span>
          <span className="mt-2 flex items-center gap-3 text-[13px] text-ds-faint">
            an Orbyte module
            <span className="h-px w-8 bg-[#8d9893] sm:w-10" aria-hidden />
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <a href="#how-it-works" className="inline-flex min-h-11 items-center text-[15px] text-[#d7ddd9] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-primary">How it works</a>
          <Link href="/pricing" className="inline-flex min-h-11 items-center text-[15px] text-[#d7ddd9] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-primary">Pricing</Link>
          <Link href="/login" className="inline-flex min-h-11 items-center text-[15px] text-[#d7ddd9] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-primary">Log in</Link>
        </nav>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-xl border border-ds-line text-ds-ink md:hidden"
          aria-expanded={open}
          aria-controls="landing-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </header>
      {open ? (
        <nav id="landing-menu" aria-label="Mobile" className="mt-3 flex flex-col border-t border-ds-line py-2 md:hidden">
          <a href="#how-it-works" className="inline-flex min-h-11 items-center text-base text-ds-ink" onClick={() => setOpen(false)}>How it works</a>
          <Link href="/pricing" className="inline-flex min-h-11 items-center text-base text-ds-ink">Pricing</Link>
          <Link href="/login" className="inline-flex min-h-11 items-center text-base text-ds-ink">Log in</Link>
        </nav>
      ) : null}

      <div className="grid flex-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0 max-w-[640px] pt-8 lg:pt-0 lg:pr-4">
          <h1 className="font-display text-[clamp(36px,3.6vw,56px)] leading-[1.02] font-semibold tracking-[-0.035em] text-[#F4F1EA]">
            Turn tomorrow’s weather into today’s campaign.
          </h1>
          <p className="mt-5 max-w-[36rem] text-[17px] leading-relaxed text-[#C5CDC8]">
            <span className="block">Watches the weather for your shop. Prepares the promo.</span>
            <span className="block">You approve.</span>
          </p>
          <ul className="mt-6 space-y-2.5" aria-label="Shops on the map">
            {shopCities.map((city) => (
              <li key={city.id} className="flex items-center gap-2.5 text-[15px] text-[#E4E8E4]">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: city.color }} aria-hidden />
                <span>{city.name}</span>
                <span className="text-[#9AA39E]">·</span>
                <span>{city.levelLabel}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/signup"
              className="inline-flex h-12 min-h-11 items-center rounded-[8px] bg-[#0F7A5C] px-5 text-[15px] font-semibold text-[#F7F4EE] hover:bg-[#0C654C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9DCFB4]"
            >
              Start free
            </Link>
            <button
              type="button"
              onClick={openDemo}
              className="inline-flex h-12 min-h-11 items-center gap-2 text-[15px] font-medium text-[#E7E4DC] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-primary"
              data-testid="link-live-demo"
            >
              Try the live demo
              <span aria-hidden>→</span>
            </button>
          </div>
          <p className="mt-5 text-[15px] text-[#9DCFB4]">3 shops watched · checks every 6 hours</p>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[min(100%,560px)] overflow-visible sm:max-w-[620px] lg:max-w-[min(100%,680px)]">
          <MalaysiaGlobe />
        </div>
      </div>
      <p className="pt-4 text-sm text-[#8E9893]">Synthetic demo · publishing is simulated</p>
    </section>
  );
}
