import { de } from "./de.ts";
import { en } from "./en.ts";
import type { Language } from "./language.ts";

/**
 * The translation layer (T6): a flat key table per language, one function, no
 * library. A message is a key plus a few numbers; `{name}` is replaced.
 *
 * A key missing from a table is not papered over — the raw key appears on the
 * screen, which is how a hole in the layer shows itself at once.
 */
export const LANGUAGES: readonly Language[] = ["de", "en"];

const tables: Record<Language, Readonly<Record<string, string>>> = { de, en };

export function translate(
  language: Language,
  key: string,
  params?: Readonly<Record<string, string | number>>,
): string {
  const raw = tables[language][key] ?? key;
  if (params === undefined) return raw;
  return raw.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = params[name];
    return value === undefined ? whole : String(value);
  });
}

/** A piece of a message, and whether the surface should set it apart. */
export interface Segment {
  readonly text: string;
  readonly strong: boolean;
}

/**
 * A message cut into its pieces, so that some of the values filled into it can
 * be drawn differently from the sentence around them.
 *
 * The sentence stays whole in the table — a sentence assembled out of
 * fragments cannot be translated — and the emphasis stays in the surface,
 * where it belongs: the table says what is said, the screen says how it looks.
 */
export function segments(
  language: Language,
  key: string,
  params: Readonly<Record<string, string | number>>,
  strong: readonly string[],
): readonly Segment[] {
  const raw = tables[language][key] ?? key;
  const out: Segment[] = [];
  let last = 0;
  for (const match of raw.matchAll(/\{(\w+)\}/g)) {
    const name = match[1] ?? "";
    const value = params[name];
    if (value === undefined) continue;
    const at = match.index;
    if (at > last) out.push({ text: raw.slice(last, at), strong: false });
    out.push({ text: String(value), strong: strong.includes(name) });
    last = at + match[0].length;
  }
  if (last < raw.length) out.push({ text: raw.slice(last), strong: false });
  return out;
}
