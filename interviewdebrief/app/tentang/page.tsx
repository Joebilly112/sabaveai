import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatIdr, site } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Tentang",
  description: "Interview Debrief adalah debrief sekali bayar sesudah wawancara, dioperasikan PT Think Era Labs.",
  path: "/tentang",
});

export default function TentangPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6">
        <p className="text-sm font-semibold text-amber-500">{site.operator}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy-950">Tentang Interview Debrief</h1>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink/80">
          <p>
            Produk ini untuk pencari kerja dan fresh grad yang baru selesai wawancara dan sedang menganggap yang terburuk.
            Kamu menulis apa yang ditanyakan dan bagaimana kamu menjawab. Kami mengembalikan scorecard: struktur, kejelasan,
            contoh, dan pertanyaan balik, plus apa yang layak diperbaiki sebelum wawancara berikutnya.
          </p>
          <p>
            Harganya {formatIdr(site.priceIdr)} untuk satu debrief. Tidak ada langganan, tidak ada akun. Perasaan di perut
            dicatat, tetapi tidak dimasukkan ke angka, karena replay di kepala biasanya lebih keras daripada ruangan.
          </p>
          <p>
            Ini bukan alat gaji, bukan jasa perusahaan perekrut, dan bukan jaminan kamu diterima. Angka membaca rekap yang
            kamu tulis, bukan rekaman wawancara. Operatornya {site.operator}. Domain {site.domain} menyusul; alamat yang
            hidup sekarang {site.url.replace("https://", "")}.
          </p>
          <p>
            Pertanyaan soal pembayaran atau penghapusan rekap:{" "}
            <a className="font-semibold text-navy-900 underline decoration-amber-400 underline-offset-4" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
