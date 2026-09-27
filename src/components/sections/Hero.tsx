import { motion } from 'motion/react';
import { EASE } from '../../lib/easing';
import { useI18n, useT } from '../../i18n';
import { useScrollTo } from '../../hooks/useLenis';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Magnetic } from '../ui/Magnetic';
import { Counter } from '../ui/Counter';
import { site } from '../../data/site';
import { Marquee } from '../ui/Marquee';
import { skills } from '../../data/skills';
import { asset } from '../../lib/asset';

export function Hero() {
  const t = useT();
  const { lang } = useI18n();
  const scrollTo = useScrollTo();
  const reduced = useReducedMotion();

  // Name is split so each half can rise independently behind the 3D crystal.
  const name = lang === 'bg' ? site.nameBg : site.name;
  const [first, ...rest] = name.split(' ');

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: '0.35em' },
          animate: { opacity: 1, y: '0em' },
          transition: { duration: 1, delay, ease: EASE },
        };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      <div className="shell relative z-10 pt-28 pb-20">
        <motion.p className="text-eyebrow mb-6" {...rise(0.1)}>
          {t.hero.eyebrow}
        </motion.p>

        <h1 className="text-display leading-[0.88]">
          <span className="sr-only">{name}</span>
          <span aria-hidden className="block overflow-hidden">
            <motion.span className="block" {...rise(0.2)}>
              {first}
            </motion.span>
          </span>
          <span aria-hidden className="block overflow-hidden">
            <motion.span className="block text-gradient" {...rise(0.3)}>
              {rest.join(' ')}
            </motion.span>
          </span>
        </h1>

        <motion.p
          className="mt-8 max-w-2xl font-display text-h3 text-chalk/90"
          {...rise(0.45)}
        >
          {t.hero.role}
        </motion.p>

        <motion.p className="mt-5 max-w-xl text-mist" {...rise(0.55)}>
          {t.hero.lede}
        </motion.p>

        <motion.div className="mt-10 flex flex-wrap items-center gap-4" {...rise(0.65)}>
          <Magnetic>
            <button
              onClick={() => scrollTo('#booking', -70)}
              className="rounded-full bg-chalk px-7 py-3.5 font-medium text-void transition-colors hover:bg-volt"
            >
              {t.hero.cta}
            </button>
          </Magnetic>
          <button
            onClick={() => scrollTo('#work', -70)}
            className="group flex items-center gap-2 rounded-full border border-slate-2 px-7 py-3.5 transition-colors hover:border-volt hover:text-volt"
          >
            {t.hero.ctaSecondary}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
          <a
            href={asset(site.cv.file)}
            download={site.cv.downloadName}
            className="group flex items-center gap-2 text-sm text-mist transition-colors hover:text-chalk"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M8 1.5v9m0 0L4.5 7M8 10.5 11.5 7M2 13.5h12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-y-0.5"
              />
            </svg>
            {t.cv.download}
          </a>
        </motion.div>

        {/* Headline numbers. 12 of 69 is the story worth leading with. */}
        <motion.dl
          className="mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5"
          {...rise(0.8)}
        >
          {(
            [
              ['wins', site.stats.wins, true],
              ['hackathons', site.stats.hackathons, false],
              ['years', site.stats.years, false],
              ['repos', site.stats.repos, false],
              ['games', site.stats.games, false],
            ] as const
          ).map(([key, value, gold]) => (
            <div key={key}>
              <dt className="sr-only">{t.stats[key]}</dt>
              <dd>
                <span
                  className="nums block font-display text-4xl sm:text-5xl"
                  style={gold ? { color: 'var(--color-gold)' } : undefined}
                >
                  <Counter value={value} />
                </span>
                <span className="mt-1 block text-xs text-mist">{t.stats[key]}</span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">
            {t.hero.scroll}
          </span>
          <span className="relative block h-10 w-px overflow-hidden bg-slate-2">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-volt"
              animate={reduced ? {} : { y: ['-100%', '200%'] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </div>
      </motion.div>

      {/* A drifting band of the stack, reacting to scroll velocity. */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-slate-2/60 bg-void/40 py-3 backdrop-blur-sm">
        <Marquee items={skills.filter((sk) => sk.core).map((sk) => sk.name)} speed={22} />
      </div>
    </section>
  );
}
