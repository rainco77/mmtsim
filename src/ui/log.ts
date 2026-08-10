/**
 * The order of the event log (T9). The wording lives in the translation layer
 * and the events themselves are read out of the history; what is decided here
 * is only in which order the player meets them.
 */

/** One line of the log: a tick, a translation key and the numbers it takes. */
export interface Entry {
  readonly tick: number;
  readonly key: string;
  readonly params: Readonly<Record<string, string | number>>;
}

/** The key of the distress line — the one line that leads its tick. */
export const DISTRESS_KEY = "events.distress";

/**
 * Newest tick on top, and inside a tick the order stands: the ticks are turned
 * around, not the lines. Entries arrive oldest first, and within a tick in the
 * order they were made — distress first, because that is the one the player
 * must not miss. Turning every line around would put it at the bottom of its
 * own tick, behind however many projects that tick also brought, and out of
 * the short tile altogether.
 */
export function newestTickFirst(entries: readonly Entry[]): Entry[] {
  const out: Entry[] = [];
  let end = entries.length;
  while (end > 0) {
    const tick = entries[end - 1]?.tick;
    let start = end;
    while (start > 0 && entries[start - 1]?.tick === tick) start -= 1;
    out.push(...entries.slice(start, end));
    end = start;
  }
  return out;
}
