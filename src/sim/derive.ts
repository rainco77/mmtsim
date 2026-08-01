import { allocate, type AllocationResult } from "./allocation.ts";
import { type ConfigIndex, tierEffectAt } from "./config.ts";
import type { CapacityId, ProjectId, StockId } from "./ids.ts";
import { decayed, HOUSEHOLDS } from "./phases.ts";
import { peek } from "./random.ts";
import { type Capacity, type GameState } from "./state.ts";
import {
  allHold,
  computeUnlocks,
  unmetConditions,
  type ConditionContext,
  type Unmet,
} from "./unlocks.ts";
import type { OrderingReason } from "./ordering.ts";

/**
 * Everything derivable, as data (T4).
 *
 * Derived quantities are stored nowhere (E22) — without this function they
 * would be out of reach for anyone, the interface included. In particular the
 * binding input: allocation leaves only its results behind, so which input ran
 * out is gone afterwards.
 *
 * It describes the situation as it stands *and what the coming tick would make
 * of it*: the weather is peeked at, not drawn, so nothing advances.
 */
export interface Derived {
  readonly tick: number;

  readonly heads: number;
  readonly workAbility: number;
  readonly productivity: number;
  /** heads × workAbility (E16). */
  readonly laborVolume: number;
  /** laborVolume × productivity — the quantity that is allocated (E16). */
  readonly laborPerformance: number;
  readonly laborToProjects: number;
  /** What the processes consumed. */
  readonly laborToProduction: number;
  readonly laborUnused: number;

  /** The peeked shock per stream — mean 1, below 1 is a bad draw (E24). */
  readonly shocks: Readonly<Record<string, number>>;
  /** Ordering per branch with the reason it holds, so a switch is never silent. */
  readonly ordering: readonly BranchOrdering[];

  readonly stocks: Readonly<Record<StockId, number>>;
  readonly unownedCapacity: Readonly<Record<CapacityId, Capacity>>;
  readonly ownedCapacity: Readonly<Record<CapacityId, Capacity>>;
  /**
   * What each capacity offered this tick, whatever its source — held land as
   * well as the people, who are a capacity derived from the heads (E4). Only
   * the allocation sees all of them, so it reports them rather than having them
   * derived a second time somewhere else.
   */
  readonly capacityTotal: Readonly<Record<CapacityId, number>>;
  /** Occupied over available, per capacity — never above 1 (E5). */
  readonly utilization: Readonly<Record<CapacityId, number>>;
  /** Quality the next taking would bring (E13), shown before the click. */
  readonly nextTakingQuality: number;

  readonly coverage: Readonly<Record<string, number>>;
  readonly tiers: AllocationResult["tiers"];
  readonly runs: AllocationResult["runs"];
  readonly produced: Readonly<Record<StockId, number>>;

  readonly birthRate: number;
  readonly deathRate: number;
  /** The settlement was given up and the run is over (E20). */
  readonly settlementAbandoned: boolean;
  /** The tick it happened at; absent while it is still going. */
  readonly abandonedAt?: number;

  /** What stops the lowest uncovered tier — the check on E6. */
  readonly binding: AllocationResult["binding"];
  readonly bindingTier?: string;

  readonly projects: readonly ProjectView[];
  readonly branches: readonly string[];
  readonly processes: readonly string[];
  readonly rules: readonly string[];
}

/** Why this branch runs what it runs (E5) — data, never text (T6). */
export interface BranchOrdering {
  readonly branch: string;
  readonly reason: OrderingReason;
  readonly processes: readonly string[];
  readonly lead?: string;
}

export interface ProjectView {
  readonly id: ProjectId;
  readonly visible: boolean;
  readonly available: boolean;
  readonly running: boolean;
  readonly paused: boolean;
  readonly progress: number;
  readonly order?: number;
  readonly completed: number;
  /** How often it may be run at all; absent means without limit (E12). */
  readonly limit?: number;
  /** Named, not "locked" (E12). */
  readonly missing: readonly Unmet[];
  /** What this project opens up, so the horizon is local and always present. */
  readonly unlocks: readonly string[];
}

