import { STAGE1 } from "../src/content/stage1.ts";
import { PassivePolicy, PoorPolicy, SensiblePolicy } from "./bots/index.ts";
import type { Policy } from "../src/policy/policy.ts";
import { apply, createState, derive, indexConfig, livesOn, tick, totalHeads } from "../src/sim/index.ts";
import type { Derived, GameState, ProcessDef } from "../src/sim/index.ts";

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
/** The two natural capacities food is won from, measured apart (see `Cell`). */
const AXES = ["wilderness", "water"] as const;

/**
 * How many moves count as having played the option out. Each one leaves the
 * community on country a twentieth poorer than the last, so by here the range
 * carries about two thirds of what the first one did.
 */
const MOVES_EXHAUSTED = 8;

/** Does a process live off this stretch of country — by paying it or by taking what grows on it? */
const drawsOn = (process: ProcessDef, capacity: string): boolean =>
  livesOn(process, capacity, index);

const mean = (xs: readonly number[]): number =>
  xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const share = (xs: readonly boolean[]): number => xs.filter(Boolean).length / (xs.length || 1);
const round = (value: number): number => Math.round(value * 1000) / 1000;
const seedOf = (i: number): number => 101 + i * 13;

// --------------------------------------------------------------- proportions

/**
 * What share of the community's work each need claims — **reckoned, not run**.
 *
 * No seed, no weather, no player: the flow a rank asks for per head times what
 * a unit of it costs in labour, its chain folded in, over what a head performs.
 * That makes this the cheapest criterion there is and the only one that cannot
 * pass emptily, because nothing has to happen for it to be measurable.
 *
 * What it guards is a proportion and not a balance. A rank is only ever
 * *partly* covered when the supply runs out inside its demand, and the chance
 * of that is roughly its share of the whole — so a rank at one per cent is the
 * binding one in one tick in a hundred and a switch in the other ninety-nine.
 * Measured before this was set, clothing claimed **four parts in a thousand**
 * of the work while its failure cost two fifths of the ability to work: a lever
 * that costs nothing and moves everything, and one that could never show a
 * gradient. That is what the band below is against.
 *
 * The figures are a band and not a point. What the anchors carry is the order
 * of magnitude — food acquisition about half of all work once processing, tools
 * and children are counted in; fuel one to two hours a day; hides and cordage
 * in the same range over a year of winters and summers — so the target may be
 * missed by a third either way. The reckoning is for **untouched country**;
 * played, the price of searching pushes food up by half again, which is where
 * the "about half" of the anchor lands.
 */
/**
 * Checked over *needs*, not over ranks. Hunger and satiety are one claim on the
 * work split over two ranks, and warmth likewise: how the claim divides between
 * the vital rank and the one above it is the buffer against a poor draw, which
 * belongs to the crisis and not here. What the anchors speak to is the whole —
 * about a third of the work into getting food, a good tenth into fuel.
 */
const CLAIM_ON_WORK: Readonly<Record<string, readonly [number, readonly string[]]>> = {
  food: [0.34, ["food_survival", "food_satiety"]],
  warmth: [0.13, ["warmth_fire", "warmth_comfort"]],
  care: [0.14, ["childcare"]],
  clothing: [0.08, ["clothing_cover"]],
};

/** How far a share may stray from what it is meant to be. */
const CLAIM_BAND = 1 / 3;

/**
 * A rank that carries births, productivity or the ability to work has to be big
 * enough to be a regulator rather than a switch. Fire is deliberately below it:
 * it is small and low in the ranking so that it is met almost whatever happens,
 * and being all or nothing is the point of it.
 */
const REGULATOR_FLOOR = 0.05;


/** Labour to make one unit of a good, its inputs chained in — the cheapest way. */
function labourPerUnit(stock: string, seen: ReadonlySet<string> = new Set()): number {
  if (stock === "labor") return 1;
  if (seen.has(stock)) return 0;
  const branch = STAGE1.branches.find((b) => b.produces === stock);
  if (branch === undefined) return 0;
  const runs = STAGE1.processes.filter((p) => p.branch === branch.id && p.unlockedFromStart);
  if (runs.length === 0) return 0;
  const next = new Set([...seen, stock]);
  return Math.min(
    ...runs.map((p) =>
      Object.entries(p.intermediatesPerOutput).reduce(
        (sum, [input, amount]) => sum + amount * labourPerUnit(input, next),
        0,
      ),
    ),
  );
}

