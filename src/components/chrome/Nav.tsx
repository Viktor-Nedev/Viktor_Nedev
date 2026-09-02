import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/cn';
import { EASE } from '../../lib/easing';
import { useI18n, useT } from '../../i18n';
import { useScrollTo } from '../../hooks/useLenis';
import { LangToggle } from './LangToggle';
import { Magnetic } from '../ui/Magnetic';

const SECTIONS = ['about', 'skills', 'services', 'work', 'games', 'certificates'] as const;

export function Nav() {
  const t = useT();
  const { lang } = useI18n();
  const scrollTo = useScrollTo();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A locked body under the open menu, restored exactly as it was.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const labels: Record<(typeof SECTIONS)[number], string> = {
    about: t.nav.about,
    skills: t.nav.skills,
    services: t.nav.services,
    work: t.nav.work,
    games: t.nav.games,
    certificates: t.nav.certificates,
  };

  const jump = (id: string) => {
    setOpen(false);
    scrollTo(`#${id}`, -70);
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled
            ? 'border-b border-slate-2/70 bg-void/78 py-3 backdrop-blur-xl'
            : 'border-b border-transparent py-5',
        )}
      >
        <nav className="shell flex items-center justify-between gap-4">
          <button
            onClick={() => scrollTo('#top')}
            className="font-display text-lg tracking-tight transition-colors hover:text-volt"
          >
            {lang === 'bg' ? 'Виктор' : 'Viktor'}
            <span className="text-volt">.</span>
          </button>

          <ul className="hidden items-center gap-7 lg:flex">
            {SECTIONS.map((id) => (
              <li key={id}>
                <button
                  onClick={() => jump(id)}
                  className="group relative py-1 text-sm text-mist transition-colors hover:text-chalk"
                >
                  {labels[id]}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-volt transition-transform duration-300 group-hover:scale-x-100" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <LangToggle />

            <Magnetic className="hidden sm:inline-block">
              <button
                onClick={() => jump('booking')}
                className="rounded-full bg-chalk px-5 py-2 text-sm font-medium text-void transition-all hover:bg-volt"
              >
                {t.nav.contact}
              </button>
            </Magnetic>

            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
              aria-label={open ? t.nav.close : t.nav.menu}
              aria-expanded={open}
            >
              <span
                className={cn(
                  'block h-px w-5 bg-chalk transition-transform duration-300',
                  open && 'translate-y-[3.5px] rotate-45',
                )}
              />
              <span
                className={cn(
                  'block h-px w-5 bg-chalk transition-transform duration-300',
                  open && '-translate-y-[3.5px] -rotate-45',
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-center bg-void/97 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="shell flex flex-col gap-2">
              {[...SECTIONS, 'booking' as const].map((id, i) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: EASE }}
                >
                  <button
                    onClick={() => jump(id)}
                    className="w-full py-2 text-left font-display text-3xl transition-colors hover:text-volt"
                  >
                    {id === 'booking' ? t.nav.contact : labels[id]}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
