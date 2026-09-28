import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Reveal, RevealText } from '../ui/Reveal';
import { useI18n, useT } from '../../i18n';
import { repos } from '../../data/repos.generated';
import { site } from '../../data/site';
import { cn } from '../../lib/cn';
import { EASE } from '../../lib/easing';

/** Language dot colours, roughly matching GitHub's own palette. */
const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  'C#': '#178600',
  Dart: '#00b4ab',
  Python: '#3572a5',
  Svelte: '#ff3e00',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Jac: '#a78bfa',
};

export function AllProjects() {
  const t = useT();
  const { locale } = useI18n();
  const [demoOnly, setDemoOnly] = useState(false);

  const shown = useMemo(
    () => (demoOnly ? repos.filter((r) => r.homepage) : repos),
    [demoOnly],
  );

  const fmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }),
    [locale],
  );

  return (
    <section className="section-y relative">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-eyebrow mb-5">GitHub</p>
            </Reveal>
            <RevealText text={t.work.all} className="text-h2" />
            <Reveal delay={0.15}>
              <p className="mt-6 text-mist">{t.work.allLede}</p>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="flex items-center gap-1 rounded-full border border-slate-2 p-1">
              {[
                [false, t.work.filterAll],
                [true, t.work.filterDemo],
              ].map(([value, label]) => (
                <button
                  key={String(value)}
                  onClick={() => setDemoOnly(value as boolean)}
                  className={cn(
                    'relative rounded-full px-4 py-1.5 text-sm transition-colors',
                    demoOnly === value ? 'text-void' : 'text-mist hover:text-chalk',
                  )}
                >
                  {demoOnly === value && (
                    <motion.span
                      layoutId="repo-filter-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-chalk shadow-[0_4px_14px_-6px_rgba(13,47,82,0.55)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {label as string}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <motion.ul layout className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/80 shadow-[0_18px_50px_-26px_rgba(13,47,82,0.4)] sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((repo) => (
              <motion.li
                key={repo.name}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="bg-white/35 outline outline-slate-2"
              >
                <a
                  href={repo.homepage ?? repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col gap-3 bg-white/55 p-5 backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg transition-colors group-hover:text-volt">
                      {repo.name}
                    </h3>
                    <span className="shrink-0 text-mist transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-volt">
                      ↗
                    </span>
                  </div>

                  <p className="flex-1 text-sm text-mist">
                    {repo.description ?? t.work.noDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.7rem] text-mist">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: LANG_COLOR[repo.language] ?? '#8a93a8' }}
                        />
                        {repo.language}
                      </span>
                    )}
                    {repo.homepage && <span className="text-volt/80">live</span>}
                    <span className="ml-auto">
                      {t.work.updated} {fmt.format(new Date(repo.pushedAt))}
                    </span>
                  </div>
                </a>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <Reveal delay={0.15}>
          <a
            href={site.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 inline-flex items-center gap-2 text-mist transition-colors hover:text-volt"
          >
            github.com/Viktor-Nedev
            <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
