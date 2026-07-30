import type { Action, ConfigIndex, Derived, GameState } from "../sim/index.ts";

/**
 * The player is a strategy behind an interface (T4). The simulation does not
 * know who decides: the same loop and the same simulation, only the decider is
 * exchanged.
 *
 * That makes headless runs a first-class tool — and a check on the concept: if
 * a passive strategy gets as far as a considered one, our decisions are
 * meaningless and the game is broken.
 */
export interface Policy {
  readonly id: string;
  decide(state: GameState, derived: Derived, index: ConfigIndex): readonly Action[];
}
