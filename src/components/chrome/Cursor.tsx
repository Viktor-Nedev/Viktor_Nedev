import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/**
 * A dot that tracks the pointer exactly, with a ring lagging behind it.
 *
 * Positions are written straight to the DOM in a rAF loop - putting pointer
 * coordinates in React state would re-render the tree 60 times a second.
 * Hidden on touch devices and under reduced motion, where the native cursor
 * is restored.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const coarse = useMediaQuery('(pointer: coarse)');
  const [active, setActive] = useState(false);

  const disabled = reduced || coarse;

  useEffect(() => {
    if (disabled) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const trail = { ...pointer };
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!visible) {
        visible = true;
        document.body.classList.add('has-custom-cursor');
      }
      // Interactive targets get a larger, softer ring.
      const el = e.target as HTMLElement | null;
      setActive(!!el?.closest('a, button, [role="button"], input, textarea, select'));
    };

    const onLeave = () => {
      visible = false;
      document.body.classList.remove('has-custom-cursor');
    };

    const tick = () => {
      // Exponential smoothing gives the ring its lag without a spring library.
      trail.x += (pointer.x - trail.x) * 0.16;
      trail.y += (pointer.y - trail.y) * 0.16;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.body.classList.remove('has-custom-cursor');
      cancelAnimationFrame(raf);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] hidden md:block">
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-[#0d2438]"
      />
      <div
        ref={ring}
        className="absolute left-0 top-0 rounded-full border border-[#0d2438]/45 transition-[width,height,opacity] duration-300"
        style={{
          width: active ? 46 : 28,
          height: active ? 46 : 28,
          opacity: active ? 1 : 0.6,
          backdropFilter: 'blur(1px)',
        }}
      />
    </div>
  );
}
