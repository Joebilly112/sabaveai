import type { DebriefInput, DimensionScore, Scorecard } from "@/lib/types";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countHits(text: string, phrases: readonly string[]) {
  let hits = 0;
  for (const phrase of phrases) {
    let from = 0;
    while (from < text.length) {
      const at = text.indexOf(phrase, from);
      if (at < 0) break;
      const prefix = text.slice(Math.max(0, at - 24), at);
      const negated = /(tidak|nggak|enggak|\bgak\b|belum|tanpa|kurang)/.test(prefix);
      if (!negated) {
        hits += 1;
        break;
      }
      from = at + phrase.length;
    }
  }
  return hits;
}

function bandFor(overall: number) {
  if (overall < 48) return "rekapnya masih tipis";
  if (overall < 62) return "ada yang nyangkut";
  if (overall < 78) return "cukup utuh";
  return "sudah bisa ditajamkan";
}

function spiralNote(input: DebriefInput, overall: number) {
  if (input.gut === "jelek" && overall >= 62) {
    return "Perasaan jeblok tadi tidak otomatis sama dengan jawaban yang jeblok. Replay di kepala biasanya lebih keras daripada yang sempat didengar pewawancara. Angka di bawah membaca rekapmu, bukan rasa di perut.";
  }
  if (input.gut === "jelek" && overall < 48) {
    return "Spiralnya kali ini nempel ke sinyal yang memang tipis. Bukan vonis soal dirimu. Ada bagian jawaban yang belum sempat berdiri, dan itu yang bisa diperbaiki sebelum wawancara berikutnya.";
  }
  if (input.gut === "jelek") {
    return "Rasa jelek sesudah wawancara itu biasa. Di rekap ini ada yang sudah kebaca dan ada yang masih longgar. Pisahkan dua hal itu sebelum kamu mengulang seluruh adegan di kepala.";
  }
  if (input.gut === "tenang" && overall < 55) {
    return "Tenang bukan bukti jawaban sudah utuh. Rekap ini masih kekurangan jejak yang bisa dibayangkan pewawancara. Enak di badan bisa menutup bagian yang belum sempat diceritakan.";
  }
  if (input.gut === "tenang") {
    return "Kamu keluar dengan badan yang relatif tenang. Tetap baca angkanya sebagai catatan teknik, bukan sebagai izin untuk tidak menyiapkan apa-apa untuk wawancara berikutnya.";
  }
  return "Campur aduk sesudah wawancara itu wajar. Yang berikut ini memisahkan bagian yang memang tipis dari bagian yang cuma terasa buruk karena kamu masih memutar ulang.";
}

function dimensionNotes(scores: Record<DimensionScore["key"], number>): DimensionScore[] {
  return [
    {
      key: "structure",
      label: "Struktur",
      score: scores.structure,
      note:
        scores.structure >= 75
          ? "Urutan jawaban kebaca. Pewawancara tidak perlu merakitnya sendiri."
          : scores.structure >= 55
            ? "Ada alur, tapi masih ada lompatan yang harus diisi sendiri oleh pendengar."
            : "Rekapnya belum menunjukkan urutan. Jawaban yang meloncat mudah dikira tidak siap, padahal sering kali hanya gugup.",
    },
    {
      key: "clarity",
      label: "Kejelasan",
      score: scores.clarity,
      note:
        scores.clarity >= 75
          ? "Intinya kebaca lebih dulu daripada suasana."
          : scores.clarity >= 55
            ? "Arahnya ada, hanya masih dikelilingi kalimat yang tidak menambah."
            : "Yang tersisa lebih banyak suasana daripada isi. Perlu satu kalimat yang menjawab langsung.",
    },
    {
      key: "examples",
      label: "Contoh",
      score: scores.examples,
      note:
        scores.examples >= 75
          ? "Ada jejak kejadian, bukan hanya sifat."
          : scores.examples >= 55
            ? "Contohnya disebut, tapi akibatnya masih kabur."
            : "Belum kelihatan kejadian yang bisa dibayangkan pewawancara. Sifat seperti 'cepat belajar' belum menggantikan cerita.",
    },
    {
      key: "questions",
      label: "Pertanyaan balik",
      score: scores.questions,
      note:
        scores.questions >= 75
          ? "Kamu mengembalikan rasa ingin tahu, bukan hanya menunggu dinilai."
          : scores.questions >= 55
            ? "Ada niat bertanya. Pastikan pertanyaannya hanya bisa dijawab tim itu, bukan kalimat penutup yang aman."
            : "Rekap ini belum menunjukkan pertanyaan balik. Diam di akhir sering disangka sopan, dan sering juga terbaca sebagai pasrah.",
    },
  ];
}

