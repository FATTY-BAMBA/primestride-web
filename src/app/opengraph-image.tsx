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
