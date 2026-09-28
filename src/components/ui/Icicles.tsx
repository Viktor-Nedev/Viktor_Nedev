import { useMemo } from 'react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface IciclesProps {
  /** Rough number of spikes across the edge. */
  count?: number;
  /** Longest spike, in px. Others scale down from here. */
  maxLength?: number;
  className?: string;
  /** Deterministic layout per placement, so nothing shifts between renders. */
  seed?: number;
}

/** Small deterministic PRNG - the same edge draws identically every mount. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A row of icicles hanging from the top edge of its container.
 *
 * Drawn as one inline SVG rather than many elements: the whole row is a
 * single path set, so it costs one node and scales to any width. Spikes are
 * uneven on purpose - evenly spaced icicles read as a cartoon border.
 */
export function Icicles({ count = 22, maxLength = 46, className, seed = 1 }: IciclesProps) {
  const reduced = useReducedMotion();

  const spikes = useMemo(() => {
    const rng = mulberry32(seed);
    const out: { x: number; w: number; len: number; delay: number; dur: number }[] = [];
    let x = 0;
    for (let i = 0; i < count; i++) {
      // Width and gap both vary, so the row never falls into a rhythm.
      const w = 1.1 + rng() * 2.6;
      const gap = 0.4 + rng() * 2.4;
      // Most spikes are short; a few long ones carry the silhouette.
      const t = rng();
      const len = maxLength * (0.18 + Math.pow(t, 2.2) * 0.82);
      out.push({ x, w, len, delay: rng() * 4, dur: 3.5 + rng() * 3 });
      x += w + gap;
    }
    // Normalise to a 0..100 viewBox so the row stretches to any container.
    const total = x;
    return out.map((s) => ({ ...s, x: (s.x / total) * 100, w: (s.w / total) * 100 }));
  }, [count, maxLength, seed]);

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-x-0 top-0 overflow-visible', className)}
      style={{ height: maxLength }}
    >
      <svg
        width="100%"
        height={maxLength}
        viewBox={`0 0 100 ${maxLength}`}
        preserveAspectRatio="none"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Ice is brightest at its shoulder and clearest at the tip. */}
          <linearGradient id={`ice-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#cfe8f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9fd0ec" stopOpacity="0.32" />
          </linearGradient>
        </defs>

        {spikes.map((s, i) => (
          <g
            key={i}
            style={
              reduced
                ? undefined
                : {
                    transformOrigin: `${s.x + s.w / 2}px 0px`,
                    animation: `icicle-sway ${s.dur}s ease-in-out ${s.delay}s infinite`,
                  }
            }
          >
            <path
              d={`M ${s.x} 0 L ${s.x + s.w} 0 L ${s.x + s.w / 2} ${s.len} Z`}
              fill={`url(#ice-${seed})`}
            />
            {/* A bright sliver down one face reads as a specular highlight. */}
            <path
              d={`M ${s.x + s.w * 0.28} 0 L ${s.x + s.w * 0.46} 0 L ${s.x + s.w / 2} ${s.len * 0.72} Z`}
              fill="#ffffff"
              opacity="0.5"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
