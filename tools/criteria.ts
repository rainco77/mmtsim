import { STAGE1 } from "../src/content/stage1.ts";
import { PassivePolicy, PoorPolicy, SensiblePolicy } from "../src/policy/bots/index.ts";
import type { Policy } from "../src/policy/policy.ts";
import { apply, createState, derive, indexConfig, tick } from "../src/sim/index.ts";
import type { Derived, GameState } from "../src/sim/index.ts";

/**
 * Balancing is a measurement, not an impression (E27).
 *
 *   node tools/criteria.ts --seeds 20 --cap 600
 *
 * Two kinds of measurement, and they are worth very different things:
 *
 * **Experiments** need no player. They set a state, vary one thing and look at
 * the mechanism — so a failure is unambiguously the model's. These are the ones
 * that prove something, and it is no accident that they are exactly the ones
 * that come out of the literature.
 *
 * **Tripwires** are played, so they cannot tell a defective model from a stupid
 * bot. What they can do is say that a number *moved* after a change, and refute
 * an absolute claim. They never say what to turn. That is why every one of them
 * reports the seed and the tick where it first broke: an aggregate is an
 * address to go and look at, not a conclusion (E30).
 *
 * Everything is measured **inside the epoch** — up to the tick sedentism is
 * finished. What comes after belongs to a stage whose content does not exist
 * yet, and measuring placeholders teaches nothing.
 */

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i]?.replace(/^--/, "");
  const value = process.argv[i + 1];
  if (key !== undefined && value !== undefined) args.set(key, value);
}
/** Where a run is cut off if sedentism never comes. */
const CAP = Number(args.get("cap") ?? 600);
const SEEDS = Number(args.get("seeds") ?? 20);

const index = indexConfig(STAGE1);
const FOOD = "food";

const mean = (xs: readonly number[]): number =>
  xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const share = (xs: readonly boolean[]): number => xs.filter(Boolean).length / (xs.length || 1);
const round = (value: number): number => Math.round(value * 1000) / 1000;
const seedOf = (i: number): number => 101 + i * 13;

// ------------------------------------------------------------------ experiments

/**
 * A technology stand: which projects are finished. Only **techniques** — the
 * ones that change a coefficient. Pits, taking land and the boat are left out
 * on purpose, because they change the land itself, and the whole point of the
 * experiment is to hold the land fixed while the people multiply.
 */
const STANDS: Readonly<Record<string, readonly string[]>> = {
  raw: [],
  opened: ["mortar", "earth_oven"],
  equipped: ["mortar", "earth_oven", "sickle", "bow_and_arrow", "fishing_net", "stone_axe"],
  full: [
    "mortar",
    "earth_oven",
    "sickle",
    "bow_and_arrow",
    "fishing_net",
    "stone_axe",
    "tanning",
    "bone_needle",
  ],
};

const DENSITIES = [50, 100, 200, 400];

interface Cell {
  /** Food produced per head — Ricardo and Malthus: must fall as heads rise. */
  readonly foodPerHead: number;
  /**
   * Food out of one unit of wilderness — Boserup: must **rise** as heads rise.
   *
   * Wilderness alone, not "area": adding hectares of forest to hectares of
   * water gives a number that means nothing, and it was measured to move for
   * the wrong reason — at fifty heads the little water carries a lot of the
   * food, so the mixed figure fell without any intensification happening.
   */
  readonly foodPerWilderness: number;
  /**
   * Labour per unit of food — the other half of Boserup, and the half that
   * distinguishes it from ordinary efficiency: working the same ground harder
   * costs *more* hands per unit, not fewer. Must rise as heads rise.
   */
  readonly laborPerFood: number;
  /** How many food processes actually carry something — the broad spectrum. */
  readonly foodProcesses: number;
}

