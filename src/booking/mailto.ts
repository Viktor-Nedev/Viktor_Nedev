import { site } from '../data/site';
import type { Dict, Lang } from '../i18n';

export interface BookingDraft {
  date: string; // ISO yyyy-mm-dd
  time: string; // HH:mm
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
}

/** Human-readable date in the visitor's language. */
export function formatDate(iso: string, locale: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}

/** The message body, shown on screen and sent in the email. */
export function composeBody(draft: BookingDraft, t: Dict, locale: string): string {
  const lines = [
    t.booking.mailIntro,
    '',
    `${t.booking.steps.date}: ${formatDate(draft.date, locale)}`,
    `${t.booking.steps.time}: ${draft.time} ${site.booking.timezoneLabel}`,
    '',
    `${t.booking.name}: ${draft.name}`,
    `${t.booking.email}: ${draft.email}`,
    `${t.booking.projectType}: ${draft.projectType}`,
  ];

  if (draft.budget.trim()) lines.push(`${t.booking.budget}: ${draft.budget.trim()}`);
  if (draft.message.trim()) lines.push('', `${t.booking.message}:`, draft.message.trim());

  return lines.join('\n');
}

export function composeSubject(draft: BookingDraft, t: Dict, locale: string): string {
  return `${t.booking.mailSubject} — ${draft.name} — ${formatDate(draft.date, locale)} ${draft.time}`;
}

/**
 * Builds the mailto URL.
 *
 * Newlines are normalised to CRLF before encoding: `encodeURIComponent('\n')`
 * alone yields `%0A`, which Outlook collapses into one run-on line.
 */
export function buildMailto(draft: BookingDraft, t: Dict, locale: string): string {
  const subject = encodeURIComponent(composeSubject(draft, t, locale));
  const body = encodeURIComponent(composeBody(draft, t, locale).replace(/\r?\n/g, '\r\n'));
  return `mailto:${site.email}?subject=${subject}&body=${body}`;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/**
 * Minimal single-event .ics, generated client-side.
 *
 * Times are written as local wall-clock with an explicit TZID rather than UTC,
 * so the slot lands at the hour the visitor actually picked.
 */
export function buildIcs(draft: BookingDraft, t: Dict, lang: Lang): string {
  const [y, m, d] = draft.date.split('-').map(Number);
  const [hh, mm] = draft.time.split(':').map(Number);

  const start = `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
  const endDate = new Date(y, m - 1, d, hh, mm + site.booking.meetingMinutes);
  const end =
    `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}` +
    `T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const summary = `${t.booking.mailSubject} — ${site.name} × ${draft.name}`;

  // Long lines must be folded at 75 octets per RFC 5545; keeping the
  // description short and single-line sidesteps that entirely.
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//viktornedev//portfolio//' + lang.toUpperCase(),
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${stamp}-${Math.random().toString(36).slice(2, 10)}@viktornedev`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${site.booking.timezone}:${start}`,
    `DTEND;TZID=${site.booking.timezone}:${end}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(`${draft.projectType} — ${draft.email}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** Commas, semicolons and backslashes are structural in ICS and must escape. */
function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

export function downloadIcs(draft: BookingDraft, t: Dict, lang: Lang): void {
  const blob = new Blob([buildIcs(draft, t, lang)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meeting-${draft.date}-${draft.time.replace(':', '')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the download has already started.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
