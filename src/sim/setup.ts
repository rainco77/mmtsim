import { allocate } from "./allocation.ts";
import { indexConfig, type Config } from "./config.ts";
import type { CapacityId, CohortId, StockId } from "./ids.ts";
import { HOUSEHOLDS, renewals } from "./phases.ts";
import { computeUnlocks } from "./unlocks.ts";
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
    const override =
      id === "wilderness"
        ? options.wilderness
        : id === "water"
          ? options.water
          : undefined;
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
  // What lives on the range begins **where it comes to rest** — where what grows
  // back equals what this community takes (E14). A community is not newly
  // arrived: it has been living here, so the country already stands where its
  // own taking holds it. Any other figure moves in the opening ticks, and then
  // the first stretch of every run measures a country settling down rather than
  // a country being lived on.
  //
  // Reckoned and not written down, so that a change to a density, a rate, a
  // process or a need carries the opening with it instead of leaving stale
  // numbers behind. Started at the ceiling and settled below.
  const stocks: Record<StockId, number> = { food: options.food ?? 0 };
  for (const stock of config.stocks) {
    const rule = stock.regrowth;
    if (rule === undefined) continue;
    const range = unownedCapacity[rule.capacity];
    stocks[stock.id] =
      (range === undefined ? 0 : carryingArea(range)) * rule.densityPerArea;
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
    if (config.branches.find((b) => b.id === tier.branch)?.unlockedFromStart !== true)
      continue;
    stocks[tier.stock] =
      (stocks[tier.stock] ?? 0) + weighedHeads(cohorts, tier.perHeadWeight) * kept;
  }

  const opening: GameState = {
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
    lastNeed: {},
    // Fresh country: nothing has been searched for yet.
    seenProjects: {},
    lastEffort: {},
    lastLabourPerHead: {},
    lastUtilisation: {},
    // No tick has run, so nothing has been done yet.
    lastBorn: 0,
    lastSurvival: {},
    lastLabor: { available: 0, toProduction: 0, toProjects: 0, unused: 0 },
    lastBirthFactors: { coverage: 1, carrying: 1 },
    lastRuns: [],
    lastBinding: {},
    lastProjectBinding: {},
    lastStore: {},
    completedProjects: {},
    activeProjects: [],
    leadProcess: {},
    experience: {},
  };

  return freshlyArrived(atRest(opening, config), config);
}

/**
 * The arrival: stocks marked `freshAtStart` open the way a move leaves them —
 * their share of the gap to the ceiling closed above the rest the settling
 * found. The community has just come here; what is slow to grow has not yet
 * been thinned by it.
 */
function freshlyArrived(state: GameState, config: Config): GameState {
  const sector = state.sectors[HOUSEHOLDS];
  if (sector === undefined) return state;
  const stocks: Record<StockId, number> = { ...sector.stocks };
  for (const stock of config.stocks) {
    const rule = stock.regrowth;
    if (rule?.freshAtStart === undefined) continue;
    const range = state.unownedCapacity[rule.capacity];
    const ceiling = (range === undefined ? 0 : carryingArea(range)) * rule.densityPerArea;
    const held = stocks[stock.id] ?? 0;
    stocks[stock.id] = held + rule.freshAtStart * Math.max(0, ceiling - held);
  }
  return {
    ...state,
    sectors: { ...state.sectors, [HOUSEHOLDS]: { ...sector, stocks } },
  };
}

/**
 * How many rounds the country is settled in, and how far a stand is moved in
 * each of them.
 *
 * What is taken depends on how dear the searching is, and that on where the
 * stand stands, so the two are found by going round rather than in one step.
 * Moved the whole way each round it does not settle at all but swings: a stand
 * left full is searched cheaply, so everything is taken from it, so the answer
 * is a thin stand, which is then searched dearly and left alone again. Moved a
 * third of the way it comes to rest.
 */
const SETTLE_ROUNDS = 40;
const SETTLE_STEP = 1 / 3;

/**
 * The opening country, moved to where this community's taking holds it.
 *
 * Growth is `rate · (held + refuge) · (1 − held / ceiling)`, so a stand rests
 * where that equals what is taken. Of the two roots the **upper** one is the
 * stable one: above it the growing back falls short of the taking and the stand
 * comes down again, while below the halfway mark a thinner stand yields less
 * still and the fall feeds itself. Where the taking is more than the stand can
 * ever grow there is no rest at all, and the most that can be offered is the
 * top of the growth curve.
 */
function atRest(opening: GameState, config: Config): GameState {
  const index = indexConfig(config);
  const unlocks = computeUnlocks(opening, index);
  let state = opening;

  for (let round = 0; round < SETTLE_ROUNDS; round += 1) {
    const taken = allocate({
      state,
      index,
      sectorId: HOUSEHOLDS,
      // An average draw: the opening is a property of the content and not of
      // the seed, so no weather is rolled into it.
      shocks: {},
      unlockedBranches: unlocks.branches,
      unlockedProcesses: unlocks.processes,
      tierPerHead: unlocks.tierPerHead,
    }).consumed;

    const sector = state.sectors[HOUSEHOLDS];
    if (sector === undefined) return state;
    const stocks: Record<StockId, number> = { ...sector.stocks };
    for (const [id, stand] of Object.entries(renewals(state, index))) {
      const rule = index.stock.get(id)?.regrowth;
      if (rule === undefined || stand === undefined) continue;
      const rest = restingStand(
        taken[id] ?? 0,
        rule.ratePerTick,
        stand.ceiling,
        rule.refuge,
      );
      stocks[id] = stand.held + (rest - stand.held) * SETTLE_STEP;
    }
    state = {
      ...state,
      sectors: { ...state.sectors, [HOUSEHOLDS]: { ...sector, stocks } },
    };
  }
  return state;
}

/** Where one stand rests: the upper root of growth against taking. */
function restingStand(
  taken: number,
  rate: number,
  ceiling: number,
  refuge: number,
): number {
  if (ceiling <= 0 || rate <= 0) return 0;
  const gap = (ceiling + refuge) ** 2 - (4 * taken * ceiling) / rate;
  const peak = (ceiling - refuge) / 2;
  if (gap <= 0) return Math.max(0, Math.min(ceiling, peak));
  return Math.max(0, Math.min(ceiling, (ceiling - refuge + Math.sqrt(gap)) / 2));
}
