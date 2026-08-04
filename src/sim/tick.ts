import type { ConfigIndex } from "./config.ts";
import { PIPELINE, type TickContext } from "./phases.ts";
import { computeUnlocks } from "./unlocks.ts";
import { freshMarks } from "./fresh.ts";
import type { GameState } from "./state.ts";

/**
 * One step of the world (T1, T2).
 *
 * The simulation has no clock: the shell decides when this is called — a timer
 * in the browser, a loop headless, fixed steps in a test. Game time is the tick
 * count, nothing else (E17).
 *
 * Same input, same output. No DOM, no `Math.random`, no `Date`; the seeded
 * generator lives in the state.
 */
export function tick(state: GameState, index: ConfigIndex): GameState {
  // A community that has been given up has no next tick — not a quiet one
  // either. The clock stops where it stopped, and the shell reads that off the
  // state instead of being trusted to stop calling.
  if (state.abandonedAt !== undefined) return state;

  const ctx: TickContext = {
    shocks: {},
    unlocks: computeUnlocks(state, index),
    fresh: freshMarks(index),
    laborAvailable: 0,
    laborToProjects: 0,
    completed: [],
  };

  let next = state;
  for (const phase of PIPELINE) {
    next = phase.run(next, index, ctx);
  }
  return { ...next, tick: next.tick + 1 };
}
