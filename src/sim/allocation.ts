import { type Config, type ConfigIndex, type ProcessDef } from "./config.ts";
import type { AreaTypeId, BranchId, ProcessId, SectorId, StockId } from "./ids.ts";
import {
  ORDERING_RESOLVER,
  type OrderingContext,
  type OrderingReason,
} from "./ordering.ts";
/**
 * Labour is an ordinary stock: made every tick out of the capacity "people",
 * gone by the next one. This name is the one place the engine still says the
 * word — the ordering below asks for the content of *this* stock, and that is
 * exactly the choice still to be settled.
 */
const LABOR_STOCK: StockId = "labor";

/** Above every need: projects are financed before the ranking starts (E18). */
const PROJECT_RANK = -1;

import {
  makePlan,
  stockInput,
  type Demand,
  type Plan,
  type PlanContext,
} from "./plan.ts";
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
  /**
   * What each capacity offered this tick. Reported rather than recomputed
   * elsewhere: a capacity need not be land held in the state — the people are
   * one, and they are derived from the heads. Deriving it a second time made
   * the utilisation of the people read zero while they were fully at work.
   */
  readonly areaTotal: Readonly<Record<AreaTypeId, number>>;

  /** The lowest tier that is not fully covered, and what stopped it (E6). */
  readonly binding: Binding;
  readonly bindingTier?: NeedTierId;

  /** Which process led per branch, and why (E5). */
  readonly leadProcess: Readonly<Record<BranchId, ProcessId>>;
  readonly orderingReason: Readonly<Record<BranchId, OrderingReason>>;
}

type NeedTierId = string;

interface Pools {
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
    if (type.fromPopulation === true) {
      // People are a capacity, and their quality is what one of them can do.
      pools[type.id] = {
        available: sector?.heads ?? 0,
        quality: (sector?.workAbility ?? 0) * (sector?.productivity ?? 0),
      };
      continue;
    }
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
  // The shock reaches the labour only — see the note where `shockFor` is set.
  const shock = shockFactor(process, shocks);
  const laborScale = shock > 0 ? 1 / shock : 0;
  let labor = 0;

  for (const [areaType] of areaEntries) {
    const pool = pools.area[areaType];
    if (pool === undefined) continue;
    const used = output * effectiveAreaPerOutput(process, areaType, quality);
    pool.available -= used;
    areaUsed[areaType] = (areaUsed[areaType] ?? 0) + used;
  }
  for (const [stockId, perOutput] of Object.entries(process.intermediatesPerOutput)) {
    const used = output * perOutput * (stockId === LABOR_STOCK ? laborScale : 1);
    pools.stock[stockId] = (pools.stock[stockId] ?? 0) - used;
    consumed[stockId] = (consumed[stockId] ?? 0) + used;
    if (stockId === LABOR_STOCK) labor += used;
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

  const pools: Pools = {
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
      yieldPerLabor: (process: ProcessDef) => yieldPerLabor(process, index, pools, shocks, input),
    };
    const resolved = ORDERING_RESOLVER.resolve(branch, orderCtx, input.manualAllowed);
    ordering.set(branch.id, resolved.processes);
    orderingReason.set(branch.id, resolved.reason);
    const first = resolved.processes[0];
    if (first !== undefined) leadProcess.set(branch.id, first.id);
  }

  // Projects claim first (E18: the player may starve the needs to build). That
  // is a **rank**, not a phase of its own: a project is a consumer of labour
  // and stocks like any other, it just stands above every need.
  const demands: Demand[] = [];
  for (const active of state.activeProjects) {
    if (active.paused) continue;
    const def = index.project.get(active.id);
    if (def === undefined) continue;
    const step = 1 / def.minTicks;
    const costs: Record<StockId, number> = {
      [LABOR_STOCK]: def.laborCost * step,
      ...Object.fromEntries(
        Object.entries(def.stockCost).map(([id, total]) => [id, total * step]),
      ),
    };
    for (const [stockId, amount] of Object.entries(costs)) {
      if (amount <= 0) continue;
      demands.push({
        tier: {
          id: `project:${def.id}:${stockId}`,
          rank: PROJECT_RANK,
          stock: stockId,
          branch: index.config.branches.find((b) => b.produces === stockId)?.id ?? "",
          perHead: 0,
          consumedOnUse: 1,
        },
        stock: stockId,
        amount,
      });
    }
  }

