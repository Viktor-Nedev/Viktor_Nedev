import { Reveal, RevealText } from '../ui/Reveal';
import { Magnetic } from '../ui/Magnetic';
import { useI18n, useT } from '../../i18n';
import { useScrollTo } from '../../hooks/useLenis';
import { site } from '../../data/site';
import { PineBand } from '../ui/PineBand';

const LINKS = [
  { key: 'github', href: site.links.github, label: 'GitHub' },
  { key: 'devpost', href: site.links.devpost, label: 'Devpost' },
  { key: 'itch', href: site.links.itch, label: 'itch.io' },
] as const;

export function Contact() {
  const t = useT();
  const { lang } = useI18n();
  const scrollTo = useScrollTo();

  return (
    <footer id="contact" className="relative">
      <PineBand className="-mb-px" />
      <div className="shell section-y">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-eyebrow mb-5">{t.contact.title}</p>
            </Reveal>
            <RevealText text={t.contact.heading} className="text-h2" />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-md text-mist">{t.contact.lede}</p>
            </Reveal>

            <Reveal delay={0.25}>
              <Magnetic>
                <a
                  href={`mailto:${site.email}`}
                  className="group mt-10 inline-flex max-w-full items-center gap-3 text-xl font-semibold transition-colors hover:text-volt sm:font-display sm:text-3xl"
                >
                  {/* The address is long and unbreakable; at display size it
                      pushes the whole footer past a phone viewport. */}
                  <span className="min-w-0 break-all">{site.email}</span>
                  <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </Magnetic>
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.2}>
              <p className="text-eyebrow mb-6">{t.contact.elsewhere}</p>
              <ul className="space-y-px">
                {LINKS.map(({ key, href, label }) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between border-t border-slate-2 py-4 transition-colors hover:border-volt/40"
                    >
                      <span className="transition-colors group-hover:text-volt">{label}</span>
                      <span className="text-mist transition-transform duration-300 group-hover:translate-x-1 group-hover:text-volt">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-slate-2 pt-8">
          <p className="font-mono text-xs text-mist">
            © {new Date().getFullYear()} {lang === 'bg' ? site.nameBg : site.name}.{' '}
            {t.contact.rights}
          </p>

          <button
            onClick={() => scrollTo('#top')}
            className="group flex items-center gap-2 font-mono text-xs text-mist transition-colors hover:text-volt"
          >
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
            {t.contact.backToTop}
          </button>
        </div>
      </div>
    </footer>
  );
}
