import type { Action, Derived, GameState } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";

/** Below this coverage the settlement has no business starting anything. */
const WELL_FED = 0.8;

/**
 * Builds out of surplus: starts something while the people are well fed, and
 * stops while they are not.
 *
 * This is the yardstick for "played thoughtfully" (T4), and it needs no
 * knowledge of the content — only the one signal a player also has in front of
 * him. It is the investment decision itself: hands put into a project are hands
 * not gathering, so you can invest when there is something to spare and not
 * when there is not. A band of thirty therefore builds one thing at a time and
 * a settlement of five hundred builds several, without either being written
 * down anywhere.
 *
 * The contrast with `eager` is deliberate. Starting everything at once is not a
 * more determined version of this but a worse one: the projects compete for the
 * same hands, and building three things while the food fails kills the
 * settlement. That only became true when the projects were given costs that
 * bite.
 */
export class SensiblePolicy implements Policy {
  readonly id = "sensible";

  decide(_state: GameState, derived: Derived): readonly Action[] {
    const fed = Object.values(derived.coverage).every((value) => value >= WELL_FED);
    if (!fed) return [];

    const open = derived.projects.filter(
      (project) => project.available && !project.running,
    );
    // Something new before more of the same.
    const start = open.find((project) => project.completed === 0) ?? open[0];
    return start === undefined ? [] : [{ type: "startProject", id: start.id }];
  }
}
