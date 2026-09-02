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
    tagline: { en: 'Minigolf in the browser', bg: 'Миниголф в браузъра' },
    description: {
      en: 'A physics-driven minigolf game that runs entirely in the browser — aim, judge the power, and watch the ball actually behave.',
      bg: 'Миниголф с физика, който работи изцяло в браузъра — прицелваш се, преценяваш силата и топката се държи както трябва.',
    },
    stack: ['JavaScript', 'Three.js', 'WebGL'],
    repo: `${GH}/Crazy_Golf`,
    live: 'https://minigolf-blue.vercel.app',
    highlights: [
      { en: 'Real-time physics and collision response', bg: 'Физика и сблъсъци в реално време' },
      { en: 'Runs in any browser, no install', bg: 'Работи във всеки браузър, без инсталация' },
    ],
  },
  {
    slug: 'blackwood-manor',
    name: 'Mystery of the Blackwood Manor',
    tagline: { en: 'A detective game about paying attention', bg: 'Детективска игра за внимание към детайла' },
    description: {
      en: 'Gather clues, interrogate suspects and reason your way to the answer. Built around logic puzzles rather than reflexes.',
      bg: 'Събираш улики, разпитваш заподозрени и стигаш до отговора с разсъждение. Изградена върху логически пъзели, не върху рефлекси.',
    },
    stack: ['JavaScript', 'Web'],
    repo: `${GH}/misterygame`,
    live: 'https://misterygame-flax.vercel.app',
    highlights: [
      { en: 'Clue gathering and suspect interrogation', bg: 'Събиране на улики и разпит на заподозрени' },
      { en: 'Logic puzzles as the core mechanic', bg: 'Логически пъзели като основна механика' },
    ],
  },
];
