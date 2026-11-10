import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { articles, getArticle } from "@/lib/articles";
import { site } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticle(params.slug);
  if (!article) return {};
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/artikel/${article.slug}`,
  });
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();
  const others = articles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: "id-ID",
    datePublished: article.published,
    author: { "@type": "Organization", name: site.operator },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${site.url}/artikel/${article.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6">
        <p className="text-sm text-ink/55">
          <Link href="/artikel" className="font-semibold text-navy-800">
            Artikel
          </Link>
          {" · "}
          {article.minutes} menit baca
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy-950">{article.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/75">{article.description}</p>
        <div className="mt-8 space-y-8">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight text-navy-950">{section.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/85">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="mt-12 rounded-[28px] border border-line bg-white p-5">
          <p className="text-sm font-semibold text-amber-500">Masih memutar ulang?</p>
          <p className="mt-2 text-ink/80">Tulis wawancara tadi dan pisahkan rasa di perut dari sinyal di jawaban.</p>
          <Link
            href="/#debrief"
            className="mt-4 inline-flex min-h-12 items-center rounded-full bg-navy-900 px-5 text-sm font-semibold text-paper"
          >
            Cek wawancara tadi
          </Link>
        </aside>
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-navy-700">Bacaan lain</h2>
          <ul className="mt-3 space-y-2">
            {others.map((item) => (
              <li key={item.slug}>
                <Link className="text-navy-900 underline decoration-amber-400 underline-offset-4" href={`/artikel/${item.slug}`}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
