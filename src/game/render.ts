/**
 * Downhill - drawing.
 *
 * Everything on the slope is white on white, so readability comes from cold
 * shadows and tinted spray rather than outlines. Trees and the skier are
 * depth-sorted by their base, so the skier passes correctly in front of and
 * behind the pines.
 */
import { cameraY, type State } from './engine';

export interface Sprites {
  tree: HTMLImageElement | null;
}

const INK = '#0d2438';
const TEAL = '#0b7590';
const GOLD_RIM = '#9a5b00';
/** The skier is the subject of the scene; drawn a little larger than life. */
const SKIER_SCALE = 1.3;

let snowTile: HTMLCanvasElement | null = null;

/** A faint mogul-and-sparkle texture, tiled and scrolled under everything. */
function getSnowTile(): HTMLCanvasElement {
  if (snowTile) return snowTile;
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  let seed = 7;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // Every mark is drawn at all nine tile offsets, so anything crossing an
  // edge reappears on the opposite side. Without this the tile seams show as
  // a checkerboard of clipped shading.
  const wrapped = (fn: (ox: number, oy: number) => void) => {
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) fn(ox, oy);
  };

  // Moguls: soft cool shadows on the downhill side of each bump. Drawn as
  // scaled circles, since a radial gradient on a squashed ellipse leaves a
  // hard rim where the gradient stops short of the shape.
  for (let i = 0; i < 12; i++) {
    const x = r() * size, y = r() * size, w = 26 + r() * 38;
    wrapped((ox, oy) => {
      g.save();
      g.translate(x + ox, y + oy);
      g.scale(1, 0.45);
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, w);
      grad.addColorStop(0, 'rgba(120,160,200,0.075)');
      grad.addColorStop(1, 'rgba(120,160,200,0)');
      g.fillStyle = grad;
      g.fillRect(-w, -w, w * 2, w * 2);
      g.restore();
    });
  }
  // Sparkle, and a few cold specks for grain.
  for (let i = 0; i < 70; i++) {
    const x = r() * size, y = r() * size, a = 0.5 + r() * 0.5;
    wrapped((ox, oy) => {
      g.fillStyle = `rgba(255,255,255,${a})`;
      g.fillRect(x + ox, y + oy, 1.2, 1.2);
    });
  }
  for (let i = 0; i < 40; i++) {
    const x = r() * size, y = r() * size;
    wrapped((ox, oy) => {
      g.fillStyle = 'rgba(140,175,210,0.18)';
      g.fillRect(x + ox, y + oy, 1, 1);
    });
  }
  snowTile = c;
  return c;
}

function drawGround(ctx: CanvasRenderingContext2D, s: State, camY: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, s.height);
  bg.addColorStop(0, '#f8fbfe');
  bg.addColorStop(1, '#e3edf7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s.width, s.height);

  const tile = getSnowTile();
  const size = tile.width;
  const offset = -(((camY % size) + size) % size);
  for (let y = offset; y < s.height; y += size) {
    for (let x = 0; x < s.width; x += size) ctx.drawImage(tile, x, y);
  }
}

