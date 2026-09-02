/** Identity and outbound links, kept in one place. */
export const site = {
  name: 'Viktor Nedev',
  nameBg: 'Виктор Недев',
  email: 'viktornedev08@gmail.com',
  links: {
    github: 'https://github.com/Viktor-Nedev',
    devpost: 'https://devpost.com/viktornedev08',
    itch: 'https://viktor-nedev.itch.io/',
  },
  /** Headline counters. Sourced from Devpost and the GitHub API. */
  stats: {
    wins: 12,
    hackathons: 69,
    repos: 34,
    certificates: 13,
    games: 3,
  },
  booking: {
    /** After school hours, Eastern European Time. */
    slots: ['16:00', '17:00', '18:00', '19:00', '20:00'],
    timezone: 'Europe/Sofia',
    timezoneLabel: 'EET',
    /** Earliest bookable day, in days from today. */
    leadTimeDays: 2,
    /** How far ahead the calendar allows booking. */
    horizonDays: 90,
    meetingMinutes: 45,
    maxMessageChars: 1200,
  },
} as const;

export const SERVICE_KEYS = ['landing', 'webapp', 'backend', 'mvp'] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

export const PROJECT_TYPE_KEYS = ['landing', 'webapp', 'ecommerce', 'other'] as const;
export type ProjectTypeKey = (typeof PROJECT_TYPE_KEYS)[number];
