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
  const heads = options.heads ?? 50;
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
      wilderness: {
        // A band sits *at* the carrying capacity of its range, not far below
        // it. Fifty people need about 270 of this to feed themselves fully, so
        // 900 meant they used a fifth of their territory and nothing ever
        // pressed. At carrying capacity a bad year is a matter of life and
        // death, which is what makes storing worth the work and land worth
        // taking — and it has to be scaled with the starting band, since 180
        // (right for thirty) left fifty people permanently below satiety, with
        // no births, no projects and no way out.
        amount: options.wilderness ?? 300,
        quality: config.land.baseQuality,
      },
    },
    landTakings: 0,
    completedProjects: {},
    activeProjects: [],
    leadProcess: {},
  };
}
