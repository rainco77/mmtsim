import { type Config, type ConfigIndex, type ProcessDef } from "./config.ts";
import type { AreaTypeId, ProcessId, SectorId, StockId } from "./ids.ts";
import { areaOf, type GameState } from "./state.ts";

/**
 * Allocation and production for one tick (E21, E5).
 *
 * Greedy, rank by rank, in bundles. A tier takes as much as it can turn to
 * account; what it cannot use goes to the next. Inputs are never allocated
 * separately — a tier claims the bundle its process demands, because fixed
 * input ratios leave no degree of freedom to decide about (E5).
 *
 * Pure: nothing here reads or writes state. The same function serves the tick
 * and `derive`, so what the player sees is what was computed.
 */

/** Why a tier could not be covered further. */
export type BindingKind = "labor" | "area" | "intermediate" | "none";

export interface Binding {
  readonly kind: BindingKind;
  /** Which area type or stock ran out; absent for labour. */
  readonly what?: AreaTypeId | StockId;
}

export interface TierOutcome {
  readonly tier: NeedTierId;
  readonly rank: number;
  readonly need: number;
  readonly fromStock: number;
  readonly produced: number;
  /** In [0, 1]: what arrived, against what was needed. */
  readonly coverage: number;
  readonly binding: Binding;
}

export interface ProcessRun {
  readonly process: ProcessId;
  readonly output: number;
  readonly labor: number;
  /** Share of the branch's total output that ran on this process. */
  readonly share: number;
}

export interface AllocationResult {
  readonly laborAvailable: number;
  readonly laborToProjects: number;
  readonly laborToProduction: number;
  readonly laborUnused: number;

  readonly tiers: readonly TierOutcome[];
  readonly produced: Readonly<Record<StockId, number>>;
  readonly consumed: Readonly<Record<StockId, number>>;
  readonly runs: readonly ProcessRun[];

  /** Occupied area per type; utilisation follows from it (E4). */
  readonly areaUsed: Readonly<Record<AreaTypeId, number>>;

  /** The lowest tier that is not fully covered, and what stopped it (E6). */
  readonly binding: Binding;
  readonly bindingTier?: NeedTierId;
}

type NeedTierId = string;

interface Pools {
  labor: number;
  area: Record<AreaTypeId, { available: number; quality: number }>;
  stock: Record<StockId, number>;
}

/** Land of one type, pooled over the sector's own holdings and unowned land. */
function poolAreas(
  state: GameState,
  sectorId: SectorId,
  config: Config,
): Record<AreaTypeId, { available: number; quality: number }> {
  const sector = state.sectors[sectorId];
  const pools: Record<AreaTypeId, { available: number; quality: number }> = {};
  for (const type of config.areaTypes) {
    const owned = sector ? areaOf(sector.areas, type.id) : { area: 0, quality: 1 };
    const unowned = areaOf(state.unownedAreas, type.id);
    const total = owned.area + unowned.area;
    const quality =
      total > 0
        ? (owned.area * owned.quality + unowned.area * unowned.quality) / total
        : 1;
    pools[type.id] = { available: total, quality };
  }
  return pools;
}

function effectiveOutputPerLabor(
  process: ProcessDef,
  _quality: number,
  yearQuality: number,
): number {
  const weatherFactor = 1 + process.weatherSensitivity * (yearQuality - 1);
  return process.outputPerLabor * Math.max(0, weatherFactor);
}

/**
 * Land quality works on the **area**, not on the labour: E13 puts it as
 * `yield = hectares × quality × process yield`. Poor ground means more acres
 * for the same harvest — that is Ricardo's differential rent, and it is what
 * makes the fixed factor bite.
 */
function effectiveAreaPerOutput(
  process: ProcessDef,
  areaType: AreaTypeId,
  quality: number,
): number {
  const base = process.areaPerOutput[areaType] ?? 0;
  const factor = 1 - process.qualityWeight + process.qualityWeight * quality;
  return factor > 0 ? base / factor : Infinity;
}

/** The quality of the land this process works on. */
function qualityFor(process: ProcessDef, pools: Pools): number {
  const first = Object.keys(process.areaPerOutput)[0];
  return first === undefined ? 1 : (pools.area[first]?.quality ?? 1);
}