export function derive(state: GameState, index: ConfigIndex): Derived {
  const unlocks = computeUnlocks(state, index);
  const sector = state.sectors[HOUSEHOLDS];
  const heads = sector?.heads ?? 0;
  const workAbility = sector?.workAbility ?? 0;
  const productivity = sector?.productivity ?? 0;

  // Peeked, not drawn: describing the situation must not advance anything.
  const shocks: Record<string, number> = {};
  for (const [stream, shape] of Object.entries(index.config.shocks)) {
    const scale = (shape.exponent + 1) / shape.exponent;
    shocks[stream] = Math.pow(peek(state.random, stream), 1 / shape.exponent) * scale;
  }

  // The allocation reckons on what the coming tick will actually have: decay is
  // its first step (E19), and `derive` is asked before it has run. The view
  // below keeps reporting the raw holdings — those are the fact — but planning
  // on them would hand the economy inputs the tick never sees.
  const afterDecay = decayed(state, index, unlocks);

  const allocation = allocate({
    state: afterDecay,
    index,
    sectorId: HOUSEHOLDS,
    shocks,
    tierPerHead: unlocks.tierPerHead,
    unlockedBranches: unlocks.branches,
    unlockedProcesses: unlocks.processes,
  });

  const coverage: Record<string, number> = {};
  for (const outcome of allocation.tiers) coverage[outcome.tier] = outcome.coverage;

  let birthRate = index.config.population.baseBirthRate;
  let deathRate = index.config.population.baseDeathRate;
  for (const outcome of allocation.tiers) {
    const tier = index.tier.get(outcome.tier);
    if (tier === undefined) continue;
    birthRate += tierEffectAt(tier.birthRate, outcome.coverage);
    deathRate += tierEffectAt(tier.deathRate, outcome.coverage);
  }

  const utilization: Record<CapacityId, number> = {};
  for (const type of index.config.capacities) {
    const total = allocation.capacityTotal[type.id] ?? 0;
    utilization[type.id] = total > 0 ? (allocation.capacityUsed[type.id] ?? 0) / total : 0;
  }

  const ctx: ConditionContext = { state, index, unlocks, coverage, population: heads };

  const projects: ProjectView[] = index.config.projects.map((def) => {
    const active = state.activeProjects.find((p) => p.id === def.id);
    const done = state.completedProjects[def.id] ?? 0;
    // A finished one-off project is not available any more, and neither is one
    // already under way. Otherwise a strategy would keep reaching for it.
    const startable = active === undefined && (def.limit === undefined || done < def.limit);
    return {
      id: def.id,
      visible: allHold(def.visibleWhen, ctx),
      available: startable && allHold(def.availableWhen, ctx),
      running: active !== undefined,
      paused: active?.paused ?? false,
      progress: active?.progress ?? 0,
      ...(active === undefined ? {} : { order: active.order }),
      completed: state.completedProjects[def.id] ?? 0,
      ...(def.limit === undefined ? {} : { limit: def.limit }),
      missing: unmetConditions(def.availableWhen, ctx),
      unlocks: def.effects.map(describeEffect),
    };
  });

  return {
    tick: state.tick,
    heads,
    workAbility,
    productivity,
    laborVolume: heads * workAbility,
    laborPerformance: allocation.laborAvailable,
    laborToProjects: allocation.laborToProjects,
    laborToProduction: allocation.laborToProduction,
    laborUnused: allocation.laborUnused,
    shocks,
    ordering: [...Object.entries(allocation.orderingReason)].map(([branch, reason]) => {
      const lead = allocation.leadProcess[branch];
      return {
        branch,
        reason,
        processes: allocation.runs
          .filter((run) => index.process.get(run.process)?.branch === branch)
          .map((run) => run.process),
        ...(lead === undefined ? {} : { lead }),
      };
    }),
    stocks: sector?.stocks ?? {},
    unownedCapacity: state.unownedCapacity,
    ownedCapacity: sector?.capacityHeld ?? {},
    capacityTotal: allocation.capacityTotal,
    utilization,
    nextTakingQuality:
      index.config.land.baseQuality *
      Math.pow(1 - index.config.land.qualityDecayPerTaking, state.landTakings),
    coverage,
    tiers: allocation.tiers,
    runs: allocation.runs,
    produced: allocation.produced,
    birthRate,
    deathRate,
    settlementAbandoned: state.abandonedAt !== undefined,
    ...(state.abandonedAt === undefined ? {} : { abandonedAt: state.abandonedAt }),
    binding: allocation.binding,
    ...(allocation.bindingTier === undefined
      ? {}
      : { bindingTier: allocation.bindingTier }),
    projects,
    branches: [...unlocks.branches],
    processes: [...unlocks.processes],
    rules: [...unlocks.rules],
  };
}


function describeEffect(effect: { type: string } & Record<string, unknown>): string {
  switch (effect.type) {
    case "branch":
      return `branch:${String(effect["id"])}`;
    case "process":
      return `process:${String(effect["id"])}`;
    case "rule":
      return `rule:${String(effect["id"])}=${String(effect["set"])}`;
    case "capacity":
      return `capacity:${String(effect["capacity"])}${
        Number(effect["amount"]) >= 0 ? "+" : ""
      }${String(effect["amount"])}`;
    default:
      return effect.type;
  }
}
