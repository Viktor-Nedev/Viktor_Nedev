import { Reveal, RevealText } from '../ui/Reveal';
import { TiltCard } from '../ui/TiltCard';
import { useI18n, useT } from '../../i18n';
import { games } from '../../data/games';
import { asset } from '../../lib/asset';
import { BackdropVideo } from '../ui/BackdropVideo';

export function Games() {
  const t = useT();
  const { lang } = useI18n();

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

        {/* The skier loops behind nothing - it is the one clip allowed to be
            looked at directly, so it gets its own frame and no text on top. */}
        <Reveal delay={0.1}>
          <div className="surface relative mt-12 aspect-[21/9] overflow-hidden rounded-2xl">
            <BackdropVideo slug="skier" />
          </div>
        </Reveal>

        <div className="mt-16 space-y-5">
          {games.map((game, i) => (
            <Reveal key={game.slug} delay={i * 0.08}>
              <TiltCard className="group" intensity={4}>
                <article className="surface noise edge-glow sheen relative overflow-hidden rounded-2xl transition-colors duration-500 group-hover:border-volt/40">
                  <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-12 lg:items-center">
                    {game.image ? (
                      <div className="lg:col-span-3">
                        <div className="flex items-center justify-center rounded-xl bg-white/70 p-6">
                          <img
                            src={asset(game.image)}
                            alt={game.name}
                            width={350}
                            height={352}
                            loading="lazy"
                            className="w-28 transition-transform duration-500 group-hover:scale-105 sm:w-36"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="hidden lg:col-span-3 lg:block">
                        <div className="flex aspect-square items-center justify-center rounded-xl border border-white/70 bg-white/60">
                          <span className="font-display text-5xl text-slate-2">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="lg:col-span-6">
                      <h3 className="font-display text-2xl sm:text-3xl">{game.name}</h3>
                      <p className="mt-2 text-sm text-volt/90">{game.tagline[lang]}</p>
                      <p className="mt-4 text-mist">{game.description[lang]}</p>

                      <ul className="mt-5 flex flex-wrap gap-2">
                        {game.stack.map((tech) => (
                          <li
                            key={tech}
                            className="rounded-md border border-slate-2 px-2.5 py-1 font-mono text-[0.7rem] text-mist"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                        {game.live && (
                          <a
                            href={game.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link flex items-center gap-1.5 rounded-full bg-chalk px-5 py-2 font-medium text-void transition-colors hover:bg-volt"
                          >
                            {t.games.play}
                            <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">
                              →
                            </span>
                          </a>
                        )}
                        {game.itch && (
                          <a
                            href={game.itch}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-mist transition-colors hover:text-chalk"
                          >
                            {t.games.itch} ↗
                          </a>
                        )}
                        {game.repo && (
                          <a
                            href={game.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-mist transition-colors hover:text-chalk"
                          >
                            {t.games.code}
                          </a>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2.5 lg:col-span-3">
                      {game.highlights.map((h, hi) => (
                        <li key={hi} className="flex gap-2.5 text-sm text-mist">
                          <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-volt" />
                          {h[lang]}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-volt to-plasma transition-transform duration-700 group-hover:scale-x-100" />
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
