import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from './en';
import { bg } from './bg';
import type { Dict, Lang } from './types';

const DICTS: Record<Lang, Dict> = { en, bg };
const STORAGE_KEY = 'vn.lang';

export interface I18nValue {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  /** Locale tag for Intl formatting. */
  locale: string;
}

export const I18nContext = createContext<I18nValue | null>(null);

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'bg' || stored === 'en') return stored;
  } catch {
    // Private mode or blocked storage - fall through to language detection.
  }
  return navigator.language?.toLowerCase().startsWith('bg') ? 'bg' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not being able to persist the choice is not worth breaking the page.
    }
  }, []);

  const toggle = useCallback(
    () => setLang(lang === 'bg' ? 'en' : 'bg'),
    [lang, setLang],
  );

  // Keep the document in sync for assistive tech, search engines and
  // language-aware typography.
  useEffect(() => {
    document.documentElement.lang = lang;
    const t = DICTS[lang];
    document.title = t.meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t.meta.description);
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      t: DICTS[lang],
      setLang,
      toggle,
      locale: lang === 'bg' ? 'bg-BG' : 'en-GB',
    }),
    [lang, setLang, toggle],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
