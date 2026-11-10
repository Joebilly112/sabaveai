export const site = {
  name: "Interview Debrief",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://interviewdebrief.web.app",
  domain: "interviewdebrief.id",
  locale: "id_ID",
  priceIdr: 19900,
  operator: "PT Think Era Labs",
  email: "halo@interviewdebrief.id",
  description:
    "Debrief sekali bayar sesudah wawancara. Scorecard struktur, kejelasan, contoh, dan pertanyaan balik untuk pencari kerja dan fresh grad.",
} as const;

export const firebaseProjectId = "skoolnow-ea6ff";
export const firestoreDatabaseId = process.env.FIREBASE_DATABASE_ID || "interviewdebrief";
export const hostingSiteId = "interviewdebrief";

export function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
