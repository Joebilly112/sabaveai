import { problemContent } from '@/lib/solutions-content';

export function StatStrip() {
  return (
    <section aria-labelledby="problem-heading" className="border-t border-[#24342F] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto w-full min-w-0 max-w-[1120px]">
        <h2 id="problem-heading" className="font-display text-[28px] leading-[1.15] font-semibold tracking-tight text-[#F4F1EA] sm:text-[36px]">
          {problemContent.heading}
        </h2>
        <ul className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {problemContent.stats.map((stat) => (
            <li key={stat.value} className="flex min-w-0 flex-col">
              <p className="font-display text-[2rem] leading-none font-semibold tracking-tight break-words text-[#F4F1EA] lg:text-[2.75rem]">
                {stat.value}
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#B9C2BC]">{stat.detail}</p>
              <p className="mt-4 text-sm leading-relaxed text-[#7E8A84] md:mt-auto md:pt-6">{stat.attribution}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 border-t border-[#24342F] pt-8 font-display text-[22px] leading-snug font-semibold tracking-tight text-balance text-[#F4F1EA] sm:text-[26px]">
          {problemContent.closing}
        </p>
      </div>
    </section>
  );
}
