import type { Action, ConfigIndex, Derived, GameState } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";

/**
 * Above this price the country counts as spent: the same meal costs half again
 * as much walking as it does on fresh ground (E29).
 *
 * Read off the one figure the allocation writes, never worked out here. How
 * full a stand looks says nothing — it is read after the growing back.
 */
const SPENT = 1.5;

/**
 * Builds nothing, ever — and moves on when the country is spent.
 *
 * The baseline every other strategy has to beat (T4), and moving belongs in it
 * rather than counting as a move against it. These are foragers: residential
 * mobility is the ordinary adaptation of people who live off what a range
 * carries, not a clever stroke. Somebody who never lifts a hand still walks
 * away from a picked-over country, so a baseline that stays put is not idle,
 * it is inert — and measuring against it would make walking away look like
 * progress.
 *
 * What idleness costs is therefore still everything it should. Every range is
 * a little poorer than the last (E13 — the good country of the world is there
 * but once), so the cycle of using up and walking on runs slowly downhill:
 * it buys a long time and not an endless one, and only building can lift the
 * level rather than merely carrying it a while longer.
 */
export class PassivePolicy implements Policy {
  readonly id = "passive";

  decide(_state: GameState, derived: Derived, index: ConfigIndex): readonly Action[] {
    if (derived.projects.some((project) => project.running)) return [];
    const thin = Object.values(derived.effortPerStock).some((price) => price >= SPENT);
    if (!thin) return [];
    // Whatever the content offers that sets a stock back to what the range
    // carries — a fresh country. Named by what it does, not by its id, so this
    // holds for whatever a later epoch calls it.
    const move = derived.projects.find(
      (project) =>
        project.available &&
        !project.running &&
        (index.project.get(project.id)?.effects ?? []).some(
          (effect) => effect.type === "stock" && effect.to.kind === "ceiling",
        ),
    );
    return move === undefined ? [] : [{ type: "startProject", id: move.id }];
  }
}
