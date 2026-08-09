import type { Action, ConfigIndex, Derived, GameState } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";
import { BuildingPolicy } from "./building.ts";

/**
 * Builds like the eager builder, but settles last: sedentism is started only
 * once nothing is running, nothing else is worth starting, and no visible
 * project is still ripening towards its conditions. The player it stands for
 * wants to see the whole epoch before ending it — a run of this play shows
 * what of the tree can be reached before settling at all, and the epoch's
 * content has to prove itself against it (nothing after settling counts).
 */
export class ThoroughPolicy implements Policy {
  readonly id = "thorough";
  private readonly eager = new BuildingPolicy();

  decide(state: GameState, derived: Derived, index: ConfigIndex): readonly Action[] {
    const eager = this.eager
      .decide(state, derived, index)
      .filter((a) => !(a.type === "startProject" && a.id === "sedentism"));

    // Something was started or is running: not yet.
    if (eager.some((a) => a.type === "startProject")) return eager;
    if (state.activeProjects.length > 0) return eager;

    // A visible project still ripening towards its conditions is a reason to
    // stay: its bar is filling. One that can never ripen keeps the run from
    // settling — and that is a finding, not a nuisance.
    const ripening = derived.projects.some(
      (p) => p.visible && !p.available && p.completed === 0 && p.id !== "sedentism",
    );
    if (ripening) return eager;

    const settle = derived.projects.find(
      (p) => p.id === "sedentism" && p.available && !p.running,
    );
    if (settle !== undefined) return [...eager, { type: "startProject", id: settle.id }];
    return eager;
  }
}
