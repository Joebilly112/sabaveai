import { Check } from 'lucide-react';
import { Link } from 'wouter';
import { PublicLayout } from '@/components/marketing/public-layout';
import { useDocumentTitle } from '@/lib/use-document-title';

const included = [
  'Haze alerts for your shop, checked every 6 hours',
  'A weekly weather plan for the quieter months',
  '100 credits a month, about 32 posters',
  'Campaigns in your brand, ready for approval',
  'An activity log of every step',
  'Cancel any time',
];

export default function PricingPage() {
  useDocumentTitle('Pricing · sabave.ai');

  return (
    <PublicLayout>
      <section className="flex min-h-[calc(100dvh-4rem)] items-center bg-[#070E0C] px-4 py-16 sm:px-6">
        <article className="mx-auto w-full max-w-[560px] rounded-[28px] border border-[#24342F] bg-[#101C19] px-6 py-10 shadow-[0_40px_90px_rgba(0,0,0,0.45)] sm:px-12 sm:py-12">
          <p className="text-[13px] font-semibold tracking-[0.16em] text-[#9DCFB4] uppercase">Pilot pricing</p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.08] font-semibold tracking-[-0.03em] text-[#F4F1EA] sm:text-[44px]">
            One price for your business, each month.
          </h1>
          <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-[#B9C2BC]">
            The same plan for every shop. No per-seat fee and no setup charge.
          </p>
          <p className="mt-8 flex items-end gap-2">
            <span className="font-display text-[68px] leading-none font-semibold tracking-[-0.04em] text-[#F4F1EA] sm:text-[80px]">RM100</span>
            <span className="mb-2 text-lg text-[#B9C2BC]">/ month</span>
          </p>
          <ul className="mt-8 space-y-3">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-[#E7E4DC]">
                <Check className="mt-0.5 size-4 shrink-0 text-[#2BB673]" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="mt-9 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#0F7A5C] text-[15px] font-semibold text-[#F7F4EE] hover:bg-[#0C654C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9DCFB4]"
          >
            Start free
          </Link>
          <p className="mt-4 text-center text-sm leading-relaxed text-[#7E8A84]">
            One poster is about 3 credits. Prices are pilot pricing.
          </p>
        </article>
      </section>
    </PublicLayout>
  );
}
