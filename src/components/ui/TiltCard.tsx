import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/**
 * A card that tilts toward the pointer, with a highlight tracking the cursor.
 *
 * The tilt is deliberately shallow - past a few degrees it reads as a gimmick
 * and makes text harder to read.
 */
export function TiltCard({
  children,
  className,
  intensity = 7,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const coarse = useMediaQuery('(pointer: coarse)');
  const still = reduced || coarse;

  // Normalised pointer position, -0.5..0.5 from the card centre.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 150, damping: 18 });
  const sy = useSpring(py, { stiffness: 150, damping: 18 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-intensity, intensity]);
  // Composed here, not inline in JSX - hooks cannot run conditionally or
  // inside render props.
  const glow = useTransform(
    [sx, sy],
    ([gx, gy]: number[]) =>
      `radial-gradient(420px circle at ${(gx + 0.5) * 100}% ${(gy + 0.5) * 100}%, rgba(110,231,249,0.09), transparent 65%)`,
  );

  if (still) {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 900 }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 [.group:hover_&]:opacity-100"
        style={{ background: glow }}
      />
      {children}
    </motion.div>
  );
}
