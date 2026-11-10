"use client";

import { motion, useReducedMotion } from "framer-motion";

const rows = [
  { label: "Struktur", score: 74 },
  { label: "Kejelasan", score: 61 },
  { label: "Contoh", score: 48 },
  { label: "Pertanyaan balik", score: 33 },
];

export function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
      <figcaption className="sr-only">
        Contoh tampilan scorecard: struktur, kejelasan, contoh, dan pertanyaan balik.
      </figcaption>
      <div className="rounded-[28px] border border-line bg-white p-4 shadow-card sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-500">Contoh tampilan</p>
            <p className="mt-1 text-lg font-semibold text-navy-950">Scorecard wawancara</p>
          </div>
          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-navy-900">HR · 38 mnt</p>
        </div>
        <p className="mt-3 text-sm text-ink/70">Ada yang nyangkut. Perasaan jeblok tidak masuk ke angka.</p>
        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-navy-900">{row.label}</span>
                <span className="tabular-nums text-ink/60">{row.score}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-mist">
                <motion.div
                  className="h-full origin-left rounded-full"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: reduce ? 0 : 0.08 * index, ease: "easeOut" }}
                  style={{
                    width: `${row.score}%`,
                    backgroundColor: index === 3 ? "#e8a54b" : "#243656",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-paper px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-700">
            Yang diperbaiki berikutnya
          </p>
          <p className="mt-2 h-2 w-11/12 rounded-full bg-line" />
          <p className="mt-2 h-2 w-8/12 rounded-full bg-line" />
        </div>
      </div>
    </figure>
  );
}
