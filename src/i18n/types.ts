import type { en } from './en';

/**
 * Recursively widens literal types to `string` while preserving the exact
 * key structure.
 *
 * `en` is declared `as const` so its values narrow to string literals. Typing
 * `bg` directly against that would demand the English words themselves. This
 * keeps the shape - so a missing, extra, or misspelled key is still a compile
 * error - while letting each language supply its own text.
 */
export type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Dict = Widen<typeof en>;

export type Lang = 'bg' | 'en';
