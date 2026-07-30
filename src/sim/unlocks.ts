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
}

export function computeUnlocks(state: GameState, index: ConfigIndex): Unlocks {
  const branches = new Set<BranchId>();
  const processes = new Set<ProcessId>();
  const setRules = new Set<RuleId>();
  const unsetRules = new Set<RuleId>();

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

  return { branches, processes, rules };
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
