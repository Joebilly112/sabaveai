"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-5">
      <h1 className="text-3xl font-semibold text-navy-950">Halaman ini lagi tidak tenang</h1>
      <p className="mt-3 text-ink/75">Tidak ada data wawancara yang ditampilkan di layar ini.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 inline-flex min-h-12 w-fit items-center rounded-full bg-navy-900 px-5 text-sm font-semibold text-paper"
      >
        Coba lagi
      </button>
    </main>
  );
}
