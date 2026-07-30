import type { ConfigIndex, NeedTierDef, ProcessDef } from "./config.ts";
import type { AreaTypeId, ProcessId, StockId } from "./ids.ts";

/**
 * The production plan (E21).
 *
 * A plan is a vector of **activity levels** — how much runs on each process.
 * Labour and capacities are constraints, not results; a level of zero means the
 * process does not run. That is the activity analysis E5 already rests on.
 *
 * Planning happens for **all ranks together**, and only then is rationed by
 * rank. Rank by rank cannot work: covering rank 100 would choose its process
 * without knowing that rank 150 needs the same land — which is measurably what
 * went wrong (E21). The ranking still decides *who is served first when it does
 * not suffice*; it must not decide *how things are produced*.
 *
 * This is not central planning. There is one household sector; a household
 * planning its own year plans for nobody else. Planning for many independent
 * units is what fails, and that is where prices come in.
 */

/** What a plan may draw on. Each entry is an absolute amount. */
export interface Supplies {
  readonly labor: number;
  readonly areas: Readonly<Record<AreaTypeId, { area: number; quality: number }>>;
  readonly stocks: Readonly<Record<StockId, number>>;
}

/** How much output a tier still wants, after what the store already covers. */
export interface Demand {
  readonly tier: NeedTierDef;
  readonly stock: StockId;
  readonly amount: number;
}

export interface Plan {
  /** Output per process — the plan proper. */
  readonly levels: ReadonlyMap<ProcessId, number>;
  /** Output per stock, summed over the processes that make it. */
  readonly output: Readonly<Record<StockId, number>>;
  /** Which tiers had to be dropped because nothing would fit. */
  readonly droppedTiers: readonly string[];
  /** Which input stopped the lowest tier that stayed uncovered. */
  readonly shortfall: ReadonlyMap<string, number>;
}

/** An input, named so that labour, area and stock can be handled alike. */
type InputId = string;

export const LABOR: InputId = "labor";
export const areaInput = (id: AreaTypeId): InputId => `area:${id}`;
export const stockInput = (id: StockId): InputId => `stock:${id}`;

export interface PlanContext {
  readonly index: ConfigIndex;
  readonly supplies: Supplies;
  /** Processes that may run, already filtered by what is unlocked. */
  readonly available: readonly ProcessDef[];
  /** Output per unit of labour for a process, chain included (E4). */
  yieldPerLabor(process: ProcessDef): number;
  /** Ordering within one stock, best first — see E5. */
  order(stock: StockId, processes: readonly ProcessDef[]): readonly ProcessDef[];
}

/** How much of one input a process needs for one unit of its output. */
function inputPerOutput(
  process: ProcessDef,
  input: InputId,
  ctx: PlanContext,
): number {
  if (input === LABOR) {
    const perLabor = ctx.yieldPerLabor(process);
    return perLabor > 0 ? 1 / perLabor : Infinity;
  }
  if (input.startsWith("area:")) {
    const type = input.slice(5);
    const base = process.areaPerOutput[type] ?? 0;
    if (base <= 0) return 0;
    const quality = ctx.supplies.areas[type]?.quality ?? 1;
    const factor = 1 - process.qualityWeight + process.qualityWeight * quality;
    return factor > 0 ? base / factor : Infinity;
  }
  if (input.startsWith("stock:")) return process.intermediatesPerOutput[input.slice(6)] ?? 0;
  return 0;
}

function available(input: InputId, ctx: PlanContext): number {
  if (input === LABOR) return ctx.supplies.labor;
  if (input.startsWith("area:")) return ctx.supplies.areas[input.slice(5)]?.area ?? 0;
  if (input.startsWith("stock:")) return ctx.supplies.stocks[input.slice(6)] ?? 0;
  return 0;
}

/** Every input any available process touches, in a fixed order. */
function inputsOf(ctx: PlanContext): readonly InputId[] {
  const inputs = new Set<InputId>([LABOR]);
  for (const process of ctx.available) {
    for (const type of Object.keys(process.areaPerOutput)) inputs.add(areaInput(type));
    for (const id of Object.keys(process.intermediatesPerOutput)) inputs.add(stockInput(id));
  }
  return [...inputs].sort();
}

