import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { formatIdr, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Syarat",
  robots: { index: false, follow: false },
};

export default function SyaratPage() {
  return (
    <LegalPage
      title="Syarat penggunaan"
      lede="Satu pembayaran membuka satu debrief. Layanan ini untuk orang yang sedang menjalani wawancara kerja, bukan untuk anak-anak."
    >
      <p>
        Dengan membuat debrief, kamu menyatakan rekap itu boleh diproses untuk scorecard pribadimu. Jangan mengirim
        percakapan orang lain jika kamu tidak berhak menuliskannya. Jangan memakai layanan ini untuk meniru proses
        rekrutmen sebuah perusahaan atau untuk menguji orang tanpa sepengetahuan mereka.
      </p>
      <p>
        Harga satu kali buka adalah {formatIdr(site.priceIdr)}. Tidak ada paket mingguan dan tidak ada akun. Angka,
        catatan, dan saran latihan adalah bantuan menyiapkan wawancara berikutnya. Bukan keputusan penerima kerja, bukan
        diagnosis, dan bukan pendapat perusahaan yang mewawancarai kamu.
      </p>
      <p>
        Layanan dapat berhenti sementara saat penyimpanan atau pembayaran belum terpasang. Halaman artikel tetap dapat
        dibaca. Operator layanan adalah {site.operator}. Pertanyaan: {site.email}. Hukum yang dipakai adalah hukum
        Republik Indonesia, sejauh tidak diatur lain oleh aturan perlindungan konsumen yang melekat pada pembelian digital.
      </p>
    </LegalPage>
  );
}
