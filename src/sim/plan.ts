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

export const areaInput = (id: AreaTypeId): InputId => `area:${id}`;
export const stockInput = (id: StockId): InputId => `stock:${id}`;

export interface PlanContext {
  readonly index: ConfigIndex;
  readonly supplies: Supplies;
  /** Processes that may run, already filtered by what is unlocked. */
  readonly available: readonly ProcessDef[];
  /**
   * How much this tick's shocks cut this process back **for this input** — 1
   * means untouched. Which inputs a shock reaches is not the plan's business
   * to know: it asks, the caller decides.
   */
  shockFor(process: ProcessDef, input: InputId): number;
  /** Ordering within one stock, best first — see E5. */
  order(stock: StockId, processes: readonly ProcessDef[]): readonly ProcessDef[];
}


/**
 * How much of one input a process needs **all told** — its own use plus what
 * everything it consumes needs of it, down the chain (Leontief).
 *
 * A comparison has to be made on this and not on the direct coefficient. Since
 * labour became an ordinary input (E4), a field does not use the people
 * directly any more; it uses labour, and labour uses the people. Asked for its
 * direct cost in people, farming answers zero — so a shortage of labour
 * produced no move at all, while a shortage of land did. Measured: with labour
 * fully taken and land lying idle, the labour-sparing technique never came in.
 *
 * The quantities already run through the chain — that is what derived demand
 * does. The decision over those quantities has to see the same chain.
 */
function chainRow(input: InputId, ctx: PlanContext): ReadonlyMap<ProcessId, number> {
  const cache = cacheOf(ctx);
  const known = cache.chain.get(input);
  if (known !== undefined) return known;

  const row = new Map<ProcessId, number>();
  const direct = coefRow(input, ctx);

  const costOf = (process: ProcessDef, seen: Set<ProcessId>): number => {
    const ready = row.get(process.id);
    if (ready !== undefined) return ready;
    // A cycle cannot arise from the content we have; if one ever did, the
    // chain stops at what is directly visible rather than running away.
    if (seen.has(process.id)) return direct.get(process.id) ?? 0;
    seen.add(process.id);

    let total = direct.get(process.id) ?? 0;
    for (const [stock, per] of Object.entries(process.intermediatesPerOutput)) {
      if (per <= 0) continue;
      const maker = producersOf(stock, ctx)[0];
      if (maker === undefined) continue;
      total += per * costOf(maker, seen);
    }
    seen.delete(process.id);
    row.set(process.id, total);
    return total;
  };

  for (const process of ctx.available) costOf(process, new Set());
  cache.chain.set(input, row);
  return row;
}

/** The processes whose output *is* the stock behind this input — built once. */
function makersOf(input: InputId, ctx: PlanContext): ReadonlySet<ProcessId> {
  const cache = cacheOf(ctx);
  const known = cache.makers.get(input);
  if (known !== undefined) return known;

  const made = input.startsWith("stock:") ? input.slice(6) : undefined;
  const set = new Set<ProcessId>();
  if (made !== undefined) {
    for (const process of ctx.available) {
      if (ctx.index.branch.get(process.branch)?.produces === made) set.add(process.id);
    }
  }
  cache.makers.set(input, set);
  return set;
}

/** All coefficients for one input, keyed by process — built once. */
function coefRow(input: InputId, ctx: PlanContext): ReadonlyMap<ProcessId, number> {
  const cache = cacheOf(ctx);
  const known = cache.coef.get(input);
  if (known !== undefined) return known;

  const row = new Map<ProcessId, number>();
  for (const process of ctx.available) {
    row.set(process.id, computeInputPerOutput(process, input, ctx));
  }
  cache.coef.set(input, row);
  return row;
}

function computeInputPerOutput(
  process: ProcessDef,
  input: InputId,
  ctx: PlanContext,
): number {
  const shock = ctx.shockFor(process, input);
  if (shock <= 0) return Infinity;

  if (input.startsWith("area:")) {
    const type = input.slice(5);
    const base = process.areaPerOutput[type] ?? 0;
    if (base <= 0) return 0;
    const quality = ctx.supplies.areas[type]?.quality ?? 1;
    const factor = 1 - process.qualityWeight + process.qualityWeight * quality;
    return factor > 0 ? base / factor / shock : Infinity;
  }
  if (input.startsWith("stock:")) {
    return (process.intermediatesPerOutput[input.slice(6)] ?? 0) / shock;
  }
  return 0;
}

