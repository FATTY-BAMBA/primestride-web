import { notFound } from "next/navigation";
import { locales, isLocale, getDictionary, type Locale } from "@/i18n";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SetHtmlLang from "@/components/SetHtmlLang";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <SetHtmlLang locale={locale} />
      <Nav locale={locale} dict={dict} />
      {children}
      <Footer locale={locale} dict={dict} />
    </>
  );
}
