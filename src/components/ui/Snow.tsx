import { useMemo } from 'react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useDeviceTier } from '../../hooks/useDeviceTier';

/**
 * Drifting snow across the whole page.
 *
 * Plain absolutely-positioned dots on CSS animations rather than a canvas:
 * at this count the compositor handles it for free, and it needs no render
 * loop competing with the WebGL scene. Count drops on weaker devices and the
 * layer disappears entirely under reduced motion.
 */
export function Snow({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const tier = useDeviceTier();

  const count = tier.tier === 'low' ? 18 : tier.tier === 'mid' ? 34 : 54;

  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Deterministic enough to look scattered, cheap enough to not care.
        const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
        const size = 2 + r(1) * 4;
        return {
          left: r(2) * 100,
          size,
          // Bigger flakes fall faster and sit more opaque: cheap depth cue.
          duration: 26 - size * 1.6 + r(3) * 10,
          delay: -r(4) * 30,
          drift: (r(5) - 0.5) * 12,
          opacity: 0.25 + (size / 6) * 0.45,
        };
      }),
    [count],
  );

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 z-[1] overflow-hidden', className)}
    >
      {flakes.map((f, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full bg-white"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            filter: 'blur(0.4px)',
            boxShadow: '0 0 6px rgba(255,255,255,0.9)',
            ['--drift' as string]: `${f.drift}vw`,
            animation: `snow-fall ${f.duration}s linear ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
