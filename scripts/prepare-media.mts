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
import { mkdir, stat, writeFile } from 'node:fs/promises';
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
  /** Seconds to trim from the start, to drop a letterboxed first frame. */
  trimStart?: number;
}

const CLIPS: Clip[] = [
  {
    file: 'Shot 01 — The name reveal.mp4',
    slug: 'name-reveal',
    width: 1280,
    crf: { av1: 44, h264: 30 },
    // Frame 0 carries a black window frame the rest of the clip does not.
    trimStart: 0.5,
  },
];

interface Art {
  file: string;
  slug: string;
  width: number;
  /** Lift a white studio background to transparency. */
  cutout?: boolean;
}

const ART: Art[] = [
  { file: 'Image 01 — Pine tree band.png', slug: 'pine-band', width: 2400 },
  { file: 'Image 02 — Single foreground pine.png', slug: 'pine-single', width: 900, cutout: true },
];

const mb = (bytes: number) => `${(bytes / 1048576).toFixed(2)} MB`;

async function encodeClip(clip: Clip) {
  const input = path.join(SRC, clip.file);
  if (!existsSync(input)) {
    console.error(`  MISSING  ${clip.file}`);
    return;
  }

  const trim = clip.trimStart ? ['-ss', String(clip.trimStart)] : [];
  const scale = `scale=${clip.width}:-2:flags=lanczos`;

  // -an drops audio: these are background loops and must never make sound.
  const webm = path.join(OUT_VIDEO, `${clip.slug}.webm`);
  await run('ffmpeg', [
    '-v', 'error', '-y', ...trim, '-i', input,
    '-an', '-vf', scale,
    '-c:v', 'libsvtav1', '-crf', String(clip.crf.av1), '-preset', '6',
    '-pix_fmt', 'yuv420p',
    webm,
  ]);

  const mp4 = path.join(OUT_VIDEO, `${clip.slug}.mp4`);
  await run('ffmpeg', [
    '-v', 'error', '-y', ...trim, '-i', input,
    '-an', '-vf', scale,
    '-c:v', 'libx264', '-crf', String(clip.crf.h264), '-preset', 'slow',
    '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    // faststart puts the index first so playback can begin while downloading.
    '-movflags', '+faststart',
    mp4,
  ]);

  // Poster: the first frame after any trim, so it matches what plays.
  const posterRaw = path.join(OUT_VIDEO, `${clip.slug}-poster-raw.png`);
  await run('ffmpeg', [
    '-v', 'error', '-y', ...trim, '-i', input,
    '-frames:v', '1', '-vf', scale, posterRaw,
  ]);
  await sharp(posterRaw).webp({ quality: 74 }).toFile(path.join(OUT_VIDEO, `${clip.slug}-poster.webp`));

  const lqipBuf = await sharp(posterRaw).resize(24).blur(1).webp({ quality: 40 }).toBuffer();
  await run('node', ['-e', `require('fs').unlinkSync(${JSON.stringify(posterRaw)})`]);

  const [w, m] = await Promise.all([stat(webm), stat(mp4)]);
  console.log(`  ok  ${clip.slug.padEnd(14)} webm ${mb(w.size).padStart(8)}   mp4 ${mb(m.size).padStart(8)}`);
  return { slug: clip.slug, lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}` };
}

async function encodeArt(art: Art) {
  const input = path.join(SRC, art.file);
  if (!existsSync(input)) {
    console.error(`  MISSING  ${art.file}`);
    return;
  }

  let img = sharp(input);

  if (art.cutout) {
    // The tree sits on a white studio background. Rebuilding alpha from
    // luminance keeps the soft snow edges that a hard key would chew up.
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const min = Math.min(r, g, b);
      // Fully opaque below 230, fading to clear at 250 - the range where the
      // white background meets the tree's own near-white snow.
      const alpha = min >= 250 ? 0 : min <= 230 ? 255 : Math.round(((250 - min) / 20) * 255);
      data[i + 3] = alpha;
    }
    img = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  }

  const resized = img.resize({ width: art.width, withoutEnlargement: true });
  const out = path.join(OUT_IMAGE, `${art.slug}.webp`);
  await resized.clone().webp({ quality: 86, alphaQuality: 90 }).toFile(out);

  const meta = await sharp(out).metadata();
  const s = await stat(out);
  console.log(`  ok  ${art.slug.padEnd(14)} ${meta.width}x${meta.height}  ${mb(s.size)}`);
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
