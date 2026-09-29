/**
 * Encodes the AI-generated footage and artwork for the web.
 *
 * Source clips come out of the generator as 720p MP4 with an audio track and
 * no size discipline. This strips the audio (background video must be
 * silent), encodes each clip twice so every browser gets a format it can
 * play, and writes a poster frame so nothing shows a blank box before load.
 *
 * Run after dropping new files in assets-src/media: npm run assets:media
 */
import sharp from 'sharp';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets-src/media');
const OUT_VIDEO = path.join(ROOT, 'public/video');
const OUT_IMAGE = path.join(ROOT, 'public/art');

interface Clip {
  file: string;
  slug: string;
  /** Target width; 1280 sources are not upscaled. */
  width: number;
  /** Constant Rate Factor - higher is smaller and softer. */
  crf: { av1: number; h264: number };
  /**
   * Seconds of crossfade used to close the loop, for clips whose first and
   * last frames do not match. The tail dissolves into the head, so the clip
   * ends on exactly the frame it starts on.
   */
  loopFade?: number;
}

const CLIPS: Clip[] = [
  {
    file: 'Next up — a new hero video.mp4',
    slug: 'hero-forest',
    width: 1280,
    // Soft cartoon shading has little fine detail to protect.
    crf: { av1: 42, h264: 29 },
    // The camera ends somewhere other than where it starts; without this the
    // hero jumps every ten seconds.
    loopFade: 1.4,
  },
];

interface Art {
  file: string;
  slug: string;
  width: number;
  /** Lift a white studio background to transparency. */
  cutout?: boolean;
  /**
   * Also fill the convex hull of the subject. For convex shapes whose
   * brightest highlight is pixel-identical to the backdrop (the rock's snow
   * cap reads 254,254,254, the same as the studio white), so no colour test
   * can tell them apart and only the shape can.
   *
   * A fraction of the image height: the hull is only applied above it. The
   * rock uses the full height - its leak runs down into the base snow, and
   * stopping short left a notch; filling the waist reads as drifted snow.
   */
  hull?: number;
}

const ART: Art[] = [
  { file: 'Image 01 — Pine tree band.png', slug: 'pine-band', width: 2400 },
  { file: 'Image 02 — Single foreground pine.png', slug: 'pine-single', width: 900, cutout: true },
  { file: 'Small bushy pine.png', slug: 'pine-bush', width: 700, cutout: true },
  { file: 'Snow-covered rock.png', slug: 'rock', width: 700, cutout: true, hull: 1 },
  // Already transparent: the game's own title card.
  { file: 'crazy golf.png', slug: 'crazy-golf-logo', width: 480 },
];

const mb = (bytes: number) => `${(bytes / 1048576).toFixed(2)} MB`;

async function duration(file: string): Promise<number> {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
  ]);
  return Number(stdout.trim());
}

/** The -filter_complex graph and output label for a clip. */
async function videoGraph(clip: Clip, input: string) {
  const scale = `scale=${clip.width}:-2:flags=lanczos`;
  if (!clip.loopFade) return { graph: `[0:v]${scale},format=yuv420p[v]`, label: '[v]' };

  // Body = everything after the first `d` seconds; head = the first `d`.
  // Dissolving the body's tail into the head means the output ends on the
  // head's frame at `d` - which is exactly the body's first frame.
  const d = clip.loopFade;
  const len = await duration(input);
  const offset = (len - d - d).toFixed(3);
  const graph = [
    `[0:v]${scale},split[a][b]`,
    `[a]trim=start=${d},setpts=PTS-STARTPTS[body]`,
    `[b]trim=end=${d},setpts=PTS-STARTPTS[head]`,
    `[body][head]xfade=transition=fade:duration=${d}:offset=${offset},format=yuv420p[v]`,
  ].join(';');
  return { graph, label: '[v]' };
}

