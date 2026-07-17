import type { Locale } from "@/i18n";

export interface Pillar {
  char: string;
  finance?: boolean;
  en: { name: string; domain: string; desc: string; who: string };
  zh: { name: string; domain: string; desc: string; who: string };
}

export const pillars: Pillar[] = [
  {
    char: "人",
    en: { name: "People", domain: "HR & Compliance", desc: "Hiring, leave, overtime, and staying compliant with Taiwan's latest labor law.", who: "Atlas EIP · live" },
    zh: { name: "人事", domain: "HR & Compliance", desc: "招募、請假、加班，並符合台灣最新勞動法規。", who: "Atlas EIP · 已上線" },
  },
  {
    char: "發",
    en: { name: "Talent", domain: "Training & Talent", desc: "Growing people: interview coaching, learning intelligence, competency development.", who: "LyraAI · EduSense AI · live" },
    zh: { name: "人才培育", domain: "Training & Talent", desc: "培育人才：面試教練、學習智慧、能力發展。", who: "LyraAI · EduSense AI · 已上線" },
  },
  {
    char: "銷",
    en: { name: "Sales & Service", domain: "Sales & Service", desc: "Winning and keeping customers, 24/7 service and marketing that runs itself.", who: "Customer AI · Pulse · live" },
    zh: { name: "銷售與服務", domain: "Sales & Service", desc: "贏得並留住客戶，24 小時客服與自動運作的行銷。", who: "AI 客服 · Pulse · 已上線" },
  },
  {
    char: "跨",
    en: { name: "Cross-pillar", domain: "Shared knowledge", desc: "One internal knowledge layer every product draws on, with source-cited answers.", who: "AI Knowledge Assistant · live" },
    zh: { name: "跨支柱", domain: "Shared knowledge", desc: "每項產品共用的內部知識層，答案皆附出處。", who: "AI 知識助理 · 已上線" },
  },
  {
    char: "財",
    finance: true,
    en: { name: "Finance", domain: "Emerging · 2027", desc: "Headcount, overtime spend, and subsidy ROI flowing into budget intelligence.", who: "In development" },
    zh: { name: "財務", domain: "Emerging · 2027", desc: "人力、加班支出與補助 ROI，匯入預算智慧。", who: "開發中" },
  },
];

export function pillarCopy(p: Pillar, locale: Locale) {
  return locale === "zh" ? p.zh : p.en;
}
