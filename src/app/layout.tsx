import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrimeStride AI · 首越人工智慧",
  description: "One AI-native platform with six live products across five business pillars, where every interaction compounds your company's intelligence.",
  metadataBase: new URL("https://www.primestrideai.com"),
  openGraph: {
    title: "PrimeStride AI · 首越人工智慧",
    description:
      "One AI-native platform with six live products across five business pillars, where every interaction compounds your company's intelligence.",
    url: "https://www.primestrideai.com",
    siteName: "PrimeStride AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrimeStride AI · 首越人工智慧",
    description:
      "One AI-native platform with six live products across five business pillars, where every interaction compounds your company's intelligence.",
  },
};

const fontVariables = {
  "--font-bricolage": '"Avenir Next", "Segoe UI", Arial, sans-serif',
  "--font-plex": '"Segoe UI", Arial, sans-serif',
  "--font-plex-mono": '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  "--font-noto-tc": '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
} as React.CSSProperties;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={fontVariables}>{children}</body>
    </html>
  );
}
