import {
  type Config,
  type ConfigIndex,
  type NeedTierDef,
  type ProcessDef,
} from "./config.ts";
import type { CapacityId, BranchId, ProcessId, SectorId, StockId } from "./ids.ts";
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


/** After every need: a store is filled from what is left over, never before. */
const STORE_RANK = Number.MAX_SAFE_INTEGER;

import {
  makePlan,
  type Demand,
  type Plan,
  type PlanContext,
} from "./plan.ts";
import { shockFactor, type Shocks } from "./risk.ts";
import { capacityOf, type GameState } from "./state.ts";

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

/**
 * Why a tier could not be covered further.
 *
 * Two kinds, because the model knows two kinds of input (E4): capacity, which
 * is occupied and given back, and a stock, which is used up. Labour used to be
 * a third and is not any more — a shortage of hands shows up as the capacity
 * "people" running out, like any other.
 */
export type BindingKind = "capacity" | "stock" | "none";

export interface Binding {
  readonly kind: BindingKind;
  /** Which capacity or stock ran out. */
  readonly what?: CapacityId | StockId;
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
  readonly capacityUsed: Readonly<Record<CapacityId, number>>;
  /**
   * What each capacity offered this tick. Reported rather than recomputed
   * elsewhere: a capacity need not be land held in the state — the people are
   * one, and they are derived from the heads. Deriving it a second time made
   * the utilisation of the people read zero while they were fully at work.
   */
  readonly capacityTotal: Readonly<Record<CapacityId, number>>;

  /** The lowest tier that is not fully covered, and what stopped it (E6). */
  readonly binding: Binding;
  readonly bindingTier?: NeedTierId;

  /** Which process led per branch, and why (E5). */
  readonly leadProcess: Readonly<Record<BranchId, ProcessId>>;
  readonly orderingReason: Readonly<Record<BranchId, OrderingReason>>;
}

type NeedTierId = string;

interface Pools {
  amount: Record<CapacityId, { available: number; quality: number }>;
  stock: Record<StockId, number>;
}

/** Land of one type, pooled over the sector's own holdings and unowned land. */
function poolCapacities(
  state: GameState,
  sectorId: SectorId,
  config: Config,
): Record<CapacityId, { available: number; quality: number }> {
  const sector = state.sectors[sectorId];
  const pools: Record<CapacityId, { available: number; quality: number }> = {};
  for (const type of config.capacities) {
    if (type.fromPopulation === true) {
      // People are a capacity, and their quality is what one of them can do.
      pools[type.id] = {
        available: sector?.heads ?? 0,
        quality: (sector?.workAbility ?? 0) * (sector?.productivity ?? 0),
      };
      continue;
    }
    const owned = sector ? capacityOf(sector.capacityHeld, type.id) : { amount: 0, quality: 1 };
    const unowned = capacityOf(state.unownedCapacity, type.id);
    const total = owned.amount + unowned.amount;
    const quality =
      total > 0
        ? (owned.amount * owned.quality + unowned.amount * unowned.quality) / total
        : 1;
    pools[type.id] = { available: total, quality };
  }
  return pools;
}

/**
 * Land quality works on the **area**, not on the labour: E13 puts it as
 * `yield = area × quality × process yield`. Poor ground means more ground
 * for the same harvest — that is Ricardo's differential rent, and it is what
 * makes the fixed factor bite.
 */
function effectiveCapacityPerOutput(
  process: ProcessDef,
  capacity: CapacityId,
  quality: number,
): number {
  const base = process.capacityPerOutput[capacity] ?? 0;
  const factor = 1 - process.qualityWeight + process.qualityWeight * quality;
  return factor > 0 ? base / factor : Infinity;
}




function consume(
  process: ProcessDef,
  output: number,
  pools: Pools,
  shocks: Shocks,
  capacityUsed: Record<CapacityId, number>,
  consumed: Record<StockId, number>,
): number {
  const capacityEntries = Object.entries(process.capacityPerOutput);
  const quality =
    capacityEntries.length > 0
      ? capacityEntries[0]
        ? (pools.amount[capacityEntries[0][0]]?.quality ?? 1)
        : 1
      : 1;
  // A shock cuts the output, so every input costs more per unit of what came of
  // it — see the note where `shockFor` is set.
  const shock = shockFactor(process, shocks);
  const scale = shock > 0 ? 1 / shock : 0;
  let labor = 0;

  for (const [capacity] of capacityEntries) {
    const pool = pools.amount[capacity];
    if (pool === undefined) continue;
    const used = output * effectiveCapacityPerOutput(process, capacity, quality) * scale;
    pool.available -= used;
    capacityUsed[capacity] = (capacityUsed[capacity] ?? 0) + used;
  }
  for (const [stockId, perOutput] of Object.entries(process.intermediatesPerOutput)) {
    const used = output * perOutput * scale;
    pools.stock[stockId] = (pools.stock[stockId] ?? 0) - used;
    consumed[stockId] = (consumed[stockId] ?? 0) + used;
    if (stockId === LABOR_STOCK) labor += used;
  }
  return labor;
}



