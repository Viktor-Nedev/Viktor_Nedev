import { useEffect, useRef } from 'react';
import { useScroll } from '../../hooks/useLenis';
import { useT } from '../../i18n';

/** A hairline rail across the top showing how far through the page you are. */
export function ScrollProgress() {
  const { progress } = useScroll();
  const bar = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (bar.current) {
        // scaleX is compositor-friendly; animating width would force layout.
        bar.current.style.transform = `scaleX(${progress.current})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-px bg-transparent"
      role="progressbar"
      aria-label={t.a11y.scrollProgress}
    >
      <div
        ref={bar}
        className="h-full origin-left bg-gradient-to-r from-volt to-plasma"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
