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
import { renewals, type Renewal } from "./phases.ts";
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




/**
 * The year the plan reckons with (E24) — not the one that happens.
 *
 * The plan is blind: nobody knows the draw before the harvest is in. What it
 * aims at is a year a little **worse** than the mean, by `risk.caution`, so that
 * an ordinary year leaves something over. That surplus is what a store is for,
 * and what a project finds waiting when it wants an intermediate nobody has
 * asked for yet.
 *
 * Expressed as a draw rather than as a margin, so the very same `shockFactor`
 * scales it by each thing's own exposure — a process and a need alike. Where
 * nothing varies, the caution costs nothing.
 */
function plannedYear(config: Config): Shocks {
  const caution = Math.max(0, Math.min(1, config.risk.caution));
  const year: Record<string, number> = {};
  for (const stream of Object.keys(config.shocks)) year[stream] = 1 - caution;
  return year;
}

/**
 * How much dearer a process is because what it takes has grown thin (E29).
 *
 * `catch = q · effort · stock` — the standard bioeconomic form — so effort per
 * unit caught runs inverse to what is left, and the same statement optimal
 * foraging makes as a falling encounter rate. It is what really saves a stock:
 * taking grows dear long before the last one is gone.
 *
 * A fish is still a fish, so this never touches how much of the quarry a unit
 * of output needs. It falls on the labour and the ground — the searching.
 */
function effortFactor(
  process: ProcessDef,
  index: ConfigIndex,
  standing: Readonly<Record<StockId, Renewal>>,
): number {
  let worst = 1;
  for (const id of Object.keys(process.intermediatesPerOutput)) {
    const rule = index.stock.get(id)?.regrowth;
    if (rule === undefined) continue;
    const renewal = standing[id];
    if (renewal === undefined || renewal.ceiling <= 0) continue;
    const share = Math.max(1e-6, renewal.held / renewal.ceiling);
    worst = Math.max(worst, Math.min(rule.maxEffort, 1 / share));
  }
  return worst;
}

/**
 * Puts in what the plan meant to put in. **The inputs are committed** — one has
 * sown, one has set out — so they are spent at the planned level whatever the
 * year turns out to be. What the year decides is the *output*, and that is
 * booked by the caller.
 */
function consume(
  process: ProcessDef,
  level: number,
  pools: Pools,
  effort: number,
  index: ConfigIndex,
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
  let labor = 0;

  for (const [capacity] of capacityEntries) {
    const pool = pools.amount[capacity];
    if (pool === undefined) continue;
    const used = level * effectiveCapacityPerOutput(process, capacity, quality) * effort;
    pool.available -= used;
    capacityUsed[capacity] = (capacityUsed[capacity] ?? 0) + used;
  }
  for (const [stockId, perOutput] of Object.entries(process.intermediatesPerOutput)) {
    // The quarry itself is not dearer when it is scarce — only the finding is.
    const scale = index.stock.get(stockId)?.regrowth === undefined ? effort : 1;
    const used = level * perOutput * scale;
    pools.stock[stockId] = (pools.stock[stockId] ?? 0) - used;
    consumed[stockId] = (consumed[stockId] ?? 0) + used;
    if (stockId === LABOR_STOCK) labor += used;
  }
  return labor;
}

/**
 * How much of a planned level the intermediates actually there can carry.
 *
 * Needed only because the plan is blind: a process upstream may have had a bad
 * year and delivered less than the plan counted on, and then the one downstream
 * cannot run at full level. The same partial pace that a project runs at when
 * one of its inputs is short (E18), one step earlier.
 */
