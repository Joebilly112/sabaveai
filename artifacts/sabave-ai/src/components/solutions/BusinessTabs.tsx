import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { businessContent } from '@/lib/solutions-content';

export function BusinessTabs() {
  return (
    <section aria-labelledby="business-heading" className="border-t border-[#24342F] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto w-full min-w-0 max-w-[1120px]">
        <h2 id="business-heading" className="font-display text-[28px] leading-[1.15] font-semibold tracking-tight text-[#F4F1EA] sm:text-[36px]">
          {businessContent.heading}
        </h2>
        <Tabs defaultValue={businessContent.tabs[0].id} className="mt-10 w-full min-w-0">
          <TabsList
            aria-label="Business type"
            className="flex h-auto w-full max-w-full flex-wrap items-end justify-start gap-x-5 gap-y-1 rounded-none border-b border-[#24342F] bg-transparent p-0"
          >
            {businessContent.tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="-mb-px h-auto max-w-full min-h-11 justify-start rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 text-left text-[15px] font-medium whitespace-normal text-[#B9C2BC] shadow-none ring-offset-[#070E0C] focus-visible:ring-[#9DCFB4] data-[state=active]:border-[#F08A3C] data-[state=active]:bg-transparent data-[state=active]:text-[#F4F1EA] data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {businessContent.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-8 min-w-0 ring-offset-[#070E0C] focus-visible:ring-[#9DCFB4]">
              <div className="grid min-w-0 gap-10 md:grid-cols-2 md:gap-16">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium tracking-wide text-[#7E8A84]">{businessContent.weatherLabel}</h3>
                  <p className="mt-3 text-base leading-relaxed text-[#F2EEE6]">{tab.weather}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium tracking-wide text-[#7E8A84]">{businessContent.suggestsLabel}</h3>
                  <ul className="mt-3 space-y-2.5">
                    {tab.suggestions.map((item) => (
                      <li key={item} className="flex min-w-0 gap-3 text-base leading-relaxed text-[#F2EEE6]">
                        <span className="mt-[0.55em] size-1 shrink-0 rounded-full bg-[#7E8A84]" aria-hidden="true" />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {tab.exampleHeadline ? (
                    <p className="mt-6 border-l border-[#F08A3C] pl-4 font-display text-lg leading-snug font-semibold tracking-tight text-[#F4F1EA]">
                      {tab.exampleHeadline}
                    </p>
                  ) : null}
                  {tab.note ? (
                    <p className="mt-6 border-t border-[#24342F] pt-4 text-sm leading-relaxed text-[#B9C2BC]">{tab.note}</p>
                  ) : null}
                  {tab.citation ? (
                    <p className="mt-6 text-sm leading-relaxed text-[#7E8A84]">{tab.citation}</p>
                  ) : null}
                </div>
              </div>
              {tab.tag ? <p className="mt-8 text-sm font-medium text-[#9DCFB4]">{tab.tag}</p> : null}
            </TabsContent>
          ))}
        </Tabs>
        <p className="mt-10 border-t border-[#24342F] pt-6 text-base leading-relaxed text-[#B9C2BC]">{businessContent.closing}</p>
      </div>
    </section>
  );
}
