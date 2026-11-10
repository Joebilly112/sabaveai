import type { Metadata } from "next";
import { HasilView } from "@/components/hasil-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isDebriefId } from "@/lib/input";

export const metadata: Metadata = {
  title: "Debrief kamu",
  robots: { index: false, follow: false },
};

export default function HasilPage({ params }: { params: { id: string } }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-4">
        {isDebriefId(params.id) ? (
          <HasilView id={params.id} />
        ) : (
          <p className="text-ink/75">Tautan debrief ini tidak lengkap.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
