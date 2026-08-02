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

  // The range follows the band (E14): so much of each capacity per head. The
  // options are there for tests and measurements, not for the game.
  const unownedCapacity: Record<CapacityId, Capacity> = {};
  for (const [id, perHead] of Object.entries(config.land.perHeadAtStart)) {
    const override = id === "wilderness" ? options.wilderness : id === "water" ? options.water : undefined;
    unownedCapacity[id] = {
      amount: override ?? heads * perHead,
      quality: config.land.baseQuality,
    };
  }

  // And what lives on it starts at what it carries — a band arrives in a full
  // country, not in one it has already hunted out. Reckoned from the same rule
  // the regrowth uses, so the two cannot drift apart.
  const stocks: Record<StockId, number> = { food: options.food ?? heads };
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
