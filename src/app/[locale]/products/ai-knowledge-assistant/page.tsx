import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "AI Knowledge Assistant · AI 知識助理 · PrimeStride AI",
  description:
    "Every answer cited to the exact SOP page: natural-language Q&A over your documents, role-based access, onboarding mode, and a weekly coverage score.",
};

const content = {
  en: {
    back: "← All products",
    pillar: "跨 · Cross-pillar",
    live: "LIVE",
    name: "AI Knowledge Assistant",
    zhName: "AI 知識助理 · Internal Knowledge",
    tagline: "Every answer cited to the exact SOP page.",
    cta: "Book a consult",
    ovEyebrow: "Overview",
    ov1: "The shared internal knowledge layer every product draws on. Employees ask the way they'd ask a colleague and get answers straight from your SOPs — with the exact document, section, and page cited, auditable in one click.",
    ov2: "New hires self-serve from day one instead of interrupting seniors, and a weekly coverage score tells you how much of what your team asks the knowledge base can confidently answer.",
    chips: ["Word & PDF, visuals indexed too", "Role-based access", "Gap alert after 3+ low-confidence hits", "Weekly coverage score"],
    flowEyebrow: "How it works",
    flowTitle: "Scattered knowledge in. Cited answers out.",
    flowBody: "Handbooks, SOPs, PDFs, flowcharts — everything gets indexed into one layer with role-based access. Questions come back with answers and receipts: the exact document, section, and page.",
    demoEyebrow: "See it in action",
    demoTitle: "What employees ask — and what admins see.",
    chatTitle: "知識助理",
    chatSub: "role: 業務部 · SOPs indexed",
    st1: "What's the hotel budget cap for domestic business trips?",
    ai1: "NT$2,400 per night, NT$3,000 in special municipalities.",
    ai1cite: "Source: Travel Policy §4.2 · p.3",
    st2: "And for overseas trips?",
    ai2: "Tiered by region: NT$4,500 for major Asian cities, NT$6,000 for Europe and the Americas.",
    ai2cite: "Source: Travel Policy §4.3 · p.4",
    ai2meta: "20-turn memory",
    chatCaption: "Employee side · ask like a colleague, get the SOP page",
    covTitle: "Coverage report",
    covSub: "THIS WEEK",
    covBig: "87%",
    covLabel: "of team questions answered confidently",
    srcHead: "INDEXED SOURCES",
    rows: [
      { k: "SOP manuals", v: "42" },
      { k: "PDF documents", v: "136" },
      { k: "Flowcharts & diagrams", v: "58" },
    ],
    gapAlert: "“Approval authority limits” hit low confidence 3 times — the document owner has been notified.",
    gapFix: "→ Suggested: upload the 2026 approval-authority table",
    covCaption: "Admin side · you always know what the base can and can't answer",
    featEyebrow: "Key features",
    featTitle: "Stop interrupting the senior people.",
    feats: [
      { t: "Natural-language Q&A", d: "Employees ask the way they'd ask a colleague, answers come from your SOPs." },
      { t: "Source-cited answers", d: "Every answer cites the exact document, section, and page, auditable in one click." },
      { t: "Word & PDF ingestion", d: "Upload manuals and policies; diagrams and flowcharts are indexed alongside text." },
      { t: "Role-based access", d: "HR sees HR docs and the factory sees factory SOPs, so sensitive policies stay protected." },
      { t: "Onboarding mode", d: "New hires walk through real company SOPs from day one, self-service." },
      { t: "Coverage score", d: "A weekly score shows what share of employee questions the base can answer." },
    ],
    whoEyebrow: "Who it's for",
    whoBody: "Companies where employees keep interrupting managers, where critical knowledge lives only in senior staff's heads, and where onboarding drags on for weeks.",
  },
  zh: {
    back: "← 全部產品",
    pillar: "跨 · 跨域",
    live: "LIVE",
    name: "AI Knowledge Assistant",
    zhName: "AI 知識助理 · Internal Knowledge",
    tagline: "每個答案都引用到 SOP 的確切頁碼。",
    cta: "預約諮詢",
    ovEyebrow: "總覽",
    ov1: "每項產品共用的內部知識層。員工像問同事一樣提問，直接從你的 SOP 得到答案——並附上確切的文件、章節與頁碼，一鍵即可稽核。",
    ov2: "新人第一天起就能自助查詢，不必打斷資深同事；每週覆蓋率評分則告訴你，知識庫能有把握回答團隊多少提問。",
    chips: ["Word 與 PDF，圖表一併索引", "角色權限管控", "3 次低信心即通報缺口", "每週覆蓋率評分"],
    flowEyebrow: "怎麼運作",
    flowTitle: "散落的知識進來，附出處的答案出去。",
    flowBody: "手冊、SOP、PDF、流程圖，全部以角色權限索引進同一層知識。問題回來時帶著答案，也帶著收據：確切的文件、章節與頁碼。",
    demoEyebrow: "實際看一下",
    demoTitle: "員工問的，和管理者看到的。",
    chatTitle: "知識助理",
    chatSub: "角色：業務部 · 已索引 SOP",
    st1: "國內出差的住宿上限是多少？",
    ai1: "每晚 NT$2,400，直轄市 NT$3,000。",
    ai1cite: "出自：差旅管理辦法 §4.2 · p.3",
    st2: "那國外出差呢？",
    ai2: "依地區分級：亞洲主要城市 NT$4,500，歐美 NT$6,000。",
    ai2cite: "出自：差旅管理辦法 §4.3 · p.4",
    ai2meta: "20 輪對話記憶",
    chatCaption: "員工端 · 像問同事一樣問，拿到 SOP 頁碼",
    covTitle: "覆蓋率報告",
    covSub: "本週",
    covBig: "87%",
    covLabel: "團隊提問能被有把握回答的比例",
    srcHead: "已索引來源",
    rows: [
      { k: "SOP 手冊", v: "42" },
      { k: "PDF 文件", v: "136" },
      { k: "流程圖與圖表", v: "58" },
    ],
    gapAlert: "「簽核權限上限」3 次低信心回答——已通知文件管理者。",
    gapFix: "→ 建議：上傳 2026 簽核權限表",
    covCaption: "管理端 · 永遠知道知識庫答得出什麼、答不出什麼",
    featEyebrow: "核心功能",
    featTitle: "別再打斷資深同事。",
    feats: [
      { t: "自然語言問答", d: "員工像問同事一樣提問，答案來自你的 SOP。" },
      { t: "附出處作答", d: "每個答案引用確切文件、章節與頁碼，一鍵即可稽核。" },
      { t: "Word 與 PDF 接入", d: "上傳手冊與規範，圖表與流程圖與文字一併索引。" },
      { t: "角色權限", d: "人資看人資文件、廠務看廠務 SOP，敏感政策受保護。" },
      { t: "到職模式", d: "新人第一天起透過真實公司 SOP 自助上手。" },
      { t: "覆蓋率評分", d: "每週評分顯示知識庫能回答多少比例的員工提問。" },
    ],
    whoEyebrow: "適合誰",
    whoBody: "員工不斷打斷主管詢問、關鍵知識只存在資深員工腦中、新人到職要花數週的企業。",
  },
};

