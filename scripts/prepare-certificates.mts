/**
 * Converts source certificates (PDF + raster) into optimised web assets.
 *
 * No ImageMagick or poppler on this machine, so PDFs are rasterised through
 * pdfjs-dist + pdf-to-img. Source names contain spaces and parentheses,
 * so every file is addressed through an explicit map rather than a glob.
 *
 * Run once: npm run assets:certs   (output is committed)
 */
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** pdfjs needs these on disk or text-only PDFs render without their glyphs. */
const STANDARD_FONTS = path
  .join(ROOT, 'node_modules/pdfjs-dist/standard_fonts/')
  .replace(/\\/g, '/');
const HACK_SRC = 'C:/Programming/hakaton/certificates';
const SOFTUNI_SRC = 'C:/Programming/softuni/certificates';
const LONG_EDGE = 1600;

type Kind = 'win' | 'participation' | 'course';

interface Source {
  file: string;
  slug: string;
  group: 'hackathon' | 'softuni';
  kind: Kind;
  issuer: string;
  title: { bg: string; en: string };
  award: { bg: string; en: string };
  date: string; // ISO, for sorting
  dateLabel: { bg: string; en: string };
  credentialId?: string;
  verifyUrl?: string;
}

const SOURCES: Source[] = [
  // ---- Hackathon wins -----------------------------------------------------
  {
    file: `${HACK_SRC}/fridgeo.png`,
    slug: 'ship-in-a-day',
    group: 'hackathon',
    kind: 'win',
    issuer: 'SRM Institute of Science & Technology · GitHub Community SRM',
    title: { bg: 'Ship in a Day', en: 'Ship in a Day' },
    award: { bg: 'Първо място', en: 'First Place' },
    date: '2026-03-07',
    dateLabel: { bg: '7 март 2026', en: '7 March 2026' },
  },
  {
    file: `${HACK_SRC}/hack-earth.jpg`,
    slug: 'hack-earth-2026',
    group: 'hackathon',
    kind: 'win',
    issuer: 'HACK-EARTH 2026 · Action for Resilience',
    title: { bg: 'HACK-EARTH 2026', en: 'HACK-EARTH 2026' },
    award: { bg: 'Победител — проект ELIA', en: 'Winner — project ELIA' },
    date: '2026-02-01',
    dateLabel: { bg: '30 ян. – 1 февр. 2026', en: '30 Jan – 1 Feb 2026' },
  },
  // ---- Hackathon participation -------------------------------------------
  {
    file: `${HACK_SRC}/090_Viktor_Nedev.pdf`,
    slug: 'orchestra-hackathon',
    group: 'hackathon',
    kind: 'participation',
    issuer: 'Agent Orchestrator',
    title: { bg: 'The Orchestra Hackathon', en: 'The Orchestra Hackathon' },
    award: { bg: 'Участие', en: 'Participation' },
    date: '2026-08-13',
    dateLabel: { bg: '12–13 август 2026', en: '12–13 August 2026' },
  },
  {
    file: `${HACK_SRC}/NGN_Hacks_2026_Certificate_Viktor_Nedev_NGN2026-0045.pdf`,
    slug: 'ngn-hacks-2026',
    group: 'hackathon',
    kind: 'participation',
    issuer: 'NGN Hacks · Global Youth Hackathon',
    title: { bg: 'NGN Hacks 2026', en: 'NGN Hacks 2026' },
    award: { bg: 'Участие', en: 'Participation' },
    date: '2026-08-09',
    dateLabel: { bg: '7–9 август 2026', en: '7–9 August 2026' },
    credentialId: 'NGN2026-0045',
  },
  {
    file: `${HACK_SRC}/unitedhackv7.pdf`,
    slug: 'united-hacks-v7',
    group: 'hackathon',
    kind: 'participation',
    issuer: 'Hack United',
    title: { bg: 'United Hacks V7', en: 'United Hacks V7' },
    award: { bg: 'Участие', en: 'Participation' },
    date: '2026-07-12',
    dateLabel: { bg: '10–12 юли 2026', en: '10–12 July 2026' },
  },
  {
    file: `${HACK_SRC}/Viktor Nedev.pdf`,
    slug: 'avalon-vibe',
    group: 'hackathon',
    kind: 'participation',
    issuer: 'SK Avalon Enterprises',
    title: { bg: 'Avalon Vibe', en: 'Avalon Vibe' },
    award: { bg: 'Участие', en: 'Participation' },
    date: '2026-02-17',
    dateLabel: { bg: '15–17 февруари 2026', en: '15–17 February 2026' },
  },
  {
    file: `${HACK_SRC}/viktorcert.png`,
    slug: 'hack-a-agent',
    group: 'hackathon',
    kind: 'participation',
    issuer: 'Tech Z',
    title: { bg: 'Hack-A-Agent', en: 'Hack-A-Agent' },
    award: { bg: 'Участие', en: 'Participation' },
    date: '2026-02-25',
    dateLabel: { bg: 'февруари 2026', en: 'February 2026' },
  },
  {
    file: `${HACK_SRC}/Viktor_Certificate.png`,
    slug: 'oink-game-jam',
    group: 'hackathon',
    kind: 'participation',
    issuer: 'Oink Jam',
    title: { bg: 'Oink Game Jam 1', en: 'Oink Game Jam 1' },
    award: { bg: 'Постижение — When Pigs Fly!', en: 'Achievement — When Pigs Fly!' },
    date: '2026-07-09',
    dateLabel: { bg: 'юли 2026', en: 'July 2026' },
  },
  // ---- SoftUni C# path ----------------------------------------------------
  {
    file: `${SOFTUNI_SRC}/Programming Basics - September 2024 - Certificate.pdf`,
    slug: 'softuni-programming-basics',
    group: 'softuni',
    kind: 'course',
    issuer: 'SoftUni',
    title: { bg: 'Programming Basics', en: 'Programming Basics' },
    award: { bg: 'Оценка 6.00 / 6.00', en: 'Grade 6.00 / 6.00' },
    date: '2024-10-24',
    dateLabel: { bg: '24 октомври 2024', en: '24 October 2024' },
    verifyUrl: 'https://softuni.bg/Certificates/Details/227170/4eac71b2',
  },
  {
    file: `${SOFTUNI_SRC}/Programming Fundamentals with C# - January 2025 - Certificate.pdf`,
    slug: 'softuni-fundamentals-csharp',
    group: 'softuni',
    kind: 'course',
    issuer: 'SoftUni',
    title: { bg: 'Programming Fundamentals with C#', en: 'Programming Fundamentals with C#' },
    award: { bg: 'Оценка 6.00 / 6.00', en: 'Grade 6.00 / 6.00' },
    date: '2025-03-30',
    dateLabel: { bg: '30 март 2025', en: '30 March 2025' },
    verifyUrl: 'https://softuni.bg/Certificates/Details/239902/a801105d',
  },
  {
    file: `${SOFTUNI_SRC}/C# Advanced - May 2025 - Certificate.pdf`,
    slug: 'softuni-csharp-advanced',
    group: 'softuni',
    kind: 'course',
    issuer: 'SoftUni',
    title: { bg: 'C# Advanced', en: 'C# Advanced' },
    award: { bg: 'Оценка 6.00 / 6.00', en: 'Grade 6.00 / 6.00' },
    date: '2025-06-21',
    dateLabel: { bg: '21 юни 2025', en: '21 June 2025' },
    verifyUrl: 'https://softuni.bg/Certificates/Details/245151/3238b06d',
  },
  {
    file: `${SOFTUNI_SRC}/C# OOP - June 2025 - Certificate.pdf`,
    slug: 'softuni-csharp-oop',
    group: 'softuni',
    kind: 'course',
    issuer: 'SoftUni',
    title: { bg: 'C# OOP', en: 'C# OOP' },
    award: { bg: 'Оценка 6.00 / 6.00', en: 'Grade 6.00 / 6.00' },
    date: '2025-08-11',
    dateLabel: { bg: '11 август 2025', en: '11 August 2025' },
    verifyUrl: 'https://softuni.bg/Certificates/Details/248394/7677ec8d',
  },
  {
    file: `${SOFTUNI_SRC}/MS SQL - September 2025 - Certificate.pdf`,
    slug: 'softuni-ms-sql',
    group: 'softuni',
    kind: 'course',
    issuer: 'SoftUni',
    title: { bg: 'MS SQL', en: 'MS SQL' },
    award: { bg: 'Оценка 6.00 / 6.00', en: 'Grade 6.00 / 6.00' },
    date: '2025-10-13',
    dateLabel: { bg: '13 октомври 2025', en: '13 October 2025' },
    verifyUrl: 'https://softuni.bg/Certificates/Details/250914/5f42eca7',
  },
];

