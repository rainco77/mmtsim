import type { Config } from "./config.ts";
import type { CapacityId, CohortId, StockId } from "./ids.ts";
import { HOUSEHOLDS } from "./phases.ts";
import { createRandomState } from "./random.ts";
import { carryingArea, weighedHeads, type Capacity, type GameState } from "./state.ts";

export interface StartOptions {
  readonly seed: number;
  /** Total heads; split over the cohorts in the shares the content gives. */
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

  // The community is taken over, not founded: it stands in the age structure a
  // standing population has, and not as twenty-five grown strangers. The shares
  // come from the content, so the two cannot drift apart.
  const cohorts: Record<CohortId, number> = {};
  for (const cohort of config.population.cohorts) {
    cohorts[cohort.id] = heads * (config.population.shareAtStart[cohort.id] ?? 0);
  }

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
    stocks[stock.id] =
      (range === undefined ? 0 : carryingArea(range)) *
      rule.densityPerArea *
      config.land.stocksAtStart;
  }

  // **What is worn rather than used up is already there.** The community is
  // taken over, not born: nobody in it was made this tick, so it stands in the
  // clothes it has always stood in. A store is saved-up future and is withheld
  // on purpose; a hide on somebody's back is present fact.
  //
  // Reckoned from the need itself, so it cannot drift from it, and only where
  // the branch is open from the start — a wandering community has no houses,
  // whatever the roof tier asks for.
  //
  // Without it the first tick clothed twenty-five naked people at once and then
  // never came near that again: 0.155 of everyone's work against 0.008 to
  // replace what wears out. Anything measured against that first tick was
  // measured against a thing that happens exactly once, and the three clothing
  // projects were never once offered in three hundred ticks. The community also
  // began at 0.58 covered and lost work for it, having lived there all along.
  for (const tier of config.needTiers) {
    const kept = tier.perHead * (1 - tier.consumedOnUse);
    if (kept <= 0) continue;
    if (config.branches.find((b) => b.id === tier.branch)?.unlockedFromStart !== true) continue;
    stocks[tier.stock] = (stocks[tier.stock] ?? 0) + weighedHeads(cohorts, tier.perHeadWeight) * kept;
  }

  return {
    tick: 0,
    random: createRandomState(options.seed),
    sectors: {
      [HOUSEHOLDS]: {
        cohorts,
        stocks,
        capacityHeld: {},
        productivity: config.carried.baseProductivity,
        workAbility: config.carried.baseWorkAbility,
      },
    },
    unownedCapacity,
    // Untouched country carries what the content says and not a fish more.
    rangeCarries: {},
    // Nothing is put by until the player says to.
    stockTargets: {},
    stockRanks: {},
    landTakings: 0,
    landOffer: 1,
    // Nothing has happened yet, so nothing was short: the first tick may save.
    lastCoverage: {},
    // Fresh country: nothing has been searched for yet.
    seenProjects: {},
    lastEffort: {},
    lastLabourPerHead: {},
    lastUtilisation: {},
    completedProjects: {},
    activeProjects: [],
    leadProcess: {},
    experience: {},
  };
}
