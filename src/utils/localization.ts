/**
 * Pick the best localized value from a map of locale -> string.
 *
 * Resolution order: exact locale → base locale → 'en' → 'fa' → any value → fallback.
 *
 * @param locale - Active locale code (e.g. `en`, `fa-IR`).
 * @param values - Locale-keyed map, or a plain string (returned as-is).
 * @param fallback - Value returned when nothing matches.
 * @returns The best matching string.
 */
export function pickLocalized(
  locale: string,
  values: Record<string, string | undefined | null> | string | undefined | null,
  fallback: string = ''
): string {
  if (!values) return fallback;
  if (typeof values === 'string') return values || fallback;

  const base = locale.split('-')[0].split('_')[0].toLowerCase();

  return (
    values[locale] ||
    values[base] ||
    values.en ||
    values.fa ||
    Object.values(values).find(Boolean) ||
    fallback
  );
}

/**
 * Build a locale map from an object with `_` suffixed fields.
 *
 * Example: extractLocalizedMap({ name: 'Default', name_en: 'Hello', name_fa: 'سلام' }, 'name')
 *   => { default: 'Default', en: 'Hello', fa: 'سلام' }
 *
 * @param source - Source object containing base and `_locale`-suffixed keys.
 * @param baseField - Base field name (e.g. `name`).
 * @returns A map of locale code → string value.
 */
export function extractLocalizedMap(
  source: Record<string, unknown>,
  baseField: string
): Record<string, string> {
  const map: Record<string, string> = {};
  if (typeof source[baseField] === 'string') {
    map.default = source[baseField] as string;
  }
  const prefix = `${baseField}_`;
  for (const key of Object.keys(source)) {
    if (key.startsWith(prefix)) {
      const loc = key.slice(prefix.length);
      if (typeof source[key] === 'string' && source[key]) {
        map[loc] = source[key] as string;
      }
    }
  }
  return map;
}

/**
 * Build a localized node data object from a locale map.
 *
 * @param locale - Active locale code.
 * @param data - Source node/card data object.
 * @param labelKey - Base field name for labels (default `label`).
 * @param descKey - Base field name for descriptions (default `description`).
 * @returns A shallow copy of `data` with localized label/description fields.
 */
export function localizeNodeData(
  locale: string,
  data: Record<string, unknown>,
  labelKey: string = 'label',
  descKey: string = 'description'
): Record<string, unknown> {
  const labelMap = (data[`${labelKey}_i18n`] as Record<string, string>) || {};
  const descMap = (data[`${descKey}_i18n`] as Record<string, string>) || {};
  return {
    ...data,
    [labelKey]: pickLocalized(locale, labelMap, data[labelKey] as string),
    [descKey]: pickLocalized(locale, descMap, data[descKey] as string),
  };
}