function buildFixes(input: DebriefInput, dimensions: DimensionScore[]) {
  const fixes: string[] = [];
  const lowest = [...dimensions].sort((a, b) => a.score - b.score);

  for (const dimension of lowest) {
    if (fixes.length >= 3) break;
    if (dimension.score >= 78) continue;
    if (dimension.key === "structure") {
      fixes.push(
        "Tulis tiga baris di kertas sebelum wawancara berikutnya: konteks, tindakanmu, hasil. Jawab dengan urutan itu meski pertanyaannya mendadak.",
      );
    } else if (dimension.key === "clarity") {
      fixes.push(
        "Siapkan kalimat pembuka satu baris yang langsung menjawab. Detail menyusul. Kalau kamu mulai dari suasana, inti jawaban sering tertinggal di luar ruangan.",
      );
    } else if (dimension.key === "examples") {
      fixes.push(
        "Bawa dua cerita kecil yang ada akibatnya: magang, tugas kuliah, organisasi, atau kerja paruh waktu. Sebut apa yang berubah, bukan hanya bahwa kamu ikut serta.",
      );
    } else {
      fixes.push(
        "Siapkan tiga pertanyaan balik yang hanya tim itu yang bisa jawab: kerja minggu pertama, cara mereka menilai berhasil, dan hal yang biasanya bikin orang baru kewalahan.",
      );
    }
  }

  if (input.format === "case") {
    fixes.push(
      "Untuk case, ucapkan asumsi dengan keras sebelum menghitung. Diam yang lama tanpa peta mudah terbaca sebagai buntu, bukan sebagai hati-hati.",
    );
  } else if (input.format === "hr" && input.durationMinutes < 15) {
    fixes.push(
      "HR yang sangat pendek sering berarti cerita belum sempat dibuka. Siapkan versi 45 detik dan versi 2 menit untuk cerita yang sama.",
    );
  } else if (input.format === "user") {
    fixes.push(
      "Di wawancara user, pindahkan satu contoh ke sepuluh menit pertama. Jangan menghabiskan pembuka untuk memperkenalkan sifat.",
    );
  }

  const exampleScore = dimensions.find((item) => item.key === "examples")?.score ?? 0;
  if (input.durationMinutes >= 75 && exampleScore < 60) {
    fixes.push(
      "Wawancara yang panjang dengan contoh tipis biasanya habis di basa-basi. Potong pengantar dan taruh kejadian di awal jawaban.",
    );
  }

  if (fixes.length === 0) {
    fixes.push(
      "Pertahankan kalimat pembuka yang langsung menjawab. Latihan berikutnya cukup mengulang dua cerita, bukan menulis ulang seluruh wawancara.",
    );
  }

  return fixes.slice(0, 4);
}

export function scoreDebrief(input: DebriefInput): Scorecard {
  const text = input.asked.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasNumber = /\d/.test(text);
  const exampleHits = countHits(text, [
    "contoh",
    "waktu itu",
    "saat itu",
    "pernah",
    "proyek",
    "magang",
    "organisasi",
    "hasil",
    "dampak",
    "angka",
    "persen",
  ]);
  const structureHits = countHits(text, [
    "pertama",
    "kedua",
    "lalu",
    "kemudian",
    "terakhir",
    "kerangka",
    "langkah",
    "asumsi",
    "struktur",
    "poin",
  ]);
  const clarityHits = countHits(text, ["maksud", "jadi", "singkat", "karena", "supaya", "artinya", "intinya"]);
  const questionHits = countHits(text, [
    "saya tanya",
    "aku tanya",
    "bertanya",
    "pertanyaan balik",
    "tanya balik",
    "saya ajukan",
    "saya menanyakan",
  ]);
  const questionMarks = (text.match(/\?/g) ?? []).length;
  const vagueHits = countHits(text, [
    "nggak ingat",
    "tidak ingat",
    "lupa",
    "blank",
    "kosong",
    "biasa aja",
    "gugup",
    "panik",
    "nggak jelas",
    "tidak jelas",
    "berantakan",
  ]);

  let structure = 36 + structureHits * 11 + Math.min(wordCount, 160) / 12;
  let clarity = 38 + clarityHits * 9 + Math.min(wordCount, 120) / 14 - vagueHits * 7;
  let examples = 26 + exampleHits * 12 + (hasNumber ? 10 : 0);
  let questions = 20 + questionHits * 16 + Math.min(questionMarks, 3) * 7;

  if (wordCount < 30) {
    structure -= 10;
    clarity -= 8;
    examples -= 12;
  }

  if (input.format === "case") {
    structure += structureHits > 0 ? 6 : -12;
    if (input.durationMinutes < 30) structure -= 8;
    if (input.durationMinutes >= 40 && structureHits > 0) structure += 4;
  } else if (input.format === "hr") {
    questions += 4;
    clarity += 4;
    if (input.durationMinutes < 12) clarity -= 8;
  } else {
    examples += 6;
    if (input.durationMinutes < 20) examples -= 8;
  }

  const scores = {
    structure: clamp(structure),
    clarity: clamp(clarity),
    examples: clamp(examples),
    questions: clamp(questions),
  };

  const weights =
    input.format === "case"
      ? { structure: 0.4, clarity: 0.2, examples: 0.25, questions: 0.15 }
      : input.format === "user"
        ? { structure: 0.25, clarity: 0.25, examples: 0.35, questions: 0.15 }
        : { structure: 0.2, clarity: 0.35, examples: 0.2, questions: 0.25 };

  const overall = clamp(
    scores.structure * weights.structure +
      scores.clarity * weights.clarity +
      scores.examples * weights.examples +
      scores.questions * weights.questions,
  );

  const dimensions = dimensionNotes(scores);
  return {
    overall,
    band: bandFor(overall),
    spiralNote: spiralNote(input, overall),
    dimensions,
    fixes: buildFixes(input, dimensions),
    narrativeSource: "coach",
  };
}
