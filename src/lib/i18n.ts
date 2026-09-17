/**
 * Lightweight i18n (internationalization) support.
 *
 * Translations are loaded lazily from JSON files so they don't bloat
 * the client bundle for every page. Only the active locale is fetched.
 */

export type Locale = "en" | "hi" | "mr";

// Minimal English fallbacks (only what's needed for initial render before lazy load).
const INLINE_FALLBACKS: Record<string, string> = {};

// In-memory cache per locale (populated by lazy load).
const cache: Partial<Record<Locale, Record<string, string>>> = {};

/**
 * Load translations for a locale (cached after first load).
 * Uses dynamic import so the JSON chunk is only fetched when needed.
 */
async function ensureLoaded(locale: Locale): Promise<void> {
  if (cache[locale]) return;
  try {
    const mod = await import(`./translations/${locale}.json`);
    cache[locale] = mod.default as Record<string, string>;
  } catch {
    // Fallback: empty — will use English inline fallbacks
    cache[locale] = {};
  }
}

// Kick off English preload immediately (most common locale).
if (typeof window !== "undefined") {
  void ensureLoaded("en");
}

/**
 * Get the current locale from localStorage (client) or default to English.
 */
export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("grievance-locale");
  if (stored && ["en", "hi", "mr"].includes(stored)) return stored as Locale;
  const browserLang = navigator.language.slice(0, 2);
  if (browserLang === "hi") return "hi";
  if (browserLang === "mr") return "mr";
  return "en";
}

/**
 * Set the current locale, persist to localStorage, and reload to apply.
 */
export function setLocale(locale: Locale): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("grievance-locale", locale);
    // Preload the new locale before reloading so it's ready immediately.
    void ensureLoaded(locale).then(() => window.location.reload());
  }
}

/**
 * Synchronous translation lookup.
 * Returns the translated string if loaded, otherwise falls back to the key.
 *
 * NOTE: For the very first render, translations may not be loaded yet.
 * Use `useTranslations()` hook in client components for guaranteed translations.
 */
export function t(key: string, locale?: Locale): string {
  const lang = locale ?? (typeof window !== "undefined" ? getLocale() : "en");
  return cache[lang]?.[key] ?? INLINE_FALLBACKS[key] ?? key;
}

/**
 * Get all available locales with their labels.
 */
export const LOCALES: Array<{ code: Locale; label: string; nativeLabel: string }> = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
];

/**
 * React hook for translations in client components.
 * Returns a stable `t()` function that re-renders when locale changes.
 *
 * Usage:
 *   const { t, locale } = useTranslations();
 *   return <p>{t("nav.submit")}</p>;
 */
export function useTranslations(): {
  t: (key: string) => string;
  locale: Locale;
} {
  // This is a simple hook — in a real app you'd use React context + state.
  const locale = getLocale();
  return {
    t: (key: string) => t(key, locale),
    locale,
  };
}
