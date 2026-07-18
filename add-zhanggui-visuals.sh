#!/usr/bin/env bash
# PrimeStride — AI 掌櫃 page visuals + interactive demos (safe to re-run)
# Usage: drop this file in the repo root, then:  bash add-zhanggui-visuals.sh
set -e
cd "$(dirname "$0")"

dl() { # dl <url> <out> — retry up to 5 times
  for i in 1 2 3 4 5; do
    if curl -fsSL --connect-timeout 20 "$1" -o "$2"; then return 0; fi
    echo "  retry $i for $(basename "$2")"; sleep 2
  done
  echo "FAILED to download $2 after 5 tries"; exit 1
}

echo "→ downloading AI 掌櫃 visuals to public/visuals/"
mkdir -p public/visuals
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F0148cae46dd8faca076726200b678d27d2bd3bcf540f1915c594c90f485087df?filename=zg-hero-lantern.png&sig=bbzPIDkB6-GUqwKGw-ZbsNmGUqQ1MFg14-e0JI32Rq8=&t=o" public/visuals/zg-hero-lantern.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fd02bfada207d733ec8b3a6fd5771c17bf05c41eb2851d335eb68bebdb37922fd?filename=zg-hub-wide.png&sig=m0ILlAFMeipIJAwJ5gjtdAhdCR_d0QJee7ya9jvjhbA=&t=o" public/visuals/zg-hub-wide.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fdf72a231f233b133c9706ae1af85a0c04d0cc993efb7eae3264ee937a7480d9f?filename=zg-module-assistant.png&sig=ov3qHyIQ6oVrRNQ-0ObticcWHMUTv37TVXU9S8C8JUk=&t=o" public/visuals/zg-module-assistant.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fe1cfd7691dc55e037a7ddbb873ff4a025df7e8b8a73e462c45c9e8d0f132ddb1?filename=zg-module-quoting.png&sig=ieIXd6oxGztdb24rU9GYzUHl5OcMY5CMqXi1nTNuFlc=&t=o" public/visuals/zg-module-quoting.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fc755f496a10025e6480fb0786aabb83a8dd5ea56dc0b391fddb74c162a29c239?filename=zg-module-workorders.png&sig=UqpKtBLalMlwdNSNE5-7eWmL8rioDu48gRFD_38-ka8=&t=o" public/visuals/zg-module-workorders.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F754713501bfd3ad5f7c69cf3e40958387204b77bb2cdacb5b033a652318c349f?filename=zg-module-analytics.png&sig=xGjOvaom2JFTpkpWxfrsUX7c5MLzT-_aY4i9j9At394=&t=o" public/visuals/zg-module-analytics.png
echo "  6 images saved"

echo "→ rewriting src/app/[locale]/ai-zhanggui/page.tsx (hero visual, module images, demo section)"
cat > "src/app/[locale]/ai-zhanggui/page.tsx" <<'TSX'
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "AI 掌櫃 · SME Operations Platform · PrimeStride AI",
};

type Item = { title: string; desc: string };

