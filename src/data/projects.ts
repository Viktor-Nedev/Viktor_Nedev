import type { Project } from './types';

const GH = 'https://github.com/Viktor-Nedev';
const DP = 'https://devpost.com/viktornedev08';

/**
 * Hand-curated projects with a real write-up. Only the few named in
 * FEATURED below are shown on the site.
 */
export const projects: Project[] = [
  {
    slug: 'elia',
    name: 'ELIA',
    tagline: {
      en: 'Environmental Lifecycle Intelligence Assistant',
      bg: 'Асистент за екологичен жизнен цикъл',
    },
    description: {
      en: 'An AI companion for living more sustainably: track habits, learn through play, and see your real-world impact visualised.',
      bg: 'AI спътник за по-устойчив живот: следи навици, учи чрез игра и визуализира реалното ти въздействие.',
    },
    stack: ['TypeScript', 'React', 'AI'],
    repo: `${GH}/ELIA`,
    live: 'https://elia-theta.vercel.app',
    devpost: DP,
    award: { en: 'Winner — HACK-EARTH 2026', bg: 'Победител — HACK-EARTH 2026' },
  },
  {
    slug: 'fridgeo',
    name: 'Fridgeo',
    tagline: {
      en: 'Highly visual recipe-finding app',
      bg: 'Силно визуално приложение за рецепти',
    },
    description: {
      en: 'Tell it what is in your fridge and it finds what you can cook. Built in a single day and it won the buildathon.',
      bg: 'Казваш какво имаш в хладилника, а то намира какво можеш да сготвиш. Направено за един ден и спечели buildathon-а.',
    },
    stack: ['Svelte', 'JavaScript'],
    repo: `${GH}/Fridgeo`,
    devpost: DP,
    award: { en: '1st Place — Ship in a Day', bg: 'Първо място — Ship in a Day' },
  },
  {
    slug: 'nourish',
    name: 'Nourish',
    tagline: {
      en: 'Surplus food, matched to shelters in real time',
      bg: 'Излишна храна, свързана с приюти в реално време',
    },
    description: {
      en: 'A platform that automatically connects surplus food with shelters and volunteer drivers, so less of it goes to waste.',
      bg: 'Платформа, която автоматично свързва излишната храна с приюти и доброволци шофьори, за да се разхищава по-малко.',
    },
    stack: ['Jac', 'AI'],
    repo: `${GH}/Nourish`,
    devpost: DP,
    award: { en: 'Hackathon winner', bg: 'Победител в хакатон' },
  },
  {
    slug: 'huddle',
    name: 'Huddle',
    tagline: {
      en: 'AI form coach and pickup-game finder',
      bg: 'AI треньор за техника и търсене на игри',
    },
    description: {
      en: 'Check your form with your camera, find a game near you, and train with people instead of alone. Ships as a PWA.',
      bg: 'Проверява техниката ти през камерата, намира игра наблизо и те кара да тренираш с хора, вместо сам. PWA приложение.',
    },
    stack: ['TypeScript', 'React', 'PWA'],
    repo: `${GH}/Huddle`,
    live: 'https://huddle-indol-phi.vercel.app',
    devpost: DP,
    award: { en: 'Hackathon winner', bg: 'Победител в хакатон' },
  },
  {
    slug: 'grabme',
    name: 'Grabme',
    tagline: {
      en: 'Food rescue at neighbourhood scale',
      bg: 'Спасяване на храна в мащаба на квартала',
    },
    description: {
      en: 'Built for food rescue, hunger response and neighbourhood-scale coordination between people who have and people who need.',
      bg: 'Създадено за спасяване на храна, борба с глада и координация в квартала между тези, които имат, и тези, които имат нужда.',
    },
    stack: ['TypeScript', 'React'],
    repo: `${GH}/Grabme`,
    live: 'https://grabme-bay.vercel.app',
    devpost: DP,
    award: { en: 'Hackathon winner', bg: 'Победител в хакатон' },
  },
  {
    slug: 'claryx',
    name: 'Claryx',
    tagline: {
      en: 'Assistive tools, all in one place',
      bg: 'Помощни инструменти, събрани на едно място',
    },
    description: {
      en: 'Accessibility tooling for visual, motor and cognitive needs, gathered into a single system instead of a dozen scattered extensions.',
      bg: 'Инструменти за достъпност при зрителни, двигателни и когнитивни нужди, събрани в една система вместо десетина разпръснати разширения.',
    },
    stack: ['TypeScript', 'React'],
    repo: `${GH}/Claryx`,
    live: 'https://claryx-9src.vercel.app/',
  },
  {
    slug: 'domus',
    name: 'Domus',
    tagline: {
      en: 'Connecting displaced families with safe housing',
      bg: 'Свързва разселени семейства с безопасен дом',
    },
    description: {
      en: 'An AI-powered platform that matches displaced families to safe housing, and the people offering it to the people who need it.',
      bg: 'Платформа с изкуствен интелект, която свързва разселени семейства с безопасно жилище и хората, които предлагат, с тези, които търсят.',
    },
    stack: ['TypeScript', 'React', 'AI'],
    repo: `${GH}/Domus`,
    live: 'https://domus-seven-pi.vercel.app',
  },
  {
    slug: 'transcriptio',
    name: 'Transcriptio',
    tagline: {
      en: 'An AI translator that runs offline',
      bg: 'AI преводач, който работи офлайн',
    },
    description: {
      en: 'On-device translation using Melange AI models, so it keeps working with no connection and nothing leaves the machine.',
      bg: 'Превод директно на устройството с модели на Melange AI — работи без интернет и нищо не напуска машината.',
    },
    stack: ['JavaScript', 'AI'],
    repo: `${GH}/Transcriptio`,
  },
  {
    slug: 'animatch',
    name: 'Animatch',
    tagline: {
      en: 'ASP.NET project for the SoftUni module',
      bg: 'ASP.NET проект за модула в SoftUni',
    },
    description: {
      en: 'A full server-rendered application in C# and ASP.NET with Entity Framework and a relational schema behind it.',
      bg: 'Пълноценно сървърно приложение на C# и ASP.NET с Entity Framework и релационна схема отзад.',
    },
    stack: ['C#', 'ASP.NET', 'Entity Framework', 'SQL'],
    repo: `${GH}/Animatch`,
  },
  {
    slug: 'cognix',
    name: 'Cognix',
    tagline: {
      en: 'The decision engine that shows its mind at work',
      bg: 'Машина за решения, която показва как мисли',
    },
    description: {
      en: 'A reasoning tool that makes its own decision process visible rather than handing over an unexplained answer.',
      bg: 'Инструмент за разсъждение, който показва процеса си на решаване, вместо да поднесе необяснен отговор.',
    },
    stack: ['TypeScript', 'AI'],
    repo: `${GH}/Cognix`,
    live: 'https://cognix-omega.vercel.app',
  },
  {
    slug: 'chorus',
    name: 'Chorus',
    tagline: {
      en: 'Your webcam and microphone as a paintbrush',
      bg: 'Уеб камерата и микрофонът като четка',
    },
    description: {
      en: 'Turns movement and sound into visuals in the browser, painting from whatever the camera and mic pick up.',
      bg: 'Превръща движение и звук във визуализация в браузъра, рисувайки от това, което камерата и микрофонът улавят.',
    },
    stack: ['JavaScript', 'WebAudio', 'Canvas'],
    repo: `${GH}/chorus`,
    live: 'https://chorus-wheat.vercel.app',
  },
  {
    slug: 'helion',
    name: 'Helion',
    tagline: {
      en: 'Healthcare, unified',
      bg: 'Здравеопазване на едно място',
    },
    description: {
      en: 'A platform bringing AI symptom intelligence, doctor consultations, community care and personal health analytics together.',
      bg: 'Платформа, която обединява AI анализ на симптоми, консултации с лекари, обществена грижа и лична здравна аналитика.',
    },
    stack: ['JavaScript', 'React', 'AI'],
    repo: `${GH}/Helion`,
  },
  {
    slug: 'maharashtra',
    name: 'Maharashtra',
    tagline: {
      en: 'Discover, compare and book adventures',
      bg: 'Откривай, сравнявай и резервирай преживявания',
    },
    description: {
      en: 'A full-stack travel platform for finding and booking adventures across Maharashtra.',
      bg: 'Full-stack платформа за откриване и резервиране на преживявания в Махаращра.',
    },
    stack: ['TypeScript', 'React'],
    repo: `${GH}/Maharashtra`,
    live: 'https://maharashtra-kappa.vercel.app',
  },
  {
    slug: 'genza',
    name: 'Genza',
    tagline: {
      en: 'Translating slang across generations',
      bg: 'Превежда жаргон между поколенията',
    },
    description: {
      en: 'Translates slang, tone and cultural context between Gen Z and adults, in both directions.',
      bg: 'Превежда жаргон, тон и културен контекст между поколение Z и възрастните, в двете посоки.',
    },
    stack: ['TypeScript', 'AI'],
    repo: `${GH}/Genza`,
    live: 'https://genza-five.vercel.app',
  },
  {
    slug: 'zoodle',
    name: 'Zoodle',
    tagline: { en: 'Flutter mobile app', bg: 'Мобилно приложение с Flutter' },
    description: {
      en: 'A cross-platform mobile app built with Flutter and Dart.',
      bg: 'Мобилно приложение за няколко платформи, направено с Flutter и Dart.',
    },
    stack: ['Dart', 'Flutter'],
    repo: `${GH}/Zoodle`,
  },
  {
    slug: 'smartcity',
    name: 'SmartCity',
    tagline: { en: 'School practice project, 2026', bg: 'Проект от практиката, 2026' },
    description: {
      en: 'A Flutter application built during school practice in 2026.',
      bg: 'Приложение с Flutter, разработено по време на училищната практика през 2026.',
    },
    stack: ['Dart', 'Flutter'],
    repo: `${GH}/SmartCity`,
  },
];

/**
 * The showcase, in display order. An explicit list rather than a flag on each
 * project, so the order is stated once and cannot drift with the array.
 */
const FEATURED = ['elia', 'chorus', 'huddle', 'maharashtra'] as const;

export const featuredProjects: Project[] = FEATURED.map((slug) => {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Featured project "${slug}" is not in projects.ts`);
  return project;
});
