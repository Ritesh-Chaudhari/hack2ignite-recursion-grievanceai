import type { Locale } from "./i18n";

/**
 * Translation data loaded lazily.
 * Separated from the main i18n.ts so the ~600 lines of translation text
 * are only fetched when actually needed, not bundled into every page.
 */
const translationModules: Record<Locale, () => Promise<Record<string, string>>> = {
  en: () => import("./translations/en.json").then((m) => m.default),
  hi: () => import("./translations/hi.json").then((m) => m.default),
  mr: () => import("./translations/mr.json").then((m) => m.default),
};

// In-memory cache so we only load each locale once.
const cache: Partial<Record<Locale, Record<string, string>>> = {};

/**
 * Load translations for a locale (cached after first load).
 */
export async function loadTranslations(locale: Locale): Promise<Record<string, string>> {
  if (cache[locale]) return cache[locale]!;
  const translations = await translationModules[locale]();
  cache[locale] = translations;
  return translations;
}

/**
 * Synchronous fallback for SSR / initial render — returns empty object.
 * Translations are hydrated on the client after lazy load.
 */
export function getTranslationsSync(locale: Locale): Record<string, string> {
  return cache[locale] ?? {};
}
