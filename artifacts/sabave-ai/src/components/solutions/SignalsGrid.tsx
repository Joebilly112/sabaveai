import { CloudFog, CloudRain, Sun, Waves } from 'lucide-react';
import { signalStatusLabels, signalsContent, type WeatherSignal } from '@/lib/solutions-content';

const signalIcons: Record<WeatherSignal['id'], typeof CloudFog> = {
  haze: CloudFog,
  rain: CloudRain,
  heat: Sun,
  floods: Waves,
};

export function SignalsGrid() {
  return (
    <section aria-labelledby="signals-heading" className="border-t border-[#24342F] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto w-full min-w-0 max-w-[1120px]">
        <h2 id="signals-heading" className="font-display text-[28px] leading-[1.15] font-semibold tracking-tight text-[#F4F1EA] sm:text-[36px]">
          {signalsContent.heading}
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
          {signalsContent.items.map((signal) => {
            const Icon = signalIcons[signal.id];
            const live = signal.status === 'live';
            return (
              <li
                key={signal.id}
                className={
                  live
                    ? 'min-w-0 border border-[#F08A3C] p-4 sm:p-6'
                    : 'min-w-0 border border-[#24342F] p-4 sm:p-6'
                }
              >
                <Icon className={live ? 'size-5 text-[#F08A3C]' : 'size-5 text-[#7E8A84]'} aria-hidden="true" />
                <h3
                  className={
                    live
                      ? 'mt-4 font-display text-lg leading-snug font-semibold tracking-tight text-[#F4F1EA]'
                      : 'mt-4 font-display text-lg leading-snug font-semibold tracking-tight text-[#B9C2BC]'
                  }
                >
                  {signal.name}
                </h3>
                {live ? (
                  <p className="mt-3 inline-flex w-fit max-w-full border border-[#F08A3C] px-2 py-0.5 text-xs font-medium text-[#F08A3C]">
                    {signalStatusLabels[signal.status]}
                  </p>
                ) : (
                  <p className="mt-3 text-xs font-medium text-[#7E8A84]">{signalStatusLabels[signal.status]}</p>
                )}
                {signal.legend ? <p className="mt-4 text-[13px] leading-relaxed break-words text-[#B9C2BC]">{signal.legend}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
