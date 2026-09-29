import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { Reveal, RevealText } from '../ui/Reveal';
import { Aurora } from '../ui/Aurora';
import { asset } from '../../lib/asset';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { EASE } from '../../lib/easing';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { site, PROJECT_TYPE_KEYS } from '../../data/site';
import {
  buildMonth,
  canGoBack,
  canGoForward,
  firstAvailable,
  initialMonth,
  toIso,
} from '../../booking/calendar';
import {
  buildMailto,
  composeBody,
  downloadIcs,
  type BookingDraft,
} from '../../booking/mailto';

type Step = 0 | 1 | 2 | 3;

const EMPTY: BookingDraft = {
  date: '',
  time: '',
  name: '',
  email: '',
  projectType: '',
  budget: '',
  message: '',
};

/** Parses an ISO day as local midnight - `new Date(iso)` would read it as UTC. */
const fromIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** "16:00" -> "16:45", for the end of a meeting slot. */
const endOf = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + site.booking.meetingMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const monthVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 26, filter: 'blur(4px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: (dir: number) => ({ opacity: 0, x: dir * -26, filter: 'blur(4px)' }),
};

const panelVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, y: dir * 18, filter: 'blur(6px)' }),
  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: (dir: number) => ({ opacity: 0, y: dir * -12, filter: 'blur(6px)' }),
};

