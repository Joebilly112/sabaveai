import { Link } from 'wouter';
import { ctaContent, solutionActions } from '@/lib/solutions-content';

const primaryLink =
  'inline-flex h-12 min-h-11 shrink-0 items-center rounded-[8px] bg-[#F7F4EE] px-5 text-[15px] font-semibold text-[#070E0C] hover:bg-[#E7E4DC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F4EE]';

const secondaryLink =
  'inline-flex h-12 min-h-11 shrink-0 items-center rounded-[8px] border border-[#F7F4EE] px-5 text-[15px] font-semibold text-[#F7F4EE] hover:bg-[#0C654C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F4EE]';

export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="bg-[#0F7A5C] px-4 py-16 text-[#F7F4EE] sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto w-full min-w-0 max-w-[1120px]">
        <h2 id="cta-heading" className="max-w-[12em] font-display text-[clamp(32px,5vw,52px)] leading-[1.08] font-semibold tracking-tight text-balance text-[#F7F4EE]">
          {ctaContent.heading}
        </h2>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={solutionActions.demo.href} className={primaryLink} data-testid="link-solutions-cta-demo">
            {solutionActions.demo.label}
          </Link>
          <Link href={solutionActions.pricing.href} className={secondaryLink} data-testid="link-solutions-cta-pricing">
            {solutionActions.pricing.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
