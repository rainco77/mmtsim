import type { Condition, ConfigIndex } from "./config.ts";
import type { ActivityId, CapacityId, StockId } from "./ids.ts";

type StrainMeasure =
  | { readonly labourPerHead: ActivityId }
  | { readonly searchCost: StockId }
  | { readonly utilisation: CapacityId };
import type { BranchId, ProcessId, RuleId } from "./ids.ts";
import { capacityOf, completedCount, type GameState } from "./state.ts";

/**
 * What is unlocked follows from the finished projects (E23). Nothing of this is
 * stored: an epoch is a derived name, and so is every rule.
 */
export interface Unlocks {
  readonly branches: ReadonlySet<BranchId>;
  readonly processes: ReadonlySet<ProcessId>;
  readonly rules: ReadonlySet<RuleId>;
  /**
   * What one unit of a need costs per head, where a project changed it.
   * Derived like everything else here, never stored (E22): it follows from the
   * finished projects, so it cannot drift from them. The lowest value wins —
   * a technique that gets more out of the same grain is not undone by a later
   * one that gets less.
   */
  readonly tierPerHead: ReadonlyMap<string, number>;
}

export function computeUnlocks(state: GameState, index: ConfigIndex): Unlocks {
  const branches = new Set<BranchId>();
  const processes = new Set<ProcessId>();
  const setRules = new Set<RuleId>();
  const unsetRules = new Set<RuleId>();
  const tierPerHead = new Map<string, number>();

  for (const branch of index.config.branches) {
    if (branch.unlockedFromStart) branches.add(branch.id);
  }
  for (const process of index.config.processes) {
    if (process.unlockedFromStart) processes.add(process.id);
  }

  for (const project of index.config.projects) {
    if (completedCount(state, project.id) === 0) continue;
    for (const effect of project.effects) {
      switch (effect.type) {
        case "branch":
          branches.add(effect.id);
          break;
        case "process":
          processes.add(effect.id);
          break;
        case "rule":
          // Order independent by construction: an unset anywhere wins. A rule
          // that switches a lever off is always set by a later institution
          // (E23), so no ordering is needed and none can drift.
          if (effect.set) setRules.add(effect.id);
          else unsetRules.add(effect.id);
          break;
        case "tier": {
          const known = tierPerHead.get(effect.id);
          if (known === undefined || effect.perHead < known) {
            tierPerHead.set(effect.id, effect.perHead);
          }
          break;
        }
        case "capacity":
          break;
      }
    }
  }

  const rules = new Set<RuleId>();
  // Rules that hold before any project has been finished (E23); a later project
  // may still switch them off.
  for (const rule of index.config.rulesFromStart) setRules.add(rule);
  for (const rule of setRules) if (!unsetRules.has(rule)) rules.add(rule);

  return { branches, processes, rules, tierPerHead };
}

export interface ConditionContext {
  readonly state: GameState;
  readonly index: ConfigIndex;
  readonly unlocks: Unlocks;
  /** Coverage per tier from the previous tick's outcome. */
  readonly coverage: Readonly<Record<string, number>>;
  readonly population: number;
  /** What the strain measures read on fresh country — see `fresh.ts`. */
  readonly fresh: Readonly<Record<string, number>>;
}

export function conditionHolds(condition: Condition, ctx: ConditionContext): boolean {
  switch (condition.kind) {
    case "population":
      return ctx.population >= condition.min;
    case "projectDone":
      return completedCount(ctx.state, condition.id) >= condition.min;
    case "rule":
      return ctx.unlocks.rules.has(condition.id) === condition.set;
    case "unownedCapacity":
      return capacityOf(ctx.state.unownedCapacity, condition.capacity).amount >= condition.min;
    case "coverage":
      return (ctx.coverage[condition.tier] ?? 0) >= condition.min;
    case "ownedCapacity": {
      let held = 0;
      for (const sector of Object.values(ctx.state.sectors)) {
        held += capacityOf(sector?.capacityHeld ?? {}, condition.capacity).amount;
      }
      return held >= condition.min;
    }
    case "capacityPerHead": {
      if (ctx.population <= 0) return false;
      let built = 0;
      for (const sector of Object.values(ctx.state.sectors)) {
        built += capacityOf(sector?.capacityHeld ?? {}, condition.capacity).amount;
      }
      return built / ctx.population >= condition.min;
    }
    case "stockPerHead": {
      if (ctx.population <= 0) return false;
      // Over every sector: what the economy holds, not what one holder does.
      let held = 0;
      for (const sector of Object.values(ctx.state.sectors)) {
        held += sector?.stocks[condition.stock] ?? 0;
      }
      return held / ctx.population >= condition.min;
    }
    case "experience":
      return practised(ctx, condition.activities) >= condition.min;
    case "stockDear":
      return dearest(ctx, condition.stock) >= condition.factor;
    case "strain":
      return strainOf(ctx, condition.measure) >= markOf(ctx, condition);
  }
}

