import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Reveal, RevealText } from '../ui/Reveal';
import { Lightbox } from '../ui/Lightbox';
import { useI18n, useT } from '../../i18n';
import { certificates } from '../../data/certificates.generated';
import { asset } from '../../lib/asset';
import { cn } from '../../lib/cn';
import type { Certificate } from '../../data/types';

function CertCard({
  cert,
  onOpen,
  featured = false,
}: {
  cert: Certificate;
  onOpen: () => void;
  featured?: boolean;
}) {
  const t = useT();
  const { lang } = useI18n();
  const isWin = cert.kind === 'win';

  return (
    <motion.button
      layoutId={`cert-${cert.slug}`}
      onClick={onOpen}
      className={cn(
        'group relative block w-full overflow-hidden rounded-xl border text-left transition-colors duration-500',
        isWin
          ? 'border-gold/35 hover:border-gold/70'
          : 'border-slate-2 hover:border-volt/45',
      )}
    >
      <div className="relative overflow-hidden bg-white">
        <img
          src={asset(cert.image)}
          alt={`${t.a11y.certificateOf} ${cert.title[lang]}`}
          width={cert.width}
          height={cert.height}
          loading="lazy"
          decoding="async"
          style={{
            backgroundImage: `url(${cert.lqip})`,
            backgroundSize: 'cover',
            aspectRatio: featured ? '16 / 10' : '4 / 3',
          }}
          className="w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
      </div>

      {/* A solid footer rather than an overlay: certificates are dense light
          documents and captions laid over them are unreadable. */}
      <div className="border-t border-white/70 bg-white/70 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider',
              isWin ? 'border-gold/40' : 'border-slate-2 text-mist',
            )}
            style={isWin ? { color: 'var(--color-gold)' } : undefined}
          >
            {cert.award[lang]}
          </span>
          <span className="font-mono text-[0.65rem] text-mist">{cert.dateLabel[lang]}</span>
        </div>

        <h3
          className={cn(
            'mt-2 font-display leading-tight',
            featured ? 'text-2xl sm:text-3xl' : 'text-lg',
          )}
        >
          {cert.title[lang]}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-mist">{cert.issuer}</p>
      </div>
    </motion.button>
  );
}

export function Certificates() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(null);

  // One flat, ordered list so the lightbox can page through everything.
  const ordered = useMemo(() => {
    const wins = certificates.filter((c) => c.kind === 'win');
    const participation = certificates.filter((c) => c.kind === 'participation');
    const courses = certificates
      .filter((c) => c.kind === 'course')
      .sort((a, b) => a.date.localeCompare(b.date));
    return { wins, participation, courses, all: [...wins, ...participation, ...courses] };
  }, []);

  const indexOf = (cert: Certificate) => ordered.all.findIndex((c) => c.slug === cert.slug);

  return (
    <section id="certificates" className="section-y relative">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-eyebrow mb-5">{t.certificates.title}</p>
          </Reveal>
          <RevealText text={t.certificates.heading} className="text-h2" />
          <Reveal delay={0.15}>
            <p className="mt-6 text-mist">{t.certificates.lede}</p>
          </Reveal>
        </div>

        {/* Wins first, at full size. Gold appears nowhere else in this section. */}
        <Reveal delay={0.1}>
          <h3 className="mt-16 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em]">
            <span style={{ color: 'var(--color-gold)' }}>{t.certificates.winsTitle}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
          </h3>
        </Reveal>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {ordered.wins.map((cert, i) => (
            <Reveal key={cert.slug} delay={i * 0.1}>
              <CertCard cert={cert} featured onOpen={() => setOpen(indexOf(cert))} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h3 className="mt-16 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-mist">
            {t.certificates.participationTitle}
            <span className="h-px flex-1 bg-slate-2" />
          </h3>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.participation.map((cert, i) => (
            <Reveal key={cert.slug} delay={(i % 3) * 0.07}>
              <CertCard cert={cert} onOpen={() => setOpen(indexOf(cert))} />
            </Reveal>
          ))}
        </div>

        {/* SoftUni reads as a path, so it is laid out as a progression. */}
        <Reveal>
          <h3 className="mt-16 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-mist">
            {t.certificates.softuniTitle}
            <span className="h-px flex-1 bg-slate-2" />
          </h3>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-xl text-mist">{t.certificates.softuniLede}</p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ordered.courses.map((cert, i) => (
            <Reveal key={cert.slug} delay={i * 0.06}>
              <button
                onClick={() => setOpen(indexOf(cert))}
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-2 text-left transition-colors duration-500 hover:border-volt/45"
              >
                <img
                  src={asset(cert.image)}
                  alt={`${t.a11y.certificateOf} ${cert.title.en}`}
                  width={cert.width}
                  height={cert.height}
                  loading="lazy"
                  decoding="async"
                  style={{ backgroundImage: `url(${cert.lqip})`, backgroundSize: 'cover' }}
                  className="aspect-[3/4] w-full object-cover object-top opacity-85 transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                />
                <div className="flex flex-1 flex-col gap-1 border-t border-white/70 bg-white/60 p-4 backdrop-blur">
                  <span className="font-mono text-[0.65rem] text-mist">
                    {String(i + 1).padStart(2, '0')} · {cert.dateLabel.en.split(' ').pop()}
                  </span>
                  <span className="font-display text-sm leading-tight">{cert.title.en}</span>
                  <span className="nums mt-auto pt-2 font-mono text-[0.65rem] text-lime">6.00</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox
        items={ordered.all}
        index={open}
        onClose={() => setOpen(null)}
        onNavigate={setOpen}
      />
    </section>
  );
}
