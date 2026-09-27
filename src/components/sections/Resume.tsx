import { motion } from 'motion/react';
import { Reveal, RevealText } from '../ui/Reveal';
import { Magnetic } from '../ui/Magnetic';
import { Aurora } from '../ui/Aurora';
import { useI18n, useT } from '../../i18n';
import { asset } from '../../lib/asset';
import { EASE } from '../../lib/easing';
import { site } from '../../data/site';
import { timeline, achievements, languages } from '../../data/resume';

export function Resume() {
  const t = useT();
  const { lang } = useI18n();

  return (
    <section id="cv" className="section-y relative overflow-hidden">
      <Aurora />

      <div className="shell relative">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-eyebrow mb-5">{t.cv.title}</p>
          </Reveal>
          <RevealText text={t.cv.heading} className="text-h2" />
          <Reveal delay={0.15}>
            <p className="mt-6 text-mist">{t.cv.lede}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ---------------------------------------------- the document */}
          <Reveal className="lg:col-span-5" delay={0.1}>
            <div className="group relative">
              <motion.a
                href={asset(site.cv.file)}
                target="_blank"
                rel="noopener noreferrer"
                className="edge-glow sheen relative block overflow-hidden rounded-2xl border border-slate-2 bg-slate-1"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <img
                  src={asset(site.cv.preview)}
                  alt={`${site.name} CV`}
                  width={900}
                  height={1273}
                  loading="lazy"
                  decoding="async"
                  style={{ backgroundImage: `url(${site.cv.lqip})`, backgroundSize: 'cover' }}
                  className="w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
                {/* Fades the page bottom into the card so it does not end on a
                    hard white edge. */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-1 to-transparent" />
                <span className="pointer-events-none absolute bottom-4 left-5 font-mono text-[0.7rem] text-mist">
                  {t.cv.pages}
                </span>
              </motion.a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Magnetic>
                <a
                  href={asset(site.cv.file)}
                  download={site.cv.downloadName}
                  className="group/dl inline-flex items-center gap-2.5 rounded-full bg-chalk px-6 py-3 font-medium text-void transition-colors hover:bg-volt"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M8 1.5v9m0 0L4.5 7M8 10.5 11.5 7M2 13.5h12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover/dl:translate-y-0.5"
                    />
                  </svg>
                  {t.cv.download}
                </a>
              </Magnetic>

              <a
                href={asset(site.cv.file)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-mist transition-colors hover:text-chalk"
              >
                {t.cv.open} ↗
              </a>
            </div>

            <p className="mt-3 font-mono text-[0.7rem] text-mist">{t.cv.updated}</p>
          </Reveal>

          {/* ------------------------------------------------- the detail */}
          <div className="lg:col-span-7">
            <Reveal>
              <h3 className="text-eyebrow mb-6">{t.resume.experienceTitle}</h3>
            </Reveal>

            {/* Timeline: a single rail with a node per entry. */}
            <ol className="relative border-l border-slate-2 pl-7">
              {timeline.map((entry, i) => (
                <Reveal as="li" key={entry.id} delay={i * 0.09} className="relative pb-9 last:pb-0">
                  <span className="absolute -left-[31px] top-1.5 flex h-3.5 w-3.5 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border border-slate-2 bg-void" />
                    <span
                      className="relative h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          entry.kind === 'work' ? 'var(--color-volt)' : 'var(--color-plasma)',
                      }}
                    />
                  </span>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono text-[0.7rem] uppercase tracking-wider text-volt">
                      {entry.period[lang]}
                    </span>
                    <span className="rounded-full border border-slate-2 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-mist">
                      {t.resume.kinds[entry.kind]}
                    </span>
                  </div>

                  <h4 className="mt-2 font-display text-lg leading-snug">{entry.role[lang]}</h4>
                  <p className="mt-0.5 text-sm text-chalk/75">{entry.org[lang]}</p>
                  <p className="mt-2.5 text-sm text-mist">{entry.detail[lang]}</p>
                </Reveal>
              ))}
            </ol>

            {/* --------------------------------------------- achievements */}
            <Reveal>
              <h3 className="text-eyebrow mb-5 mt-12">{t.resume.achievementsTitle}</h3>
            </Reveal>

            <ul className="space-y-3">
              {achievements.map((a, i) => {
                // Gold marks a placement; the olympiad entry is a qualification.
                const placed = a.id !== 'noit';
                return (
                  <Reveal as="li" key={a.id} delay={i * 0.08}>
                    <div className="group flex gap-4 rounded-xl border border-slate-2 bg-slate-1/45 p-4 transition-colors duration-500 hover:border-volt/40">
                      {a.rank && (
                        <span
                          className="mt-0.5 h-fit shrink-0 rounded-full border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-wider"
                          style={
                            placed
                              ? { color: 'var(--color-gold)', borderColor: 'rgba(255,184,77,0.35)' }
                              : { color: 'var(--color-mist)', borderColor: 'var(--color-slate-2)' }
                          }
                        >
                          {a.rank[lang]}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{a.title[lang]}</p>
                        <p className="mt-1 text-sm text-mist">{a.detail[lang]}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ul>

            {/* ------------------------------------------------ languages */}
            <Reveal>
              <h3 className="text-eyebrow mb-5 mt-12">{t.resume.languagesTitle}</h3>
            </Reveal>

            <ul className="grid gap-5 sm:grid-cols-3">
              {languages.map((l, i) => (
                <Reveal as="li" key={l.id} delay={i * 0.08}>
                  <p className="font-display">{l.name[lang]}</p>
                  <p className="mt-0.5 text-xs text-mist">{l.level[lang]}</p>
                  <span className="mt-2.5 block h-px w-full bg-slate-2">
                    <motion.span
                      className="block h-full origin-left bg-gradient-to-r from-volt to-plasma"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: l.value }}
                      viewport={{ once: true, margin: '-10% 0px' }}
                      transition={{ duration: 1.1, delay: 0.15 + i * 0.1, ease: EASE }}
                    />
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
