import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';

export interface DirectorState {
  /** Whole-page scroll progress, 0..1. Read inside useFrame, never as state. */
  progress: React.RefObject<number>;
  /** Scroll velocity, for effects that react to how hard the page is flicked. */
  velocity: React.RefObject<number>;
  /** Pointer position in normalised device coordinates, -1..1. */
  pointer: React.RefObject<{ x: number; y: number }>;
}

const DirectorContext = createContext<DirectorState | null>(null);

/**
 * Feeds scroll and pointer data to the 3D scenes.
 *
 * Everything lives in refs. Putting scroll position in React state would
 * re-render the component tree sixty times a second alongside the render
 * loop - the single most common way an R3F scene ends up janky.
 */
export function SceneDirector({
  children,
  progress,
  velocity,
}: {
  children: ReactNode;
  progress: React.RefObject<number>;
  velocity: React.RefObject<number>;
}) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <DirectorContext.Provider value={{ progress, velocity, pointer }}>
      {children}
    </DirectorContext.Provider>
  );
}

export function useDirector(): DirectorState {
  const ctx = useContext(DirectorContext);
  if (!ctx) throw new Error('useDirector must be used inside <SceneDirector>');
  return ctx;
}

/** Maps a value from one range to another, clamped at both ends. */
export function remap(value: number, inMin: number, inMax: number, outMin = 0, outMax = 1) {
  const t = Math.min(Math.max((value - inMin) / (inMax - inMin), 0), 1);
  return outMin + t * (outMax - outMin);
}