export default function KnowledgeAssistantPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = content[locale];
  const base = `/${locale}`;

  return (
    <main>
      <section className="zg-hero">
        <div className="wrap zg-hero-grid">
          <div>
            <Link href={`${base}/products`} className="pd-back">{t.back}</Link>
            <div className="pd-tags" style={{ marginTop: 14 }}>
              <span className="pill-tag">{t.pillar}</span>
              <span className="badge-live">{t.live}</span>
            </div>
            <h1>{t.name}</h1>
            <div className="zh" style={{ fontSize: "1.15rem", color: "var(--iris)", fontWeight: 600, marginTop: 6 }}>{t.zhName}</div>
            <p className="lead" style={{ marginTop: 16 }}>{t.tagline}</p>
            <div className="hero-cta">
              <Link href={`${base}/contact?p=ai-knowledge-assistant`} className="btn btn-primary">{t.cta} <span className="chev">›</span></Link>
            </div>
          </div>
          <div className="zg-lantern">
            <Image src="/visuals/product-knowledge-ai.png" alt="AI Knowledge Assistant — answers with cited sources" width={917} height={777} priority style={{ width: "100%", height: "auto" }} />
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="sec-head" style={{ textAlign: "left", marginBottom: 22 }}>
            <span className="eyebrow" style={{ justifyContent: "flex-start" }}>{t.ovEyebrow}</span>
          </div>
          <div style={{ maxWidth: 780 }}>
            <p style={{ fontSize: "1.12rem", color: "var(--ink)", marginBottom: 14 }}>{t.ov1}</p>
            <p style={{ fontSize: "1.05rem", color: "var(--muted)" }}>{t.ov2}</p>
            <div className="edu-chips">{t.chips.map((c, i) => (<span className="edu-chip" key={i}>{c}</span>))}</div>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="who-band" style={{ background: "linear-gradient(160deg,#f3f1ff,#fff)", color: "var(--ink)", border: "1px solid #d9d3ff" }}>
            <span className="eyebrow">{t.flowEyebrow}</span>
            <h2 style={{ color: "var(--ink)", fontSize: "clamp(1.7rem,3.2vw,2.4rem)", margin: "14px 0 12px" }}>{t.flowTitle}</h2>
            <p style={{ color: "var(--muted)", fontFamily: "var(--font-plex)", fontWeight: 400, fontSize: "1.06rem" }}>{t.flowBody}</p>
            <div className="zg-hub-img">
              <Image src="/visuals/knowledge-flow-wide.png" alt="Scattered documents gathered into one knowledge hub, answers flowing out with citations" width={2048} height={1037} style={{ width: "100%", height: "auto" }} />
            </div>
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
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.chatTitle}</span>
                  <span className="edu-panel-sub">{t.chatSub}</span>
                </div>
                <div className="edu-chat">
                  <div className="edu-msg st">{t.st1}</div>
                  <div className="edu-msg ai">{t.ai1}<span className="cite">{t.ai1cite}</span></div>
                  <div className="edu-msg st">{t.st2}</div>
                  <div className="edu-msg ai">{t.ai2}<span className="cite">{t.ai2cite}</span><span className="meta">{t.ai2meta}</span></div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.chatCaption}</p>
            </div>
            <div>
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.covTitle}</span>
                  <span className="edu-panel-sub">{t.covSub}</span>
                </div>
                <div className="edu-dash">
                  <div className="kn-cov">
                    <b>{t.covBig}</b>
                    <span>{t.covLabel}</span>
                  </div>
                  <div className="edu-gaphead">{t.srcHead}</div>
                  {t.rows.map((r, i) => (
                    <div className="pl-row" key={i}>
                      <span className="pl-k">{r.k}</span>
                      <b className="pl-v">{r.v}</b>
                    </div>
                  ))}
                  <div className="edu-risk">
                    <span>{t.gapAlert}</span><span className="flag">GAP</span>
                  </div>
                  <div className="ca-gap-fix" style={{ marginTop: 0 }}>{t.gapFix}</div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.covCaption}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.featEyebrow}</span>
            <h2>{t.featTitle}</h2>
          </div>
          <div className="feat-grid">
            {t.feats.map((f, i) => (<div className="feat" key={i}><h3>{f.t}</h3><p>{f.d}</p></div>))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="who-band">
            <span className="eyebrow">{t.whoEyebrow}</span>
            <p>{t.whoBody}</p>
            <Link href={`${base}/contact?p=ai-knowledge-assistant`} className="btn btn-light" style={{ marginTop: 24 }}>{t.cta} <span className="chev">›</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