function claimsOnWork(): Record<string, number> {
  const pop = STAGE1.population;
  const weighed = (w: Readonly<Record<string, number>>): number =>
    pop.cohorts.reduce((sum, c) => sum + (pop.shareAtStart[c.id] ?? 0) * (w[c.id] ?? 0), 0);
  const work = weighed(pop.labourWeight) * STAGE1.carried.baseProductivity;

  const out: Record<string, number> = {};
  for (const tier of STAGE1.needTiers) {
    // What is used up is asked for again every tick; what is only worn is asked
    // for at the rate it wears out.
    const decay = STAGE1.stocks.find((s) => s.id === tier.stock)?.decayPerTick ?? 0;
    const per = tier.consumedOnUse > 0 ? tier.perHead * tier.consumedOnUse : tier.perHead * decay;
    out[tier.id] = (per * weighed(tier.perHeadWeight) * labourPerUnit(tier.stock)) / work;
  }
  return out;
}

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

/**
 * The community sits *at* the carrying capacity of its range (E14), so a series that
 * starts there and doubles only ever sees the saturated case — the land is
 * already full at the first cell and every law about density read flat.
 * Intensification happens on the way *to* the limit, not far past it, so the
 * series runs from a thinly settled range up to a crowded one.
 */
const DENSITIES = [10, 25, 50, 100];

interface Cell {
  /** Food produced per head — Ricardo and Malthus: must fall as heads rise. */
  readonly foodPerHead: number;
  /**
   * Boserup, **per capacity** and in both halves.
   *
   * His claim is about one fixed resource being worked harder, so it has to be
   * measured on one: yield out of a unit of *this* capacity, and labour per
   * unit of what was won *on* it. Measured over all food together it says
   * nothing — it then follows the mix between wilderness and water, which is
   * substitution between two resources and not intensification of either.
   * Measured that way the criterion passed for years for the wrong reason: the
   * number rose because the community fished more, not because anyone worked
   * the ground harder.
   */
  readonly yieldPer: Readonly<Record<string, number>>;
  readonly laborPer: Readonly<Record<string, number>>;
  /** How many food processes actually carry something — the broad spectrum. */
  readonly foodProcesses: number;
}

/** How long an experiment runs, and over how much of its tail it is read. */
const SETTLE = 30;
const WINDOW = 10;

/**
 * One cell of the grid: a community held at a fixed size on a fixed range,
 * left to run.
 *
 * It has to **run**, not be looked at once. Since game and fish became stocks
 * that are taken and grow back (E29), the interesting behaviour is a course
 * over many ticks — first the big game thins, then the mix moves to what is
 * left. A single tick on a full stock cannot show any of it, and measured that
 * way every law about density read flat.
 *
 * The heads are put back after every tick, because the population would
 * otherwise drift and the density — the one thing being varied — would drift
 * with it.
 */
function at(stand: readonly string[], heads: number, seed: number): Cell {
  const start = createState(STAGE1, { seed, food: 0 });
  const pinned = (state: GameState): GameState => ({
    ...state,
    sectors: {
      ...state.sectors,
      households: {
        ...state.sectors["households"]!,
        cohorts: Object.fromEntries(
          STAGE1.population.cohorts.map((c) => [
            c.id,
            heads * (STAGE1.population.shareAtStart[c.id] ?? 0),
          ]),
        ),
      },
    },
  });
  let state: GameState = {
    ...pinned(start),
    completedProjects: Object.fromEntries(stand.map((id) => [id, 1])),
  };

  let food = 0;
  let ticks = 0;
  const output: Record<string, number> = {};
  const labor: Record<string, number> = {};
  /** How much of each stretch of country there is — fixed for the whole cell. */
  const extent: Record<string, number> = {};
  let processes = 0;

  for (let i = 0; i < SETTLE; i += 1) {
    const d = derive(state, index);
    for (const axis of AXES) extent[axis] = d.capacityTotal[axis] ?? 0;
    // Only the tail is read: the first ticks are the range settling down.
    if (i >= SETTLE - WINDOW) {
      ticks += 1;
      let here = 0;
      const carrying: number[] = [];
      for (const run of d.runs) {
        const process = index.process.get(run.process);
        if (process === undefined) continue;
        if (index.branch.get(process.branch)?.produces !== FOOD) continue;
        food += run.output;
        here += run.output;
        carrying.push(run.output);
        for (const axis of AXES) {
          if (!drawsOn(process, axis)) continue;
          output[axis] = (output[axis] ?? 0) + run.output;
          labor[axis] = (labor[axis] ?? 0) + run.labor;
        }
      }
      processes += carrying.filter((o) => o > here * 0.01).length;
    }
    state = pinned(tick(state, index));
  }

  // Yield against the stretch of country the community **has**, not against
  // what a process happened to occupy. That is what Boserup's claim is about:
  // the same fixed country worked harder. Divided by what was occupied, the
  // figure was just the reciprocal of a coefficient and could not move at all.
  const yieldPer: Record<string, number> = {};
  const laborPer: Record<string, number> = {};
  for (const axis of AXES) {
    const area = extent[axis] ?? 0;
    yieldPer[axis] = area > 0 && ticks > 0 ? (output[axis] ?? 0) / ticks / area : 0;
    laborPer[axis] = (output[axis] ?? 0) > 0 ? (labor[axis] ?? 0) / (output[axis] ?? 1) : 0;
  }
  return {
    foodPerHead: heads > 0 && ticks > 0 ? food / ticks / heads : 0,
    yieldPer,
    laborPer,
    foodProcesses: ticks > 0 ? processes / ticks : 0,
  };
}

