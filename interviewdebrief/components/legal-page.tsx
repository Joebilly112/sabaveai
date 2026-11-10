import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function LegalPage({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6">
        <p className="text-sm font-semibold text-amber-500">Catatan hukum</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy-950">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/80">{lede}</p>
        <p className="mt-3 text-sm text-ink/55">Terakhir diperbarui 10 November 2026</p>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-ink/85">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
