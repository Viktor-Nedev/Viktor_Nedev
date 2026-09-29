import { useLayoutEffect, useRef } from 'react';
import { Reveal, RevealText } from '../ui/Reveal';
import { TiltCard } from '../ui/TiltCard';
import { Magnetic } from '../ui/Magnetic';
import { Aurora } from '../ui/Aurora';
import { useT } from '../../i18n';
import { useScrollTo } from '../../hooks/useLenis';
import { SERVICE_KEYS, type ServiceKey } from '../../data/site';
import { gsap } from '../../lib/gsap';

/** One line-drawn glyph per service, in the page's ink. */
const GLYPHS: Record<ServiceKey, string> = {
  landing: 'M3 5h18v14H3z M3 9h18 M7 13h6 M7 16h4',
  webapp: 'M3 4h18v16H3z M3 8h18 M8 8v12 M11 12h7 M11 15h5',
  backend: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  mvp: 'M13 3 5 14h6l-1 7 8-11h-6z',
};

function Glyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * "Web development, end to end".
 *
 * On desktop the section pins and the four service cards are dealt from a
 * face-down deck into their slots as you scroll - each travels from the deck,
 * straightens, and flips to show its face. GSAP owns every transform on the
 * dealt cards; nothing else animates them, so the two animation libraries
 * never fight over the same property.
 *
 * Phones get a plain rise-in, and reduced motion gets the cards laid out
 * still: pinning a section and flinging cards is exactly the motion that
 * setting asks us to leave out.
 */
export function Services() {
  const t = useT();
  const scrollTo = useScrollTo();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const root = section.current;
    const deckStage = stage.current;
    if (!root || !deckStage) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const items = cards.current.filter(Boolean) as HTMLDivElement[];

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        // Offset from each card's slot to the centre of the stage, where the
        // deck sits. Functions, so a resize re-measures instead of dealing to
        // stale coordinates.
        //
        // Measured with offsetLeft/offsetTop, never getBoundingClientRect:
        // on refresh the cards are already sitting on the deck, and a
        // transform-aware measurement would report their distance to it as
        // zero - dealing every card from exactly where it already lies.
        const toDeck = (el: HTMLElement, axis: 'x' | 'y') =>
          axis === 'x'
            ? deckStage.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2)
            : deckStage.clientHeight / 2 - (el.offsetTop + el.offsetHeight / 2);

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=170%',
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        items.forEach((el, i) => {
          tl.fromTo(
            el,
            {
              x: () => toDeck(el, 'x'),
              y: () => toDeck(el, 'y') + i * -4,
              rotation: (i - 1.5) * 5,
              rotationY: 180,
              scale: 0.88,
              zIndex: items.length - i,
            },
            { x: 0, y: 0, rotation: 0, rotationY: 0, scale: 1, duration: 1 },
            // Overlap the deals so it reads as one continuous motion.
            i * 0.55,
          );
        });

        // Hold the finished layout briefly before the pin releases.
        tl.to({}, { duration: 0.4 });
      });

      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        items.forEach((el) => {
          gsap.from(el, {
            y: 36,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="services" className="section-y relative overflow-hidden">
      <Aurora />
      <div className="shell relative">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-eyebrow mb-5">{t.services.title}</p>
            </Reveal>
            <RevealText text={t.services.heading} className="text-h2" />
            <Reveal delay={0.15}>
              <p className="mt-6 text-mist">{t.services.lede}</p>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <Magnetic>
              <button
                onClick={() => scrollTo('#booking', -70)}
                className="rounded-full border border-slate-2 bg-white/50 px-6 py-3 backdrop-blur transition-colors hover:border-volt hover:text-volt"
              >
                {t.services.cta} →
              </button>
            </Magnetic>
          </Reveal>
        </div>

        <div
          ref={stage}
          // Positioned, so it is the offsetParent the deal measures against.
          className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          style={{ perspective: 1600 }}
        >
          {SERVICE_KEYS.map((key, i) => (
            <div
              key={key}
              ref={(el) => {
                cards.current[i] = el;
              }}
              className="relative h-full will-change-transform"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Face */}
              <div className="h-full" style={{ backfaceVisibility: 'hidden' }}>
                <TiltCard className="group h-full" intensity={5}>
                  <div className="surface noise edge-glow sheen relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl p-7 transition-colors duration-500 group-hover:border-volt/40">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/90 bg-white/70 text-volt shadow-[0_6px_18px_-12px_rgba(13,47,82,0.6)]">
                        <Glyph d={GLYPHS[key]} />
                      </span>
                      <span className="font-mono text-xs text-mist">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="mt-8 font-display text-xl leading-snug">
                      {t.services.items[key].name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist">
                      {t.services.items[key].description}
                    </p>
                    <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-volt to-plasma transition-transform duration-700 group-hover:scale-x-100" />
                  </div>
                </TiltCard>
              </div>

              {/* Back - only ever seen mid-deal, on desktop. */}
              <div
                aria-hidden
                className="absolute inset-0 overflow-hidden rounded-2xl border border-white/80 shadow-[0_14px_40px_-18px_rgba(13,47,82,0.45)]"
                style={{
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  background:
                    'linear-gradient(150deg, #0d2438 0%, #0b4a63 55%, #0b7590 100%)',
                }}
              >
                {/* Frost lattice across the card back. */}
                <svg className="absolute inset-0 h-full w-full opacity-25" aria-hidden>
                  <defs>
                    <pattern id={`frost-${i}`} width="28" height="28" patternUnits="userSpaceOnUse">
                      <path
                        d="M14 3v22M3 14h22M6 6l16 16M22 6 6 22"
                        stroke="#fff"
                        strokeWidth="0.6"
                        fill="none"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#frost-${i})`} />
                </svg>
                <div className="absolute inset-4 rounded-xl border border-white/25" />
                <span className="absolute inset-0 flex items-center justify-center font-display text-5xl text-white/85">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