/** Averaged over a few draws, so one bad year does not decide a law. */
function cell(stand: readonly string[], heads: number): Cell {
  const runs = Array.from({ length: 8 }, (_, i) => at(stand, heads, seedOf(i)));
  const perAxis = (pick: (c: Cell) => Readonly<Record<string, number>>) =>
    Object.fromEntries(AXES.map((axis) => [axis, mean(runs.map((r) => pick(r)[axis] ?? 0))]));
  return {
    foodPerHead: mean(runs.map((r) => r.foodPerHead)),
    yieldPer: perAxis((r) => r.yieldPer),
    laborPer: perAxis((r) => r.laborPer),
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

/**
 * Does the series **actually rise** at some stand?
 *
 * Not "at every stand", because at the bare one there is only a single
 * technique on the ground and nothing to intensify — flat is then the truth.
 * And not "does not fall", which was the earlier test: a flat series passed it,
 * so the criterion could not fail in the direction that matters. What has to be
 * true is that *somewhere* in the epoch's tree density calls intensification
 * forth. If nothing rises anywhere, the tree has no intensification in it.
 */
/**
 * Never narrows: the series may stand still, but it must not fall at any stand.
 * The right shape for a claim of the form "under pressure X does not shrink".
 */
function neverFalls(pick: (cell: Cell) => number): {
  pass: boolean;
  byStand: Record<string, number[]>;
  falling: string[];
} {
  const byStand: Record<string, number[]> = {};
  const falling: string[] = [];
  for (const [name, cells] of Object.entries(grid)) {
    const series = cells.map((c) => round(pick(c)));
    byStand[name] = series;
    const first = series[0] ?? 0;
    const last = series[series.length - 1] ?? 0;
    if (last < first - 1e-9) falling.push(name);
  }
  return { pass: falling.length === 0, byStand, falling };
}

function risesSomewhere(pick: (cell: Cell) => number): {
  pass: boolean;
  byStand: Record<string, number[]>;
  rising: string[];
} {
  const byStand: Record<string, number[]> = {};
  const rising: string[] = [];
  for (const [name, cells] of Object.entries(grid)) {
    const series = cells.map((c) => round(pick(c)));
    byStand[name] = series;
    const first = series[0] ?? 0;
    const last = series[series.length - 1] ?? 0;
    if (last > first + 1e-9) rising.push(name);
  }
  return { pass: rising.length > 0, byStand, rising };
}

// ------------------------------------------------------------------- tripwires

interface Trace {
  readonly seed: number;
  readonly sedentismAt: number | null;
  readonly abandoned: boolean;
  /** How often the community picked up and moved to a fresh country (E13). */
  readonly moves: number;
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
  /** Thinnest any renewable stock ever got, against what the range carries. */
  readonly thinnestStock: number;
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
  let thinnest = 1;
  let foodPerHeadFirst: number | null = null;
  let foodPerHeadLast = 0;
  const headsAtStart = totalHeads(state.sectors["households"]?.cohorts ?? {});

  for (let i = 0; i < CAP; i += 1) {
    if ((state.completedProjects["sedentism"] ?? 0) > 0) {
      sedentismAt = state.tick;
      break;
    }
    const d = derive(state, index);
    ticks += 1;
    if (d.communityGivenUp) {
      abandoned = true;
      break;
    }

    idle += d.laborUnused;
    available += d.laborPerformance;
    if (idleBreachAt === null && d.laborPerformance > 0 && d.laborUnused / d.laborPerformance > IDLE_LIMIT) {
      idleBreachAt = state.tick;
    }

    for (const renewal of Object.values(d.renewable)) {
      if (renewal.ceiling > 0) thinnest = Math.min(thinnest, renewal.held / renewal.ceiling);
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
      if (drawsOn(process, "water")) waterFood += run.output;
    }
    // Not from tick zero: the community starts with a store, so the first few
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
    moves: state.landTakings,
    length: ticks,
    headsAtEnd: totalHeads(state.sectors["households"]?.cohorts ?? {}),
    idleShare: available > 0 ? idle / available : 0,
    idleBreachAt,
    maxOffers,
    offerBreachAt,
    projectsDone: Object.values(state.completedProjects).reduce((a, b) => a + b, 0),
    lowestCoverage: lowest,
    hideShare: both > 0 ? hide / both : 0,
    fibreShare: both > 0 ? fibre / both : 0,
    waterFoodShare: allFood > 0 ? waterFood / allFood : 0,
    thinnestStock: thinnest,
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
  // Reckoned from the content alone — no seed, no player, no tick.
  proportions: {
    "every need claims the share of the work it is meant to (E9, E29)": (() => {
      const claims = claimsOnWork();
      const share = (tiers: readonly string[]) =>
        tiers.reduce((sum, id) => sum + (claims[id] ?? 0), 0);
      const off = Object.entries(CLAIM_ON_WORK)
        .filter(([, [want, tiers]]) => Math.abs(share(tiers) - want) > want * CLAIM_BAND)
        .map(([need, [want, tiers]]) => ({ need, want, is: round(share(tiers)) }));
      return {
        share: Object.fromEntries(Object.entries(claims).map(([id, v]) => [id, round(v)])),
        leftForProjects: round(1 - Object.values(claims).reduce((a, b) => a + b, 0)),
        band: CLAIM_BAND,
        off,
        pass: off.length === 0,
      };
    })(),
    "no rank that moves the people is a mere switch (E20)": (() => {
      const claims = claimsOnWork();
      const tooSmall = STAGE1.needTiers
        .filter(
          (t) =>
            t.id !== "warmth_fire" &&
            (t.birthRate !== undefined ||
              t.productivity !== undefined ||
              t.workAbility !== undefined) &&
            (claims[t.id] ?? 0) < REGULATOR_FLOOR,
        )
        .map((t) => ({ tier: t.id, is: round(claims[t.id] ?? 0) }));
      return { floor: REGULATOR_FLOOR, tooSmall, pass: tooSmall.length === 0 };
    })(),
  },
  experiments: {
    // "Without decisions nobody settles" used to stand here and was worthless:
    // the passive bot digs no pits, sedentism wants pits, done. It tested the
    // configuration, not the economy, and could not fail. What the claim is
    // really about is that **time alone gives nothing** — and that is a
    // statement about the land, which can fail and does.
    "the community starts at the carrying capacity of its range (E14)": {
      startHeads: round(mean(passive.map((t) => t.headsAtStart))),
      plateauHeads: round(mean(passive.map((t) => t.headsAtEnd))),
      factor: round(
        mean(passive.map((t) => t.headsAtEnd)) /
          Math.max(1, mean(passive.map((t) => t.headsAtStart))),
      ),
      // A corridor, not a ceiling. Only an upper bound let a community that
      // shrank to two fifths of its starting size count as "at the carrying
      // capacity of its range" — which is the opposite of what E14 claims. It
      // has to end up near where it began: comfortably above the point where
      // it is given up, and not several times larger.
      pass:
        mean(passive.map((t) => t.headsAtEnd)) >=
          mean(passive.map((t) => t.headsAtStart)) * 0.8 &&
        mean(passive.map((t) => t.headsAtEnd)) <=
          mean(passive.map((t) => t.headsAtStart)) * 1.5,
    },
    "waiting does not raise the standard of living": {
      foodPerHeadFirst: round(mean(passive.map((t) => t.foodPerHeadFirst))),
      foodPerHeadLast: round(mean(passive.map((t) => t.foodPerHeadLast))),
      pass:
        mean(passive.map((t) => t.foodPerHeadLast)) <=
        mean(passive.map((t) => t.foodPerHeadFirst)),
    },
    // One entry per capacity, because the claim is about one fixed resource
    // being worked harder — and both halves, because only together do they say
    // "labour is being traded for land". The first alone is ordinary progress.
    ...Object.fromEntries(
      AXES.flatMap((axis) => [
        [
          `Boserup — a unit of ${axis} yields more as density rises`,
          risesSomewhere((c) => c.yieldPer[axis] ?? 0),
        ],
        [
          `Boserup — and what is won on the ${axis} costs more hands`,
          risesSomewhere((c) => c.laborPer[axis] ?? 0),
        ],
      ]),
    ),
    "broad spectrum — the diet widens under pressure (Flannery, Binford)": {
      ...neverFalls((c) => c.foodProcesses),
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
    // Doing nothing must not kill. People lived this way for an enormous span
    // without ever settling, so a model in which sitting still ends the
    // community says the whole way of life was untenable — which is plainly
    // false. And a player who does nothing and dies learns only that the game
    // is unfair; a player who does nothing and **stands still** sees at once
    // what acting is for.
    "doing nothing does not kill before the country is used up (T4)": {
      abandonedShare: round(share(passive.map((t) => t.abandoned))),
      movesBeforeEndMean: round(mean(passive.map((t) => t.moves))),
      // Walking away from a picked-over range is what foragers did, so it
      // belongs to the baseline and not to acting. What it buys is time, not
      // escape: every country is a little poorer than the last (E13), so the
      // cycle runs slowly downhill. Idleness may therefore end in the
      // community being given up — but never before moving has been played out.
      limit: MOVES_EXHAUSTED,
      seeds: failedSeeds(passive, (t) => t.abandoned && t.moves < MOVES_EXHAUSTED),
      pass: passive.every((t) => !t.abandoned || t.moves >= MOVES_EXHAUSTED),
    },
    // What idleness costs is therefore not lives but progress: it never gets
    // out of the epoch. Failing remains the price of acting *badly* — of
    // building when the community can least afford it — and that is what the
    // poor player is for.
    "doing nothing gets nowhere (T4)": {
      thoughtfulReached: round(share(thoughtful.map((t) => t.sedentismAt !== null))),
      passiveReached: round(share(passive.map((t) => t.sedentismAt !== null))),
      pass:
        share(passive.map((t) => t.sedentismAt !== null)) <
        share(thoughtful.map((t) => t.sedentismAt !== null)),
    },
    // And it has to be worth something while it lasts, or the projects are
    // ornament: the thoughtful community lives at a higher level than the idle
    // one, measured where both are still alive.
    "acting raises the level (T4)": {
      thoughtfulHeads: round(mean(survived(thoughtful).map((t) => t.headsAtEnd))),
      passiveHeads: round(mean(survived(passive).map((t) => t.headsAtEnd))),
      pass:
        mean(survived(thoughtful).map((t) => t.headsAtEnd)) >
        mean(survived(passive).map((t) => t.headsAtEnd)) * 1.1,
    },
    // Not the population at the end: an epoch that ends at a milestone lasts
    // longer for the worse player, so his community has more ticks to grow in
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
    // A resource that dies is gross nonsense, and nothing else was noticing it:
    // a run could fish its water out entirely and pass every other tripwire.
    "no renewable stock is run into the ground (E29)": {
      thinnestMean: round(mean(thoughtful.map((t) => t.thinnestStock))),
      thinnestSeen: round(thoughtful.reduce((low, t) => Math.min(low, t.thinnestStock), 1)),
      limit: 0.2,
      seeds: failedSeeds(thoughtful, (t) => t.thinnestStock < 0.2),
      pass: thoughtful.every((t) => t.thinnestStock >= 0.2),
    },
    // It is still a small community when it settles, not a town that grew into
    // it. Nothing "stays a village" here — there is no village yet, and that is
    // the point: the epoch has to end while these are still people who could
    // have walked away.
    "it is still small when it settles (E14)": {
      headsAtSedentismMean: round(mean(settled.map((t) => t.headsAtEnd))),
      headsAtSedentismMax: settled.reduce((max, t) => Math.max(max, t.headsAtEnd), 0),
      measurable: settled.length > 0,
      pass: settled.length > 0 && settled.every((t) => t.headsAtEnd < 1000),
    },
  },
};

process.stdout.write(JSON.stringify(report, null, 2) + "\n");