/**
 * Plans for the given demands, or reports what it could not fit.
 *
 * Comparison happens **within one input**: the conflict arises there — the
 * wilderness is short — so the only question is who gives way, and that is
 * measurable in hectares of wilderness. No measure across inputs, no weights,
 * no shadow prices. Labour is no special case.
 */
function planFor(demands: readonly Demand[], ctx: PlanContext): Plan {
  const levels = new Map<ProcessId, number>();
  // Which processes a demand has already been moved away from — it may leave a
  // process only once and never returns, which bounds the number of shifts and
  // makes the pass terminate.
  const abandoned = new Map<StockId, Set<ProcessId>>();

  // Start: every demand on the best process for its stock.
  for (const demand of demands) {
    const chain = ctx.order(demand.stock, producersOf(demand.stock, ctx));
    const first = chain[0];
    if (first === undefined) continue;
    levels.set(first.id, (levels.get(first.id) ?? 0) + demand.amount);
  }

  for (const input of inputsOf(ctx)) {
    for (let pass = 0; pass < ctx.available.length + 1; pass += 1) {
      const used = totalUse(levels, input, ctx);
      const cap = available(input, ctx);
      if (used <= cap + 1e-9) break;

      const excess = used - cap;
      if (!shift(excess, input, levels, abandoned, ctx)) break;
    }
  }

  return finish(levels, ctx);
}

function producersOf(stock: StockId, ctx: PlanContext): readonly ProcessDef[] {
  const branch = ctx.index.config.branches.find((b) => b.produces === stock);
  if (branch === undefined) return [];
  return ctx.available.filter((process) => process.branch === branch.id);
}

/**
 * How much of an input the plan draws on **net**.
 *
 * A stock is not only drawn from, it is also made: wood used for houses is
 * covered by the forestry the same plan runs. Counting only the use would make
 * every intermediate impossible whenever the store happens to be empty — which
 * it usually is, because it was made and used in the same tick (E4).
 */
function totalUse(
  levels: ReadonlyMap<ProcessId, number>,
  input: InputId,
  ctx: PlanContext,
): number {
  const made = input.startsWith("stock:") ? input.slice(6) : undefined;
  let sum = 0;
  for (const [id, level] of levels) {
    const process = ctx.index.process.get(id);
    if (process === undefined) continue;
    sum += level * inputPerOutput(process, input, ctx);
    if (made !== undefined && ctx.index.branch.get(process.branch)?.produces === made) {
      sum -= level;
    }
  }
  return sum;
}

/**
 * Moves as much output away from this input as the excess demands, starting
 * with the move that frees the most **of this input** per unit shifted.
 * Returns false when nothing can move any more.
 */
function shift(
  excess: number,
  input: InputId,
  levels: Map<ProcessId, number>,
  abandoned: Map<StockId, Set<ProcessId>>,
  ctx: PlanContext,
): boolean {
  interface Move {
    readonly from: ProcessDef;
    readonly to: ProcessDef;
    readonly stock: StockId;
    readonly freedPerUnit: number;
  }
  const moves: Move[] = [];

  for (const [id, level] of levels) {
    if (level <= 1e-12) continue;
    const from = ctx.index.process.get(id);
    if (from === undefined) continue;
    const cost = inputPerOutput(from, input, ctx);
    if (cost <= 0) continue;

    const stock = ctx.index.branch.get(from.branch)?.produces;
    if (stock === undefined) continue;
    const gone = abandoned.get(stock) ?? new Set<ProcessId>();

    for (const to of ctx.order(stock, producersOf(stock, ctx))) {
      if (to.id === from.id || gone.has(to.id)) continue;
      const freed = cost - inputPerOutput(to, input, ctx);
      if (freed > 1e-12) moves.push({ from, to, stock, freedPerUnit: freed });
    }
  }

  if (moves.length === 0) return false;
  moves.sort((a, b) => b.freedPerUnit - a.freedPerUnit);

  let left = excess;
  for (const move of moves) {
    if (left <= 1e-9) break;
    const level = levels.get(move.from.id) ?? 0;
    if (level <= 1e-12) continue;

    const wanted = left / move.freedPerUnit;
    const moved = Math.min(level, wanted);
    levels.set(move.from.id, level - moved);
    levels.set(move.to.id, (levels.get(move.to.id) ?? 0) + moved);
    left -= moved * move.freedPerUnit;

    const gone = abandoned.get(move.stock) ?? new Set<ProcessId>();
    gone.add(move.from.id);
    abandoned.set(move.stock, gone);
  }
  return left < excess - 1e-9;
}

