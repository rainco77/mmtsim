import type { Action, Derived, GameState } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";

/** Below this the most basic need is not met and nothing else matters. */
const FED = 0.95;

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
    // Only the lowest rank has to hold — bare survival. Everything above it is
    // comfort, and building out of comfort is what investment is.
    //
    // Waiting for *every* need was measured to be a trap: at the carrying
    // capacity of its range a band is never comfortable, so it would never
    // invest and never escape, and a hundred people sat with seventy idle hands
    // for a hundred ticks. It was also a rule against a danger that no longer
    // exists — since projects rank below survival (E18) they cannot starve
    // anyone, so there is nothing left to be careful about.
    const lowest = derived.tiers.reduce(
      (rank, tier) => Math.min(rank, tier.rank),
      Number.POSITIVE_INFINITY,
    );
    const alive = derived.tiers
      .filter((tier) => tier.rank === lowest)
      .every((tier) => tier.coverage >= FED);
    if (!alive) return [];

    const open = derived.projects.filter(
      (project) => project.available && !project.running,
    );
    // Something new before more of the same.
    const start = open.find((project) => project.completed === 0) ?? open[0];
    if (start === undefined) return [];

    // Urgency is part of starting something (E18): this player puts every
    // project just below bare survival — he is willing to go without comfort
    // for it, but not to starve for it. Leaving it at the declared default,
    // which is above every need, is what `eager` does, and it kills.
    return [{ type: "startProject", id: start.id, rank: lowest + 1 }];
  }
}
