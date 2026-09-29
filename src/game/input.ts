/**
 * Downhill - input.
 *
 * Keys are only claimed while a run is live. Outside a run the arrow keys and
 * Space belong to the page, and a portfolio that swallows them to power a
 * mini-game nobody started would be broken, not clever.
 */
import type { Input } from './engine';

const LEFT = new Set(['ArrowLeft', 'a', 'A']);
const RIGHT = new Set(['ArrowRight', 'd', 'D']);
/** Keys that would scroll the page out from under a run in progress. */
const CLAIMED = new Set([...LEFT, ...RIGHT, 'ArrowUp', 'ArrowDown', ' ', 'PageUp', 'PageDown']);

export class Controls {
  readonly input: Input = { steer: 0, pointerX: null };
  private left = false;
  private right = false;
  private active = false;
  private surface: HTMLElement | null = null;

  /** True while a run is live; only then are keys and touch claimed. */
  setActive(active: boolean) {
    this.active = active;
    if (!active) {
      this.left = this.right = false;
      this.input.steer = 0;
    }
    if (this.surface) {
      // Let a finger scroll the page past an idle game; claim it mid-run.
      this.surface.style.touchAction = active ? 'none' : 'pan-y';
    }
  }

  attach(surface: HTMLElement) {
    this.surface = surface;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    surface.addEventListener('pointermove', this.onPointer);
    surface.addEventListener('pointerdown', this.onPointer);
    surface.addEventListener('pointerleave', this.onLeave);
    this.setActive(this.active);
  }

  detach() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.surface?.removeEventListener('pointermove', this.onPointer);
    this.surface?.removeEventListener('pointerdown', this.onPointer);
    this.surface?.removeEventListener('pointerleave', this.onLeave);
    this.surface = null;
  }

  private sync() {
    this.input.steer = (this.right ? 1 : 0) - (this.left ? 1 : 0);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.active) return;
    // Never steal keys from a text field elsewhere on the page.
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!CLAIMED.has(e.key)) return;

    e.preventDefault();
    if (LEFT.has(e.key)) this.left = true;
    if (RIGHT.has(e.key)) this.right = true;
    // A key press takes over from the pointer until it moves again.
    this.input.pointerX = null;
    this.sync();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (LEFT.has(e.key)) this.left = false;
    if (RIGHT.has(e.key)) this.right = false;
    this.sync();
  };

  private onPointer = (e: PointerEvent) => {
    if (!this.surface) return;
    const rect = this.surface.getBoundingClientRect();
    this.input.pointerX = e.clientX - rect.left;
  };

  private onLeave = () => {
    this.input.pointerX = null;
  };
}
