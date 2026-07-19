import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Pulse · 脈動 · AI 智慧行銷 · PrimeStride AI",
  description:
    "Run Meta & Google ads from LINE: commands execute in seconds, 24/7 budget protection, creative-fatigue alerts, competitor intelligence, and one consolidated report every Monday morning.",
};

const content = {
  en: {
    back: "← All products",
    pillar: "銷 · Marketing",
    live: "LIVE",
    name: "Pulse · 脈動",
    zhName: "AI 智慧行銷 · Marketing Intelligence",
    tagline: "Run Meta & Google ads from LINE.",
    cta: "Book a consult",
    ovEyebrow: "Overview",
    ov1: "Pulse puts marketing control inside LINE: send a message and it executes in Meta or Google Ads within seconds.",
    ov2: "It watches your budgets around the clock and pauses campaigns when CPC spikes, warns you about creative fatigue before ROAS drops, and consolidates every channel into one report that lands automatically every Monday morning — so you stop babysitting dashboards.",
    chips: ["Commands execute in seconds", "24/7 budget protection", "One report, Monday 8am", "Meta + Google Ads"],
    flowEyebrow: "How it works",
    flowTitle: "Every channel in. One pulse out.",
    flowBody: "Meta, Google, GA, CRM and email flow into one watchful hub. You talk to it in LINE like a colleague — it executes, guards the budget while you sleep, and tells you what matters before it costs you.",
    demoEyebrow: "
