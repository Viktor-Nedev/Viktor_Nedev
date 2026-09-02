import { Reveal, RevealText } from '../ui/Reveal';
import { useT } from '../../i18n';
import { site } from '../../data/site';

const HIGHLIGHT_KEYS = ['school', 'olympiad', 'softuniada', 'softuni'] as const;

export function About() {
  const t = useT();

  return (
    <section id="about" className="section-y relative">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="text-eyebrow mb-5">{t.about.title}</p>
          </Reveal>
          <RevealText text={t.about.heading} className="text-h2" />

          <Reveal delay={0.15}>
            <div className="mt-10 space-y-5 text-mist">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal delay={0.1}>
            <p className="text-eyebrow mb-6">{t.about.highlightsTitle}</p>
          </Reveal>

          <ul className="space-y-px">
            {HIGHLIGHT_KEYS.map((key, i) => (
              <Reveal as="li" key={key} delay={0.15 + i * 0.08}>
                <div className="group flex items-start gap-5 border-t border-slate-2 py-6 transition-colors hover:border-volt/40">
                  <span className="mt-1 font-mono text-xs text-mist transition-colors group-hover:text-volt">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-chalk/90">{t.about.highlights[key]}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.5}>
            <div className="mt-10 grid grid-cols-2 gap-4">
              <a
                href={site.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="surface group rounded-xl px-5 py-4 transition-colors hover:border-volt/50"
              >
                <span className="block font-mono text-xs text-mist">GitHub</span>
                <span className="mt-1 flex items-center gap-2 font-display text-lg transition-colors group-hover:text-volt">
                  {site.stats.repos} repos
                  <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
                </span>
              </a>
              <a
                href={site.links.devpost}
                target="_blank"
                rel="noopener noreferrer"
                className="surface group rounded-xl px-5 py-4 transition-colors hover:border-gold/50"
              >
                <span className="block font-mono text-xs text-mist">Devpost</span>
                <span
                  className="mt-1 flex items-center gap-2 font-display text-lg transition-colors"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {site.stats.wins} wins
                  <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
