import { useContext } from 'react';
import { I18nContext } from './I18nProvider';

/**
 * Returns the whole dictionary plus language helpers.
 *
 * Access is `t.hero.title` rather than `t('hero.title')` - full autocomplete,
 * and a typo is a compile error.
 */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

/** Shorthand when only the strings are needed. */
export function useT() {
  return useI18n().t;
}