function available(input: InputId, ctx: PlanContext): number {
  const cache = cacheOf(ctx);
  const known = cache.supply.get(input);
  if (known !== undefined) return known;
  const value = computeAvailable(input, ctx);
  cache.supply.set(input, value);
  return value;
}

function computeAvailable(input: InputId, ctx: PlanContext): number {
  if (input.startsWith("area:")) return ctx.supplies.areas[input.slice(5)]?.area ?? 0;
  if (input.startsWith("stock:")) return ctx.supplies.stocks[input.slice(6)] ?? 0;
  return 0;
}

/**
 * Answers that cannot change while one plan is being made.
 *
 * Which inputs exist and who can make what follow from the unlocked processes
 * alone, and those stand still for the whole allocation. Rebuilding them per
 * question cost more than the planning itself: measured at 1090 set builds and
 * 1326 filter runs per tick, for at most a handful of distinct answers.
 */
const CACHE = new WeakMap<
  PlanContext,
  {
    inputs?: readonly InputId[];
    producers: Map<StockId, readonly ProcessDef[]>;
    /** Input first, then process: a sum runs over one input at a time. */
    coef: Map<InputId, Map<ProcessId, number>>;
    supply: Map<InputId, number>;
    chain: Map<InputId, ReadonlyMap<ProcessId, number>>;
    /** Who makes the stock behind an input — the credit side of the net use. */
    makers: Map<InputId, ReadonlySet<ProcessId>>;
  }
>();

function cacheOf(ctx: PlanContext): {
  inputs?: readonly InputId[];
  producers: Map<StockId, readonly ProcessDef[]>;
  coef: Map<InputId, Map<ProcessId, number>>;
  supply: Map<InputId, number>;
  chain: Map<InputId, ReadonlyMap<ProcessId, number>>;
  makers: Map<InputId, ReadonlySet<ProcessId>>;
} {
  let entry = CACHE.get(ctx);
  if (entry === undefined) {
    entry = {
      producers: new Map(),
      coef: new Map(),
      supply: new Map(),
      chain: new Map(),
      makers: new Map(),
    };
    CACHE.set(ctx, entry);
  }
  return entry;
}

/** Every input any available process touches, in a fixed order. */
function inputsOf(ctx: PlanContext): readonly InputId[] {
  const cache = cacheOf(ctx);
  if (cache.inputs !== undefined) return cache.inputs;

  const inputs = new Set<InputId>();
  for (const process of ctx.available) {
    for (const type of Object.keys(process.areaPerOutput)) inputs.add(areaInput(type));
    for (const id of Object.keys(process.intermediatesPerOutput)) inputs.add(stockInput(id));
  }
  cache.inputs = [...inputs].sort();
  return cache.inputs;
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

  // What the ranks claim outright, per stock — the final demand.
  const final = new Map<StockId, number>();
  for (const demand of demands) {
    final.set(demand.stock, (final.get(demand.stock) ?? 0) + demand.amount);
  }

  // Start: every demand on the best process for its stock.
  for (const demand of demands) {
    const chain = producersOf(demand.stock, ctx);
    const first = chain[0];
    if (first === undefined) continue;
    levels.set(first.id, (levels.get(first.id) ?? 0) + demand.amount);
  }

  // Steps 3 and 4 of E21 in one loop: cover what the plan needs of its own
  // making, find an input that does not fit, move demand off it — and then
  // start over, because a move creates demand somewhere else. Moving food from
  // hunting to farming frees wilderness and costs labour, and that labour has
  // to be planned for before the next input is judged. Doing it once up front
  // makes the extra labour look like a shortfall instead of like work to do.
  const limit = (ctx.available.length + 2) * (inputsOf(ctx).length + 1);
  for (let pass = 0; pass < limit; pass += 1) {
    cover(levels, final, ctx);

    let tight: InputId | undefined;
    let excess = 0;
    for (const input of inputsOf(ctx)) {
      const over = totalUse(levels, input, ctx, final) - available(input, ctx);
      if (over > 1e-9) {
        tight = input;
        excess = over;
        break;
      }
    }
    if (tight === undefined) break;
    if (!shift(excess, tight, levels, abandoned, ctx)) break;
  }

  return finish(levels, final, ctx);
}

