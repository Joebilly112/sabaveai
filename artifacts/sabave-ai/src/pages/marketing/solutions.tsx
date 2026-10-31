import { BusinessTabs } from '@/components/solutions/BusinessTabs';
import { ControlSection } from '@/components/solutions/ControlSection';
import { CtaBand } from '@/components/solutions/CtaBand';
import { HowItWorks } from '@/components/solutions/HowItWorks';
import { OrbyteFit } from '@/components/solutions/OrbyteFit';
import { SignalsGrid } from '@/components/solutions/SignalsGrid';
import { SolutionsHero } from '@/components/solutions/SolutionsHero';
import { Sources } from '@/components/solutions/Sources';
import { StatStrip } from '@/components/solutions/StatStrip';
import { PublicLayout } from '@/components/marketing/public-layout';
import { solutionsDocumentTitle } from '@/lib/solutions-content';
import { useDocumentTitle } from '@/lib/use-document-title';

export default function SolutionsPage() {
  useDocumentTitle(solutionsDocumentTitle);

  return (
    <PublicLayout>
      <SolutionsHero />
      <StatStrip />
      <HowItWorks />
      <BusinessTabs />
      <SignalsGrid />
      <ControlSection />
      <OrbyteFit />
      <CtaBand />
      <Sources />
    </PublicLayout>
  );
}