const content = {
  en: {
    eyebrow: "Solution · SME Operations Platform",
    title: "The shopkeeper who remembers everything, and never clocks out.",
    lead: "How you look after customers, how you price a job, where every order stands: AI 掌櫃 keeps track of all of it. Your company's know-how becomes an asset you own, not something locked inside a few people's heads.",
    cta: "Book a free 15-min consult",
    seeHow: "See how it works",
    painEyebrow: "Sound familiar?",
    painTitle: "Is this how your company runs?",
    painIntro:
      "For most Taiwanese SMEs, the critical know-how lives in a handful of senior employees' heads. When they leave, thirty years of hard-won judgment walks out with them.",
    pain: [
      { title: "Hours lost to repeat questions", desc: "Staff spend hours a day answering the same customer questions over and over." },
      { title: "Pricing by gut feel", desc: "Quotes depend on one person's instinct, and that ruler lives only in their head." },
      { title: "Work orders tracked from memory", desc: "Where each job stands is remembered, not recorded, so things slip." },
      { title: "Experience retires with the veteran", desc: "When a master craftsman retires, decades of subtle know-how leave with them." },
      { title: "Can't hire, can't retain", desc: "In a tight labour market you can't find people, and can't keep the experience." },
      { title: "Knowledge scattered everywhere", desc: "SOPs, LINE chats, quote sheets, notes: nothing lives in one place you can search." },
    ],
    whatEyebrow: "What is AI 掌櫃",
    whatTitle: "One data hub. Your whole operation runs on it.",
    whatBody:
      "AI 掌櫃 organizes your company's knowledge, SOPs, standards, pricing logic, customer quirks, into a single data hub your company owns forever and that gets smarter the more you use it. Build the data once, and it powers everything below.",
    modulesEyebrow: "Six modules, one data hub",
    modulesTitle: "The same data drives your whole operation.",
    modules: [
      { title: "Knowledge management · 知識管理", desc: "Your veterans' experience becomes a searchable asset, every answer cites its source (document, section, page)." },
      { title: "AI knowledge assistant · 知識助理", desc: "Staff look up SOPs and standards internally, so new hires ramp up without interrupting seniors." },
      { title: "AI customer service · AI 客服", desc: "Answers customers on LINE around the clock, lead times, specs, file requirements, instantly." },
      { title: "AI quoting · AI 報價", desc: "Generates a quote suggestion by size, material, and quantity in minutes. The pricing ruler is no longer in one head." },
      { title: "Work orders · 工單／生產", desc: "Every order's status is clear at a glance, printing, awaiting materials, complete." },
      { title: "AI analytics · 數據分析", desc: "Margins, efficiency, and top-selling items, visible to owners anytime, so decisions have a basis." },
    ],
    demoEyebrow: "See it in action",
    demoTitle: "What your customers and your team actually see.",
    chat1: "Hi — 500 A3 posters, when could you deliver?",
    chat2: "Hi! 500 A3 posters take about 3 working days. Send the file by 3pm today and we can ship Thursday.",
    chat2cite: "Source: Price & lead-time sheet, p.2",
    chat3: "And the file specs?",
    chat4: "PDF or AI, 300 dpi, with 3 mm bleed. Want me to send the checklist here?",
    chatCaption: "AI customer service on LINE · 24/7 · every answer cites its source",
    quoteInLabel: "YOU ENTER",
    quoteItems: ["Size · A3", "Material · 150gsm coated", "Qty · 500"],
    quoteOutLabel: "AI 報價 SUGGESTS",
    quoteAmt: "NT$ 6,800 – 7,400",
    quoteBasis: "Based on 14 similar past quotes · your standard 32% margin",
    quoteCaption: "AI quoting · in minutes, not days · the pricing ruler is yours",
    brainEyebrow: "Not just a chatbot",
    brainTitle: "A normal chatbot replies. AI 掌櫃 is an operations brain.",
    brainBody:
      "Its answers come from your own company's data, with sources you can verify. And the same data hub powers customer service, quoting, work orders, and analytics all at once, build it once, use it everywhere. The asset is yours; it doesn't resign.",
    stepsEyebrow: "Getting started",
    stepsTitle: "Up and running in three steps.",
    steps: [
      { when: "1–2 weeks", title: "Collect", desc: "We gather your existing documents, notes, LINE chat history, and quote sheets. There's no need to change how your team already works." },
      { when: "Build", title: "Build the hub", desc: "AI organizes it into your company's own data hub, with sensitive data isolated and access tiered by role." },
      { when: "Apply", title: "Go live", desc: "Start with the module you'll feel most, most clients begin with LINE support or knowledge lookup, then open up quoting, work orders, and analytics." },
    ],
    proofStat1: "of repetitive customer questions handled automatically, production-verified",
    proofStat2: "customer response, uninterrupted",
    proofLine: "Same team, more output. Nobody left behind.",
    subsidyEyebrow: "Government grants",
    subsidyTitle: "Grants may cover most of the cost.",
    subsidyBody:
      "Taiwanese SMEs have real funding available. At your consult we'll assess for free which grants you qualify for and help plan the application, so a large share of the rollout cost can be covered.",
    subsidyCta: "Get a free subsidy check",
    grants: [
      { name: "Digital-transformation grant · manufacturers under 30 staff", amt: "up to NT$100k" },
      { name: "MOEA TCloud marketplace credits", amt: "NT$30k" },
      { name: "SBIR small-business innovation grant", amt: "varies" },
    ],
    whoEyebrow: "Who it's for",
    whoTitle: "Built for businesses that run on experience.",
    whoBody:
      "If your company has veterans, repeat customer questions, and gut-feel pricing, AI 掌櫃 fits. No IT department needed, and no ripping out the systems you already use.",
    industries: ["Printing", "Manufacturing", "Processing", "Trading", "Wholesale", "Services"],
  },
  zh: {
    eyebrow: "解決方案 · 中小企業智慧營運平台",
    title: "一位什麼都記得、隨時都在的掌櫃。",
    lead: "客戶怎麼顧、價格怎麼抓、每一張單走到哪，他都知道。AI 掌櫃把公司的經驗變成你擁有的資產，而不是鎖在少數人腦袋裡的東西。",
    cta: "預約 15 分鐘免費諮詢",
    seeHow: "看它怎麼運作",
    painEyebrow: "是不是很熟悉？",
    painTitle: "你的公司，是不是也這樣？",
    painIntro:
      "多數台灣中小企業，關鍵經驗都在幾個資深員工的腦袋裡。人一走，三十年的眉角也跟著走出門。",
    pain: [
      { title: "重複問題耗掉大把時間", desc: "員工每天花好幾個小時，回答重複的客戶問題。" },
      { title: "報價靠感覺", desc: "報價靠某個人的直覺，那把尺只在他心裡。" },
      { title: "工單靠記憶", desc: "每張單走到哪靠記憶，不是靠紀錄，難免出錯漏單。" },
      { title: "老師傅退休帶走經驗", desc: "老師傅一退休，數十年的眉角跟著走出門。" },
      { title: "找不到人，也留不住", desc: "缺工的時代，找不到人，也留不住經驗。" },
      { title: "知識散落各處", desc: "SOP、LINE 對話、報價單、筆記，沒有一個能查得到的地方。" },
    ],
    whatEyebrow: "AI 掌櫃是什麼",
    whatTitle: "一個資料中樞，驅動整個營運。",
    whatBody:
      "AI 掌櫃把公司的知識（SOP、規範、報價邏輯、客戶眉角）整理成一個公司永遠擁有、越用越聰明的資料中樞。資料建一次，下面每個模組都能用。",
    modulesEyebrow: "六大模組，一個資料中樞",
    modulesTitle: "同一份資料，驅動整個營運。",
    modules: [
      { title: "知識管理", desc: "老師傅的經驗變成問得到、找得到的資產，有答案，也有出處（文件・章節・頁碼）。" },
      { title: "AI 知識助理", desc: "員工內部查詢 SOP 與規範，新人上手更快，不用一直問資深同事。" },
      { title: "AI 客服", desc: "在 LINE 上 24 小時回答客戶，交期、規格、收檔規範，即問即答。" },
      { title: "AI 報價", desc: "依尺寸、材質、數量，幾分鐘產出報價建議。報價的那把尺，不再只在一個人心裡。" },
      { title: "工單／生產管理", desc: "每一張單的狀態一目瞭然，列印中、待補件、已完成。" },
      { title: "AI 數據分析", desc: "毛利、效率、熱門品項，老闆隨時看得見，決策有依據。" },
    ],
    demoEyebrow: "實際看一下",
    demoTitle: "客戶和員工，實際看到的樣子。",
    chat1: "老闆，500 張 A3 海報，什麼時候可以交？",
    chat2: "您好！500 張 A3 海報約 3 個工作天。今天下午 3 點前傳檔，週四可以出貨。",
    chat2cite: "出自：報價與交期表 p.2",
    chat3: "那檔案規格呢？",
    chat4: "PDF 或 AI 檔，300dpi，含 3mm 出血。需要我把收檔清單傳給您嗎？",
    chatCaption: "LINE AI 客服 · 24/7 · 每個答案都有出處",
    quoteInLabel: "你輸入",
    quoteItems: ["尺寸 · A3", "材質 · 150g 銅版紙", "數量 · 500"],
    quoteOutLabel: "AI 報價建議",
    quoteAmt: "NT$ 6,800 – 7,400",
    quoteBasis: "依據 14 張類似歷史報價 · 標準毛利 32%",
    quoteCaption: "AI 報價 · 幾分鐘，不是幾天 · 那把尺是你的",
    brainEyebrow: "不只是聊天機器人",
    brainTitle: "一般 chatbot 只是回話；AI 掌櫃是營運大腦。",
    brainBody:
      "答案來自你公司自己的資料，附上出處可以驗證；同一份資料中樞，同時支撐客服、報價、工單與分析，建一次，處處能用。而且資產是你的，不會跟著任何人離職。",
    stepsEyebrow: "導入方式",
    stepsTitle: "三步驟，順利上線。",
    steps: [
      { when: "1–2 週", title: "收錄", desc: "把現有文件、筆記、LINE 對話紀錄與報價單整理收錄，不需要改變現有工作習慣。" },
      { when: "建檔", title: "建立資料中樞", desc: "AI 整理成公司專屬的資料中樞，敏感資料隔離，權限分級。" },
      { when: "應用", title: "開始應用", desc: "從最有感的模組開始，多數客戶從 LINE 客服或知識查詢起步，再逐步打開報價、工單與分析。" },
    ],
    proofStat1: "重複性客戶問題自動處理，實證數據",
    proofStat2: "客服回應，24 小時不間斷",
    proofLine: "同樣的團隊，更大的產能。一個人都不少。",
    subsidyEyebrow: "政府補助",
    subsidyTitle: "政府補助，有機會幫你付大部分的錢。",
    subsidyBody:
      "台灣中小企業其實有很多補助資源。預約諮詢時，我們免費評估貴公司符合哪些補助、協助規劃申請，導入成本有機會大部分由補助支應。",
    subsidyCta: "免費補助健檢",
    grants: [
      { name: "數位轉型補助 · 30 人以下製造業", amt: "最高 10 萬" },
      { name: "經濟部雲市集 TCloud 點數", amt: "3 萬" },
      { name: "SBIR 小型企業創新研發計畫", amt: "依方案" },
    ],
    whoEyebrow: "適合誰",
    whoTitle: "為靠經驗吃飯的企業而生。",
    whoBody:
      "只要公司有老師傅、有重複的客戶問題、有靠感覺的報價，AI 掌櫃就派得上用場。不需要 IT 部門，也不需要換掉現有系統。",
    industries: ["印刷", "製造", "加工", "貿易", "批發", "服務業"],
  },
};

