import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrackView } from "@/components/track";
import { articles } from "@/lib/articles";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Artikel",
  description:
    "Catatan tenang sesudah wawancara: spiral, beda HR user dan case, pertanyaan balik, contoh yang jujur, dan latihan 24 jam.",
  path: "/artikel",
});

export default function ArtikelIndexPage() {
  return (
    <>
      <TrackView event="page_view" name="artikel" />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6">
        <p className="text-sm font-semibold text-amber-500">Catatan</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy-950">Sesudah kamu keluar ruangan</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/75">
          Lima tulisan untuk pencari kerja dan fresh grad. Bukan naskah HR, bukan hitungan gaji.
        </p>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {articles.map((article) => (
            <article key={article.slug} className="py-6">
              <p className="text-sm text-ink/50">{article.minutes} menit baca</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-navy-950">
                <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className="mt-2 leading-relaxed text-ink/75">{article.description}</p>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
