import { allocate, type AllocationResult } from "./allocation.ts";
import { type ConfigIndex, tierEffectAt } from "./config.ts";
import type { AreaTypeId, ProjectId, StockId } from "./ids.ts";
import { HOUSEHOLDS, laborPerformance } from "./phases.ts";
import { peek } from "./random.ts";
import { areaOf, type Area, type GameState } from "./state.ts";
import {
  allHold,
  computeUnlocks,
  unmetConditions,
  type ConditionContext,
} from "./unlocks.ts";
import type { Condition } from "./config.ts";

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
  readonly laborUnused: number;

  readonly yearQuality: number;

  readonly stocks: Readonly<Record<StockId, number>>;
  readonly unownedAreas: Readonly<Record<AreaTypeId, Area>>;
  readonly ownedAreas: Readonly<Record<AreaTypeId, Area>>;
  /** Occupied over available, per area type — never above 1 (E5). */
  readonly utilization: Readonly<Record<AreaTypeId, number>>;
  /** Quality the next taking would bring (E13), shown before the click. */
  readonly nextTakingQuality: number;

  readonly coverage: Readonly<Record<string, number>>;
  readonly tiers: AllocationResult["tiers"];
  readonly runs: AllocationResult["runs"];
  readonly produced: Readonly<Record<StockId, number>>;

  readonly birthRate: number;
  readonly deathRate: number;
  /** Below the minimum viable size the settlement is given up (E20). */
  readonly settlementAbandoned: boolean;

  /** What stops the lowest uncovered tier — the check on E6. */
  readonly binding: AllocationResult["binding"];
  readonly bindingTier?: string;

  readonly projects: readonly ProjectView[];
  readonly branches: readonly string[];
  readonly processes: readonly string[];
  readonly rules: readonly string[];
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
  /** Named, not "locked" (E12). */
  readonly missing: readonly Condition[];
  /** What this project opens up, so the horizon is local and always present. */
  readonly unlocks: readonly string[];
}

export function derive(state: GameState, index: ConfigIndex): Derived {
  const unlocks = computeUnlocks(state, index);
  const sector = state.sectors[HOUSEHOLDS];
  const heads = sector?.heads ?? 0;
  const workAbility = sector?.workAbility ?? 0;
  const productivity = sector?.productivity ?? 0;

  const exponent = index.config.weather.exponent;
  const scale = (exponent + 1) / exponent;
  const yearQuality = Math.pow(peek(state.random, "weather"), 1 / exponent) * scale;

  const laborAvailable = laborPerformance(sector);
  const laborToProjects = plannedProjectLabor(state, index, laborAvailable);

  const allocation = allocate({
    state,
    index,
    sectorId: HOUSEHOLDS,
    yearQuality,
    laborToProjects,
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

  const utilization: Record<AreaTypeId, number> = {};
  for (const type of index.config.areaTypes) {
    const owned = sector ? areaOf(sector.areas, type.id) : { area: 0, quality: 1 };
    const total = owned.area + areaOf(state.unownedAreas, type.id).area;
    utilization[type.id] = total > 0 ? (allocation.areaUsed[type.id] ?? 0) / total : 0;
  }

  const ctx: ConditionContext = { state, index, unlocks, coverage, population: heads };

  const projects: ProjectView[] = index.config.projects.map((def) => {
    const active = state.activeProjects.find((p) => p.id === def.id);
    const done = state.completedProjects[def.id] ?? 0;
    // A finished one-off project is not available any more, and neither is one
    // already under way. Otherwise a strategy would keep reaching for it.
    const startable = active === undefined && (def.repeatable || done === 0);
    return {
      id: def.id,
      visible: allHold(def.visibleWhen, ctx),
      available: startable && allHold(def.availableWhen, ctx),
      running: active !== undefined,
      paused: active?.paused ?? false,
      progress: active?.progress ?? 0,
      ...(active === undefined ? {} : { order: active.order }),
      completed: state.completedProjects[def.id] ?? 0,
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
    laborPerformance: laborAvailable,
    laborToProjects,
    laborUnused: allocation.laborUnused,
    yearQuality,
    stocks: sector?.stocks ?? {},
    unownedAreas: state.unownedAreas,
    ownedAreas: sector?.areas ?? {},
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
    settlementAbandoned: heads < index.config.population.minimumViableSize,
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

/** What the running projects would draw this tick, in project order (E18). */
function plannedProjectLabor(
  state: GameState,
  index: ConfigIndex,
  laborAvailable: number,
): number {
  const sector = state.sectors[HOUSEHOLDS];
  const stocks = { ...(sector?.stocks ?? {}) };
  let left = laborAvailable;
  let used = 0;

  for (const active of [...state.activeProjects].sort((a, b) => a.order - b.order)) {
    if (active.paused) continue;
    const def = index.project.get(active.id);
    if (def === undefined) continue;
    const step = 1 / def.minTicks;
    const labor = def.laborCost * step;
    const affordable =
      labor <= left + 1e-12 &&
      Object.entries(def.stockCost).every(
        ([id, total]) => total * step <= (stocks[id] ?? 0) + 1e-12,
      );
    if (!affordable) continue;
    left -= labor;
    used += labor;
    for (const [id, total] of Object.entries(def.stockCost)) {
      stocks[id] = (stocks[id] ?? 0) - total * step;
    }
  }
  return used;
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
      return `area:${String(effect["areaType"])}${
        Number(effect["amount"]) >= 0 ? "+" : ""
      }${String(effect["amount"])}`;
    default:
      return effect.type;
  }
}
