import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '../../i18n';
import { ScrollTrigger } from '../../lib/gsap';
import type { Lang } from '../../i18n';

const OPTIONS: Lang[] = ['bg', 'en'];

/**
 * Sliding pill that swaps the site language.
 *
 * Switching changes every string on the page, and Bulgarian copy runs longer
 * than English - so section heights change and ScrollTrigger positions must be
 * recomputed, or every scroll animation fires at the wrong offset afterwards.
 */
export function LangToggle() {
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    // Wait for the re-rendered text to be laid out before measuring.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [lang]);

  return (
    <div
      className="relative flex items-center rounded-full border border-slate-2 p-0.5"
      role="group"
      aria-label={t.a11y.langToggle}
    >
      {OPTIONS.map((option) => {
        const selected = option === lang;
        return (
          <button
            key={option}
            onClick={() => setLang(option)}
            aria-pressed={selected}
            className="relative z-10 px-2.5 py-1 font-mono text-xs uppercase transition-colors duration-300"
            style={{ color: selected ? 'var(--color-void)' : 'var(--color-mist)' }}
          >
            {selected && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 -z-10 rounded-full bg-chalk"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            {option}
          </button>
        );
      })}
    </div>
  );
}
