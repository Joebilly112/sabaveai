import { LandingHero } from '@/components/marketing/landing-hero';
import { PublicLayout } from '@/components/marketing/public-layout';
import { useDocumentTitle } from '@/lib/use-document-title';

const steps = [
  'Forecast alert',
  'Your Brand Kit',
  'Ready options',
  'You approve',
  'Posted and logged',
];

export default function HomePage() {
  useDocumentTitle('sabave.ai');
  return (
    <PublicLayout showNav={false}>
      <LandingHero />
      <section id="how-it-works" className="border-t border-ds-line px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="font-display text-[28px] font-semibold tracking-tight text-ds-ink">How it works</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <li key={step} className="flex min-h-11 items-center gap-3 rounded-2xl border border-ds-line bg-ds-card px-4 py-3 text-sm text-ds-ink">
                <span className="font-display text-ds-primary">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </PublicLayout>
  );
}