async function encodeClip(clip: Clip) {
  const input = path.join(SRC, clip.file);
  if (!existsSync(input)) {
    console.error(`  MISSING  ${clip.file}`);
    return;
  }

  const { graph, label } = await videoGraph(clip, input);

  // -an drops audio: these are background loops and must never make sound.
  const webm = path.join(OUT_VIDEO, `${clip.slug}.webm`);
  await run('ffmpeg', [
    '-v', 'error', '-y', '-i', input,
    '-filter_complex', graph, '-map', label, '-an',
    '-c:v', 'libsvtav1', '-crf', String(clip.crf.av1), '-preset', '6',
    webm,
  ]);

  const mp4 = path.join(OUT_VIDEO, `${clip.slug}.mp4`);
  await run('ffmpeg', [
    '-v', 'error', '-y', '-i', input,
    '-filter_complex', graph, '-map', label, '-an',
    '-c:v', 'libx264', '-crf', String(clip.crf.h264), '-preset', 'slow',
    '-profile:v', 'high',
    // faststart puts the index first so playback can begin while downloading.
    '-movflags', '+faststart',
    mp4,
  ]);

  // Poster: frame 0 of the encoded clip itself, so it matches what plays.
  const posterRaw = path.join(OUT_VIDEO, `${clip.slug}-poster-raw.png`);
  await run('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-frames:v', '1', posterRaw]);
  await sharp(posterRaw).webp({ quality: 74 }).toFile(path.join(OUT_VIDEO, `${clip.slug}-poster.webp`));
  const lqipBuf = await sharp(posterRaw).resize(24).blur(1).webp({ quality: 40 }).toBuffer();
  await unlink(posterRaw);

  const [w, m] = await Promise.all([stat(webm), stat(mp4)]);
  console.log(`  ok  ${clip.slug.padEnd(16)} webm ${mb(w.size).padStart(8)}   mp4 ${mb(m.size).padStart(8)}`);
  return { slug: clip.slug, lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}` };
}

/**
 * Removes a white studio background.
 *
 * Flood-filled from the image border rather than keyed on brightness alone:
 * a snow cap is nearly as white as the backdrop, and a global threshold
 * punches holes straight through it. Only white that is connected to the
 * edge counts as background. The one-pixel rim around the subject is then
 * feathered by brightness, so edges stay soft instead of stair-stepped.
 */
async function cutout(input: string, hull?: number) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const n = w * h;

  const isBackdrop = (p: number) => {
    const i = p * c;
    const lo = Math.min(data[i], data[i + 1], data[i + 2]);
    const hi = Math.max(data[i], data[i + 1], data[i + 2]);
    // Near-white and near-neutral: studio white, not pale blue snow.
    return lo >= 236 && hi - lo <= 14;
  };

  const bg = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const seed = (p: number) => {
    if (!bg[p] && isBackdrop(p)) {
      bg[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    seed(y * w);
    seed(y * w + w - 1);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % w;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (p >= w) seed(p - w);
    if (p < n - w) seed(p + w);
  }

  if (hull) fillHull(bg, w, h, Math.round(h * hull));

  for (let p = 0; p < n; p++) {
    const i = p * c;
    if (bg[p]) {
      data[i + 3] = 0;
      continue;
    }
    const x = p % w;
    const touches =
      (x > 0 && bg[p - 1]) || (x < w - 1 && bg[p + 1]) || (p >= w && bg[p - w]) || (p < n - w && bg[p + w]);
    if (touches) {
      // Rim pixel: the lighter it is, the more of the backdrop it holds.
      const lo = Math.min(data[i], data[i + 1], data[i + 2]);
      data[i + 3] = Math.max(0, Math.min(255, Math.round(((255 - lo) / 40) * 255)));
    }
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } });
}

/**
 * Clears the background flag for every pixel inside the convex hull of the
 * subject. Built from each row's outermost subject pixels (monotone chain),
 * then filled row by row from the hull's edge crossings.
 */
function fillHull(bg: Uint8Array, w: number, h: number, above: number) {
  const pts: [number, number][] = [];
  for (let y = 0; y < h; y++) {
    let lo = -1;
    let hi = -1;
    for (let x = 0; x < w; x++) {
      if (!bg[y * w + x]) {
        if (lo < 0) lo = x;
        hi = x;
      }
    }
    if (lo >= 0) pts.push([lo, y], [hi, y]);
  }
  if (pts.length < 3) return;

  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const pt of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pt) <= 0) lower.pop();
    lower.push(pt);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const pt = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pt) <= 0) upper.pop();
    upper.push(pt);
  }
  const poly = [...lower.slice(0, -1), ...upper.slice(0, -1)];

  for (let y = 0; y < above; y++) {
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[(i + 1) % poly.length];
      if ((y < y1 && y < y2) || (y > y1 && y > y2) || y1 === y2) continue;
      const x = x1 + ((y - y1) / (y2 - y1)) * (x2 - x1);
      lo = Math.min(lo, x);
      hi = Math.max(hi, x);
    }
    if (lo > hi) continue;
    for (let x = Math.ceil(lo); x <= Math.floor(hi); x++) bg[y * w + x] = 0;
  }
}

async function encodeArt(art: Art) {
  const input = path.join(SRC, art.file);
  if (!existsSync(input)) {
    console.error(`  MISSING  ${art.file}`);
    return;
  }

  const img = art.cutout ? await cutout(input, art.hull) : sharp(input);
  const out = path.join(OUT_IMAGE, `${art.slug}.webp`);
  await img
    .resize({ width: art.width, withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(out);

  const meta = await sharp(out).metadata();
  const s = await stat(out);
  console.log(`  ok  ${art.slug.padEnd(16)} ${meta.width}x${meta.height}  ${mb(s.size)}`);
}

async function main() {
  await mkdir(OUT_VIDEO, { recursive: true });
  await mkdir(OUT_IMAGE, { recursive: true });

  console.log('Video:');
  const posters: Record<string, string> = {};
  for (const clip of CLIPS) {
    const r = await encodeClip(clip);
    if (r) posters[r.slug] = r.lqip;
  }

  console.log('\nArtwork:');
  for (const art of ART) await encodeArt(art);

  await writeFile(
    path.join(ROOT, 'src/data/media.generated.ts'),
    `// Generated by scripts/prepare-media.mts - do not edit by hand.\n\n` +
      `/** Blur placeholders for each clip's poster frame. */\n` +
      `export const posterLqip: Record<string, string> = ${JSON.stringify(posters, null, 2)};\n`,
    'utf8',
  );
  console.log('\nWrote src/data/media.generated.ts');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