export interface AllocationInput {
  readonly state: GameState;
  readonly index: ConfigIndex;
  readonly sectorId: SectorId;
  readonly shocks: Shocks;
  readonly unlockedBranches: ReadonlySet<string>;
  /** Per-head cost of a need where a project changed it (E9, E23). */
  readonly tierPerHead: ReadonlyMap<string, number>;
  readonly unlockedProcesses: ReadonlySet<ProcessId>;
}

export function allocate(input: AllocationInput): AllocationResult {
  const { state, index, sectorId, shocks } = input;
  const config = index.config;
  const sector = state.sectors[sectorId];

  const heads = sector?.heads ?? 0;
  const laborAvailable = heads * (sector?.workAbility ?? 0) * (sector?.productivity ?? 0);

  const pools: Pools = {
    amount: poolCapacities(state, sectorId, config),
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
      quality: (capacity: string) => pools.amount[capacity]?.quality ?? 1,
    };
    const resolved = ORDERING_RESOLVER.resolve(branch, orderCtx);
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
          rank: active.rank,
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

  const perHead = (tier: NeedTierDef): number => {
    const base = input.tierPerHead.get(tier.id) ?? tier.perHead;
    if (tier.exposure === undefined) return base;
    // The demand side of a shock (E24): a bad year asks for more, where a
    // process would deliver less. Same draw, opposite direction.
    const factor = shockFactor({ exposure: tier.exposure }, shocks);
    return factor > 0 ? base / factor : base;
  };

  for (const tier of tierList) {
    const need = heads * perHead(tier);
    const inStock = pools.stock[tier.stock] ?? 0;
    const taken = Math.min(need, Math.max(0, inStock));
    pools.stock[tier.stock] = inStock - taken;
    fromStock.set(tier.id, taken);
    if (need - taken > 1e-9) {
      demands.push({ tier, stock: tier.stock, amount: need - taken });
    }
  }

  // Filling the store (E19: a store is capacity that lowers decay for what it
  // covers). The claim is exactly the gap up to that capacity: gathering more
  // than the pits protect would spoil at once and be wasted effort. So the
  // size of the claim comes from what the player built, not from a number in
  // the content and not from a setting — and it stands last, so it is served
  // only from what the needs leave behind.
  for (const stockDef of config.stocks) {
    const shelter = stockDef.protectedBy;
    if (shelter === undefined) continue;
    const capacity = pools.amount[shelter.capacity]?.available ?? 0;
    const gap = capacity - (pools.stock[stockDef.id] ?? 0);
    if (gap <= 1e-9) continue;
    demands.push({
      tier: {
        id: `store:${stockDef.id}`,
        rank: STORE_RANK,
        stock: stockDef.id,
        branch: config.branches.find((b) => b.produces === stockDef.id)?.id ?? "",
        perHead: 0,
        consumedOnUse: 0,
      },
      stock: stockDef.id,
      amount: gap,
    });
  }

  const planCtx: PlanContext = {
    index,
    supplies: {
      capacityHeld: Object.fromEntries(
        Object.entries(pools.amount).map(([id, pool]) => [
          id,
          { amount: pool.available, quality: pool.quality },
        ]),
      ),
      stocks: { ...pools.stock },
    },
    available: availableProcesses,
    // Where a shock lands (E24/E25 — risk as named random streams): on the
    // **output**, so every input costs more per unit of what came of it. A
    // failed harvest wastes the acres it grew on exactly as it wastes the
    // labour; reaching only the labour used to *free* land in a bad year —
    // measured, use of the wilderness fell from 100 % to 67 % at a draw of 0.66.
    //
    // No input is singled out, which is also one special case fewer: exposure
    // is declared per process, and a process either had a bad year or it did
    // not.
    shockFor: (process: ProcessDef) => shockFactor(process, shocks),
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
  const capacityUsed: Record<CapacityId, number> = {};
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
    const labor = consume(process, level, pools, shocks, capacityUsed, consumed);
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
    const need = heads * perHead(tier);
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
    // The books have to balance: supply = processes + projects + idle. What
    // the plan made is what it meant to use; the part no process consumed is
    // what the projects claimed (they hold the top rank, so it is set aside for
    // them). Counting that as idle said "labour binds" and "1.8 free" in the
    // same breath — and E10's criterion reads exactly this number.
    laborToProjects: Math.max(0, (produced[LABOR_STOCK] ?? 0) - (consumed[LABOR_STOCK] ?? 0)),
    laborToProduction: consumed[LABOR_STOCK] ?? 0,
    laborUnused: Math.max(0, laborAvailable - (produced[LABOR_STOCK] ?? 0)),
    tiers,
    produced,
    consumed,
    runs: withShares,
    capacityUsed,
    capacityTotal: Object.fromEntries(
      Object.entries(poolCapacities(state, sectorId, config)).map(([id, pool]) => [
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
  if (worst.startsWith("capacity:")) {
    return { kind: "capacity", what: worst.slice("capacity:".length) };
  }
  return { kind: "stock", what: worst.slice("stock:".length) };
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
