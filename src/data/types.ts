/** A string that exists in both site languages. */
export interface Localized {
  bg: string;
  en: string;
}

export interface Certificate {
  slug: string;
  group: 'hackathon' | 'softuni';
  kind: 'win' | 'participation' | 'course';
  issuer: string;
  title: Localized;
  award: Localized;
  /** ISO date, used for sorting. */
  date: string;
  dateLabel: Localized;
  /** Paths are relative to the site base; always pass through asset(). */
  image: string;
  fallback: string;
  width: number;
  height: number;
  /** Inlined base64 placeholder. */
  lqip: string;
  pdf?: string;
  credentialId?: string;
  verifyUrl?: string;
}

export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  homepage: string | null;
  url: string;
  stars: number;
  pushedAt: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: Localized;
  description: Localized;
  stack: string[];
  repo?: string;
  live?: string;
  devpost?: string;
  /** Award badge shown on the card. */
  award?: Localized;
  featured: boolean;
}

export interface Game {
  slug: string;
  name: string;
  tagline: Localized;
  description: Localized;
  stack: string[];
  image?: string;
  repo?: string;
  live?: string;
  itch?: string;
  highlights: Localized[];
}
