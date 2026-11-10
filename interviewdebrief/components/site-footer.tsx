import Link from "next/link";
import { site } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-ink/70 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-semibold text-navy-900">{site.name}</p>
          <p className="mt-1 max-w-md leading-relaxed">
            Debrief sekali bayar sesudah wawancara, untuk pencari kerja dan fresh grad. Bukan alat gaji, bukan jaminan diterima.
          </p>
          <p className="mt-3">
            {site.operator}
            {" · "}
            <a className="underline decoration-line underline-offset-4" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/artikel">Artikel</Link>
          <Link href="/tentang">Tentang</Link>
          <Link href="/privasi">Privasi</Link>
          <Link href="/syarat">Syarat</Link>
          <Link href="/pengembalian">Pengembalian</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </nav>
      </div>
    </footer>
  );
}
