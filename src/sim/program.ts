/**
 * The tick's allocation written as one ranked program, and handed to the solver
 * (E9, E21).
 *
 * It answers the same question as `makePlan` and hands back the same `Plan`, so
 * the two can be run on one and the same tick and held against each other. What
 * differs is how the answer is found: not by starting on a declared order and
 * moving demand off whatever runs out, but by asking directly for the most that
 * can be covered — rank by rank, in the order the ranks stand in.
 *
 * **Rising search costs are in the model rather than around it.** Every stock
 * that grows back is cut into steps: the first slice of a full range is nearly
 * free, the last of a thinned one is dear. A process that draws on such a stock
 * therefore appears once per step, with the same quarry per unit and more hands
 * to find it. The solver takes the cheap steps of every range before it goes
 * deeper into any one of them — which is the equal-marginal-cost split, without
 * a rule of its own and without the guessing pass the old planner needed to
 * find out how much this tick meant to take.
 *
 * **A store is on offer, and what it is to hold is asked as a stand** (E19).
 * Both halves are needed and neither works alone. A store exists to be lived
 * off in a poor draw, so the plan may draw on it; but a plan that only draws
 * would begin every tick by eating the pits and end it by refilling them, and
 * they would hold one tick's saving however large they were. What keeps that
 * from happening is the second half: the target is not a consumer of the good
 * but a claim on the **closing** balance — make at least as much as this tick
 * spends, plus what is still missing. In a hard tick that claim loses to the
 * ranks above it, and then the store is eaten, which is what it is for.
 */
import type { ConfigIndex, ProcessDef } from "./config.ts";
import type { CapacityId, ProcessId, StockId } from "./ids.ts";
import type { Renewal } from "./phases.ts";
import type { Demand, Plan, Supplies } from "./plan.ts";
import { solve, type Limit, type Objective } from "./simplex.ts";

/**
 * How many steps a stand is cut into.
 *
 * Measured against the exact equal-marginal-cost split on the starting range,
 * at three levels of demand: three steps are off by up to 33 % and, worse,
 * change *what* is taken — the shore gets picked over where the exact answer
 * never touches it. Eight are within about one per cent and take the same
 * things in the same proportions. Twelve and twenty buy another half per cent
 * for a bigger program. The error is always in the same direction: the steps
 * make searching look slightly dearer than it is, never cheaper.
 */
const STEPS = 8;

/**
 * How much of what stands may go in a single tick.
 *
 * It is **not** a claim that a tenth always survives. What it says is that a
 * community cannot comb its whole range between one tick and the next: the
 * range is large, what ripens does not ripen at once, and what lies far from
 * where people are does not get carried home. Taking nine tenths again from
 * what is left, tick after tick, still runs a slow-growing stand into the
 * ground — what keeps a range from being emptied for good is the floor in the
 * regrowth, and that is set per stock and decided there.
 *
 * It has to be a limit and cannot be a cost, because the ranks are an order and
 * not a bargain: a rank covers itself as far as it can and never asks the
 * price. Measured — raising the ceiling on what one unit may cost to find from
 * 30 to 300 changed the outcome in not one of eight runs, and cutting the stand
 * into 32 or 128 steps instead of 8 changed it just as little. In the world
 * this stands in for, what spares the last of a thinning stock is a *decision*:
 * the return falls off, and the community turns to something else long before
 * the last one is found. The ordering cannot make that decision, so the limit
 * makes it instead.
 *
 * Played, eight seeds: at 0.999 the worst single tick took 51 % of the people
 * and the thinnest a stand ever stood was 0.10 of what it carries. At 0.90 it
 * is 33 % and 0.18 to 0.29, and the epoch is barely longer — sedentism at tick
 * 89 against 81. At 0.80 the fall is milder again, 11 %, but the epoch takes
 * twice as long, which is the worse bargain.
 */
const REACH = 0.9;

/** The one stock the engine still names, as the allocation does. */
const LABOUR: StockId = "labor";

export interface ProgramInput {
  readonly demands: readonly Demand[];
  readonly available: readonly ProcessDef[];
  readonly index: ConfigIndex;
  readonly supplies: Supplies;
  /** Where every renewable stock stands before anything is taken. */
  readonly standing: Readonly<Record<StockId, Renewal>>;
  /** The draw the plan reckons with — blind to the real draw (E24). */
  readonly shockFor: (process: ProcessDef) => number;
}