  // Ranks eat from the store first, lowest rank first (E9). What is left over
  // is the demand the plan has to cover.
  const consumed: Record<StockId, number> = {};
  const fromStock = new Map<string, number>();
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
      areas: Object.fromEntries(
        Object.entries(pools.area).map(([id, pool]) => [
          id,
          { area: pool.available, quality: pool.quality },
        ]),
      ),
      stocks: { ...pools.stock },
    },
    available: availableProcesses,
    // Where a shock lands (E24/E25 — risk as named random streams): today only
    // on the labour a process needs, exactly as before labour became an
    // ordinary stock. That a shock reaches one input and not another is a
    // property of the exposure, and the exposure is declared per process, not
    // per input — so this is the single place that decides, and the only place
    // to change once that is settled.
    shockFor: (process: ProcessDef, input: string) =>
      input === stockInput(LABOR_STOCK) ? shockFactor(process, shocks) : 1,
    order: (stock, processes) => {
      const branch = config.branches.find((b) => b.produces === stock);
      const wanted = branch === undefined ? undefined : ordering.get(branch.id);
      if (wanted === undefined) return processes;
      // A set, not a nested scan: this used to be quadratic in the number of
      // processes, which is the one thing that must not be when many of them
      // arrive.
      const allowed = new Set(processes.map((p) => p.id));
      return wanted.filter((process) => allowed.has(process.id));
    },
  };

  const plan = makePlan(demands, planCtx);

  // Carry the plan out: consume inputs, book output.
  const produced: Record<StockId, number> = {};
  const areaUsed: Record<AreaTypeId, number> = {};
  const runs: ProcessRun[] = [];
  let totalOutput = 0;

  // Producers before consumers: a house cannot be built from wood that is only
  // cut later in the loop, and nothing can be made from labour before the
  // people have worked. A pairwise comparison is not enough — with three
  // levels (labour, wood, house) it can order them wrongly — so this is a real
  // topological sort over "produces what another needs".
  const inDependencyOrder = topological([...plan.levels.keys()], index);

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
    laborToProduction: consumed[LABOR_STOCK] ?? 0,
    laborUnused: Math.max(0, laborAvailable - (consumed[LABOR_STOCK] ?? 0)),
    tiers,
    produced,
    consumed,
    runs: withShares,
    areaUsed,
    areaTotal: Object.fromEntries(
      Object.entries(poolAreas(state, sectorId, config)).map(([id, pool]) => [
        id,
        pool.available,
      ]),
    ),
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
  const content = contentOf(
    LABOR_STOCK,
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
 * Orders processes so that everything a process needs has been made before it
 * runs. A pairwise comparison is not enough: with three levels — labour, wood,
 * house — it can order them wrongly.
 */
function topological(ids: readonly ProcessId[], index: ConfigIndex): readonly ProcessId[] {
  const needs = new Map<ProcessId, Set<ProcessId>>();
  for (const id of ids) {
    const process = index.process.get(id);
    const set = new Set<ProcessId>();
    if (process !== undefined) {
      for (const [stockId, per] of Object.entries(process.intermediatesPerOutput)) {
        if (per <= 0) continue;
        for (const other of ids) {
          const maker = index.process.get(other);
          if (maker === undefined || other === id) continue;
          if (index.branch.get(maker.branch)?.produces === stockId) set.add(other);
        }
      }
    }
    needs.set(id, set);
  }

  const done = new Set<ProcessId>();
  const order: ProcessId[] = [];
  while (order.length < ids.length) {
    const ready = ids.filter(
      (id) => !done.has(id) && [...(needs.get(id) ?? [])].every((n) => done.has(n)),
    );
    // Nothing ready means a cycle: take the rest as they come.
    const batch = ready.length > 0 ? ready : ids.filter((id) => !done.has(id));
    for (const id of batch) {
      done.add(id);
      order.push(id);
    }
  }
  return order;
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
function contentOf(
  target: StockId,
  process: ProcessDef,
  index: ConfigIndex,
  pools: Pools,
  shocks: Shocks,
  unlockedBranches: ReadonlySet<string>,
  unlockedProcesses: ReadonlySet<ProcessId>,
  seen: Set<StockId>,
): number {
  const shock = shockFactor(process, shocks);
  let total = 0;
  for (const [needed, per] of Object.entries(process.intermediatesPerOutput)) {
    if (per <= 0) continue;
    const scaled = needed === LABOR_STOCK ? per / (shock > 0 ? shock : Infinity) : per;
    total +=
      scaled *
      stockContent(
        target,
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
function stockContent(
  target: StockId,
  stockId: StockId,
  index: ConfigIndex,
  pools: Pools,
  shocks: Shocks,
  unlockedBranches: ReadonlySet<string>,
  unlockedProcesses: ReadonlySet<ProcessId>,
  seen: Set<StockId>,
): number {
  // One unit of the thing we are measuring contains exactly one of itself.
  if (stockId === target) return 1;
  if (seen.has(stockId)) return Infinity;
  const branch = index.config.branches.find((b) => b.produces === stockId);
  if (branch === undefined || !unlockedBranches.has(branch.id)) return Infinity;

  seen.add(stockId);
  let best = Infinity;
  for (const process of index.processesOfBranch.get(branch.id) ?? []) {
    if (!unlockedProcesses.has(process.id)) continue;
    best = Math.min(
      best,
      contentOf(
        target,
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
