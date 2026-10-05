import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "AI 營運大腦 — One company knowledge hub. Five operational applications. By PrimeStride AI.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProductOpenGraphImage({ params }: { params: { locale: string } }) {
  const zh = params.locale === "zh";
  const font = await readFile(join(process.cwd(), "public/fonts/noto-sans-tc-product-700.ttf"));
  const applications = zh
    ? ["內部查詢", "客戶回覆", "報價", "工單生產", "數據分析"]
    : ["Knowledge assistant", "Customer service", "Quoting", "Work orders", "Analytics"];

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#171426", color: "#ffffff", padding: "62px 70px", fontFamily: "sans-serif, ProductNoto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#c9bfff", fontSize: 22 }}>
        <div>PRIMESTRIDE AI</div><div>{zh ? "首越人工智慧" : "Built for SMEs"}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-2px" }}>AI 營運大腦</div>
        <div style={{ fontSize: zh ? 36 : 38, lineHeight: 1.4, color: "#d4cbff", marginTop: 22 }}>{zh ? "一個企業知識中樞，支援五大營運應用。" : "One knowledge hub. Five applications."}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {applications.map((application) => <div key={application} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 17px", border: "1px solid #605080", borderRadius: 8, color: "#eee9ff", fontSize: 20 }}>{application}</div>)}
        </div>
        <div style={{ color: "#aea5c3", fontSize: 20 }}>primestrideai.com</div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "ProductNoto", data: font, weight: 700, style: "normal" }] },
  );
}