/**
 * One column of the program: either a process — run plainly, or out of one step
 * of the stand it works — or the serving of one claim.
 *
 * A claim needs a column of its own and may not simply be read off the making
 * of its good. Two ranks want the same good: hunger asks for thirty-two and
 * satiety for fifteen more. Read off the making, each would be a separate
 * ceiling on the *same* quantity, and the smaller would win — measured, food
 * came out at 0.35 covered while fourteen hands lay idle.
 */
interface Column {
  readonly process?: ProcessDef;
  /** Which stand this column digs into, and how deep — shared across processes. */
  readonly quarry?: StockId;
  readonly step?: number;
  /** What one unit costs of each input, this step's search included. */
  readonly inputs: ReadonlyMap<string, number>;
  /** What a process column makes; a claim column makes nothing. */
  readonly produces?: StockId;
  /** How much this column can carry at all; Infinity where nothing caps it. */
  readonly ceiling: number;
  /** What searching cost on this column — kept so the doing charges the same. */
  readonly effort: number;
}

/** The natural stock a process draws on, if any — there is never more than one. */
function quarryOf(process: ProcessDef, index: ConfigIndex): StockId | undefined {
  for (const id of Object.keys(process.intermediatesPerOutput)) {
    if (index.stock.get(id)?.regrowth !== undefined) return id;
  }
  return undefined;
}

/**
 * What searching costs on average between two depths of a stand.
 *
 * The cost of the next unit at depth `t` is `ceiling / (held − t)`; over a slice
 * it is the mean of that, which integrates to a logarithm. At the very top of a
 * full stand it is one, and it climbs without bound as the stand empties — hence
 * the cap, which is what keeps a spent range from being infinitely dear and so
 * leaves a way back (E20).
 */
function searchCost(renewal: Renewal, from: number, to: number, cap: number): number {
  const held = Math.max(1e-9, renewal.held);
  const width = to - from;
  if (width <= 1e-12) return Math.min(cap, renewal.ceiling / held);
  const mean =
    (renewal.ceiling / width) * Math.log((held - from) / Math.max(1e-9, held - to));
  return Math.min(cap, Math.max(1, mean));
}

/** Every column: each process once, or once per step of the stand it works. */
function columnsOf(input: ProgramInput): Column[] {
  const columns: Column[] = [];
  for (const process of input.available) {
    const shock = input.shockFor(process);
    if (shock <= 0) continue;
    const branch = input.index.config.branches.find((b) => b.id === process.branch);
    if (branch === undefined) continue;
    const quarry = quarryOf(process, input.index);
    const renewal = quarry === undefined ? undefined : input.standing[quarry];
    const rule =
      quarry === undefined ? undefined : input.index.stock.get(quarry)?.regrowth;

    if (
      quarry === undefined ||
      renewal === undefined ||
      rule === undefined ||
      renewal.held <= 1e-9
    ) {
      columns.push(column(process, branch.produces, input, shock, 1, Infinity, quarry));
      continue;
    }
    const reachable = renewal.held * REACH;
    const perOutput = process.intermediatesPerOutput[quarry] ?? 0;
    for (let step = 0; step < STEPS; step += 1) {
      const from = (reachable * step) / STEPS;
      const to = (reachable * (step + 1)) / STEPS;
      const effort = searchCost(renewal, from, to, rule.maxEffort);
      // How much *output* this slice of the stand can carry.
      const ceiling = perOutput > 0 ? (to - from) / perOutput : Infinity;
      columns.push(
        column(process, branch.produces, input, shock, effort, ceiling, quarry, step),
      );
    }
  }
  // **Among equally good answers, prefer the one that spends fewer hands.**
  // Where labour is not short, a technique that saves it is worth exactly as
  // much as the one it supersedes, and the solver is then indifferent — it took
  // whichever column it met first, so bare hands kept gathering beside the
  // sickle. Bland's rule takes the lowest column, so putting the thrifty ones
  // first settles the tie the sensible way and costs nothing (E5).
  const labourOf = (c: Column): number => c.inputs.get(`stock:${LABOUR}`) ?? 0;
  return columns
    .map((c, i) => ({ c, i }))
    .sort((a, b) => labourOf(a.c) - labourOf(b.c) || a.i - b.i)
    .map((x) => x.c);
}

