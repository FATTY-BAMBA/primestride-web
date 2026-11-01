import Link from "next/link";
import ProductHero from "@/components/ProductHero";
import ProductJourney from "@/components/ProductJourney";
import "../product-detail.css";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "EduSense AI · 教育智慧平台 · PrimeStride AI",
  description:
    "EduSense AI turns recorded classes into learning intelligence: student classification, knowledge-gap dashboards, dropout prediction, and an AI TA that answers with video timestamps.",
};

const content = {
  en: {
    back: "← All products",
    pillar: "發 · Talent",
    live: "LIVE",
    name: "EduSense AI",
    zhName: "教育智慧平台 · Learning Intelligence",
    tagline: "Understand how students learn, not just whether they passed.",
    cta: "Book a consult",
    ovEyebrow: "Overview",
    ov1: "EduSense AI ingests educational video and recorded classes and turns them into a structured intelligence layer for students, teachers, and administrators.",
    ov2: "On top of the pipeline sits real insight: it classifies which students are thriving and which need urgent support, surfaces the exact knowledge gaps a class shares, and predicts dropout risk early enough to do something about it.",
    chips: ["9-stage processing pipeline", "Per-institution data isolation", "10-turn conversation memory", "Traditional Chinese native"],
    pipeEyebrow: "How it works",
    pipeTitle: "From raw class content to intelligence.",
    pipeBody: "Nine stages, fully automatic: ingest, transcribe, chapter, notes, question bank, embed, classify, gap analysis, risk flagging. No manual tagging, no extra work for teachers.",
    demoEyebrow: "See it in action",
    demoTitle: "What students and teachers actually see.",
    taTitle: "EduSense 助教",
    taSub: "AI TA · answers with timestamps",
    st1: "Which stage of photosynthesis actually makes ATP?",
    ai1: "ATP is made in the light reactions, across the thylakoid membrane — the teacher explained it with the electron transport chain diagram.",
    ai1cite: "Source: Biology Ch.4 · 12:36",
    st2: "So how is that different from the Calvin cycle?",
    ai2: "The Calvin cycle builds sugar but doesn't make ATP — it spends the ATP that the light reactions produced.",
    ai2cite: "Source: Biology Ch.4 · 18:02",
    taCaption: "AI teaching assistant · answers from the teacher's real class content, with video timestamps",
    dashTitle: "Class pulse",
    dashSub: "WEEK 7 · BIOLOGY",
    gapHead: "Class mastery by topic",
    gaps: [
      { name: "Light reactions", pct: 84, level: "ok" },
      { name: "Calvin cycle", pct: 61, level: "warn" },
      { name: "Electron transport chain", pct: 47, level: "warn" },
    ],
    gapNote: "2 topics below mastery threshold — reteach suggested",
    classes: [
      { n: 18, label: "Learning well", cls: "ok" },
      { n: 7, label: "Needs attention", cls: "warn" },
      { n: 3, label: "Urgent support", cls: "urgent" },
    ],
    riskName: "S. Wang",
    riskDesc: "no login for 7 days · interaction depth dropping",
    riskFlag: "HIGH RISK",
    dashCaption: "Knowledge-gap dashboard · see exactly where the whole class is stuck",
    featEyebrow: "Key features",
    featTitle: "Understand how students learn, not just whether they passed.",
    feats: [
      { t: "Smart chaptering", d: "Automatically splits class video into natural, topic-based chapters." },
      { t: "Auto notes & Q&A bank", d: "Generates concise lecture notes and review questions from class content." },
      { t: "AI teaching assistant", d: "Answers from the teacher's real class content, with video timestamps." },
      { t: "Student classification", d: "Sorts students into learning-well, needs-attention, or needs-urgent-support." },
      { t: "Knowledge gap dashboard", d: "Shows unmastered points and repeatedly-asked topics so teachers can adjust." },
      { t: "Dropout prediction", d: "Login frequency and interaction depth flag at-risk students early." },
    ],
    whoEyebrow: "Who it's for",
    whoBody: "Universities, vocational schools, cram schools, and corporate training departments that need to understand how students are learning, not just whether they passed.",
  },
  zh: {
    back: "← 全部產品",
    pillar: "發 · 教育",
    live: "LIVE",
    name: "EduSense AI",
    zhName: "教育智慧平台 · Learning Intelligence",
    tagline: "看懂學生怎麼學，而不只是考過沒有。",
    cta: "預約諮詢",
    ovEyebrow: "總覽",
    ov1: "EduSense AI 匯入教學影片與錄影課程，轉化成給學生、老師與管理者使用的結構化智慧層。",
    ov2: "在管線之上是真正的洞察：分辨哪些學生學得好、哪些需要立即支援；找出全班共同的知識缺口；並在輟學風險還來得及處理時，就提早預警。",
    chips: ["九段式處理管線", "各校資料獨立隔離", "十輪對話記憶", "繁體中文原生"],
    pipeEyebrow: "怎麼運作",
    pipeTitle: "從原始教材，到教學智慧。",
    pipeBody: "九段管線全自動：匯入、轉寫、切章、筆記、題庫、向量化、分類、缺口分析、風險標記。不用人工標註，不增加老師負擔。",
    demoEyebrow: "實際看一下",
    demoTitle: "學生和老師，實際看到的樣子。",
    taTitle: "EduSense 助教",
    taSub: "AI 助教 · 回答附時間點",
    st1: "光合作用到底哪個階段在製造 ATP？",
    ai1: "ATP 在光反應階段、類囊體膜上產生，老師是用電子傳遞鏈的圖講解的。",
    ai1cite: "出自：生物 Ch.4 · 12:36",
    st2: "那跟卡爾文循環差在哪？",
    ai2: "卡爾文循環合成糖，但不製造 ATP——它消耗的是光反應產生的 ATP。",
    ai2cite: "出自：生物 Ch.4 · 18:02",
    taCaption: "AI 助教 · 從老師真實的課程內容回答，附上影片時間點",
    dashTitle: "班級學習狀態",
    dashSub: "第 7 週 · 生物",
    gapHead: "全班精熟度（按主題）",
    gaps: [
      { name: "光反應", pct: 84, level: "ok" },
      { name: "卡爾文循環", pct: 61, level: "warn" },
      { name: "電子傳遞鏈", pct: 47, level: "warn" },
    ],
    gapNote: "2 個主題低於精熟門檻，建議安排重教",
    classes: [
      { n: 18, label: "學習良好", cls: "ok" },
      { n: 7, label: "需要關注", cls: "warn" },
      { n: 3, label: "急需支援", cls: "urgent" },
    ],
    riskName: "王同學",
    riskDesc: "7 天未登入 · 互動深度持續下降",
    riskFlag: "高風險",
    dashCaption: "知識缺口儀表板 · 全班卡在哪裡，一眼看清",
    featEyebrow: "核心功能",
    featTitle: "看懂學生怎麼學，而不只是考過沒有。",
    feats: [
      { t: "智慧章節切分", d: "自動把課程影片切成自然的主題章節。" },
      { t: "自動筆記與題庫", d: "從課程內容生成重點筆記與複習題。" },
      { t: "AI 助教", d: "用老師真實的課程內容回答，附上影片時間點。" },
      { t: "學生分類", d: "分成學習良好、需要關注、急需支援。" },
      { t: "知識缺口儀表板", d: "顯示未精熟與反覆提問的知識點，老師即時調整。" },
      { t: "輟學預警", d: "登入頻率與互動深度，提早標記高風險學生。" },
    ],
    whoEyebrow: "適合誰",
    whoBody: "大學、科技大學、補習班與企業培訓部門——需要看懂學生怎麼學，而不只是考過沒有的地方。",
  },
};

