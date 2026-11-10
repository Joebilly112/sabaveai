import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privasi",
  robots: { index: false, follow: false },
};

export default function PrivasiPage() {
  return (
    <LegalPage
      title="Privasi"
      lede="Rekap wawancara dipakai untuk menyusun dan menampilkan debriefmu. Tidak dijual, dan tidak dipakai untuk menghitung gaji."
    >
      <p>
        Yang kamu kirim: peran, format wawancara, rekap pertanyaan dan jawaban, durasi, serta pilihan perasaan. Kami tidak
        meminta nama, nomor telepon, atau email untuk membuat debrief. Tautan hasil berisi pengenal acak. Siapa pun yang
        memegang tautan itu dapat membuka debrief yang sama.
      </p>
      <p>
        Rekap disimpan di Firestore, basis data interviewdebrief pada proyek Firebase skoolnow-ea6ff, wilayah
        asia-southeast1, supaya tautan hasil tetap bisa dibuka. Pembayaran
        diproses Midtrans. Midtrans menerima nomor order dan jumlah {site.priceIdr} rupiah, bukan isi wawancara.
      </p>
      <p>
        Jika kunci DeepSeek terpasang di server, rekap dan angka scorecard dikirim ke penyedia itu hanya untuk merapikan
        kalimat coach. Jika kunci tidak ada, catatan memakai naskah yang sudah ada di aplikasi. Jangan menulis nama orang,
        alamat, atau rahasia perusahaan di dalam rekap.
      </p>
      <p>
        Untuk meminta penghapusan, kirim pengenal debrief ke {site.email}. Kami menghapus rekap yang masih kami simpan.
        Log teknis server dapat menyimpan waktu permintaan tanpa isi wawancara. Situs ini tidak memasang iklan pihak ketiga.
      </p>
    </LegalPage>
  );
}
