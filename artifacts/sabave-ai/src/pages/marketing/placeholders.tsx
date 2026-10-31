import type { ReactNode } from 'react';
import { Link, useParams } from 'wouter';
import { buttonVariants } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { PublicLayout } from '@/components/marketing/public-layout';
import { docPages, footerColumns } from '@/lib/public-nav';
import { useDocumentTitle } from '@/lib/use-document-title';
import NotFound from '@/pages/not-found';

function Shell({ title, documentTitle, lede, children }: { title: string; documentTitle?: string; lede: string; children?: ReactNode }) {
  useDocumentTitle(documentTitle ?? `${title} · sabave.ai`);
  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-[1120px] px-4 py-16 lg:px-8 lg:py-24">
        <PageHeader title={title} description={lede} />
        {children}
        <div className="mt-8">
          <Link href="/login" className={buttonVariants({ variant: 'brand', size: 'touch' })} data-testid="link-open-workspace">
            Log in
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

export function DocsIndexPage() {
  const docs = footerColumns.find((column) => column.title === 'Docs');
  return (
    <Shell title="Docs" lede="Guides for the workspace, written from how the product actually behaves.">
      <ul className="mt-10 grid gap-2 sm:grid-cols-2">
        {docs?.links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="inline-flex min-h-11 items-center text-base font-medium text-ds-ink hover:text-ds-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function DocsArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? docPages[slug] : undefined;
  if (!page) return <NotFound />;
  return <Shell title={page.title} lede={page.lede} />;
}

export function AboutPage() {
  return <Shell title="About sabave.ai" lede="Why the haze leaves small shops behind, and what this Orbyte module is here to close." />;
}

export function ResearchPage() {
  return <Shell title="Research & sources" lede="Every figure used on the site, with the citation and the assumptions behind the calculator." />;
}

export function PrivacyPage() {
  return <Shell title="Privacy & PDPA" lede="What this prototype stores, what it does not, and how that maps to the PDPA 2010 principles." />;
}

export function TermsPage() {
  return <Shell title="Terms of Service" lede="Plain-language terms for the pilot, including simulated publishing." />;
}

export function SecurityPage() {
  return <Shell title="Security" lede="Where keys live, what stays in memory, and what the prototype does not collect." />;
}

export function ChangelogPage() {
  return <Shell title="Changelog" lede="Dated notes for what shipped. The public site shell is the first entry." />;
}

export function ContactPage() {
  return <Shell title="Contact" lede="A short form is next. This build does not send email yet." />;
}
