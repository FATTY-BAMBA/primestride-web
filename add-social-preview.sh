#!/usr/bin/env bash
set -euo pipefail
if [ ! -f package.json ] || [ ! -d src ]; then
  echo "Run this from your repo root (the folder with package.json)."; exit 1
fi
echo "→ src/app/opengraph-image.tsx"
cat > src/app/opengraph-image.tsx <<'TSX_OG'
import { ImageResponse } from "next/og";

export const alt = "PrimeStride AI — AI-native automation platform for Taiwanese business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0E1116",
          color: "#ffffff",
          padding: "74px 78px",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5 }}>
            <div style={{ width: 15, height: 27, borderRadius: 3, background: "#6B5BFF", opacity: 0.55 }} />
            <div style={{ width: 15, height: 39, borderRadius: 3, background: "#6B5BFF", opacity: 0.8 }} />
            <div style={{ width: 15, height: 51, borderRadius: 3, background: "#6B5BFF" }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>PrimeStride AI</div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.04, letterSpacing: "-1px" }}>
            One platform. Five pillars.
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.04, letterSpacing: "-1px", color: "#8f83f2" }}>
            Six products, live today.
          </div>
          <div style={{ fontSize: 31, color: "#a7adba", marginTop: 26 }}>
            AI-native automation, built for Taiwanese business.
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 25, color: "#8a92a0" }}>
          <div>primestrideai.com</div>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ padding: "7px 15px", borderRadius: 99, border: "1px solid #2A3040", color: "#c4cad6" }}>Atlas EIP</span>
            <span style={{ padding: "7px 15px", borderRadius: 99, border: "1px solid #2A3040", color: "#c4cad6" }}>LyraAI</span>
            <span style={{ padding: "7px 15px", borderRadius: 99, border: "1px solid #2A3040", color: "#c4cad6" }}>Pulse</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
TSX_OG
echo "→ src/app/twitter-image.tsx"
cat > src/app/twitter-image.tsx <<'TSX_TW'
export { default, alt, size, contentType } from "./opengraph-image";
TSX_TW
echo "→ adding Open Graph + Twitter metadata to src/app/layout.tsx"
python3 - <<'PY_META'
f = "src/app/layout.tsx"
s = open(f, encoding="utf-8").read()
if "openGraph" in s:
    print("  metadata already has openGraph, skipped")
else:
    old = '  metadataBase: new URL("https://www.primestrideai.com"),\n};'
    new = ('  metadataBase: new URL("https://www.primestrideai.com"),\n'
           '  openGraph: {\n'
           '    title: "PrimeStride AI \u00b7 \u9996\u8d8a\u4eba\u5de5\u667a\u6167",\n'
           '    description:\n'
           '      "One AI-native platform with six live products across five business pillars, where every interaction compounds your company\'s intelligence.",\n'
           '    url: "https://www.primestrideai.com",\n'
           '    siteName: "PrimeStride AI",\n'
           '    locale: "en_US",\n'
           '    type: "website",\n'
           '  },\n'
           '  twitter: {\n'
           '    card: "summary_large_image",\n'
           '    title: "PrimeStride AI \u00b7 \u9996\u8d8a\u4eba\u5de5\u667a\u6167",\n'
           '    description:\n'
           '      "One AI-native platform with six live products across five business pillars, where every interaction compounds your company\'s intelligence.",\n'
           '  },\n'
           '};')
    if old not in s:
        print("  ! could not find the metadata block to edit — check layout.tsx manually")
    else:
        open(f, "w", encoding="utf-8").write(s.replace(old, new))
        print("  patched layout metadata")
PY_META
echo ""
echo "DONE. Next:  npm run build  &&  git add -A && git commit -m 'Add social share (OG) preview' && git push"
