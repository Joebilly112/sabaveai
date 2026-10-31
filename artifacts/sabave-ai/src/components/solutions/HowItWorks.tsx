import { howItWorksContent } from '@/lib/solutions-content';

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="border-t border-[#24342F] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto w-full min-w-0 max-w-[1120px]">
        <h2 id="how-heading" className="font-display text-[28px] leading-[1.15] font-semibold tracking-tight text-[#F4F1EA] sm:text-[36px]">
          {howItWorksContent.heading}
        </h2>
        <ol className="mt-10 grid list-none grid-cols-1 gap-0 lg:mt-12 lg:grid-cols-5 lg:gap-x-6">
          {howItWorksContent.steps.map((step, index) => (
            <li key={step.title} className="min-w-0 border-t border-[#24342F] py-6">
              <p className="font-display text-sm font-medium text-[#9DCFB4]" aria-hidden="true">
                {index + 1}
              </p>
              <h3 className="mt-3 font-display text-lg leading-snug font-semibold tracking-tight text-[#F4F1EA]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#B9C2BC]">{step.body}</p>
            </li>
          ))}
        </ol>
        <aside className="mt-4 border-t border-[#24342F] pt-8 lg:mt-2" aria-labelledby="why-early">
          <h3 id="why-early" className="font-display text-xl leading-snug font-semibold tracking-tight text-[#F4F1EA]">
            {howItWorksContent.callout.title}
          </h3>
          <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-[#B9C2BC]">{howItWorksContent.callout.body}</p>
        </aside>
      </div>
    </section>
  );
}
