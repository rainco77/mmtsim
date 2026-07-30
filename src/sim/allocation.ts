import { type Config, type ConfigIndex, type ProcessDef } from "./config.ts";
import type { AreaTypeId, BranchId, ProcessId, SectorId, StockId } from "./ids.ts";
import {
  ORDERING_RESOLVER,
  type OrderingContext,
  type OrderingReason,
} from "./ordering.ts";
import { makePlan, type Demand, type Plan, type PlanContext } from "./plan.ts";
import { shockFactor, type Shocks } from "./risk.ts";
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

  /** Which process led per branch, and why (E5). */
  readonly leadProcess: Readonly<Record<BranchId, ProcessId>>;
  readonly orderingReason: Readonly<Record<BranchId, OrderingReason>>;
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
  shocks: Shocks,
): number {
  return process.outputPerLabor * shockFactor(process, shocks);
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



function consume(
  process: ProcessDef,
  output: number,
  pools: Pools,
  shocks: Shocks,
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
  const perLabor = effectiveOutputPerLabor(process, quality, shocks);
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



export interface AllocationInput {
  readonly state: GameState;
  /** Whether the player may still set the order himself (E5, E23). */
  readonly manualAllowed: boolean;
  readonly index: ConfigIndex;
  readonly sectorId: SectorId;
  readonly shocks: Shocks;
  /** Labour already committed to projects this tick — projects come first (E21). */
  readonly laborToProjects: number;
  readonly unlockedBranches: ReadonlySet<string>;
  readonly unlockedProcesses: ReadonlySet<ProcessId>;
}

export function allocate(input: AllocationInput): AllocationResult {
  const { state, index, sectorId, shocks, laborToProjects } = input;
  const config = index.config;
  const sector = state.sectors[sectorId];

  const heads = sector?.heads ?? 0;
  const laborAvailable = heads * (sector?.workAbility ?? 0) * (sector?.productivity ?? 0);
  const laborForProduction = Math.max(0, laborAvailable - laborToProjects);

  const pools: Pools = {
    labor: laborForProduction,
    area: poolAreas(state, sectorId, config),
    stock: { ...(sector?.stocks ?? {}) },
  };

  const availableProcesses = config.processes.filter(
    (process) =>
      input.unlockedProcesses.has(process.id) && input.unlockedBranches.has(process.branch),
  );
  const buffer = survivalBuffer(state, index, sectorId);

  // The ordering per branch, resolved once (E5). Both sources deliver the same
  // shape, so the plan below does not care which one was used.
  const ordering = new Map<BranchId, readonly ProcessDef[]>();
  const orderingReason = new Map<BranchId, OrderingReason>();
  const leadProcess = new Map<BranchId, ProcessId>();

  for (const branch of config.branches) {
    if (!input.unlockedBranches.has(branch.id)) continue;
    const forBranch = availableProcesses.filter((process) => process.branch === branch.id);
    const orderCtx: OrderingContext = {
      index,
      available: forBranch,
      buffer,
      manual: state.manualOrder[branch.id],
      yieldPerLabor: (process) => yieldPerLabor(process, index, pools, shocks, input),
    };
    const resolved = ORDERING_RESOLVER.resolve(branch, orderCtx, input.manualAllowed);
    ordering.set(branch.id, resolved.processes);
    orderingReason.set(branch.id, resolved.reason);
    const first = resolved.processes[0];
    if (first !== undefined) leadProcess.set(branch.id, first.id);
  }

  // Ranks eat from the store first, lowest rank first (E9). What is left over
  // is the demand the plan has to cover.
  const consumed: Record<StockId, number> = {};
  const fromStock = new Map<string, number>();
  const demands: Demand[] = [];
  const tierList = index.tiersByRank.filter((tier) => input.unlockedBranches.has(tier.branch));

  for (const tier of tierList) {
    const need = heads * tier.perHead;
    const inStock = pools.stock[tier.stock] ?? 0;
    const taken = Math.min(need, Math.max(0, inStock));
    pools.stock[tier.stock] = inStock - taken;
    fromStock.set(tier.id, taken);
    if (need - taken > 1e-9) {
      demands.push({ tier, stock: tier.stock, amount: need - taken });
    }
  }

  const planCtx: PlanContext = {
    index,
    supplies: {
      labor: pools.labor,
      areas: Object.fromEntries(
        Object.entries(pools.area).map(([id, pool]) => [
          id,
          { area: pool.available, quality: pool.quality },
        ]),
      ),
      stocks: { ...pools.stock },
    },
    available: availableProcesses,
    yieldPerLabor: (process) => yieldPerLabor(process, index, pools, shocks, input),
    order: (stock, processes) => {
      const branch = config.branches.find((b) => b.produces === stock);
      const wanted = branch === undefined ? undefined : ordering.get(branch.id);
      if (wanted === undefined) return processes;
      return wanted.filter((process) => processes.some((p) => p.id === process.id));
    },
  };

  const plan = makePlan(expandDemands(demands, planCtx), planCtx);

  // Carry the plan out: consume inputs, book output.
  const produced: Record<StockId, number> = {};
  const areaUsed: Record<AreaTypeId, number> = {};
  const runs: ProcessRun[] = [];
  let totalOutput = 0;

  // Producers before consumers: a house cannot be built from wood that is only
  // cut later in the loop. `consume` draws intermediates from the pool, so what
  // is made has to be in it first (E4).
  const inDependencyOrder = [...plan.levels.keys()].sort((a, b) => {
    const pa = index.process.get(a);
    const pb = index.process.get(b);
    if (pa === undefined || pb === undefined) return 0;
    const outA = index.branch.get(pa.branch)?.produces;
    const outB = index.branch.get(pb.branch)?.produces;
    const aFeedsB = outA !== undefined && (pb.intermediatesPerOutput[outA] ?? 0) > 0;
    const bFeedsA = outB !== undefined && (pa.intermediatesPerOutput[outB] ?? 0) > 0;
    return aFeedsB ? -1 : bFeedsA ? 1 : 0;
  });

  for (const id of inDependencyOrder) {
    const level = plan.levels.get(id) ?? 0;
    const process = index.process.get(id);
    if (process === undefined || level <= 1e-12) continue;
    const labor = consume(process, level, pools, shocks, areaUsed, consumed);
    const stock = index.branch.get(process.branch)?.produces;
    if (stock !== undefined) {
      produced[stock] = (produced[stock] ?? 0) + level;
      // Available to whatever needs it as an input further down the loop.
      pools.stock[stock] = (pools.stock[stock] ?? 0) + level;
    }
    runs.push({ process: id, output: level, labor, share: 0 });
    totalOutput += level;
  }
  const withShares = runs.map((run) => ({
    ...run,
    share: totalOutput > 0 ? run.output / totalOutput : 0,
  }));

  // Coverage per tier: the store it took plus its share of what was produced,
  // handed out by rank (E9 rations, it does not produce).
  const left: Record<StockId, number> = { ...produced };
  const tiers: TierOutcome[] = [];
  let overallBinding: Binding = { kind: "none" };
  let bindingTier: string | undefined;

  for (const tier of tierList) {
    const need = heads * tier.perHead;
    const taken = fromStock.get(tier.id) ?? 0;
    const wanted = Math.max(0, need - taken);
    const got = Math.min(wanted, left[tier.stock] ?? 0);
    left[tier.stock] = (left[tier.stock] ?? 0) - got;

    const coverage = need > 0 ? Math.min(1, (taken + got) / need) : 1;
    const binding = coverage < 1 - 1e-9 ? bindingFromPlan(plan) : { kind: "none" as const };
    tiers.push({
      tier: tier.id,
      rank: tier.rank,
      need,
      fromStock: taken,
      produced: got,
      coverage,
      binding,
    });
    if (coverage < 1 - 1e-9 && bindingTier === undefined) {
      overallBinding = binding;
      bindingTier = tier.id;
    }

    const served = taken + got;
    const eaten = served * tier.consumedOnUse;
    if (eaten > 0) consumed[tier.stock] = (consumed[tier.stock] ?? 0) + eaten;
  }

  return {
    laborAvailable,
    laborToProjects,
    laborToProduction: laborForProduction - pools.labor,
    laborUnused: Math.max(0, pools.labor),
    tiers,
    produced,
    consumed,
    runs: withShares,
    areaUsed,
    binding: overallBinding,
    ...(bindingTier === undefined ? {} : { bindingTier }),
    leadProcess: Object.fromEntries(leadProcess),
    orderingReason: Object.fromEntries(orderingReason),
  };
}

/** Output per unit of labour, chain included (E4). */
function yieldPerLabor(
  process: ProcessDef,
  index: ConfigIndex,
  pools: Pools,
  shocks: Shocks,
  input: AllocationInput,
): number {
  const content = laborContentOf(
    process,
    index,
    pools,
    shocks,
    input.unlockedBranches,
    input.unlockedProcesses,
    new Set(),
  );
  return Number.isFinite(content) && content > 0 ? 1 / content : 0;
}

/**
 * Derived demand (E4): a house needs wood, so planning for houses means
 * planning for the wood as well. Without this a stock nobody needs directly
 * would never be made.
 */
function expandDemands(demands: readonly Demand[], ctx: PlanContext): readonly Demand[] {
  const all = [...demands];
  for (let i = 0; i < all.length && i < 200; i += 1) {
    const demand = all[i];
    if (demand === undefined) continue;
    const branch = ctx.index.config.branches.find((b) => b.produces === demand.stock);
    if (branch === undefined) continue;
    const process = ctx.order(
      demand.stock,
      ctx.available.filter((p) => p.branch === branch.id),
    )[0];
    if (process === undefined) continue;
    for (const [needed, per] of Object.entries(process.intermediatesPerOutput)) {
      if (per <= 0) continue;
      const have = ctx.supplies.stocks[needed] ?? 0;
      const wanted = demand.amount * per - have;
      if (wanted > 1e-9) all.push({ tier: demand.tier, stock: needed, amount: wanted });
    }
  }
  return all;
}

/** Which input stopped the plan — the check on E6. */
function bindingFromPlan(plan: Plan): Binding {
  let worst: string | undefined;
  let value = 0;
  for (const [input, missing] of plan.shortfall) {
    if (missing > value) {
      value = missing;
      worst = input;
    }
  }
  if (worst === undefined) return { kind: "none" };
  if (worst === "labor") return { kind: "labor" };
  if (worst.startsWith("area:")) return { kind: "area", what: worst.slice(5) };
  return { kind: "intermediate", what: worst.slice(6) };
}

/**
 * Labour content, standalone — the ordering needs it before anything has run.
 * Includes everything up the chain (E4): a house costs its own labour plus the
 * labour in the wood it is built of.
 */
function laborContentOf(
  process: ProcessDef,
  index: ConfigIndex,
  pools: Pools,
  shocks: Shocks,
  unlockedBranches: ReadonlySet<string>,
  unlockedProcesses: ReadonlySet<ProcessId>,
  seen: Set<StockId>,
): number {
  const perLabor = effectiveOutputPerLabor(process, qualityFor(process, pools), shocks);
  let total = perLabor > 0 ? 1 / perLabor : Infinity;
  for (const [needed, per] of Object.entries(process.intermediatesPerOutput)) {
    if (per <= 0) continue;
    total +=
      per *
      stockLaborContent(
        needed,
        index,
        pools,
        shocks,
        unlockedBranches,
        unlockedProcesses,
        seen,
      );
  }
  return total;
}

/** Labour content of a *stock*: the cheapest unlocked way to make one unit. */
function stockLaborContent(
  stockId: StockId,
  index: ConfigIndex,
  pools: Pools,
  shocks: Shocks,
  unlockedBranches: ReadonlySet<string>,
  unlockedProcesses: ReadonlySet<ProcessId>,
  seen: Set<StockId>,
): number {
  if (seen.has(stockId)) return Infinity;
  const branch = index.config.branches.find((b) => b.produces === stockId);
  if (branch === undefined || !unlockedBranches.has(branch.id)) return Infinity;

  seen.add(stockId);
  let best = Infinity;
  for (const process of index.processesOfBranch.get(branch.id) ?? []) {
    if (!unlockedProcesses.has(process.id)) continue;
    best = Math.min(
      best,
      laborContentOf(
        process,
        index,
        pools,
        shocks,
        unlockedBranches,
        unlockedProcesses,
        seen,
      ),
    );
  }
  seen.delete(stockId);
  return best;
}

/**
 * How thin the store is at the lowest rank (E5). One means comfortable, zero
 * means living hand to mouth — and the thinner it is, the more a risky process
 * costs, because undercovering rank 100 kills while overcovering brings nothing
 * back (E24).
 */
function survivalBuffer(
  state: GameState,
  index: ConfigIndex,
  sectorId: SectorId,
): number {
  const lowest = index.tiersByRank[0];
  const sector = state.sectors[sectorId];
  if (lowest === undefined || sector === undefined) return 1;
  const need = sector.heads * lowest.perHead;
  if (need <= 0) return 1;
  return Math.min(1, (sector.stocks[lowest.stock] ?? 0) / need);
}