function column(
  process: ProcessDef,
  produces: StockId,
  input: ProgramInput,
  shock: number,
  effort: number,
  ceiling: number,
  quarry: StockId | undefined,
  step?: number,
): Column {
  const inputs = new Map<string, number>();
  for (const [id, base] of Object.entries(process.capacityPerOutput)) {
    if (base <= 0) continue;
    const quality = input.supplies.capacityHeld[id]?.quality ?? 1;
    const factor = 1 - process.qualityWeight + process.qualityWeight * quality;
    inputs.set(
      `capacity:${id}`,
      factor > 0 ? (base * effort) / factor / shock : Infinity,
    );
  }
  for (const [id, base] of Object.entries(process.intermediatesPerOutput)) {
    if (base <= 0) continue;
    // The scarcity falls on the effort, not on the quarry: one animal is still
    // one animal, it just takes longer to find.
    const scale = id === quarry ? 1 : effort;
    inputs.set(`stock:${id}`, (base * scale) / shock);
  }
  return {
    process,
    inputs,
    produces,
    ceiling,
    effort,
    ...(quarry === undefined ? {} : { quarry }),
    ...(step === undefined ? {} : { step }),
  };
}

export function planByProgram(input: ProgramInput): Plan {
  const columns = columnsOf(input);
  const made = columns.length;

  // Demands are served in the order the ranks stand in; several of them may
  // want the same good, and each gets a column of its own.
  const claims = [...input.demands]
    .filter((d) => d.amount > 1e-9)
    .sort((a, b) => a.tier.rank - b.tier.rank);
  for (const claim of claims) {
    columns.push({
      // A claim on a good that is used up takes it; a claim on one that is only
      // *held* takes nothing, and is tied to the closing balance further down.
      inputs:
        claim.tier.consumedOnUse > 1e-9
          ? new Map([[`stock:${claim.stock}`, 1]])
          : new Map(),
      ceiling: claim.amount,
      // A claim searches for nothing; it only asks.
      effort: 1,
    });
  }
  const n = columns.length;

  const limits: Limit[] = [];
  const zero = (): number[] => new Array<number>(n).fill(0);

  const capacities = new Map<CapacityId, number[]>();
  const stocks = new Map<StockId, number[]>();
  const depths = new Map<string, { coefficients: number[]; limit: number }>();
  for (let j = 0; j < n; j += 1) {
    const col = columns[j]!;
    for (const [id, per] of col.inputs) {
      if (id.startsWith("capacity:")) {
        const key = id.slice("capacity:".length);
        const row = capacities.get(key) ?? zero();
        row[j] = (row[j] ?? 0) + per;
        capacities.set(key, row);
      } else {
        const key = id.slice("stock:".length);
        const row = stocks.get(key) ?? zero();
        row[j] = (row[j] ?? 0) + per;
        stocks.set(key, row);
      }
    }
    if (col.produces !== undefined) {
      const row = stocks.get(col.produces) ?? zero();
      row[j] = (row[j] ?? 0) - 1;
      stocks.set(col.produces, row);
    }
    if (col.quarry === undefined || col.step === undefined) {
      // A column with no stand behind it — the serving of a claim — is capped
      // on its own: nobody asks for more than was claimed.
      if (Number.isFinite(col.ceiling)) {
        const row = zero();
        row[j] = 1;
        limits.push({ id: `carry:${j}`, coefficients: row, limit: col.ceiling });
      }
    } else {
      // **One limit per step of a stand, shared by every process that digs
      // there.** A step is a depth, not a private allowance: sickle and bare
      // hands reach into the same first slice of the same plants. Given a copy
      // each, a process could take the cheap top of a stand another had already
      // worked through — measured, the bare hand kept running beside the sickle
      // that supersedes it entirely (E5).
      const key = `${col.quarry}#${col.step}`;
      const row = depths.get(key)?.coefficients ?? zero();
      row[j] = (row[j] ?? 0) + (col.inputs.get(`stock:${col.quarry}`) ?? 0);
      depths.set(key, {
        coefficients: row,
        limit: col.ceiling * (col.inputs.get(`stock:${col.quarry}`) ?? 1),
      });
    }
  }

  for (const [key, row] of depths) {
    limits.push({ id: `depth:${key}`, coefficients: row.coefficients, limit: row.limit });
  }
  for (const [id, row] of capacities) {
    limits.push({
      id: `capacity:${id}`,
      coefficients: row,
      limit: input.supplies.capacityHeld[id]?.amount ?? 0,
    });
  }
  for (const [id, row] of stocks) {
    // **What is held is on offer.** A store exists to be lived off in a poor
    // draw, and whether the good is an intermediate or something a need is
    // served from makes no difference to that. So the limit is what lies
    // there: net drawing may go up to the opening balance, which is the same
    // as saying no stock may close below nothing. A stand that grows back is
    // different again — it is there to be taken from, all but the last of it.
    //
    // Held back from the plan, a store cannot be reached at all where the good
    // is spent by a *process* rather than handed to a need: nothing later in
    // the tick can put it to use, because what was never planned is never run.
    // Measured at seed 42, tick 57: 4.90 of wood lay there, searching for
    // deadwood cost 1.26 — no scarcity anywhere — and the fire still came out
    // at nought, which cost three in five of the people.
    const natural = input.index.stock.get(id)?.regrowth !== undefined;
    limits.push({
      id: `stock:${id}`,
      coefficients: row,
      limit: natural
        ? (input.standing[id]?.held ?? 0) * REACH
        : (input.supplies.stocks[id] ?? 0),
    });
  }

  // **And what the plan must leave standing is asked as a stand, not as a
  // taking.** A claim on a good that is not used up — clothing, which is worn,
  // or a store target, which is the player saying how much he means to keep —
  // is not a consumer of that good. It asks that so much be *there* when the
  // tick is done:
  //
  //     claim ≤ opening balance + what is made − what is spent
  //
  // and no further than the level asked for, which its own ceiling says. Both
  // right-hand sides are non-negative, so doing nothing stays lawful and the
  // solver needs nothing added to it.
  //
  // **Reckoned on the closing balance and not on yesterday's gap**, which is
  // what makes it bite in the tick that matters. Measured against the opening
  // balance the claim vanishes in any tick that begins full — and when that
  // same tick then empties the store, nothing is left to pull it back. Seed 42
  // with a target of twelve: the store stood at 12.08 when tick 51 began, so no
  // claim was raised at all; the tick spent it down to 0.56 while a quarter of
  // the labour was never called on and deadwood was the cheapest thing in the
  // range at 1.44. The same again at tick 54. On the closing balance the claim
  // stands in every tick, so the hands that are free go into putting the store
  // back — and its rank still decides everything else: where comfort ranks
  // above it, comfort may eat the store first.
  claims.forEach((claim, r) => {
    if (claim.tier.consumedOnUse > 1e-9) return;
    const row = Array.from(stocks.get(claim.stock) ?? zero());
    row[made + r] = (row[made + r] ?? 0) + 1;
    limits.push({
      id: `balance:${claim.tier.id}`,
      coefficients: row,
      limit: input.supplies.stocks[claim.stock] ?? 0,
    });
  });

  const objectives: Objective[] = claims.map((claim, r) => {
    const row = zero();
    row[made + r] = 1;
    return { id: claim.tier.id, coefficients: row };
  });

  const answer = solve({ activities: n, limits, objectives });

  const levels = new Map<ProcessId, number>();
  const output: Record<StockId, number> = {};
  // What each process was charged for searching, weighted by how much ran on
  // each step of the stand. This is the figure the doing must charge too.
  const weighted = new Map<ProcessId, number>();
  for (let j = 0; j < made; j += 1) {
    const level = answer.levels[j] ?? 0;
    if (level <= 1e-12) continue;
    const col = columns[j]!;
    if (col.process === undefined || col.produces === undefined) continue;
    levels.set(col.process.id, (levels.get(col.process.id) ?? 0) + level);
    weighted.set(
      col.process.id,
      (weighted.get(col.process.id) ?? 0) + level * col.effort,
    );
    output[col.produces] = (output[col.produces] ?? 0) + level;
  }
  const effortPerProcess = new Map<ProcessId, number>();
  for (const [id, level] of levels) {
    if (level > 1e-12) effortPerProcess.set(id, (weighted.get(id) ?? 0) / level);
  }

  const droppedTiers: string[] = [];
  let missing = 0;
  claims.forEach((claim, r) => {
    const got = answer.values[r] ?? 0;
    if (got < claim.amount - 1e-9) {
      droppedTiers.push(claim.tier.id);
      missing += claim.amount - got;
    }
  });
  // What stopped it is asked of the program, not of the claim: whichever limits
  // are pressed right up against are the ones holding the answer back, and the
  // solver has them already. A step of a stand answers as the stand itself —
  // the depth is a working detail, the country is what the reader wants named.
  const shortfall = new Map<string, number>();
  if (missing > 1e-9) {
    for (const id of answer.binding) {
      const input = inputOf(id);
      if (input !== undefined)
        shortfall.set(input, (shortfall.get(input) ?? 0) + missing);
    }
  }

  return {
    levels,
    output,
    droppedTiers,
    shortfall,
    shortfallByTier: shortfallPerClaim(
      claims,
      answer,
      chainNeeds(columns, answer.levels),
    ),
    effortPerProcess,
  };
}

