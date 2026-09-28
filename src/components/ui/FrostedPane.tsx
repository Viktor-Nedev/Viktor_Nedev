import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { hasEntered, onEntered } from '../../lib/entrance';

/**
 * Content revealed as if wiped clear on a fogged window.
 *
 * An SVG turbulence filter paints the frost, and a radial mask erases it
 * outward from the centre once the pane is in view - so the name emerges
 * from condensation rather than fading in.
 *
 * The text underneath is real DOM the whole time: only the frost layer
 * animates, so the name is always selectable, searchable and correctly
 * spelled in either language.
 */
export function FrostedPane({
  children,
  className,
  delay = 300,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [cleared, setCleared] = useState(reduced && hasEntered());

  useEffect(() => {
    if (reduced) {
      setCleared(true);
      return;
    }
    // Hold until the loader curtain lifts, or the whole reveal plays behind
    // it and nobody ever sees the glass clear.
    let timer = 0;
    const stop = onEntered(() => {
      timer = window.setTimeout(() => setCleared(true), delay);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, [delay, reduced]);

  return (
    <div ref={ref} className={cn('relative block w-fit', className)}>
      {children}

      {/* The fog. Sits over the content and retreats; pointer-events stay off
          so it never blocks a click even mid-transition. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 z-20"
        style={{
          opacity: cleared ? 0 : 1,
          transition: 'opacity 2200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="absolute inset-0 [backdrop-filter:blur(10px)_brightness(1.07)] [-webkit-backdrop-filter:blur(10px)_brightness(1.07)]"
          style={{
            background:
              'radial-gradient(60% 55% at 38% 45%, rgba(255,255,255,0.62), rgba(226,240,250,0.5) 62%, rgba(214,233,247,0.42))',
            // Two masks multiply: the first feathers the pane's edge so the
            // fog never shows a straight boundary, the second is the wipe
            // that opens from where the name sits.
            maskImage: [
              'radial-gradient(75% 78% at 42% 50%, #000 42%, transparent 82%)',
              cleared
                ? 'radial-gradient(130% 130% at 38% 45%, transparent 62%, #000 100%)'
                : 'radial-gradient(130% 130% at 38% 45%, #000 0%, #000 100%)',
            ].join(', '),
            WebkitMaskImage: [
              'radial-gradient(75% 78% at 42% 50%, #000 42%, transparent 82%)',
              cleared
                ? 'radial-gradient(130% 130% at 38% 45%, transparent 62%, #000 100%)'
                : 'radial-gradient(130% 130% at 38% 45%, #000 0%, #000 100%)',
            ].join(', '),
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
            transition: 'mask-image 2400ms ease-out, -webkit-mask-image 2400ms ease-out',
          }}
        />

        {/* Crystalline grain, so the fog has texture rather than being a
            flat blur. */}
        <svg
          className="absolute inset-0 h-full w-full"
          style={{
            mixBlendMode: 'overlay',
            opacity: 0.55,
            maskImage: 'radial-gradient(75% 78% at 42% 50%, #000 42%, transparent 82%)',
            WebkitMaskImage: 'radial-gradient(75% 78% at 42% 50%, #000 42%, transparent 82%)',
          }}
        >
          <filter id="frost-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" seed="11" />
            <feColorMatrix values="0 0 0 0 0.82  0 0 0 0 0.92  0 0 0 0 1  0 0 0 0.55 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#frost-grain)" />
        </svg>
      </div>
    </div>
  );
}
