/**
 * What the strain measures read in the **position a run begins in** — the
 * figure a project's mark is a factor of (E29).
 *
 * A mark in the content is a ratio and never a number: *a fifth dearer than at
 * the outset*. That only means something if the model can say what the outset
 * costs, and it can — the starting position follows from the content alone
 * (E14), so the answer does too. Change a density, a coefficient or the range
 * per head, and the marks move with it instead of staying behind as stale
 * claims about a model that has gone on without them.
 *
 * The outset is **not untouched country**, and not what a move leaves behind
 * either: the stands begin below what the ground could carry (E14), and this
 * reading is taken once at the start of a run and never again — moving on does
 * not renew it. So a mark says *dearer than at the start of the run*, and a
 * measure that falls away from its opening reading can never cross one.
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
import { totalHeads } from "./state.ts";

const KNOWN = new WeakMap<ConfigIndex, Readonly<Record<string, number>>>();

export function startReadings(index: ConfigIndex): Readonly<Record<string, number>> {
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

  const heads = totalHeads(state.sectors[HOUSEHOLDS]?.cohorts ?? {});
  if (heads > 0) {
    for (const run of result.runs) {
      const activity = index.process.get(run.process)?.activity;
      if (activity === undefined) continue;
      const key = `labour:${activity}`;
      out[key] = (out[key] ?? 0) + run.labor / heads;
    }
  }
  // What searching costs in the position a run begins in. That position is not
  // untouched country: the stands begin below what the ground could carry
  // (E14), so this is the cost of searching a range that has been lived on.
  for (const stock of index.config.stocks) {
    if (stock.regrowth === undefined) continue;
    out[`search:${stock.id}`] = Math.max(1, result.effortPerStock[stock.id] ?? 1);
  }

  KNOWN.set(index, out);
  return out;
}
