import type { Config } from "./config.ts";
import { HOUSEHOLDS } from "./phases.ts";
import { createRandomState } from "./random.ts";
import type { GameState } from "./state.ts";

export interface StartOptions {
  readonly seed: number;
  readonly heads?: number;
  readonly wilderness?: number;
  readonly water?: number;
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
        // Game and fish start at what the range carries: a band arrives in a
        // country that is full, not in one it has already hunted out (E29).
        stocks: {
          food: options.food ?? heads,
          game: (options.wilderness ?? 100) * 3.0,
          fish: (options.water ?? 40) * 4.0,
        },
        capacityHeld: {},
        productivity: config.carried.baseProductivity,
        workAbility: config.carried.baseWorkAbility,
      },
    },
    unownedCapacity: {
      wilderness: {
        // A band sits *at* the carrying capacity of its range, not far below
        // it (E14). At carrying capacity a bad year is a matter of life and
        // death, which is what makes storing worth the work and land worth
        // taking.
        //
        // The number is a measurement and follows the coefficients: it is
        // where a settlement that decides *nothing* stops growing. With the
        // stage's twelve techniques, 300 left a third of every hand idle and
        // carried 179 people — three and a half times the band. At 100 the
        // idle share is three per cent.
        amount: options.wilderness ?? 100,
        quality: config.land.baseQuality,
      },
      // A stretch of shore. Small on purpose: from the bank one reaches a few
      // metres, and it is the boat that opens the rest (E29). Unowned like the
      // wilderness — nobody owns the water before there is property.
      water: {
        amount: options.water ?? 40,
        quality: config.land.baseQuality,
      },
    },
    landTakings: 0,
    completedProjects: {},
    activeProjects: [],
    leadProcess: {},
    experience: {},
  };
}
