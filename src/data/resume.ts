import type { Localized } from './types';

export interface TimelineEntry {
  id: string;
  period: Localized;
  role: Localized;
  org: Localized;
  detail: Localized;
  kind: 'work' | 'education' | 'award';
}

/** Experience and education, sourced from the CV. */
export const timeline: TimelineEntry[] = [
  {
    id: 'valtech',
    period: { en: '2025', bg: '2025' },
    role: { en: 'Software Development Intern', bg: 'Стажант софтуерна разработка' },
    org: { en: 'Valtech', bg: 'Valtech' },
    detail: {
      en: 'First-hand exposure to professional development practices, team workflows and codebase standards in a corporate environment.',
      bg: 'Пряк досег с професионални практики за разработка, екипни процеси и стандарти за кодова база в корпоративна среда.',
    },
    kind: 'work',
  },
  {
    id: 'pmg',
    period: { en: 'Expected 2027', bg: 'Завършва 2027' },
    role: { en: 'Applied Programmer class', bg: 'Профил „Приложно програмиране“' },
    org: {
      en: 'National High School of Mathematics and Natural Sciences "Vasil Drumev", Veliko Tarnovo',
      bg: 'ПМГ „Васил Друмев“, Велико Търново',
    },
    detail: {
      en: 'One of the leading mathematics-and-science gymnasiums in the region, combining general secondary education with a vocational focus on software development.',
      bg: 'Една от водещите математически гимназии в региона, съчетаваща общо средно образование с професионален фокус върху разработката на софтуер.',
    },
    kind: 'education',
  },
  {
    id: 'softuni-path',
    period: { en: '2024 – 2025', bg: '2024 – 2025' },
    role: { en: 'C# curriculum, completed with distinction', bg: 'Пътека по C#, завършена с отличие' },
    org: { en: 'SoftUni', bg: 'SoftUni' },
    detail: {
      en: 'C# Basics through Advanced and OOP, plus Entity Framework and ASP.NET. Every course finished with a perfect 6.00.',
      bg: 'От C# Basics през Advanced и OOP до Entity Framework и ASP.NET. Всеки курс завършен с пълна шестица.',
    },
    kind: 'education',
  },
];

export interface Achievement {
  id: string;
  title: Localized;
  detail: Localized;
  /** Shown as the badge; gold treatment is reserved for placements. */
  rank?: Localized;
}

export const achievements: Achievement[] = [
  {
    id: 'crazy-golf',
    title: { en: 'Crazy Golf — game jam', bg: 'Crazy Golf — game jam' },
    rank: { en: '1st place', bg: 'Първо място' },
    detail: {
      en: 'Ranked first among all entries. A real-time four-player minigolf game in vanilla JavaScript and Canvas, with Supabase Realtime.',
      bg: 'Първо място сред всички участници. Миниголф за четирима в реално време на чист JavaScript и Canvas, със Supabase Realtime.',
    },
  },
  {
    id: 'softuniada',
    title: { en: 'Softuniada 2024 — 3D game category', bg: 'Softuniada 2024 — категория 3D игри' },
    rank: { en: '2nd place', bg: 'Второ място' },
    detail: {
      en: 'A Unity and C# cooking game, co-developed with a classmate.',
      bg: 'Кулинарна игра на Unity и C#, разработена съвместно със съученик.',
    },
  },
  {
    id: 'noit',
    title: {
      en: 'National Olympiad in Information Technologies',
      bg: 'Национална олимпиада по информационни технологии',
    },
    rank: { en: 'Regional round', bg: 'Регионален кръг' },
    detail: {
      en: 'Qualified for the regional round in multiple consecutive years, consistently scoring around 90/100.',
      bg: 'Класиран за регионалния кръг няколко поредни години, с резултат около 90/100.',
    },
  },
];

export interface LanguageSkill {
  id: string;
  name: Localized;
  level: Localized;
  /** Rough proficiency for the meter, 0..1. */
  value: number;
}

export const languages: LanguageSkill[] = [
  {
    id: 'bg',
    name: { en: 'Bulgarian', bg: 'Български' },
    level: { en: 'Native', bg: 'Роден език' },
    value: 1,
  },
  {
    id: 'en',
    name: { en: 'English', bg: 'Английски' },
    level: { en: 'Cambridge B2 First', bg: 'Cambridge B2 First' },
    value: 0.8,
  },
  {
    id: 'de',
    name: { en: 'German', bg: 'Немски' },
    level: { en: 'B1, currently studying', bg: 'B1, в процес на изучаване' },
    value: 0.5,
  },
];
