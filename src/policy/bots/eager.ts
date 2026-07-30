import type { Action, Derived, GameState } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";

/**
 * Starts whatever can be started, in the order the content lists it. Crude on
 * purpose: it measures what the content offers, not what a clever player would
 * do.
 */
export class EagerPolicy implements Policy {
  readonly id = "eager";

  decide(_state: GameState, derived: Derived): readonly Action[] {
    const start = derived.projects.find(
      (project) => project.available && !project.running,
    );
    return start === undefined ? [] : [{ type: "startProject", id: start.id }];
  }
}
