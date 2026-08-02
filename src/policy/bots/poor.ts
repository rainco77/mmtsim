import type { Action, Derived, GameState } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";

/**
 * Plays badly, but coherently.
 *
 * The yardstick for "acting is not enough — acting *well* is" (T4). It has
 * exactly the same options as the thoughtful player and differs in judgement:
 *
 * - **It builds at the worst moment.** It waits until the community is already
 *   short of its most basic need and starts something then, rather than out of
 *   a surplus. Investment is what you can afford, and this is what it looks
 *   like not to understand that.
 * - **It takes whatever is there**, with no preference for what brings
 *   something new, so it repeats what it already has instead of moving on.
 *
 * It is deliberately *not* "start everything at once": since some projects
 * undo each other — clearing and afforestation — that would be an incoherent
 * strategy rather than a bad one, and measuring against nonsense proves
 * nothing. Nor does it differ in the urgency it assigns, so that the rank plays
 * no part in the comparison.
 */
export class PoorPolicy implements Policy {
  readonly id = "poor";

  decide(_state: GameState, derived: Derived): readonly Action[] {
    const lowest = derived.tiers.reduce(
      (rank, tier) => Math.min(rank, tier.rank),
      Number.POSITIVE_INFINITY,
    );
    const struggling = derived.tiers
      .filter((tier) => tier.rank === lowest)
      .some((tier) => tier.coverage < 0.95);
    if (!struggling) return [];

    const open = derived.projects.filter(
      (project) => project.available && !project.running,
    );
    const start = open[open.length - 1];
    return start === undefined
      ? []
      : [{ type: "startProject", id: start.id, rank: lowest + 1 }];
  }
}
