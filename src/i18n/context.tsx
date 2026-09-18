import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import en from './translations/en';
import type { TranslationKeys } from './translations/en';
import { isRTLLocale } from './locales';

export type Locale = string;

interface I18nContextValue {
  locale: Locale;
  translations: TranslationKeys;
  t: (path: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  translations: en,
  t: (path) => path,
});

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      result[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

export interface EasyFlowI18nProviderProps {
  /** Any locale code (e.g. 'en', 'fa', 'ar-SA', 'de-DE'). */
  locale?: Locale;
  /**
   * @deprecated Use translationsByLocale instead.
   * Legacy: single override merged over base 'en'.
   */
  translations?: Partial<TranslationKeys>;
  /** Locale-keyed translation overrides (preferred). */
  translationsByLocale?: Record<string, Partial<TranslationKeys>>;
  children: ReactNode;
}

export function EasyFlowI18nProvider({
  locale = 'en',
  translations: customTranslations,
  translationsByLocale,
  children,
}: EasyFlowI18nProviderProps) {
  const mergedTranslations = useMemo(() => {
    if (translationsByLocale) {
      const base = translationsByLocale[locale] || translationsByLocale.en || {};
      return deepMerge(en, base) as TranslationKeys;
    }
    if (customTranslations) {
      return deepMerge(en, customTranslations) as TranslationKeys;
    }
    return en;
  }, [locale, translationsByLocale, customTranslations]);

  const t = useMemo(() => {
    return (path: string, fallback?: string): string => {
      return getNestedValue(mergedTranslations as Record<string, unknown>, path) || fallback || path;
    };
  }, [mergedTranslations]);

  const value = useMemo(
    () => ({ locale, translations: mergedTranslations, t }),
    [locale, mergedTranslations, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export { I18nContext, isRTLLocale };
