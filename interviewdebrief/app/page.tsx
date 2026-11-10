import Link from "next/link";
import { DebriefForm } from "@/components/debrief-form";
import { HeroVisual } from "@/components/hero-visual";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrackView } from "@/components/track";
import { Panel } from "@/components/ui";
import { formatIdr, site } from "@/lib/config";
import { websiteJsonLd } from "@/lib/seo";

const steps = [
  {
    title: "Tulis yang masih diputar ulang",
    body: "Peran, format, apa yang ditanya, berapa lama, dan rasa di perut. Tidak perlu akun.",
  },
  {
    title: "Baca sinyalnya, bukan vonisnya",
    body: "Kamu langsung melihat pita dan catatan spiral. Perasaan tidak masuk ke angka.",
  },
  {
    title: "Buka yang diperbaiki berikutnya",
    body: `Scorecard struktur, kejelasan, contoh, dan pertanyaan balik, plus latihan sebelum wawancara berikut. ${formatIdr(site.priceIdr)}, sekali.`,
  },
];

const faqs = [
  {
    q: "Apakah ini menghitung gaji?",
    a: "Tidak. Ini debrief jawaban wawancara. Tidak ada angka kompensasi, tidak ada saran tawar-menawar.",
  },
  {
    q: "Apakah skor ini vonis bahwa saya gagal?",
    a: "Tidak. Angka membaca rekap yang kamu tulis, bukan rekaman ruangan dan bukan keputusan rekruter.",
  },
  {
    q: "Kenapa ada bagian yang terkunci?",
    a: "Catatan spiral dan pita keseluruhan terbuka. Rincian empat bagian dan daftar perbaikan dibuka sekali bayar, tanpa langganan.",
  },
];

export default function HomePage() {
  return (
    <>
      <TrackView event="page_view" name="beranda" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      <div className="hero-wash flex min-h-[100svh] flex-col">
        <SiteHeader />
        <section className="mx-auto grid w-full max-w-6xl flex-1 content-center gap-8 px-5 pb-8 pt-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-navy-800">Interview Debrief</p>
            <h1 className="mt-3 max-w-xl text-[2.35rem] font-semibold leading-[1.05] tracking-tight text-navy-950 sm:text-6xl">
              Apakah wawancara tadi benar-benar jeblok?
            </h1>
            <p className="mt-4 max-w-md text-lg leading-snug text-navy-800/80">
              Satu debrief jujur untuk jawaban yang masih diputar ulang, sebelum spiral mengambil alih.
            </p>
            <div className="mt-7">
              <a
                href="#debrief"
                className="inline-flex min-h-12 items-center rounded-full bg-navy-900 px-5 text-sm font-semibold text-paper hover:bg-navy-800"
              >
                Cek wawancara tadi
              </a>
            </div>
          </div>
          <HeroVisual />
        </section>
      </div>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-navy-950">Ceritakan wawancara tadi</h2>
            <p className="mt-3 max-w-sm text-ink/75">
              Untuk pencari kerja dan fresh grad yang baru keluar dari ruangan dan sedang menganggap yang terburuk.
            </p>
          </div>
          <Panel className="p-5 sm:p-7">
            <DebriefForm />
          </Panel>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-navy-950">Cara kerjanya</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <Panel key={step.title} className="p-5">
                <p className="text-sm font-semibold text-amber-500">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-navy-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{step.body}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-navy-950">Yang sering ditanya</h2>
          <div className="mt-6 divide-y divide-line rounded-[28px] border border-line bg-white">
            {faqs.map((item) => (
              <article key={item.q} className="px-5 py-5">
                <h3 className="font-semibold text-navy-950">{item.q}</h3>
                <p className="mt-2 leading-relaxed text-ink/75">{item.a}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink/65">
            Mau baca pelan-pelan dulu?{" "}
            <Link className="font-semibold text-navy-900 underline decoration-amber-400 underline-offset-4" href="/artikel">
              Lima catatan untuk sesudah wawancara.
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
