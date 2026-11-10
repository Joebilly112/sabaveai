import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = rootMetadata();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={`${sans.variable} font-sans`}>{children}</body>
    </html>
  );
}