function at(stand: readonly string[], heads: number, seed: number): Cell {
  const base = createState(STAGE1, { seed, food: 0 });
  const state: GameState = {
    ...base,
    sectors: {
      ...base.sectors,
      households: { ...base.sectors["households"]!, heads, stocks: { food: 0 } },
    },
    completedProjects: Object.fromEntries(stand.map((id) => [id, 1])),
  };
  const d = derive(state, index);

  let food = 0;
  let wilderness = 0;
  let onWilderness = 0;
  let labor = 0;
  const carrying: number[] = [];
  for (const run of d.runs) {
    const process = index.process.get(run.process);
    if (process === undefined) continue;
    if (index.branch.get(process.branch)?.produces !== FOOD) continue;
    food += run.output;
    labor += run.labor;
    carrying.push(run.output);
    const per = process.capacityPerOutput["wilderness"] ?? 0;
    if (per > 0) {
      wilderness += run.output * per;
      onWilderness += run.output;
    }
  }
  return {
    foodPerHead: heads > 0 ? food / heads : 0,
    foodPerWilderness: wilderness > 0 ? onWilderness / wilderness : 0,
    laborPerFood: food > 0 ? labor / food : 0,
    // One per cent of the food or more: below that a process is rounding, not
    // a part of the diet.
    foodProcesses: carrying.filter((output) => output > food * 0.01).length,
  };
}

/** Averaged over a few draws, so one bad year does not decide a law. */
function cell(stand: readonly string[], heads: number): Cell {
  const runs = Array.from({ length: 8 }, (_, i) => at(stand, heads, seedOf(i)));
  return {
    foodPerHead: mean(runs.map((r) => r.foodPerHead)),
    foodPerWilderness: mean(runs.map((r) => r.foodPerWilderness)),
    laborPerFood: mean(runs.map((r) => r.laborPerFood)),
    foodProcesses: mean(runs.map((r) => r.foodProcesses)),
  };
}

const grid = Object.fromEntries(
  Object.entries(STANDS).map(([name, stand]) => [name, DENSITIES.map((n) => cell(stand, n))]),
);

/** Does the series fall from first to last, at every stand? */
function fallsEverywhere(pick: (cell: Cell) => number): {
  pass: boolean;
  byStand: Record<string, number[]>;
  broken: string[];
} {
  const byStand: Record<string, number[]> = {};
  const broken: string[] = [];
  for (const [name, cells] of Object.entries(grid)) {
    const series = cells.map((c) => round(pick(c)));
    byStand[name] = series;
    const first = series[0] ?? 0;
    const last = series[series.length - 1] ?? 0;
    if (!(last < first)) broken.push(name);
  }
  return { pass: broken.length === 0, byStand, broken };
}

function risesEverywhere(pick: (cell: Cell) => number): {
  pass: boolean;
  byStand: Record<string, number[]>;
  broken: string[];
} {
  const byStand: Record<string, number[]> = {};
  const broken: string[] = [];
  for (const [name, cells] of Object.entries(grid)) {
    const series = cells.map((c) => round(pick(c)));
    byStand[name] = series;
    const first = series[0] ?? 0;
    const last = series[series.length - 1] ?? 0;
    if (last < first) broken.push(name);
  }
  return { pass: broken.length === 0, byStand, broken };
}

// ------------------------------------------------------------------- tripwires

interface Trace {
  readonly seed: number;
  readonly sedentismAt: number | null;
  readonly abandoned: boolean;
  readonly length: number;
  readonly headsAtEnd: number;
  readonly idleShare: number;
  readonly idleBreachAt: number | null;
  readonly maxOffers: number;
  readonly offerBreachAt: number | null;
  readonly projectsDone: number;
  readonly lowestCoverage: number;
  readonly hideShare: number;
  readonly fibreShare: number;
  readonly waterFoodShare: number;
  readonly headsAtStart: number;
  readonly foodPerHeadFirst: number;
  readonly foodPerHeadLast: number;
}

const IDLE_LIMIT = 0.15;
const OFFER_LIMIT = 5;

function offers(d: Derived): number {
  return d.projects.filter((p) => p.available && !p.running).length;
}

