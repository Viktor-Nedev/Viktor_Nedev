import { Reveal, RevealText } from '../ui/Reveal';
import { TiltCard } from '../ui/TiltCard';
import { Magnetic } from '../ui/Magnetic';
import { useT } from '../../i18n';
import { useScrollTo } from '../../hooks/useLenis';
import { SERVICE_KEYS } from '../../data/site';

export function Services() {
  const t = useT();
  const scrollTo = useScrollTo();

  return (
    <section id="services" className="section-y relative">
      <div className="shell">
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
                className="rounded-full border border-slate-2 px-6 py-3 transition-colors hover:border-volt hover:text-volt"
              >
                {t.services.cta} →
              </button>
            </Magnetic>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {SERVICE_KEYS.map((key, i) => (
            <Reveal key={key} delay={i * 0.08}>
              <TiltCard className="group h-full">
                <div className="surface noise relative h-full overflow-hidden rounded-2xl p-8 transition-colors duration-500 group-hover:border-volt/40">
                  <span className="font-mono text-xs text-mist">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 font-display text-2xl">{t.services.items[key].name}</h3>
                  <p className="mt-3 text-mist">{t.services.items[key].description}</p>

                  {/* Accent sweep that fills in from the left on hover. */}
                  <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-volt to-plasma transition-transform duration-700 group-hover:scale-x-100" />
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