/**
 * The input a limit stands for, or nothing where it stands for no input at all.
 *
 * A step of a stand answers as the stand itself: the depth is a working detail
 * of how the rising search cost is written down, and the country is what a
 * reader wants named. A claim's own ceiling and the closing balance behind a
 * held good are not inputs and are left out — they say the claim asked for no
 * more, not that anything ran out.
 */
function inputOf(id: string): string | undefined {
  const input = id.startsWith("depth:")
    ? `stock:${id.slice("depth:".length).split("#")[0] ?? ""}`
    : id;
  return input.startsWith("capacity:") || input.startsWith("stock:") ? input : undefined;
}

/**
 * What one unit of a good takes of the country and the hands, chain and all.
 *
 * The mix, not one process: a good is usually made on several at once — food
 * out of the plants, the shore and the chase together — and a further unit of
 * it would have been made the way this tick made the rest. So each way counts
 * for the share of the good it carried. Where nothing at all ran, the first
 * column stands in; the columns are sorted thriftiest of hands first, so that
 * is the way the plan would have chosen.
 *
 * A good the community makes for itself is never an answer: what it really
 * takes is what *its* making takes, one step further up. Labour resolves to the
 * people, wood to the fallen wood and the hands that gather it. What is left at
 * the bottom is capacities and the stands nobody makes, which is what a reader
 * can act on.
 */