const moduleImgs = [
  "/visuals/product-knowledge-ai.png",
  "/visuals/zg-module-assistant.png",
  "/visuals/product-customer-ai.png",
  "/visuals/zg-module-quoting.png",
  "/visuals/zg-module-workorders.png",
  "/visuals/zg-module-analytics.png",
];

export default function AiZhangguiPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = content[locale];
  const base = `/${locale}`;

  return (
    <main>
      <section className="zg-hero">
        <div className="wrap zg-hero-grid">
          <div>
            <span className="eyebrow">{t.eyebrow}</span>
            <h1>{t.title}</h1>
            <p className="lead">{t.lead}</p>
            <div className="hero-cta">
              <a href={`${base}/contact?p=ai-zhanggui`} className="btn btn-primary">{t.cta} <span className="chev">›</span></a>
              <Link href="#modules" className="btn btn-ghost">{t.seeHow}</Link>
            </div>
          </div>
          <div className="zg-lantern">
            <Image
              src="/visuals/zg-hero-lantern.png"
              alt="AI 掌櫃 — the shopkeeper's lantern holding your company's data hub"
              width={558}
              height={803}
              priority
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </section>

      <section className="block pd-features">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.painEyebrow}</span>
            <h2>{t.painTitle}</h2>
            <p>{t.painIntro}</p>
          </div>
          <div className="feat-grid">
            {t.pain.map((p: Item, i: number) => (
              <div className="feat" key={i}><h3>{p.title}</h3><p>{p.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="who-band" style={{ background: "linear-gradient(160deg,#f3f1ff,#fff)", color: "var(--ink)", border: "1px solid #d9d3ff" }}>
            <span className="eyebrow">{t.whatEyebrow}</span>
            <h2 style={{ color: "var(--ink)", fontSize: "clamp(1.7rem,3.2vw,2.4rem)", margin: "14px 0 12px" }}>{t.whatTitle}</h2>
            <p style={{ color: "var(--muted)", fontFamily: "var(--font-plex)", fontWeight: 400, fontSize: "1.08rem" }}>{t.whatBody}</p>
            <div className="zg-hub-img">
              <Image
                src="/visuals/zg-hub-wide.png"
                alt="Your shop's documents, chats and sheets flowing into one company data hub"
                width={2048}
                height={1037}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="modules" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.modulesEyebrow}</span>
            <h2>{t.modulesTitle}</h2>
          </div>
          <div className="feat-grid">
            {t.modules.map((m: Item, i: number) => (
              <div className="feat zg-mod" key={i}>
                <div className="zg-mod-img">
                  <Image
                    src={moduleImgs[i]}
                    alt={m.title}
                    width={620}
                    height={520}
                    style={{ width: "64%", height: "auto" }}
                  />
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="demo" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.demoEyebrow}</span>
            <h2>{t.demoTitle}</h2>
          </div>
          <div className="zg-demo-grid">
            <div>
              <div className="line-phone">
                <div className="line-head">
                  <span className="line-avatar">掌</span>
                  <span className="line-name">AI 掌櫃<span className="line-status">online · 24/7</span></span>
                </div>
                <div className="line-body">
                  <div className="msg in">{t.chat1}</div>
                  <div className="msg out">{t.chat2}<span className="cite">{t.chat2cite}</span></div>
                  <div className="msg in">{t.chat3}</div>
                  <div className="msg out">{t.chat4}</div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.chatCaption}</p>
            </div>
            <div>
              <div className="quote-flow">
                <div className="quote-card">
                  <div className="qc-label">{t.quoteInLabel}</div>
                  <ul>
                    {t.quoteItems.map((q, i) => (<li key={i}>{q}</li>))}
                  </ul>
                </div>
                <div className="quote-arrow">↓</div>
                <div className="quote-card out">
                  <div className="qc-label">{t.quoteOutLabel}</div>
                  <div className="qc-amt">{t.quoteAmt}</div>
                  <div className="qc-basis">{t.quoteBasis}</div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.quoteCaption}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block arch">
        <div className="wrap">
          <span className="eyebrow">{t.brainEyebrow}</span>
          <h2>{t.brainTitle}</h2>
          <p>{t.brainBody}</p>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.stepsEyebrow}</span>
            <h2>{t.stepsTitle}</h2>
          </div>
          <div className="steps">
            {t.steps.map((s, i) => (
              <div className="step" key={i}>
                <div className="n">{`0${i + 1}`}</div>
                <div className="when">{s.when}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="zg-proof">
            <div className="stats">
              <div><b>70%+</b><span>{t.proofStat1}</span></div>
              <div><b>24/7</b><span>{t.proofStat2}</span></div>
            </div>
            <div className="line">{t.proofLine}</div>
          </div>
        </div>
      </section>

      <section className="block subsidy">
        <div className="wrap subsidy-grid">
          <div>
            <span className="eyebrow">{t.subsidyEyebrow}</span>
            <div style={{ marginTop: 18 }}>
              {t.grants.map((g, i) => (
                <div className="grant" key={i}>
                  <span className="name">{g.name}</span>
                  <span className="amt">{g.amt}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: "clamp(1.7rem,3.2vw,2.3rem)", marginBottom: 12 }}>{t.subsidyTitle}</h2>
            <p style={{ color: "var(--muted)", marginBottom: 20 }}>{t.subsidyBody}</p>
            <a href={`${base}/contact?p=ai-zhanggui`} className="btn btn-primary">{t.subsidyCta} <span className="chev">›</span></a>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="who-band">
            <span className="eyebrow">{t.whoEyebrow}</span>
            <p>{t.whoBody}</p>
            <div className="who-tags">
              {t.industries.map((x, i) => (<span key={i}>{x}</span>))}
            </div>
            <a href={`${base}/contact?p=ai-zhanggui`} className="btn btn-light" style={{ marginTop: 24 }}>{t.cta} <span className="chev">›</span></a>
          </div>
        </div>
      </section>
    </main>
  );
}
TSX

echo "→ appending AI 掌櫃 styles to src/app/globals.css"
python3 - <<'PY'
import io
css_path = "src/app/globals.css"
css = io.open(css_path, encoding="utf-8").read()
if ".zg-demo-grid" not in css:
    css += """

/* ── AI 掌櫃 visuals & demos ────────────────────────── */
.zg-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center;text-align:left}
.zg-hero-grid .eyebrow{justify-content:flex-start}
.zg-hero-grid h1{margin-left:0;margin-right:0}
.zg-hero-grid .lead{margin-left:0;margin-right:0}
.zg-hero-grid .hero-cta{justify-content:flex-start}
.zg-lantern{display:flex;justify-content:center}
.zg-lantern img{width:100%;max-width:380px;height:auto;filter:drop-shadow(0 34px 54px rgba(61,44,224,.22));animation:heroFloat 7s ease-in-out infinite}
@media(max-width:860px){.zg-hero-grid{grid-template-columns:1fr;text-align:center}.zg-hero-grid .eyebrow{justify-content:center}.zg-hero-grid h1,.zg-hero-grid .lead{margin-left:auto;margin-right:auto}.zg-hero-grid .hero-cta{justify-content:center}.zg-lantern img{max-width:240px;margin:0 auto}}
.zg-hub-img{margin-top:26px;border-radius:16px;overflow:hidden;border:1px solid #d9d3ff}
.zg-hub-img img{width:100%;height:auto;display:block}
.feat.zg-mod{padding:0;overflow:hidden}
.zg-mod-img{background:radial-gradient(120% 110% at 50% 0%,#f3f1ff 0%,#ffffff 72%);border-bottom:1px solid var(--line);padding:26px 20px 6px;display:flex;justify-content:center}
.zg-mod-img img{display:block;transition:transform .35s ease}
.feat.zg-mod:hover .zg-mod-img img{transform:translateY(-4px) scale(1.02)}
.feat.zg-mod h3{margin:18px 22px 0}
.feat.zg-mod p{margin:8px 22px 22px}
.zg-demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start}
@media(max-width:900px){.zg-demo-grid{grid-template-columns:1fr}}
.zg-demo-cap{margin-top:16px;font-family:var(--font-plex-mono);font-size:.7rem;letter-spacing:.07em;color:var(--muted);text-align:center}
.line-phone{max-width:380px;margin:0 auto;background:#8ba3c7;border-radius:28px;border:1px solid var(--line);box-shadow:0 24px 60px rgba(14,17,22,.10);overflow:hidden}
.line-head{display:flex;align-items:center;gap:10px;background:#fff;padding:12px 16px;border-bottom:1px solid rgba(14,17,22,.08)}
.line-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--iris),var(--iris-bright));color:#fff;display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:700;flex:none}
.line-name{font-weight:600;font-size:.92rem;display:flex;flex-direction:column;line-height:1.2}
.line-status{font-family:var(--font-plex-mono);font-size:.62rem;color:var(--live);letter-spacing:.05em}
.line-body{padding:20px 14px 22px;display:flex;flex-direction:column;gap:10px}
.msg{max-width:84%;padding:10px 13px;border-radius:14px;font-size:.88rem;line-height:1.5}
.msg.in{align-self:flex-start;background:#fff;border:1px solid rgba(14,17,22,.08);border-top-left-radius:4px}
.msg.out{align-self:flex-end;background:#d9f4e3;border:1px solid #bfe8cd;border-top-right-radius:4px}
.msg .cite{display:block;margin-top:7px;font-size:.68rem;color:var(--iris);font-family:var(--font-plex-mono)}
.quote-flow{display:flex;flex-direction:column;gap:12px;max-width:440px;margin:0 auto;width:100%}
.quote-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px 22px;box-shadow:0 12px 34px rgba(14,17,22,.05)}
.qc-label{font-family:var(--font-plex-mono);font-size:.66rem;letter-spacing:.12em;color:var(--muted);margin-bottom:12px}
.quote-card ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px}
.quote-card li{font-size:.92rem;display:flex;align-items:center;gap:9px}
.quote-card li::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--iris-bright);flex:none}
.quote-arrow{text-align:center;color:var(--iris);font-size:1.25rem;line-height:1}
.quote-card.out{border-color:#c7bdfc;background:linear-gradient(160deg,#f6f4ff,#fff)}
.qc-amt{font-family:var(--font-bricolage);font-weight:700;font-size:1.85rem;color:var(--iris);letter-spacing:-.01em}
.qc-basis{margin-top:8px;font-size:.82rem;color:var(--muted)}
"""
    io.open(css_path, "w", encoding="utf-8").write(css)
    print(f"  {css_path}: styles appended")
else:
    print(f"  {css_path}: styles already present, skipped")
PY

echo ""
echo "DONE. Next:  npm run build  &&  git add -A && git commit -m 'AI 掌櫃 page: lantern hero, hub visual, module images, LINE + quoting demos' && git push"
