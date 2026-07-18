import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";
import ContactForm from "@/components/ContactForm";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = { title: "Contact · PrimeStride AI" };

/* ── SETUP ──────────────────────────────────────────────────────────────
   1. Create a free form at https://formspree.io (submissions go to your
      inbox) and paste its endpoint below.
   2. Paste your LINE add-friend link (LINE Official Account → "Add friend"
      URL, e.g. https://line.me/R/ti/p/@yourid). If you don't have one yet,
      delete the LINE <a> line further down.
   ──────────────────────────────────────────────────────────────────────── */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
const LINE_URL = "https://line.me/R/ti/p/@primestride";

const content = {
  en: {
    eyebrow: "Contact",
    title: "Book your free 15-minute consult",
    lead: "Tell us where your team loses the most time. We'll show you which entry point pays off fastest, and run a free government-subsidy check while we're at it.",
    expect: [
      "A 15-minute call, no obligation",
      "A free government-subsidy check for your company",
      "We reply within one business day to set a time",
      "Straight answers from the team that builds the product",
    ],
    altLabel: "Prefer to reach us directly?",
    lineLabel: "Message us on LINE",
    formTitle: "Tell us about your team",
    labels: {
      name: "Your name",
      email: "Work email",
      company: "Company",
      interest: "Which product interests you?",
      message: "What do you need help with?",
      submit: "Request my consult",
      sending: "Sending…",
      successTitle: "Thanks — message received.",
      successBody: "We'll reply within one business day to set up your free 15-minute consult.",
      errorMsg: "Something went wrong. Please email hello@primestrideai.com and we'll sort it out.",
    },
    interestOptions: [
      { value: "", label: "I'm not sure yet" },
      { value: "AI 掌櫃", label: "AI 掌櫃 — SME operations platform" },
      { value: "Atlas EIP", label: "Atlas EIP — HR" },
      { value: "LyraAI", label: "LyraAI — Interview coaching" },
      { value: "EduSense AI", label: "EduSense AI — Education" },
      { value: "AI Customer Assistant", label: "AI Customer Assistant" },
      { value: "Pulse", label: "Pulse — Marketing" },
      { value: "AI Knowledge Assistant", label: "AI Knowledge Assistant" },
    ],
  },
  zh: {
    eyebrow: "聯絡我們",
    title: "預約 15 分鐘免費諮詢",
    lead: "告訴我們團隊最耗時的環節，我們會告訴你哪個切入點最快見效，並順便做免費的政府補助健檢。",
    expect: [
      "15 分鐘通話，無任何義務",
      "為貴公司做免費政府補助健檢",
      "我們會在一個工作天內回覆並安排時間",
      "由實際打造產品的團隊，給你直接的答案",
    ],
    altLabel: "想直接聯絡我們？",
    lineLabel: "用 LINE 聯絡我們",
    formTitle: "告訴我們你的團隊狀況",
    labels: {
      name: "您的姓名",
      email: "公司信箱",
      company: "公司名稱",
      interest: "您對哪項產品有興趣？",
      message: "您需要什麼協助？",
      submit: "預約諮詢",
      sending: "傳送中…",
      successTitle: "已收到，謝謝您。",
      successBody: "我們會在一個工作天內回覆，為您安排 15 分鐘免費諮詢。",
      errorMsg: "發生錯誤，請寄信至 hello@primestrideai.com，我們會協助處理。",
    },
    interestOptions: [
      { value: "", label: "還不確定" },
      { value: "AI 掌櫃", label: "AI 掌櫃 — 中小企業營運平台" },
      { value: "Atlas EIP", label: "Atlas EIP — 人資" },
      { value: "LyraAI", label: "LyraAI — 面試教練" },
      { value: "EduSense AI", label: "EduSense AI — 教育" },
      { value: "AI Customer Assistant", label: "AI 智慧客服助理" },
      { value: "Pulse", label: "Pulse — 行銷" },
      { value: "AI Knowledge Assistant", label: "AI 知識助理" },
    ],
  },
};

export default function ContactPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = content[locale];

  return (
    <main>
      <section className="block">
        <div className="wrap contact-grid">
          <div className="contact-info">
            <span className="eyebrow">{t.eyebrow}</span>
            <h1>{t.title}</h1>
            <p className="lead">{t.lead}</p>
            <ul className="expect">
              {t.expect.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
            <div className="alt-contact">
              <span className="alt-label">{t.altLabel}</span>
              <a href="mailto:hello@primestrideai.com" className="alt-btn">✉&nbsp; hello@primestrideai.com</a>
              <a href={LINE_URL} className="alt-btn line" target="_blank" rel="noreferrer">{t.lineLabel}</a>
            </div>
          </div>
          <div className="contact-card">
            <h2>{t.formTitle}</h2>
            <ContactForm endpoint={FORMSPREE_ENDPOINT} labels={t.labels} interestOptions={t.interestOptions} />
          </div>
        </div>
      </section>
    </main>
  );
}
