import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE } from '../../lib/easing';
import { useT } from '../../i18n';
import { ScrollTrigger } from '../../lib/gsap';

/**
 * Entry curtain.
 *
 * Bound to real readiness - fonts and the window load event - rather than a
 * fixed timer, with a floor so it never flashes past too fast to read and a
 * ceiling so a slow font CDN cannot trap anyone behind it.
 */
export function Loader({ onDone }: { onDone?: () => void }) {
  const t = useT();
  const [progress, setProgress] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const MIN_MS = 700;
    const MAX_MS = 4000;
    const started = performance.now();
    let raf = 0;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      const elapsed = performance.now() - started;
      const wait = Math.max(0, MIN_MS - elapsed);
      window.setTimeout(() => {
        setProgress(100);
        window.setTimeout(() => {
          setGone(true);
          // Layout is final now, so trigger positions can be measured.
          ScrollTrigger.refresh();
          onDone?.();
        }, 620);
      }, wait);
    };

    // Creep forward while waiting so the bar never looks stuck.
    const tick = () => {
      setProgress((p) => (p < 88 ? p + (88 - p) * 0.028 : p));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true })),
    ]);

    ready.then(finish);
    const cap = window.setTimeout(finish, MAX_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-void"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <motion.p
            className="font-display text-3xl tracking-tight sm:text-5xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            Viktor Nedev<span className="text-volt">.</span>
          </motion.p>

          <div className="mt-7 h-px w-52 overflow-hidden bg-slate-2">
            <div
              className="h-full origin-left bg-gradient-to-r from-volt to-plasma transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>

          <p className="mt-3 font-mono text-xs text-mist">
            {t.a11y.loading} {Math.round(progress)}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