export default function EduSensePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = content[locale];
  const base = `/${locale}`;

  return (
    <main className="product-page" lang={locale === "zh" ? "zh-Hant" : "en"}>
      <ProductHero slug="edusense-ai" locale={locale} name={t.name} tagline={t.tagline} category={locale === "zh" ? t.zhName.split(" · ")[0] : t.zhName.split(" · ")[1]} />
      <nav className="product-subnav wrap" aria-label={locale === "zh" ? "產品頁導覽" : "On this page"}>
        <a href="#demo">{locale === "zh" ? "實際情境" : "In practice"}</a>
        <a href="#overview">{locale === "zh" ? "產品總覽" : "Overview"}</a>
        <a href="#workflow">{locale === "zh" ? "運作方式" : "How it works"}</a>
        <a href="#features">{locale === "zh" ? "核心功能" : "Capabilities"}</a>
      </nav>

      <section className="block product-demo" id="demo">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.demoEyebrow}</span>
            <h2>{t.demoTitle}</h2>
            <p className="product-demo-note">{locale === "zh" ? "產品畫面示例 · 以下皆為示範資料" : "Illustrative product views · Sample data"}</p>
          </div>
          <div className="zg-demo-grid">
            <div>
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.taTitle}</span>
                  <span className="edu-panel-sub">{t.taSub}</span>
                </div>
                <div className="edu-chat">
                  <div className="edu-msg st">{t.st1}</div>
                  <div className="edu-msg ai">{t.ai1}<span className="cite">{t.ai1cite}</span></div>
                  <div className="edu-msg st">{t.st2}</div>
                  <div className="edu-msg ai">{t.ai2}<span className="cite">{t.ai2cite}</span></div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.taCaption}</p>
            </div>
            <div>
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.dashTitle}</span>
                  <span className="edu-panel-sub">{t.dashSub}</span>
                </div>
                <div className="edu-dash">
                  <div className="edu-gaphead">{t.gapHead}</div>
                  {t.gaps.map((g, i) => (
                    <div className="gap-row" key={i}>
                      <span className="gap-name">{g.name}</span>
                      <span className="gap-pct">{g.pct}%</span>
                      <div className="gap-bar"><div className={`gap-fill ${g.level}`} style={{ width: `${g.pct}%` }}></div></div>
                    </div>
                  ))}
                  <div className="edu-gapnote">{t.gapNote}</div>
                  <div className="edu-classes">
                    {t.classes.map((c, i) => (
                      <div className={`edu-class ${c.cls}`} key={i}><b>{c.n}</b><span>{c.label}</span></div>
                    ))}
                  </div>
                  <div className="edu-risk">
                    <b>{t.riskName}</b><span>{t.riskDesc}</span><span className="flag">{t.riskFlag}</span>
                  </div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.dashCaption}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block product-overview" id="overview">
        <div className="wrap product-overview-grid">
          <div><span className="eyebrow">{t.ovEyebrow}</span><h2>{locale === "zh" ? "從日常工作，看見實際價值。" : "A practical place in your team’s day."}</h2></div>
          <div><p>{t.ov1}</p><p>{t.ov2}</p><div className="edu-chips">{t.chips.map(chip => <span className="edu-chip" key={chip}>{chip}</span>)}</div></div>
        </div>
      </section>

      <section className="block product-workflow" id="workflow">
        <div className="wrap">
          <div className="product-workflow-panel">
            <div className="product-workflow-heading"><div><span className="eyebrow">{t.pipeEyebrow}</span><h2>{t.pipeTitle}</h2></div><p>{t.pipeBody}</p></div>
            <ProductJourney slug="edusense-ai" locale={locale} />
          </div>
        </div>
      </section>

      <section className="block product-features" id="features">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.featEyebrow}</span>
            <h2>{t.featTitle}</h2>
          </div>
          <div className="feat-grid">
            {t.feats.map((f, i) => (
              <div className="feat" key={i}><span className="feature-number" aria-hidden="true">0{i + 1}</span><h3>{f.t}</h3><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="block product-fit" id="fit">
        <div className="wrap">
          <div className="who-band">
            <span className="eyebrow">{t.whoEyebrow}</span>
            <h2>{locale === "zh" ? "讓 " + t.name + " 走進你的工作流程。" : "See where " + t.name + " fits."}</h2>
            <p>{t.whoBody}</p>
            <Link href={`${base}/contact?p=edusense-ai`} className="btn btn-light" style={{ marginTop: 24 }}>{t.cta} <span className="chev">›</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
