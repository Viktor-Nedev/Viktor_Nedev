import type { Game } from './types';

const GH = 'https://github.com/Viktor-Nedev';

export const games: Game[] = [
  {
    slug: 'when-pigs-fly',
    name: 'When Pigs Fly!',
    tagline: {
      en: '3D endless runner, built on a hand-written engine',
      bg: '3D endless runner върху собствен енджин',
    },
    description: {
      en: 'A flying pig runs an infinite three-lane course through four biomes. No off-the-shelf game engine — the terrain streaming, spawners, particles and cosmetics economy are all custom Three.js and TypeScript.',
      bg: 'Летящо прасе тича по безкрайно трилентово трасе през четири биома. Без готов енджин — стриймингът на терена, спаунърите, частиците и икономиката на скиновете са изцяло на Three.js и TypeScript.',
    },
    stack: ['Three.js', 'TypeScript', 'Vite', 'WebGL'],
    image: 'games/when-pigs-fly-logo.webp',
    repo: `${GH}/WhenPigsFly`,
    live: 'https://when-pigs-fly.vercel.app',
    itch: 'https://viktor-nedev.itch.io/when-pigs-fly',
    highlights: [
      {
        en: 'Procedural chunked terrain with four biome stages',
        bg: 'Процедурен терен на парчета с четири биома',
      },
      {
        en: 'Per-biome obstacle spawners with lane-occupancy avoidance',
        bg: 'Спаунъри за препятствия по биом, с проверка за заета лента',
      },
      {
        en: '16 character skins and 7 wing sets, each individually rigged',
        bg: '16 скина и 7 комплекта криле, всеки нагласен поотделно',
      },
      {
        en: 'Preset-driven particle system and a saved coin economy',
        bg: 'Система за частици с пресети и запазваща се икономика с монети',
      },
    ],
  },
  {
    slug: 'crazy-golf',
    name: 'Crazy Golf',
    tagline: {
      en: 'Real-time minigolf for four players',
      bg: 'Миниголф за четирима в реално време',
    },
    description: {
      en: 'Up to four players on one course at once, every putt synced live. Built on plain JavaScript and Canvas with Supabase Realtime, and ranked first among every entry in its game jam.',
      bg: 'До четирима играчи на едно игрище едновременно, всеки удар синхронизиран на живо. Направена на чист JavaScript и Canvas със Supabase Realtime и класирана първа сред всички участници в своя game jam.',
    },
    stack: ['JavaScript', 'Canvas', 'Supabase Realtime'],
    repo: `${GH}/Crazy_Golf`,
    live: 'https://minigolf-blue.vercel.app',
    award: { en: '1st place — game jam', bg: 'Първо място — game jam' },
    highlights: [
      { en: 'Four players on one course, synced live', bg: 'Четирима играчи на едно игрище, синхронизирани на живо' },
      { en: 'No engine: physics and rendering on Canvas', bg: 'Без енджин: физика и рендер на Canvas' },
    ],
  },
  {
    slug: 'gourmet-adventures',
    name: 'Gourmet Adventures',
    tagline: {
      en: 'A 3D cooking game built in Unity',
      bg: '3D кулинарна игра, направена на Unity',
    },
    description: {
      en: 'A cooking game in Unity and C#, co-developed with a classmate. It took second place in the 3D games category at Softuniada 2024.',
      bg: 'Кулинарна игра на Unity и C#, разработена съвместно със съученик. Взе второ място в категория 3D игри на Softuniada 2024.',
    },
    stack: ['Unity', 'C#'],
    award: { en: '2nd place — Softuniada 2024', bg: 'Второ място — Softuniada 2024' },
    highlights: [
      { en: '3D games category, Softuniada 2024', bg: 'Категория 3D игри, Softuniada 2024' },
      { en: 'Built as a two-person team', bg: 'Направена в екип от двама' },
    ],
  },
];
