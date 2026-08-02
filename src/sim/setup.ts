import type { Config } from "./config.ts";
import type { CapacityId, StockId } from "./ids.ts";
import { HOUSEHOLDS } from "./phases.ts";
import { createRandomState } from "./random.ts";
import { carryingArea, type Capacity, type GameState } from "./state.ts";

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
  const heads = options.heads ?? 25;

  // The range follows the community (E14): so much of each capacity per head. The
  // options are there for tests and measurements, not for the game.
  const unownedCapacity: Record<CapacityId, Capacity> = {};
  for (const [id, perHead] of Object.entries(config.land.perHeadAtStart)) {
    const override = id === "wilderness" ? options.wilderness : id === "water" ? options.water : undefined;
    unownedCapacity[id] = {
      amount: override ?? heads * perHead,
      quality: config.land.baseQuality,
    };
  }

  // Nothing put by. The community owns what the country holds and not one meal more:
  // living from hand to mouth is the state the epoch starts in and the thing it
  // spends itself getting out of, so handing it a reserve on the first tick
  // gives away the very want that the storage pit later answers. It made no
  // difference in any case — food spoils at nine tenths a tick, so of the
  // twenty-five it used to start with, two and a half survived to the first
  // allocation.
  //
  // What it does start with is a full country: what lives on the range begins
  // at what the range carries, because a community arrives in a country it has not
  // yet hunted out. Reckoned from the same rule the regrowth uses, so the two
  // cannot drift apart.
  const stocks: Record<StockId, number> = { food: options.food ?? 0 };
  for (const stock of config.stocks) {
    const rule = stock.regrowth;
    if (rule === undefined) continue;
    const range = unownedCapacity[rule.capacity];
    stocks[stock.id] = (range === undefined ? 0 : carryingArea(range)) * rule.densityPerArea;
  }

  return {
    tick: 0,
    random: createRandomState(options.seed),
    sectors: {
      [HOUSEHOLDS]: {
        heads,
        stocks,
        capacityHeld: {},
        productivity: config.carried.baseProductivity,
        workAbility: config.carried.baseWorkAbility,
      },
    },
    unownedCapacity,
    landTakings: 0,
    // Nothing has happened yet, so nothing was short: the first tick may save.
    lastCoverage: {},
    completedProjects: {},
    activeProjects: [],
    leadProcess: {},
    experience: {},
  };
}