/** Shares of what one branch produced, by process. */
function branchShares(d: Derived, produces: string): Map<string, number> {
  const out = new Map<string, number>();
  let total = 0;
  for (const run of d.runs) {
    const process = index.process.get(run.process);
    if (process === undefined) continue;
    if (index.branch.get(process.branch)?.produces !== produces) continue;
    out.set(run.process, (out.get(run.process) ?? 0) + run.output);
    total += run.output;
  }
  if (total > 0) for (const [id, value] of out) out.set(id, value / total);
  return out;
}

function play(seed: number, policy: Policy): Trace {
  let state = createState(STAGE1, { seed });
  let idle = 0;
  let available = 0;
  let idleBreachAt: number | null = null;
  let maxOffers = 0;
  let offerBreachAt: number | null = null;
  let sedentismAt: number | null = null;
  let abandoned = false;
  let lowest = 1;
  let hide = 0;
  let fibre = 0;
  let waterFood = 0;
  let allFood = 0;
  let ticks = 0;
  let foodPerHeadFirst: number | null = null;
  let foodPerHeadLast = 0;
  const headsAtStart = state.sectors["households"]?.heads ?? 0;

  for (let i = 0; i < CAP; i += 1) {
    if ((state.completedProjects["sedentism"] ?? 0) > 0) {
      sedentismAt = state.tick;
      break;
    }
    const d = derive(state, index);
    ticks += 1;
    if (d.settlementAbandoned) {
      abandoned = true;
      break;
    }

    idle += d.laborUnused;
    available += d.laborPerformance;
    if (idleBreachAt === null && d.laborPerformance > 0 && d.laborUnused / d.laborPerformance > IDLE_LIMIT) {
      idleBreachAt = state.tick;
    }

    const open = offers(d);
    maxOffers = Math.max(maxOffers, open);
    if (offerBreachAt === null && open > OFFER_LIMIT) offerBreachAt = state.tick;

    for (const tier of d.tiers) lowest = Math.min(lowest, tier.coverage);

    const clothing = branchShares(d, "clothing");
    hide += (clothing.get("hide_dressing") ?? 0) + (clothing.get("tanning") ?? 0);
    fibre += clothing.get("plaiting") ?? 0;

    let foodNow = 0;
    for (const run of d.runs) {
      const process = index.process.get(run.process);
      if (process === undefined) continue;
      if (index.branch.get(process.branch)?.produces !== FOOD) continue;
      allFood += run.output;
      foodNow += run.output;
      if ((process.capacityPerOutput["water"] ?? 0) > 0) waterFood += run.output;
    }
    // Not from tick zero: the settlement starts with a store, so the first few
    // ticks produce less than they can and the series would rise for a reason
    // that has nothing to do with the standard of living. Food decays at 0.9,
    // so by tick five the store is gone.
    if (d.heads > 0 && state.tick >= 5) {
      if (foodPerHeadFirst === null) foodPerHeadFirst = foodNow / d.heads;
      foodPerHeadLast = foodNow / d.heads;
    }

    for (const action of policy.decide(state, d, index)) {
      state = apply(state, action, index).state;
    }
    state = tick(state, index);
  }

  const both = hide + fibre;
  return {
    seed,
    sedentismAt,
    abandoned,
    length: ticks,
    headsAtEnd: state.sectors["households"]?.heads ?? 0,
    idleShare: available > 0 ? idle / available : 0,
    idleBreachAt,
    maxOffers,
    offerBreachAt,
    projectsDone: Object.values(state.completedProjects).reduce((a, b) => a + b, 0),
    lowestCoverage: lowest,
    hideShare: both > 0 ? hide / both : 0,
    fibreShare: both > 0 ? fibre / both : 0,
    waterFoodShare: allFood > 0 ? waterFood / allFood : 0,
    headsAtStart,
    foodPerHeadFirst: foodPerHeadFirst ?? 0,
    foodPerHeadLast,
  };
}

const thoughtful = Array.from({ length: SEEDS }, (_, i) => play(seedOf(i), new SensiblePolicy()));
const passive = Array.from({ length: SEEDS }, (_, i) => play(seedOf(i), new PassivePolicy()));
const poor = Array.from({ length: SEEDS }, (_, i) => play(seedOf(i), new PoorPolicy()));

