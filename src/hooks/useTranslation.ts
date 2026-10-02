import { useContext, useCallback, useMemo } from 'react';
import { I18nContext, isRTLLocale } from '../i18n/context';

/**
 * Access the current i18n context.
 *
 * @returns An object with:
 * - `t(path, fallback?)` — dotted-key lookup with optional fallback
 * - `locale` — active locale code
 * - `isRTL` — whether the locale requires right-to-left layout
 * - `translations` — merged translation dictionary
 */
export function useTranslation() {
  const context = useContext(I18nContext);

  const t = useCallback(
    (path: string, fallback?: string): string => {
      return context.t(path, fallback);
    },
    [context]
  );

  const isRTL = useMemo(() => isRTLLocale(context.locale), [context.locale]);

  return { t, locale: context.locale, isRTL, translations: context.translations };
}
