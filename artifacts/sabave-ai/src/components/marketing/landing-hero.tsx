import { Link } from 'wouter';
import { MalaysiaGlobe } from '@/components/marketing/malaysia-globe';
import { shopCities } from '@/lib/shop-cities';

export function LandingHero() {
  return (
    <section className="relative flex min-h-dvh flex-col overflow-visible bg-[#070E0C] px-5 pt-6 pb-6 sm:px-8 lg:px-12 lg:pt-7 lg:pb-8">
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
            <Link
              href="/login"
              className="inline-flex h-12 min-h-11 items-center gap-2 text-[15px] font-medium text-[#E7E4DC] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-primary"
              data-testid="link-live-demo"
            >
              Try the live demo
              <span aria-hidden>→</span>
            </Link>
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