/** What the measure stands at now — read out of what the allocation wrote. */
function strainOf(ctx: ConditionContext, measure: StrainMeasure): number {
  if ("labourPerHead" in measure) {
    return ctx.state.lastLabourPerHead[measure.labourPerHead] ?? 0;
  }
  if ("searchCost" in measure) return Math.max(1, ctx.state.lastEffort[measure.searchCost] ?? 1);
  return ctx.state.lastUtilisation[measure.utilisation] ?? 0;
}

/** The mark: the factor against what the same measure reads on a fresh range. */
function markOf(
  ctx: ConditionContext,
  condition: { readonly measure: StrainMeasure; readonly factor: number },
): number {
  if ("utilisation" in condition.measure) return condition.factor;
  const reference = ctx.fresh[keyOf(condition.measure)] ?? 1;
  return reference * condition.factor;
}

function keyOf(measure: StrainMeasure): string {
  if ("labourPerHead" in measure) return `labour:${measure.labourPerHead}`;
  if ("searchCost" in measure) return `search:${measure.searchCost}`;
  return `use:${measure.utilisation}`;
}

/**
 * The dearest anything the range carries has become — what a taking cost last
 * tick against what it costs on fresh country (E29).
 *
 * Read out of the state and never worked out again here. It is one number with
 * one home: the allocation is the only place that knows what a taking cost,
 * and everything else — this condition, the bots, the view — reads the same
 * figure it wrote. Three separate derivations of "how spent is the country" is
 * what left every one of them blind twice over.
 */
function dearest(ctx: ConditionContext, stock?: string): number {
  if (stock !== undefined) return Math.max(1, ctx.state.lastEffort[stock] ?? 1);
  let highest = 1;
  for (const price of Object.values(ctx.state.lastEffort)) highest = Math.max(highest, price);
  return highest;
}

/** How much has been produced at these activities, all told (E29). */
function practised(ctx: ConditionContext, activities: readonly string[]): number {
  let total = 0;
  for (const id of activities) total += ctx.state.experience[id] ?? 0;
  return total;
}

export function allHold(
  conditions: readonly Condition[],
  ctx: ConditionContext,
): boolean {
  return conditions.every((condition) => conditionHolds(condition, ctx));
}

/**
 * What is missing, so the interface can name it instead of writing "locked"
 * (E12). Empty means: everything holds.
 */
/**
 * A condition that does not hold, with where you stand against what it takes.
 *
 * A rule alone — "storage capacity of two per head" — tells a player nothing
 * about whether he is close or losing ground. The two numbers do. More is
 * always better in every condition there is, so a share is a division the shell
 * can do and is not carried here.
 *
 * A yes-or-no condition is 0 of 1 and jumps to 1 of 1; that is not a defect of
 * the shape but the truth about it, there is nothing in between. "Three
 * clearings done" is 2 of 3 and has real steps. One shape carries both.
 */
export interface Unmet {
  readonly condition: Condition;
  readonly have: number;
  readonly need: number;
}

export function unmetConditions(
  conditions: readonly Condition[],
  ctx: ConditionContext,
): readonly Unmet[] {
  return conditions
    .filter((condition) => !conditionHolds(condition, ctx))
    .map((condition) => standing(condition, ctx));
}

/** Where you stand against one condition. */
function standing(condition: Condition, ctx: ConditionContext): Unmet {
  const at = (have: number, need: number): Unmet => ({ condition, have, need });

  switch (condition.kind) {
    case "population":
      return at(ctx.population, condition.min);
    case "projectDone":
      return at(completedCount(ctx.state, condition.id), condition.min);
    case "rule":
      return at(ctx.unlocks.rules.has(condition.id) === condition.set ? 1 : 0, 1);
    case "unownedCapacity":
      return at(capacityOf(ctx.state.unownedCapacity, condition.capacity).amount, condition.min);
    case "ownedCapacity":
      return at(held(ctx, condition.capacity), condition.min);
    case "coverage":
      return at(ctx.coverage[condition.tier] ?? 0, condition.min);
    case "capacityPerHead":
      return at(ctx.population <= 0 ? 0 : held(ctx, condition.capacity) / ctx.population, condition.min);
    case "stockPerHead":
      return at(ctx.population <= 0 ? 0 : stock(ctx, condition.stock) / ctx.population, condition.min);
    case "experience":
      return at(practised(ctx, condition.activities), condition.min);
    case "stockDear":
      return at(dearest(ctx, condition.stock), condition.factor);
    case "strain":
      return at(strainOf(ctx, condition.measure), markOf(ctx, condition));
  }
}

function held(ctx: ConditionContext, capacity: string): number {
  let total = 0;
  for (const sector of Object.values(ctx.state.sectors)) {
    total += capacityOf(sector?.capacityHeld ?? {}, capacity).amount;
  }
  return total;
}

function stock(ctx: ConditionContext, id: string): number {
  let total = 0;
  for (const sector of Object.values(ctx.state.sectors)) total += sector?.stocks[id] ?? 0;
  return total;
}