/**
 * Rasterise page 1 of a PDF to a PNG buffer.
 *
 * Only page 1 is the certificate itself - SoftUni PDFs carry the course
 * curriculum on pages 2+. Driving pdfjs directly against @napi-rs/canvas
 * segfaults on this machine, so this goes through pdf-to-img.
 */
async function pdfFirstPageToPng(file: string): Promise<Buffer> {
  const doc = await pdf(file, {
    scale: 2.4, // ~1400-2000px on A4/landscape; sharp downsizes to LONG_EDGE
    docInitParams: { standardFontDataUrl: STANDARD_FONTS },
  });
  try {
    return await doc.getPage(1);
  } finally {
    await doc.destroy();
  }
}

async function main() {
  const entries: string[] = [];

  for (const src of SOURCES) {
    if (!existsSync(src.file)) {
      console.error(`  MISSING  ${src.file}`);
      continue;
    }

    const dirName = src.group === 'softuni' ? 'softuni' : 'certificates';
    const outDir = path.join(ROOT, 'public', dirName);
    await mkdir(path.join(outDir, 'pdf'), { recursive: true });

    const isPdf = src.file.toLowerCase().endsWith('.pdf');
    const raw = isPdf ? await pdfFirstPageToPng(src.file) : await readFile(src.file);

    // Rendered PDF pages have a transparent ground; certificates belong on white.
    const img = sharp(raw)
      .flatten({ background: '#ffffff' })
      .resize({
        width: LONG_EDGE,
        height: LONG_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      });
    const meta = await img.metadata();

    await img.clone().webp({ quality: 82 }).toFile(path.join(outDir, `${src.slug}.webp`));
    await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(outDir, `${src.slug}.jpg`));

    // Tiny blurred placeholder, inlined so cards never flash empty.
    const lqipBuf = await sharp(raw).flatten({ background: "#ffffff" }).resize(24).blur(1).webp({ quality: 40 }).toBuffer();
    const lqip = `data:image/webp;base64,${lqipBuf.toString('base64')}`;

    // Keep the original PDF downloadable under an ASCII-safe name.
    let pdfPath: string | undefined;
    if (isPdf) {
      await copyFile(src.file, path.join(outDir, 'pdf', `${src.slug}.pdf`));
      pdfPath = `${dirName}/pdf/${src.slug}.pdf`;
    }

    const optional = [
      pdfPath ? `\n    pdf: ${JSON.stringify(pdfPath)},` : '',
      src.credentialId ? `\n    credentialId: ${JSON.stringify(src.credentialId)},` : '',
      src.verifyUrl ? `\n    verifyUrl: ${JSON.stringify(src.verifyUrl)},` : '',
    ].join('');

    entries.push(`  {
    slug: ${JSON.stringify(src.slug)},
    group: ${JSON.stringify(src.group)},
    kind: ${JSON.stringify(src.kind)},
    issuer: ${JSON.stringify(src.issuer)},
    title: ${JSON.stringify(src.title)},
    award: ${JSON.stringify(src.award)},
    date: ${JSON.stringify(src.date)},
    dateLabel: ${JSON.stringify(src.dateLabel)},
    image: ${JSON.stringify(`${dirName}/${src.slug}.webp`)},
    fallback: ${JSON.stringify(`${dirName}/${src.slug}.jpg`)},
    width: ${meta.width ?? 0},
    height: ${meta.height ?? 0},
    lqip: ${JSON.stringify(lqip)},${optional}
  }`);

    console.log(`  ok  ${src.slug.padEnd(30)} ${meta.width}x${meta.height}`);
  }

  const file = `// Generated by scripts/prepare-certificates.mts - do not edit by hand.
import type { Certificate } from './types';

export const certificates: Certificate[] = [
${entries.join(',\n')},
];
`;
  await writeFile(path.join(ROOT, 'src/data/certificates.generated.ts'), file, 'utf8');
  console.log(`\nWrote ${entries.length} certificates.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
