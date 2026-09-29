/**
 * Downhill - game state and simulation.
 *
 * Pure: no DOM, no canvas, no timers. The shell feeds it input and a fixed
 * timestep, so the slope behaves identically at 60, 120 or 144 Hz and the
 * whole thing could be tested without a browser.
 *
 * Coordinates are CSS pixels. World y grows downhill; the camera follows the
 * skier, who is held at a fixed height on screen while the world scrolls up.
 */

export const STEP = 1 / 60;
/** Screen height fraction where the skier is held. */
export const SKIER_SCREEN_Y = 0.3;
const PX_PER_METRE = 14;
const MAX_HEADING = (65 * Math.PI) / 180;
const TURN_RATE = 4.2; // rad/s the skis can swing
const MIN_SPEED = 150;
const TRAIL_SPACING = 5; // px of travel between trail samples
const TRAIL_MAX = 520;
const PARTICLE_MAX = 240;
const COIN_VALUE = 10;

export type Phase = 'idle' | 'running' | 'crashed' | 'over';

/** 0 = tall pine, 1 = bushy pine, 2 = snow-covered rock. */
export type ObstacleKind = 0 | 1 | 2;

export interface Tree {
  x: number;
  y: number;
  scale: number;
  kind: ObstacleKind;
}

/**
 * Collision half-extents at scale 1, per obstacle kind. Deliberately smaller
 * than the drawn shapes: clipping a branch should feel like a near miss, not
 * a wipe-out.
 */
const HITBOX: Record<ObstacleKind, [number, number]> = {
  0: [9, 7], // tall pine - just the trunk
  1: [13, 8], // bushy pine - lower, wider skirt
  2: [16, 8], // rock - wide and low
};

export interface Coin {
  x: number;
  y: number;
  taken: boolean;
  phase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  alive: boolean;
}

export interface Floater {
  x: number;
  y: number;
  life: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  heading: number;
}

export interface Input {
  /** -1..1 from the keyboard; 0 when no key is held. */
  steer: number;
  /** Pointer x in screen space, or null when the pointer is not steering. */
  pointerX: number | null;
}

export interface State {
  phase: Phase;
  width: number;
  height: number;
  x: number;
  y: number;
  heading: number;
  speed: number;
  /** Recent turn rate, drives spray and lean. */
  carve: number;
  coins: number;
  trees: Tree[];
  coinList: Coin[];
  particles: Particle[];
  floaters: Floater[];
  trail: TrailPoint[];
  sinceTrail: number;
  nextRowY: number;
  crashTime: number;
  time: number;
  seed: number;
}

/** Mostly tall pines, so the slope still reads as a forest. */
function pickKind(r: number): ObstacleKind {
  return r < 0.62 ? 0 : r < 0.86 ? 1 : 2;
}