function feasiblePace(
  process: ProcessDef,
  level: number,
  pools: Pools,
  effort: number,
  index: ConfigIndex,
): number {
  let pace = 1;
  for (const [stockId, perOutput] of Object.entries(process.intermediatesPerOutput)) {
    const scale = index.stock.get(stockId)?.regrowth === undefined ? effort : 1;
    const wanted = level * perOutput * scale;
    if (wanted <= 1e-12) continue;
    const have = pools.stock[stockId] ?? 0;
    if (have < wanted) pace = Math.min(pace, Math.max(0, have / wanted));
  }
  return pace;
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
  const plannedShocks = plannedYear(config);
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

  // The demand side of a shock (E24): a bad year asks for more, where a process
  // would deliver less. Same draw, opposite direction — and blind in the same
  // way: one heats for an average winter, and a hard one hurts. So the plan uses
  // the planned year and the coverage is reckoned against what the winter really
  // asked for.
  const perHead = (tier: NeedTierDef, year: Shocks): number => {
    const base = input.tierPerHead.get(tier.id) ?? tier.perHead;
    if (tier.exposure === undefined) return base;
    const factor = shockFactor({ exposure: tier.exposure }, year);
    return factor > 0 ? base / factor : base;
  };

  for (const tier of tierList) {
    const need = heads * perHead(tier, plannedShocks);
    const inStock = pools.stock[tier.stock] ?? 0;
    const taken = Math.min(need, Math.max(0, inStock));
    pools.stock[tier.stock] = inStock - taken;
    fromStock.set(tier.id, taken);
    if (need - taken > 1e-9) {
      demands.push({ tier, stock: tier.stock, amount: need - taken });
    }
  }

  // Putting something by (E19, E29). Not the whole gap up to the pits: left to
  // claim that, a store strips whatever is within reach to fill itself —
  // measured, the tick a hundred units of pit were finished the take from the
  // water went from 21 to 45 against a growth of 16, and the fishery was dead
  // three ticks later.
  //
  // So the deliberate part of saving is bounded twice. It is a rate out of what
  // is *used* of the good, and it only arises where the needs **of that good**
  // were met last tick — whether there was enough wood is no business of the
  // food store. Both look only backwards, so the plan still knows nothing of
  // the year ahead; the other half of saving needs no rule at all, since a good
  // year overshoots the blind plan by itself and the surplus stays in the stock.
  // The leading brake: nothing is laid in while the country is failing. The
  // backward-looking rule below only stops once a need has already broken, and
  // measured that was four ticks too late — the store went on claiming while
  // the fishery fell from 118 to 1.
  const standing = renewals(state, index);
  const countryFailing = Object.values(standing).some(
    (renewal) => renewal.ceiling > 0 && renewal.held / renewal.ceiling < config.saving.pauseBelow,
  );

  for (const stockDef of config.stocks) {
    if (countryFailing) break;
    const shelter = stockDef.protectedBy;
    if (shelter === undefined) continue;
    const capacity = pools.amount[shelter.capacity]?.available ?? 0;
    const gap = capacity - (pools.stock[stockDef.id] ?? 0);
    if (gap <= 1e-9) continue;

    const wants = tierList.filter((tier) => tier.stock === stockDef.id);
    const wentShort = wants.some((tier) => (state.lastCoverage[tier.id] ?? 1) < 0.999);
    if (wentShort) continue;
    let used = 0;
    for (const tier of wants) {
      used += heads * perHead(tier, plannedShocks) * tier.consumedOnUse;
    }
    const claim = Math.min(gap, config.saving.rate * used);
    if (claim <= 1e-9) continue;

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
      amount: claim,
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
    // **The plan reckons with an average year** (E24). It used to be handed the
    // real draw, which was clairvoyance: it then covered the same needs with
    // less labour in a good year instead of harvesting more, so no surplus could
    // ever arise — measured, wood, fibre and hides stood at exactly 0,00 for
    // sixty ticks together, the store had nothing to keep, and the setback of a
    // bad year came only from labour running out.
    //
    // One sows and the weather decides afterwards. The unexpected plenty of a
    // good year is the reason stores were invented, and it cannot exist where
    // nobody is ever surprised.
    //
    // Where the draw does land is on the **output**, and there it hits every
    // input alike: a failed harvest wastes the acres it grew on exactly as it
    // wastes the labour. Reaching only the labour used to *free* land in a bad
    // year — measured, use of the wilderness fell from 100 % to 67 % at a draw
    // of 0.66.
    shockFor: (process: ProcessDef) => shockFactor(process, plannedShocks),
    effortFor: (process: ProcessDef) => effortFactor(process, index, standing),
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
  let laborFreed = 0;

  // Producers before consumers: a house cannot be built from wood that is only
  // cut later in the loop, and nothing can be made from labour before the
  // people have worked. A pairwise comparison is not enough — with three
  // levels (labour, wood, house) it can order them wrongly — so this is a real
  // topological sort over "produces what another needs".
  const inDependencyOrder = topological([...plan.levels.keys()], index);

  for (const id of inDependencyOrder) {
    const target = plan.levels.get(id) ?? 0;
    const process = index.process.get(id);
    if (process === undefined || target <= 1e-12) continue;
    // What the plan actually commits: enough to reach its target even in the
    // year it cautiously reckons with. In an ordinary year that leaves a
    // surplus, which is the whole point (E24).
    const margin = shockFactor(process, plannedShocks);
    const planned = margin > 0 ? target / margin : target;
    // Cut back to what the inputs actually there allow — the plan was made
    // before the year was known, and the step above it may have fallen short.
    const effort = effortFactor(process, index, standing);
    const level = planned * feasiblePace(process, planned, pools, effort, index);
    // Labour the plan had earmarked for this process and that it did not take,
    // because the process could not run at the planned level. It is idle, not
    // set aside for anything — see the labour books below.
    laborFreed += (planned - level) * (process.intermediatesPerOutput[LABOR_STOCK] ?? 0);
    if (level <= 1e-12) continue;
    const labor = consume(process, level, pools, effort, index, capacityUsed, consumed);
    // And here the year has its say: the inputs went in as committed, the
    // harvest is what it is.
    const output = level * shockFactor(process, shocks);
    const stock = index.branch.get(process.branch)?.produces;
    if (stock !== undefined) {
      produced[stock] = (produced[stock] ?? 0) + output;
      // Available to whatever needs it as an input further down the loop.
      pools.stock[stock] = (pools.stock[stock] ?? 0) + output;
    }
    runs.push({ process: id, output, labor, share: 0 });
    totalOutput += output;
  }
  // The labour books, and they have to close: supply = processes + projects +
  // idle (E10 reads exactly these numbers).
  //
  // `laborFreed` is labour the plan had earmarked for a process that then could
  // not run at its planned level, because the one above it had a bad year. It
  // stands still rather than going anywhere, and it can only ever be as large
  // as what was set aside in the first place.
  const laborMade = produced[LABOR_STOCK] ?? 0;
  const laborUsed = consumed[LABOR_STOCK] ?? 0;
  const laborReserve = Math.max(0, laborMade - laborUsed);
  const laborStoodStill = Math.min(laborFreed, laborReserve);
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
    // What the year really asked for, against what the plan set aside for an
    // average one. A hard winter therefore shows up as a gap, not as extra work.
    const need = heads * perHead(tier, shocks);
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
    // What no process took is what the projects claimed — they hold the top
    // rank, so it is set aside for them. Counting that as idle said "labour
    // binds" and "1.8 free" in the same breath.
    laborToProjects: laborReserve - laborStoodStill,
    laborToProduction: laborUsed,
    // Clamped only against float noise: the labour process is capped by the
    // people, so it cannot really make more than the hands can perform.
    laborUnused: Math.max(0, laborAvailable - laborMade + laborStoodStill),
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