export function Booking() {
  const t = useT();
  const { lang, locale } = useI18n();

  const [draft, setDraft] = useState<BookingDraft>(EMPTY);
  const [pickingTime, setPickingTime] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const [{ year, month }, setCursor] = useState(initialMonth);
  const [monthDir, setMonthDir] = useState(1);
  const cells = useMemo(() => buildMonth(year, month), [year, month]);
  const today = useMemo(() => toIso(new Date()), []);

  // The step is derived from what has been chosen, so it can never disagree
  // with the draft it describes.
  const step: Step = done ? 3 : !draft.date ? 0 : !draft.time || pickingTime ? 1 : 2;
  const prevStep = useRef(step);
  const stepDir = step >= prevStep.current ? 1 : -1;
  useEffect(() => {
    prevStep.current = step;
  }, [step]);

  const monthLabel = t.booking.months[month];
  const fmtWeekday = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'long' }), [locale]);
  const fmtMonth = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }), [locale]);
  const fmtShort = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }),
    [locale],
  );

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setMonthDir(delta);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const pickDate = (iso: string) => {
    setDraft((d) => ({ ...d, date: iso }));
    // The same five slots exist every day, so a chosen time survives a
    // change of date and the visitor lands straight back on their details.
    if (!draft.time) setPickingTime(false);
  };

  const pickNextFree = () => {
    const d = firstAvailable();
    setMonthDir(d.getMonth() >= month || d.getFullYear() > year ? 1 : -1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    pickDate(toIso(d));
  };

  const pickTime = (time: string) => {
    setDraft((d) => ({ ...d, time }));
    setPickingTime(false);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = t.booking.required;
    if (!draft.email.trim()) next.email = t.booking.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) next.email = t.booking.invalidEmail;
    if (!draft.projectType) next.projectType = t.booking.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    // Some machines have no mail handler at all, in which case this silently
    // does nothing - which is why the ticket always shows the text and a copy
    // button as a fallback path.
    window.location.href = buildMailto(draft, t, locale);
    setDone(true);
  };

  const body = useMemo(() => (draft.date ? composeBody(draft, t, locale) : ''), [draft, t, locale]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${site.email}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard can be blocked; the text is on screen to select manually.
    }
  };

  const reset = () => {
    setDraft(EMPTY);
    setErrors({});
    setDone(false);
    setPickingTime(false);
    setCursor(initialMonth());
  };

  const selected = draft.date ? fromIso(draft.date) : null;

  return (
    <section id="booking" className="section-y relative overflow-hidden">
      <Aurora />

      {/* Two pines flank the card, cropped by the frame, so it reads like a
          cabin window in a clearing rather than a form on a page. */}
      <img
        aria-hidden
        src={asset('art/pine-single.webp')}
        alt=""
        width={900}
        height={1399}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute -left-20 bottom-0 hidden w-[300px] select-none opacity-80 xl:block"
      />
      <img
        aria-hidden
        src={asset('art/pine-bush.webp')}
        alt=""
        width={700}
        height={816}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute -right-10 bottom-0 hidden w-[240px] select-none opacity-80 xl:block"
      />

      <div className="shell relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-eyebrow mb-5">{t.booking.title}</p>
          </Reveal>
          <RevealText text={t.booking.heading} className="text-h2" />
          <Reveal delay={0.15}>
            <p className="mt-6 text-mist">{t.booking.lede}</p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="relative mx-auto mt-12 max-w-[920px]" style={{ perspective: 1800 }}>
            <AnimatePresence mode="wait" initial={false}>
              {step < 3 ? (
                <motion.div
                  key="planner"
                  exit={{ opacity: 0, rotateX: 12, y: -20, scale: 0.97, filter: 'blur(6px)' }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="surface-deep edge-glow relative grid overflow-hidden rounded-3xl md:grid-cols-[340px_1fr]"
                >
                  {/* ---------------------------------------------- calendar */}
                  <div className="relative border-b border-white/70 p-6 md:border-b-0 md:border-r">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <AnimatePresence mode="wait" custom={monthDir} initial={false}>
                          <motion.p
                            key={`${year}-${month}`}
                            custom={monthDir}
                            variants={monthVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.28, ease: EASE }}
                            className="font-display text-lg capitalize leading-none"
                          >
                            {monthLabel}
                          </motion.p>
                        </AnimatePresence>
                        <p className="mt-1.5 font-mono text-[0.65rem] text-mist">{year}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <MonthButton
                          label={t.booking.prevMonth}
                          disabled={!canGoBack(year, month)}
                          onClick={() => shiftMonth(-1)}
                          d="M15 18l-6-6 6-6"
                        />
                        <MonthButton
                          label={t.booking.nextMonth}
                          disabled={!canGoForward(year, month)}
                          onClick={() => shiftMonth(1)}
                          d="M9 18l6-6-6-6"
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-7 text-center">
                      {t.booking.weekdays.map((d) => (
                        <span key={d} className="pb-2 font-mono text-[0.6rem] uppercase text-mist">
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Fixed height for six rows, so short months do not make
                        the card jump when paging. */}
                    <div className="relative h-[252px]">
                      <AnimatePresence mode="wait" custom={monthDir} initial={false}>
                        <motion.div
                          key={`${year}-${month}`}
                          custom={monthDir}
                          variants={monthVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.28, ease: EASE }}
                          className="grid grid-cols-7 gap-y-1"
                        >
                          {cells.map((cell, i) =>
                            cell.iso ? (
                              <DayButton
                                key={cell.iso}
                                index={i}
                                day={cell.day}
                                selectable={cell.selectable}
                                today={cell.iso === today}
                                selected={draft.date === cell.iso}
                                onPick={() => pickDate(cell.iso!)}
                              />
                            ) : (
                              <span key={`blank-${i}`} />
                            ),
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/70 pt-4 font-mono text-[0.65rem] text-mist">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-volt" />
                        {t.booking.available}
                      </span>
                      <span>{t.booking.duration}</span>
                    </div>
                  </div>

                  {/* ------------------------------------------------- panel */}
                  <div className="relative flex min-h-[420px] flex-col p-6 sm:p-8">
                    {/* Progress: three segments that fill as choices are made. */}
                    <div className="mb-7 flex gap-1.5" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-2/60">
                          <motion.span
                            className="block h-full origin-left rounded-full bg-gradient-to-r from-volt to-plasma"
                            initial={false}
                            animate={{ scaleX: step > i ? 1 : step === i ? 0.35 : 0 }}
                            transition={{ duration: 0.55, ease: EASE }}
                          />
                        </span>
                      ))}
                    </div>

                    <AnimatePresence mode="wait" custom={stepDir} initial={false}>
                      {step === 0 && (
                        <motion.div
                          key="empty"
                          custom={stepDir}
                          variants={panelVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.4, ease: EASE }}
                          className="flex flex-1 flex-col items-center justify-center text-center"
                        >
                          <FloatingFlake />
                          <h3 className="mt-6 font-display text-xl">{t.booking.emptyTitle}</h3>
                          <p className="mt-2 max-w-xs text-sm text-mist">{t.booking.pickDateHint}</p>
                          <button
                            onClick={pickNextFree}
                            className="group mt-6 inline-flex items-center gap-2 rounded-full border border-slate-2 bg-white/60 px-5 py-2.5 text-sm transition-all hover:border-volt hover:text-volt"
                          >
                            {t.booking.nextFree}
                            <span className="font-mono text-xs text-mist group-hover:text-volt">
                              {fmtShort.format(firstAvailable())}
                            </span>
                            <span className="transition-transform group-hover:translate-x-0.5">→</span>
                          </button>
                        </motion.div>
                      )}

                      {step === 1 && selected && (
                        <motion.div
                          key="time"
                          custom={stepDir}
                          variants={panelVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.4, ease: EASE }}
                          className="flex flex-1 flex-col"
                        >
                          <DateBadge
                            iso={draft.date}
                            day={selected.getDate()}
                            weekday={fmtWeekday.format(selected)}
                            monthYear={fmtMonth.format(selected)}
                          />

                          <p className="mt-7 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mist">
                            {t.booking.pickTime}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {site.booking.slots.map((slot, i) => (
                              <motion.button
                                key={slot}
                                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.08 + i * 0.05, duration: 0.35, ease: EASE }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => pickTime(slot)}
                                className={cn(
                                  'group rounded-xl border px-3 py-2.5 text-left transition-colors',
                                  draft.time === slot
                                    ? 'border-volt bg-volt text-white'
                                    : 'border-white/90 bg-white/65 hover:border-volt/60',
                                )}
                              >
                                <span className="nums block font-display text-base leading-none">{slot}</span>
                                <span
                                  className={cn(
                                    'nums mt-1 block font-mono text-[0.6rem]',
                                    draft.time === slot ? 'text-white/75' : 'text-mist',
                                  )}
                                >
                                  – {endOf(slot)} {site.booking.timezoneLabel}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                          <p className="mt-auto pt-6 text-xs text-mist">{t.booking.pickTimeHint}</p>
                        </motion.div>
                      )}

                      {step === 2 && selected && (
                        <motion.div
                          key="details"
                          custom={stepDir}
                          variants={panelVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.4, ease: EASE }}
                          className="flex flex-1 flex-col"
                        >
                          {/* The chosen slot, compact, with a way back. */}
                          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/90 bg-white/60 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-chalk text-white">
                                <span className="nums font-display text-sm leading-none">{selected.getDate()}</span>
                                <span className="mt-0.5 font-mono text-[0.5rem] uppercase leading-none opacity-75">
                                  {t.booking.months[selected.getMonth()].slice(0, 3)}
                                </span>
                              </span>
                              <div>
                                <p className="text-sm font-medium capitalize">{fmtWeekday.format(selected)}</p>
                                <p className="nums font-mono text-xs text-mist">
                                  {draft.time} – {endOf(draft.time)} {site.booking.timezoneLabel}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setPickingTime(true)}
                              className="text-xs text-volt underline-offset-4 hover:underline"
                            >
                              {t.booking.change}
                            </button>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <Field
                              label={t.booking.name}
                              value={draft.name}
                              error={errors.name}
                              autoComplete="name"
                              onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
                            />
                            <Field
                              label={t.booking.email}
                              type="email"
                              value={draft.email}
                              error={errors.email}
                              autoComplete="email"
                              onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
                            />
                          </div>

                          <fieldset className="mt-4">
                            <legend className="mb-2 font-mono text-[0.62rem] uppercase tracking-wider text-mist">
                              {t.booking.projectType}
                            </legend>
                            <motion.div
                              className="flex flex-wrap gap-1.5"
                              animate={errors.projectType ? { x: [0, -5, 5, -3, 0] } : { x: 0 }}
                              transition={{ duration: 0.35 }}
                            >
                              {PROJECT_TYPE_KEYS.map((key) => {
                                const label = t.booking.types[key];
                                const on = draft.projectType === label;
                                return (
                                  <button
                                    key={key}
                                    onClick={() => setDraft((d) => ({ ...d, projectType: label }))}
                                    aria-pressed={on}
                                    className={cn(
                                      'rounded-full border px-3 py-1.5 text-xs transition-all',
                                      on
                                        ? 'border-volt bg-volt text-white shadow-[0_6px_16px_-8px_rgba(11,117,144,0.8)]'
                                        : errors.projectType
                                          ? 'border-gold/60 bg-white/60 text-mist'
                                          : 'border-slate-2 bg-white/60 text-mist hover:border-volt/60 hover:text-chalk',
                                    )}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </motion.div>
                          </fieldset>

                          <label className="mt-4 block">
                            <span className="mb-1.5 flex justify-between font-mono text-[0.62rem] uppercase tracking-wider text-mist">
                              {t.booking.message}
                              <span className="nums normal-case tracking-normal">
                                {site.booking.maxMessageChars - draft.message.length}
                              </span>
                            </span>
                            <textarea
                              rows={3}
                              value={draft.message}
                              maxLength={site.booking.maxMessageChars}
                              placeholder={t.booking.messagePlaceholder}
                              onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                              className="w-full resize-none rounded-xl border border-white/90 bg-white/70 px-3.5 py-2.5 text-sm text-chalk outline-none transition-colors placeholder:text-mist/60 focus:border-volt"
                            />
                          </label>

                          <div className="mt-4 flex flex-wrap items-end gap-3">
                            <div className="min-w-[150px] flex-1">
                              <Field
                                label={t.booking.budget}
                                placeholder={t.booking.budgetPlaceholder}
                                value={draft.budget}
                                onChange={(v) => setDraft((d) => ({ ...d, budget: v }))}
                              />
                            </div>
                            <motion.button
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={submit}
                              className="sheen group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-chalk px-6 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(13,47,82,0.6)] transition-colors hover:bg-volt-dp"
                            >
                              {t.booking.submit}
                              <span className="transition-transform group-hover:translate-x-0.5">→</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <Ticket
                  key="ticket"
                  draft={draft}
                  body={body}
                  copied={copied}
                  onCopy={copy}
                  onCalendar={() => downloadIcs(draft, t, lang)}
                  onReset={reset}
                />
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MonthButton({
  label,
  disabled,
  onClick,
  d,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  d: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/90 bg-white/60 text-chalk transition-all enabled:hover:border-volt enabled:hover:text-volt disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
        <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function DayButton({
  index,
  day,
  selectable,
  today,
  selected,
  onPick,
}: {
  index: number;
  day: number;
  selectable: boolean;
  today: boolean;
  selected: boolean;
  onPick: () => void;
}) {
  const reduced = useReducedMotion();
  const row = Math.floor(index / 7);
  const col = index % 7;

  return (
    <motion.button
      initial={reduced ? false : { opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      // A diagonal wave across the grid as each month arrives.
      transition={{ delay: (row + col) * 0.014, duration: 0.3, ease: EASE }}
      whileHover={selectable && !selected ? { scale: 1.12 } : undefined}
      whileTap={selectable ? { scale: 0.92 } : undefined}
      disabled={!selectable}
      onClick={onPick}
      aria-pressed={selected}
      className={cn(
        'relative mx-auto flex h-[38px] w-[38px] items-center justify-center rounded-full text-sm transition-colors',
        selectable ? 'text-chalk hover:bg-white hover:shadow-[0_6px_16px_-8px_rgba(13,47,82,0.45)]' : 'cursor-default text-mist/35',
        today && !selected && 'ring-1 ring-slate-2',
        selected && 'text-white',
      )}
    >
      {selected && (
        <>
          <motion.span
            layoutId="day-bubble"
            className="absolute inset-0 rounded-full bg-gradient-to-br from-volt to-volt-dp shadow-[0_8px_20px_-8px_rgba(11,117,144,0.9)]"
            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
          />
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-volt"
              initial={{ scale: 1, opacity: 0.55 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
            />
          )}
        </>
      )}
      <span className="nums relative z-10">{day}</span>
      {selectable && !selected && (
        <span aria-hidden className="absolute bottom-[5px] h-[3px] w-[3px] rounded-full bg-volt/70" />
      )}
    </motion.button>
  );
}

/** The chosen day, rolled in like a flip counter each time it changes. */
function DateBadge({ iso, day, weekday, monthYear }: { iso: string; day: number; weekday: string; monthYear: string }) {
  return (
    <div className="flex items-end gap-4">
      <div className="relative h-[64px] w-[82px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={iso}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="nums absolute inset-0 font-display text-[64px] leading-none text-chalk"
          >
            {day}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="pb-1.5">
        <p className="font-medium capitalize">{weekday}</p>
        <p className="text-sm capitalize text-mist">{monthYear}</p>
      </div>
    </div>
  );
}

/** A slowly turning snowflake for the empty state. */
function FloatingFlake() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/90 bg-white/60 text-volt shadow-[0_14px_34px_-18px_rgba(13,47,82,0.55)]"
      animate={reduced ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        width="34"
        height="34"
        fill="none"
        aria-hidden
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      >
        <path
          d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M12 2l-2 2.5M12 2l2 2.5M12 22l-2-2.5M12 22l2-2.5M3.3 7l3.2.1M3.3 7l1.3-2.9M20.7 17l-3.2-.1M20.7 17l-1.3 2.9M3.3 17l1.3 2.9M3.3 17l3.2-.1M20.7 7l-1.3-2.9M20.7 7l-3.2.1"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
}

function Ticket({
  draft,
  body,
  copied,
  onCopy,
  onCalendar,
  onReset,
}: {
  draft: BookingDraft;
  body: string;
  copied: boolean;
  onCopy: () => void;
  onCalendar: () => void;
  onReset: () => void;
}) {
  const t = useT();
  const { locale } = useI18n();
  const reduced = useReducedMotion();
  const date = fromIso(draft.date);

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: -14, y: 30, scale: 0.96, filter: 'blur(6px)' }}
      animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative grid overflow-hidden rounded-3xl shadow-[0_24px_60px_-28px_rgba(13,47,82,0.55)] md:grid-cols-[300px_1fr]"
    >
      {/* Stub */}
      <div
        className="relative overflow-hidden p-7 text-white"
        style={{ background: 'linear-gradient(155deg, #0d2438 0%, #0b4a63 60%, #0b7590 100%)' }}
      >
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
          <defs>
            <pattern id="ticket-frost" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M13 3v20M3 13h20M6 6l14 14M20 6 6 20" stroke="#fff" strokeWidth="0.6" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ticket-frost)" />
        </svg>
        <div className="relative">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/60">{t.booking.slot}</p>
          <p className="nums mt-4 font-display text-6xl leading-none">{date.getDate()}</p>
          <p className="mt-2 capitalize">
            {new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)}
          </p>
          <p className="text-sm capitalize text-white/70">
            {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 font-mono text-xs">
            <span className="nums">
              {draft.time} – {endOf(draft.time)}
            </span>
            <span className="text-white/60">{site.booking.timezoneLabel}</span>
          </div>
          <p className="mt-3 font-mono text-[0.65rem] text-white/60">{t.booking.duration}</p>
        </div>
      </div>

      {/* Perforation: a dashed tear line with notches bitten out of each end. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[300px] z-10 hidden w-0 md:block">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#eef4fa]" />
        <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-[#eef4fa]" />
        <span className="absolute inset-y-4 left-0 border-l-2 border-dashed border-slate-2" />
      </div>

      {/* Body */}
      <div className="surface-deep relative p-7 sm:p-8">
        <div className="relative h-14 w-14">
          {!reduced && <SnowBurst />}
          <svg viewBox="0 0 52 52" className="relative h-14 w-14" aria-hidden>
            <motion.circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="var(--color-lime)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            />
            <motion.path
              d="M15 27l8 8 15-16"
              fill="none"
              stroke="var(--color-lime)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.7, ease: EASE }}
            />
          </svg>
        </div>

        <h3 className="mt-5 font-display text-2xl">{t.booking.successTitle}</h3>
        <p className="mt-2 text-sm text-mist">{t.booking.successBody}</p>
        <p className="mt-2 text-xs text-mist">{t.booking.successHint}</p>

        <details className="group mt-5 rounded-xl border border-white/90 bg-white/60">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-xs text-chalk">
            {t.booking.showMessage}
            <span className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <pre className="max-h-52 overflow-auto whitespace-pre-wrap border-t border-white/80 px-4 py-3 font-mono text-[0.7rem] text-mist">
            {site.email}
            {'\n\n'}
            {body}
          </pre>
        </details>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <button
            onClick={onCopy}
            className="rounded-full bg-chalk px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-volt-dp"
          >
            {copied ? `✓ ${t.booking.copied}` : t.booking.copy}
          </button>
          <button
            onClick={onCalendar}
            className="rounded-full border border-slate-2 bg-white/60 px-5 py-2.5 text-sm transition-colors hover:border-volt hover:text-volt"
          >
            {t.booking.addToCalendar}
          </button>
          <button onClick={onReset} className="px-2 text-sm text-mist transition-colors hover:text-chalk">
            {t.booking.newBooking}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/** Flakes thrown out from the check mark as the ticket lands. */
function SnowBurst() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2 + (i % 2) * 0.2;
        const dist = 46 + (i % 3) * 18;
        return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, size: 6 + (i % 3) * 3, spin: (i % 2 ? 1 : -1) * 180 };
      }),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {flakes.map((f, i) => (
        <motion.span
          key={i}
          className="absolute text-volt"
          style={{ fontSize: f.size, lineHeight: 1, marginLeft: -f.size / 2, marginTop: -f.size / 2 }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{ x: f.x, y: f.y, opacity: [0, 1, 0], scale: 1, rotate: f.spin }}
          transition={{ duration: 1.1, delay: 0.55, ease: 'easeOut' }}
        >
          ❄
        </motion.span>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[0.62rem] uppercase tracking-wider text-mist">{label}</span>
      <motion.input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        animate={error ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        aria-invalid={!!error}
        className={cn(
          'h-11 w-full rounded-xl border bg-white/70 px-3.5 text-sm text-chalk outline-none transition-colors placeholder:text-mist/60',
          error ? 'border-gold' : 'border-white/90 focus:border-volt',
        )}
      />
      {error && <span className="mt-1 block text-[0.7rem] text-gold">{error}</span>}
    </label>
  );
}