/**
 * How much this process could produce at most, and what limits it first.
 *
 * `ignoreIntermediates` matters: to decide how much of an input to order, the
 * limit must be computed *without* that input — otherwise nothing is ordered
 * because nothing is there, and nothing is there because nothing was ordered.
 */
function capacityOf(
  process: ProcessDef,
  pools: Pools,
  yearQuality: number,
  ignoreIntermediates = false,
): { max: number; binding: Binding } {
  const perLabor = effectiveOutputPerLabor(
    process,
    qualityFor(process, pools),
    yearQuality,
  );
  if (perLabor <= 0) return { max: 0, binding: { kind: "none" } };

  let max = pools.labor * perLabor;
  let binding: Binding = { kind: "labor" };

  for (const areaType of Object.keys(process.areaPerOutput)) {
    const perOutput = effectiveAreaPerOutput(
      process,
      areaType,
      qualityFor(process, pools),
    );
    if (perOutput <= 0) continue;
    const limit = (pools.area[areaType]?.available ?? 0) / perOutput;
    if (limit < max) {
      max = limit;
      binding = { kind: "area", what: areaType };
    }
  }

  if (!ignoreIntermediates) {
    for (const [stockId, perOutput] of Object.entries(process.intermediatesPerOutput)) {
      if (perOutput <= 0) continue;
      const limit = (pools.stock[stockId] ?? 0) / perOutput;
      if (limit < max) {
        max = limit;
        binding = { kind: "intermediate", what: stockId };
      }
    }
  }

  return { max: Math.max(0, max), binding };
}

/**
 * Labour needed for one unit of a stock, including everything up the chain —
 * the labour content of the input-output table (E4).
 *
 * Without it, ordering an input would be planned against labour that the input
 * itself will use up, and a chain would order far more than it can carry.
 */
function laborContent(
  stockId: StockId,
  ctx: ProductionContext,
  seen: Set<StockId>,
): number {
  const cached = ctx.laborContent.get(stockId);
  if (cached !== undefined) return cached;
  if (seen.has(stockId)) return Infinity;

  const branch = ctx.index.config.branches.find((b) => b.produces === stockId);
  if (branch === undefined || !ctx.unlockedBranches.has(branch.id)) return Infinity;

  const process = (ctx.index.processesOfBranch.get(branch.id) ?? []).find((p) =>
    ctx.unlockedProcesses.has(p.id),
  );
  if (process === undefined) return Infinity;

  seen.add(stockId);
  const perLabor = effectiveOutputPerLabor(
    process,
    qualityFor(process, ctx.pools),
    ctx.yearQuality,
  );
  let total = perLabor > 0 ? 1 / perLabor : Infinity;
  for (const [needed, perOutput] of Object.entries(process.intermediatesPerOutput)) {
    if (perOutput <= 0) continue;
    total += perOutput * laborContent(needed, ctx, seen);
  }
  seen.delete(stockId);

  ctx.laborContent.set(stockId, total);
  return total;
}

function consume(
  process: ProcessDef,
  output: number,
  pools: Pools,
  yearQuality: number,
  areaUsed: Record<AreaTypeId, number>,
  consumed: Record<StockId, number>,
): number {
  const areaEntries = Object.entries(process.areaPerOutput);
  const quality =
    areaEntries.length > 0
      ? areaEntries[0]
        ? (pools.area[areaEntries[0][0]]?.quality ?? 1)
        : 1
      : 1;
  const perLabor = effectiveOutputPerLabor(process, quality, yearQuality);
  const labor = perLabor > 0 ? output / perLabor : 0;

  pools.labor -= labor;
  for (const [areaType] of areaEntries) {
    const pool = pools.area[areaType];
    if (pool === undefined) continue;
    const used = output * effectiveAreaPerOutput(process, areaType, quality);
    pool.available -= used;
    areaUsed[areaType] = (areaUsed[areaType] ?? 0) + used;
  }
  for (const [stockId, perOutput] of Object.entries(process.intermediatesPerOutput)) {
    const used = output * perOutput;
    pools.stock[stockId] = (pools.stock[stockId] ?? 0) - used;
    consumed[stockId] = (consumed[stockId] ?? 0) + used;
  }
  return labor;
}

