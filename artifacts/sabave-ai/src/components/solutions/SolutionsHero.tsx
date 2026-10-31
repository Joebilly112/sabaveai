import { Link } from 'wouter';
import { heroContent, solutionActions } from '@/lib/solutions-content';

const primaryLink =
  'inline-flex h-12 min-h-11 shrink-0 items-center rounded-[8px] bg-[#0F7A5C] px-5 text-[15px] font-semibold text-[#F7F4EE] hover:bg-[#0C654C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9DCFB4]';

const secondaryLink =
  'inline-flex h-12 min-h-11 shrink-0 items-center rounded-[8px] border border-[#24342F] px-5 text-[15px] font-semibold text-[#F2EEE6] hover:border-[#7E8A84] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9DCFB4]';

export function SolutionsHero() {
  return (
    <section aria-labelledby="solutions-heading" className="px-4 pt-16 pb-16 sm:px-8 sm:pt-20 sm:pb-20 lg:px-12 lg:pt-28 lg:pb-24">
      <div className="mx-auto w-full min-w-0 max-w-[1120px]">
        <p className="text-[13px] font-semibold tracking-[0.16em] text-[#9DCFB4] uppercase">{heroContent.eyebrow}</p>
        <h1
          id="solutions-heading"
          className="mt-4 max-w-[18em] font-display text-[clamp(36px,4.2vw,56px)] leading-[1.05] font-semibold tracking-tight text-balance text-[#F4F1EA]"
        >
          {heroContent.title}
        </h1>
        <p className="mt-5 max-w-[38rem] text-[17px] leading-relaxed text-[#B9C2BC]">{heroContent.subtext}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={solutionActions.demo.href} className={primaryLink} data-testid="link-solutions-demo">
            {solutionActions.demo.label}
          </Link>
          <Link href={solutionActions.pricing.href} className={secondaryLink} data-testid="link-solutions-pricing">
            {solutionActions.pricing.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
