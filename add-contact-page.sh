#!/usr/bin/env bash
set -euo pipefail
if [ ! -f package.json ] || [ ! -d src ]; then
  echo "Run this from your repo root (the folder with package.json)."; exit 1
fi
echo "→ src/components/ContactForm.tsx"
cat > src/components/ContactForm.tsx <<'TSX_FORM'
"use client";
import { useState } from "react";

export type FormLabels = {
  name: string;
  email: string;
  company: string;
  interest: string;
  message: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  errorMsg: string;
};

export type InterestOption = { value: string; label: string };

export default function ContactForm({
  endpoint,
  labels,
  interestOptions,
}: {
  endpoint: string;
  labels: FormLabels;
  interestOptions: InterestOption[];
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    interest: "",
    message: "",
    _gotcha: "",
  });

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Honeypot: real users never see this field. If it's filled, it's a bot —
    // silently pretend success and send nothing.
    if (form._gotcha) {
      setStatus("ok");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("ok");
        setForm({ name: "", email: "", company: "", interest: "", message: "", _gotcha: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="form-success">
        <h3>{labels.successTitle}</h3>
        <p>{labels.successBody}</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        {labels.name}
        <input required value={form.name} onChange={update("name")} />
      </label>
      <label>
        {labels.email}
        <input required type="email" value={form.email} onChange={update("email")} />
      </label>
      <label>
        {labels.company}
        <input value={form.company} onChange={update("company")} />
      </label>
      <label>
        {labels.interest}
        <select value={form.interest} onChange={update("interest")}>
          {interestOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        {labels.message}
        <textarea required rows={4} value={form.message} onChange={update("message")} />
      </label>

      {/* Honeypot — hidden from humans, catches bots. Do not remove. */}
      <input
        type="text"
        name="_gotcha"
        className="hp-field"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form._gotcha}
        onChange={update("_gotcha")}
      />

      {status === "error" && <p className="form-error">{labels.errorMsg}</p>}
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? labels.sending : labels.submit} <span className="chev">›</span>
      </button>
    </form>
  );
}
TSX_FORM
echo "→ src/app/[locale]/contact/page.tsx"
mkdir -p 'src/app/[locale]/contact'
cat > 'src/app/[locale]/contact/page.tsx' <<'TSX_PAGE'
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
TSX_PAGE
echo "→ src/app/globals.css (contact styles)"
if ! grep -q "contact page" src/app/globals.css; then
cat >> src/app/globals.css <<'CSS_CONTACT'

/* contact page */
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;padding-top:24px}
.contact-info .lead{font-size:1.12rem;color:var(--muted);margin:18px 0 24px;max-width:46ch}
.expect{list-style:none;padding:0;display:flex;flex-direction:column;gap:12px;margin-bottom:30px}
.expect li{padding-left:26px;position:relative;color:var(--ink-soft);font-size:1rem}
.expect li::before{content:"";position:absolute;left:0;top:.5em;width:9px;height:9px;background:var(--live);border-radius:50%}
.alt-contact{border-top:1px solid var(--line);padding-top:22px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.alt-label{font-family:var(--font-plex-mono);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted-2)}
.alt-btn{display:inline-flex;align-items:center;gap:.4rem;font-weight:600;color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:.6rem 1rem;transition:border-color .15s,transform .15s}
.alt-btn:hover{border-color:var(--ink);transform:translateY(-1px)}
.alt-btn.line{background:#06C755;color:#fff;border-color:#06C755}
.alt-btn.line:hover{border-color:#06C755;filter:brightness(1.05)}
.contact-card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:32px}
.contact-card h2{font-size:1.4rem;margin-bottom:20px}
.contact-form{display:flex;flex-direction:column;gap:16px}
.contact-form label{display:flex;flex-direction:column;gap:6px;font-size:.9rem;font-weight:600;color:var(--ink-soft)}
.contact-form input,.contact-form textarea{font-family:inherit;font-size:1rem;padding:.7rem .8rem;border:1px solid var(--line);border-radius:10px;background:var(--paper);color:var(--ink);transition:border-color .15s}
.contact-form input:focus,.contact-form textarea:focus{outline:none;border-color:var(--iris)}
.contact-form textarea{resize:vertical}
.contact-form select{font-family:inherit;font-size:1rem;padding:.7rem .8rem;border:1px solid var(--line);border-radius:10px;background:var(--paper);color:var(--ink);transition:border-color .15s}
.contact-form select:focus{outline:none;border-color:var(--iris)}
.hp-field{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0;pointer-events:none}
.contact-form .btn{margin-top:6px;justify-content:center}
.form-error{color:var(--signal);font-size:.9rem}
.form-success{background:var(--live-tint);border:1px solid var(--live);border-radius:14px;padding:28px}
.form-success h3{color:var(--live);margin-bottom:8px}
.form-success p{color:var(--ink-soft)}
@media(max-width:960px){.contact-grid{grid-template-columns:1fr}}
CSS_CONTACT
  echo "  appended contact styles"
elif ! grep -q "hp-field" src/app/globals.css; then
cat >> src/app/globals.css <<'CSS_EXTRA'
.contact-form select{font-family:inherit;font-size:1rem;padding:.7rem .8rem;border:1px solid var(--line);border-radius:10px;background:var(--paper);color:var(--ink);transition:border-color .15s}
.contact-form select:focus{outline:none;border-color:var(--iris)}
.hp-field{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0;pointer-events:none}
CSS_EXTRA
  echo "  added select + honeypot styles"
else
  echo "  contact styles already present, skipped"
fi
echo "→ repointing Book a consult links"
python3 - <<'PY_LINKS'
import os
repls = {
  "src/components/Nav.tsx": [("${base}#contact", "${base}/contact")],
  "src/components/Footer.tsx": [("${base}#contact", "${base}/contact")],
  "src/app/[locale]/products/[slug]/page.tsx": [("${base}#contact", "${base}/contact")],
  "src/app/[locale]/page.tsx": [('<a href="mailto:hello@primestrideai.com" className="btn btn-light">','<a href={`${base}/contact`} className="btn btn-light">')],
  "src/app/[locale]/ai-zhanggui/page.tsx": [('href="mailto:hello@primestrideai.com"','href={`${base}/contact`}')],
}
for f, pairs in repls.items():
    if not os.path.exists(f): print("  skip (missing):", f); continue
    s = open(f, encoding="utf-8").read(); changed=False
    for a, b in pairs:
        if a in s: s = s.replace(a, b); changed=True
    open(f, "w", encoding="utf-8").write(s)
    print(("  patched " if changed else "  already ok ") + f)
PY_LINKS
echo ""
echo "DONE. Next:"
echo "  1. Edit src/app/[locale]/contact/page.tsx -> set FORMSPREE_ENDPOINT and LINE_URL"
echo "  2. npm run build"
echo "  3. git add -A && git commit -m 'Add contact page' && git push"
