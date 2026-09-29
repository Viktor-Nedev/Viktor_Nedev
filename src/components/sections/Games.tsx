import { Reveal, RevealText } from '../ui/Reveal';
import { SkiGame } from './SkiGame';
import { useI18n, useT } from '../../i18n';
import { games } from '../../data/games';
import { asset } from '../../lib/asset';
import type { Game } from '../../data/types';

/** Line glyphs for games that have no artwork yet. */
const PLACEHOLDER: Record<string, string> = {
  // A flag on a green.
  'crazy-golf': 'M8 20V4l9 3.5L8 11 M5 20h10',
  // A pot on a flame.
  'gourmet-adventures': 'M4 10h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z M2 10h20 M9 6c0-1 1-1 1-2 M13 6c0-1 1-1 1-2',
};

function GameCard({ game }: { game: Game }) {
  const t = useT();
  const { lang } = useI18n();

  return (
    <article className="surface noise edge-glow sheen group relative overflow-hidden rounded-2xl p-5 transition-colors duration-500 hover:border-volt/40">
      <div className="flex gap-4">
        <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/90 bg-white/70">
          {game.image ? (
            <img
              src={asset(game.image)}
              alt=""
              width={64}
              height={48}
              loading="lazy"
              // Wide title cards and round logos both fit without cropping.
              className="max-h-12 max-w-16 object-contain transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden className="text-volt">
              <path
                d={PLACEHOLDER[game.slug] ?? 'M4 4h16v16H4z'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-display text-lg leading-tight">{game.name}</h3>
            {game.award && (
              <span
                className="rounded-full border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider"
                style={{ color: 'var(--color-gold)', borderColor: 'rgba(154,91,0,0.35)' }}
              >
                {game.award[lang]}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-volt">{game.tagline[lang]}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-mist">{game.description[lang]}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-1.5">
          {game.stack.map((tech) => (
            <li key={tech} className="rounded-md border border-slate-2 px-2 py-0.5 font-mono text-[0.65rem] text-mist">
              {tech}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 text-sm">
          {game.live && (
            <a
              href={game.live}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-chalk px-3.5 py-1 text-xs font-medium text-white transition-colors hover:bg-volt-dp"
            >
              {t.games.play} →
            </a>
          )}
          {game.itch && (
            <a href={game.itch} target="_blank" rel="noopener noreferrer" className="text-xs text-mist hover:text-chalk">
              {t.games.itch} ↗
            </a>
          )}
          {game.repo && (
            <a href={game.repo} target="_blank" rel="noopener noreferrer" className="text-xs text-mist hover:text-chalk">
              {t.games.code}
            </a>
          )}
          {!game.live && !game.itch && !game.repo && (
            <span className="font-mono text-[0.65rem] text-mist">{t.games.desktopOnly}</span>
          )}
        </div>
      </div>

      <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-volt to-plasma transition-transform duration-700 group-hover:scale-x-100" />
    </article>
  );
}

export function Games() {
  const t = useT();

  return (
    <section id="games" className="section-y relative">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-eyebrow mb-5">{t.games.title}</p>
          </Reveal>
          <RevealText text={t.games.heading} className="text-h2" />
          <Reveal delay={0.15}>
            <p className="mt-6 text-mist">{t.games.lede}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7 lg:h-full">
            <SkiGame />
          </Reveal>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {games.map((game, i) => (
              <Reveal key={game.slug} delay={0.1 + i * 0.08}>
                <GameCard game={game} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