function chainNeeds(
  columns: readonly Column[],
  levels: readonly number[],
): (good: StockId) => ReadonlyMap<string, number> {
  const mix = new Map<StockId, { column: Column; weight: number }[]>();
  const total = new Map<StockId, number>();
  columns.forEach((column, j) => {
    const good = column.produces;
    if (good === undefined) return;
    const weight = levels[j] ?? 0;
    mix.set(good, [...(mix.get(good) ?? []), { column, weight }]);
    total.set(good, (total.get(good) ?? 0) + weight);
  });

  const cache = new Map<StockId, ReadonlyMap<string, number>>();
  const walk = (good: StockId, seen: Set<StockId>): ReadonlyMap<string, number> => {
    const ready = cache.get(good);
    if (ready !== undefined) return ready;
    const ways = mix.get(good);
    // A cycle cannot arise from the content we have; if one ever did, the chain
    // stops here rather than running away.
    if (ways === undefined || ways.length === 0 || seen.has(good)) return new Map();
    seen.add(good);

    const made = total.get(good) ?? 0;
    const out = new Map<string, number>();
    for (const way of ways) {
      const share = made > 1e-12 ? way.weight / made : way === ways[0] ? 1 : 0;
      if (share <= 0) continue;
      for (const [input, per] of way.column.inputs) {
        if (per <= 0) continue;
        const upstream = input.startsWith("stock:")
          ? walk(input.slice("stock:".length), seen)
          : undefined;
        if (upstream === undefined || upstream.size === 0) {
          out.set(input, (out.get(input) ?? 0) + share * per);
          continue;
        }
        for (const [id, deep] of upstream) {
          out.set(id, (out.get(id) ?? 0) + share * per * deep);
        }
      }
    }

    seen.delete(good);
    cache.set(good, out);
    return out;
  };
  return (good) => walk(good, new Set());
}

/**
 * What each rank alone came up short of.
 *
 * Two things together, and neither answers on its own. **What the rank's own
 * chain is made of**, so that a rank never names a source it does not touch —
 * the hut over the children hangs on hands and nothing else, and it said "the
 * fish were short" because some other rank had picked the shore over. And **what
 * the program pressed right up against**, because an input the tick still had to
 * spare stopped nobody. What is left is the exhausted inputs of this rank's own
 * chain, and where two ranks starved on the same emptied stand both name it,
 * which is the truth.
 *
 * How much is missing is the rank's own unserved demand carried up its chain:
 * so much of the good never made, so much of that input never to be had. In
 * each input's own units, so the amounts say which shortage was the large one
 * and are not a price.
 */
function shortfallPerClaim(
  claims: readonly Demand[],
  answer: { readonly values: readonly number[]; readonly binding: readonly string[] },
  needs: (good: StockId) => ReadonlyMap<string, number>,
): ReadonlyMap<string, ReadonlyMap<string, number>> {
  const exhausted = new Set<string>();
  for (const id of answer.binding) {
    const input = inputOf(id);
    if (input !== undefined) exhausted.add(input);
  }

  const out = new Map<string, ReadonlyMap<string, number>>();
  claims.forEach((claim, r) => {
    const gap = claim.amount - (answer.values[r] ?? 0);
    if (gap <= 1e-9) return;
    const own = new Map<string, number>();
    for (const [input, per] of needs(claim.stock)) {
      if (per <= 0 || !exhausted.has(input)) continue;
      own.set(input, gap * per);
    }
    if (own.size > 0) out.set(claim.tier.id, own);
  });
  return out;
}
