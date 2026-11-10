import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
      <Link href="/" className="text-sm font-semibold tracking-tight text-navy-950">
        Interview Debrief
      </Link>
      <nav className="flex items-center gap-5 text-sm text-navy-800">
        <Link href="/artikel" className="hover:text-navy-950">
          Artikel
        </Link>
        <Link href="/tentang" className="hover:text-navy-950">
          Tentang
        </Link>
      </nav>
    </header>
  );
}
