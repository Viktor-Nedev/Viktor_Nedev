import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useReducedMotion } from './useReducedMotion';

interface ScrollState {
  lenis: Lenis | null;
  /** 0..1 through the whole page. Read from a ref in frame loops. */
  progress: React.RefObject<number>;
  velocity: React.RefObject<number>;
}

const ScrollContext = createContext<ScrollState | null>(null);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const progress = useRef(0);
  const velocity = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    // Honour the OS setting: hijacking scroll is exactly what people who ask
    // for reduced motion are asking us not to do.
    if (reduced) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.current = max > 0 ? window.scrollY / max : 0;
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    const instance = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    // Order matters. ScrollTrigger reads native scroll position, which Lenis
    // now owns - without this every trigger fires at the wrong offset.
    instance.on('scroll', ScrollTrigger.update);
    instance.on('scroll', ({ progress: p, velocity: v }: { progress: number; velocity: number }) => {
      progress.current = p;
      velocity.current = v;
    });

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  // Font swap changes layout, which invalidates every computed trigger
  // position. Refresh once the real faces have landed.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScrollContext.Provider value={{ lenis, progress, velocity }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll(): ScrollState {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error('useScroll must be used inside <SmoothScrollProvider>');
  return ctx;
}

/** Scrolls to an anchor, working with or without Lenis. */
export function useScrollTo() {
  const { lenis } = useScroll();
  return (target: string, offset = 0) => {
    const el = document.querySelector(target);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el as HTMLElement, { offset, duration: 1.2 });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };
}
