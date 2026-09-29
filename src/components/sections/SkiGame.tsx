import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useT } from '../../i18n';
import { asset } from '../../lib/asset';
import { EASE } from '../../lib/easing';
import {
  STEP,
  composeIdle,
  createState,
  distanceMetres,
  resize,
  score,
  start,
  step,
  type State,
} from '../../game/engine';
import { draw, type Sprites } from '../../game/render';
import { Controls } from '../../game/input';

type UiPhase = 'idle' | 'running' | 'paused' | 'over';

interface Hud {
  distance: number;
  coins: number;
  score: number;
}

const BEST_KEY = 'vn.downhill.best';
const MAX_DPR = 2;

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(value: number) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private mode or blocked storage: the best simply lasts for this visit.
  }
}

/**
 * Downhill - a small ski game.
 *
 * The canvas is driven entirely outside React: the simulation and drawing
 * run in a rAF loop against refs, and React only hears about discrete
 * events - the HUD at most ten times a second, and the end of a run.
 */
export function SkiGame() {
  const t = useT();
  const surface = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<State | null>(null);
  const controls = useRef(new Controls());
  const sprites = useRef<Sprites>({ tree: null });
  const raf = useRef(0);
  const dpr = useRef(1);

  const [phase, setPhase] = useState<UiPhase>('idle');
  const [hud, setHud] = useState<Hud>({ distance: 0, coins: 0, score: 0 });
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);
  const phaseRef = useRef<UiPhase>('idle');

  const setUiPhase = useCallback((p: UiPhase) => {
    phaseRef.current = p;
    setPhase(p);
    controls.current.setActive(p === 'running');
  }, []);

  const paint = useCallback(() => {
    const ctx = canvas.current?.getContext('2d');
    const s = state.current;
    if (!ctx || !s) return;
    ctx.setTransform(dpr.current, 0, 0, dpr.current, 0, 0);
    draw(ctx, s, sprites.current);
  }, []);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  const runLoop = useCallback(() => {
    stopLoop();
    let last = performance.now();
    let acc = 0;
    let lastHud = 0;

    const frame = (now: number) => {
      const s = state.current;
      if (!s) return;
      // Cap the catch-up after a stall, or a long frame fast-forwards the run.
      acc += Math.min(0.25, (now - last) / 1000);
      last = now;
      while (acc >= STEP) {
        step(s, controls.current.input);
        acc -= STEP;
      }
      paint();

      if (now - lastHud > 100) {
        lastHud = now;
        setHud({ distance: distanceMetres(s), coins: s.coins, score: score(s) });
      }

      if (s.phase === 'over') {
        const final = score(s);
        setHud({ distance: distanceMetres(s), coins: s.coins, score: final });
        const previous = readBest();
        const beat = final > previous;
        if (beat) {
          writeBest(final);
          setBest(final);
        }
        setNewBest(beat);
        setUiPhase('over');
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
  }, [paint, setUiPhase, stopLoop]);

  const begin = useCallback(() => {
    const s = state.current;
    if (!s) return;
    start(s);
    setNewBest(false);
    setHud({ distance: 0, coins: 0, score: 0 });
    setUiPhase('running');
    runLoop();
  }, [runLoop, setUiPhase]);

  const resume = useCallback(() => {
    setUiPhase('running');
    runLoop();
  }, [runLoop, setUiPhase]);

  const pause = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    // Let a crash already in progress finish rather than freezing mid-tumble.
    if (state.current?.phase !== 'running') return;
    stopLoop();
    setUiPhase('paused');
  }, [setUiPhase, stopLoop]);

  // Canvas sizing, sprite loading, input.
  useEffect(() => {
    const el = surface.current;
    const cv = canvas.current;
    if (!el || !cv) return;

    const fit = () => {
      const rect = el.getBoundingClientRect();
      dpr.current = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      cv.width = Math.round(rect.width * dpr.current);
      cv.height = Math.round(rect.height * dpr.current);
      if (!state.current) {
        state.current = createState(rect.width, rect.height);
        composeIdle(state.current);
      } else {
        resize(state.current, rect.width, rect.height);
      }
      paint();
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const img = new Image();
    img.decoding = 'async';
    img.src = asset('art/pine-single.webp');
    img.onload = () => {
      sprites.current.tree = img;
      paint();
    };

    const ctl = controls.current;
    ctl.attach(el);

    return () => {
      ro.disconnect();
      ctl.detach();
      stopLoop();
    };
  }, [paint, stopLoop]);

  // Pause when scrolled away or when the tab is hidden - a run should never
  // carry on unseen and end in a crash nobody watched.
  useEffect(() => {
    const el = surface.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.35) pause();
      },
      { threshold: [0, 0.35, 1] },
    );
    io.observe(el);
    const onHide = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [pause]);

  const showHud = phase !== 'idle';

  return (
    <div
      ref={surface}
      className="surface relative h-[70svh] max-h-[620px] min-h-[440px] w-full select-none overflow-hidden rounded-2xl lg:h-full lg:max-h-none lg:min-h-[620px]"
    >
      <canvas
        ref={canvas}
        role="img"
        aria-label={t.game.canvasLabel}
        className="absolute inset-0 h-full w-full"
      />

      {/* HUD */}
      <AnimatePresence>
        {showHud && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2"
          >
            <div className="flex flex-wrap gap-2">
              <HudPill label={t.game.distance} value={`${hud.distance} ${t.game.meters}`} />
              <HudPill label={t.game.coins} value={String(hud.coins)} gold />
              <HudPill label={t.game.score} value={String(hud.score)} strong />
            </div>
            <HudPill label={t.game.best} value={String(best)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menus */}
      <AnimatePresence mode="wait">
        {phase !== 'running' && (
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/10 via-white/25 to-white/45 p-5"
          >
            <motion.div
              initial={{ y: 16, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="surface-deep w-full max-w-sm rounded-2xl p-7 text-center"
            >
              {phase === 'idle' && (
                <>
                  <p className="text-eyebrow">{t.game.eyebrow}</p>
                  <h3 className="mt-3 font-display text-3xl">{t.game.title}</h3>
                  <p className="mt-3 text-sm text-mist">{t.game.lede}</p>
                  <PrimaryButton onClick={begin}>{t.game.start}</PrimaryButton>
                  <p className="mt-4 text-xs leading-relaxed text-mist">{t.game.controls}</p>
                </>
              )}

              {phase === 'paused' && (
                <>
                  <h3 className="font-display text-2xl">{t.game.paused}</h3>
                  <PrimaryButton onClick={resume}>{t.game.resume}</PrimaryButton>
                </>
              )}

              {phase === 'over' && (
                <>
                  <p className="text-eyebrow">{t.game.gameOver}</p>
                  <p className="nums mt-3 font-display text-5xl">{hud.score}</p>
                  <p className="mt-2 text-sm text-mist">
                    {hud.distance} {t.game.meters} · {hud.coins} {t.game.coins.toLowerCase()}
                  </p>
                  {newBest ? (
                    <p
                      className="mx-auto mt-4 w-fit rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-wider"
                      style={{ color: 'var(--color-gold)', borderColor: 'rgba(154,91,0,0.35)' }}
                    >
                      {t.game.newBest}
                    </p>
                  ) : (
                    <p className="mt-4 font-mono text-xs text-mist">
                      {t.game.best}: {best}
                    </p>
                  )}
                  <PrimaryButton onClick={begin}>{t.game.restart}</PrimaryButton>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A run ending is otherwise silent to a screen reader. */}
      <p className="sr-only" aria-live="polite">
        {phase === 'over' ? `${t.game.gameOver}. ${t.game.score}: ${hud.score}` : ''}
      </p>
    </div>
  );
}

function HudPill({ label, value, gold, strong }: { label: string; value: string; gold?: boolean; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-white/90 bg-white/75 px-3 py-1.5 shadow-[0_6px_18px_-12px_rgba(13,47,82,0.55)] backdrop-blur-md">
      <p className="font-mono text-[0.6rem] uppercase tracking-wider text-mist">{label}</p>
      <p
        className={`nums font-display leading-tight ${strong ? 'text-lg' : 'text-base'}`}
        style={gold ? { color: 'var(--color-gold)' } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-chalk px-7 py-3 font-medium text-white shadow-[0_10px_30px_-12px_rgba(13,47,82,0.5)] transition-colors hover:bg-volt-dp"
    >
      {children}
      <span aria-hidden>→</span>
    </button>
  );
}