/** The first place a per-tick tripwire broke, so it can be replayed (E30). */
function firstBreach(
  traces: readonly Trace[],
  pick: (t: Trace) => number | null,
): { seed: number; tick: number } | null {
  let best: { seed: number; tick: number } | null = null;
  for (const trace of traces) {
    const at = pick(trace);
    if (at === null) continue;
    if (best === null || at < best.tick) best = { seed: trace.seed, tick: at };
  }
  return best;
}

/** Which seeds a run-level tripwire failed on. */
const failedSeeds = (traces: readonly Trace[], bad: (t: Trace) => boolean): number[] =>
  traces.filter(bad).map((t) => t.seed);

const settled = thoughtful.filter((t) => t.sedentismAt !== null);
const survived = (traces: readonly Trace[]): readonly Trace[] =>
  traces.filter((t) => !t.abandoned);

const report = {
  seeds: SEEDS,
  cap: CAP,
  // Measured with no player at all, so a failure can only be the model's.
  experiments: {
    // "Without decisions nobody settles" used to stand here and was worthless:
    // the passive bot digs no pits, sedentism wants pits, done. It tested the
    // configuration, not the economy, and could not fail. What the claim is
    // really about is that **time alone gives nothing** — and that is a
    // statement about the land, which can fail and does.
    "the band starts at the carrying capacity of its range (E14)": {
      startHeads: round(mean(passive.map((t) => t.headsAtStart))),
      plateauHeads: round(mean(passive.map((t) => t.headsAtEnd))),
      factor: round(
        mean(passive.map((t) => t.headsAtEnd)) /
          Math.max(1, mean(passive.map((t) => t.headsAtStart))),
      ),
      pass:
        mean(passive.map((t) => t.headsAtEnd)) <
        mean(passive.map((t) => t.headsAtStart)) * 1.25,
    },
    "waiting does not raise the standard of living": {
      foodPerHeadFirst: round(mean(passive.map((t) => t.foodPerHeadFirst))),
      foodPerHeadLast: round(mean(passive.map((t) => t.foodPerHeadLast))),
      pass:
        mean(passive.map((t) => t.foodPerHeadLast)) <=
        mean(passive.map((t) => t.foodPerHeadFirst)),
    },
    "Boserup — the same ground yields more as density rises": {
      ...risesEverywhere((c) => c.foodPerWilderness),
    },
    "Boserup — and it costs more hands per unit": {
      ...risesEverywhere((c) => c.laborPerFood),
    },
    "broad spectrum — the diet widens under pressure (Flannery, Binford)": {
      ...risesEverywhere((c) => c.foodProcesses),
    },
    "diminishing returns — food per head falls with density (Ricardo, Malthus)": {
      ...fallsEverywhere((c) => c.foodPerHead),
    },
  },
  // Played, so they point at a place — they do not judge it.
  tripwires: {
    "the epoch ends: sedentism is reached, never blocked by luck (E29)": {
      reachedShare: round(share(thoughtful.map((t) => t.sedentismAt !== null))),
      // Reported without a target: what a good length is only shows in play.
      atMean: round(mean(settled.map((t) => t.sedentismAt ?? 0))),
      atMax: settled.reduce((max, t) => Math.max(max, t.sedentismAt ?? 0), 0),
      seeds: failedSeeds(thoughtful, (t) => t.sedentismAt === null),
      pass: share(thoughtful.map((t) => t.sedentismAt !== null)) > 0.99,
    },
    "thoughtful play does not fail (E29)": {
      abandonedShare: round(share(thoughtful.map((t) => t.abandoned))),
      seeds: failedSeeds(thoughtful, (t) => t.abandoned),
      pass: share(thoughtful.map((t) => t.abandoned)) < 0.01,
    },
    "bad play is punished — it fails more often (T4)": {
      thoughtful: round(share(thoughtful.map((t) => t.abandoned))),
      poor: round(share(poor.map((t) => t.abandoned))),
      passive: round(share(passive.map((t) => t.abandoned))),
      pass:
        share(poor.map((t) => t.abandoned)) > share(thoughtful.map((t) => t.abandoned)) ||
        share(passive.map((t) => t.abandoned)) > share(thoughtful.map((t) => t.abandoned)),
    },
    // Not the population at the end: an epoch that ends at a milestone lasts
    // longer for the worse player, so his settlement has more ticks to grow in
    // and *looks* bigger. Measured that way, bad play came out ahead by a
    // factor of five. What "worse" means inside this epoch is: it takes you
    // longer to get out of it.
    "bad play is punished — it takes longer (T4)": {
      thoughtfulTicks: round(mean(survived(thoughtful).map((t) => t.sedentismAt ?? CAP))),
      poorTicks: round(mean(survived(poor).map((t) => t.sedentismAt ?? CAP))),
      passiveTicks: round(mean(survived(passive).map((t) => t.sedentismAt ?? CAP))),
      pass:
        mean(survived(poor).map((t) => t.sedentismAt ?? CAP)) >
        mean(survived(thoughtful).map((t) => t.sedentismAt ?? CAP)) * 1.2,
    },
    "the setback happens before sedentism (E29)": {
      withSetbackShare: round(share(thoughtful.map((t) => t.lowestCoverage < 0.9))),
      lowestMean: round(mean(thoughtful.map((t) => t.lowestCoverage))),
      seeds: failedSeeds(thoughtful, (t) => t.lowestCoverage >= 0.9),
      pass: share(thoughtful.map((t) => t.lowestCoverage < 0.9)) > 0.8,
    },
    "the economy is under pressure — labour does not lie idle (E10)": {
      idleShareMean: round(mean(thoughtful.map((t) => t.idleShare))),
      limit: IDLE_LIMIT,
      firstBreach: firstBreach(thoughtful, (t) => t.idleBreachAt),
      pass: mean(thoughtful.map((t) => t.idleShare)) < IDLE_LIMIT,
    },
    "the decisions spread out — never a list to skim (E31)": {
      maxOffersSeen: thoughtful.reduce((max, t) => Math.max(max, t.maxOffers), 0),
      limit: OFFER_LIMIT,
      projectsDoneMean: round(mean(thoughtful.map((t) => t.projectsDone))),
      firstBreach: firstBreach(thoughtful, (t) => t.offerBreachAt),
      pass: thoughtful.every((t) => t.maxOffers <= OFFER_LIMIT),
    },
    "both roads to clothing stay alive (E29, E31)": {
      hideShareMean: round(mean(thoughtful.map((t) => t.hideShare))),
      fibreShareMean: round(mean(thoughtful.map((t) => t.fibreShare))),
      seeds: failedSeeds(thoughtful, (t) => t.hideShare < 0.05 || t.fibreShare < 0.05),
      pass: mean(thoughtful.map((t) => t.hideShare)) > 0.05 &&
        mean(thoughtful.map((t) => t.fibreShare)) > 0.05,
    },
    "the water carries part of the food, not all of it (E29)": {
      waterFoodShareMean: round(mean(thoughtful.map((t) => t.waterFoodShare))),
      seeds: failedSeeds(thoughtful, (t) => t.waterFoodShare < 0.05 || t.waterFoodShare > 0.95),
      pass:
        mean(thoughtful.map((t) => t.waterFoodShare)) > 0.05 &&
        mean(thoughtful.map((t) => t.waterFoodShare)) < 0.95,
    },
    "the settlement stays a village (E14)": {
      headsAtSedentismMean: round(mean(settled.map((t) => t.headsAtEnd))),
      headsAtSedentismMax: settled.reduce((max, t) => Math.max(max, t.headsAtEnd), 0),
      pass: settled.every((t) => t.headsAtEnd < 1000),
    },
  },
};

process.stdout.write(JSON.stringify(report, null, 2) + "\n");
