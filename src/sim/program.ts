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
 * **The store stays out of it** (E19). What is planned for is what will be
 * *made*; the store is what catches the tick when the making falls short. The
 * other way round was measured: every tick began by eating the pits and ended
 * by refilling them, so they held one tick's saving however large they were.
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
 * change *what* is taken — the shore gets harvested where the exact answer
 * never touches it. Eight are within about one per cent and take the same
 * things in the same proportions. Twelve and twenty buy another half per cent
 * for a bigger program. The error is always in the same direction: the steps
 * make searching look slightly dearer than it is, never cheaper.
 */
const STEPS = 8;

/** Never quite the last of it: the final unit is unfindable, hence the cap. */
const REACH = 0.999;

/** The one stock the engine still names, as the allocation does. */
const LABOUR: StockId = "labor";

export interface ProgramInput {
  readonly demands: readonly Demand[];
  readonly available: readonly ProcessDef[];
  readonly index: ConfigIndex;
  readonly supplies: Supplies;
  /** Where every renewable stock stands before anything is taken. */
  readonly standing: Readonly<Record<StockId, Renewal>>;
  /** The year the plan reckons with — blind to the real draw (E24). */
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
  const mean = (renewal.ceiling / width) * Math.log((held - from) / Math.max(1e-9, held - to));
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
    const rule = quarry === undefined ? undefined : input.index.stock.get(quarry)?.regrowth;

    if (quarry === undefined || renewal === undefined || rule === undefined || renewal.held <= 1e-9) {
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
      columns.push(column(process, branch.produces, input, shock, effort, ceiling, quarry, step));
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
    inputs.set(`capacity:${id}`, factor > 0 ? (base * effort) / factor / shock : Infinity);
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
      inputs: new Map([[`stock:${claim.stock}`, 1]]),
      ceiling: claim.amount,
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
      depths.set(key, { coefficients: row, limit: col.ceiling * (col.inputs.get(`stock:${col.quarry}`) ?? 1) });
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
    // Net: what is drawn on beyond what this same plan makes. The store is not
    // offered here — the tick lives on what it makes (E19). A stand that grows
    // back is different: it is there to be taken from, all but the last of it.
    const natural = input.index.stock.get(id)?.regrowth !== undefined;
    limits.push({
      id: `stock:${id}`,
      coefficients: row,
      limit: natural ? (input.standing[id]?.held ?? 0) * REACH : 0,
    });
  }

  const objectives: Objective[] = claims.map((claim, r) => {
    const row = zero();
    row[made + r] = 1;
    return { id: claim.tier.id, coefficients: row };
  });

  const answer = solve({ activities: n, limits, objectives });

  const levels = new Map<ProcessId, number>();
  const output: Record<StockId, number> = {};
  for (let j = 0; j < made; j += 1) {
    const level = answer.levels[j] ?? 0;
    if (level <= 1e-12) continue;
    const col = columns[j]!;
    if (col.process === undefined || col.produces === undefined) continue;
    levels.set(col.process.id, (levels.get(col.process.id) ?? 0) + level);
    output[col.produces] = (output[col.produces] ?? 0) + level;
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
      const input = id.startsWith("depth:") ? `stock:${id.slice(6).split("#")[0] ?? ""}` : id;
      if (input.startsWith("capacity:") || input.startsWith("stock:")) {
        shortfall.set(input, (shortfall.get(input) ?? 0) + missing);
      }
    }
  }

  return { levels, output, droppedTiers, shortfall };
}
