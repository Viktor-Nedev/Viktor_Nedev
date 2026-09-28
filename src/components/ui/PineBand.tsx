import { cn } from '../../lib/cn';
import { asset } from '../../lib/asset';

/**
 * A strip of conifers that sits between sections.
 *
 * The artwork fades into the page at the top so it reads as a horizon
 * rather than a pasted-in rectangle. Decorative, so it carries no alt text.
 */
export function PineBand({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div aria-hidden className={cn('pointer-events-none relative w-full overflow-hidden', className)}>
      <img
        src={asset('art/pine-band.webp')}
        alt=""
        width={1942}
        height={809}
        loading="lazy"
        decoding="async"
        className="h-auto w-full min-w-[720px] select-none"
        style={{
          transform: flip ? 'scaleX(-1)' : undefined,
          // Dissolve the top edge into the page.
          maskImage: 'linear-gradient(to bottom, transparent, #000 38%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 38%)',
        }}
      />
    </div>
  );
}
