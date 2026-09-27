/**
 * Publishes the CV and renders its page-one preview.
 *
 * Source of truth is assets-src/Viktor_Nedev_CV.pdf. This copies it under a
 * clean ASCII name and renders a thumbnail, so the site never ships the
 * multi-megabyte original as an image.
 *
 * Run after replacing the CV: npm run assets:cv
 */
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';
import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'assets-src/Viktor_Nedev_CV.pdf');
const OUT_DIR = path.join(ROOT, 'public/cv');
/** pdfjs needs these on disk or text-only PDFs render without their glyphs. */
const STANDARD_FONTS = path
  .join(ROOT, 'node_modules/pdfjs-dist/standard_fonts/')
  .split(path.sep)
  .join('/');

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`Missing ${SOURCE}`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await copyFile(SOURCE, path.join(OUT_DIR, 'Viktor-Nedev-CV.pdf'));

  const doc = await pdf(SOURCE, {
    scale: 2,
    docInitParams: { standardFontDataUrl: STANDARD_FONTS },
  });
  const pages = doc.length;
  const page1 = await doc.getPage(1);
  await doc.destroy();

  // The rendered page is transparent; a CV belongs on white, not black.
  const flat = sharp(page1).flatten({ background: '#ffffff' });

  await flat
    .clone()
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(path.join(OUT_DIR, 'cv-preview.webp'));

  const lqipBuf = await flat.clone().resize(20).blur(1).webp({ quality: 40 }).toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuf.toString('base64')}`;

  console.log(`Published CV (${pages} pages) and preview.`);
  console.log('\nIf this differs from src/data/site.ts, update site.cv.lqip:');
  console.log(lqip);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
