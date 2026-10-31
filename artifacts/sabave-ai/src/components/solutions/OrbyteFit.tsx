import { orbyteContent } from '@/lib/solutions-content';

export function OrbyteFit() {
  return (
    <section aria-labelledby="orbyte-heading" className="border-t border-[#24342F] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto w-full min-w-0 max-w-[1120px]">
        <h2 id="orbyte-heading" className="font-display text-[28px] leading-[1.15] font-semibold tracking-tight text-[#F4F1EA] sm:text-[36px]">
          {orbyteContent.heading}
        </h2>
        <ul className="mt-10 grid list-none grid-cols-1 gap-8 md:grid-cols-3">
          {orbyteContent.points.map((point) => (
            <li key={point} className="min-w-0 border-t border-[#24342F] pt-4 text-base leading-relaxed text-[#F2EEE6]">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
