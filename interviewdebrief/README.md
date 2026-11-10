# Interview Debrief

Debrief sekali bayar sesudah wawancara, untuk pencari kerja dan fresh grad. Pertanyaannya: apakah wawancara tadi benar-benar jeblok? Harga buka scorecard: Rp19.900.

Bukan alat gaji. Tidak menaut ke produk lain. Operator: PT Think Era Labs.

Folder ini aplikasi Next.js yang berdiri sendiri di dalam repositori sabaveai. Pakai npm di folder ini. Jangan menjalankan `firebase deploy` dari akar repositori.

## Lokal

```bash
cd interviewdebrief
npm install
npm run dev
```

Salin `.env.example` menjadi `.env.local` bila kamu mencoba pembayaran. Tanpa kredensial Firebase, mode dev menyimpan debrief di berkas sementara pada mesin itu. Produksi menolak penyimpanan berkas dan hanya memakai Firestore basis data `interviewdebrief`.

## Perintah yang dipakai server

- `POST /api/analyze` membuat debrief
- `GET /api/payment/status?id=` membaca tampilan publik
- `POST /api/payment/create` membuat transaksi Midtrans Snap
- `POST /api/payment/notify` menerima notifikasi Midtrans
- `POST /api/analytics` mencatat peristiwa tanpa isi wawancara

## Firebase (belum dijalankan dari cloud)

- Proyek: `skoolnow-ea6ff`
- Hosting site: `interviewdebrief`
- Firestore: basis data `interviewdebrief`, wilayah `asia-southeast1`
- Batas biaya di `apphosting.yaml` dan `firebase.json`: minInstances 0, maxInstances 3, cpu 1, memori 512MiB, concurrency 80, wilayah asia-southeast1

URL notifikasi Midtrans: `https://interviewdebrief.web.app/api/payment/notify`

Nama rahasia yang perlu diisi bila belum ada:

- `MIDTRANS_SERVER_KEY`
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
- `MIDTRANS_IS_PRODUCTION`
- `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION`
- `DEEPSEEK_API_KEY` (opsional)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Tanpa Midtrans dan Firebase, halaman pemasaran dan artikel tetap bisa dibangun. `npm run deploy` hanya mencetak langkah. Deploy sungguhan memakai `node scripts/deploy.mjs --yes` dari folder ini, dan hanya menyentuh hosting site aplikasi ini.
