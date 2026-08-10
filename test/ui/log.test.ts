import { describe, expect, it } from "vitest";
import { DISTRESS_KEY, newestTickFirst, type Entry } from "../../src/ui/log.ts";

/**
 * Tests of the interface, kept apart from the tests of the core: the core
 * knows nothing of screens, and a test of a screen must never be mistaken for
 * a statement about the model.
 *
 * The rule under test: the log shows the newest tick on top, but inside a tick
 * the order in which the events were made stands — and the distress line,
 * which is made first, leads its tick.
 */

const entry = (tick: number, key: string): Entry => ({ tick, key, params: {} });

describe("the event log's order (T9)", () => {
  it("puts the newest tick on top", () => {
    const ordered = newestTickFirst([
      entry(1, "events.seen"),
      entry(2, "events.done"),
      entry(3, "events.buildable"),
    ]);
    expect(ordered.map((e) => e.tick)).toEqual([3, 2, 1]);
  });

  it("leaves the order inside a tick alone", () => {
    const ordered = newestTickFirst([
      entry(7, "first"),
      entry(7, "second"),
      entry(7, "third"),
    ]);
    expect(ordered.map((e) => e.key)).toEqual(["first", "second", "third"]);
  });

  it("lets the distress line lead its tick, however much else that tick brought", () => {
    const ordered = newestTickFirst([
      entry(28, "events.done"),
      entry(29, DISTRESS_KEY),
      entry(29, "events.seen"),
      entry(29, "events.seen"),
      entry(29, "events.buildable"),
      entry(29, "events.buildable"),
    ]);
    expect(ordered[0]).toEqual(entry(29, DISTRESS_KEY));
  });

  it("turns the ticks around without shuffling the lines within them", () => {
    const ordered = newestTickFirst([
      entry(1, "a"),
      entry(1, "b"),
      entry(2, "c"),
      entry(2, "d"),
    ]);
    expect(ordered.map((e) => e.key)).toEqual(["c", "d", "a", "b"]);
  });

  it("holds for an empty log and for a single line", () => {
    expect(newestTickFirst([])).toEqual([]);
    expect(newestTickFirst([entry(4, "only")])).toEqual([entry(4, "only")]);
  });
});