interface ProductionContext {
  readonly index: ConfigIndex;
  readonly pools: Pools;
  readonly yearQuality: number;
  readonly produced: Record<StockId, number>;
  readonly consumed: Record<StockId, number>;
  readonly areaUsed: Record<AreaTypeId, number>;
  readonly runsByProcess: Map<ProcessId, { output: number; labor: number }>;
  readonly unlockedBranches: ReadonlySet<string>;
  readonly unlockedProcesses: ReadonlySet<ProcessId>;
  /** Guards against a cycle in the input-output table. */
  readonly inProgress: Set<StockId>;
  /** Labour content per stock, computed once per allocation. */
  readonly laborContent: Map<StockId, number>;
}

/**
 * Produce up to `amount` of a stock, running the branch's processes by priority
 * and falling back when one runs out (E5).
 *
 * Intermediates are produced on demand: a branch that lacks an input triggers
 * production of that input first. That is the input-output chain from E4 —
 * without it a stock nobody needs directly, like the wood a house is built of,
 * would never be made at all.
 */
function produceInto(
  stockId: StockId,
  amount: number,
  ctx: ProductionContext,
): { output: number; binding: Binding } {
  if (amount <= 1e-12) return { output: 0, binding: { kind: "none" } };
  if (ctx.inProgress.has(stockId)) {
    // A cycle in the chain: stop rather than loop. Demand cannot be resolved
    // by producing more of what is already being produced.
    return { output: 0, binding: { kind: "intermediate", what: stockId } };
  }

  const branch = [...ctx.index.config.branches].find(
    (candidate) => candidate.produces === stockId,
  );
  if (branch === undefined || !ctx.unlockedBranches.has(branch.id)) {
    return { output: 0, binding: { kind: "intermediate", what: stockId } };
  }

  ctx.inProgress.add(stockId);
  let remaining = amount;
  let output = 0;
  let binding: Binding = { kind: "none" };

  const processes = (ctx.index.processesOfBranch.get(branch.id) ?? []).filter((process) =>
    ctx.unlockedProcesses.has(process.id),
  );

  for (const process of processes) {
    if (remaining <= 1e-12) break;

    // How much is worth aiming for: labour for the *whole chain*, and this
    // process's own area — deliberately without the intermediates, which are
    // exactly what is about to be ordered.
    const reach = capacityOf(process, ctx.pools, ctx.yearQuality, true);
    const content = laborContent(stockId, ctx, new Set());
    const chainLimit =
      content > 0 && Number.isFinite(content) ? ctx.pools.labor / content : 0;
    const wanted = Math.min(remaining, reach.max, chainLimit);

    let upstream: Binding | undefined;
    for (const [needed, perOutput] of Object.entries(process.intermediatesPerOutput)) {
      if (perOutput <= 0) continue;
      const short = wanted * perOutput - (ctx.pools.stock[needed] ?? 0);
      if (short <= 1e-12) continue;
      const made = produceInto(needed, short, ctx);
      // If the input itself fell short, the real bottleneck lies upstream —
      // say "wilderness ran out", not "wood is missing".
      if (made.output < short - 1e-9 && made.binding.kind !== "none") {
        upstream = made.binding;
      }
    }

    const { max, binding: direct } = capacityOf(process, ctx.pools, ctx.yearQuality);
    const limit = upstream ?? direct;
    const made = Math.min(remaining, max);
    if (made > 1e-12) {
      const labor = consume(
        process,
        made,
        ctx.pools,
        ctx.yearQuality,
        ctx.areaUsed,
        ctx.consumed,
      );
      const run = ctx.runsByProcess.get(process.id) ?? { output: 0, labor: 0 };
      ctx.runsByProcess.set(process.id, {
        output: run.output + made,
        labor: run.labor + labor,
      });
      ctx.produced[stockId] = (ctx.produced[stockId] ?? 0) + made;
      ctx.pools.stock[stockId] = (ctx.pools.stock[stockId] ?? 0) + made;
      output += made;
      remaining -= made;
    }
    // The fallback level: what did not fit runs on the next process (E5).
    if (remaining > 1e-12) binding = limit;
  }

  ctx.inProgress.delete(stockId);
  return { output, binding };
}

export interface AllocationInput {
  readonly state: GameState;
  readonly index: ConfigIndex;
  readonly sectorId: SectorId;
  readonly yearQuality: number;
  /** Labour already committed to projects this tick — projects come first (E21). */
  readonly laborToProjects: number;
  readonly unlockedBranches: ReadonlySet<string>;
  readonly unlockedProcesses: ReadonlySet<ProcessId>;
}

