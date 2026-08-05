/**
 * What the strain measures read on **fresh country** — the figure a project's
 * mark is a factor of (E29).
 *
 * A mark in the content is a ratio and never a number: *a fifth dearer than on
 * an untouched range*. That only means something if the model can say what
 * untouched costs, and it can — the starting position follows from the content
 * alone (E14), so the answer does too. Change a density, a coefficient or the
 * range per head, and the marks move with it instead of staying behind as
 * stale claims about a model that has gone on without them.
 *
 * Worked out once per configuration and kept, because it cannot change while a
 * run is going: it is a property of the content, not of the game.
 */
import type { ConfigIndex } from "./config.ts";
import { allocate } from "./allocation.ts";
import { HOUSEHOLDS } from "./phases.ts";
import { drawShocks } from "./risk.ts";
import { createState } from "./setup.ts";
import { computeUnlocks } from "./unlocks.ts";

const KNOWN = new WeakMap<ConfigIndex, Readonly<Record<string, number>>>();

export function freshMarks(index: ConfigIndex): Readonly<Record<string, number>> {
  const known = KNOWN.get(index);
  if (known !== undefined) return known;

  const out: Record<string, number> = {};
  // The seed does not matter: the plan reckons with an average draw whatever
  // the draw, and the first tick is planned before anything has been taken.
  const state = createState(index.config, { seed: 1 });
  const unlocks = computeUnlocks(state, index);
  const result = allocate({
    state,
    index,
    sectorId: HOUSEHOLDS,
    shocks: drawShocks(state.random, index.config).shocks,
    unlockedBranches: unlocks.branches,
    unlockedProcesses: unlocks.processes,
    tierPerHead: unlocks.tierPerHead,
  });

  const heads = state.sectors[HOUSEHOLDS]?.heads ?? 0;
  if (heads > 0) {
    for (const run of result.runs) {
      const activity = index.process.get(run.process)?.activity;
      if (activity === undefined) continue;
      const key = `labour:${activity}`;
      out[key] = (out[key] ?? 0) + run.labor / heads;
    }
  }
  // On untouched ground a stand stands at its ceiling, so searching costs one
  // by construction — written out all the same, so that the mark reads the same
  // way for every measure and nobody has to remember the special case.
  for (const stock of index.config.stocks) {
    if (stock.regrowth === undefined) continue;
    out[`search:${stock.id}`] = Math.max(1, result.effortPerStock[stock.id] ?? 1);
  }

  KNOWN.set(index, out);
  return out;
}
