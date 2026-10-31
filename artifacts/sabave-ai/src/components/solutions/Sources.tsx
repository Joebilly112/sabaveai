import { sourcesContent } from '@/lib/solutions-content';

export function Sources() {
  return (
    <section aria-labelledby="sources-heading" className="border-t border-[#24342F] px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto w-full min-w-0 max-w-[1120px]">
        <h2 id="sources-heading" className="font-display text-xs font-medium tracking-[0.14em] text-[#7E8A84] uppercase">
          {sourcesContent.heading}
        </h2>
        <p className="mt-2 max-w-[80ch] text-xs leading-5 text-[#7E8A84]">{sourcesContent.line}</p>
      </div>
    </section>
  );
}
