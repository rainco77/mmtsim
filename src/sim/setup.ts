import type { Config } from "./config.ts";
import { HOUSEHOLDS } from "./phases.ts";
import { createRandomState } from "./random.ts";
import type { GameState } from "./state.ts";

export interface StartOptions {
  readonly seed: number;
  readonly heads?: number;
  readonly wilderness?: number;
  readonly food?: number;
}

/**
 * The starting world. The one sector holds everything a sector can hold; the
 * shape does not change when property and further sectors arrive later (E22).
 *
 * The wilderness belongs to nobody (E13). It is not commonly owned — a
 * regulated commons would be an institution, and there is none.
 */
export function createState(config: Config, options: StartOptions): GameState {
  const heads = options.heads ?? 30;
  return {
    tick: 0,
    random: createRandomState(options.seed),
    sectors: {
      [HOUSEHOLDS]: {
        heads,
        // Enough for the first tick, so the settlement does not start starving.
        stocks: { food: options.food ?? heads },
        capacityHeld: {},
        productivity: config.carried.baseProductivity,
        workAbility: config.carried.baseWorkAbility,
      },
    },
    unownedCapacity: {
      wilderness: { amount: options.wilderness ?? 900, quality: config.land.baseQuality },
    },
    landTakings: 0,
    completedProjects: {},
    activeProjects: [],
    leadProcess: {},
  };
}
