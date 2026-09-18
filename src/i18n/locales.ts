/** Known RTL locale codes (base language only, before region subtag). */
export const RTL_LOCALES = ['ar', 'fa', 'he', 'ur', 'yi', 'dv', 'ps', 'sd', 'ku'] as const;

/**
 * Detect whether a locale code requires RTL text direction.
 * Strips region subtags (e.g. 'ar-SA' → 'ar') before checking.
 */
export function isRTLLocale(locale: string | undefined | null): boolean {
  if (!locale) return false;
  const base = locale.split('-')[0].split('_')[0].toLowerCase();
  return (RTL_LOCALES as readonly string[]).includes(base);
}