export function allocate(input: AllocationInput): AllocationResult {
  const { state, index, sectorId, yearQuality, laborToProjects } = input;
  const config = index.config;
  const sector = state.sectors[sectorId];

  const heads = sector?.heads ?? 0;
  const laborAvailable = heads * (sector?.workAbility ?? 0) * (sector?.productivity ?? 0);

  const pools: Pools = {
    labor: Math.max(0, laborAvailable - laborToProjects),
    area: poolAreas(state, sectorId, config),
    stock: { ...(sector?.stocks ?? {}) },
  };
  const laborForProduction = pools.labor;

  const produced: Record<StockId, number> = {};
  const consumed: Record<StockId, number> = {};
  const areaUsed: Record<AreaTypeId, number> = {};
  const runsByProcess = new Map<ProcessId, { output: number; labor: number }>();
  const laborContent = new Map<StockId, number>();
  const tiers: TierOutcome[] = [];

  let overallBinding: Binding = { kind: "none" };
  let bindingTier: string | undefined;

  for (const tier of index.tiersByRank) {
    if (!input.unlockedBranches.has(tier.branch)) continue;

    const need = heads * tier.perHead;
    if (need <= 0) {
      tiers.push({
        tier: tier.id,
        rank: tier.rank,
        need: 0,
        fromStock: 0,
        produced: 0,
        coverage: 1,
        binding: { kind: "none" },
      });
      continue;
    }

    // A tier needs a *level*, not a flow: `perHead` is what a person must have,
    // and only what is missing has to be made. That is how E3 gets rid of the
    // stock/flow distinction — a house is simply slow decay, bread is fast.
    // With decay at 85 % almost the whole amount is missing again every tick,
    // so food behaves as a flow; housing at 0.4 % only needs its wear replaced.
    //
    // Lower ranks help themselves to what is there first (E9).
    const inStock = pools.stock[tier.stock] ?? 0;
    const fromStock = Math.min(need, Math.max(0, inStock));
    pools.stock[tier.stock] = inStock - fromStock;

    const outcome = produceInto(tier.stock, need - fromStock, {
      index,
      pools,
      yearQuality,
      produced,
      consumed,
      areaUsed,
      runsByProcess,
      unlockedBranches: input.unlockedBranches,
      unlockedProcesses: input.unlockedProcesses,
      inProgress: new Set<StockId>(),
      laborContent,
    });
    const producedHere = outcome.output;
    const binding = outcome.binding;

    // What is claimed stays claimed, so a higher rank cannot help itself to the
    // same units a second time.
    pools.stock[tier.stock] = (pools.stock[tier.stock] ?? 0) - producedHere;

    // And what is *used up* in use is booked as consumption — that is eating,
    // and it hangs on the heads. Wearing out is a different matter and has
    // already happened in the decay phase (E19).
    const served = fromStock + producedHere;
    const eaten = served * tier.consumedOnUse;
    if (eaten > 0) consumed[tier.stock] = (consumed[tier.stock] ?? 0) + eaten;
    // Whatever is not used up goes back into the pool for the next tick.
    pools.stock[tier.stock] = (pools.stock[tier.stock] ?? 0) + (served - eaten);

    const coverage = need > 0 ? Math.min(1, (fromStock + producedHere) / need) : 1;
    tiers.push({
      tier: tier.id,
      rank: tier.rank,
      need,
      fromStock,
      produced: producedHere,
      coverage,
      binding,
    });

    if (coverage < 1 - 1e-9 && bindingTier === undefined) {
      overallBinding = binding;
      bindingTier = tier.id;
    }
  }

  const totalOutput = [...runsByProcess.values()].reduce((sum, r) => sum + r.output, 0);
  const runs: ProcessRun[] = [...runsByProcess.entries()].map(([id, run]) => ({
    process: id,
    output: run.output,
    labor: run.labor,
    share: totalOutput > 0 ? run.output / totalOutput : 0,
  }));

  return {
    laborAvailable,
    laborToProjects,
    laborToProduction: laborForProduction - pools.labor,
    laborUnused: Math.max(0, pools.labor),
    tiers,
    produced,
    consumed,
    runs,
    areaUsed,
    binding: overallBinding,
    ...(bindingTier === undefined ? {} : { bindingTier }),
  };
}
