import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Slow drifting colour wash behind a section.
 *
 * Two blurred radial blobs on long, mismatched cycles, so the loop never
 * lands on an obvious beat. Pure CSS animation, so it runs on the compositor
 * and costs nothing on the main thread.
 */
export function Aurora({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <span
        className="absolute -left-[15%] top-[-20%] h-[55vw] w-[55vw] rounded-full opacity-[0.16] blur-[110px]"
        style={{
          background: 'radial-gradient(circle, var(--color-volt), transparent 68%)',
          animation: reduced ? undefined : 'aurora-a 26s ease-in-out infinite',
        }}
      />
      <span
        className="absolute -right-[10%] bottom-[-25%] h-[48vw] w-[48vw] rounded-full opacity-[0.13] blur-[120px]"
        style={{
          background: 'radial-gradient(circle, var(--color-plasma), transparent 70%)',
          animation: reduced ? undefined : 'aurora-b 34s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/**
 * A single hairline that draws itself as it scrolls into view.
 *
 * Used to separate major sections without a hard border.
 */
export function Divider() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transform = 'scaleX(1)';
          io.disconnect();
        }
      },
      { rootMargin: '-12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="h-px origin-left bg-gradient-to-r from-transparent via-slate-2 to-transparent transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ transform: reduced ? 'scaleX(1)' : 'scaleX(0)' }}
    />
  );
}
