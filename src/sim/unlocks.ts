import type { Condition, ConfigIndex } from "./config.ts";
import type { BranchId, ProcessId, RuleId } from "./ids.ts";
import { areaOf, completedCount, type GameState } from "./state.ts";

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
}

export function conditionHolds(condition: Condition, ctx: ConditionContext): boolean {
  switch (condition.kind) {
    case "population":
      return ctx.population >= condition.min;
    case "projectDone":
      return completedCount(ctx.state, condition.id) >= condition.min;
    case "rule":
      return ctx.unlocks.rules.has(condition.id) === condition.set;
    case "unownedArea":
      return areaOf(ctx.state.unownedAreas, condition.areaType).area >= condition.min;
    case "coverage":
      return (ctx.coverage[condition.tier] ?? 0) >= condition.min;
    case "landTakings":
      return ctx.state.landTakings < condition.max;
    case "capacityPerHead": {
      if (ctx.population <= 0) return false;
      let built = 0;
      for (const sector of Object.values(ctx.state.sectors)) {
        built += areaOf(sector?.areas ?? {}, condition.areaType).area;
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
  }
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
export function unmetConditions(
  conditions: readonly Condition[],
  ctx: ConditionContext,
): readonly Condition[] {
  return conditions.filter((condition) => !conditionHolds(condition, ctx));
}
