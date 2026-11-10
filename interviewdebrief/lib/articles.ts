export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  published: string;
  minutes: number;
  sections: ArticleSection[];
}

export const articles: Article[] = [
  {
    slug: "spiral-sesudah-wawancara",
    title: "Kenapa otak memutar ulang wawancara begitu kamu keluar ruangan",
    description:
      "Spiral sesudah wawancara biasanya lebih keras daripada bukti yang dimiliki pewawancara. Ini cara memisahkan rasa dari sinyal.",
    published: "2026-11-10",
    minutes: 6,
    sections: [
      {
        heading: "Replay bukan rekaman",
        paragraphs: [
          "Begitu pintu lift tertutup, otak mulai menyunting wawancara yang baru saja selesai. Kalimat yang tadi terasa biasa tiba-tiba kedengaran kaku. Jeda dua detik berubah menjadi bukti bahwa kamu kosong. Ini spiral, bukan notulen.",
          "Pewawancara tidak membawa pulang video yang sama. Mereka membawa kesan yang lebih pendek: apakah jawabanmu bisa diikuti, apakah ada kejadian yang bisa dibayangkan, dan apakah kamu kelihatan ingin tahu soal kerjaannya. Satu kalimat yang kamu ulang delapan kali di jalan pulang mungkin hanya lewat sekali di ruangan.",
        ],
      },
      {
        heading: "Perasaan jelek punya fungsi, bukan vonis",
        paragraphs: [
          "Rasa 'tadi jeblok' sering muncul karena tubuh masih dalam mode dinilai. Jantung belum turun. Kamu membandingkan jawabanmu dengan versi yang baru kepikiran di tangga. Versi tangga itu tidak ikut wawancara, jadi dia selalu lebih rapi.",
          "Catat rasanya, lalu taruh di tempat yang terpisah dari isi jawaban. Perasaan memberitahu bahwa wawancara itu penting bagimu. Ia tidak memberitahu skor struktur, kejelasan, contoh, atau pertanyaan balik. Dua hal itu boleh duduk bersebelahan tanpa saling menggantikan.",
        ],
      },
      {
        heading: "Yang layak diputar ulang",
        paragraphs: [
          "Kalau kamu harus mengulang sesuatu, ulang pertanyaan yang benar-benar ditanyakan, bukan seluruh suasana ruangan. Tulis satu baris: apa yang mereka minta, apa kalimat pertama yang kamu keluarkan, dan bagian mana yang kamu lompati. Tiga baris itu sudah lebih berguna daripada satu jam replay.",
          "Fresh grad sering menghukum diri karena cerita yang 'terlalu kecil': tugas kuliah, kepanitiaan, magang singkat, shift paruh waktu. Pewawancara yang waras tidak menuntut kamu pernah memimpin divisi. Mereka ingin melihat kamu mengingat apa yang kamu lakukan, bukan daftar sifat.",
        ],
      },
      {
        heading: "Tutup spiralnya dengan batas waktu",
        paragraphs: [
          "Beri dirimu satu kali tulis, maksimal dua puluh menit, lalu berhenti. Menulis lebih lama biasanya mulai menambah adegan yang tidak terjadi. Kalau masih gelisah, gelisahnya boleh ada. Yang tidak perlu ditambah adalah teori baru soal satu kata yang salah.",
          "Debrief yang jujur berhenti di sinyal yang kelihatan dari rekapmu. Ia tidak meramal hasil rekrutmen, dan ia tidak meminta kamu menjadi orang lain sebelum wawancara berikutnya. Ia hanya menunjuk bagian yang masih bisa dilatih.",
        ],
      },
    ],
  },
  {
    slug: "beda-debrief-hr-user-case",
    title: "HR, user, dan case tidak boleh didebrief dengan penggaris yang sama",
    description:
      "Format wawancara mengubah apa yang dianggap jawaban utuh. Fresh grad sering menilai case dengan standar HR, atau sebaliknya.",
    published: "2026-11-10",
    minutes: 7,
    sections: [
      {
        heading: "Tiga ruangan, tiga pekerjaan",
        paragraphs: [
          "Wawancara HR, user, dan case sama-sama disebut wawancara, lalu otak menyamakannya. Padahal yang dinilai tidak sama. HR sering memeriksa apakah kamu bisa menjelaskan pilihanmu dengan tenang dan apakah kamu bertanya seperti orang yang benar-benar mempertimbangkan kerjaan itu.",
          "User ingin tahu apakah kamu pernah menyentuh masalah yang mirip, meski skalanya kecil. Case ingin dengar caramu menyusun pikiran saat soalnya belum rapi. Menyesali case karena kamu kurang 'hangat', atau menyesali HR karena kamu tidak menggambar kerangka di papan, biasanya salah penggaris.",
        ],
      },
      {
        heading: "HR yang pendek belum tentu gagal",
        paragraphs: [
          "Lima belas menit dengan HR bisa terasa menghina, padahal kadang itu memang slot screening. Yang lebih informatif: apakah kamu sempat mengucapkan alasan yang spesifik, atau hanya 'saya ingin belajar'. Belajar adalah niat. Yang mereka catat biasanya alasan yang menempel pada peran itu.",
          "Di HR, pertanyaan balik yang umum ('bagaimana budaya perusahaan?') mudah ditelan. Pertanyaan yang menyebut minggu pertama, alat yang dipakai, atau cara mereka tahu seseorang berhasil, kedengaran seperti kamu sudah membayangkan masuk kerja.",
        ],
      },
      {
        heading: "User mendengarkan jejak, bukan motto",
        paragraphs: [
          "Kalau lawan bicaramu adalah orang yang nanti duduk dekat pekerjaan itu, motto kalah cepat oleh contoh. 'Saya teliti' tidak meninggalkan gambar. 'Waktu mengecek daftar tamu acara kampus, saya menemukan 40 nama dobel dan mengubah cara absen di pintu' meninggalkan gambar.",
          "Durasi user yang panjang juga bisa menipu. Empat puluh menit terasa seperti kamu banyak bicara. Kalau sebagian besar isinya pengantar, pewawancara tetap pulang tanpa satu kejadian. Debrief user yang adil bertanya: di menit ke berapa contoh pertama muncul?",
        ],
      },
      {
        heading: "Case menilai peta, bukan tebakan akhir",
        paragraphs: [
          "Di case, jawaban akhir yang tepat dengan jalan yang bisu sering kalah dari jalan yang terdengar. Pewawancara tidak bisa memberi nilai pada pikiran yang tidak diucapkan. Asumsi yang kamu simpan di kepala sama saja dengan asumsi yang tidak ada.",
          "Fresh grad sering diam karena takut salah angka. Ucapkan saja angkanya perkiraan, lalu sebut apa yang akan kamu cek kalau ini pekerjaan sungguhan. Itu lebih dekat dengan kerja case sehari-hari daripada kepastian yang dipaksakan.",
        ],
      },
    ],
  },
  {
    slug: "pertanyaan-balik-yang-terlewat",
    title: "Pertanyaan balik yang terlewat, dan kenapa itu terasa seperti sopan",
    description:
      "Diam di akhir wawancara sering disangka hormat. Buat banyak pewawancara, itu terbaca sebagai tidak ingin tahu pekerjaan yang sebenarnya.",
    published: "2026-11-10",
    minutes: 6,
    sections: [
      {
        heading: "Sopan dan pasrah kedengarannya mirip",
        paragraphs: [
          "Banyak fresh grad menutup wawancara dengan 'saya rasa sudah cukup' karena tidak ingin merepotkan. Niatnya baik. Efeknya lain: ruangan selesai tanpa bukti bahwa kamu memikirkan kerjaan di luar daftar pertanyaan mereka.",
          "Pertanyaan balik bukan ujian kepintaran. Ia menunjukkan apakah kamu bisa membayangkan dirimu di kursi itu pada hari biasa, bukan hanya pada hari diterima.",
        ],
      },
      {
        heading: "Pertanyaan yang aman sering tidak berguna",
        paragraphs: [
          "'Bagaimana budaya di sini?' hampir selalu dijawab dengan kata yang sama: kolaboratif, cepat, kekeluargaan. Kamu tidak mendapat bahan untuk memutuskan, dan mereka tidak mendapat sinyal baru.",
          "Lebih berguna bertanya pada hal yang hanya tim itu yang tahu. Apa yang biasanya bikin orang baru kewalahan di bulan pertama? Keputusan kecil apa yang akan langsung masuk ke meja peran ini? Bagaimana mereka tahu, dalam tiga bulan, bahwa seseorang sudah menyala?",
        ],
      },
      {
        heading: "Siapkan tiga, pakai satu atau dua",
        paragraphs: [
          "Jangan membawa sepuluh pertanyaan seperti daftar belanja. Tiga cukup. Satu tentang kerja minggu pertama, satu tentang cara mereka menilai berhasil, satu tentang hal yang sering salah dipahami pelamar. Kalau dua sudah terjawab di tengah wawancara, pakai yang tersisa. Tidak apa-apa kalau hanya satu yang keluar, asal ia spesifik.",
          "Tulis pertanyaan itu di catatan sebelum kamu berangkat. Spiral sesudah wawancara sering berkata 'harusnya tadi aku tanya'. Catatan kecil mencegah kalimat itu, karena keputusannya sudah dibuat sebelum kamu gugup.",
        ],
      },
      {
        heading: "Jangan bertanya hanya agar kelihatan bertanya",
        paragraphs: [
          "Kalau jawabannya sudah diberikan, jangan diulang supaya slot pertanyaan terisi. Mengangguk pada jawaban yang sudah ada, lalu menggali satu lapis lebih dalam, lebih jujur. Contoh: 'Tadi disebut laporan mingguan. Siapa yang membaca laporan itu, dan apa yang biasanya mereka tandai?'",
          "Pertanyaan balik yang baik terasa seperti ingin kerja, bukan seperti ingin lulus. Bedanya ada di apakah kamu bisa memakai jawabannya untuk membayangkan hari Selasa, bukan hanya untuk mengisi keheningan.",
        ],
      },
    ],
  },
  {
    slug: "contoh-yang-kedengaran-jujur",
    title: "Contoh yang kedengaran jujur, bukan cerita yang sudah dihafal",
    description:
      "Jawaban fresh grad sering jatuh ke sifat karena contohnya terasa terlalu kecil. Contoh kecil yang spesifik lebih dipercaya.",
    published: "2026-11-10",
    minutes: 7,
    sections: [
      {
        heading: "Sifat tidak meninggalkan gambar",
        paragraphs: [
          "Kalimat seperti 'saya cepat belajar', 'saya pekerja keras', atau 'saya bisa kerja tim' mudah diucapkan dan sulit dibantah. Karena itu juga sulit dipercaya. Semua pelamar bisa mengatakannya tanpa mengingat satu hari pun.",
          "Contoh yang jujur hampir selalu lebih kecil daripada yang kamu khawatirkan. Bukan akuisisi, bukan transformasi digital. Satu masalah, satu tindakanmu, satu akibat yang bisa ditunjuk. Skala kecil tidak mengurangi kejelasan.",
        ],
      },
      {
        heading: "Hafalan kedengaran mulus, lalu hambar",
        paragraphs: [
          "Cerita yang sudah dihafal biasanya terlalu rata. Tidak ada bagian yang kamu ragu, tidak ada detail yang hanya kamu yang tahu, tidak ada akibat yang agak canggung. Pewawancara yang sudah mendengar puluhan versi STAR akan mengenali permukaan yang licin.",
          "Kamu tidak perlu membuat cerita berantakan. Cukup sisakan satu detail yang memang terjadi: jamnya, jumlah orangnya, alatnya, atau kalimat yang dikatakan seseorang. Detail itu menahan cerita agar tidak mengambang.",
        ],
      },
      {
        heading: "Akibat lebih penting daripada peran",
        paragraphs: [
          "Banyak rekap fresh grad berhenti di 'saya ikut serta'. Ikut serta adalah kehadiran. Yang ditanyakan biasanya perubahan. Apa yang berbeda sesudah kamu mengerjakan bagianmu? Kalau tidak ada angka, pakai akibat yang kelihatan: antrean berkurang, kesalahan input ketahuan, teman satu kelompok jadi punya batas waktu.",
          "Kalau akibatnya memang kecil, katakan kecil. 'Kami tidak menyelamatkan acara. Kami hanya menghentikan daftar tamu yang dobel, jadi pintu tidak macet.' Kalimat itu lebih dewasa daripada membesarkan peristiwa menjadi kepemimpinan strategis.",
        ],
      },
      {
        heading: "Dua cerita cukup untuk putaran berikutnya",
        paragraphs: [
          "Jangan membangun bank dua puluh cerita semalam sesudah satu wawancara terasa buruk. Pilih dua. Satu soal kamu membereskan kekacauan kecil. Satu soal kamu tidak setuju dengan seseorang lalu tetap menyelesaikan kerjaan. Latih keduanya dalam versi pendek dan versi dua menit.",
          "Waktu di ruangan, pilih yang paling dekat dengan pertanyaan, bukan yang paling mengesankan di kepalamu. Contoh yang nempel mengalahkan contoh yang spektakuler tapi harus ditarik paksa ke pertanyaan.",
        ],
      },
    ],
  },
  {
    slug: "sebelum-wawancara-berikutnya",
    title: "Apa yang diperbaiki dalam 24 jam sebelum wawancara berikutnya",
    description:
      "Bukan menulis ulang seluruh hidup. Tiga kerangka, dua cerita, dan tiga pertanyaan balik sudah mengubah cara kamu masuk ruangan.",
    published: "2026-11-10",
    minutes: 6,
    sections: [
      {
        heading: "Jangan merombak kepribadian",
        paragraphs: [
          "Spiral suka mengusulkan renovasi total: mulai dari cara duduk, cara berpakaian, sampai keputusan kuliah. Dua puluh empat jam tidak cukup untuk itu, dan wawancara berikutnya tidak menuntutnya. Yang bisa berubah dalam satu hari adalah cara kamu membuka jawaban.",
          "Batasi latihan pada tiga barang. Kerangka tiga baris. Dua cerita dengan akibat. Tiga pertanyaan balik yang spesifik untuk peran itu. Kalau kamu menambah daftar keempat, kamu sedang menghindar dengan merasa sibuk.",
        ],
      },
      {
        heading: "Kerangka yang muat di kartu kecil",
        paragraphs: [
          "Tulis: konteks satu kalimat, tindakanmu satu kalimat, hasil satu kalimat. Itu saja. Latih mengucapkannya tanpa membuka dengan 'hmm, jadi begini ceritanya'. Kalimat pertama sebaiknya sudah menjawab, bukan meminta izin untuk menjawab.",
          "Untuk case, ganti kerangka menjadi: yang ditanyakan, asumsi yang kamu pakai, langkah pertama yang kamu cek. Ucapkan asumsi itu. Pewawancara tidak bisa membantu pikiran yang kamu sembunyikan.",
        ],
      },
      {
        heading: "Latihan keras cukup dua kali",
        paragraphs: [
          "Ucapkan cerita dengan keras, sekali versi pendek dan sekali versi dua menit. Lebih dari itu, kata-katanya mulai mengeras dan kamu kembali menghafal. Minta teman hanya mendengarkan satu hal: apakah mereka bisa mengulang apa yang kamu lakukan, bukan apakah kamu terdengar percaya diri.",
          "Percaya diri adalah efek samping yang tidak bisa dipaksa semalam. Kejelasan bisa. Teman yang bisa menceritakan ulang tindakanmu adalah tes yang lebih jujur daripada perasaanmu sesudah latihan.",
        ],
      },
      {
        heading: "Tutup hari tanpa rapat umum",
        paragraphs: [
          "Sesudah dua kali latihan, berhenti. Tidur lebih berguna daripada menemukan kelemahan baru jam sebelas malam. Bawa catatan kecil, bukan skrip. Di ruangan, catatan itu pengingat, bukan naskah yang dibaca.",
          "Wawancara berikutnya tetap bisa terasa gagal. Itu tidak menghapus latihan hari ini. Debrief yang baik tidak menjanjikan tawaran. Ia hanya membuat kamu masuk dengan bahan yang lebih utuh daripada spiral semalam.",
        ],
      },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
