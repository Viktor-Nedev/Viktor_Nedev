import { motion, type Variants } from 'motion/react';
import { Fragment, type ReactNode } from 'react';

/** Restricted to HTML tags: R3F widens the global JSX namespace with
 *  three.js elements, which have no children/className props. */
type Tag = keyof HTMLElementTagNameMap;
import { EASE } from '../../lib/easing';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distance travelled on entry, in px. */
  y?: number;
  as?: Tag;
}

/**
 * Fades and lifts content into view once.
 *
 * Motion owns mount transitions; GSAP owns scroll-linked work. Keeping that
 * split means two libraries never animate the same property on one element.
 */
export function Reveal({ children, className, delay = 0, y = 28, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as 'div'] ?? motion.div;

  if (reduced) {
    const Plain = as as 'div';
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: '0.6em', rotateX: -55 },
  shown: { opacity: 1, y: '0em', rotateX: 0 },
};

/**
 * Reveals a heading word by word.
 *
 * Splitting on words rather than characters keeps Cyrillic text readable to
 * screen readers and avoids breaking ligatures.
 */
export function RevealText({
  text,
  className,
  as: Tag = 'h2',
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: Tag;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <Tag className={className}>{text}</Tag>;

  const words = text.split(' ');

  return (
    <Tag className={className} style={{ perspective: 800 }}>
      {/* Split words are hidden from assistive tech and the whole string is
          exposed once, so a screen reader reads a sentence, not loose words. */}
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        style={{ display: 'inline' }}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ staggerChildren: 0.045, delayChildren: delay }}
      >
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span
              style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}
            >
              <motion.span
                style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
                variants={wordVariants}
                transition={{ duration: 0.85, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
            {/* The separator sits outside the clipping wrapper, or
                `overflow: hidden` swallows it and words run together. */}
            {i < words.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
