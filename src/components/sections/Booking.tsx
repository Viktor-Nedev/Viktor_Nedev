import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Reveal, RevealText } from '../ui/Reveal';
import { Aurora } from '../ui/Aurora';
import { asset } from '../../lib/asset';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { EASE } from '../../lib/easing';
import { site, PROJECT_TYPE_KEYS, type ProjectTypeKey } from '../../data/site';
import {
  buildMonth,
  canGoBack,
  canGoForward,
  initialMonth,
} from '../../booking/calendar';
import {
  buildMailto,
  composeBody,
  downloadIcs,
  formatDate,
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

export function Booking() {
  const t = useT();
  const { lang, locale } = useI18n();

  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<BookingDraft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const [{ year, month }, setCursor] = useState(initialMonth);
  const cells = useMemo(() => buildMonth(year, month), [year, month]);

  const go = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const validateDetails = () => {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = t.booking.required;
    if (!draft.email.trim()) next.email = t.booking.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) next.email = t.booking.invalidEmail;
    if (!draft.projectType) next.projectType = t.booking.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validateDetails()) return;
    // Some machines have no mail handler at all, in which case this silently
    // does nothing - which is why the success panel always shows the text and
    // a copy button as a fallback path.
    window.location.href = buildMailto(draft, t, locale);
    go(3);
  };

  const body = useMemo(
    () => (draft.date ? composeBody(draft, t, locale) : ''),
    [draft, t, locale],
  );

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
    setCursor(initialMonth());
    go(0);
  };

  const slide = {
    initial: { opacity: 0, x: direction * 34 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction * -34 },
    transition: { duration: 0.42, ease: EASE },
  };

  const stepLabels = [t.booking.steps.date, t.booking.steps.time, t.booking.steps.details];

  return (
    <section id="booking" className="section-y relative overflow-hidden">
      <Aurora />

      {/* Stands at the edge of the frame, cropped, so the booking card feels
          like a cabin window rather than a form on a page. */}
      <img
        aria-hidden
        src={asset('art/pine-single.webp')}
        alt=""
        width={900}
        height={1399}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute -left-24 bottom-0 hidden w-[320px] select-none opacity-70 xl:block"
      />

      <div className="shell relative">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-eyebrow mb-5">{t.booking.title}</p>
          </Reveal>
          <RevealText text={t.booking.heading} className="text-h2" />
          <Reveal delay={0.15}>
            <p className="mt-6 text-mist">{t.booking.lede}</p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="surface noise edge-glow relative mt-12 overflow-hidden rounded-2xl p-6 sm:p-9">
            {step < 3 && (
              <>
                {/* Progress rail */}
                <div className="mb-8 flex items-center gap-3">
                  {stepLabels.map((label, i) => (
                    <div key={label} className="flex flex-1 items-center gap-3">
                      <button
                        onClick={() => i < step && go(i as Step)}
                        disabled={i > step}
                        className={cn(
                          'flex items-center gap-2 font-mono text-xs transition-colors',
                          i === step ? 'text-volt' : i < step ? 'text-chalk' : 'text-mist',
                          i < step && 'cursor-pointer hover:text-volt',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border text-[0.65rem]',
                            i === step
                              ? 'border-volt text-volt'
                              : i < step
                                ? 'border-chalk bg-chalk text-white'
                                : 'border-slate-2',
                          )}
                        >
                          {i < step ? '✓' : i + 1}
                        </span>
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                      {i < stepLabels.length - 1 && (
                        <span className="h-px flex-1 bg-slate-2">
                          <motion.span
                            className="block h-full origin-left bg-volt"
                            animate={{ scaleX: i < step ? 1 : 0 }}
                            transition={{ duration: 0.4, ease: EASE }}
                          />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              {/* -------------------------------------------------- date */}
              {step === 0 && (
                <motion.div key="date" {...slide}>
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl">{t.booking.pickDate}</h3>
                      <p className="mt-1 text-sm text-mist">{t.booking.pickDateHint}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => shiftMonth(-1)}
                        disabled={!canGoBack(year, month)}
                        aria-label={t.booking.prevMonth}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-2 transition-colors enabled:hover:border-volt enabled:hover:text-volt disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => shiftMonth(1)}
                        disabled={!canGoForward(year, month)}
                        aria-label={t.booking.nextMonth}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-2 transition-colors enabled:hover:border-volt enabled:hover:text-volt disabled:opacity-30"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  <p className="mb-4 font-display text-lg">
                    {t.booking.months[month]} {year}
                  </p>

                  <div className="grid grid-cols-7 gap-1.5">
                    {t.booking.weekdays.map((d) => (
                      <div
                        key={d}
                        className="pb-1 text-center font-mono text-[0.65rem] uppercase text-mist"
                      >
                        {d}
                      </div>
                    ))}

                    <AnimatePresence mode="popLayout">
                      {cells.map((cell, i) => {
                        if (!cell.iso) return <span key={`blank-${i}`} />;
                        const selected = draft.date === cell.iso;
                        return (
                          <motion.button
                            key={cell.iso}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              // 2D wave: cells ripple in by row and column.
                              delay: (Math.floor(i / 7) + (i % 7)) * 0.018,
                              duration: 0.32,
                              ease: EASE,
                            }}
                            disabled={!cell.selectable}
                            onClick={() => {
                              setDraft((d) => ({ ...d, date: cell.iso! }));
                              go(1);
                            }}
                            className={cn(
                              'relative aspect-square rounded-lg text-sm transition-colors',
                              cell.selectable
                                ? 'text-chalk hover:bg-slate-2'
                                : 'cursor-not-allowed text-mist/25',
                              selected && 'text-white',
                            )}
                          >
                            {selected && (
                              <motion.span
                                layoutId="day-pill"
                                className="absolute inset-0 rounded-lg bg-volt"
                                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                              />
                            )}
                            <span className="relative z-10">{cell.day}</span>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* -------------------------------------------------- time */}
              {step === 1 && (
                <motion.div key="time" {...slide}>
                  <h3 className="font-display text-xl">{t.booking.pickTime}</h3>
                  <p className="mt-1 text-sm text-mist">{t.booking.pickTimeHint}</p>
                  <p className="mt-4 font-mono text-sm text-volt">
                    {formatDate(draft.date, locale)}
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {site.booking.slots.map((slot, i) => {
                      const selected = draft.time === slot;
                      return (
                        <motion.button
                          key={slot}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
                          onClick={() => {
                            setDraft((d) => ({ ...d, time: slot }));
                            go(2);
                          }}
                          className={cn(
                            'relative rounded-xl border py-3.5 font-mono transition-colors',
                            selected
                              ? 'border-volt text-white'
                              : 'border-slate-2 hover:border-volt/60 hover:text-volt',
                          )}
                        >
                          {selected && (
                            <motion.span
                              layoutId="time-pill"
                              className="absolute inset-0 rounded-xl bg-volt"
                              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                            />
                          )}
                          <span className="relative z-10">{slot}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => go(0)}
                    className="mt-8 text-sm text-mist transition-colors hover:text-chalk"
                  >
                    ← {t.booking.back}
                  </button>
                </motion.div>
              )}

              {/* ----------------------------------------------- details */}
              {step === 2 && (
                <motion.div key="details" {...slide}>
                  <h3 className="font-display text-xl">{t.booking.yourDetails}</h3>
                  <p className="mt-2 font-mono text-sm text-volt">
                    {formatDate(draft.date, locale)} · {draft.time}{' '}
                    {site.booking.timezoneLabel}
                  </p>

                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <Field
                      label={t.booking.name}
                      value={draft.name}
                      error={errors.name}
                      onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
                    />
                    <Field
                      label={t.booking.email}
                      type="email"
                      value={draft.email}
                      error={errors.email}
                      onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
                    />
                  </div>

                  <fieldset className="mt-6">
                    <legend className="mb-3 font-mono text-xs uppercase tracking-wider text-mist">
                      {t.booking.projectType}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPE_KEYS.map((key: ProjectTypeKey) => {
                        const label = t.booking.types[key];
                        const selected = draft.projectType === label;
                        return (
                          <button
                            key={key}
                            onClick={() => setDraft((d) => ({ ...d, projectType: label }))}
                            className={cn(
                              'rounded-full border px-4 py-2 text-sm transition-colors',
                              selected
                                ? 'border-volt bg-volt text-white'
                                : 'border-slate-2 text-mist hover:border-volt/60 hover:text-chalk',
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    {errors.projectType && (
                      <p className="mt-2 text-xs text-gold">{errors.projectType}</p>
                    )}
                  </fieldset>

                  <div className="mt-6">
                    <Field
                      label={t.booking.budget}
                      placeholder={t.booking.budgetPlaceholder}
                      value={draft.budget}
                      onChange={(v) => setDraft((d) => ({ ...d, budget: v }))}
                    />
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-mist">
                      {t.booking.message}
                    </label>
                    <textarea
                      rows={4}
                      value={draft.message}
                      maxLength={site.booking.maxMessageChars}
                      placeholder={t.booking.messagePlaceholder}
                      onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                      className="w-full resize-y rounded-xl border border-slate-2 bg-white/70 px-4 py-3 text-chalk outline-none transition-colors placeholder:text-mist/50 focus:border-volt"
                    />
                    {/* Long mailto URLs get truncated by some clients, so the
                        field is capped and the remaining budget is visible. */}
                    <p className="mt-1.5 text-right font-mono text-[0.7rem] text-mist">
                      {site.booking.maxMessageChars - draft.message.length}{' '}
                      {t.booking.charsLeft}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      onClick={submit}
                      className="rounded-full bg-chalk px-7 py-3 font-medium text-white shadow-[0_10px_30px_-12px_rgba(13,47,82,0.5)] transition-colors hover:bg-volt-dp"
                    >
                      {t.booking.submit}
                    </button>
                    <button
                      onClick={() => go(1)}
                      className="text-sm text-mist transition-colors hover:text-chalk"
                    >
                      ← {t.booking.back}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ----------------------------------------------- success */}
              {step === 3 && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <svg viewBox="0 0 52 52" className="h-14 w-14" aria-hidden>
                    <motion.circle
                      cx="26"
                      cy="26"
                      r="24"
                      fill="none"
                      stroke="var(--color-lime)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, ease: EASE }}
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
                      transition={{ duration: 0.45, delay: 0.5, ease: EASE }}
                    />
                  </svg>

                  <h3 className="mt-6 font-display text-2xl">{t.booking.successTitle}</h3>
                  <p className="mt-3 max-w-lg text-mist">{t.booking.successBody}</p>
                  <p className="mt-2 max-w-lg text-sm text-mist">{t.booking.successHint}</p>

                  <pre className="mt-6 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-2 bg-white/70 p-5 font-mono text-xs text-mist">
                    {site.email}
                    {'\n\n'}
                    {body}
                  </pre>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={copy}
                      className="rounded-full border border-slate-2 px-5 py-2.5 text-sm transition-colors hover:border-volt hover:text-volt"
                    >
                      {copied ? `✓ ${t.booking.copied}` : t.booking.copy}
                    </button>
                    <button
                      onClick={() => downloadIcs(draft, t, lang)}
                      className="rounded-full border border-slate-2 px-5 py-2.5 text-sm transition-colors hover:border-volt hover:text-volt"
                    >
                      {t.booking.addToCalendar}
                    </button>
                    <button
                      onClick={reset}
                      className="text-sm text-mist transition-colors hover:text-chalk"
                    >
                      {t.booking.newBooking}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-mist">
        {label}
      </label>
      <motion.input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        animate={error ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-xl border bg-white/70 px-4 py-3 text-chalk outline-none transition-colors placeholder:text-mist/50',
          error ? 'border-gold' : 'border-slate-2 focus:border-volt',
        )}
      />
      {error && <p className="mt-1.5 text-xs text-gold">{error}</p>}
    </div>
  );
}
