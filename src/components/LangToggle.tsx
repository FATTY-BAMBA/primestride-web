"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n";

export default function LangToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(en|zh)/, "") || "";
  const label: Record<Locale, string> = { en: "EN", zh: "中" };

  return (
    <div className="lang">
      {locales.map((l) => (
        <Link key={l} href={`/${l}${rest}`} className={l === locale ? "on" : ""}>
          {label[l]}
        </Link>
      ))}
    </div>
  );
}
