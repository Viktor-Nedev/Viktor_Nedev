import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { asset } from '../../lib/asset';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { posterLqip } from '../../data/media.generated';

interface BackdropVideoProps {
  /** Basename in public/video, without extension. */
  slug: string;
  className?: string;
  /** Object-fit position, for shots whose subject is off-centre. */
  position?: string;
  /** Start playing only once scrolled into view. */
  lazy?: boolean;
}

/**
 * A silent, looping background clip.
 *
 * Never plays for someone who asked for reduced motion - a looping video is
 * exactly the repetitive full-frame movement that setting exists to stop.
 * They get the poster frame, which is a real composed image rather than a
 * blank box. Same fallback if the browser refuses autoplay, or on a metered
 * connection, where a silent decoration is not worth someone's data.
 */
export function BackdropVideo({ slug, className, position = 'center', lazy = true }: BackdropVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (reduced) return;

    // Respect an explicit data-saver request before downloading anything.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    if (!lazy) {
      setAllowed(true);
      return;
    }

    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAllowed(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, lazy]);

  // Pause off-screen so a background loop never burns battery unseen.
  useEffect(() => {
    const video = ref.current;
    if (!allowed || !video) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.01 },
    );
    io.observe(video);

    const onVisibility = () => {
      if (document.hidden) video.pause();
      else video.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [allowed]);

  const poster = asset(`video/${slug}-poster.webp`);

  return (
    <div ref={holder} className={cn('absolute inset-0 overflow-hidden', className)}>
      {allowed ? (
        <video
          ref={ref}
          className="h-full w-full object-cover"
          style={{ objectPosition: position, backgroundImage: `url(${posterLqip[slug] ?? ''})`, backgroundSize: 'cover' }}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          // Decorative: the page reads identically without it.
          aria-hidden
          tabIndex={-1}
        >
          <source src={asset(`video/${slug}.webm`)} type="video/webm" />
          <source src={asset(`video/${slug}.mp4`)} type="video/mp4" />
        </video>
      ) : (
        <img
          src={poster}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ objectPosition: position, backgroundImage: `url(${posterLqip[slug] ?? ''})`, backgroundSize: 'cover' }}
        />
      )}
    </div>
  );
}
