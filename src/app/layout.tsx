import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });
const notoTC = Noto_Sans_TC({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-noto-tc", display: "swap" });

export const metadata: Metadata = {
  title: "PrimeStride AI · 首越人工智慧",
  description: "One AI-native platform with six live products across five business pillars—where every interaction compounds your company's intelligence.",
  metadataBase: new URL("https://www.primestrideai.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${plex.variable} ${plexMono.variable} ${notoTC.variable}`}>
        {children}
      </body>
    </html>
  );
}
