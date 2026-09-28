import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE } from '../../lib/easing';
import { asset } from '../../lib/asset';
import { useT } from '../../i18n';
import { useI18n } from '../../i18n';
import type { Certificate } from '../../data/types';

interface LightboxProps {
  items: Certificate[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Full-size certificate viewer.
 *
 * Handles the accessibility work a modal owes: focus is trapped inside while
 * open, Escape closes, arrows navigate, and focus returns to the trigger.
 */
export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const t = useT();
  const { lang } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const open = index !== null;
  const item = open ? items[index] : null;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onNavigate((index + delta + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  // Remember what had focus so it can be handed back on close.
  useEffect(() => {
    if (open) restoreTo.current = document.activeElement as HTMLElement;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Tab') {
        // Keep Tab cycling inside the dialog.
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Move focus in on the next frame, once the panel has mounted.
    const raf = requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
      restoreTo.current?.focus?.();
    };
  }, [open, onClose, go]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${t.a11y.certificateOf} ${item.title[lang]}`}
        >
          <motion.button
            className="absolute inset-0 bg-[#e8f1f8]/88 backdrop-blur-xl"
            onClick={onClose}
            aria-label={t.certificates.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className="relative z-10 flex max-h-full w-full max-w-5xl flex-col gap-4 outline-none"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <img
              src={asset(item.image)}
              alt={`${t.a11y.certificateOf} ${item.title[lang]} — ${item.issuer}`}
              width={item.width}
              height={item.height}
              className="max-h-[70vh] w-auto self-center rounded-lg object-contain shadow-2xl"
            />

            <div className="surface flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-display text-lg">{item.title[lang]}</p>
                <p className="truncate text-sm text-mist">
                  {item.issuer} · {item.dateLabel[lang]}
                </p>
                {item.credentialId && (
                  <p className="mt-0.5 font-mono text-xs text-mist">
                    {t.certificates.credentialId}: {item.credentialId}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {item.verifyUrl && (
                  <a
                    href={item.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-slate-2 px-3 py-1.5 text-sm transition-colors hover:border-volt hover:text-volt"
                  >
                    {t.certificates.verify}
                  </a>
                )}
                {item.pdf && (
                  <a
                    href={asset(item.pdf)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-slate-2 px-3 py-1.5 text-sm transition-colors hover:border-volt hover:text-volt"
                  >
                    {t.certificates.download}
                  </a>
                )}
                <button
                  onClick={() => go(-1)}
                  aria-label={t.certificates.prev}
                  className="rounded-md border border-slate-2 px-3 py-1.5 text-sm transition-colors hover:border-volt hover:text-volt"
                >
                  ←
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label={t.certificates.next}
                  className="rounded-md border border-slate-2 px-3 py-1.5 text-sm transition-colors hover:border-volt hover:text-volt"
                >
                  →
                </button>
                <button
                  onClick={onClose}
                  aria-label={t.certificates.close}
                  className="rounded-md bg-chalk px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