function drawTrail(ctx: CanvasRenderingContext2D, s: State, camY: number) {
  const pts = s.trail;
  if (pts.length < 2) return;

  // Older track fades: split the run into bands of rising opacity.
  const bands = 12;
  const per = Math.ceil(pts.length / bands);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.7;

  for (let b = 0; b < bands; b++) {
    const from = b * per;
    const to = Math.min(pts.length - 1, from + per);
    if (to <= from) continue;
    const alpha = 0.05 + (b / (bands - 1)) * 0.33;

    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let i = from; i <= to; i++) {
        const p = pts[i];
        // Perpendicular to the direction of travel: two parallel ski tracks.
        const ox = Math.cos(p.heading) * 4.2 * side;
        const oy = -Math.sin(p.heading) * 4.2 * side;
        const x = p.x + ox;
        const y = p.y + oy - camY;
        if (i === from) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(78,120,165,${alpha})`;
      ctx.stroke();
    }
  }
}

function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, phase: number) {
  // Spin is a horizontal squash; it never collapses fully, so a coin
  // edge-on is still visibly a coin.
  const squash = Math.max(0.2, Math.abs(Math.cos(phase)));
  const bob = Math.sin(phase * 0.6) * 1.5;

  ctx.fillStyle = 'rgba(30,70,110,0.14)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 10, 7 * squash + 2, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(squash, 1);

  const face = ctx.createRadialGradient(-2.5, -3, 1, 0, 0, 9);
  face.addColorStop(0, '#ffe28a');
  face.addColorStop(0.6, '#f2b640');
  face.addColorStop(1, '#cf8a1d');
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = GOLD_RIM;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 5.4, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(154,91,0,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // A small snowflake struck into the face.
  ctx.strokeStyle = 'rgba(154,91,0,0.7)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI;
    ctx.moveTo(Math.cos(a) * 3.2, Math.sin(a) * 3.2);
    ctx.lineTo(-Math.cos(a) * 3.2, -Math.sin(a) * 3.2);
  }
  ctx.stroke();

  ctx.restore();
}

function drawTree(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, scale: number) {
  // Pines stand well over the skier, or the slope reads as shrubs.
  const h = 108 * scale;

  // Shadow thrown down-right, as if lit from the upper left.
  ctx.fillStyle = 'rgba(30,70,110,0.13)';
  ctx.beginPath();
  ctx.ellipse(x + 8 * scale, y + 2, 20 * scale, 5.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  if (img && img.complete && img.naturalWidth > 0) {
    const w = h * (img.naturalWidth / img.naturalHeight);
    // The trunk base sits a few percent above the image bottom.
    ctx.drawImage(img, x - w / 2, y - h * 0.97, w, h);
    return;
  }

  // Vector fallback while the sprite loads.
  ctx.fillStyle = '#5c4636';
  ctx.fillRect(x - 2 * scale, y - 8 * scale, 4 * scale, 8 * scale);
  for (let i = 0; i < 3; i++) {
    const tierY = y - 8 * scale - i * 18 * scale;
    const half = (22 - i * 5) * scale;
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.moveTo(x - half, tierY);
    ctx.lineTo(x + half, tierY);
    ctx.lineTo(x, tierY - 26 * scale);
    ctx.closePath();
    ctx.fill();
  }
}

function drawSkier(ctx: CanvasRenderingContext2D, s: State, x: number, y: number) {
  const crashed = s.phase === 'crashed' || s.phase === 'over';
  // Tumble eases out into a sprawl rather than spinning forever.
  const tumble = crashed ? (1 - Math.exp(-s.crashTime * 6)) * Math.PI * 1.45 * (s.heading >= 0 ? 1 : -1) : 0;
  const lean = crashed ? 0 : Math.max(-0.35, Math.min(0.35, s.heading * 0.45));

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(SKIER_SCALE, SKIER_SCALE);

  ctx.fillStyle = 'rgba(30,70,110,0.18)';
  ctx.beginPath();
  ctx.ellipse(4, 3, 13, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.rotate(tumble);

  // Skis lie on the snow along the direction of travel.
  ctx.save();
  ctx.rotate(-s.heading);
  for (const side of [-1, 1]) {
    ctx.fillStyle = INK;
    roundRect(ctx, side * 4.2 - 1.7, -12, 3.4, 30, 1.7);
    ctx.fill();
    ctx.fillStyle = TEAL;
    ctx.fillRect(side * 4.2 - 0.6, -6, 1.2, 16);
    // Upturned tips, downhill.
    ctx.fillStyle = '#2a4a63';
    roundRect(ctx, side * 4.2 - 1.7, 15, 3.4, 4, 1.7);
    ctx.fill();
  }
  ctx.restore();

  // Body, leaning into the turn.
  ctx.save();
  ctx.rotate(lean);

  // Poles, planted behind and outside.
  ctx.strokeStyle = '#3d5870';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 8, -17);
    ctx.lineTo(side * 12, -2);
    ctx.stroke();
  }

  // Legs.
  ctx.fillStyle = INK;
  roundRect(ctx, -5.2, -11, 3.6, 11, 1.6);
  ctx.fill();
  roundRect(ctx, 1.6, -11, 3.6, 11, 1.6);
  ctx.fill();

  // Jacket.
  const jacket = ctx.createLinearGradient(-7, -25, 7, -10);
  jacket.addColorStop(0, '#1597b8');
  jacket.addColorStop(1, TEAL);
  ctx.fillStyle = jacket;
  roundRect(ctx, -7, -25, 14, 15, 5);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(-7, -18.5, 14, 1.6);

  // Arms reaching to the poles.
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 3.2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 5.5, -22);
    ctx.lineTo(side * 8.2, -16.5);
    ctx.stroke();
  }

  // Head, goggles, bobble hat.
  ctx.fillStyle = '#f1c9a5';
  ctx.beginPath();
  ctx.arc(0, -29, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  roundRect(ctx, -4.2, -30, 8.4, 2.6, 1.3);
  ctx.fill();
  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.arc(0, -31, 4.9, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -36.2, 2.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Reused between frames so the depth sort allocates nothing. */
const drawables: { y: number; kind: 0 | 1; i: number }[] = [];

export function draw(ctx: CanvasRenderingContext2D, s: State, sprites: Sprites) {
  const camY = cameraY(s);
  drawGround(ctx, s, camY);
  drawTrail(ctx, s, camY);

  for (const c of s.coinList) {
    if (c.taken) continue;
    const sy = c.y - camY;
    if (sy < -20 || sy > s.height + 20) continue;
    drawCoin(ctx, c.x, sy, c.phase);
  }

  // Depth sort trees and skier by where they meet the snow.
  drawables.length = 0;
  for (let i = 0; i < s.trees.length; i++) {
    const t = s.trees[i];
    const sy = t.y - camY;
    if (sy < -10 || sy > s.height + 130) continue;
    drawables.push({ y: t.y, kind: 0, i });
  }
  drawables.push({ y: s.y, kind: 1, i: 0 });
  drawables.sort((a, b) => a.y - b.y);

  for (const d of drawables) {
    if (d.kind === 0) {
      const t = s.trees[d.i];
      drawTree(ctx, sprites.tree, t.x, t.y - camY, t.scale);
    } else {
      drawSkier(ctx, s, s.x, s.y - camY);
    }
  }

  // Spray. Snow on snow is invisible, so particles carry a cool tint.
  for (const p of s.particles) {
    if (!p.alive) continue;
    const a = p.life / p.max;
    ctx.fillStyle = `rgba(168,202,232,${0.85 * a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y - camY, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = '600 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (const f of s.floaters) {
    const a = Math.min(1, f.life / 0.5);
    ctx.fillStyle = `rgba(154,91,0,${a})`;
    ctx.fillText('+10', f.x, f.y - camY - 14 - (0.8 - f.life) * 40);
  }

  // Top fade: the slope drops away uphill instead of ending at a hard edge.
  const fade = ctx.createLinearGradient(0, 0, 0, s.height * 0.22);
  fade.addColorStop(0, 'rgba(248,251,254,0.95)');
  fade.addColorStop(1, 'rgba(248,251,254,0)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, s.width, s.height * 0.22);

  const vignette = ctx.createRadialGradient(
    s.width / 2, s.height / 2, Math.min(s.width, s.height) * 0.35,
    s.width / 2, s.height / 2, Math.max(s.width, s.height) * 0.75,
  );
  vignette.addColorStop(0, 'rgba(13,47,82,0)');
  vignette.addColorStop(1, 'rgba(13,47,82,0.1)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, s.width, s.height);
}
