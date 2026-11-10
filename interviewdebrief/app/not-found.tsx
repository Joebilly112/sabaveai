import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-navy-950">Halaman ini tidak ada</h1>
        <p className="mt-3 text-ink/75">Tautannya mungkin sudah bergeser.</p>
        <Link href="/" className="mt-6 inline-flex font-semibold text-navy-900 underline decoration-amber-400 underline-offset-4">
          Kembali ke beranda
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
