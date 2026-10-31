import { controlContent } from '@/lib/solutions-content';

export function ControlSection() {
  return (
    <section aria-labelledby="control-heading" className="border-t border-[#24342F] bg-[#101C19] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto w-full min-w-0 max-w-[1120px]">
        <p className="text-sm font-medium text-[#9DCFB4]">{controlContent.eyebrow}</p>
        <h2 id="control-heading" className="mt-4 max-w-[16em] font-display text-[28px] leading-[1.15] font-semibold tracking-tight text-[#F4F1EA] sm:text-[36px]">
          {controlContent.heading}
        </h2>
        <dl className="mt-10 border-b border-[#24342F]">
          {controlContent.rows.map((row) => (
            <div key={row.label} className="grid grid-cols-1 gap-1 border-t border-[#24342F] py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-baseline sm:gap-10">
              <dt className="text-[15px] font-medium text-[#F08A3C]">{row.label}</dt>
              <dd className="min-w-0 text-[15px] leading-relaxed text-[#B9C2BC]">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
