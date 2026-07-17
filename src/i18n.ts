import en from "@/dictionaries/en";
import zh from "@/dictionaries/zh";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries = { en, zh };

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
