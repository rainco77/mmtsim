import type { ConfigIndex } from "./config.ts";
import { PIPELINE, type TickContext } from "./phases.ts";
import { computeUnlocks } from "./unlocks.ts";
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
  const ctx: TickContext = {
    yearQuality: 1,
    unlocks: computeUnlocks(state, index),
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
