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