/** Who can make this stock, best first — the order included, so it is asked once. */
function producersOf(stock: StockId, ctx: PlanContext): readonly ProcessDef[] {
  const cache = cacheOf(ctx);
  const known = cache.producers.get(stock);
  if (known !== undefined) return known;

  const branch = ctx.index.config.branches.find((b) => b.produces === stock);
  const found =
    branch === undefined
      ? []
      : ctx.order(
          stock,
          ctx.available.filter((process) => process.branch === branch.id),
        );
  cache.producers.set(stock, found);
  return found;
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
  final: ReadonlyMap<StockId, number> = new Map(),
): number {
  const row = coefRow(input, ctx);
  const makers = makersOf(input, ctx);
  // A claim that no process makes as an input is still a claim: a project that
  // costs labour takes it out of the same pot as the gathering does. Leaving it
  // out means the production planned for it gets counted twice.
  let sum = input.startsWith("stock:") ? (final.get(input.slice(6)) ?? 0) : 0;
  for (const [id, level] of levels) {
    sum += level * (row.get(id) ?? 0);
    if (makers.has(id)) sum -= level;
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
  const chain = chainRow(input, ctx);

  for (const [id, level] of levels) {
    if (level <= 1e-12) continue;
    const from = ctx.index.process.get(id);
    if (from === undefined) continue;
    const cost = chain.get(id) ?? 0;
    if (cost <= 0) continue;

    const stock = ctx.index.branch.get(from.branch)?.produces;
    if (stock === undefined) continue;
    const gone = abandoned.get(stock) ?? new Set<ProcessId>();

    for (const to of producersOf(stock, ctx)) {
      if (to.id === from.id || gone.has(to.id)) continue;
      const freed = cost - (chain.get(to.id) ?? 0);
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

/**
 * Derived demand (E4): what a process needs and cannot take from the store has
 * to be made, and making it needs inputs in turn.
 *
 * This is computed **against the levels themselves**, inside the plan. An
 * estimate made outside would miss them by a rounding error, and a rounding
 * error reads as a shortfall — which E26 forbids papering over with a
 * tolerance.
 */
function cover(
  levels: Map<ProcessId, number>,
  final: ReadonlyMap<StockId, number>,
  ctx: PlanContext,
): void {
  for (let pass = 0; pass < ctx.available.length + 2; pass += 1) {
    let raised = false;
    for (const input of inputsOf(ctx)) {
      if (!input.startsWith("stock:")) continue;
      const stock = input.slice(6);
      const gap = totalUse(levels, input, ctx, final) - available(input, ctx);
      if (Math.abs(gap) <= 1e-12) continue;
      const maker = producersOf(stock, ctx)[0];
      if (maker === undefined) continue;

      // Exactly what is needed, in both directions. Raising only would leave
      // the production of a demand that has since moved elsewhere standing:
      // after a shift to a technique that needs less labour, the labour
      // already planned for stayed, so the shortage never went away, the shift
      // counted as fruitless and the whole rank fell.
      const level = levels.get(maker.id) ?? 0;
      const next = Math.max(0, level + gap);
      if (Math.abs(next - level) <= 1e-12) continue;
      levels.set(maker.id, next);
      raised = true;
    }
    if (!raised) break;
  }
}

/** Cuts the plan back to what the supplies actually carry, and reports why. */
function finish(
  levels: Map<ProcessId, number>,
  final: ReadonlyMap<StockId, number>,
  ctx: PlanContext,
): Plan {
  // Report what does not fit; do **not** scale here. Cutting every process back
  // proportionally would ration the lowest rank along with the highest, and the
  // ranking exists precisely so that does not happen (E9). Dropping a rank is
  // `makePlan`'s business.
  const shortfall = new Map<string, number>();
  const scale = 1;

  for (const input of inputsOf(ctx)) {
    const used = totalUse(levels, input, ctx, final);
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
