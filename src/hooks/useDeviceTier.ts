import { useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

export type Tier = 'high' | 'mid' | 'low';

export interface TierSettings {
  tier: Tier;
  /** Device pixel ratio clamp passed to the R3F canvas. */
  dpr: [number, number];
  particles: number;
  postprocessing: boolean;
}

/**
 * Picks a starting quality tier from device capability hints.
 *
 * These hints are only a starting point - they lie often enough that
 * PerformanceMonitor adjusts DPR from measured frame timing on top of this.
 */
export function useDeviceTier(): TierSettings {
  const coarse = useMediaQuery('(pointer: coarse)');
  const small = useMediaQuery('(max-width: 768px)');

  return useMemo(() => {
    const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 4) : 4;
    const memory =
      typeof navigator !== 'undefined'
        ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4)
        : 4;

    if (coarse || small || cores <= 4 || memory <= 2) {
      return { tier: 'low', dpr: [1, 1.25], particles: 400, postprocessing: false };
    }
    if (cores <= 8 || memory <= 4) {
      return { tier: 'mid', dpr: [1, 1.5], particles: 1200, postprocessing: true };
    }
    return { tier: 'high', dpr: [1, 2], particles: 3000, postprocessing: true };
  }, [coarse, small]);
}
