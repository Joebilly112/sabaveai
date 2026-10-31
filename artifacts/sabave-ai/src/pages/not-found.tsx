import { Link } from 'wouter';
import { buttonVariants } from '@/components/ui/button';
import { PublicLayout } from '@/components/marketing/public-layout';
import { PageHeader } from '@/components/ui/page-header';
import { useDocumentTitle } from '@/lib/use-document-title';

export default function NotFound() {
  useDocumentTitle('Page not found · sabave.ai');
  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-[1120px] px-4 py-16 lg:px-8 lg:py-24">
        <PageHeader
          eyebrow="404"
          title="This page is not on the map."
          description="The link may be out of date, or the page has not been added yet."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ variant: 'brand', size: 'touch' })}>Back home</Link>
          <Link href="/app" className={buttonVariants({ variant: 'quiet', size: 'touch' })}>Open workspace</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
