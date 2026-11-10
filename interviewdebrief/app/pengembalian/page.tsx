import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Pengembalian",
  robots: { index: false, follow: false },
};

export default function PengembalianPage() {
  return (
    <LegalPage
      title="Pengembalian"
      lede="Uang kembali jika pembayaran berhasil tetapi scorecard tidak terbuka. Tidak ada pengembalian hanya karena catatannya terasa pahit."
    >
      <p>
        Produk ini adalah penilaian yang disengaja jujur. Ketidaknyamanan membaca skor rendah bukan alasan pengembalian.
        Pengembalian penuh diberikan bila status pembayaran sudah lunas di Midtrans, tetapi bagian scorecard dan daftar
        perbaikan tidak terbuka dalam 1×24 jam setelah kamu menulis ke kami.
      </p>
      <p>
        Kirim ke {site.email}: tautan halaman hasil, waktu pembayaran, dan empat karakter terakhir nomor order jika kamu
        memilikinya. Jangan kirim ulang seluruh rekap wawancara kalau tidak diminta. Kami membalas pada hari kerja.
      </p>
      <p>
        Pengembalian dikembalikan lewat kanal pembayaran yang sama bila Midtrans masih mengizinkannya. Satu order hanya
        dapat dikembalikan sekali. Chargeback yang sudah dibuka di bank dibereskan lewat jalur bank tersebut.
      </p>
    </LegalPage>
  );
}
