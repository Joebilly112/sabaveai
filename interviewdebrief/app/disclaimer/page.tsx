import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Disclaimer",
  robots: { index: false, follow: false },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      lede="Interview Debrief tidak menggantikan pewawancara, tidak membaca pikiran rekruter, dan tidak menjanjikan tawaran kerja."
    >
      <p>
        Scorecard disusun dari rekap yang kamu ketik. Ingatan sesudah wawancara tidak lengkap, dan alat ini tidak mendengar
        ruangan. Skor rendah bukan bukti kamu gagal sebagai orang. Skor tinggi bukan bukti kamu akan dipanggil.
      </p>
      <p>
        Layanan ini bukan konseling psikologis, bukan asesmen klinis, dan bukan produk perusahaan tempat kamu melamar.
        {` ${site.operator}`} tidak berafiliasi dengan pemberi kerja yang disebut di dalam rekap, karena nama perusahaan
        memang tidak kami minta.
      </p>
      <p>
        Artikel di situs ini adalah catatan umum untuk pencari kerja dan fresh grad. Ia bukan nasihat hukum ketenagakerjaan
        dan bukan hitungan kompensasi. Keputusan untuk lanjut, menunda, atau menolak proses rekrutmen tetap ada padamu.
      </p>
    </LegalPage>
  );
}