/** Deterministic PRNG, so a given seed always lays out the same slope. */
function rand(state: State) {
  let t = (state.seed = (state.seed + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const distanceMetres = (s: State) => Math.max(0, Math.floor(s.y / PX_PER_METRE));
export const score = (s: State) => distanceMetres(s) + s.coins * COIN_VALUE;
export const cameraY = (s: State) => s.y - s.height * SKIER_SCREEN_Y;

/** 0 at the top of the slope, 1 once it is as hard as it gets. */
const difficulty = (s: State) => Math.min(1, distanceMetres(s) / 1400);

export function createState(width: number, height: number, seed = 1): State {
  const s: State = {
    phase: 'idle',
    width,
    height,
    x: width / 2,
    y: 0,
    heading: 0,
    speed: 0,
    carve: 0,
    coins: 0,
    trees: [],
    coinList: [],
    particles: Array.from({ length: PARTICLE_MAX }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, alive: false,
    })),
    floaters: [],
    trail: [],
    sinceTrail: 0,
    // Leave the first stretch open so a run never starts inside a tree.
    nextRowY: height * 0.75,
    crashTime: 0,
    time: 0,
    seed,
  };
  spawnAhead(s);
  return s;
}

/** A still composition for the menu: a curving trail behind a waiting skier. */
export function composeIdle(s: State) {
  s.trail = [];
  for (let i = 0; i < 90; i++) {
    const y = s.y - (90 - i) * 4;
    const x = s.width / 2 + Math.sin(i / 14) * s.width * 0.12;
    const heading = Math.cos(i / 14) * 0.5;
    s.trail.push({ x, y, heading });
  }
  s.heading = s.trail[s.trail.length - 1].heading;
  s.x = s.trail[s.trail.length - 1].x;

  // Dress the visible slope. The real run's rows start below the fold so a
  // run never opens inside a tree, which would leave the menu backdrop bare.
  // start() rebuilds the world, so none of these ever get in the way.
  const top = cameraY(s);
  for (let i = 0; i < 26; i++) {
    const x = 20 + rand(s) * (s.width - 40);
    const y = top + 40 + rand(s) * s.height;
    const nearTrail = s.trail.some((p) => Math.abs(p.x - x) < 46 && Math.abs(p.y - y) < 46);
    if (nearTrail || Math.hypot(x - s.x, y - s.y) < 70) continue;
    s.trees.push({ x, y, scale: 0.7 + rand(s) * 0.55, kind: pickKind(rand(s)) });
  }
  s.trees.sort((a, b) => a.y - b.y);
}

export function resize(s: State, width: number, height: number) {
  const ratio = width / (s.width || width);
  s.width = width;
  s.height = height;
  s.x *= ratio;
  for (const t of s.trees) t.x *= ratio;
  for (const c of s.coinList) c.x *= ratio;
  for (const p of s.trail) p.x *= ratio;
  spawnAhead(s);
}

export function start(s: State) {
  const { width, height } = s;
  const fresh = createState(width, height, (Math.random() * 2 ** 31) | 0);
  Object.assign(s, fresh, { phase: 'running', speed: MIN_SPEED });
}

function spawnAhead(s: State) {
  const horizon = s.y + s.height * 1.3;
  while (s.nextRowY < horizon) {
    spawnRow(s, s.nextRowY);
    const d = difficulty(s);
    // Rows tighten as the run goes on.
    s.nextRowY += 62 + rand(s) * 70 - d * 34;
  }
}

function spawnRow(s: State, y: number) {
  const d = difficulty(s);
  const margin = 18;

  // Coin runs carve a clear lane: no tree may sit on the line they follow.
  let laneX: number | null = null;
  if (rand(s) < 0.16) {
    laneX = margin + 30 + rand(s) * (s.width - 2 * margin - 60);
    const count = 4 + Math.floor(rand(s) * 3);
    const arc = rand(s) < 0.5;
    const swing = (rand(s) - 0.5) * 90;
    for (let i = 0; i < count; i++) {
      const cx = laneX + (arc ? Math.sin((i / (count - 1)) * Math.PI) * swing : 0);
      s.coinList.push({ x: cx, y: y + i * 34, taken: false, phase: rand(s) * Math.PI * 2 });
    }
  }

  const trees = 1 + Math.floor(rand(s) * (1.6 + d * 2.4));
  for (let i = 0; i < trees; i++) {
    const x = margin + rand(s) * (s.width - 2 * margin);
    if (laneX !== null && Math.abs(x - laneX) < 70) continue;
    // Keep the opening of a run gentle: the first stretch is clear down the
    // middle, where every run begins. Guarded by position, not phase, because
    // these rows are laid out before the run starts.
    if (y < s.height * 1.5 && Math.abs(x - s.width / 2) < 80) continue;
    s.trees.push({ x, y: y + rand(s) * 30, scale: 0.72 + rand(s) * 0.55, kind: pickKind(rand(s)) });
  }
}

function emit(s: State, x: number, y: number, vx: number, vy: number, size: number, life: number) {
  const p = s.particles.find((q) => !q.alive);
  if (!p) return;
  p.x = x; p.y = y; p.vx = vx; p.vy = vy;
  p.size = size; p.life = life; p.max = life; p.alive = true;
}

function burst(s: State, x: number, y: number, count: number, force: number) {
  for (let i = 0; i < count; i++) {
    const a = rand(s) * Math.PI * 2;
    const v = force * (0.3 + rand(s));
    emit(s, x, y, Math.cos(a) * v, Math.sin(a) * v - force * 0.4, 1.5 + rand(s) * 2.5, 0.5 + rand(s) * 0.5);
  }
}

/** Advances the world by exactly one fixed step. */
export function step(s: State, input: Input) {
  s.time += STEP;

  // Particles and floaters keep settling in every phase, including the crash.
  for (const p of s.particles) {
    if (!p.alive) continue;
    p.life -= STEP;
    if (p.life <= 0) { p.alive = false; continue; }
    p.vx *= 0.94;
    p.vy = p.vy * 0.94 + 60 * STEP;
    p.x += p.vx * STEP;
    p.y += p.vy * STEP;
  }
  for (const f of s.floaters) f.life -= STEP;
  s.floaters = s.floaters.filter((f) => f.life > 0);
  for (const c of s.coinList) c.phase += STEP * 5;

  if (s.phase === 'crashed') {
    s.crashTime += STEP;
    s.speed *= 0.9;
    s.y += s.speed * STEP;
    if (s.crashTime > 1.1) s.phase = 'over';
    return;
  }
  if (s.phase !== 'running') return;

  const d = difficulty(s);
  const maxSpeed = 330 + d * 250;

  // Steering: the keyboard sets a heading directly; the pointer steers the
  // skis toward wherever it points, like leaning into the fall line.
  let target: number;
  if (input.steer !== 0) {
    target = input.steer * MAX_HEADING;
  } else if (input.pointerX !== null) {
    target = Math.max(-1, Math.min(1, (input.pointerX - s.x) / 140)) * MAX_HEADING;
  } else {
    target = s.heading * 0.985;
  }

  const prev = s.heading;
  const delta = Math.max(-TURN_RATE * STEP, Math.min(TURN_RATE * STEP, target - s.heading));
  s.heading += delta;
  s.carve = s.carve * 0.85 + (Math.abs(s.heading - prev) / STEP) * 0.15;

  // Fastest straight down the fall line, bleeding speed across it.
  const fall = Math.cos(s.heading) ** 2;
  const wanted = MIN_SPEED + (maxSpeed - MIN_SPEED) * fall;
  s.speed += (wanted - s.speed) * (wanted > s.speed ? 0.9 : 2.2) * STEP;

  const vx = Math.sin(s.heading) * s.speed;
  const vy = Math.cos(s.heading) * s.speed;
  s.x += vx * STEP;
  s.y += vy * STEP;

  // The slope has edges: glance off them rather than stopping dead.
  const edge = 14;
  if (s.x < edge) { s.x = edge; s.heading = Math.abs(s.heading) * 0.5; }
  if (s.x > s.width - edge) { s.x = s.width - edge; s.heading = -Math.abs(s.heading) * 0.5; }

  // Trail samples, spaced by distance travelled so they look the same at any speed.
  s.sinceTrail += s.speed * STEP;
  if (s.sinceTrail >= TRAIL_SPACING) {
    s.sinceTrail = 0;
    s.trail.push({ x: s.x, y: s.y, heading: s.heading });
    if (s.trail.length > TRAIL_MAX) s.trail.shift();
  }

  // Spray off the downhill edge of the skis when carving hard.
  if (s.carve > 0.9) {
    const side = Math.sign(s.heading - prev) || 1;
    const count = Math.min(4, Math.floor(s.carve / 1.2));
    for (let i = 0; i < count; i++) {
      emit(
        s,
        s.x - side * 6,
        s.y + 4,
        -side * (50 + rand(s) * 90) + vx * 0.1,
        -30 - rand(s) * 50,
        1.2 + rand(s) * 2,
        0.35 + rand(s) * 0.35,
      );
    }
  }

  // Coins.
  for (const c of s.coinList) {
    if (c.taken) continue;
    if (Math.hypot(c.x - s.x, c.y - s.y) < 20) {
      c.taken = true;
      s.coins += 1;
      s.floaters.push({ x: c.x, y: c.y, life: 0.8 });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        emit(s, c.x, c.y, Math.cos(a) * 110, Math.sin(a) * 110, 1.6, 0.4);
      }
    }
  }

  // Obstacles: a forgiving ellipse per kind, smaller than what is drawn.
  for (const t of s.trees) {
    const [hx, hy] = HITBOX[t.kind];
    const dx = (s.x - t.x) / (hx * t.scale);
    const dy = (s.y - t.y) / (hy * t.scale);
    if (dx * dx + dy * dy < 1) {
      s.phase = 'crashed';
      s.crashTime = 0;
      burst(s, s.x, s.y, 36, 160);
      return;
    }
  }

  // Forget whatever has scrolled off the top.
  const top = cameraY(s) - 120;
  if (s.trees.length > 0 && s.trees[0].y < top) s.trees = s.trees.filter((t) => t.y >= top);
  if (s.coinList.length > 0 && s.coinList[0].y < top) s.coinList = s.coinList.filter((c) => c.y >= top);

  spawnAhead(s);
}
