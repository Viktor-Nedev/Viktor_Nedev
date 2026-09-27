import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';
import { useScroll } from '../../hooks/useLenis';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * A band of text that drifts sideways and reacts to scrolling.
 *
 * Position is written straight to the DOM from a rAF loop — the whole point is
 * that it moves every frame, which is exactly what React state must not drive.
 * Scroll velocity nudges the speed, so flicking the page visibly pushes it.
 */
export function Marquee({
  items,
  speed = 28,
  reverse = false,
  className,
}: {
  items: string[];
  /** Pixels per second at rest. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const { velocity } = useScroll();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = track.current;
    if (!el) return;

    let offset = 0;
    let raf = 0;
    let last = performance.now();
    // The track renders the list twice, so wrapping at half its width is
    // seamless.
    const half = () => el.scrollWidth / 2;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const boost = Math.min(Math.abs(velocity.current) * 0.35, 90);
      offset += (speed + boost) * dt * (reverse ? -1 : 1);
      const w = half();
      if (w > 0) offset = ((offset % w) + w) % w;
      el.style.transform = `translate3d(${reverse ? offset : -offset}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, reverse, reduced, velocity]);

  return (
    <div
      aria-hidden
      className={cn('relative flex overflow-hidden', className)}
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 26%, #000 74%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 26%, #000 74%, transparent)',
      }}
    >
      <div ref={track} className="flex shrink-0 items-center gap-10 whitespace-nowrap will-change-transform">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-sm tracking-tight text-mist">
            {item}
            <span className="inline-block h-1 w-1 rounded-full bg-volt/50" />
          </span>
        ))}
      </div>
    </div>
  );
}