/** Cuts the plan back to what the supplies actually carry, and reports why. */
function finish(levels: Map<ProcessId, number>, ctx: PlanContext): Plan {
  // Report what does not fit; do **not** scale here. Cutting every process back
  // proportionally would ration the lowest rank along with the highest, and the
  // ranking exists precisely so that does not happen (E9). Dropping a rank is
  // `makePlan`'s business.
  const shortfall = new Map<string, number>();
  const scale = 1;

  for (const input of inputsOf(ctx)) {
    const used = totalUse(levels, input, ctx);
    const cap = available(input, ctx);
    if (used > cap + 1e-9 && used > 0) shortfall.set(input, used - cap);
  }

  const output: Record<StockId, number> = {};
  const scaled = new Map<ProcessId, number>();
  for (const [id, level] of levels) {
    const value = level * scale;
    if (value <= 1e-12) continue;
    scaled.set(id, value);
    const process = ctx.index.process.get(id);
    const stock = process && ctx.index.branch.get(process.branch)?.produces;
    if (stock !== undefined) output[stock] = (output[stock] ?? 0) + value;
  }

  return { levels: scaled, output, droppedTiers: [], shortfall };
}

/**
 * The whole plan: ranks are covered in order, and the first rank that does not
 * fit whole is covered **in part** — as much as the supplies carry. Only what
 * comes after it is dropped.
 *
 * All-or-nothing per rank would be a different rule and a wrong one: a rank that
 * would go to 90 % would get nothing, and the ranks below it would sit on unused
 * labour. E9 rations, and rationing means a smaller share, not none.
 */
export function makePlan(demands: readonly Demand[], ctx: PlanContext): Plan {
  // One group per tier, in rank order. Derived demand carries its parent's tier
  // (E4), so a group holds the need and everything the chain needs for it.
  const groups = new Map<string, Demand[]>();
  const ranks = new Map<string, number>();
  for (const demand of [...demands].sort((a, b) => a.tier.rank - b.tier.rank)) {
    const group = groups.get(demand.tier.id) ?? [];
    group.push(demand);
    groups.set(demand.tier.id, group);
    ranks.set(demand.tier.id, demand.tier.rank);
  }
  const inOrder = [...groups.entries()].sort(
    (a, b) => (ranks.get(a[0]) ?? 0) - (ranks.get(b[0]) ?? 0),
  );

  let accepted: Demand[] = [];
  let plan = planFor(accepted, ctx);
  const dropped: string[] = [];
  // The input that stopped the first rank not covered whole. Taken from the
  // attempt that **failed**: the successful, cut-back one fits by construction
  // and so has nothing to report.
  let stopper: ReadonlyMap<string, number> | undefined;

  for (const [tier, group] of inOrder) {
    const whole = planFor([...accepted, ...group], ctx);
    if (whole.shortfall.size === 0) {
      accepted = [...accepted, ...group];
      plan = whole;
      continue;
    }
    stopper ??= whole.shortfall;
    // Does not fit whole: find the largest share of this rank that does. The
    // share is a number in [0, 1], so a fixed number of halvings is enough — no
    // tolerance to tune (E26).
    let low = 0;
    let high = 1;
    for (let step = 0; step < 12; step += 1) {
      const mid = (low + high) / 2;
      const trial = planFor(
        [...accepted, ...group.map((d) => ({ ...d, amount: d.amount * mid }))],
        ctx,
      );
      if (trial.shortfall.size === 0) {
        low = mid;
        plan = trial;
      } else {
        high = mid;
      }
    }
    if (low > 0) accepted = [...accepted, ...group.map((d) => ({ ...d, amount: d.amount * low }))];
    dropped.push(tier);
    // Carry on with the next rank instead of stopping. A rank stopped by the
    // forest does not stop a rank that hangs on the wilderness; the ranking
    // decides who gets a contested input first, not that everything below goes
    // hungry. What is left over is all a later rank can have anyway.
  }

  return { ...plan, droppedTiers: dropped, shortfall: stopper ?? new Map() };
}
