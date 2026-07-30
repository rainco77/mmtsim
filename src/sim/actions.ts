import type { ConfigIndex } from "./config.ts";
import type { BranchId, ProcessId, ProjectId } from "./ids.ts";
import type { ActiveProject, GameState } from "./state.ts";

/**
 * What the player can do. Actions are plain values, so a run is a list of them
 * (T4) and can be handed over, compared and replayed.
 */
export type Action =
  | { readonly type: "startProject"; readonly id: ProjectId }
  | { readonly type: "pauseProject"; readonly id: ProjectId; readonly paused: boolean }
  | { readonly type: "reorderProject"; readonly id: ProjectId; readonly order: number }
  | { readonly type: "abandonProject"; readonly id: ProjectId }
  /** Set the order of processes for one branch by hand (E5). */
  | {
      readonly type: "setProcessOrder";
      readonly branch: BranchId;
      readonly order: readonly ProcessId[];
    }
  /** Hand the branch back to the computation. A mistake must be revocable. */
  | { readonly type: "clearProcessOrder"; readonly branch: BranchId };

export interface ActionResult {
  readonly state: GameState;
  /** Empty when the action was carried out. */
  readonly rejected?: string;
}

export function apply(
  state: GameState,
  action: Action,
  index: ConfigIndex,
): ActionResult {
  switch (action.type) {
    case "startProject":
      return startProject(state, action.id, index);
    case "pauseProject":
      return {
        state: mapProject(state, action.id, (p) => ({ ...p, paused: action.paused })),
      };
    case "reorderProject":
      return {
        state: mapProject(state, action.id, (p) => ({ ...p, order: action.order })),
      };
    case "abandonProject":
      return {
        state: {
          ...state,
          activeProjects: state.activeProjects.filter((p) => p.id !== action.id),
        },
      };
    case "setProcessOrder":
      return setProcessOrder(state, action.branch, action.order, index);
    case "clearProcessOrder": {
      const rest = { ...state.manualOrder };
      delete rest[action.branch];
      return { state: { ...state, manualOrder: rest } };
    }
  }
}

function startProject(state: GameState, id: ProjectId, index: ConfigIndex): ActionResult {
  const def = index.project.get(id);
  if (def === undefined) return { state, rejected: `unknown project "${id}"` };
  if (state.activeProjects.some((p) => p.id === id)) {
    return { state, rejected: `project "${id}" already running` };
  }
  if (!def.repeatable && (state.completedProjects[id] ?? 0) > 0) {
    return { state, rejected: `project "${id}" already finished` };
  }

  // The start time seeds the order; the player may reorder afterwards (E18).
  const order = state.activeProjects.reduce((max, p) => Math.max(max, p.order), 0) + 1;
  const active: ActiveProject = { id, progress: 0, order, paused: false };
  return { state: { ...state, activeProjects: [...state.activeProjects, active] } };
}

function setProcessOrder(
  state: GameState,
  branch: BranchId,
  order: readonly ProcessId[],
  index: ConfigIndex,
): ActionResult {
  for (const id of order) {
    const process = index.process.get(id);
    if (process === undefined) return { state, rejected: `unknown process "${id}"` };
    if (process.branch !== branch) {
      return { state, rejected: `process "${id}" does not belong to branch "${branch}"` };
    }
  }
  return { state: { ...state, manualOrder: { ...state.manualOrder, [branch]: order } } };
}

function mapProject(
  state: GameState,
  id: ProjectId,
  change: (project: ActiveProject) => ActiveProject,
): GameState {
  return {
    ...state,
    activeProjects: state.activeProjects.map((p) => (p.id === id ? change(p) : p)),
  };
}
