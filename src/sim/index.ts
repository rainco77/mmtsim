/** The simulation, as a whole. Pure throughout: no DOM, no clock, no globals (T1). */
export type { Action, ActionResult } from "./actions.ts";
export { apply } from "./actions.ts";
export type {
  AllocationResult,
  Binding,
  BindingKind,
  ProcessRun,
  TierOutcome,
} from "./allocation.ts";
export { allocate } from "./allocation.ts";
export type {
  CapacityDef,
  BranchDef,
  CarriedConfig,
  Condition,
  Config,
  ConfigIndex,
  Effect,
  LandConfig,
  NeedTierDef,
  PopulationConfig,
  ProcessDef,
  ProjectDef,
  QualitySource,
  StockDef,
  TierEffect,
  RiskConfig,
  ShockShape,
} from "./config.ts";
export { indexConfig, tierEffectAt } from "./config.ts";
export type { BranchOrdering, Derived, ProjectView } from "./derive.ts";
export type {
  OrderedProcesses,
  OrderingContext,
  OrderingReason,
  ProcessOrdering,
} from "./ordering.ts";
export {
  DeclaredOrdering,
  ORDERING_RESOLVER,
  OrderingResolver,
  DominanceOrdering,
} from "./ordering.ts";
export type { Shocks } from "./risk.ts";
export { drawShocks, exposureMagnitude, shockFactor } from "./risk.ts";
export { derive } from "./derive.ts";
export { applyEffect, effectTypesWithHandler } from "./effects.ts";
export type {
  CapacityId,
  BranchId,
  NeedTierId,
  ProcessId,
  ProjectId,
  RandomStreamId,
  RuleId,
  SectorId,
  StockId,
} from "./ids.ts";
export type { Phase, TickContext } from "./phases.ts";
export {
  HOUSEHOLDS,
  laborPerformance,
  PIPELINE,
  renewals,
} from "./phases.ts";
export type { Renewal } from "./phases.ts";
export type { RandomState } from "./random.ts";
export { counterOf, createRandomState, draw, peek, uniformAt } from "./random.ts";
export type { StartOptions } from "./setup.ts";
export { createState } from "./setup.ts";
export type { ActiveProject, Capacity, GameState, SectorState } from "./state.ts";
export { capacityOf, completedCount, stockOf, withSector } from "./state.ts";
export { tick } from "./tick.ts";
export type { ConditionContext, Unlocks } from "./unlocks.ts";
export { allHold, computeUnlocks, conditionHolds, unmetConditions } from "./unlocks.ts";
