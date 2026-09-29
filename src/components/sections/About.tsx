import { Reveal, RevealText } from '../ui/Reveal';
import { useT } from '../../i18n';
import { site } from '../../data/site';

const HIGHLIGHT_KEYS = ['school', 'olympiad', 'softuniada', 'softuni'] as const;

export function About() {
  const t = useT();

  return (
    <section id="about" className="section-y relative">
      <div className="shell">
        {/* The story reads first, full width; the proof sits underneath it. */}
        <div className="max-w-3xl">
          <Reveal>
            <p className="text-eyebrow mb-5">{t.about.title}</p>
          </Reveal>
          <RevealText text={t.about.heading} className="text-h2" />

          <Reveal delay={0.15}>
            <div className="mt-10 space-y-5 text-lg text-mist">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="text-eyebrow mb-6 mt-20">{t.about.highlightsTitle}</p>
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHT_KEYS.map((key, i) => (
            <Reveal as="li" key={key} delay={0.1 + i * 0.08}>
              <div className="surface group relative h-full overflow-hidden rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-1">
                <span className="font-mono text-xs text-mist transition-colors group-hover:text-volt">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-4 leading-snug text-chalk">{t.about.highlights[key]}</p>
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-volt to-plasma transition-transform duration-700 group-hover:scale-x-100" />
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.4}>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <a
              href={site.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="surface group flex items-center justify-between rounded-2xl px-6 py-5 transition-colors hover:border-volt/50"
            >
              <span className="font-mono text-xs text-mist">GitHub</span>
              <span className="flex items-center gap-2 font-display text-xl transition-colors group-hover:text-volt">
                {site.stats.repos} repos
                <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
              </span>
            </a>
            <a
              href={site.links.devpost}
              target="_blank"
              rel="noopener noreferrer"
              className="surface group flex items-center justify-between rounded-2xl px-6 py-5 transition-colors hover:border-gold/50"
            >
              <span className="font-mono text-xs text-mist">Devpost</span>
              <span
                className="flex items-center gap-2 font-display text-xl"
                style={{ color: 'var(--color-gold)' }}
              >
                {site.stats.wins} wins
                <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
