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
  AreaTypeDef,
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
  WeatherConfig,
} from "./config.ts";
export { indexConfig, tierEffectAt } from "./config.ts";
export type { Derived, ProjectView } from "./derive.ts";
export { derive } from "./derive.ts";
export { applyEffect, effectTypesWithHandler } from "./effects.ts";
export type {
  AreaTypeId,
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
export { HOUSEHOLDS, laborPerformance, PIPELINE } from "./phases.ts";
export type { RandomState } from "./random.ts";
export { counterOf, createRandomState, draw, peek, uniformAt } from "./random.ts";
export type { StartOptions } from "./setup.ts";
export { createState } from "./setup.ts";
export type { ActiveProject, Area, GameState, SectorState } from "./state.ts";
export { areaOf, completedCount, stockOf, withSector } from "./state.ts";
export { tick } from "./tick.ts";
export type { ConditionContext, Unlocks } from "./unlocks.ts";
export { allHold, computeUnlocks, conditionHolds, unmetConditions } from "./unlocks.ts";
