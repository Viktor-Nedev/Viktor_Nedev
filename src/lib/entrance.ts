/**
 * Signals when the entry curtain has lifted.
 *
 * Animations that play once on arrival must not run behind the loader -
 * they would finish unseen. Components subscribe here instead of guessing
 * with a timeout, which would drift whenever the loader timing changes.
 */
let entered = false;
const waiting = new Set<() => void>();

export function markEntered() {
  if (entered) return;
  entered = true;
  waiting.forEach((fn) => fn());
  waiting.clear();
}

export function hasEntered() {
  return entered;
}

/** Calls back once the curtain is gone; immediately if it already is. */
export function onEntered(fn: () => void): () => void {
  if (entered) {
    fn();
    return () => {};
  }
  waiting.add(fn);
  return () => waiting.delete(fn);
}
